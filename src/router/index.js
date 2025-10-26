import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/dashboard',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      }
    ]
  },
  {
    path: '/realtime-monitoring',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'RealTimeMonitoring',
        component: () => import('@/views/RealTimeMonitoring.vue')
      }
    ]
  },
  {
    path: '/historical-query',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'HistoricalQuery',
        component: () => import('@/views/HistoricalQuery.vue')
      }
    ]
  },
  {
    path: '/energy-analysis',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'EnergyAnalysisReport',
        component: () => import('@/views/EnergyAnalysisReport.vue')
      }
    ]
  },
  {
    path: '/device-management',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DeviceManagement',
        component: () => import('@/views/DeviceManagement.vue')
      }
    ]
  },
  {
    path: '/zone-management',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'ZoneManagement',
        component: () => import('@/views/ZoneManagement.vue')
      }
    ]
  },
  {
    path: '/enterprise-management',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'EnterpriseManagement',
        component: () => import('@/views/EnterpriseManagement.vue')
      }
    ]
  },
  {
    path: '/alert-center',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AlertCenter',
        component: () => import('@/views/AlertCenter.vue')
      }
    ]
  },
  { path: '/fault-handling', component: Layout, meta: { requiresAuth: true }, children: [
        { path: '', name: 'FaultHandlingRecords', component: () => import('@/views/FaultHandlingRecords.vue') }
      ]
    },
  {
    path: '/system-settings',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'SystemSettings',
        component: () => import('@/views/SystemSettings.vue')
      }
    ]
  },
  {
    path: '/help-center',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'HelpCenter',
        component: () => import('@/views/HelpCenter.vue')
      }
    ]
  },
  {
    path: '/personal-center',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'PersonalCenter',
        component: () => import('@/views/PersonalCenter.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 简化的路由守卫
router.beforeEach((to, from, next) => {
  // 直接检查登录状态 - 非常简单直接的逻辑
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const hasToken = !!localStorage.getItem('token')
  
  // 打印详细的调试信息
  console.log('==== 路由守卫检查 ====')
  console.log('目标路径:', to.path)
  console.log('需要认证:', to.matched.some(record => record.meta.requiresAuth))
  console.log('登录状态:', isLoggedIn)
  console.log('Token存在:', hasToken)
  
  // 登录页面总是允许访问
  if (to.path === '/login') {
    next()
    return
  }
  
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // 如果需要认证且未登录，重定向到登录页
  if (requiresAuth && (!isLoggedIn || !hasToken)) {
    console.log('未登录，重定向到登录页')
    next('/login')
  } else {
    // 已登录或不需要认证，继续访问
    console.log('已登录或不需要认证，继续访问')
    next()
  }
})

export default router