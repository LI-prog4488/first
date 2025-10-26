<template>
  <div class="real-time-monitoring">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>实时能耗监控</h1>
      <div class="header-actions">
        <el-button type="primary" size="small" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新数据
        </el-button>
        <el-dropdown @command="handleDataRange">
          <el-button type="default" size="small">
            数据显示周期
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="5min">5分钟</el-dropdown-item>
              <el-dropdown-item command="15min">15分钟</el-dropdown-item>
              <el-dropdown-item command="30min">30分钟</el-dropdown-item>
              <el-dropdown-item command="1hour">1小时</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 能耗类型选择 -->
    <div class="energy-type-selector">
      <el-tabs v-model="activeEnergyTab" type="card">
        <el-tab-pane label="电力" name="electricity">
          <div class="energy-type-content">
            <div class="current-data">
              <div class="data-value">{{ energyData.electricity.currentValue }} kW</div>
              <div class="data-info">
                <span class="data-label">当前功率</span>
                <span class="data-change" :class="{ positive: energyData.electricity.change > 0, negative: energyData.electricity.change < 0 }">
                  <el-icon v-if="energyData.electricity.change > 0"><ArrowUp /></el-icon>
                  <el-icon v-else-if="energyData.electricity.change < 0"><ArrowDown /></el-icon>
                  {{ Math.abs(energyData.electricity.change) }}%
                </span>
              </div>
            </div>
            <div class="data-limit">
              <div class="limit-label">今日限额：{{ energyData.electricity.dailyLimit }} kWh</div>
              <div class="progress-container">
                <el-progress 
                  :percentage="energyData.electricity.dailyUsagePercentage" 
                  :color="getProgressColor(energyData.electricity.dailyUsagePercentage)"
                ></el-progress>
                <span class="usage-text">{{ energyData.electricity.dailyUsage }} kWh / {{ energyData.electricity.dailyLimit }} kWh</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="水" name="water">
          <div class="energy-type-content">
            <div class="current-data">
              <div class="data-value">{{ energyData.water.currentValue }} m³/h</div>
              <div class="data-info">
                <span class="data-label">当前流量</span>
                <span class="data-change" :class="{ positive: energyData.water.change > 0, negative: energyData.water.change < 0 }">
                  <el-icon v-if="energyData.water.change > 0"><ArrowUp /></el-icon>
                  <el-icon v-else-if="energyData.water.change < 0"><ArrowDown /></el-icon>
                  {{ Math.abs(energyData.water.change) }}%
                </span>
              </div>
            </div>
            <div class="data-limit">
              <div class="limit-label">今日限额：{{ energyData.water.dailyLimit }} m³</div>
              <div class="progress-container">
                <el-progress 
                  :percentage="energyData.water.dailyUsagePercentage" 
                  :color="getProgressColor(energyData.water.dailyUsagePercentage)"
                ></el-progress>
                <span class="usage-text">{{ energyData.water.dailyUsage }} m³ / {{ energyData.water.dailyLimit }} m³</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="燃气" name="gas">
          <div class="energy-type-content">
            <div class="current-data">
              <div class="data-value">{{ energyData.gas.currentValue }} m³/h</div>
              <div class="data-info">
                <span class="data-label">当前流量</span>
                <span class="data-change" :class="{ positive: energyData.gas.change > 0, negative: energyData.gas.change < 0 }">
                  <el-icon v-if="energyData.gas.change > 0"><ArrowUp /></el-icon>
                  <el-icon v-else-if="energyData.gas.change < 0"><ArrowDown /></el-icon>
                  {{ Math.abs(energyData.gas.change) }}%
                </span>
              </div>
            </div>
            <div class="data-limit">
              <div class="limit-label">今日限额：{{ energyData.gas.dailyLimit }} m³</div>
              <div class="progress-container">
                <el-progress 
                  :percentage="energyData.gas.dailyUsagePercentage" 
                  :color="getProgressColor(energyData.gas.dailyUsagePercentage)"
                ></el-progress>
                <span class="usage-text">{{ energyData.gas.dailyUsage }} m³ / {{ energyData.gas.dailyLimit }} m³</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="热力" name="heat">
          <div class="energy-type-content">
            <div class="current-data">
              <div class="data-value">{{ energyData.heat.currentValue }} GJ/h</div>
              <div class="data-info">
                <span class="data-label">当前流量</span>
                <span class="data-change" :class="{ positive: energyData.heat.change > 0, negative: energyData.heat.change < 0 }">
                  <el-icon v-if="energyData.heat.change > 0"><ArrowUp /></el-icon>
                  <el-icon v-else-if="energyData.heat.change < 0"><ArrowDown /></el-icon>
                  {{ Math.abs(energyData.heat.change) }}%
                </span>
              </div>
            </div>
            <div class="data-limit">
              <div class="limit-label">今日限额：{{ energyData.heat.dailyLimit }} GJ</div>
              <div class="progress-container">
                <el-progress 
                  :percentage="energyData.heat.dailyUsagePercentage" 
                  :color="getProgressColor(energyData.heat.dailyUsagePercentage)"
                ></el-progress>
                <span class="usage-text">{{ energyData.heat.dailyUsage }} GJ / {{ energyData.heat.dailyLimit }} GJ</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 数据展示区域 -->
    <div class="monitoring-content">
      <!-- 左侧：区域选择和监控图表 -->
      <div class="chart-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ getEnergyName(activeEnergyTab) }}监控趋势</span>
              <el-select v-model="selectedZone" placeholder="选择区域" size="small">
                <el-option label="全部区域" value="all"></el-option>
                <el-option v-for="zone in zones" :key="zone.id" :label="zone.name" :value="zone.id"></el-option>
              </el-select>
            </div>
          </template>
          <div id="energyTrendChart" ref="energyTrendChartRef" class="chart"></div>
        </el-card>
      </div>
      
      <!-- 右侧：区域列表和设备状态 -->
      <div class="zone-section">
        <!-- 区域列表 -->
        <el-card class="zone-list-card">
          <template #header>
            <div class="card-header">
              <span>区域能耗排名</span>
            </div>
          </template>
          <div class="zone-list">
            <div 
              v-for="zone in sortedZones" 
              :key="zone.id" 
              class="zone-item"
              :class="{ active: selectedZone === zone.id }"
              @click="selectedZone = zone.id"
            >
              <div class="zone-rank">{{ zone.rank }}</div>
              <div class="zone-info">
                <div class="zone-name">{{ zone.name }}</div>
                <div class="zone-value">
                  {{ zone[getEnergyField(activeEnergyTab)] }} {{ getEnergyUnit(activeEnergyTab) }}
                </div>
              </div>
              <div class="zone-trend" :class="{ positive: zone.trend > 0, negative: zone.trend < 0 }">
                <el-icon v-if="zone.trend > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="zone.trend < 0"><ArrowDown /></el-icon>
                <el-icon v-else><Minus /></el-icon>
                {{ Math.abs(zone.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 设备状态 -->
        <el-card class="device-status-card">
          <template #header>
            <div class="card-header">
              <span>关键设备状态</span>
              <el-link type="primary" :underline="false" size="small" @click="navigateToDeviceManagement">
                查看全部
              </el-link>
            </div>
          </template>
          <div class="device-status-list">
            <div 
              v-for="device in keyDevices" 
              :key="device.id" 
              class="device-item"
              :class="{ 'device-online': device.status === 'online', 'device-offline': device.status === 'offline', 'device-fault': device.status === 'fault' }"
            >
              <div class="device-icon">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="device-info">
                <div class="device-name">{{ device.name }}</div>
                <div class="device-location">{{ device.location }}</div>
              </div>
              <div class="device-status-badge">
                <el-tag :type="getStatusType(device.status)">{{ getStatusText(device.status) }}</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  Refresh, ArrowDown, ArrowUp, Minus, Cpu
} from '@element-plus/icons-vue'

export default {
  name: 'RealTimeMonitoring',
  components: {
    Refresh, ArrowDown, ArrowUp, Minus, Cpu
  },
  setup() {
    const router = useRouter()
    const activeEnergyTab = ref('electricity')
    const selectedZone = ref('all')
    const dataRange = ref('5min')
    const energyTrendChartRef = ref(null)
    let energyTrendChart = null
    let dataUpdateInterval = null
    
    // 模拟能源数据
    const energyData = reactive({
      electricity: {
        currentValue: 1250,
        change: 5.2,
        dailyUsage: 8250,
        dailyLimit: 12000,
        dailyUsagePercentage: 68.75
      },
      water: {
        currentValue: 8.6,
        change: -2.1,
        dailyUsage: 185,
        dailyLimit: 240,
        dailyUsagePercentage: 77.08
      },
      gas: {
        currentValue: 4.2,
        change: 3.7,
        dailyUsage: 92,
        dailyLimit: 120,
        dailyUsagePercentage: 76.67
      },
      heat: {
        currentValue: 1.58,
        change: 0.8,
        dailyUsage: 32,
        dailyLimit: 45,
        dailyUsagePercentage: 71.11
      }
    })
    
    // 模拟区域数据
    const zones = reactive([
      { id: 'a', name: 'A栋', electricity: 420, water: 3.2, gas: 1.5, heat: 0.6, trend: 2.1 },
      { id: 'b', name: 'B栋', electricity: 380, water: 2.8, gas: 1.3, heat: 0.5, trend: -1.2 },
      { id: 'c', name: 'C栋', electricity: 290, water: 2.1, gas: 0.9, heat: 0.4, trend: 3.5 },
      { id: 'd', name: 'D栋', electricity: 160, water: 0.5, gas: 0.5, heat: 0.08, trend: 0 },
      { id: 'parking', name: '停车场', electricity: 150, water: 0, gas: 0, heat: 0, trend: 1.8 }
    ])
    
    // 模拟关键设备数据
    const keyDevices = reactive([
      { id: 'meter-001', name: '总电表', location: '配电房', status: 'online' },
      { id: 'meter-002', name: 'A栋电表', location: 'A栋1楼', status: 'online' },
      { id: 'meter-003', name: 'B栋电表', location: 'B栋1楼', status: 'fault' },
      { id: 'water-001', name: '总水表', location: '水泵房', status: 'online' },
      { id: 'gas-001', name: '燃气表', location: 'C栋地下室', status: 'offline' }
    ])
    
    // 排序后的区域列表
    const sortedZones = computed(() => {
      const field = getEnergyField(activeEnergyTab.value)
      return zones
        .slice()
        .sort((a, b) => b[field] - a[field])
        .map((zone, index) => ({ ...zone, rank: index + 1 }))
    })
    
    // 获取能源名称
    const getEnergyName = (type) => {
      const map = {
        electricity: '电力',
        water: '水',
        gas: '燃气',
        heat: '热力'
      }
      return map[type] || type
    }
    
    // 获取能源字段名
    const getEnergyField = (type) => type
    
    // 获取能源单位
    const getEnergyUnit = (type) => {
      const map = {
        electricity: 'kW',
        water: 'm³/h',
        gas: 'm³/h',
        heat: 'GJ/h'
      }
      return map[type] || ''
    }
    
    // 获取进度条颜色
    const getProgressColor = (percentage) => {
      if (percentage >= 90) return '#F56C6C'
      if (percentage >= 70) return '#E6A23C'
      return '#67C23A'
    }
    
    // 获取设备状态类型
    const getStatusType = (status) => {
      const map = {
        online: 'success',
        offline: 'info',
        fault: 'danger'
      }
      return map[status] || 'warning'
    }
    
    // 获取设备状态文本
    const getStatusText = (status) => {
      const map = {
        online: '在线',
        offline: '离线',
        fault: '故障'
      }
      return map[status] || '未知'
    }
    
    // 处理数据显示周期
    const handleDataRange = (range) => {
      dataRange.value = range
      updateChart()
    }
    
    // 刷新数据
    const refreshData = () => {
      // 模拟刷新数据
      updateChart()
    }
    
    // 跳转到设备管理页面
    const navigateToDeviceManagement = () => {
      router.push('/device-management')
    }
    
    // 初始化趋势图表
    const initChart = () => {
      if (!energyTrendChartRef.value) return
      
      energyTrendChart = echarts.init(energyTrendChartRef.value)
      updateChart()
    }
    
    // 更新图表
    const updateChart = () => {
      if (!energyTrendChart) return
      
      // 根据数据周期生成时间点
      const points = getDataPointsCount()
      const times = []
      const now = new Date()
      const interval = getDataIntervalMinutes()
      
      for (let i = points - 1; i >= 0; i--) {
        const time = new Date(now - i * interval * 60 * 1000)
        times.push(`${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`)
      }
      
      // 生成模拟数据
      const data = generateMockData(points)
      
      const colorMap = {
        electricity: '#36cfc9',
        water: '#409EFF',
        gas: '#E6A23C',
        heat: '#F56C6C'
      }
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const data = params[0]
            return `${data.axisValue}<br/>${getEnergyName(activeEnergyTab.value)}: ${data.value} ${getEnergyUnit(activeEnergyTab.value)}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: times
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: getEnergyName(activeEnergyTab.value),
            type: 'line',
            data: data,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: colorMap[activeEnergyTab.value],
              width: 3
            },
            itemStyle: {
              color: colorMap[activeEnergyTab.value],
              borderWidth: 2,
              borderColor: '#fff'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: colorMap[activeEnergyTab.value]
                },
                {
                  offset: 1,
                  color: 'rgba(255, 255, 255, 0.1)'
                }
              ])
            }
          }
        ]
      }
      
      energyTrendChart.setOption(option)
    }
    
    // 获取数据点数量
    const getDataPointsCount = () => {
      const map = {
        '5min': 12,
        '15min': 16,
        '30min': 16,
        '1hour': 12
      }
      return map[dataRange.value] || 12
    }
    
    // 获取数据间隔分钟数
    const getDataIntervalMinutes = () => {
      const map = {
        '5min': 5,
        '15min': 15,
        '30min': 30,
        '1hour': 60
      }
      return map[dataRange.value] || 5
    }
    
    // 生成模拟数据
    const generateMockData = (points) => {
      const baseValue = energyData[activeEnergyTab.value].currentValue
      const variance = baseValue * 0.1 // 10% 的波动
      const data = []
      
      for (let i = 0; i < points; i++) {
        data.push(baseValue + (Math.random() - 0.5) * variance)
      }
      
      return data
    }
    
    // 响应窗口大小变化
    const handleResize = () => {
      if (energyTrendChart) {
        energyTrendChart.resize()
      }
    }
    
    // 监听能源类型变化
    watch(activeEnergyTab, () => {
      updateChart()
    })
    
    // 监听区域选择变化
    watch(selectedZone, () => {
      updateChart()
    })
    
    onMounted(async () => {
      await nextTick()
      initChart()
      window.addEventListener('resize', handleResize)
      
      // 模拟实时数据更新
      dataUpdateInterval = setInterval(() => {
        const currentType = activeEnergyTab.value
        const currentData = energyData[currentType]
        
        // 模拟小幅波动
        const variation = (Math.random() - 0.5) * currentData.currentValue * 0.05
        currentData.currentValue = Math.max(0, currentData.currentValue + variation)
        
        // 更新图表
        updateChart()
      }, 10000) // 每10秒更新一次
    })
    
    onUnmounted(() => {
      if (energyTrendChart) {
        energyTrendChart.dispose()
      }
      if (dataUpdateInterval) {
        clearInterval(dataUpdateInterval)
      }
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      activeEnergyTab,
      selectedZone,
      energyTrendChartRef,
      energyData,
      zones,
      sortedZones,
      keyDevices,
      getEnergyName,
      getEnergyField,
      getEnergyUnit,
      getProgressColor,
      getStatusType,
      getStatusText,
      handleDataRange,
      refreshData,
      navigateToDeviceManagement
    }
  }
}
</script>

<style scoped>
.real-time-monitoring {
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

/* 能源类型选择 */
.energy-type-selector {
  margin-bottom: 20px;
}

.energy-type-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.current-data {
  flex: 1;
}

.data-value {
  font-size: 48px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.data-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.data-label {
  font-size: 14px;
  color: #666;
}

.data-change {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.data-change.positive { color: #F56C6C; }
.data-change.negative { color: #67C23A; }

.data-limit {
  flex: 1;
  max-width: 400px;
}

.limit-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.progress-container {
  position: relative;
}

.usage-text {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 12px;
  color: #999;
}

/* 监控内容区域 */
.monitoring-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-section .el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-section .el-card__body {
  flex: 1;
  padding: 0;
  padding-top: 20px;
}

.chart {
  width: 100%;
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

/* 区域列表 */
.zone-list-card {
  margin-bottom: 20px;
}

.zone-list {
  max-height: 300px;
  overflow-y: auto;
}

.zone-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
}

.zone-item:hover {
  background-color: #f5f7fa;
}

.zone-item.active {
  background-color: #ecf5ff;
  border-left: 3px solid #409EFF;
}

.zone-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #409EFF;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
}

.zone-item:nth-child(1) .zone-rank { background-color: #F56C6C; }
.zone-item:nth-child(2) .zone-rank { background-color: #E6A23C; }
.zone-item:nth-child(3) .zone-rank { background-color: #67C23A; }

.zone-info {
  flex: 1;
}

.zone-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.zone-value {
  font-size: 12px;
  color: #666;
}

.zone-trend {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.zone-trend.positive { color: #F56C6C; }
.zone-trend.negative { color: #67C23A; }

/* 设备状态 */
.device-status-card {
  margin-bottom: 20px;
}

.device-status-list {
  max-height: 250px;
  overflow-y: auto;
}

.device-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.device-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.device-online {
  background-color: #f0f9eb;
  border-left: 3px solid #67C23A;
}

.device-offline {
  background-color: #f4f4f5;
  border-left: 3px solid #909399;
}

.device-fault {
  background-color: #fef0f0;
  border-left: 3px solid #F56C6C;
}

.device-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
  color: #409EFF;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.device-location {
  font-size: 12px;
  color: #666;
}

/* 响应式 */
@media (max-width: 1200px) {
  .monitoring-content {
    grid-template-columns: 1fr;
  }
  
  .energy-type-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .data-limit {
    max-width: 100%;
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
    justify-content: space-between;
  }
  
  .data-value {
    font-size: 36px;
  }
}
</style>