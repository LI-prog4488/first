<template>
  <div class="personal-center">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>个人中心</h1>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 个人中心选项卡 -->
    <el-tabs v-model="activeTab" type="border-card" class="personal-tabs">
      <!-- 个人信息 -->
      <el-tab-pane label="个人信息" name="profile">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          
          <div class="profile-content">
            <!-- 头像上传 -->
            <div class="avatar-section">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :on-change="handleAvatarUpload"
                :auto-upload="false"
                accept="image/*"
              >
                <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar" />
                <div v-else class="avatar-placeholder">
                  <el-icon><User /></el-icon>
                </div>
                <div slot="tip" class="avatar-tip">点击上传头像</div>
              </el-upload>
            </div>
            
            <!-- 用户信息表单 -->
            <el-form :model="userInfo" label-width="120px" class="profile-form">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="userInfo.username" disabled></el-input>
                  </el-form-item>
                  
                  <el-form-item label="真实姓名" prop="realName">
                    <el-input v-model="userInfo.realName"></el-input>
                  </el-form-item>
                  
                  <el-form-item label="所属角色" prop="role">
                    <el-input v-model="userInfo.role" disabled></el-input>
                  </el-form-item>
                  
                  <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="userInfo.phone"></el-input>
                  </el-form-item>
                </el-col>
                
                <el-col :span="12">
                  <el-form-item label="邮箱地址" prop="email">
                    <el-input v-model="userInfo.email"></el-input>
                  </el-form-item>
                  
                  <el-form-item label="所属企业" prop="company">
                    <el-input v-model="userInfo.company" disabled></el-input>
                  </el-form-item>
                  
                  <el-form-item label="入职时间" prop="joinDate">
                    <el-date-picker
                      v-model="userInfo.joinDate"
                      type="date"
                      placeholder="选择日期"
                      value-format="YYYY-MM-DD"
                    ></el-date-picker>
                  </el-form-item>
                  
                  <el-form-item label="最后登录时间" prop="lastLoginTime">
                    <el-input v-model="userInfo.lastLoginTime" disabled></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="个性签名" prop="bio">
                <el-input
                  v-model="userInfo.bio"
                  type="textarea"
                  rows="3"
                  placeholder="请输入个性签名"
                ></el-input>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="updateProfile" :loading="updatingProfile">
                  <el-icon><Edit /></el-icon>
                  更新信息
                </el-button>
                <el-button @click="cancelUpdate">
                  <el-icon><RefreshLeft /></el-icon>
                  取消修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
        
        <el-card class="notification-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>通知设置</span>
            </div>
          </template>
          
          <el-form :model="notificationSettings" label-width="150px" class="notification-form">
            <el-form-item label="接收系统通知">
              <el-switch v-model="notificationSettings.system"></el-switch>
            </el-form-item>
            
            <el-form-item label="接收预警通知">
              <el-switch v-model="notificationSettings.alerts"></el-switch>
            </el-form-item>
            
            <el-form-item label="接收任务通知">
              <el-switch v-model="notificationSettings.tasks"></el-switch>
            </el-form-item>
            
            <el-form-item label="接收能耗报告">
              <el-switch v-model="notificationSettings.reports"></el-switch>
            </el-form-item>
            
            <el-form-item label="通知方式">
              <el-checkbox-group v-model="notificationSettings.methods">
                <el-checkbox label="站内信">站内信</el-checkbox>
                <el-checkbox label="邮件">邮件</el-checkbox>
                <el-checkbox label="短信">短信</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="updateNotifications" :loading="updatingNotifications">
                <el-icon><DocumentAdd /></el-icon>
                保存设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 密码修改 -->
      <el-tab-pane label="密码修改" name="password">
        <el-card class="password-card">
          <template #header>
            <div class="card-header">
              <span>修改登录密码</span>
            </div>
          </template>
          
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="150px" class="password-form">
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="请输入当前密码"
                show-password
              ></el-input>
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              ></el-input>
              <div class="password-tip">密码长度8-20位，必须包含字母和数字</div>
            </el-form-item>
            
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              ></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="changePassword" :loading="changingPassword">
                <el-icon><Key /></el-icon>
                修改密码
              </el-button>
              <el-button @click="resetPasswordForm">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card class="security-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
            </div>
          </template>
          
          <div class="security-content">
            <div class="security-item">
              <div class="security-info">
                <h3>双因素认证</h3>
                <p>开启后登录需要验证码，提高账号安全性</p>
              </div>
              <div class="security-action">
                <el-switch v-model="securitySettings.twoFactorAuth" @change="toggleTwoFactor"></el-switch>
              </div>
            </div>
            
            <div class="security-divider"></div>
            
            <div class="security-item">
              <div class="security-info">
                <h3>登录保护</h3>
                <p>新设备登录需要验证身份</p>
              </div>
              <div class="security-action">
                <el-switch v-model="securitySettings.loginProtection" @change="toggleLoginProtection"></el-switch>
              </div>
            </div>
            
            <div class="security-divider"></div>
            
            <div class="security-item">
              <div class="security-info">
                <h3>登录历史</h3>
                <p>查看账号的最近登录记录</p>
              </div>
              <div class="security-action">
                <el-button type="primary" @click="showLoginHistory">查看记录</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 我的任务 -->
      <el-tab-pane label="我的任务" name="tasks">
        <div class="tasks-section">
          <div class="tasks-tabs">
            <el-tabs v-model="activeTaskTab" type="border-card" @tab-click="handleTaskTabChange">
              <el-tab-pane label="待处理预警" name="pending-alerts">
                <div class="tasks-filter">
                  <el-select
                    v-model="alertFilter.status"
                    placeholder="预警状态"
                    clearable
                    style="width: 120px; margin-right: 15px;"
                  >
                    <el-option label="未处理" value="pending"></el-option>
                    <el-option label="处理中" value="processing"></el-option>
                  </el-select>
                  
                  <el-select
                    v-model="alertFilter.type"
                    placeholder="预警类型"
                    clearable
                    style="width: 150px; margin-right: 15px;"
                  >
                    <el-option label="能耗超标" value="overload"></el-option>
                    <el-option label="设备离线" value="offline"></el-option>
                    <el-option label="数据异常" value="data_error"></el-option>
                  </el-select>
                  
                  <el-date-picker
                    v-model="alertFilter.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 280px; margin-right: 15px;"
                  ></el-date-picker>
                  
                  <el-button type="primary" @click="searchAlerts">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="resetAlertFilters">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </div>
                
                <el-table
                  :data="filteredAlerts"
                  style="width: 100%"
                  border
                  v-loading="loadingTasks"
                >
                  <el-table-column prop="id" label="预警ID" width="100"></el-table-column>
                  <el-table-column prop="type" label="预警类型" width="120">
                    <template #default="scope">
                      <el-tag :type="getAlertTypeTag(scope.row.type)">
                        {{ getAlertTypeText(scope.row.type) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="title" label="预警标题" min-width="200"></el-table-column>
                  <el-table-column prop="location" label="发生位置" width="150"></el-table-column>
                  <el-table-column prop="level" label="紧急程度" width="100" align="center">
                    <template #default="scope">
                      <el-tag :type="getAlertLevelTag(scope.row.level)">
                        {{ getAlertLevelText(scope.row.level) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="createdAt" label="发生时间" width="180">
                    <template #default="scope">
                      {{ formatDateTime(scope.row.createdAt) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="scope">
                      <el-tag :type="scope.row.status === 'pending' ? 'warning' : 'primary'">
                        {{ scope.row.status === 'pending' ? '未处理' : '处理中' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" align="center">
                    <template #default="scope">
                      <el-button size="small" type="primary" @click="viewAlertDetail(scope.row)">
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div class="tasks-pagination" v-if="filteredAlerts.length > 0">
                  <el-pagination
                    v-model:current-page="alertPage.current"
                    v-model:page-size="alertPage.size"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="filteredAlerts.length"
                  ></el-pagination>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 预警详情对话框 -->
    <el-dialog
      v-model="alertDetailVisible"
      title="预警详情"
      width="700px"
    >
      <div v-if="currentAlert" class="alert-detail">
        <div class="detail-item">
          <span class="detail-label">预警ID：</span>
          <span class="detail-value">{{ currentAlert.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">预警类型：</span>
          <el-tag :type="getAlertTypeTag(currentAlert.type)">
            {{ getAlertTypeText(currentAlert.type) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="detail-label">预警标题：</span>
          <span class="detail-value">{{ currentAlert.title }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">发生位置：</span>
          <span class="detail-value">{{ currentAlert.location }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">紧急程度：</span>
          <el-tag :type="getAlertLevelTag(currentAlert.level)">
            {{ getAlertLevelText(currentAlert.level) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="detail-label">发生时间：</span>
          <span class="detail-value">{{ formatDateTime(currentAlert.createdAt) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">预警内容：</span>
          <div class="detail-content">{{ currentAlert.content }}</div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="alertDetailVisible = false">关闭</el-button>
          <el-button type="primary" @click="processAlert" :loading="processingAlert">
            <el-icon><Check /></el-icon>
            提交处理
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User, Edit, RefreshLeft, DocumentAdd, Key, Search,
  Warning, Tools, Timer, Check
} from '@element-plus/icons-vue'

export default {
  name: 'PersonalCenter',
  components: {
    User, Edit, RefreshLeft, DocumentAdd, Key, Search,
    Warning, Tools, Timer, Check
  },
  setup() {
    // 选项卡
    const activeTab = ref('profile')
    const activeTaskTab = ref('pending-alerts')
    
    // 状态
    const updatingProfile = ref(false)
    const updatingNotifications = ref(false)
    const changingPassword = ref(false)
    const loadingTasks = ref(false)
    const processingAlert = ref(false)
    
    // 对话框
    const alertDetailVisible = ref(false)
    
    // 表单引用
    const passwordFormRef = ref(null)
    
    // 用户信息
    const originalUserInfo = {
      username: 'admin',
      realName: '管理员',
      role: '超级管理员',
      phone: '13800138000',
      email: 'admin@smartpark.com',
      company: '智慧园区管理中心',
      joinDate: '2023-01-01',
      lastLoginTime: '2024-01-15 09:30:45',
      avatar: 'https://via.placeholder.com/150',
      bio: '系统管理员，负责园区能源管理系统的维护和管理。'
    }
    
    const userInfo = reactive({ ...originalUserInfo })
    
    // 通知设置
    const notificationSettings = reactive({
      system: true,
      alerts: true,
      tasks: true,
      reports: true,
      methods: ['站内信', '邮件']
    })
    
    // 密码表单
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    const passwordRules = {
      currentPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 8, max: 20, message: '密码长度应为8-20位', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
    
    // 安全设置
    const securitySettings = reactive({
      twoFactorAuth: false,
      loginProtection: true
    })
    
    // 预警数据
    const alerts = ref([])
    const alertFilter = reactive({
      status: '',
      type: '',
      dateRange: null
    })
    const alertPage = reactive({
      current: 1,
      size: 10
    })
    const currentAlert = ref(null)
    const alertProcessForm = reactive({
      status: 'processing',
      remark: ''
    })
    
    // 计算属性
    const filteredAlerts = computed(() => {
      return alerts.value.filter(alert => {
        const matchesStatus = !alertFilter.status || alert.status === alertFilter.status
        const matchesType = !alertFilter.type || alert.type === alertFilter.type
        return matchesStatus && matchesType
      })
    })
    
    // 格式化日期时间
    const formatDateTime = (date) => {
      if (!date) return '--'
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
    }
    
    // 更新个人信息
    const updateProfile = () => {
      updatingProfile.value = true
      setTimeout(() => {
        ElMessage.success('个人信息更新成功')
        Object.assign(originalUserInfo, { ...userInfo })
        updatingProfile.value = false
      }, 1000)
    }
    
    // 取消修改
    const cancelUpdate = () => {
      Object.assign(userInfo, { ...originalUserInfo })
    }
    
    // 更新通知设置
    const updateNotifications = () => {
      updatingNotifications.value = true
      setTimeout(() => {
        ElMessage.success('通知设置保存成功')
        updatingNotifications.value = false
      }, 800)
    }
    
    // 修改密码
    const changePassword = () => {
      if (!passwordFormRef.value) return
      
      passwordFormRef.value.validate((valid) => {
        if (valid) {
          if (passwordForm.currentPassword === '123456') {
            changingPassword.value = true
            setTimeout(() => {
              ElMessage.success('密码修改成功')
              resetPasswordForm()
              changingPassword.value = false
            }, 1000)
          } else {
            ElMessage.error('当前密码错误')
          }
        }
      })
    }
    
    // 重置密码表单
    const resetPasswordForm = () => {
      Object.assign(passwordForm, {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      if (passwordFormRef.value) {
        passwordFormRef.value.resetFields()
      }
    }
    
    // 切换双因素认证
    const toggleTwoFactor = () => {
      ElMessage.success(securitySettings.twoFactorAuth ? '双因素认证已开启' : '双因素认证已关闭')
    }
    
    // 切换登录保护
    const toggleLoginProtection = () => {
      ElMessage.success(securitySettings.loginProtection ? '登录保护已开启' : '登录保护已关闭')
    }
    
    // 显示登录历史
    const showLoginHistory = () => {
      ElMessage.info('登录历史功能开发中')
    }
    
    // 处理头像上传
    const handleAvatarUpload = (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        userInfo.avatar = e.target.result
        ElMessage.success('头像上传成功')
      }
      reader.readAsDataURL(file.raw)
    }
    
    // 处理任务选项卡切换
    const handleTaskTabChange = () => {
      ElMessage.info('任务切换功能')
    }
    
    // 搜索预警
    const searchAlerts = () => {
      loadingTasks.value = true
      setTimeout(() => {
        ElMessage.success(`搜索到 ${filteredAlerts.value.length} 条预警记录`)
        loadingTasks.value = false
      }, 800)
    }
    
    // 重置预警筛选
    const resetAlertFilters = () => {
      Object.assign(alertFilter, {
        status: '',
        type: '',
        dateRange: null
      })
    }
    
    // 查看预警详情
    const viewAlertDetail = (alert) => {
      currentAlert.value = { ...alert }
      alertDetailVisible.value = true
    }
    
    // 处理预警
    const processAlert = () => {
      processingAlert.value = true
      setTimeout(() => {
        ElMessage.success('预警处理信息提交成功')
        alertDetailVisible.value = false
        processingAlert.value = false
      }, 1000)
    }
    
    // 获取预警类型标签
    const getAlertTypeTag = (type) => {
      const tags = {
        overload: 'danger',
        offline: 'warning',
        data_error: 'info'
      }
      return tags[type] || 'info'
    }
    
    // 获取预警类型文本
    const getAlertTypeText = (type) => {
      const texts = {
        overload: '能耗超标',
        offline: '设备离线',
        data_error: '数据异常'
      }
      return texts[type] || type
    }
    
    // 获取预警级别标签
    const getAlertLevelTag = (level) => {
      const tags = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return tags[level] || 'info'
    }
    
    // 获取预警级别文本
    const getAlertLevelText = (level) => {
      const texts = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return texts[level] || level
    }
    
    // 生成模拟数据
    const generateMockData = () => {
      alerts.value = [
        {
          id: 'AL20240115001',
          type: 'overload',
          title: '办公区A电量消耗异常增高',
          location: '办公区A栋3楼',
          level: 'high',
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          content: '办公区A栋3楼电量消耗在过去1小时内突然增高30%，超过设定阈值，可能存在异常用电情况。'
        },
        {
          id: 'AL20240115002',
          type: 'offline',
          title: '生产区3号电表离线',
          location: '生产区B栋1楼',
          level: 'medium',
          status: 'processing',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          content: '生产区B栋1楼的3号电表已离线超过30分钟，无法获取实时数据。'
        },
        {
          id: 'AL20240115003',
          type: 'data_error',
          title: '生活区水表数据异常',
          location: '生活区C栋',
          level: 'low',
          status: 'pending',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          content: '生活区C栋的水表数据出现异常波动，需要检查设备是否正常工作。'
        }
      ]
    }
    
    // 生命周期
    onMounted(() => {
      generateMockData()
    })
    
    return {
      // 状态
      activeTab,
      activeTaskTab,
      updatingProfile,
      updatingNotifications,
      changingPassword,
      loadingTasks,
      processingAlert,
      
      // 对话框
      alertDetailVisible,
      
      // 表单引用
      passwordFormRef,
      
      // 数据
      userInfo,
      notificationSettings,
      passwordForm,
      passwordRules,
      securitySettings,
      
      alerts,
      alertFilter,
      alertPage,
      currentAlert,
      alertProcessForm,
      
      // 计算属性
      filteredAlerts,
      
      // 方法
      formatDateTime,
      updateProfile,
      cancelUpdate,
      updateNotifications,
      changePassword,
      resetPasswordForm,
      toggleTwoFactor,
      toggleLoginProtection,
      showLoginHistory,
      handleAvatarUpload,
      handleTaskTabChange,
      searchAlerts,
      resetAlertFilters,
      viewAlertDetail,
      processAlert,
      getAlertTypeTag,
      getAlertTypeText,
      getAlertLevelTag,
      getAlertLevelText
    }
  }
}
</script>

<style scoped>
.personal-center {
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #303133;
}

.personal-tabs {
  margin-top: 20px;
}

/* 个人信息样式 */
.profile-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 500;
  font-size: 16px;
  color: #303133;
}

.profile-content {
  padding: 20px 0;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #dcdfe6;
  cursor: pointer;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f5f7fa;
  border: 1px dashed #c0c4cc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 36px;
  color: #909399;
}

.avatar-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}

.profile-form {
  max-width: 900px;
  margin: 0 auto;
}

.password-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

/* 通知设置样式 */
.notification-form {
  max-width: 600px;
}

/* 安全设置样式 */
.security-content {
  padding: 10px 0;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.security-info h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #303133;
}

.security-info p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.security-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 10px 0;
}

/* 任务样式 */
.tasks-section {
  padding: 10px 0;
}

.tasks-filter {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.tasks-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 详情对话框样式 */
.alert-detail {
  padding: 10px 0;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  font-weight: 500;
  color: #606266;
  margin-right: 10px;
}

.detail-value {
  color: #303133;
}

.detail-content {
  margin-top: 5px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #303133;
  line-height: 1.6;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .personal-center {
    padding: 10px;
  }
  
  .profile-form {
    width: 100%;
  }
  
  .tasks-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tasks-filter > * {
    margin-bottom: 10px;
    width: 100%;
    margin-right: 0 !important;
  }
  
  .detail-label {
    display: block;
    margin-bottom: 5px;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 20px;
  }
  
  .avatar,
  .avatar-placeholder {
    width: 100px;
    height: 100px;
  }
}
</style>