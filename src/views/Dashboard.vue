<template>
  <div class="dashboard-container">
    <!-- 页面标题区 -->
    <div class="page-header">
      <h1>智慧园区管理平台</h1>
      <div class="header-info">
        <span class="current-time">{{ currentTime }}</span>
        <el-badge :value="alertCount" class="alert-badge" @click="navigateTo('/alert-center')">
          <el-icon><Bell /></el-icon>
        </el-badge>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="overview-cards">
      <el-card class="stat-card electricity-card">
        <div class="stat-content">
          <el-icon class="stat-icon"><Timer /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ realTimeData.electricity }}</div>
            <div class="stat-label">实时用电量</div>
            <div :class="['stat-change', electricityChange > 0 ? 'positive' : 'negative']">
              <el-icon v-if="electricityChange > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              {{ Math.abs(electricityChange) }}%
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card water-card">
        <div class="stat-content">
          <el-icon class="stat-icon"><Document /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ realTimeData.water }}</div>
            <div class="stat-label">实时用水量</div>
            <div :class="['stat-change', waterChange > 0 ? 'positive' : 'negative']">
              <el-icon v-if="waterChange > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              {{ Math.abs(waterChange) }}%
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card gas-card">
        <div class="stat-content">
          <el-icon class="stat-icon"><Fire /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ realTimeData.gas }}</div>
            <div class="stat-label">实时用气量</div>
            <div :class="['stat-change', gasChange > 0 ? 'positive' : 'negative']">
              <el-icon v-if="gasChange > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              {{ Math.abs(gasChange) }}%
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card heat-card">
        <div class="stat-content">
          <el-icon class="stat-icon"><Heat /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ realTimeData.heat }}</div>
            <div class="stat-label">实时用热量</div>
            <div :class="['stat-change', heatChange > 0 ? 'positive' : 'negative']">
              <el-icon v-if="heatChange > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              {{ Math.abs(heatChange) }}%
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-access">
      <el-card class="quick-card" @click="navigateTo('/monitoring')">
        <div class="quick-icon monitor-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <div class="quick-text">实时监控</div>
      </el-card>
      
      <el-card class="quick-card" @click="navigateTo('/alert-center')">
        <div class="quick-icon alert-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="quick-text">异常预警</div>
      </el-card>
      
      <el-card class="quick-card" @click="navigateTo('/device-management')">
        <div class="quick-icon device-icon">
          <el-icon><Cpu /></el-icon>
        </div>
        <div class="quick-text">设备管理</div>
      </el-card>
      
      <el-card class="quick-card" @click="navigateTo('/energy-analysis')">
        <div class="quick-icon analysis-icon">
          <el-icon><DataAnalysis /></el-icon>
        </div>
        <div class="quick-text">能耗分析</div>
      </el-card>
    </div>

    <!-- 图表区域 - 简化版本 -->
    <div class="charts-container">
      <el-card class="chart-card">
        <div class="card-header">
          <span>能耗总览</span>
        </div>
        <div class="chart-content">
          <div class="energy-summary">
            <div class="energy-item" v-for="type in energyType" :key="type">
              <div class="energy-label">{{ getEnergyName(type) }}</div>
              <div class="energy-value">{{ realTimeData[type] }}</div>
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <div class="card-header">
          <span>能耗趋势</span>
          <el-select v-model="chartEnergyType" size="small" @change="handleEnergyTypeChange">
            <el-option label="用电量" value="electricity" />
            <el-option label="用水量" value="water" />
            <el-option label="用气量" value="gas" />
            <el-option label="用热量" value="heat" />
          </el-select>
        </div>
        <div class="chart-content">
          <div class="trend-summary">
            <div class="trend-title">{{ getEnergyName(chartEnergyType) }}趋势</div>
            <div class="trend-value">当前: {{ realTimeData[chartEnergyType] }}</div>
            <div class="trend-change">
              变化率: {{ chartEnergyType === 'electricity' ? electricityChange : 
                       chartEnergyType === 'water' ? waterChange : 
                       chartEnergyType === 'gas' ? gasChange : heatChange }}%
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 底部信息卡片 -->
    <div class="bottom-cards">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>设备状态</span>
          </div>
        </template>
        <div class="device-status">
          <div class="status-item">
            <div class="status-label">在线设备</div>
            <div class="status-value online">{{ deviceStatus.online }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">离线设备</div>
            <div class="status-value offline">{{ deviceStatus.offline }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">故障设备</div>
            <div class="status-value fault">{{ deviceStatus.fault }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">设备总数</div>
            <div class="status-value">{{ deviceStatus.total }}</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>最新预警</span>
            <el-button type="text" size="small" @click="navigateTo('/alert-center')">查看全部</el-button>
          </div>
        </template>
        <div class="alert-list">
          <div v-if="recentAlerts.length > 0">
            <div v-for="alert in recentAlerts" :key="alert.id" class="alert-item">
              <div :class="['alert-icon', alert.level]">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="alert-info">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-time">{{ formatTime(alert.time) }}</div>
              </div>
              <div :class="['alert-status', alert.status]">{{ getAlertStatusText(alert.status) }}</div>
            </div>
          </div>
          <div v-else class="no-alerts">暂无预警信息</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Bell, Timer, Document, Bell as Fire, Calendar as Heat,
  Monitor, Warning, Cpu, DataAnalysis,
  ArrowUp, ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()

// 当前时间
const currentTime = ref('')
let timeInterval = null

// 实时数据
const realTimeData = ref({
  electricity: '1,258.6 kWh',
  water: '96.2 m³',
  gas: '45.8 m³',
  heat: '18.3 GJ'
})

// 变化率
const electricityChange = ref(8.2)
const waterChange = ref(-3.5)
const gasChange = ref(5.1)
const heatChange = ref(2.3)

// 设备状态
const deviceStatus = ref({
  online: 126,
  offline: 8,
  fault: 3,
  total: 137
})

// 统计数据
const statistics = ref({
  totalEnergy: '1,418.9',
  totalCost: '¥ 7,582.3'
})

// 预警数据
const recentAlerts = ref([
  {
    id: 1,
    title: '3号楼配电房电流异常',
    time: Date.now() - 1000 * 60 * 30,
    level: 'high',
    status: 'pending'
  },
  {
    id: 2,
    title: '地下停车场用水异常',
    time: Date.now() - 1000 * 60 * 60 * 2,
    level: 'medium',
    status: 'processing'
  },
  {
    id: 3,
    title: '办公楼新风系统滤网需要更换',
    time: Date.now() - 1000 * 60 * 60 * 24,
    level: 'low',
    status: 'completed'
  }
])

const alertCount = ref(2)

// 能源类型
const energyType = ref(['electricity', 'water', 'gas', 'heat'])
const chartEnergyType = ref('electricity')

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = formatTime(now.getTime())
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取能源名称
const getEnergyName = (type) => {
  const map = {
    electricity: '用电量',
    water: '用水量',
    gas: '用气量',
    heat: '用热量'
  }
  return map[type] || type
}

// 获取预警状态文本
const getAlertStatusText = (status) => {
  const map = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  }
  return map[status] || status
}

// 导航跳转
const navigateTo = (path) => {
  try {
    router.push(path)
  } catch (error) {
    console.error('导航失败:', error)
  }
}

// 处理能源类型切换
const handleEnergyTypeChange = () => {
  // 简化版本，不需要重新渲染图表
  console.log('切换到能源类型:', chartEnergyType.value)
}

// 生命周期钩子
onMounted(() => {
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.dashboard-container {
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

.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.current-time {
  font-size: 14px;
  color: #666;
}

.alert-badge {
  cursor: pointer;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.electricity-card { background: linear-gradient(135deg, #36cfc9 0%, #35a99c 100%); }
.water-card { background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%); }
.gas-card { background: linear-gradient(135deg, #E6A23C 0%, #d38b25 100%); }
.heat-card { background: linear-gradient(135deg, #F56C6C 0%, #da5050 100%); }

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #fff;
}

.stat-icon {
  font-size: 40px;
  opacity: 0.8;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive { color: #f0f9eb; }
.stat-change.negative { color: #fef0f0; }

/* 快捷入口 */
.quick-access {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.quick-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.quick-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: #409EFF;
}

.quick-icon {
  font-size: 48px;
  margin-bottom: 12px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitor-icon { color: #409EFF; }
.alert-icon { color: #F56C6C; }
.device-icon { color: #E6A23C; }
.analysis-icon { color: #67C23A; }

.quick-text {
  font-size: 16px;
  color: #333;
}

/* 图表区域 */
.charts-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  border-radius: 8px;
  height: 350px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chart-content {
  height: calc(100% - 60px);
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 简化的图表内容 */
.energy-summary {
  width: 100%;
  padding: 20px;
}

.energy-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.energy-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.energy-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.trend-summary {
  width: 100%;
  text-align: center;
  padding: 20px;
}

.trend-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.trend-value {
  font-size: 36px;
  font-weight: 700;
  color: #409EFF;
  margin-bottom: 10px;
}

.trend-change {
  font-size: 16px;
  color: #666;
}

/* 底部信息卡片 */
.bottom-cards {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.info-card {
  border-radius: 8px;
}

/* 设备状态 */
.device-status {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  text-align: center;
}

.status-item {
  padding: 10px;
}

.status-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.status-value {
  font-size: 24px;
  font-weight: 600;
}

.status-value.online { color: #67C23A; }
.status-value.offline { color: #909399; }
.status-value.fault { color: #F56C6C; }

/* 预警列表 */
.alert-list {
  max-height: 250px;
  overflow-y: auto;
}

.no-alerts {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #fff;
}

.alert-icon.high { background-color: #F56C6C; }
.alert-icon.medium { background-color: #E6A23C; }
.alert-icon.low { background-color: #67C23A; }

.alert-info {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 12px;
  color: #999;
}

.alert-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.alert-status.pending { background-color: #fef0f0; color: #f56c6c; }
.alert-status.processing { background-color: #fdf6ec; color: #e6a23c; }
.alert-status.completed { background-color: #f0f9eb; color: #67c23a; }
</style>