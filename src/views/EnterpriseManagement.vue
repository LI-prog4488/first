<template>
  <div class="enterprise-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>企业/用户管理</h1>
      <el-tabs v-model="activeTab" class="header-tabs">
        <el-tab-pane label="企业管理" name="enterprise"></el-tab-pane>
        <el-tab-pane label="用户管理" name="user"></el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 企业管理Tab内容 -->
    <div v-if="activeTab === 'enterprise'" class="tab-content">
      <!-- 企业管理工具栏 -->
      <div class="toolbar">
        <div class="search-section">
          <el-input
            v-model="enterpriseSearchKeyword"
            placeholder="搜索企业名称或联系人"
            prefix-icon="el-icon-search"
            clearable
            style="width: 240px; margin-right: 15px;"
          ></el-input>
          <el-select
            v-model="enterpriseStatusFilter"
            placeholder="状态筛选"
            clearable
            style="width: 120px; margin-right: 15px;"
          >
            <el-option label="正常" value="normal"></el-option>
            <el-option label="禁用" value="disabled"></el-option>
          </el-select>
          <el-select
            v-model="enterpriseIndustryFilter"
            placeholder="行业筛选"
            clearable
            style="width: 150px;"
          >
            <el-option v-for="industry in industries" :key="industry.value" :label="industry.label" :value="industry.value"></el-option>
          </el-select>
        </div>
        <div class="action-section">
          <el-button type="primary" @click="openAddEnterpriseDialog">
            <el-icon><Plus /></el-icon>
            新增企业
          </el-button>
          <el-button @click="exportEnterpriseData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
      
      <!-- 企业列表 -->
      <el-card>
        <el-table 
          :data="filteredEnterprises" 
          style="width: 100%"
          border
          @row-click="handleEnterpriseClick"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="企业ID" width="100" fixed></el-table-column>
          <el-table-column prop="name" label="企业名称" width="200">
            <template #default="scope">
              <div class="enterprise-name-wrapper">
                <span>{{ scope.row.name }}</span>
                <el-tag 
                  v-if="scope.row.status === 'disabled'" 
                  type="danger" 
                  size="small"
                  style="margin-left: 5px;"
                >
                  已禁用
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="industry" label="所属行业" width="120">
            <template #default="scope">
              <el-tag size="small">{{ getIndustryName(scope.row.industry) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="contactPerson" label="联系人" width="100"></el-table-column>
          <el-table-column prop="contactPhone" label="联系电话" width="120"></el-table-column>
          <el-table-column prop="energyQuota" label="能耗配额(kWh/月)" width="140" align="right"></el-table-column>
          <el-table-column prop="monthEnergyUsage" label="本月能耗(kWh)" width="120" align="right">
            <template #default="scope">
              <div class="energy-usage-wrapper">
                <span :class="{ 'over-quota': scope.row.monthEnergyUsage > scope.row.energyQuota }">
                  {{ scope.row.monthEnergyUsage }}
                </span>
                <el-tag 
                  v-if="scope.row.monthEnergyUsage > scope.row.energyQuota" 
                  type="danger" 
                  size="small"
                  effect="dark"
                  style="margin-left: 5px;"
                >
                  超配额
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="registeredDate" label="注册日期" width="120" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.registeredDate) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click.stop="viewEnterpriseDetail(scope.row)">详情</el-button>
              <el-button size="small" @click.stop="editEnterprise(scope.row)">编辑</el-button>
              <el-button 
                size="small" 
                :type="scope.row.status === 'normal' ? 'danger' : 'success'" 
                @click.stop="toggleEnterpriseStatus(scope.row)"
              >
                {{ scope.row.status === 'normal' ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="enterpriseCurrentPage"
            v-model:page-size="enterprisePageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredEnterprises.length"
            @size-change="handleEnterpriseSizeChange"
            @current-change="handleEnterpriseCurrentChange"
          ></el-pagination>
        </div>
      </el-card>
    </div>
    
    <!-- 用户管理Tab内容 -->
    <div v-if="activeTab === 'user'" class="tab-content">
      <!-- 用户管理工具栏 -->
      <div class="toolbar">
        <div class="search-section">
          <el-input
            v-model="userSearchKeyword"
            placeholder="搜索用户名或姓名"
            prefix-icon="el-icon-search"
            clearable
            style="width: 240px; margin-right: 15px;"
          ></el-input>
          <el-select
            v-model="userRoleFilter"
            placeholder="角色筛选"
            clearable
            style="width: 120px; margin-right: 15px;"
          >
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="企业负责人" value="enterprise_admin"></el-option>
            <el-option label="运维人员" value="maintenance"></el-option>
            <el-option label="普通用户" value="user"></el-option>
          </el-select>
          <el-select
            v-model="userStatusFilter"
            placeholder="状态筛选"
            clearable
            style="width: 120px;"
          >
            <el-option label="正常" value="active"></el-option>
            <el-option label="禁用" value="inactive"></el-option>
          </el-select>
        </div>
        <div class="action-section">
          <el-button type="primary" @click="openAddUserDialog">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
          <el-button @click="exportUserData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
      
      <!-- 用户列表 -->
      <el-card>
        <el-table 
          :data="filteredUsers" 
          style="width: 100%"
          border
          @row-click="handleUserClick"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="用户ID" width="100" fixed></el-table-column>
          <el-table-column prop="username" label="用户名" width="150"></el-table-column>
          <el-table-column prop="realName" label="真实姓名" width="120"></el-table-column>
          <el-table-column prop="role" label="角色" width="120">
            <template #default="scope">
              <el-tag :type="getRoleTagType(scope.row.role)" size="small">
                {{ getRoleName(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="enterpriseId" label="所属企业" width="180">
            <template #default="scope">
              {{ getEnterpriseName(scope.row.enterpriseId) || '系统管理' }}
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
          <el-table-column prop="phone" label="手机号码" width="120"></el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="active"
                inactive-value="inactive"
                @change="handleUserStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="140" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click.stop="viewUserDetail(scope.row)">详情</el-button>
              <el-button size="small" @click.stop="editUser(scope.row)">编辑</el-button>
              <el-button size="small" @click.stop="resetUserPassword(scope.row)">重置密码</el-button>
              <el-button size="small" type="danger" @click.stop="deleteUser(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="userCurrentPage"
            v-model:page-size="userPageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredUsers.length"
            @size-change="handleUserSizeChange"
            @current-change="handleUserCurrentChange"
          ></el-pagination>
        </div>
      </el-card>
    </div>
    
    <!-- 企业详情对话框 -->
    <el-dialog
      v-model="enterpriseDetailDialogVisible"
      title="企业详情"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="企业ID">{{ selectedEnterprise?.id }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ selectedEnterprise?.name }}</el-descriptions-item>
        <el-descriptions-item label="所属行业">{{ getIndustryName(selectedEnterprise?.industry) }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ selectedEnterprise?.contactPerson }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ selectedEnterprise?.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="电子邮箱">{{ selectedEnterprise?.email }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ selectedEnterprise?.address }}</el-descriptions-item>
        <el-descriptions-item label="能耗配额">{{ selectedEnterprise?.energyQuota }} kWh/月</el-descriptions-item>
        <el-descriptions-item label="本月能耗">{{ selectedEnterprise?.monthEnergyUsage }} kWh</el-descriptions-item>
        <el-descriptions-item label="占用区域">{{ getZoneNames(selectedEnterprise?.occupiedZones) }}</el-descriptions-item>
        <el-descriptions-item label="注册日期">{{ formatDate(selectedEnterprise?.registeredDate) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedEnterprise?.status === 'normal' ? 'success' : 'danger'">
            {{ selectedEnterprise?.status === 'normal' ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ selectedEnterprise?.remark || '--' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="enterpriseDetailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑企业对话框 -->
    <el-dialog
      v-model="enterpriseDialogVisible"
      :title="isEditEnterprise ? '编辑企业' : '新增企业'"
      width="600px"
    >
      <el-form ref="enterpriseForm" :model="enterpriseForm" label-width="120px" :rules="enterpriseFormRules">
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="enterpriseForm.name" placeholder="请输入企业名称"></el-input>
        </el-form-item>
        <el-form-item label="所属行业" prop="industry">
          <el-select v-model="enterpriseForm.industry" placeholder="请选择所属行业">
            <el-option v-for="industry in industries" :key="industry.value" :label="industry.label" :value="industry.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="enterpriseForm.contactPerson" placeholder="请输入联系人姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="enterpriseForm.contactPhone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="enterpriseForm.email" placeholder="请输入电子邮箱" type="email"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="enterpriseForm.address" placeholder="请输入企业地址" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item label="能耗配额(kWh/月)" prop="energyQuota">
          <el-input-number v-model="enterpriseForm.energyQuota" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="占用区域" prop="occupiedZones">
          <el-select v-model="enterpriseForm.occupiedZones" placeholder="请选择占用区域" multiple collapse-tags>
            <el-option v-for="zone in zones" :key="zone.id" :label="zone.name" :value="zone.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="enterpriseForm.remark" placeholder="请输入备注信息" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="enterpriseDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEnterprise">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="isEditUser ? '编辑用户' : '新增用户'"
      width="600px"
    >
      <el-form ref="userForm" :model="userForm" label-width="120px" :rules="userFormRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEditUser" placeholder="请输入用户名"></el-input>
          <div v-if="isEditUser" class="el-form-item__help">用户名不可修改</div>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEditUser">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEditUser">
          <el-input v-model="userForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="企业负责人" value="enterprise_admin"></el-option>
            <el-option label="运维人员" value="maintenance"></el-option>
            <el-option label="普通用户" value="user"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属企业" prop="enterpriseId" v-if="userForm.role !== 'admin'">
          <el-select v-model="userForm.enterpriseId" placeholder="请选择所属企业">
            <el-option label="请选择企业" value="" disabled></el-option>
            <el-option v-for="enterprise in enterprises" :key="enterprise.id" :label="enterprise.name" :value="enterprise.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" type="email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordDialogVisible"
      title="重置密码"
      width="400px"
    >
      <el-form ref="resetPasswordForm" :model="resetPasswordForm" label-width="100px" :rules="resetPasswordFormRules">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPasswordForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmNewPassword">
          <el-input v-model="resetPasswordForm.confirmNewPassword" type="password" placeholder="请再次输入新密码"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmResetPassword">确定重置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Download
} from '@element-plus/icons-vue'

export default {
  name: 'EnterpriseManagement',
  components: {
    Plus, Download
  },
  setup() {
    // Tab状态
    const activeTab = ref('enterprise')
    
    // 企业管理相关
    const enterpriseSearchKeyword = ref('')
    const enterpriseStatusFilter = ref('')
    const enterpriseIndustryFilter = ref('')
    const enterpriseCurrentPage = ref(1)
    const enterprisePageSize = ref(10)
    
    // 用户管理相关
    const userSearchKeyword = ref('')
    const userRoleFilter = ref('')
    const userStatusFilter = ref('')
    const userCurrentPage = ref(1)
    const userPageSize = ref(10)
    
    // 对话框状态
    const enterpriseDialogVisible = ref(false)
    const enterpriseDetailDialogVisible = ref(false)
    const isEditEnterprise = ref(false)
    const userDialogVisible = ref(false)
    const isEditUser = ref(false)
    const resetPasswordDialogVisible = ref(false)
    
    // 数据
    const enterprises = ref([])
    const users = ref([])
    const zones = ref([])
    const selectedEnterprise = ref(null)
    const selectedUser = ref(null)
    
    // 行业选项
    const industries = [
      { label: '科技', value: 'technology' },
      { label: '金融', value: 'finance' },
      { label: '制造', value: 'manufacturing' },
      { label: '教育', value: 'education' },
      { label: '医疗', value: 'medical' },
      { label: '零售', value: 'retail' },
      { label: '其他', value: 'other' }
    ]
    
    // 企业表单
    const enterpriseForm = reactive({
      name: '',
      industry: '',
      contactPerson: '',
      contactPhone: '',
      email: '',
      address: '',
      energyQuota: 10000,
      occupiedZones: [],
      remark: ''
    })
    
    // 企业表单验证规则
    const enterpriseFormRules = {
      name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
      industry: [{ required: true, message: '请选择所属行业', trigger: 'change' }],
      contactPerson: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
      contactPhone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      email: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      address: [{ required: true, message: '请输入企业地址', trigger: 'blur' }],
      energyQuota: [
        { required: true, message: '请输入能耗配额', trigger: 'blur' },
        { type: 'number', min: 0, message: '能耗配额必须为非负数', trigger: 'blur' }
      ]
    }
    
    // 用户表单
    const userForm = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      realName: '',
      role: 'user',
      enterpriseId: '',
      email: '',
      phone: ''
    })
    
    // 用户表单验证规则
    const userFormRules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            if (value !== userForm.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ],
      realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
      role: [{ required: true, message: '请选择角色', trigger: 'change' }],
      enterpriseId: [
        { 
          required: () => userForm.role !== 'admin', 
          message: '请选择所属企业', 
          trigger: 'change' 
        }
      ],
      email: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ]
    }
    
    // 重置密码表单
    const resetPasswordForm = reactive({
      newPassword: '',
      confirmNewPassword: ''
    })
    
    // 重置密码表单验证规则
    const resetPasswordFormRules = {
      newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
      confirmNewPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            if (value !== resetPasswordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
    
    // 过滤后的企业列表
    const filteredEnterprises = computed(() => {
      return enterprises.value.filter(enterprise => {
        const matchesKeyword = !enterpriseSearchKeyword.value || 
          enterprise.name.toLowerCase().includes(enterpriseSearchKeyword.value.toLowerCase()) ||
          enterprise.contactPerson.toLowerCase().includes(enterpriseSearchKeyword.value.toLowerCase())
        
        const matchesStatus = !enterpriseStatusFilter.value || enterprise.status === enterpriseStatusFilter.value
        const matchesIndustry = !enterpriseIndustryFilter.value || enterprise.industry === enterpriseIndustryFilter.value
        
        return matchesKeyword && matchesStatus && matchesIndustry
      })
    })
    
    // 过滤后的用户列表
    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const matchesKeyword = !userSearchKeyword.value || 
          user.username.toLowerCase().includes(userSearchKeyword.value.toLowerCase()) ||
          user.realName.toLowerCase().includes(userSearchKeyword.value.toLowerCase())
        
        const matchesRole = !userRoleFilter.value || user.role === userRoleFilter.value
        const matchesStatus = !userStatusFilter.value || user.status === userStatusFilter.value
        
        return matchesKeyword && matchesRole && matchesStatus
      })
    })
    
    // 获取行业名称
    const getIndustryName = (industry) => {
      const found = industries.find(item => item.value === industry)
      return found ? found.label : industry
    }
    
    // 获取角色名称
    const getRoleName = (role) => {
      const roles = {
        admin: '管理员',
        enterprise_admin: '企业负责人',
        maintenance: '运维人员',
        user: '普通用户'
      }
      return roles[role] || role
    }
    
    // 获取角色标签类型
    const getRoleTagType = (role) => {
      const types = {
        admin: 'danger',
        enterprise_admin: 'success',
        maintenance: 'warning',
        user: 'info'
      }
      return types[role] || 'info'
    }
    
    // 获取企业名称
    const getEnterpriseName = (enterpriseId) => {
      const enterprise = enterprises.value.find(e => e.id === enterpriseId)
      return enterprise ? enterprise.name : null
    }
    
    // 获取区域名称列表
    const getZoneNames = (zoneIds) => {
      if (!zoneIds || zoneIds.length === 0) return '--'
      return zoneIds
        .map(id => zones.value.find(z => z.id === id)?.name || '')
        .filter(name => name)
        .join(', ')
    }
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '--'
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    
    // 格式化日期时间
    const formatDateTime = (date) => {
      if (!date) return '--'
      const d = new Date(date)
      return `${formatDate(date)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    
    // 处理企业点击
    const handleEnterpriseClick = (row) => {
      selectedEnterprise.value = { ...row }
    }
    
    // 处理用户点击
    const handleUserClick = (row) => {
      selectedUser.value = { ...row }
    }
    
    // 查看企业详情
    const viewEnterpriseDetail = (enterprise) => {
      selectedEnterprise.value = { ...enterprise }
      enterpriseDetailDialogVisible.value = true
    }
    
    // 打开新增企业对话框
    const openAddEnterpriseDialog = () => {
      Object.assign(enterpriseForm, {
        name: '',
        industry: '',
        contactPerson: '',
        contactPhone: '',
        email: '',
        address: '',
        energyQuota: 10000,
        occupiedZones: [],
        remark: ''
      })
      isEditEnterprise.value = false
      enterpriseDialogVisible.value = true
    }
    
    // 编辑企业
    const editEnterprise = (enterprise) => {
      Object.assign(enterpriseForm, { ...enterprise })
      isEditEnterprise.value = true
      enterpriseDialogVisible.value = true
    }
    
    // 保存企业
    const saveEnterprise = () => {
      if (isEditEnterprise.value) {
        // 更新企业
        const index = enterprises.value.findIndex(e => e.id === enterpriseForm.id)
        if (index !== -1) {
          enterprises.value[index] = { ...enterprises.value[index], ...enterpriseForm }
          ElMessage.success('企业更新成功')
        }
      } else {
        // 新增企业
        const newEnterprise = {
          ...enterpriseForm,
          id: `ENT-${Date.now()}`,
          status: 'normal',
          registeredDate: new Date().toISOString(),
          monthEnergyUsage: 0
        }
        enterprises.value.push(newEnterprise)
        ElMessage.success('企业新增成功')
      }
      
      enterpriseDialogVisible.value = false
    }
    
    // 切换企业状态
    const toggleEnterpriseStatus = (enterprise) => {
      const newStatus = enterprise.status === 'normal' ? 'disabled' : 'normal'
      ElMessageBox.confirm(
        `确定要${newStatus === 'normal' ? '启用' : '禁用'}企业「${enterprise.name}」吗？`,
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        enterprise.status = newStatus
        ElMessage.success(`企业${newStatus === 'normal' ? '启用' : '禁用'}成功`)
      }).catch(() => {
        // 取消操作
      })
    }
    
    // 导出企业数据
    const exportEnterpriseData = () => {
      ElMessage.success('企业数据导出成功')
    }
    
    // 打开新增用户对话框
    const openAddUserDialog = () => {
      Object.assign(userForm, {
        username: '',
        password: '',
        confirmPassword: '',
        realName: '',
        role: 'user',
        enterpriseId: '',
        email: '',
        phone: ''
      })
      isEditUser.value = false
      userDialogVisible.value = true
    }
    
    // 编辑用户
    const editUser = (user) => {
      Object.assign(userForm, { ...user })
      isEditUser.value = true
      userDialogVisible.value = true
    }
    
    // 保存用户
    const saveUser = () => {
      if (isEditUser.value) {
        // 更新用户
        const index = users.value.findIndex(u => u.id === userForm.id)
        if (index !== -1) {
          // 不更新密码
          const { password, confirmPassword, ...updateData } = userForm
          users.value[index] = { ...users.value[index], ...updateData }
          ElMessage.success('用户更新成功')
        }
      } else {
        // 新增用户
        const newUser = {
          ...userForm,
          id: `USR-${Date.now()}`,
          status: 'active',
          createdAt: new Date().toISOString()
        }
        users.value.push(newUser)
        ElMessage.success('用户新增成功')
      }
      
      userDialogVisible.value = false
    }
    
    // 处理用户状态变化
    const handleUserStatusChange = (user) => {
      ElMessage.success(`用户状态已更新为${user.status === 'active' ? '正常' : '禁用'}`)
    }
    
    // 重置用户密码
    const resetUserPassword = (user) => {
      selectedUser.value = { ...user }
      Object.assign(resetPasswordForm, {
        newPassword: '',
        confirmNewPassword: ''
      })
      resetPasswordDialogVisible.value = true
    }
    
    // 确认重置密码
    const confirmResetPassword = () => {
      if (!selectedUser.value) return
      
      // 这里仅模拟重置密码操作
      ElMessage.success(`用户 ${selectedUser.value.username} 密码重置成功`)
      resetPasswordDialogVisible.value = false
    }
    
    // 删除用户
    const deleteUser = (user) => {
      if (user.role === 'admin') {
        ElMessage.warning('管理员账户不能删除')
        return
      }
      
      ElMessageBox.confirm(
        `确定要删除用户「${user.username}」吗？`,
        '删除用户',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'danger'
        }
      ).then(() => {
        const index = users.value.findIndex(u => u.id === user.id)
        if (index !== -1) {
          users.value.splice(index, 1)
          ElMessage.success('用户删除成功')
        }
      }).catch(() => {
        // 取消删除
      })
    }
    
    // 查看用户详情
    const viewUserDetail = (user) => {
      selectedUser.value = { ...user }
      // 这里可以打开用户详情对话框，暂时复用编辑对话框
      editUser(user)
    }
    
    // 导出用户数据
    const exportUserData = () => {
      ElMessage.success('用户数据导出成功')
    }
    
    // 分页处理
    const handleEnterpriseSizeChange = (size) => {
      enterprisePageSize.value = size
    }
    
    const handleEnterpriseCurrentChange = (current) => {
      enterpriseCurrentPage.value = current
    }
    
    const handleUserSizeChange = (size) => {
      userPageSize.value = size
    }
    
    const handleUserCurrentChange = (current) => {
      userCurrentPage.value = current
    }
    
    // 生成模拟数据
    const generateMockData = () => {
      // 生成模拟区域数据
      zones.value = [
        { id: 'a', name: 'A栋' },
        { id: 'b', name: 'B栋' },
        { id: 'c', name: 'C栋' },
        { id: 'd', name: 'D栋' },
        { id: 'parking', name: '停车场' }
      ]
      
      // 生成模拟企业数据
      enterprises.value = [
        {
          id: 'ENT-001',
          name: '科技有限公司',
          industry: 'technology',
          contactPerson: '张三',
          contactPhone: '13800138001',
          email: 'contact@techcorp.com',
          address: '智慧园区A栋3层',
          energyQuota: 50000,
          monthEnergyUsage: 48500,
          occupiedZones: ['a', 'd'],
          status: 'normal',
          registeredDate: '2023-01-15T00:00:00.000Z',
          remark: '园区主要入驻企业'
        },
        {
          id: 'ENT-002',
          name: '智慧园区管理处',
          industry: 'other',
          contactPerson: '李四',
          contactPhone: '13900139002',
          email: 'admin@smartpark.com',
          address: '智慧园区B栋1层',
          energyQuota: 10000,
          monthEnergyUsage: 8500,
          occupiedZones: ['b'],
          status: 'normal',
          registeredDate: '2022-12-01T00:00:00.000Z',
          remark: '园区管理机构'
        },
        {
          id: 'ENT-003',
          name: '绿色能源公司',
          industry: 'technology',
          contactPerson: '王五',
          contactPhone: '13700137003',
          email: 'info@greenenergy.com',
          address: '智慧园区B栋2层',
          energyQuota: 20000,
          monthEnergyUsage: 18500,
          occupiedZones: ['b'],
          status: 'normal',
          registeredDate: '2023-03-20T00:00:00.000Z',
          remark: '新能源技术研发企业'
        },
        {
          id: 'ENT-004',
          name: '物业服务公司',
          industry: 'other',
          contactPerson: '赵六',
          contactPhone: '13600136004',
          email: 'service@property.com',
          address: '智慧园区C栋1层',
          energyQuota: 15000,
          monthEnergyUsage: 14200,
          occupiedZones: ['c'],
          status: 'normal',
          registeredDate: '2023-02-10T00:00:00.000Z',
          remark: '园区物业服务提供商'
        },
        {
          id: 'ENT-005',
          name: '创新设计工作室',
          industry: 'technology',
          contactPerson: '孙七',
          contactPhone: '13500135005',
          email: 'design@creative.com',
          address: '智慧园区D栋3层',
          energyQuota: 8000,
          monthEnergyUsage: 9500,
          occupiedZones: ['d'],
          status: 'disabled',
          registeredDate: '2023-04-05T00:00:00.000Z',
          remark: '设计创意企业，已禁用'
        }
      ]
      
      // 生成模拟用户数据
      users.value = [
        {
          id: 'USR-001',
          username: 'admin',
          realName: '系统管理员',
          role: 'admin',
          enterpriseId: '',
          email: 'admin@smartpark.com',
          phone: '13800138000',
          status: 'active',
          createdAt: '2022-12-01T00:00:00.000Z'
        },
        {
          id: 'USR-002',
          username: 'zhang_san',
          realName: '张三',
          role: 'enterprise_admin',
          enterpriseId: 'ENT-001',
          email: 'zhangsan@techcorp.com',
          phone: '13800138001',
          status: 'active',
          createdAt: '2023-01-15T00:00:00.000Z'
        },
        {
          id: 'USR-003',
          username: 'li_si',
          realName: '李四',
          role: 'enterprise_admin',
          enterpriseId: 'ENT-002',
          email: 'lisi@smartpark.com',
          phone: '13900139002',
          status: 'active',
          createdAt: '2022-12-01T00:00:00.000Z'
        },
        {
          id: 'USR-004',
          username: 'wang_wu',
          realName: '王五',
          role: 'maintenance',
          enterpriseId: 'ENT-002',
          email: 'wangwu@smartpark.com',
          phone: '13700137003',
          status: 'active',
          createdAt: '2023-01-20T00:00:00.000Z'
        },
        {
          id: 'USR-005',
          username: 'zhao_liu',
          realName: '赵六',
          role: 'maintenance',
          enterpriseId: 'ENT-004',
          email: 'zhaoliu@property.com',
          phone: '13600136004',
          status: 'active',
          createdAt: '2023-02-10T00:00:00.000Z'
        },
        {
          id: 'USR-006',
          username: 'sun_qi',
          realName: '孙七',
          role: 'user',
          enterpriseId: 'ENT-001',
          email: 'sunqi@techcorp.com',
          phone: '13500135005',
          status: 'active',
          createdAt: '2023-01-16T00:00:00.000Z'
        },
        {
          id: 'USR-007',
          username: 'zhou_ba',
          realName: '周八',
          role: 'user',
          enterpriseId: 'ENT-003',
          email: 'zhouba@greenenergy.com',
          phone: '13400134006',
          status: 'active',
          createdAt: '2023-03-22T00:00:00.000Z'
        },
        {
          id: 'USR-008',
          username: 'wu_jiu',
          realName: '吴九',
          role: 'user',
          enterpriseId: 'ENT-005',
          email: 'wujiu@creative.com',
          phone: '13300133007',
          status: 'inactive',
          createdAt: '2023-04-05T00:00:00.000Z'
        }
      ]
    }
    
    onMounted(() => {
      generateMockData()
    })
    
    return {
      activeTab,
      enterpriseSearchKeyword,
      enterpriseStatusFilter,
      enterpriseIndustryFilter,
      enterpriseCurrentPage,
      enterprisePageSize,
      userSearchKeyword,
      userRoleFilter,
      userStatusFilter,
      userCurrentPage,
      userPageSize,
      enterpriseDialogVisible,
      enterpriseDetailDialogVisible,
      isEditEnterprise,
      userDialogVisible,
      isEditUser,
      resetPasswordDialogVisible,
      enterprises,
      users,
      zones,
      selectedEnterprise,
      selectedUser,
      industries,
      enterpriseForm,
      enterpriseFormRules,
      userForm,
      userFormRules,
      resetPasswordForm,
      resetPasswordFormRules,
      filteredEnterprises,
      filteredUsers,
      getIndustryName,
      getRoleName,
      getRoleTagType,
      getEnterpriseName,
      getZoneNames,
      formatDate,
      formatDateTime,
      handleEnterpriseClick,
      handleUserClick,
      viewEnterpriseDetail,
      openAddEnterpriseDialog,
      editEnterprise,
      saveEnterprise,
      toggleEnterpriseStatus,
      exportEnterpriseData,
      openAddUserDialog,
      editUser,
      saveUser,
      handleUserStatusChange,
      resetUserPassword,
      confirmResetPassword,
      deleteUser,
      viewUserDetail,
      exportUserData,
      handleEnterpriseSizeChange,
      handleEnterpriseCurrentChange,
      handleUserSizeChange,
      handleUserCurrentChange
    }
  }
}
</script>

<style scoped>
.enterprise-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-tabs {
  min-width: 300px;
}

.tab-content {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.action-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.enterprise-name-wrapper {
  display: flex;
  align-items: center;
}

.energy-usage-wrapper {
  display: flex;
  align-items: center;
}

.over-quota {
  color: #f56c6c;
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-tabs {
    width: 100%;
    min-width: unset;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    justify-content: stretch;
  }
  
  .action-section {
    justify-content: center;
  }
  
  .pagination-wrapper {
    justify-content: center;
  }
}
</style>