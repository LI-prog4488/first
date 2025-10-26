<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <div class="logo-area">
        <h1 class="logo-title">注册账号</h1>
        <p class="logo-subtitle">加入智慧园区能源管理系统</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        class="register-form"
      >
        <!-- 企业信息 -->
        <el-form-item label="企业名称" prop="companyName">
          <el-input
            v-model="registerForm.companyName"
            placeholder="请输入企业名称"
          ></el-input>
        </el-form-item>
        
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        
        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
          >
            <template #append>
              <el-button
                :disabled="countdown > 0"
                type="text"
                @click="sendVerificationCode"
              >
                {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        
        <!-- 验证码 -->
        <el-form-item label="验证码" prop="smsCode">
          <el-input
            v-model="registerForm.smsCode"
            placeholder="请输入验证码"
          ></el-input>
        </el-form-item>
        
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（6-20位字母、数字或符号）"
            show-password
          ></el-input>
        </el-form-item>
        
        <!-- 确认密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          ></el-input>
        </el-form-item>
        
        <!-- 角色选择 -->
        <el-form-item label="用户角色" prop="role">
          <el-radio-group v-model="registerForm.role">
            <el-radio-button label="enterprise">企业用户</el-radio-button>
            <el-radio-button label="operator">运维人员</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <!-- 同意协议 -->
        <el-form-item>
          <el-checkbox v-model="registerForm.agreed">
            我已阅读并同意
            <el-link type="primary">《用户协议》</el-link>
            和
            <el-link type="primary">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>
        
        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        
        <!-- 登录链接 -->
        <div class="login-link">
          <span>已有账号？</span>
          <el-link type="primary" :underline="false" @click="toLogin">
            立即登录
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const registerFormRef = ref(null)
    const loading = ref(false)
    const countdown = ref(0)
    let timer = null
    
    const registerForm = reactive({
      companyName: '',
      username: '',
      phone: '',
      smsCode: '',
      password: '',
      confirmPassword: '',
      role: 'enterprise',
      agreed: false
    })
    
    const rules = {
      companyName: [
        { required: true, message: '请输入企业名称', trigger: 'blur' }
      ],
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ],
      smsCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { pattern: /^\d{6}$/, message: '请输入6位验证码', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== registerForm.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ],
      role: [
        { required: true, message: '请选择用户角色', trigger: 'change' }
      ],
      agreed: [
        { required: true, message: '请阅读并同意用户协议和隐私政策', trigger: 'change' }
      ]
    }
    
    // 发送验证码
    const sendVerificationCode = () => {
      if (!registerForm.phone) {
        ElMessage.warning('请输入手机号')
        return
      }
      
      // 验证手机号格式
      const phoneRule = /^1[3-9]\d{9}$/
      if (!phoneRule.test(registerForm.phone)) {
        ElMessage.warning('请输入正确的手机号')
        return
      }
      
      // 模拟发送验证码
      ElMessage.success('验证码已发送')
      
      // 倒计时
      countdown.value = 60
      timer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--
        } else {
          clearInterval(timer)
        }
      }, 1000)
    }
    
    // 跳转到登录页面
    const toLogin = () => {
      router.push('/login')
    }
    
    // 处理注册
    const handleRegister = async () => {
      if (!registerFormRef.value) return
      
      await registerFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          
          try {
            // 模拟注册请求
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            // 模拟注册成功
            ElMessage.success('注册成功！即将跳转到登录页面')
            
            // 延迟跳转到登录页面
            setTimeout(() => {
              router.push('/login')
            }, 1500)
          } catch (error) {
            ElMessage.error('注册失败，请稍后重试')
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    return {
      registerFormRef,
      registerForm,
      rules,
      loading,
      countdown,
      sendVerificationCode,
      toLogin,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-form-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 560px;
}

.logo-area {
  text-align: center;
  margin-bottom: 30px;
}

.logo-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.logo-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.register-form {
  width: 100%;
}

.register-form .el-form-item {
  margin-bottom: 20px;
}

.register-btn {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link a {
  margin-left: 5px;
}
</style>