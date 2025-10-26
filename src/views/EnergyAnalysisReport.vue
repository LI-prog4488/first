<template>
  <div class="energy-analysis-report">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>能耗分析报表</h1>
    </div>
    
    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="能源类型">
              <el-select v-model="filterForm.energyType" placeholder="选择能源类型">
                <el-option label="电力" value="electricity"></el-option>
                <el-option label="水" value="water"></el-option>
                <el-option label="燃气" value="gas"></el-option>
                <el-option label="热力" value="heat"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="分析维度">
              <el-select v-model="filterForm.dimension" placeholder="选择分析维度">
                <el-option label="按日" value="day"></el-option>
                <el-option label="按周" value="week"></el-option>
                <el-option label="按月" value="month"></el-option>
                <el-option label="按时段" value="hour"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="对比周期">
              <el-select v-model="filterForm.compareCycle" placeholder="选择对比周期">
                <el-option label="不对比" value="none"></el-option>
                <el-option label="环比" value="monthly"></el-option>
                <el-option label="同比" value="yearly"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 10px;">
          <el-col :span="6">
            <el-form-item label="区域/楼栋">
              <el-select v-model="filterForm.zoneId" placeholder="选择区域" multiple collapse-tags>
                <el-option v-for="zone in zones" :key="zone.id" :label="zone.name" :value="zone.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="显示方式">
              <el-select v-model="filterForm.displayType" placeholder="选择显示方式">
                <el-option label="折线图" value="line"></el-option>
                <el-option label="柱状图" value="bar"></el-option>
                <el-option label="饼图" value="pie"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="text-align: right;">
            <el-form-item>
              <el-button type="primary" @click="queryData">查询</el-button>
              <el-button @click="resetFilter">重置</el-button>
              <el-button type="primary" @click="saveReportTemplate" :disabled="!hasReportName">保存模板</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <!-- 报表信息 -->
    <div class="report-info">
      <el-input 
        v-model="reportName" 
        placeholder="输入报表名称" 
        clearable 
        style="width: 300px; margin-right: 10px;"
      ></el-input>
      <el-dropdown @command="handleTemplateSelect">
        <el-button type="default">
          加载模板
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="template in reportTemplates" :key="template.id" :command="template">
              {{ template.name }}
            </el-dropdown-item>
            <el-dropdown-item divided v-if="reportTemplates.length === 0">暂无保存的模板</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="success" @click="exportReport">导出报表</el-button>
    </div>
    
    <!-- 分析结果区域 -->
    <div class="analysis-content">
      <!-- 趋势分析 -->
      <el-card class="analysis-card">
        <template #header>
          <div class="card-header">
            <span>趋势分析</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="trendChartRef" style="width: 100%; height: 400px;"></div>
        </div>
      </el-card>
      
      <!-- 对比分析 -->
      <el-card v-if="filterForm.compareCycle !== 'none'" class="analysis-card">
        <template #header>
          <div class="card-header">
            <span>{{ filterForm.compareCycle === 'monthly' ? '环比' : '同比' }}对比分析</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="compareChartRef" style="width: 100%; height: 400px;"></div>
        </div>
      </el-card>
      
      <!-- 区域对比分析 -->
      <el-card v-if="filterForm.zoneId && filterForm.zoneId.length > 0" class="analysis-card">
        <template #header>
          <div class="card-header">
            <span>区域对比分析</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="zoneCompareChartRef" style="width: 100%; height: 400px;"></div>
        </div>
      </el-card>
      
      <!-- 用电高峰时段分析 -->
      <el-card v-if="filterForm.energyType === 'electricity' && filterForm.dimension === 'hour'" class="analysis-card">
        <template #header>
          <div class="card-header">
            <span>用电高峰时段分析</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="peakHourChartRef" style="width: 100%; height: 400px;"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  ArrowDown
} from '@element-plus/icons-vue'

