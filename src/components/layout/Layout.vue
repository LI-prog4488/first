<template>
  <el-container class="main-container">
    <!-- 侧边栏 -->
    <el-aside width="240px" class="sidebar">
      <div class="logo-container">
        <h2 class="logo-text">智慧园区能源系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        
        <el-sub-menu index="monitoring">
          <template #title>
            <el-icon><Monitor /></el-icon>
            <span>能耗监控</span>
          </template>
          <el-menu-item index="/realtime-monitoring">实时监控</el-menu-item>
          <el-menu-item index="/historical-query">历史查询</el-menu-item>
          <el-menu-item index="/energy-analysis">能耗分析</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="management">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/device-management">设备管理</el-menu-item>
          <el-menu-item index="/zone-management">区域管理</el-menu-item>
          <el-menu-item index="/enterprise-management">企业管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="alerts">
          <template #title>
            <el-icon><Warning /></el-icon>
            <span>预警中心</span>
          </template>
          <el-menu-item index="/alert-center">异常预警</el-menu-item>
          <el-menu-item index="/fault-handling">故障处理</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/system-settings" v-if="isAdmin">
          <el-icon><Tools /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
        
        <el-menu-item index="/help-center">
          <el-icon><HelpFilled /></el-icon>
          <span>帮助中心</span>
        </el-menu-item>
        
        <el-menu-item index="/personal-center">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button type="text" class="toggle-btn" @click="toggleSidebar">
            <el-icon><Menu /></el-icon>
          </el-button>
        </div>
        
        <div class="header-right">
          <el-dropdown>
            <el-button type="text" class="user-btn">
              <el-avatar size="small">{{ userInitial }}</el-avatar>
              <span class="username">{{ username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="navigateToPersonalCenter">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容区域 -->
      <el-main class="content">
        <!-- 简化的router-view，移除可能导致DOM操作问题的过渡组件 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import {
  HomeFilled, Monitor, Setting, Warning, Tools, HelpFilled, User, Menu, ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'

export default {
  name: 'Layout',
  components: {
    HomeFilled, Monitor, Setting, Warning, Tools, HelpFilled, User, Menu, ArrowDown,
    SwitchButton
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const sidebarCollapsed = ref(false)
    
    // 计算当前激活的菜单
    const activeMenu = computed(() => {
      const path = router.currentRoute.value.path
      return path
    })
    
    // 获取用户名首字母
    const userInitial = computed(() => {
      const name = userStore.username
      return name ? name.charAt(0).toUpperCase() : 'U'
    })
    
    // 切换侧边栏
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
    
    // 跳转到个人中心
    const navigateToPersonalCenter = () => {
      router.push('/personal-center')
    }
    
    // 退出登录
    const logout = () => {
      userStore.logout()
      router.push('/login')
    }
    
    return {
      activeMenu,
      username: computed(() => userStore.username),
      isAdmin: computed(() => userStore.isAdmin),
      userInitial,
      sidebarCollapsed,
      toggleSidebar,
      navigateToPersonalCenter,
      logout
    }
  }
}
</script>

<style scoped>
.main-container {
  height: 100vh;
}

.sidebar {
  height: 100vh;
  background-color: #001529;
  transition: all 0.3s;
}

.logo-container {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #1f2937;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  margin: 0;
  font-weight: 500;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-item {
  transition: all 0.3s;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-btn {
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.username {
  font-size: 14px;
}

.content {
  background-color: #f5f7fa;
  padding: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>