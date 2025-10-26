<template>
  <div class="historical-query">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>历史能耗查询</h1>
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
            <el-form-item label="时间粒度">
              <el-select v-model="filterForm.timeGranularity" placeholder="选择时间粒度">
                <el-option label="按日" value="day"></el-option>
                <el-option label="按周" value="week"></el-option>
                <el-option label="按月" value="month"></el-option>
                <el-option label="按年" value="year"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="能源类型">
              <el-select v-model="filterForm.energyType" placeholder="选择能源类型" multiple collapse-tags>
                <el-option label="电力" value="electricity"></el-option>
                <el-option label="水" value="water"></el-option>
                <el-option label="燃气" value="gas"></el-option>
                <el-option label="热力" value="heat"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="区域/楼栋">
              <el-select v-model="filterForm.zoneId" placeholder="选择区域">
                <el-option label="全部区域" value="all"></el-option>
                <el-option v-for="zone in zones" :key="zone.id" :label="zone.name" :value="zone.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 10px;">
          <el-col :span="6">
            <el-form-item label="企业名称">
              <el-select v-model="filterForm.enterpriseId" placeholder="选择企业">
                <el-option label="全部企业" value="all"></el-option>
                <el-option v-for="enterprise in enterprises" :key="enterprise.id" :label="enterprise.name" :value="enterprise.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否达标">
              <el-select v-model="filterForm.isQualified" placeholder="是否达标">
                <el-option label="全部" value="all"></el-option>
                <el-option label="达标" value="true"></el-option>
                <el-option label="不达标" value="false"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="text-align: right;">
            <el-form-item>
              <el-button type="primary" @click="queryData">查询</el-button>
              <el-button @click="resetFilter">重置</el-button>
              <el-dropdown @command="handleExport">
                <el-button type="default">
                  导出
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="excel">导出Excel</el-dropdown-item>
                    <el-dropdown-item command="pdf">导出PDF</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <!-- 数据统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总用电量</div>
          <div class="stat-value">{{ totalStatistics.electricity }} kWh</div>
          <div class="stat-change" :class="{ positive: totalStatistics.electricityChange > 0, negative: totalStatistics.electricityChange < 0 }">
            <el-icon v-if="totalStatistics.electricityChange > 0"><ArrowUp /></el-icon>
            <el-icon v-else-if="totalStatistics.electricityChange < 0"><ArrowDown /></el-icon>
            {{ Math.abs(totalStatistics.electricityChange) }}%
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总用水量</div>
          <div class="stat-value">{{ totalStatistics.water }} m³</div>
          <div class="stat-change" :class="{ positive: totalStatistics.waterChange > 0, negative: totalStatistics.waterChange < 0 }">
            <el-icon v-if="totalStatistics.waterChange > 0"><ArrowUp /></el-icon>
            <el-icon v-else-if="totalStatistics.waterChange < 0"><ArrowDown /></el-icon>
            {{ Math.abs(totalStatistics.waterChange) }}%
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总用气量</div>
          <div class="stat-value">{{ totalStatistics.gas }} m³</div>
          <div class="stat-change" :class="{ positive: totalStatistics.gasChange > 0, negative: totalStatistics.gasChange < 0 }">
            <el-icon v-if="totalStatistics.gasChange > 0"><ArrowUp /></el-icon>
            <el-icon v-else-if="totalStatistics.gasChange < 0"><ArrowDown /></el-icon>
            {{ Math.abs(totalStatistics.gasChange) }}%
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总用热量</div>
          <div class="stat-value">{{ totalStatistics.heat }} GJ</div>
          <div class="stat-change" :class="{ positive: totalStatistics.heatChange > 0, negative: totalStatistics.heatChange < 0 }">
            <el-icon v-if="totalStatistics.heatChange > 0"><ArrowUp /></el-icon>
            <el-icon v-else-if="totalStatistics.heatChange < 0"><ArrowDown /></el-icon>
            {{ Math.abs(totalStatistics.heatChange) }}%
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 数据表格 -->
    <el-card class="data-table-card">
      <template #header>
        <div class="card-header">
          <span>能耗数据列表</span>
          <span class="total-count">共 {{ energyData.length }} 条数据</span>
        </div>
      </template>
      <el-table 
        v-loading="loading" 
        :data="energyData" 
        style="width: 100%"
        border
      >
        <el-table-column prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="zoneName" label="区域/楼栋" width="120"></el-table-column>
        <el-table-column prop="enterpriseName" label="企业名称" width="150"></el-table-column>
        <el-table-column prop="electricity" label="用电量(kWh)" width="120" align="right">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.electricity) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="water" label="用水量(m³)" width="120" align="right">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.water) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gas" label="用气量(m³)" width="120" align="right">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.gas) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="heat" label="用热量(GJ)" width="120" align="right">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.heat) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="changeRate" label="环比变化" width="120" align="right">
          <template #default="scope">
            <span :class="{ positive: scope.row.changeRate > 0, negative: scope.row.changeRate < 0 }">
              <el-icon v-if="scope.row.changeRate > 0"><ArrowUp /></el-icon>
              <el-icon v-else-if="scope.row.changeRate < 0"><ArrowDown /></el-icon>
              <el-icon v-else><Minus /></el-icon>
              {{ Math.abs(scope.row.changeRate) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="isQualified" label="是否达标" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isQualified ? 'success' : 'danger'">
              {{ scope.row.isQualified ? '达标' : '不达标' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150"></el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowDown, ArrowUp, Minus
} from '@element-plus/icons-vue'

export default {
  name: 'HistoricalQuery',
  components: {
    ArrowDown, ArrowUp, Minus
  },
  setup() {
    const loading = ref(false)
    
    // 筛选条件
    const filterForm = reactive({
      dateRange: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
      timeGranularity: 'day',
      energyType: ['electricity', 'water', 'gas', 'heat'],
      zoneId: 'all',
      enterpriseId: 'all',
      isQualified: 'all'
    })
    
    // 分页信息
    const pagination = reactive({
      currentPage: 1,
      pageSize: 20,
      total: 100
    })
    
    // 模拟区域数据
    const zones = reactive([
      { id: 'a', name: 'A栋' },
      { id: 'b', name: 'B栋' },
      { id: 'c', name: 'C栋' },
      { id: 'd', name: 'D栋' },
      { id: 'parking', name: '停车场' }
    ])
    
    // 模拟企业数据
    const enterprises = reactive([
      { id: 1, name: '科技有限公司' },
      { id: 2, name: '智慧园区管理处' },
      { id: 3, name: '绿色能源公司' },
      { id: 4, name: '物业服务公司' }
    ])
    
    // 模拟能耗数据
    const energyData = ref([])
    
    // 模拟统计数据
    const totalStatistics = reactive({
      electricity: 256800,
      water: 4250,
      gas: 1850,
      heat: 650,
      electricityChange: 3.2,
      waterChange: -1.5,
      gasChange: 2.8,
      heatChange: 0.9
    })
    
    // 格式化数字
    const formatNumber = (value) => {
      if (value === null || value === undefined) return '--'
      return Number(value).toFixed(2)
    }
    
    // 查询数据
    const queryData = () => {
      loading.value = true
      
      // 模拟API请求延迟
      setTimeout(() => {
        generateMockData()
        loading.value = false
      }, 1000)
    }
    
    // 重置筛选条件
    const resetFilter = () => {
      filterForm.dateRange = [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()]
      filterForm.timeGranularity = 'day'
      filterForm.energyType = ['electricity', 'water', 'gas', 'heat']
      filterForm.zoneId = 'all'
      filterForm.enterpriseId = 'all'
      filterForm.isQualified = 'all'
      pagination.currentPage = 1
      
      queryData()
    }
    
    // 处理导出
    const handleExport = (type) => {
      loading.value = true
      
      // 模拟导出操作
      setTimeout(() => {
        loading.value = false
        ElMessage.success(`${type === 'excel' ? 'Excel' : 'PDF'} 文件导出成功`)
      }, 1500)
    }
    
    // 处理分页大小变化
    const handleSizeChange = (size) => {
      pagination.pageSize = size
      queryData()
    }
    
    // 处理当前页变化
    const handleCurrentChange = (current) => {
      pagination.currentPage = current
      queryData()
    }
    
    // 生成模拟数据
    const generateMockData = () => {
      const mockData = []
      const startDate = filterForm.dateRange[0]
      const endDate = filterForm.dateRange[1]
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      
      // 根据时间粒度确定生成数据的数量
      let dataCount = daysDiff
      if (filterForm.timeGranularity === 'week') {
        dataCount = Math.ceil(daysDiff / 7)
      } else if (filterForm.timeGranularity === 'month') {
        dataCount = Math.ceil(daysDiff / 30)
      }
      
      // 计算当前页应该显示的数据
      const pageDataCount = pagination.pageSize
      const startIndex = (pagination.currentPage - 1) * pageDataCount
      
      for (let i = 0; i < pageDataCount && startIndex + i < dataCount; i++) {
        const dateOffset = startIndex + i
        const currentDate = new Date(startDate)
        
        // 根据时间粒度调整日期
        if (filterForm.timeGranularity === 'day') {
          currentDate.setDate(currentDate.getDate() + dateOffset)
        } else if (filterForm.timeGranularity === 'week') {
          currentDate.setDate(currentDate.getDate() + dateOffset * 7)
        } else if (filterForm.timeGranularity === 'month') {
          currentDate.setMonth(currentDate.getMonth() + dateOffset)
        }
        
        // 随机选择区域和企业
        const randomZone = zones[Math.floor(Math.random() * zones.length)]
        const randomEnterprise = enterprises[Math.floor(Math.random() * enterprises.length)]
        
        // 生成随机能耗数据
        const electricity = 8000 + Math.random() * 4000
        const water = 100 + Math.random() * 50
        const gas = 50 + Math.random() * 30
        const heat = 20 + Math.random() * 10
        const changeRate = (Math.random() - 0.5) * 10 // -5% 到 5%
        const isQualified = Math.random() > 0.1 // 90% 达标率
        
        // 格式化日期显示
        let dateStr = ''
        if (filterForm.timeGranularity === 'day') {
          dateStr = currentDate.toLocaleDateString('zh-CN')
        } else if (filterForm.timeGranularity === 'week') {
          const weekStart = new Date(currentDate)
          const weekEnd = new Date(currentDate)
          weekEnd.setDate(weekEnd.getDate() + 6)
          dateStr = `${weekStart.toLocaleDateString('zh-CN')} 至 ${weekEnd.toLocaleDateString('zh-CN')}`
        } else if (filterForm.timeGranularity === 'month') {
          dateStr = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
        }
        
        mockData.push({
          id: `${dateOffset + 1}`,
          date: dateStr,
          zoneId: randomZone.id,
          zoneName: randomZone.name,
          enterpriseId: randomEnterprise.id,
          enterpriseName: randomEnterprise.name,
          electricity: electricity,
          water: water,
          gas: gas,
          heat: heat,
          changeRate: changeRate,
          isQualified: isQualified,
          notes: isQualified ? '' : '能耗超标，需要优化'
        })
      }
      
      energyData.value = mockData
      pagination.total = dataCount
    }
    
    onMounted(() => {
      queryData()
    })
    
    return {
      loading,
      filterForm,
      pagination,
      zones,
      enterprises,
      energyData,
      totalStatistics,
      formatNumber,
      queryData,
      resetFilter,
      handleExport,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.historical-query {
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

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive { color: #F56C6C; }
.stat-change.negative { color: #67C23A; }

/* 数据表格 */
.data-table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.total-count {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.positive {
  color: #F56C6C;
}

.negative {
  color: #67C23A;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .el-row {
    flex-wrap: wrap;
  }
  
  .el-col {
    margin-bottom: 10px;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    justify-content: center;
  }
}
</style>