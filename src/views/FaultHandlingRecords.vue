<template>
  <div class="fault-records">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>故障处理记录</h1>
      <div class="header-actions">
        <el-button @click="exportRecords('excel')">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
        <el-button @click="exportRecords('pdf')">
          <el-icon><Document /></el-icon>
          导出PDF
        </el-button>
        <el-button @click="refreshRecords">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ totalFaultCount }}</div>
          <div class="stat-label">总故障数</div>
        </div>
        <div class="stat-icon success"><el-icon class="icon-large"><DataAnalysis /></el-icon></div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ pendingFaultCount }}</div>
          <div class="stat-label">待处理</div>
        </div>
        <div class="stat-icon warning"><el-icon class="icon-large"><Timer /></el-icon></div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ processingFaultCount }}</div>
          <div class="stat-label">处理中</div>
        </div>
        <div class="stat-icon info"><el-icon class="icon-large"><Operation /></el-icon></div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ resolvedFaultCount }}</div>
          <div class="stat-label">已解决</div>
        </div>
        <div class="stat-icon success"><el-icon class="icon-large"><Check /></el-icon></div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ avgResolutionTime }}h</div>
          <div class="stat-label">平均解决时间</div>
        </div>
        <div class="stat-icon primary"><el-icon class="icon-large"><Clock /></el-icon></div>
      </el-card>
    </div>
    
    <!-- 筛选工具栏 -->
    <div class="toolbar">
      <div class="filter-section">
        <el-select
          v-model="statusFilter"
          placeholder="处理状态"
          clearable
          style="width: 120px; margin-right: 15px;"
        >
          <el-option label="待处理" value="pending"></el-option>
          <el-option label="处理中" value="processing"></el-option>
          <el-option label="已解决" value="resolved"></el-option>
          <el-option label="已关闭" value="closed"></el-option>
        </el-select>
        <el-select
          v-model="priorityFilter"
          placeholder="优先级"
          clearable
          style="width: 120px; margin-right: 15px;"
        >
          <el-option label="高" value="high"></el-option>
          <el-option label="中" value="medium"></el-option>
          <el-option label="低" value="low"></el-option>
        </el-select>
        <el-select
          v-model="zoneFilter"
          placeholder="故障区域"
          clearable
          style="width: 150px; margin-right: 15px;"
        >
          <el-option v-for="zone in zones" :key="zone" :label="zone" :value="zone"></el-option>
        </el-select>
        <el-select
          v-model="deviceFilter"
          placeholder="相关设备"
          clearable
          style="width: 180px; margin-right: 15px;"
        >
          <el-option v-for="device in devices" :key="device.id" :label="device.name" :value="device.id"></el-option>
        </el-select>
        <el-date-picker
          v-model="dateRangeFilter"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px;"
        ></el-date-picker>
      </div>
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索故障编号、描述、处理人"
          prefix-icon="el-icon-search"
          clearable
          style="width: 300px;"
        ></el-input>
      </div>
    </div>
    
    <!-- 故障记录表格 -->
    <el-card class="records-table-card">
      <el-table 
        :data="paginatedRecords" 
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="故障编号" width="180" sortable></el-table-column>
        <el-table-column prop="title" label="故障标题" min-width="200">
          <template #default="scope">
            <div class="fault-title" :title="scope.row.title">{{ scope.row.title }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getPriorityTagType(scope.row.priority)" size="small">
              {{ getPriorityText(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="zoneName" label="故障区域" width="120"></el-table-column>
        <el-table-column prop="deviceName" label="相关设备" width="150"></el-table-column>
        <el-table-column prop="status" label="处理状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reporter" label="申报人" width="100"></el-table-column>
        <el-table-column prop="handler" label="处理人" width="100">
          <template #default="scope">
            {{ scope.row.handler || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申报时间" width="160" align="center" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="resolvedAt" label="解决时间" width="160" align="center" sortable>
          <template #default="scope">
            {{ scope.row.resolvedAt ? formatDateTime(scope.row.resolvedAt) : '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="resolutionTime" label="处理时长" width="100" align="center">
          <template #default="scope">
            {{ scope.row.resolutionTime ? scope.row.resolutionTime + 'h' : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="viewRecordDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredRecords.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 故障记录详情对话框 -->
    <el-dialog
      v-model="recordDetailDialogVisible"
      title="故障处理详情"
      width="700px"
    >
      <div v-if="selectedRecord" class="record-detail">
        <div class="detail-header">
          <h2 class="record-title">{{ selectedRecord.title }}</h2>
          <el-tag :type="getStatusTagType(selectedRecord.status)">
            {{ getStatusText(selectedRecord.status) }}
          </el-tag>
        </div>
        
        <div class="detail-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">故障编号：</span>
              <span>{{ selectedRecord.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">优先级：</span>
              <el-tag :type="getPriorityTagType(selectedRecord.priority)" size="small">
                {{ getPriorityText(selectedRecord.priority) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">故障类型：</span>
              <span>{{ selectedRecord.type }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">故障区域：</span>
              <span>{{ selectedRecord.zoneName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">相关设备：</span>
              <span>{{ selectedRecord.deviceName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">设备ID：</span>
              <span>{{ selectedRecord.deviceId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申报人：</span>
              <span>{{ selectedRecord.reporter }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">处理人：</span>
              <span>{{ selectedRecord.handler || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申报时间：</span>
              <span>{{ formatDateTime(selectedRecord.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">解决时间：</span>
              <span>{{ selectedRecord.resolvedAt ? formatDateTime(selectedRecord.resolvedAt) : '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">处理时长：</span>
              <span>{{ selectedRecord.resolutionTime ? selectedRecord.resolutionTime + ' 小时' : '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">备注：</span>
              <span>{{ selectedRecord.remark || '--' }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-content">
          <h3>故障描述</h3>
          <div class="fault-description">
            {{ selectedRecord.description }}
          </div>
        </div>
        
        <div class="detail-content">
          <h3>处理过程</h3>
          <div class="process-steps">
            <div v-for="(step, index) in selectedRecord.processSteps" :key="index" class="step-item">
              <div class="step-timeline">
                <div class="step-dot" :class="{ 'active': index === selectedRecord.processSteps.length - 1 }"></div>
                <div v-if="index < selectedRecord.processSteps.length - 1" class="step-line"></div>
              </div>
              <div class="step-content">
                <div class="step-header">
                  <span class="step-title">{{ step.title }}</span>
                  <span class="step-time">{{ formatDateTime(step.time) }}</span>
                </div>
                <div class="step-description">{{ step.description }}</div>
                <div class="step-operator">操作人：{{ step.operator }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedRecord.status === 'resolved'" class="detail-content">
          <h3>处理结果</h3>
          <div class="resolution-result">
            <div class="result-item">
              <span class="result-label">解决方案：</span>
              <span class="result-value">{{ selectedRecord.resolution.result }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">根本原因：</span>
              <span class="result-value">{{ selectedRecord.resolution.rootCause }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">预防措施：</span>
              <span class="result-value">{{ selectedRecord.resolution.prevention }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="selectedRecord.attachments && selectedRecord.attachments.length > 0" class="detail-content">
          <h3>附件</h3>
          <div class="attachments-list">
            <el-link 
              v-for="(attachment, index) in selectedRecord.attachments" 
              :key="index" 
              :href="attachment.url" 
              target="_blank"
              type="primary"
              style="margin-right: 10px; margin-bottom: 10px;"
            >
              <el-icon><Document /></el-icon>
              {{ attachment.name }}
            </el-link>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="recordDetailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量操作对话框 -->
    <el-dialog
      v-model="bulkOperationDialogVisible"
      title="批量操作"
      width="400px"
    >
      <div class="bulk-operation-content">
        <p class="operation-info">
          您正在对 <span class="highlight">{{ selectedRecords.length }}</span> 条记录执行操作
        </p>
        <el-radio-group v-model="bulkOperationType" style="display: block; margin-top: 20px;">
          <el-radio value="export">导出选中记录</el-radio>
          <el-radio value="print">打印选中记录</el-radio>
        </el-radio-group>
        <el-select
          v-if="bulkOperationType === 'export'"
          v-model="exportFormat"
          placeholder="导出格式"
          style="width: 100%; margin-top: 15px;"
        >
          <el-option label="Excel" value="excel"></el-option>
          <el-option label="PDF" value="pdf"></el-option>
        </el-select>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bulkOperationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBulkOperation">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download, Document, Refresh, DataAnalysis, Timer, Operation, Check, Clock
} from '@element-plus/icons-vue'

export default {
  name: 'FaultHandlingRecords',
  components: {
    Download, Document, Refresh, DataAnalysis, Timer, Operation, Check, Clock
  },
  setup() {
    // 筛选条件
    const statusFilter = ref('')
    const priorityFilter = ref('')
    const zoneFilter = ref('')
    const deviceFilter = ref('')
    const dateRangeFilter = ref(null)
    const searchKeyword = ref('')
    
    // 分页
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    // 状态
    const loading = ref(false)
    const selectedRecords = ref([])
    const selectedRecord = ref(null)
    
    // 对话框
    const recordDetailDialogVisible = ref(false)
    const bulkOperationDialogVisible = ref(false)
    
    // 批量操作
    const bulkOperationType = ref('export')
    const exportFormat = ref('excel')
    
    // 数据
    const faultRecords = ref([])
    const zones = ref(['A栋', 'B栋', 'C栋', 'D栋', '停车场', '办公楼', '园区公共区域'])
    const devices = ref([
      { id: 'DEV-E0001', name: 'A栋电表1' },
      { id: 'DEV-E0002', name: 'B栋电表1' },
      { id: 'DEV-E0003', name: 'C栋电表1' },
      { id: 'DEV-E0004', name: 'D栋电表1' },
      { id: 'DEV-W0001', name: 'A栋水表1' },
      { id: 'DEV-W0002', name: 'B栋水表2' },
      { id: 'DEV-G0001', name: 'C栋燃气表1' },
      { id: 'DEV-H0001', name: 'A栋热力表1' }
    ])
    
    // 计算属性：筛选后的记录
    const filteredRecords = computed(() => {
      return faultRecords.value.filter(record => {
        const matchesStatus = !statusFilter.value || record.status === statusFilter.value
        const matchesPriority = !priorityFilter.value || record.priority === priorityFilter.value
        const matchesZone = !zoneFilter.value || record.zoneName === zoneFilter.value
        const matchesDevice = !deviceFilter.value || record.deviceId === deviceFilter.value
        const matchesDate = !dateRangeFilter.value || 
          (new Date(record.createdAt) >= new Date(dateRangeFilter.value[0]) && 
           new Date(record.createdAt) <= new Date(dateRangeFilter.value[1]))
        const matchesKeyword = !searchKeyword.value || 
          record.id.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          record.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          record.description.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          record.reporter.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          (record.handler && record.handler.toLowerCase().includes(searchKeyword.value.toLowerCase()))
        
        return matchesStatus && matchesPriority && matchesZone && matchesDevice && matchesDate && matchesKeyword
      })
    })
    
    // 分页后的记录
    const paginatedRecords = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      return filteredRecords.value.slice(startIndex, endIndex)
    })
    
    // 统计数据
    const totalFaultCount = computed(() => faultRecords.value.length)
    const pendingFaultCount = computed(() => faultRecords.value.filter(r => r.status === 'pending').length)
    const processingFaultCount = computed(() => faultRecords.value.filter(r => r.status === 'processing').length)
    const resolvedFaultCount = computed(() => faultRecords.value.filter(r => r.status === 'resolved').length)
    const avgResolutionTime = computed(() => {
      const resolved = faultRecords.value.filter(r => r.status === 'resolved' && r.resolutionTime)
      if (resolved.length === 0) return '0'
      const total = resolved.reduce((sum, r) => sum + r.resolutionTime, 0)
      return (total / resolved.length).toFixed(1)
    })
    
    // 获取优先级文本
    const getPriorityText = (priority) => {
      const texts = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return texts[priority] || priority
    }
    
    // 获取优先级标签类型
    const getPriorityTagType = (priority) => {
      const types = {
        high: 'danger',
        medium: 'warning',
        low: 'success'
      }
      return types[priority] || 'info'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        pending: '待处理',
        processing: '处理中',
        resolved: '已解决',
        closed: '已关闭'
      }
      return texts[status] || status
    }
    
    // 获取状态标签类型
    const getStatusTagType = (status) => {
      const types = {
        pending: 'warning',
        processing: 'info',
        resolved: 'success',
        closed: 'danger'
      }
      return types[status] || 'info'
    }
    
    // 格式化日期时间
    const formatDateTime = (date) => {
      if (!date) return '--'
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
    }
    
    // 处理选择变更
    const handleSelectionChange = (selection) => {
      selectedRecords.value = selection
    }
    
    // 查看记录详情
    const viewRecordDetail = (record) => {
      selectedRecord.value = { ...record }
      recordDetailDialogVisible.value = true
    }
    
    // 导出记录
    const exportRecords = (format = 'excel') => {
      if (filteredRecords.value.length === 0) {
        ElMessage.warning('没有可导出的数据')
        return
      }
      
      loading.value = true
      
      // 模拟导出操作
      setTimeout(() => {
        ElMessage.success(`成功导出 ${filteredRecords.value.length} 条记录为${format.toUpperCase()}格式`)
        loading.value = false
      }, 1500)
    }
    
    // 刷新记录
    const refreshRecords = () => {
      loading.value = true
      
      // 模拟刷新操作
      setTimeout(() => {
        generateMockFaultRecords()
        ElMessage.success('故障记录已刷新')
        loading.value = false
      }, 1000)
    }
    
    // 确认批量操作
    const confirmBulkOperation = () => {
      if (selectedRecords.value.length === 0) {
        ElMessage.warning('请先选择记录')
        return
      }
      
      if (bulkOperationType.value === 'export') {
        // 导出选中的记录
        loading.value = true
        setTimeout(() => {
          ElMessage.success(`成功导出 ${selectedRecords.value.length} 条记录为${exportFormat.value.toUpperCase()}格式`)
          loading.value = false
          bulkOperationDialogVisible.value = false
        }, 1500)
      } else if (bulkOperationType.value === 'print') {
        // 打印选中的记录
        ElMessage.info('正在准备打印...')
        setTimeout(() => {
          ElMessage.success(`已准备好 ${selectedRecords.value.length} 条记录用于打印`)
          bulkOperationDialogVisible.value = false
        }, 800)
      }
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }
    
    const handleCurrentChange = (current) => {
      currentPage.value = current
    }
    
    // 生成模拟故障记录数据
    const generateMockFaultRecords = () => {
      const now = new Date()
      
      faultRecords.value = [
        {
          id: 'FAULT-20231101-001',
          title: 'A栋3层电表通信故障',
          description: 'A栋3层电表设备无法正常与系统通信，无法获取实时用电数据。故障发生在今天上午9点，影响了A栋3层的用电监测。',
          priority: 'high',
          type: '设备通信故障',
          zoneName: 'A栋',
          deviceName: 'A栋电表1',
          deviceId: 'DEV-E0001',
          status: 'resolved',
          reporter: '李工',
          handler: '王工',
          createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12小时前
          resolvedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8小时前
          resolutionTime: 4,
          remark: '通信模块老化导致',
          processSteps: [
            {
              title: '故障申报',
              description: '系统监测到设备离线，自动创建故障工单',
              operator: '系统',
              time: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
            },
            {
              title: '工单分配',
              description: '故障工单已分配给王工处理',
              operator: '管理员',
              time: new Date(now.getTime() - 11.5 * 60 * 60 * 1000).toISOString()
            },
            {
              title: '现场检查',
              description: '到达现场后检查设备状态，确认通信模块故障',
              operator: '王工',
              time: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString()
            },
            {
              title: '设备维修',
              description: '更换了故障的通信模块',
              operator: '王工',
              time: new Date(now.getTime() - 9 * 60 * 60 * 1000).toISOString()
            },
            {
              title: '测试验证',
              description: '设备恢复通信，数据正常上传',
              operator: '王工',
              time: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString()
            }
          ],
          resolution: {
            result: '更换了电表通信模块',
            rootCause: '通信模块老化，信号传输不稳定',
            prevention: '建议对所有超过3年的设备进行通信模块检查'
          },
          attachments: [
            { name: '故障现场照片.jpg', url: '#' },
            { name: '维修记录单.pdf', url: '#' }
          ]
        },
        {
          id: 'FAULT-20231101-002',
          title: 'B栋水表数据异常',
          description: 'B栋水表2号设备上报的数据出现异常波动，数值忽高忽低，与实际用水量不符。',
          priority: 'medium',
          type: '数据异常',
          zoneName: 'B栋',
          deviceName: 'B栋水表2',
          deviceId: 'DEV-W0002',
          status: 'processing',
          reporter: '系统',
          handler: '赵工',
          createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5小时前
          resolvedAt: null,
          resolutionTime: null,
          remark: '正在排查传感器问题',
          processSteps: [
            {
              title: '故障申报',
              description: '系统检测到数据异常，自动创建故障工单',
              operator: '系统',
              time: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
              title: '工单分配',
              description: '故障工单已分配给赵工处理',
              operator: '管理员',
              time: new Date(now.getTime() - 4.5 * 60 * 60 * 1000).toISOString()
            },
            {
              title: '初步分析',
              description: '数据分析显示可能是传感器故障或管道中有气泡',
              operator: '赵工',
              time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
            },
            {
              title: '现场检查',
              description: '正在现场检查设备和管道情况',
              operator: '赵工',
              time: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
            }
          ],
          resolution: {},
          attachments: []
        },
        {
          id: 'FAULT-20231101-003',
          title: 'C栋燃气表读数偏高',
          description: 'C栋燃气表1号设备读数明显高于历史同期水平，可能存在表具故障或燃气泄漏风险。',
          priority: 'high',
          type: '读数异常',
          zoneName: 'C栋',
          deviceName: 'C栋燃气表1',
          deviceId: 'DEV-G0001',
          status: 'pending',
          reporter: '张工',
          handler: null,
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
          resolvedAt: null,
          resolutionTime: null,
          remark: '需紧急处理',
          processSteps: [
            {
              title: '故障申报',
              description: '张工巡检时发现读数异常，手动创建故障工单',
              operator: '张工',
              time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
            }
          ],
          resolution: {},
          attachments: [
            { name: '读数记录截图.png', url: '#' }
          ]
        },
        {
          id: 'FAULT-20231101-004',
          title: '停车场电表数据丢失',
          description: '停车场电表1号设备今天凌晨2点到4点的数据丢失，无法查看该时段的用电情况。',
          priority: 'low',
          type: '数据丢失',
          zoneName: '停车场',
          deviceName: '停车场电表1',
          deviceId: 'DEV-E0006',
          status: 'resolved',
          reporter: '系统',
          handler: '刘工',
          createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18小时前
          resolvedAt: new Date(now.getTime() - 16 * 60 * 60 * 1000).toISOString(), // 16小时前
          resolutionTime: 2,
          remark: '设备重启后恢复正常',
          processSteps: [
            {
              title: '故障申报',
              description: '系统检测到数据缺失，自动创建故障工单',
              operator: '系统',
              time: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString()
            },
            {
              title: '工单分配',
              description: '故障工单已分配给刘工处理',
              operator: '管理员',
              time: new Date(now.getTime() - 17.5 * 60 * 60 * 1000).toISOString()
            },
            {
              title: '远程处理',
              description: '远程重启设备后，数据恢复正常传输',
              operator: '刘工',
              time: new Date(now.getTime() - 16 * 60 * 60 * 1000).toISOString()
            }
          ],
          resolution: {
            result: '远程重启设备',
            rootCause: '设备固件临时故障，自动恢复',
            prevention: '建议设置定期自动重启机制'
          },
          attachments: []
        },
        {
          id: 'FAULT-20231101-005',
          title: 'D栋电表1号设备离线',
          description: 'D栋电表1号设备完全离线，无法连接到系统，影响整栋楼的用电监控。',
          priority: 'high',
          type: '设备离线',
          zoneName: 'D栋',
          deviceName: 'D栋电表1',
          deviceId: 'DEV-E0004',
          status: 'processing',
          reporter: '系统',
          handler: '陈工',
          createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1小时前
          resolvedAt: null,
          resolutionTime: null,
          remark: '正在前往现场',
          processSteps: [
            {
              title: '故障申报',
              description: '系统检测到设备离线超过30分钟，自动创建故障工单',
              operator: '系统',
              time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
              title: '工单分配',
              description: '故障工单已分配给陈工处理',
              operator: '管理员',
              time: new Date(now.getTime() - 55 * 60 * 1000).toISOString()
            },
            {
              title: '响应处理',
              description: '已接收到工单，正在前往现场处理',
              operator: '陈工',
              time: new Date(now.getTime() - 45 * 60 * 1000).toISOString()
            }
          ],
          resolution: {},
          attachments: []
        }
      ]
    }
    
    onMounted(() => {
      generateMockFaultRecords()
    })
    
    return {
      statusFilter,
      priorityFilter,
      zoneFilter,
      deviceFilter,
      dateRangeFilter,
      searchKeyword,
      currentPage,
      pageSize,
      loading,
      selectedRecords,
      selectedRecord,
      recordDetailDialogVisible,
      bulkOperationDialogVisible,
      bulkOperationType,
      exportFormat,
      faultRecords,
      zones,
      devices,
      filteredRecords,
      paginatedRecords,
      totalFaultCount,
      pendingFaultCount,
      processingFaultCount,
      resolvedFaultCount,
      avgResolutionTime,
      getPriorityText,
      getPriorityTagType,
      getStatusText,
      getStatusTagType,
      formatDateTime,
      handleSelectionChange,
      viewRecordDetail,
      exportRecords,
      refreshRecords,
      confirmBulkOperation,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.fault-records {
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

.stats-section {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  height: 100px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.1;
}

.stat-icon.success {
  color: #67c23a;
}

.stat-icon.warning {
  color: #e6a23c;
}

.stat-icon.info {
  color: #409eff;
}

.stat-icon.primary {
  color: #66b1ff;
}

.icon-large {
  font-size: 40px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.search-section {
  display: flex;
  align-items: center;
}

.records-table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.fault-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.record-detail {
  padding: 10px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.record-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.detail-info {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.detail-content {
  margin-bottom: 25px;
}

.detail-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #303133;
}

.fault-description {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
}

.process-steps {
  position: relative;
  padding-left: 30px;
}

.step-item {
  position: relative;
  margin-bottom: 20px;
}

.step-timeline {
  position: absolute;
  left: -30px;
  top: 0;
  width: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #dcdfe6;
  position: relative;
  z-index: 1;
}

.step-dot.active {
  background-color: #409eff;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
}

.step-line {
  width: 2px;
  flex: 1;
  background-color: #e4e7ed;
  margin-top: 5px;
}

.step-content {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-left: 10px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.step-title {
  font-weight: 600;
  color: #303133;
}

.step-time {
  font-size: 12px;
  color: #909399;
}

.step-description {
  margin-bottom: 5px;
  line-height: 1.5;
}

.step-operator {
  font-size: 12px;
  color: #606266;
}

.resolution-result {
  padding: 12px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.result-item {
  margin-bottom: 10px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-label {
  font-weight: 600;
  color: #303133;
  margin-right: 8px;
}

.result-value {
  color: #606266;
  line-height: 1.5;
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
}

.bulk-operation-content {
  padding: 10px 0;
}

.operation-info {
  margin-bottom: 0;
  font-size: 14px;
}

.highlight {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
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
    justify-content: flex-start;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-section {
    justify-content: stretch;
  }
  
  .search-section {
    justify-content: stretch;
  }
  
  .pagination-wrapper {
    justify-content: center;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .process-steps {
    padding-left: 25px;
  }
  
  .step-timeline {
    left: -25px;
    width: 15px;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>