export default {
  name: 'EnergyAnalysisReport',
  components: {
    ArrowDown
  },
  setup() {
    // 图表引用
    const trendChartRef = ref(null)
    const compareChartRef = ref(null)
    const zoneCompareChartRef = ref(null)
    const peakHourChartRef = ref(null)
    
    // 图表实例
    let trendChart = null
    let compareChart = null
    let zoneCompareChart = null
    let peakHourChart = null
    
    // 筛选条件
    const filterForm = reactive({
      dateRange: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
      energyType: 'electricity',
      dimension: 'day',
      compareCycle: 'none',
      zoneId: [],
      displayType: 'line'
    })
    
    // 报表名称
    const reportName = ref('')
    
    // 报表模板
    const reportTemplates = ref([
      { id: 1, name: '月度能源趋势分析', config: { energyType: 'electricity', dimension: 'month' } },
      { id: 2, name: '用电高峰时段分析', config: { energyType: 'electricity', dimension: 'hour' } },
      { id: 3, name: '区域能耗对比', config: { energyType: 'electricity', dimension: 'day', zoneId: ['a', 'b', 'c'] } }
    ])
    
    // 模拟区域数据
    const zones = reactive([
      { id: 'a', name: 'A栋' },
      { id: 'b', name: 'B栋' },
      { id: 'c', name: 'C栋' },
      { id: 'd', name: 'D栋' },
      { id: 'parking', name: '停车场' }
    ])
    
    // 获取能源类型配置
    const getEnergyConfig = (type) => {
      const configs = {
        electricity: { name: '电力', unit: 'kWh', color: '#1890ff' },
        water: { name: '水', unit: 'm³', color: '#13c2c2' },
        gas: { name: '燃气', unit: 'm³', color: '#fa8c16' },
        heat: { name: '热力', unit: 'GJ', color: '#f5222d' }
      }
      return configs[type] || configs.electricity
    }
    
    // 是否有报表名称
    const hasReportName = () => {
      return reportName.value.trim().length > 0
    }
    
    // 查询数据
    const queryData = () => {
      nextTick(() => {
        initCharts()
      })
    }
    
    // 重置筛选条件
    const resetFilter = () => {
      filterForm.dateRange = [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()]
      filterForm.energyType = 'electricity'
      filterForm.dimension = 'day'
      filterForm.compareCycle = 'none'
      filterForm.zoneId = []
      filterForm.displayType = 'line'
      
      queryData()
    }
    
    // 保存报表模板
    const saveReportTemplate = () => {
      if (!reportName.value.trim()) {
        ElMessage.warning('请输入报表名称')
        return
      }
      
      const newTemplate = {
        id: Date.now(),
        name: reportName.value.trim(),
        config: { ...filterForm }
      }
      
      reportTemplates.value.push(newTemplate)
      ElMessage.success('模板保存成功')
    }
    
    // 处理模板选择
    const handleTemplateSelect = (template) => {
      // 应用模板配置
      Object.assign(filterForm, template.config)
      reportName.value = template.name
      queryData()
    }
    
    // 导出报表
    const exportReport = () => {
      ElMessageBox.confirm(
        '确定要导出当前报表吗？',
        '导出报表',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(() => {
        // 模拟导出操作
        setTimeout(() => {
          ElMessage.success('报表导出成功')
        }, 1000)
      }).catch(() => {
        // 取消导出
      })
    }
    
    // 初始化图表
    const initCharts = () => {
      // 销毁已存在的图表
      destroyCharts()
      
      // 初始化趋势图表
      if (trendChartRef.value) {
        trendChart = echarts.init(trendChartRef.value)
        renderTrendChart()
      }
      
      // 初始化对比图表
      if (filterForm.compareCycle !== 'none' && compareChartRef.value) {
        compareChart = echarts.init(compareChartRef.value)
        renderCompareChart()
      }
      
      // 初始化区域对比图表
      if (filterForm.zoneId && filterForm.zoneId.length > 0 && zoneCompareChartRef.value) {
        zoneCompareChart = echarts.init(zoneCompareChartRef.value)
        renderZoneCompareChart()
      }
      
      // 初始化高峰时段图表
      if (filterForm.energyType === 'electricity' && filterForm.dimension === 'hour' && peakHourChartRef.value) {
        peakHourChart = echarts.init(peakHourChartRef.value)
        renderPeakHourChart()
      }
    }
    
    // 销毁图表
    const destroyCharts = () => {
      if (trendChart) trendChart.dispose()
      if (compareChart) compareChart.dispose()
      if (zoneCompareChart) zoneCompareChart.dispose()
      if (peakHourChart) peakHourChart.dispose()
    }
    
    // 渲染趋势图表
    const renderTrendChart = () => {
      const energyConfig = getEnergyConfig(filterForm.energyType)
      const data = generateTrendData()
      
      const series = [{
        name: energyConfig.name,
        type: filterForm.displayType,
        data: data.values,
        itemStyle: {
          color: energyConfig.color
        },
        smooth: filterForm.displayType === 'line'
      }]
      
      const option = {
        title: {
          text: `${energyConfig.name}趋势分析`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const param = params[0]
            return `${param.name}<br/>${param.seriesName}: ${param.value} ${energyConfig.unit}`
          }
        },
        xAxis: {
          type: 'category',
          data: data.labels,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: energyConfig.unit
        },
        series: series
      }
      
      trendChart.setOption(option)
    }
    
    // 渲染对比图表
    const renderCompareChart = () => {
      const energyConfig = getEnergyConfig(filterForm.energyType)
      const currentData = generateTrendData()
      const compareData = generateCompareData()
      
      const series = [
        {
          name: '当前期',
          type: filterForm.displayType,
          data: currentData.values,
          itemStyle: {
            color: energyConfig.color
          },
          smooth: filterForm.displayType === 'line'
        },
        {
          name: filterForm.compareCycle === 'monthly' ? '上期' : '同期',
          type: filterForm.displayType,
          data: compareData.values,
          itemStyle: {
            color: '#91d5ff'
          },
          smooth: filterForm.displayType === 'line'
        }
      ]
      
      const option = {
        title: {
          text: `${energyConfig.name}${filterForm.compareCycle === 'monthly' ? '环比' : '同比'}分析`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let result = `${params[0].name}<br/>`
            params.forEach(param => {
              result += `${param.seriesName}: ${param.value} ${energyConfig.unit}<br/>`
            })
            return result
          }
        },
        legend: {
          data: ['当前期', filterForm.compareCycle === 'monthly' ? '上期' : '同期'],
          top: 30
        },
        xAxis: {
          type: 'category',
          data: currentData.labels,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: energyConfig.unit
        },
        series: series
      }
      
      compareChart.setOption(option)
    }
    
    // 渲染区域对比图表
    const renderZoneCompareChart = () => {
      const energyConfig = getEnergyConfig(filterForm.energyType)
      const data = generateZoneCompareData()
      
      const series = [{
        name: energyConfig.name,
        type: filterForm.displayType,
        data: data.values,
        itemStyle: {
          color: energyConfig.color
        },
        smooth: filterForm.displayType === 'line'
      }]
      
      const option = {
        title: {
          text: `区域${energyConfig.name}对比`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const param = params[0]
            return `${param.name}<br/>${param.seriesName}: ${param.value} ${energyConfig.unit}`
          }
        },
        xAxis: {
          type: 'category',
          data: data.labels
        },
        yAxis: {
          type: 'value',
          name: energyConfig.unit
        },
        series: series
      }
      
      zoneCompareChart.setOption(option)
    }
    
    // 渲染高峰时段图表
    const renderPeakHourChart = () => {
      const energyConfig = getEnergyConfig('electricity')
      const data = generatePeakHourData()
      
      const option = {
        title: {
          text: '用电高峰时段分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name}时<br/>用电量: ${params[0].value} ${energyConfig.unit}`
          }
        },
        xAxis: {
          type: 'category',
          data: data.labels
        },
        yAxis: {
          type: 'value',
          name: energyConfig.unit
        },
        series: [{
          name: '用电量',
          type: 'bar',
          data: data.values,
          itemStyle: {
            color: function(params) {
              // 根据时段设置颜色
              const hour = parseInt(params.name)
              if (hour >= 9 && hour <= 18) {
                return '#ff4d4f' // 高峰期红色
              } else if ((hour >= 6 && hour < 9) || (hour > 18 && hour <= 22)) {
                return '#faad14' // 次高峰期橙色
              } else {
                return '#52c41a' // 低谷期绿色
              }
            }
          }
        }]
      }
      
      peakHourChart.setOption(option)
    }
    
    // 生成趋势数据
    const generateTrendData = () => {
      const labels = []
      const values = []
      const startDate = filterForm.dateRange[0]
      const endDate = filterForm.dateRange[1]
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      
      let dataCount = daysDiff
      if (filterForm.dimension === 'week') {
        dataCount = Math.ceil(daysDiff / 7)
      } else if (filterForm.dimension === 'month') {
        dataCount = Math.ceil(daysDiff / 30)
      }
      
      for (let i = 0; i < dataCount; i++) {
        const currentDate = new Date(startDate)
        let label = ''
        let baseValue = 0
        
        switch (filterForm.dimension) {
          case 'day':
            currentDate.setDate(currentDate.getDate() + i)
            label = currentDate.toLocaleDateString('zh-CN')
            baseValue = 10000
            break
          case 'week':
            currentDate.setDate(currentDate.getDate() + i * 7)
            const weekEnd = new Date(currentDate)
            weekEnd.setDate(weekEnd.getDate() + 6)
            label = `第${Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7)}周`
            baseValue = 70000
            break
          case 'month':
            currentDate.setMonth(currentDate.getMonth() + i)
            label = `${currentDate.getMonth() + 1}月`
            baseValue = 300000
            break
          case 'hour':
            label = i
            baseValue = 5000
            break
        }
        
        // 根据能源类型调整基础值
        switch (filterForm.energyType) {
          case 'electricity':
            baseValue = baseValue
            break
          case 'water':
            baseValue = baseValue / 100
            break
          case 'gas':
            baseValue = baseValue / 200
            break
          case 'heat':
            baseValue = baseValue / 5000
            break
        }
        
        labels.push(label)
        values.push(baseValue * (0.8 + Math.random() * 0.4))
      }
      
      return { labels, values }
    }
    
    // 生成对比数据
    const generateCompareData = () => {
      const data = generateTrendData()
      // 对原始数据进行小幅调整，模拟对比数据
      const compareValues = data.values.map(value => value * (0.9 + Math.random() * 0.2))
      return { labels: data.labels, values: compareValues }
    }
    
    // 生成区域对比数据
    const generateZoneCompareData = () => {
      const labels = []
      const values = []
      
      filterForm.zoneId.forEach(zoneId => {
        const zone = zones.find(z => z.id === zoneId)
        if (zone) {
          labels.push(zone.name)
          // 随机生成能耗数据
          let baseValue = 50000
          switch (filterForm.energyType) {
            case 'electricity':
              baseValue = 50000
              break
            case 'water':
              baseValue = 500
              break
            case 'gas':
              baseValue = 250
              break
            case 'heat':
              baseValue = 10
              break
          }
          values.push(baseValue * (0.7 + Math.random() * 0.6))
        }
      })
      
      return { labels, values }
    }
    
    // 生成高峰时段数据
    const generatePeakHourData = () => {
      const labels = []
      const values = []
      
      for (let i = 0; i < 24; i++) {
        labels.push(i)
        let baseValue = 0
        
        // 根据时段设置基础用电量
        if (i >= 9 && i <= 18) {
          baseValue = 8000 // 工作日高峰期
        } else if ((i >= 6 && i < 9) || (i > 18 && i <= 22)) {
          baseValue = 4000 // 次高峰期
        } else {
          baseValue = 1000 // 低谷期
        }
        
        values.push(baseValue * (0.8 + Math.random() * 0.4))
      }
      
      return { labels, values }
    }
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (trendChart) trendChart.resize()
      if (compareChart) compareChart.resize()
      if (zoneCompareChart) zoneCompareChart.resize()
      if (peakHourChart) peakHourChart.resize()
    }
    
    onMounted(() => {
      window.addEventListener('resize', handleResize)
      queryData()
    })
    
    // 组件卸载时清理
    const cleanup = () => {
      window.removeEventListener('resize', handleResize)
      destroyCharts()
    }
    
    return {
      filterForm,
      reportName,
      reportTemplates,
      zones,
      trendChartRef,
      compareChartRef,
      zoneCompareChartRef,
      peakHourChartRef,
      hasReportName,
      queryData,
      resetFilter,
      saveReportTemplate,
      handleTemplateSelect,
      exportReport
    }
  }
}
</script>

<style scoped>
.energy-analysis-report {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.report-info {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.analysis-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.analysis-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.analysis-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: 600;
}

.chart-container {
  padding: 10px 0;
}

/* 响应式 */
@media (max-width: 1200px) {
  .report-info {
    flex-wrap: wrap;
  }
  
  .el-row {
    flex-wrap: wrap;
  }
  
  .el-col {
    margin-bottom: 10px;
  }
}

@media (max-width: 768px) {
  .analysis-content {
    grid-template-columns: 1fr;
  }
}
</style>