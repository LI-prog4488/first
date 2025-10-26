import { defineStore } from 'pinia'

export const useEnergyStore = defineStore('energy', {
  state: () => ({
    // 实时能耗数据
    realTimeData: {
      electricity: 0,
      water: 0,
      gas: 0,
      heat: 0
    },
    
    // 今日/本月能耗趋势
    energyTrends: {
      today: [],
      month: []
    },
    
    // 区域能耗数据
    zoneData: [],
    
    // 设备状态
    deviceStatus: [],
    
    // 预警信息
    alerts: [],
    
    // 历史数据查询结果
    historicalData: [],
    
    // 统计概览
    statistics: {
      totalEnergy: 0,
      alertCount: 0,
      onlineRate: 0
    }
  }),
  
  actions: {
    // 更新实时数据
    updateRealTimeData(data) {
      this.realTimeData = { ...this.realTimeData, ...data }
    },
    
    // 设置能耗趋势
    setEnergyTrends(type, data) {
      if (this.energyTrends[type]) {
        this.energyTrends[type] = data
      }
    },
    
    // 设置区域数据
    setZoneData(data) {
      this.zoneData = data
    },
    
    // 更新设备状态
    updateDeviceStatus(status) {
      this.deviceStatus = status
    },
    
    // 添加预警
    addAlert(alert) {
      this.alerts.unshift(alert)
    },
    
    // 更新预警状态
    updateAlertStatus(alertId, status) {
      const alert = this.alerts.find(a => a.id === alertId)
      if (alert) {
        alert.status = status
      }
    },
    
    // 设置历史数据
    setHistoricalData(data) {
      this.historicalData = data
    },
    
    // 更新统计信息
    updateStatistics(stats) {
      this.statistics = { ...this.statistics, ...stats }
    }
  }
})