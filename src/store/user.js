import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem('token') || '',
    permissions: []
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo && state.userInfo.role === 'admin',
    username: (state) => state.userInfo?.username || ''
  },
  
  actions: {
    login(userData, token) {
      this.userInfo = userData
      this.token = token
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(userData))
    },
    
    logout() {
      this.userInfo = null
      this.token = ''
      this.permissions = []
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },
    
    setPermissions(permissions) {
      this.permissions = permissions
    },
    
    updateUserInfo(info) {
      this.userInfo = { ...this.userInfo, ...info }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    }
  }
})