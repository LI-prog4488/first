<template>
  <div class="system-settings">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>系统设置</h1>
      <div class="header-actions">
        <el-button type="primary" @click="saveSettings" :loading="saving">
          <el-icon><Save /></el-icon>
          保存设置
        </el-button>
        <el-button @click="resetSettings">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </div>
    
    <!-- 设置选项卡 -->
    <el-tabs v-model="activeTab" type="card" class="settings-tabs">
      <!-- 基础配置 -->
      <el-tab-pane label="基础配置" name="basic">
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>系统基础设置</span>
            </div>
          </template>
          
          <el-form :model="basicSettings" label-width="150px" class="settings-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="能耗单位设置">
                  <el-select v-model="basicSettings.energyUnit" placeholder="请选择默认能耗单位">
                    <el-option label="千瓦时 (kWh)" value="kWh"></el-option>
                    <el-option label="焦耳 (J)" value="J"></el-option>
                    <el-option label="兆焦 (MJ)" value="MJ"></el-option>
                  </el-select>
                </el-form-item>
                
                <el-form-item label="水量单位设置">
                  <el-select v-model="basicSettings.waterUnit" placeholder="请选择默认水量单位">
                    <el-option label="立方米 (m³)" value="m³"></el-option>
                    <el-option label="升 (L)" value="L"></el-option>
                  </el-select>
                </el-form-item>
                
                <el-form-item label="燃气单位设置">
                  <el-select v-model="basicSettings.gasUnit" placeholder="请选择默认燃气单位">
                    <el-option label="立方米 (m³)" value="m³"></el-option>
                    <el-option label="升 (L)" value="L"></el-option>
                  </el-select>
                </el-form-item>
                
                <el-form-item label="热力单位设置">
                  <el-select v-model="basicSettings.heatUnit" placeholder="请选择默认热力单位">
                    <el-option label="吉焦 (GJ)" value="GJ"></el-option>
                    <el-option label="兆瓦时 (MWh)" value="MWh"></el-option>
                    <el-option label="百万千卡 (Gcal)" value="Gcal"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="数据刷新频率">
                  <el-select v-model="basicSettings.refreshRate" placeholder="请选择数据刷新频率">
                    <el-option label="5秒" value="5"></el-option>
                    <el-option label="10秒" value="10"></el-option>
                    <el-option label="30秒" value="30"></el-option>
                    <el-option label="1分钟" value="60"></el-option>
                    <el-option label="5分钟" value="300"></el-option>
                  </el-select>
                </el-form-item>
                
                <el-form-item label="自动导出周期">
                  <el-select v-model="basicSettings.exportCycle" placeholder="请选择自动导出周期">
                    <el-option label="每日" value="daily"></el-option>
                    <el-option label="每周" value="weekly"></el-option>
                    <el-option label="每月" value="monthly"></el-option>
                    <el-option label="不自动导出" value="none"></el-option>
                  </el-select>
                </el-form-item>
                
                <el-form-item label="数据保留期限">
                  <el-input-number v-model="basicSettings.dataRetentionPeriod" :min="1" :max="3650" :step="1"></el-input-number>
                  <span class="unit-label">天</span>
                </el-form-item>
                
                <el-form-item label="系统主题">
                  <el-select v-model="basicSettings.theme" placeholder="请选择系统主题">
                    <el-option label="默认主题" value="default"></el-option>
                    <el-option label="深色主题" value="dark"></el-option>
                    <el-option label="浅色主题" value="light"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        
        <el-card class="settings-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>预警阈值设置</span>
            </div>
          </template>
          
          <el-form :model="thresholdSettings" label-width="150px" class="settings-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="电力预警阈值">
                  <el-input-number 
                    v-model="thresholdSettings.electricityThreshold" 
                    :min="0" 
                    :max="10000" 
                    :step="1"
                  ></el-input-number>
                  <span class="unit-label">kWh/h</span>
                </el-form-item>
                
                <el-form-item label="水量预警阈值">
                  <el-input-number 
                    v-model="thresholdSettings.waterThreshold" 
                    :min="0" 
                    :max="1000" 
                    :step="0.1"
                  ></el-input-number>
                  <span class="unit-label">m³/h</span>
                </el-form-item>
                
                <el-form-item label="燃气预警阈值">
                  <el-input-number 
                    v-model="thresholdSettings.gasThreshold" 
                    :min="0" 
                    :max="1000" 
                    :step="0.1"
                  ></el-input-number>
                  <span class="unit-label">m³/h</span>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="热力预警阈值">
                  <el-input-number 
                    v-model="thresholdSettings.heatThreshold" 
                    :min="0" 
                    :max="100" 
                    :step="0.1"
                  ></el-input-number>
                  <span class="unit-label">GJ/h</span>
                </el-form-item>
                
                <el-form-item label="设备离线时长">
                  <el-input-number 
                    v-model="thresholdSettings.deviceOfflineDuration" 
                    :min="1" 
                    :max="1440" 
                    :step="1"
                  ></el-input-number>
                  <span class="unit-label">分钟</span>
                </el-form-item>
                
                <el-form-item label="数据波动阈值">
                  <el-input-number 
                    v-model="thresholdSettings.dataFluctuationThreshold" 
                    :min="0" 
                    :max="100" 
                    :step="1"
                  ></el-input-number>
                  <span class="unit-label">%</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 权限管理 -->
      <el-tab-pane label="权限管理" name="permissions">
        <div class="permissions-section">
          <div class="section-header">
            <h3>角色管理</h3>
            <el-button type="primary" @click="showAddRoleDialog">
              <el-icon><Plus /></el-icon>
              新增角色
            </el-button>
          </div>
          
          <el-table 
            :data="roles" 
            style="width: 100%"
            border
            class="roles-table"
          >
            <el-table-column prop="id" label="角色ID" width="100"></el-table-column>
            <el-table-column prop="name" label="角色名称" width="150"></el-table-column>
            <el-table-column prop="description" label="角色描述" min-width="200"></el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  active-text="启用"
                  inactive-text="禁用"
                  @change="handleRoleStatusChange(scope.row)"
                ></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" type="primary" @click="editRole(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteRole(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="section-header" style="margin-top: 30px;">
            <h3>菜单权限配置</h3>
          </div>
          
          <el-card class="permissions-card">
            <el-form :model="permissionsForm" label-width="120px">
              <el-form-item label="选择角色">
                <el-select v-model="permissionsForm.roleId" placeholder="请选择角色">
                  <el-option 
                    v-for="role in roles" 
                    :key="role.id" 
                    :label="role.name" 
                    :value="role.id"
                    :disabled="!role.status"
                  ></el-option>
                </el-select>
              </el-form-item>
              
              <el-form-item label="菜单权限">
                <el-tree
                  v-if="permissionsForm.roleId"
                  ref="menuTree"
                  :data="menuList"
                  show-checkbox
                  node-key="id"
                  default-expand-all
                  :default-checked-keys="getCheckedMenuIds(permissionsForm.roleId)"
                  @check-change="handleMenuCheckChange"
                ></el-tree>
                <div v-else class="no-role-selected">请先选择角色</div>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveRolePermissions" :loading="savingPermissions">
                  <el-icon><DocumentAdd /></el-icon>
                  保存权限配置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 日志管理 -->
      <el-tab-pane label="日志管理" name="logs">
        <div class="logs-section">
          <div class="logs-tabs">
            <el-tabs v-model="activeLogTab" type="border-card">
              <el-tab-pane label="操作日志" name="operation">
                <div class="logs-toolbar">
                  <el-select
                    v-model="operationLogFilter.type"
                    placeholder="操作类型"
                    clearable
                    style="width: 150px; margin-right: 15px;"
                  >
                    <el-option label="登录" value="login"></el-option>
                    <el-option label="登出" value="logout"></el-option>
                    <el-option label="创建" value="create"></el-option>
                    <el-option label="更新" value="update"></el-option>
                    <el-option label="删除" value="delete"></el-option>
                    <el-option label="查询" value="query"></el-option>
                  </el-select>
                  <el-input
                    v-model="operationLogFilter.username"
                    placeholder="用户名"
                    clearable
                    style="width: 150px; margin-right: 15px;"
                  ></el-input>
                  <el-date-picker
                    v-model="operationLogFilter.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 280px; margin-right: 15px;"
                  ></el-date-picker>
                  <el-button type="primary" @click="searchOperationLogs">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="resetOperationLogFilters">
                    <el-icon><RefreshLeft /></el-icon>
                    重置
                  </el-button>
                </div>
                
                <el-table 
                  :data="filteredOperationLogs" 
                  style="width: 100%"
                  border
                  v-loading="loadingLogs"
                >
                  <el-table-column prop="id" label="ID" width="80"></el-table-column>
                  <el-table-column prop="username" label="用户名" width="120"></el-table-column>
                  <el-table-column prop="type" label="操作类型" width="100">
                    <template #default="scope">
                      <el-tag :type="getOperationTypeTag(scope.row.type)">
                        {{ getOperationTypeText(scope.row.type) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="action" label="操作内容" min-width="250"></el-table-column>
                  <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
                  <el-table-column prop="userAgent" label="浏览器信息" min-width="200"></el-table-column>
                  <el-table-column prop="createdAt" label="操作时间" width="180" align="center">
                    <template #default="scope">
                      {{ formatDateTime(scope.row.createdAt) }}
                    </template>
                  </el-table-column>
                </el-table>
                
                <div class="logs-pagination" v-if="filteredOperationLogs.length > 0">
                  <el-pagination
                    v-model:current-page="operationLogPage.current"
                    v-model:page-size="operationLogPage.size"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="filteredOperationLogs.length"
                  ></el-pagination>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="登录日志" name="login">
                <div class="logs-toolbar">
                  <el-input
                    v-model="loginLogFilter.username"
                    placeholder="用户名"
                    clearable
                    style="width: 150px; margin-right: 15px;"
                  ></el-input>
                  <el-select
                    v-model="loginLogFilter.status"
                    placeholder="登录状态"
                    clearable
                    style="width: 120px; margin-right: 15px;"
                  >
                    <el-option label="成功" value="success"></el-option>
                    <el-option label="失败" value="failed"></el-option>
                  </el-select>
                  <el-date-picker
                    v-model="loginLogFilter.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 280px; margin-right: 15px;"
                  ></el-date-picker>
                  <el-button type="primary" @click="searchLoginLogs">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="resetLoginLogFilters">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </div>
                
                <el-table 
                  :data="filteredLoginLogs" 
                  style="width: 100%"
                  border
                  v-loading="loadingLogs"
                >
                  <el-table-column prop="id" label="ID" width="80"></el-table-column>
                  <el-table-column prop="username" label="用户名" width="120"></el-table-column>
                  <el-table-column prop="status" label="登录状态" width="100" align="center">
                    <template #default="scope">
                      <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
                        {{ scope.row.status === 'success' ? '成功' : '失败' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="message" label="登录信息" min-width="250"></el-table-column>
                  <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
                  <el-table-column prop="location" label="登录地点" width="150"></el-table-column>
                  <el-table-column prop="browser" label="浏览器" min-width="180"></el-table-column>
                  <el-table-column prop="createdAt" label="登录时间" width="180" align="center">
                    <template #default="scope">
                      {{ formatDateTime(scope.row.createdAt) }}
                    </template>
                  </el-table-column>
                </el-table>
                
                <div class="logs-pagination" v-if="filteredLoginLogs.length > 0">
                  <el-pagination
                    v-model:current-page="loginLogPage.current"
                    v-model:page-size="loginLogPage.size"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="filteredLoginLogs.length"
                  ></el-pagination>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="editingRole ? '编辑角色' : '新增角色'"
      width="500px"
    >
      <el-form :model="roleForm" label-width="100px" :rules="roleRules" ref="roleFormRef">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="roleForm.description" 
            placeholder="请输入角色描述" 
            type="textarea" 
            :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="角色状态">
          <el-switch v-model="roleForm.status" active-text="启用" inactive-text="禁用"></el-switch>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole" :loading="savingRole">
            {{ editingRole ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DocumentAdd, RefreshLeft, Plus, Search
} from '@element-plus/icons-vue'

export default {
  name: 'SystemSettings',
  components: {
    DocumentAdd, RefreshLeft, Plus, Search
  },
  setup() {
    // 选项卡
    const activeTab = ref('basic')
    const activeLogTab = ref('operation')
    
    // 状态
    const saving = ref(false)
    const savingRole = ref(false)
    const savingPermissions = ref(false)
    const loadingLogs = ref(false)
    
    // 对话框
    const roleDialogVisible = ref(false)
    const editingRole = ref(null)
    
    // 表单引用
    const roleFormRef = ref(null)
    const menuTree = ref(null)
    
    // 基础设置
    const basicSettings = reactive({
      energyUnit: 'kWh',
      waterUnit: 'm³',
      gasUnit: 'm³',
      heatUnit: 'GJ',
      refreshRate: '30',
      exportCycle: 'weekly',
      dataRetentionPeriod: 365,
      theme: 'default'
    })
    
    // 阈值设置
    const thresholdSettings = reactive({
      electricityThreshold: 500,
      waterThreshold: 50,
      gasThreshold: 30,
      heatThreshold: 10,
      deviceOfflineDuration: 30,
      dataFluctuationThreshold: 20
    })
    
    // 权限设置
    const permissionsForm = reactive({
      roleId: ''
    })
    
    // 角色数据
    const roles = ref([])
    const roleForm = reactive({
      name: '',
      description: '',
      status: true
    })
    
    const roleRules = {
      name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 2, max: 20, message: '角色名称长度应为2-20个字符', trigger: 'blur' }
      ],
      description: [
        { max: 200, message: '角色描述长度不能超过200个字符', trigger: 'blur' }
      ]
    }
    
    // 菜单列表
    const menuList = ref([])
    
    // 操作日志
    const operationLogs = ref([])
    const operationLogFilter = reactive({
      type: '',
      username: '',
      dateRange: null
    })
    const operationLogPage = reactive({
      current: 1,
      size: 10
    })
    
    // 登录日志
    const loginLogs = ref([])
    const loginLogFilter = reactive({
      username: '',
      status: '',
      dateRange: null
    })
    const loginLogPage = reactive({
      current: 1,
      size: 10
    })
    
    // 计算属性：筛选后的操作日志
    const filteredOperationLogs = computed(() => {
      return operationLogs.value.filter(log => {
        const matchesType = !operationLogFilter.type || log.type === operationLogFilter.type
        const matchesUsername = !operationLogFilter.username || 
          log.username.toLowerCase().includes(operationLogFilter.username.toLowerCase())
        const matchesDate = !operationLogFilter.dateRange || 
          (new Date(log.createdAt) >= new Date(operationLogFilter.dateRange[0]) && 
           new Date(log.createdAt) <= new Date(operationLogFilter.dateRange[1]))
        
        return matchesType && matchesUsername && matchesDate
      })
    })
    
    // 计算属性：筛选后的登录日志
    const filteredLoginLogs = computed(() => {
      return loginLogs.value.filter(log => {
        const matchesUsername = !loginLogFilter.username || 
          log.username.toLowerCase().includes(loginLogFilter.username.toLowerCase())
        const matchesStatus = !loginLogFilter.status || log.status === loginLogFilter.status
        const matchesDate = !loginLogFilter.dateRange || 
          (new Date(log.createdAt) >= new Date(loginLogFilter.dateRange[0]) && 
           new Date(log.createdAt) <= new Date(loginLogFilter.dateRange[1]))
        
        return matchesUsername && matchesStatus && matchesDate
      })
    })
    
    // 格式化日期时间
    const formatDateTime = (date) => {
      if (!date) return '--'
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
    }
    
    // 获取操作类型文本
    const getOperationTypeText = (type) => {
      const texts = {
        login: '登录',
        logout: '登出',
        create: '创建',
        update: '更新',
        delete: '删除',
        query: '查询'
      }
      return texts[type] || type
    }
    
    // 获取操作类型标签
    const getOperationTypeTag = (type) => {
      const types = {
        login: 'primary',
        logout: 'info',
        create: 'success',
        update: 'warning',
        delete: 'danger',
        query: 'info'
      }
      return types[type] || 'info'
    }
    
    // 保存设置
    const saveSettings = () => {
      saving.value = true
      
      // 模拟保存操作
      setTimeout(() => {
        ElMessage.success('设置保存成功')
        saving.value = false
      }, 1000)
    }
    
    // 重置设置
    const resetSettings = () => {
      ElMessageBox.confirm(
        '确定要重置所有设置吗？',
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 重置基础设置
        Object.assign(basicSettings, {
          energyUnit: 'kWh',
          waterUnit: 'm³',
          gasUnit: 'm³',
          heatUnit: 'GJ',
          refreshRate: '30',
          exportCycle: 'weekly',
          dataRetentionPeriod: 365,
          theme: 'default'
        })
        
        // 重置阈值设置
        Object.assign(thresholdSettings, {
          electricityThreshold: 500,
          waterThreshold: 50,
          gasThreshold: 30,
          heatThreshold: 10,
          deviceOfflineDuration: 30,
          dataFluctuationThreshold: 20
        })
        
        ElMessage.success('设置已重置')
      }).catch(() => {
        // 取消操作
      })
    }
    
    // 显示新增角色对话框
    const showAddRoleDialog = () => {
      editingRole.value = null
      Object.assign(roleForm, {
        name: '',
        description: '',
        status: true
      })
      roleDialogVisible.value = true
    }
    
    // 编辑角色
    const editRole = (role) => {
      editingRole.value = role.id
      Object.assign(roleForm, {
        name: role.name,
        description: role.description,
        status: role.status
      })
      roleDialogVisible.value = true
    }
    
    // 删除角色
    const deleteRole = (role) => {
      if (role.id === '1' || role.id === '2' || role.id === '3') {
        ElMessage.warning('系统内置角色不能删除')
        return
      }
      
      ElMessageBox.confirm(
        `确定要删除角色「${role.name}」吗？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'danger'
        }
      ).then(() => {
        const index = roles.value.findIndex(r => r.id === role.id)
        if (index !== -1) {
          roles.value.splice(index, 1)
          ElMessage.success('角色删除成功')
        }
      }).catch(() => {
        // 取消操作
      })
    }
    
    // 保存角色
    const saveRole = () => {
      if (!roleFormRef.value) return
      
      roleFormRef.value.validate((valid) => {
        if (valid) {
          savingRole.value = true
          
          setTimeout(() => {
            if (editingRole.value) {
              // 更新角色
              const index = roles.value.findIndex(r => r.id === editingRole.value)
              if (index !== -1) {
                roles.value[index] = {
                  ...roles.value[index],
                  name: roleForm.name,
                  description: roleForm.description,
                  status: roleForm.status
                }
                ElMessage.success('角色更新成功')
              }
            } else {
              // 新增角色
              const newRole = {
                id: Date.now().toString(),
                name: roleForm.name,
                description: roleForm.description,
                status: roleForm.status,
                createdAt: new Date().toISOString()
              }
              roles.value.push(newRole)
              ElMessage.success('角色创建成功')
            }
            
            roleDialogVisible.value = false
            savingRole.value = false
          }, 1000)
        }
      })
    }
    
    // 处理角色状态变更
    const handleRoleStatusChange = (role) => {
      if (role.id === '1' || role.id === '2' || role.id === '3') {
        ElMessage.warning('系统内置角色状态不能修改')
        role.status = !role.status // 恢复原状态
        return
      }
      
      ElMessage.success(`角色「${role.name}」状态已${role.status ? '启用' : '禁用'}`)
    }
    
    // 获取选中的菜单ID
    const getCheckedMenuIds = (roleId) => {
      const role = roles.value.find(r => r.id === roleId)
      return role ? role.permissions || [] : []
    }
    
    // 处理菜单权限变更
    const handleMenuCheckChange = (data, checked, indeterminate) => {
      // 可以在这里处理权限变更逻辑
    }
    
    // 保存角色权限
    const saveRolePermissions = () => {
      if (!permissionsForm.roleId || !menuTree.value) {
        ElMessage.warning('请先选择角色')
        return
      }
      
      savingPermissions.value = true
      
      const checkedKeys = menuTree.value.getCheckedKeys()
      const role = roles.value.find(r => r.id === permissionsForm.roleId)
      
      if (role) {
        // 模拟保存操作
        setTimeout(() => {
          role.permissions = checkedKeys
          ElMessage.success('权限配置保存成功')
          savingPermissions.value = false
        }, 1000)
      }
    }
    
    // 搜索操作日志
    const searchOperationLogs = () => {
      loadingLogs.value = true
      
      // 模拟搜索操作
      setTimeout(() => {
        ElMessage.success(`搜索到 ${filteredOperationLogs.value.length} 条操作日志`)
        loadingLogs.value = false
      }, 800)
    }
    
    // 重置操作日志筛选条件
    const resetOperationLogFilters = () => {
      Object.assign(operationLogFilter, {
        type: '',
        username: '',
        dateRange: null
      })
    }
    
    // 搜索登录日志
    const searchLoginLogs = () => {
      loadingLogs.value = true
      
      // 模拟搜索操作
      setTimeout(() => {
        ElMessage.success(`搜索到 ${filteredLoginLogs.value.length} 条登录日志`)
        loadingLogs.value = false
      }, 800)
    }
    
    // 重置登录日志筛选条件
    const resetLoginLogFilters = () => {
      Object.assign(loginLogFilter, {
        username: '',
        status: '',
        dateRange: null
      })
    }
    
    // 生成模拟数据
    const generateMockData = () => {
      // 模拟角色数据
      roles.value = [
        {
          id: '1',
          name: '超级管理员',
          description: '系统最高权限，可管理所有功能',
          status: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: ['1', '1-1', '1-2', '1-3', '1-4', '1-5', '2', '2-1', '2-2', '3', '3-1', '3-2', '4', '4-1', '4-2', '5', '5-1', '5-2', '6', '6-1', '6-2', '7', '7-1', '7-2', '8', '8-1', '8-2', '9', '9-1', '9-2', '10', '10-1', '10-2', '11', '11-1', '11-2', '12', '12-1', '12-2', '13', '13-1', '13-2']
        },
        {
          id: '2',
          name: '企业管理员',
          description: '管理企业内部能源监测和设置',
          status: true,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: ['1', '1-1', '1-2', '1-3', '2', '2-1', '2-2', '3', '3-1', '3-2', '4', '4-1', '4-2', '9', '9-1', '9-2', '13', '13-1', '13-2']
        },
        {
          id: '3',
          name: '运维人员',
          description: '负责设备维护和故障处理',
          status: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: ['1', '1-1', '1-2', '2', '2-1', '5', '5-1', '5-2', '6', '6-1', '6-2', '9', '9-1', '9-2', '10', '10-1', '10-2', '13', '13-1', '13-2']
        },
        {
          id: '4',
          name: '普通用户',
          description: '查看基础能耗数据',
          status: true,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: ['1', '1-1', '2', '2-1', '3', '3-1', '13', '13-1', '13-2']
        }
      ]
      
      // 模拟菜单数据
      menuList.value = [
        {
          id: '1',
          label: '首页',
          children: [
            { id: '1-1', label: '仪表盘' },
            { id: '1-2', label: '实时监控' },
            { id: '1-3', label: '历史查询' },
            { id: '1-4', label: '能耗分析' },
            { id: '1-5', label: '异常预警' }
          ]
        },
        {
          id: '2',
          label: '设备管理',
          children: [
            { id: '2-1', label: '设备列表' },
            { id: '2-2', label: '设备配置' }
          ]
        },
        {
          id: '3',
          label: '区域管理',
          children: [
            { id: '3-1', label: '区域配置' },
            { id: '3-2', label: '区域权限' }
          ]
        },
        {
          id: '4',
          label: '企业管理',
          children: [
            { id: '4-1', label: '企业列表' },
            { id: '4-2', label: '企业配额' }
          ]
        },
        {
          id: '5',
          label: '故障处理',
          children: [
            { id: '5-1', label: '故障记录' },
            { id: '5-2', label: '处理流程' }
          ]
        },
        {
          id: '6',
          label: '报表中心',
          children: [
            { id: '6-1', label: '报表生成' },
            { id: '6-2', label: '报表模板' }
          ]
        },
        {
          id: '7',
          label: '系统设置',
          children: [
            { id: '7-1', label: '基础配置' },
            { id: '7-2', label: '阈值设置' }
          ]
        },
        {
          id: '8',
          label: '权限管理',
          children: [
            { id: '8-1', label: '角色管理' },
            { id: '8-2', label: '权限配置' }
          ]
        },
        {
          id: '9',
          label: '日志中心',
          children: [
            { id: '9-1', label: '操作日志' },
            { id: '9-2', label: '登录日志' }
          ]
        },
        {
          id: '10',
          label: '帮助中心',
          children: [
            { id: '10-1', label: '使用手册' },
            { id: '10-2', label: '常见问题' }
          ]
        },
        {
          id: '11',
          label: '个人中心',
          children: [
            { id: '11-1', label: '个人信息' },
            { id: '11-2', label: '密码修改' }
          ]
        },
        {
          id: '12',
          label: '系统公告',
          children: [
            { id: '12-1', label: '公告列表' },
            { id: '12-2', label: '发布公告' }
          ]
        },
        {
          id: '13',
          label: '系统工具',
          children: [
            { id: '13-1', label: '数据备份' },
            { id: '13-2', label: '系统升级' }
          ]
        }
      ]
      
      // 模拟操作日志数据
      operationLogs.value = [
        {
          id: '1',
          username: 'admin',
          type: 'login',
          action: '用户登录系统',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          username: 'admin',
          type: 'update',
          action: '更新系统基础配置',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          username: 'enterprise1',
          type: 'query',
          action: '查询企业能耗数据',
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110',
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          username: 'admin',
          type: 'create',
          action: '创建新角色：运维主管',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          username: 'operator1',
          type: 'update',
          action: '更新设备状态',
          ip: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/95.0',
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        }
      ]
      
      // 模拟登录日志数据
      loginLogs.value = [
        {
          id: '1',
          username: 'admin',
          status: 'success',
          message: '登录成功',
          ip: '192.168.1.100',
          location: '北京市',
          browser: 'Chrome 96.0.4664.110',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          username: 'testuser',
          status: 'failed',
          message: '密码错误',
          ip: '192.168.1.105',
          location: '上海市',
          browser: 'Firefox 95.0',
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          username: 'enterprise1',
          status: 'success',
          message: '登录成功',
          ip: '192.168.1.101',
          location: '广州市',
          browser: 'Safari 15.2',
          createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          username: 'operator1',
          status: 'success',
          message: '登录成功',
          ip: '192.168.1.102',
          location: '深圳市',
          browser: 'Edge 96.0.1054.62',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          username: 'hacker',
          status: 'failed',
          message: '尝试多次登录失败，已锁定',
          ip: '103.235.46.128',
          location: '未知位置',
          browser: 'Unknown Browser',
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        }
      ]
    }
    
    onMounted(() => {
      generateMockData()
    })
    
    return {
      activeTab,
      activeLogTab,
      saving,
      savingRole,
      savingPermissions,
      loadingLogs,
      roleDialogVisible,
      editingRole,
      roleFormRef,
      menuTree,
      basicSettings,
      thresholdSettings,
      permissionsForm,
      roles,
      roleForm,
      roleRules,
      menuList,
      operationLogs,
      operationLogFilter,
      operationLogPage,
      loginLogs,
      loginLogFilter,
      loginLogPage,
      filteredOperationLogs,
      filteredLoginLogs,
      formatDateTime,
      getOperationTypeText,
      getOperationTypeTag,
      saveSettings,
      resetSettings,
      showAddRoleDialog,
      editRole,
      deleteRole,
      saveRole,
      handleRoleStatusChange,
      getCheckedMenuIds,
      handleMenuCheckChange,
      saveRolePermissions,
      searchOperationLogs,
      resetOperationLogFilters,
      searchLoginLogs,
      resetLoginLogFilters
    }
  }
}
</script>

<style scoped>
.system-settings {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.settings-tabs {
  margin-bottom: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-form {
  padding: 20px 0 0 0;
}

.unit-label {
  margin-left: 8px;
  color: #606266;
}

.permissions-section {
  padding: 10px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.roles-table {
  margin-bottom: 20px;
}

.permissions-card {
  margin-top: 20px;
}

.no-role-selected {
  padding: 40px;
  text-align: center;
  color: #909399;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.logs-section {
  padding: 10px 0;
}

.logs-tabs {
  width: 100%;
}

.logs-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.logs-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .logs-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .logs-toolbar > * {
    width: 100%;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .logs-pagination {
    justify-content: center;
  }
}
</style>