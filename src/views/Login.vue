<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-header">
        <h1>智慧园区管理系统</h1>
        <p>登录入口</p>
      </div>
      
      <div class="login-form">
        <div class="form-group">
          <label>账号</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入账号"
            class="form-input"
            @keyup.enter="login"
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="请输入密码"
            class="form-input"
            @keyup.enter="login"
          />
        </div>
        
        <div class="form-group">
          <label>角色</label>
          <select v-model="role" class="form-input">
            <option value="admin">管理员</option>
            <option value="enterprise">企业用户</option>
            <option value="operator">运维人员</option>
          </select>
        </div>
        
        <button 
          class="login-btn" 
          @click="login"
          :disabled="isLoading"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
        
        <div class="login-tips">
          <p>提示：使用以下账号登录</p>
          <p>• 管理员：admin / 123456</p>
          <p>• 企业用户：enterprise / 123456</p>
          <p>• 运维人员：operator / 123456</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'

// 获取用户store实例
const userStore = useUserStore()

// 简单的响应式数据
const username = ref('')
const password = ref('')
const role = ref('admin')
const isLoading = ref(false)

// 登录处理函数
const login = async () => {
  // 清除所有旧的登录信息
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('isLoggedIn')
  
  // 简单验证
  if (!username.value || !password.value) {
    alert('请输入账号和密码')
    return
  }
  
  isLoading.value = true
  
  try {
    // 验证默认账号（账号名必须与角色一致）
    const validAccounts = {
      admin: '123456',
      enterprise: '123456',
      operator: '123456'
    }
    
    if (password.value === '123456' && validAccounts[username.value]) {
      // 确保角色选择正确
      const actualRole = username.value
      role.value = actualRole
      
      // 生成token
      const token = 'smart_park_token_' + Date.now()
      const userInfo = {
        username: username.value,
        role: actualRole,
        loginTime: new Date().toISOString()
      }
      
      console.log('登录成功，更新userStore')
      // 调用userStore的login方法，确保store状态更新
      userStore.login(userInfo, token)
      
      // 同时设置isLoggedIn标志
      localStorage.setItem('isLoggedIn', 'true')
      
      console.log('登录成功，正在跳转...')
      
      // 使用router.push进行跳转，避免页面完全刷新
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 100)
    } else {
      alert('账号或密码错误，请使用默认账号登录')
    }
  } catch (error) {
    console.error('登录错误:', error)
    alert('登录失败，请重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.login-box {
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  text-align: center;
  padding: 40px 20px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.login-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-tips {
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.login-tips p {
  margin: 6px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.login-tips p:first-child {
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}
</style>