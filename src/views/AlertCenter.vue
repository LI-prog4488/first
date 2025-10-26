<template>
  <div class="alert-center">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>异常预警中心</h1>
      <div class="header-actions">
        <el-button type="danger" @click="handleBulkProcessAlert">
          <el-icon><AlarmClock /></el-icon>
          批量处理
        </el-button>
        <el-button @click="refreshAlerts">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <!-- 预警统计卡片 -->
    <div class="alert-stats">
      <el-card class="stat-card critical">
        <div class="stat-content">
          <div class="stat-number">{{ criticalAlertCount }}</div>
          <div class="stat-label">紧急预警</div>
        </div>
        <div class="stat-icon"><el-icon class="icon-large"><Warning /></el-icon></div>
      </el-card>
      <el-card class="stat-card warning">
        <div class="stat-content">
          <div class="stat-number">{{ warningAlertCount }}</div>
          <div class="stat-label">警告预警</div>
        </div>
        <div class="stat-icon"><el-icon class="icon-large"><CircleClose /></el-icon></div>
      </el-card>
      <el-card class="stat-card info">
        <div class="stat-content">
          <div class="stat-number">{{ infoAlertCount }}</div>
          <div class="stat-label">提示预警</div>
        </div>
        <div class="stat-icon"><el-icon class="icon-large"><InfoFilled /></el-icon></div>
      </el-card>
      <el-card class="stat-card total">
        <div class="stat-content">
          <div class="stat-number">{{ totalAlertCount }}</div>
          <div class="stat-label">今日预警</div>
        </div>
        <div class="stat-icon"><el-icon class="icon-large"><Bell /></el-icon></div>
      </el-card>
    </div>
    
    <!-- 筛选工具栏 -->
    <div class="toolbar">
      <div class="filter-section">
        <el-select
          v-model="severityFilter"
          placeholder="预警级别"
          clearable
          style="width: 120px; margin-right: 15px;"
        >
          <el-option label="紧急" value="critical"></el-option>
          <el-option label="警告" value="warning"></el-option>
          <el-option label="提示" value="info"></el-option>
        </el-select>
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
          v-model="typeFilter"
          placeholder="预警类型"
          clearable
          style="width: 150px; margin-right: 15px;"
        >
          <el-option label="能耗超标" value="energy_overlimit"></el-option>
          <el-option label="设备离线" value="device_offline"></el-option>
          <el-option label="数据异常" value="data_abnormal"></el-option>
          <el-option label="设备故障" value="device_fault"></el-option>
          <el-option label="阈值预警" value="threshold_alert"></el-option>
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
          placeholder="搜索预警信息、设备或区域"
          prefix-icon="el-icon-search"
          clearable
          style="width: 300px;"
        ></el-input>
      </div>
    </div>
    
    <!-- 预警列表 -->
    <el-card class="alerts-table-card">
      <el-table 
        :data="filteredAlerts" 
        style="width: 100%"
        border
        @row-click="handleAlertClick"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column>
        <el-table-column prop="severity" label="级别" width="80" fixed="left">
          <template #default="scope">
            <el-tag :type="getSeverityTagType(scope.row.severity)">
              {{ getSeverityText(scope.row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="预警标题" min-width="200">
          <template #default="scope">
            <div class="alert-title-wrapper">
              <span :class="{ 'unread': !scope.row.isRead }">
                {{ scope.row.title }}
              </span>
              <el-tag 
                v-if="!scope.row.isRead" 
                type="danger" 
                size="small"
                effect="dark"
                style="margin-left: 5px;"
              >
                未读
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag size="small" :type="getTypeTagType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="zoneName" label="区域" width="100"></el-table-column>
        <el-table-column prop="deviceName" label="设备" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="100">
          <template #default="scope">
            {{ scope.row.handler || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click.stop="viewAlertDetail(scope.row)">详情</el-button>
            <el-button 
              size="small" 
              :type="getActionButtonType(scope.row)"
              @click.stop="processAlert(scope.row)"
              :disabled="isAlertProcessed(scope.row)"
            >
              {{ getActionButtonText(scope.row) }}
            </el-button>
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
          :total="filteredAlerts.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 预警详情对话框 -->
    <el-dialog
      v-model="alertDetailDialogVisible"
      title="预警详情"
      width="700px"
      :before-close="handleDialogClose"
    >
      <div v-if="selectedAlert" class="alert-detail">
        <div class="detail-header">
          <h2 class="alert-title">{{ selectedAlert.title }}</h2>
          <el-tag :type="getSeverityTagType(selectedAlert.severity)">
            {{ getSeverityText(selectedAlert.severity) }}
          </el-tag>
        </div>
        
        <div class="detail-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">预警类型：</span>
              <el-tag size="small" :type="getTypeTagType(selectedAlert.type)">
                {{ getTypeText(selectedAlert.type) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">处理状态：</span>
              <el-tag :type="getStatusTagType(selectedAlert.status)">
                {{ getStatusText(selectedAlert.status) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">预警区域：</span>
              <span>{{ selectedAlert.zoneName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">相关设备：</span>
              <span>{{ selectedAlert.deviceName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">设备ID：</span>
              <span>{{ selectedAlert.deviceId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">预警编号：</span>
              <span>{{ selectedAlert.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间：</span>
              <span>{{ formatDateTime(selectedAlert.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间：</span>
              <span>{{ formatDateTime(selectedAlert.updatedAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-content">
          <h3>预警描述</h3>
          <div class="alert-description">
            {{ selectedAlert.description }}
          </div>
        </div>
        
        <div class="detail-content">
          <h3>相关数据</h3>
          <div class="alert-data">
            <el-descriptions :column="2" border>
              <el-descriptions-item v-for="(value, key) in selectedAlert.data" :key="key" :label="getFieldLabel(key)">
                {{ formatFieldValue(key, value) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        
        <div class="detail-content">
          <h3>处理建议</h3>
          <div class="alert-suggestion">
            {{ selectedAlert.suggestion }}
          </div>
        </div>
        
        <div class="detail-content">
          <h3>同类预警历史</h3>
          <div class="alert-history">
            <el-table 
              v-if="selectedAlert.similarAlerts && selectedAlert.similarAlerts.length > 0" 
              :data="selectedAlert.similarAlerts" 
              style="width: 100%"
              size="small"
            >
              <el-table-column prop="id" label="编号" width="150"></el-table-column>
              <el-table-column prop="createdAt" label="时间" width="160"></el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag size="small" :type="getStatusTagType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="handler" label="处理人" width="100"></el-table-column>
            </el-table>
            <div v-else class="no-data">暂无同类预警历史</div>
          </div>
        </div>
        
        <div v-if="selectedAlert.status === 'pending'" class="process-form">
          <h3>处理预警</h3>
          <el-form :model="processForm" label-width="100px">
            <el-form-item label="处理状态">
              <el-select v-model="processForm.status" placeholder="请选择处理状态">
                <el-option label="处理中" value="processing"></el-option>
                <el-option label="已解决" value="resolved"></el-option>
                <el-option label="已关闭" value="closed"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="处理人">
              <el-input v-model="processForm.handler" placeholder="请输入处理人姓名"></el-input>
            </el-form-item>
            <el-form-item label="处理备注">
              <el-input v-model="processForm.note" placeholder="请输入处理备注" type="textarea" :rows="4"></el-input>
            </el-form-item>
          </el-form>
        </div>
        
        <div v-if="selectedAlert.status !== 'pending'" class="process-records">
          <h3>处理记录</h3>
          <div v-if="selectedAlert.processRecords && selectedAlert.processRecords.length > 0" class="records-list">
            <div v-for="record in selectedAlert.processRecords" :key="record.time" class="record-item">
              <div class="record-header">
                <span class="record-handler">{{ record.handler }}</span>
                <span class="record-time">{{ formatDateTime(record.time) }}</span>
              </div>
              <div class="record-content">
                <div class="record-status">状态更新为：{{ getStatusText(record.status) }}</div>
                <div class="record-note">{{ record.note }}</div>
              </div>
            </div>
          </div>
          <div v-else class="no-data">暂无处理记录</div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="alertDetailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="selectedAlert && selectedAlert.status === 'pending'" 
            type="primary" 
            @click="confirmProcessAlert"
          >
            确认处理
          </el-button>
          <el-button 
            v-if="selectedAlert && selectedAlert.status === 'processing'" 
            type="success" 
            @click="markAsResolved"
          >
            标记已解决
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量处理对话框 -->
    <el-dialog
      v-model="bulkProcessDialogVisible"
      title="批量处理预警"
      width="500px"
    >
      <div class="bulk-process-content">
        <p class="bulk-process-info">
          您正在批量处理 <span class="highlight">{{ selectedAlerts.length }}</span> 条预警
        </p>
        <el-form :model="bulkProcessForm" label-width="100px">
          <el-form-item label="处理状态" prop="status">
            <el-select v-model="bulkProcessForm.status" placeholder="请选择处理状态">
              <el-option label="处理中" value="processing"></el-option>
              <el-option label="已解决" value="resolved"></el-option>
              <el-option label="已关闭" value="closed"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="处理人" prop="handler">
            <el-input v-model="bulkProcessForm.handler" placeholder="请输入处理人姓名"></el-input>
          </el-form-item>
          <el-form-item label="处理备注" prop="note">
            <el-input v-model="bulkProcessForm.note" placeholder="请输入处理备注" type="textarea" :rows="3"></el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bulkProcessDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBulkProcess">确认处理</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  AlarmClock, Refresh, Warning, CircleClose, InfoFilled, Bell
} from '@element-plus/icons-vue'

export default {
  name: 'AlertCenter',
  components: {
    AlarmClock, Refresh, Warning, CircleClose, InfoFilled, Bell
  },
  setup() {
    // 筛选条件
    const severityFilter = ref('')
    const statusFilter = ref('')
    const typeFilter = ref('')
    const dateRangeFilter = ref(null)
    const searchKeyword = ref('')
    
    // 分页
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    // 状态
    const loading = ref(false)
    const selectedAlerts = ref([])
    const selectedAlert = ref(null)
    
    // 对话框
    const alertDetailDialogVisible = ref(false)
    const bulkProcessDialogVisible = ref(false)
    
    // 预警数据
    const alerts = ref([])
    
    // 处理表单
    const processForm = reactive({
      status: 'processing',
      handler: '',
      note: ''
    })
    
    // 批量处理表单
    const bulkProcessForm = reactive({
      status: 'processing',
      handler: '',
      note: ''
    })
    
    // 计算属性：筛选后的预警列表
    const filteredAlerts = computed(() => {
      return alerts.value.filter(alert => {
        const matchesSeverity = !severityFilter.value || alert.severity === severityFilter.value
        const matchesStatus = !statusFilter.value || alert.status === statusFilter.value
        const matchesType = !typeFilter.value || alert.type === typeFilter.value
        const matchesDate = !dateRangeFilter.value || 
          (new Date(alert.createdAt) >= new Date(dateRangeFilter.value[0]) && 
           new Date(alert.createdAt) <= new Date(dateRangeFilter.value[1]))
        const matchesKeyword = !searchKeyword.value || 
          alert.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          alert.description.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          alert.zoneName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          alert.deviceName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          alert.deviceId.toLowerCase().includes(searchKeyword.value.toLowerCase())
        
        return matchesSeverity && matchesStatus && matchesType && matchesDate && matchesKeyword
      })
    })
    
    // 统计数据
    const criticalAlertCount = computed(() => {
      return alerts.value.filter(alert => alert.severity === 'critical' && alert.status === 'pending').length
    })
    
    const warningAlertCount = computed(() => {
      return alerts.value.filter(alert => alert.severity === 'warning' && alert.status === 'pending').length
    })
    
    const infoAlertCount = computed(() => {
      return alerts.value.filter(alert => alert.severity === 'info' && alert.status === 'pending').length
    })
    
    const totalAlertCount = computed(() => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return alerts.value.filter(alert => new Date(alert.createdAt) >= today).length
    })
    
    // 获取预警级别文本
    const getSeverityText = (severity) => {
      const texts = {
        critical: '紧急',
        warning: '警告',
        info: '提示'
      }
      return texts[severity] || severity
    }
    
    // 获取预警级别标签类型
    const getSeverityTagType = (severity) => {
      const types = {
        critical: 'danger',
        warning: 'warning',
        info: 'info'
      }
      return types[severity] || 'info'
    }
    
    // 获取预警类型文本
    const getTypeText = (type) => {
      const texts = {
        energy_overlimit: '能耗超标',
        device_offline: '设备离线',
        data_abnormal: '数据异常',
        device_fault: '设备故障',
        threshold_alert: '阈值预警'
      }
      return texts[type] || type
    }
    
    // 获取预警类型标签类型
    const getTypeTagType = (type) => {
      const types = {
        energy_overlimit: 'warning',
        device_offline: 'danger',
        data_abnormal: 'info',
        device_fault: 'danger',
        threshold_alert: 'warning'
      }
      return types[type] || 'info'
    }
    
    // 获取预警状态文本
    const getStatusText = (status) => {
      const texts = {
        pending: '待处理',
        processing: '处理中',
        resolved: '已解决',
        closed: '已关闭'
      }
      return texts[status] || status
    }
    
    // 获取预警状态标签类型
    const getStatusTagType = (status) => {
      const types = {
        pending: 'danger',
        processing: 'warning',
        resolved: 'success',
        closed: 'info'
      }
      return types[status] || 'info'
    }
    
    // 获取操作按钮类型
    const getActionButtonType = (alert) => {
      if (alert.status === 'pending') return 'primary'
      if (alert.status === 'processing') return 'success'
      return 'info'
    }
    
    // 获取操作按钮文本
    const getActionButtonText = (alert) => {
      if (alert.status === 'pending') return '处理'
      if (alert.status === 'processing') return '解决'
      return '查看'
    }
    
    // 判断预警是否已处理
    const isAlertProcessed = (alert) => {
      return alert.status === 'resolved' || alert.status === 'closed'
    }
    
    // 格式化日期时间
    const formatDateTime = (date) => {
      if (!date) return '--'
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
    }
    
    // 获取字段标签
    const getFieldLabel = (key) => {
      const labels = {
        actualValue: '实际值',
        threshold: '阈值',
        unit: '单位',
        duration: '持续时间',
        timestamp: '发生时间',
        location: '位置'
      }
      return labels[key] || key
    }
    
    // 格式化字段值
    const formatFieldValue = (key, value) => {
      if (key === 'timestamp') {
        return formatDateTime(value)
      }
      return value
    }
    
    // 处理预警点击
    const handleAlertClick = (row) => {
      // 标记为已读
      if (!row.isRead) {
        row.isRead = true
        ElMessage.success('预警已标记为已读')
      }
      
      // 查看详情
      viewAlertDetail(row)
    }
    
    // 处理选择变更
    const handleSelectionChange = (selection) => {
      selectedAlerts.value = selection
    }
    
    // 查看预警详情
    const viewAlertDetail = (alert) => {
      selectedAlert.value = { ...alert }
      
      // 初始化处理表单
      Object.assign(processForm, {
        status: 'processing',
        handler: '',
        note: ''
      })
      
      alertDetailDialogVisible.value = true
    }
    
    // 处理预警
    const processAlert = (alert) => {
      viewAlertDetail(alert)
    }
    
    // 确认处理预警
    const confirmProcessAlert = () => {
      if (!selectedAlert.value) return
      
      if (!processForm.handler) {
        ElMessage.warning('请输入处理人')
        return
      }
      
      // 创建处理记录
      const processRecord = {
        status: processForm.status,
        handler: processForm.handler,
        note: processForm.note,
        time: new Date().toISOString()
      }
      
      // 更新预警状态
      const alertIndex = alerts.value.findIndex(a => a.id === selectedAlert.value.id)
      if (alertIndex !== -1) {
        alerts.value[alertIndex].status = processForm.status
        alerts.value[alertIndex].handler = processForm.handler
        alerts.value[alertIndex].updatedAt = new Date().toISOString()
        
        // 添加处理记录
        if (!alerts.value[alertIndex].processRecords) {
          alerts.value[alertIndex].processRecords = []
        }
        alerts.value[alertIndex].processRecords.push(processRecord)
        
        ElMessage.success('预警处理成功')
      }
      
      // 更新选中的预警
      selectedAlert.value = { ...alerts.value[alertIndex] }
      
      // 如果是已解决或已关闭，则关闭对话框
      if (processForm.status === 'resolved' || processForm.status === 'closed') {
        alertDetailDialogVisible.value = false
      }
    }
    
    // 标记为已解决
    const markAsResolved = () => {
      if (!selectedAlert.value) return
      
      ElMessageBox.confirm(
        '确定要将此预警标记为已解决吗？',
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        }
      ).then(() => {
        // 创建处理记录
        const processRecord = {
          status: 'resolved',
          handler: processForm.handler || '系统管理员',
          note: '已解决问题',
          time: new Date().toISOString()
        }
        
        // 更新预警状态
        const alertIndex = alerts.value.findIndex(a => a.id === selectedAlert.value.id)
        if (alertIndex !== -1) {
          alerts.value[alertIndex].status = 'resolved'
          alerts.value[alertIndex].updatedAt = new Date().toISOString()
          
          // 添加处理记录
          if (!alerts.value[alertIndex].processRecords) {
            alerts.value[alertIndex].processRecords = []
          }
          alerts.value[alertIndex].processRecords.push(processRecord)
          
          ElMessage.success('预警已标记为已解决')
        }
        
        alertDetailDialogVisible.value = false
      }).catch(() => {
        // 取消操作
      })
    }
    
    // 批量处理预警
    const handleBulkProcessAlert = () => {
      if (selectedAlerts.value.length === 0) {
        ElMessage.warning('请先选择要处理的预警')
        return
      }
      
      // 只允许处理待处理的预警
      const pendingAlerts = selectedAlerts.value.filter(alert => alert.status === 'pending')
      if (pendingAlerts.length === 0) {
        ElMessage.warning('只能批量处理待处理状态的预警')
        return
      }
      
      selectedAlerts.value = pendingAlerts
      
      // 初始化批量处理表单
      Object.assign(bulkProcessForm, {
        status: 'processing',
        handler: '',
        note: ''
      })
      
      bulkProcessDialogVisible.value = true
    }
    
    // 确认批量处理
    const confirmBulkProcess = () => {
      if (!bulkProcessForm.handler) {
        ElMessage.warning('请输入处理人')
        return
      }
      
      // 创建处理记录
      const processRecord = {
        status: bulkProcessForm.status,
        handler: bulkProcessForm.handler,
        note: bulkProcessForm.note,
        time: new Date().toISOString()
      }
      
      // 更新选中的预警
      selectedAlerts.value.forEach(alert => {
        const alertIndex = alerts.value.findIndex(a => a.id === alert.id)
        if (alertIndex !== -1) {
          alerts.value[alertIndex].status = bulkProcessForm.status
          alerts.value[alertIndex].handler = bulkProcessForm.handler
          alerts.value[alertIndex].updatedAt = new Date().toISOString()
          
          // 添加处理记录
          if (!alerts.value[alertIndex].processRecords) {
            alerts.value[alertIndex].processRecords = []
          }
          alerts.value[alertIndex].processRecords.push(processRecord)
        }
      })
      
      ElMessage.success(`成功处理 ${selectedAlerts.value.length} 条预警`)
      bulkProcessDialogVisible.value = false
      selectedAlerts.value = []
    }
    
    // 刷新预警列表
    const refreshAlerts = () => {
      loading.value = true
      
      // 模拟刷新操作
      setTimeout(() => {
        // 重新生成一些新的预警数据
        generateMockAlerts()
        ElMessage.success('预警列表已刷新')
        loading.value = false
      }, 1000)
    }
    
    // 处理对话框关闭
    const handleDialogClose = () => {
      selectedAlert.value = null
      alertDetailDialogVisible.value = false
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pageSize.value = size
    }
    
    const handleCurrentChange = (current) => {
      currentPage.value = current
    }
    
    // 生成模拟预警数据
    const generateMockAlerts = () => {
      const now = new Date()
      
      alerts.value = [
        {
          id: 'ALERT-20231101-001',
          title: 'A栋3层电表读数异常升高',
          severity: 'critical',
          type: 'energy_overlimit',
          zoneName: 'A栋',
          deviceName: 'A栋电表1',
          deviceId: 'DEV-E0001',
          status: 'pending',
          description: 'A栋3层电表读数在过去30分钟内异常升高，当前值已超过阈值的150%，可能存在线路故障或设备异常。',
          data: {
            actualValue: 1850,
            threshold: 1200,
            unit: 'kWh',
            duration: '30分钟',
            timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
            location: 'A栋3层'
          },
          suggestion: '1. 立即派遣运维人员前往现场检查\n2. 检查线路是否存在短路或过载情况\n3. 核查该区域设备运行状态',
          similarAlerts: [
            { id: 'ALERT-20231015-008', createdAt: '2023-10-15T09:30:00Z', status: 'resolved', handler: '王工' },
            { id: 'ALERT-20230922-012', createdAt: '2023-09-22T14:20:00Z', status: 'resolved', handler: '李工' }
          ],
          isRead: false,
          createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
          updatedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
          handler: null,
          processRecords: []
        },
        {
          id: 'ALERT-20231101-002',
          title: 'B栋水表2号设备离线',
          severity: 'warning',
          type: 'device_offline',
          zoneName: 'B栋',
          deviceName: 'B栋水表2',
          deviceId: 'DEV-W0002',
          status: 'pending',
          description: 'B栋水表2号设备于10分钟前与系统断开连接，无法获取实时数据。',
          data: {
            lastOnlineTime: new Date(now.getTime() - 10 * 60000).toISOString(),
            duration: '10分钟',
            location: 'B栋2层'
          },
          suggestion: '1. 检查设备供电是否正常\n2. 检查网络连接是否稳定\n3. 尝试远程重启设备',
          similarAlerts: [
            { id: 'ALERT-20231028-015', createdAt: '2023-10-28T16:45:00Z', status: 'resolved', handler: '赵工' }
          ],
          isRead: true,
          createdAt: new Date(now.getTime() - 10 * 60000).toISOString(),
          updatedAt: new Date(now.getTime() - 10 * 60000).toISOString(),
          handler: null,
          processRecords: []
        },
        {
          id: 'ALERT-20231101-003',
          title: 'C栋燃气表数据异常波动',
          severity: 'info',
          type: 'data_abnormal',
          zoneName: 'C栋',
          deviceName: 'C栋燃气表1',
          deviceId: 'DEV-G0001',
          status: 'processing',
          description: 'C栋燃气表数据在过去1小时内出现不规则波动，建议进行数据校验。',
          data: {
            minValue: 5.2,
            maxValue: 8.7,
            avgValue: 6.8,
            unit: 'm³',
            duration: '1小时',
            timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
            location: 'C栋1层'
          },
          suggestion: '1. 检查数据采集系统\n2. 确认设备传感器是否正常\n3. 与历史数据进行对比分析',
          similarAlerts: [],
          isRead: true,
          createdAt: new Date(now.getTime() - 60 * 60000).toISOString(),
          updatedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
          handler: '刘工',
          processRecords: [
            {
              status: 'processing',
              handler: '刘工',
              note: '正在检查数据采集系统',
              time: new Date(now.getTime() - 30 * 60000).toISOString()
            }
          ]
        },
        {
          id: 'ALERT-20231101-004',
          title: 'D栋电表3号设备故障',
          severity: 'warning',
          type: 'device_fault',
          zoneName: 'D栋',
          deviceName: 'D栋电表3',
          deviceId: 'DEV-E0003',
          status: 'resolved',
          description: 'D栋电表3号设备出现通信故障，无法正常上报数据。',
          data: {
            errorCode: 'ERR-COM-003',
            lastDataTime: new Date(now.getTime() - 120 * 60000).toISOString(),
            duration: '2小时',
            location: 'D栋4层'
          },
          suggestion: '1. 更换设备通信模块\n2. 检查RS485通信线路\n3. 重新配置设备参数',
          similarAlerts: [
            { id: 'ALERT-20231005-022', createdAt: '2023-10-05T10:15:00Z', status: 'resolved', handler: '孙工' }
          ],
          isRead: true,
          createdAt: new Date(now.getTime() - 120 * 60000).toISOString(),
          updatedAt: new Date(now.getTime() - 60 * 60000).toISOString(),
          handler: '张工',
          processRecords: [
            {
              status: 'processing',
              handler: '张工',
              note: '前往现场检查设备',
              time: new Date(now.getTime() - 90 * 60000).toISOString()
            },
            {
              status: 'resolved',
              handler: '张工',
              note: '已更换通信模块，设备恢复正常',
              time: new Date(now.getTime() - 60 * 60000).toISOString()
            }
          ]
        },
        {
          id: 'ALERT-20231101-005',
          title: '停车场能耗接近阈值',
          severity: 'info',
          type: 'threshold_alert',
          zoneName: '停车场',
          deviceName: '停车场电表1',
          deviceId: 'DEV-E0006',
          status: 'pending',
          description: '停车场能耗已达到日阈值的85%，请注意监控。',
          data: {
            actualValue: 2550,
            threshold: 3000,
            unit: 'kWh',
            percentage: 85,
            timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
            location: '地下停车场'
          },
          suggestion: '1. 检查停车场照明系统\n2. 优化空调运行策略\n3. 确保节能措施有效执行',
          similarAlerts: [],
          isRead: false,
          createdAt: new Date(now.getTime() - 15 * 60000).toISOString(),
          updatedAt: new Date(now.getTime() - 15 * 60000).toISOString(),
          handler: null,
          processRecords: []
        }
      ]
    }
    
    onMounted(() => {
      generateMockAlerts()
    })
    
    return {
      severityFilter,
      statusFilter,
      typeFilter,
      dateRangeFilter,
      searchKeyword,
      currentPage,
      pageSize,
      loading,
      selectedAlerts,
      selectedAlert,
      alertDetailDialogVisible,
      bulkProcessDialogVisible,
      alerts,
      processForm,
      bulkProcessForm,
      filteredAlerts,
      criticalAlertCount,
      warningAlertCount,
      infoAlertCount,
      totalAlertCount,
      getSeverityText,
      getSeverityTagType,
      getTypeText,
      getTypeTagType,
      getStatusText,
      getStatusTagType,
      getActionButtonType,
      getActionButtonText,
      isAlertProcessed,
      formatDateTime,
      getFieldLabel,
      formatFieldValue,
      handleAlertClick,
      handleSelectionChange,
      viewAlertDetail,
      processAlert,
      confirmProcessAlert,
      markAsResolved,
      handleBulkProcessAlert,
      confirmBulkProcess,
      refreshAlerts,
      handleDialogClose,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.alert-center {
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

.alert-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  height: 120px;
}

.stat-card.critical {
  border-left: 4px solid #f56c6c;
}

.stat-card.warning {
  border-left: 4px solid #e6a23c;
}

.stat-card.info {
  border-left: 4px solid #67c23a;
}

.stat-card.total {
  border-left: 4px solid #409eff;
}

.stat-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding-left: 20px;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  opacity: 0.1;
}

.icon-large {
  font-size: 48px;
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

.alerts-table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.alert-title-wrapper {
  display: flex;
  align-items: center;
}

.unread {
  font-weight: bold;
  color: #333;
}

.alert-detail {
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

.alert-title {
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
}

.detail-content {
  margin-bottom: 20px;
}

.detail-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #303133;
}

.alert-description,
.alert-suggestion {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
}

.alert-data {
  margin-bottom: 10px;
}

.alert-history,
.process-records {
  margin-bottom: 10px;
}

.record-item {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 10px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.record-handler {
  font-weight: 500;
}

.record-content {
  font-size: 14px;
}

.record-status {
  margin-bottom: 5px;
  color: #303133;
}

.record-note {
  color: #606266;
  white-space: pre-wrap;
}

.process-form {
  padding: 10px 0;
  border-top: 1px solid #e4e7ed;
  margin-top: 10px;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #909399;
}

.bulk-process-info {
  margin-bottom: 20px;
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
  .alert-stats {
    grid-template-columns: repeat(2, 1fr);
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
  
  .alert-stats {
    grid-template-columns: 1fr;
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
}
</style>