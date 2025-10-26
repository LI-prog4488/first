<template>
  <div class="device-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>设备管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="openAddDeviceDialog">
          <el-icon><Plus /></el-icon>
          新增设备
        </el-button>
      </div>
    </div>
    
    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="设备ID/名称">
              <el-input v-model="filterForm.keyword" placeholder="请输入设备ID或名称" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="设备类型">
              <el-select v-model="filterForm.deviceType" placeholder="选择设备类型" clearable>
                <el-option label="电表" value="electricity"></el-option>
                <el-option label="水表" value="water"></el-option>
                <el-option label="燃气表" value="gas"></el-option>
                <el-option label="热量表" value="heat"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="设备状态">
              <el-select v-model="filterForm.status" placeholder="选择设备状态" clearable>
                <el-option label="在线" value="online"></el-option>
                <el-option label="离线" value="offline"></el-option>
                <el-option label="故障" value="fault"></el-option>
                <el-option label="维护中" value="maintenance"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="所属区域">
              <el-select v-model="filterForm.zoneId" placeholder="选择区域" clearable>
                <el-option v-for="zone in zones" :key="zone.id" :label="zone.name" :value="zone.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 10px;">
          <el-col :span="24" style="text-align: right;">
            <el-form-item>
              <el-button type="primary" @click="queryDevices">查询</el-button>
              <el-button @click="resetFilter">重置</el-button>
              <el-button @click="exportDeviceList">导出列表</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <!-- 设备列表 -->
    <el-card class="device-list-card">
      <el-table 
        v-loading="loading" 
        :data="filteredDevices" 
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="设备ID" width="120"></el-table-column>
        <el-table-column prop="name" label="设备名称" min-width="150">
          <template #default="scope">
            <el-button type="text" @click="viewDeviceDetail(scope.row)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="设备类型" width="100">
          <template #default="scope">
            <el-tag :type="getDeviceTypeTagType(scope.row.type)">
              {{ getDeviceTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="zoneName" label="所属区域" width="100"></el-table-column>
        <el-table-column prop="location" label="安装位置" min-width="120"></el-table-column>
        <el-table-column prop="status" label="设备状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastOnlineTime" label="最后在线时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.lastOnlineTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="installTime" label="安装时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.installTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="editDevice(scope.row)">编辑</el-button>
            <el-button size="small" @click="resetDeviceStatus(scope.row)">重置状态</el-button>
            <el-button size="small" type="danger" @click="deleteDevice(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="devices.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 批量操作 -->
    <div class="batch-operations" v-if="selectedDevices.length > 0">
      <span>已选择 {{ selectedDevices.length }} 台设备</span>
      <el-button type="warning" @click="batchResetStatus">批量重置状态</el-button>
      <el-button type="danger" @click="batchDeleteDevices">批量删除</el-button>
    </div>
    
    <!-- 新增/编辑设备对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑设备' : '新增设备'"
      width="600px"
    >
      <el-form ref="deviceForm" :model="deviceForm" label-width="120px" :rules="deviceFormRules">
        <el-form-item label="设备ID" prop="id" v-if="isEditMode">
          <el-input v-model="deviceForm.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" placeholder="请输入设备名称"></el-input>
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择设备类型">
            <el-option label="电表" value="electricity"></el-option>
            <el-option label="水表" value="water"></el-option>
            <el-option label="燃气表" value="gas"></el-option>
            <el-option label="热量表" value="heat"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属区域" prop="zoneId">
          <el-select v-model="deviceForm.zoneId" placeholder="请选择所属区域">
            <el-option v-for="zone in zones" :key="zone.id" :label="zone.name" :value="zone.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="deviceForm.location" placeholder="请输入安装位置"></el-input>
        </el-form-item>
        <el-form-item label="设备型号" prop="model">
          <el-input v-model="deviceForm.model" placeholder="请输入设备型号"></el-input>
        </el-form-item>
        <el-form-item label="设备精度" prop="precision">
          <el-input v-model.number="deviceForm.precision" placeholder="请输入设备精度"></el-input>
        </el-form-item>
        <el-form-item label="设备状态" prop="status" v-if="isEditMode">
          <el-select v-model="deviceForm.status" placeholder="请选择设备状态">
            <el-option label="在线" value="online"></el-option>
            <el-option label="离线" value="offline"></el-option>
            <el-option label="故障" value="fault"></el-option>
            <el-option label="维护中" value="maintenance"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDevice">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 设备详情抽屉 -->
    <el-drawer
      v-model="deviceDetailVisible"
      :title="`设备详情 - ${selectedDevice?.name || ''}`"
      direction="rtl"
      size="50%"
    >
      <div v-if="selectedDevice" class="device-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">基本信息</div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="设备ID">{{ selectedDevice.id }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ selectedDevice.name }}</el-descriptions-item>
            <el-descriptions-item label="设备类型">{{ getDeviceTypeName(selectedDevice.type) }}</el-descriptions-item>
            <el-descriptions-item label="所属区域">{{ selectedDevice.zoneName }}</el-descriptions-item>
            <el-descriptions-item label="安装位置">{{ selectedDevice.location }}</el-descriptions-item>
            <el-descriptions-item label="设备型号">{{ selectedDevice.model }}</el-descriptions-item>
            <el-descriptions-item label="设备精度">{{ selectedDevice.precision }}</el-descriptions-item>
            <el-descriptions-item label="设备状态">
              <el-tag :type="getStatusTagType(selectedDevice.status)">
                {{ getStatusName(selectedDevice.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最后在线时间">{{ formatDateTime(selectedDevice.lastOnlineTime) }}</el-descriptions-item>
            <el-descriptions-item label="安装时间">{{ formatDateTime(selectedDevice.installTime) }}</el-descriptions-item>
          </el-descriptions>
          <div class="detail-actions">
            <el-button type="primary" @click="remoteControl(selectedDevice)">远程控制</el-button>
            <el-button type="warning" @click="resetDeviceStatus(selectedDevice)">重置状态</el-button>
          </div>
        </el-card>
        
        <!-- 历史数据 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">最近7天数据</div>
          </template>
          <div ref="deviceHistoryChart" style="width: 100%; height: 300px;"></div>
        </el-card>
        
        <!-- 故障记录 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">故障记录</div>
          </template>
          <el-table :data="selectedDevice.faultRecords" style="width: 100%" size="small">
            <el-table-column prop="time" label="故障时间" width="180"></el-table-column>
            <el-table-column prop="description" label="故障描述"></el-table-column>
            <el-table-column prop="status" label="处理状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'resolved' ? 'success' : 'danger'">
                  {{ scope.row.status === 'resolved' ? '已解决' : '未解决' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        
        <!-- 维护日志 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">维护日志</div>
          </template>
          <el-table :data="selectedDevice.maintenanceLogs" style="width: 100%" size="small">
            <el-table-column prop="time" label="维护时间" width="180"></el-table-column>
            <el-table-column prop="maintenancePerson" label="维护人员" width="120"></el-table-column>
            <el-table-column prop="content" label="维护内容"></el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  Plus
} from '@element-plus/icons-vue'

export default {
  name: 'DeviceManagement',
  components: {
    Plus
  },
  setup() {
    const loading = ref(false)
    
    // 图表引用
    const deviceHistoryChart = ref(null)
    let historyChartInstance = null
    
    // 筛选条件
    const filterForm = reactive({
      keyword: '',
      deviceType: '',
      status: '',
      zoneId: ''
    })
    
    // 分页信息
    const pagination = reactive({
      currentPage: 1,
      pageSize: 20
    })
    
    // 模拟区域数据
    const zones = reactive([
      { id: 'a', name: 'A栋' },
      { id: 'b', name: 'B栋' },
      { id: 'c', name: 'C栋' },
      { id: 'd', name: 'D栋' },
      { id: 'parking', name: '停车场' }
    ])
    
    // 设备数据
    const devices = ref([])
    
    // 选中的设备
    const selectedDevices = ref([])
    
    // 对话框状态
    const dialogVisible = ref(false)
    const isEditMode = ref(false)
    
    // 设备详情抽屉
    const deviceDetailVisible = ref(false)
    const selectedDevice = ref(null)
    
    // 设备表单
    const deviceForm = reactive({
      id: '',
      name: '',
      type: '',
      zoneId: '',
      location: '',
      model: '',
      precision: '',
      status: 'online'
    })
    
    // 设备表单验证规则
    const deviceFormRules = {
      name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
      type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
      zoneId: [{ required: true, message: '请选择所属区域', trigger: 'change' }],
      location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
      model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
      precision: [{ required: true, message: '请输入设备精度', trigger: 'blur' },
                 { type: 'number', message: '设备精度必须为数字', trigger: 'blur' }]
    }
    
    // 格式化日期时间
    const formatDateTime = (date) => {
      if (!date) return '--'
      const d = new Date(date)
      return d.toLocaleString('zh-CN')
    }
    
    // 获取设备类型名称
    const getDeviceTypeName = (type) => {
      const types = {
        electricity: '电表',
        water: '水表',
        gas: '燃气表',
        heat: '热量表'
      }
      return types[type] || type
    }
    
    // 获取设备类型标签类型
    const getDeviceTypeTagType = (type) => {
      const types = {
        electricity: 'primary',
        water: 'info',
        gas: 'warning',
        heat: 'danger'
      }
      return types[type] || 'default'
    }
    
    // 获取状态名称
    const getStatusName = (status) => {
      const statuses = {
        online: '在线',
        offline: '离线',
        fault: '故障',
        maintenance: '维护中'
      }
      return statuses[status] || status
    }
    
    // 获取状态标签类型
    const getStatusTagType = (status) => {
      const statuses = {
        online: 'success',
        offline: 'info',
        fault: 'danger',
        maintenance: 'warning'
      }
      return statuses[status] || 'default'
    }
    
    // 过滤设备数据
    const filteredDevices = computed(() => {
      let result = [...devices.value]
      
      // 按关键词筛选
      if (filterForm.keyword) {
        const keyword = filterForm.keyword.toLowerCase()
        result = result.filter(device => 
          device.id.toLowerCase().includes(keyword) || 
          device.name.toLowerCase().includes(keyword)
        )
      }
      
      // 按设备类型筛选
      if (filterForm.deviceType) {
        result = result.filter(device => device.type === filterForm.deviceType)
      }
      
      // 按设备状态筛选
      if (filterForm.status) {
        result = result.filter(device => device.status === filterForm.status)
      }
      
      // 按所属区域筛选
      if (filterForm.zoneId) {
        result = result.filter(device => device.zoneId === filterForm.zoneId)
      }
      
      // 分页
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize
      const endIndex = startIndex + pagination.pageSize
      return result.slice(startIndex, endIndex)
    })
    
    // 生成模拟设备数据
    const generateMockDevices = () => {
      const mockDevices = []
      const deviceTypes = ['electricity', 'water', 'gas', 'heat']
      const deviceStatuses = ['online', 'offline', 'fault', 'maintenance']
      
      for (let i = 1; i <= 100; i++) {
        const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]
        const deviceStatus = deviceStatuses[Math.floor(Math.random() * deviceStatuses.length)]
        const zone = zones[Math.floor(Math.random() * zones.length)]
        
        // 生成随机时间
        const now = new Date()
        const installTime = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        const lastOnlineTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000)
        
        mockDevices.push({
          id: `DEV-${deviceType.charAt(0).toUpperCase()}${String(i).padStart(4, '0')}`,
          name: `${getDeviceTypeName(deviceType)}${i}`,
          type: deviceType,
          zoneId: zone.id,
          zoneName: zone.name,
          location: `${zone.name}${Math.floor(Math.random() * 20) + 1}层${String.fromCharCode(65 + Math.floor(Math.random() * 26))}区`,
          model: `${deviceType.toUpperCase()}-${Math.floor(Math.random() * 1000) + 1000}`,
          precision: Math.random() > 0.5 ? 0.5 : 1.0,
          status: deviceStatus,
          installTime: installTime,
          lastOnlineTime: lastOnlineTime,
          faultRecords: generateFaultRecords(3),
          maintenanceLogs: generateMaintenanceLogs(5)
        })
      }
      
      devices.value = mockDevices
    }
    
    // 生成故障记录
    const generateFaultRecords = (count) => {
      const records = []
      const descriptions = ['通讯中断', '数据异常', '电量异常', '压力异常', '流量异常']
      
      for (let i = 0; i < count; i++) {
        const now = new Date()
        const faultTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        
        records.push({
          id: i + 1,
          time: faultTime,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          status: Math.random() > 0.3 ? 'resolved' : 'unresolved'
        })
      }
      
      return records.sort((a, b) => b.time - a.time)
    }
    
    // 生成维护日志
    const generateMaintenanceLogs = (count) => {
      const logs = []
      const maintenancePersons = ['张工', '李工', '王工', '赵工']
      const contents = ['设备例行检查', '软件升级', '硬件维护', '传感器校准', '电池更换']
      
      for (let i = 0; i < count; i++) {
        const now = new Date()
        const maintenanceTime = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        
        logs.push({
          id: i + 1,
          time: maintenanceTime,
          maintenancePerson: maintenancePersons[Math.floor(Math.random() * maintenancePersons.length)],
          content: contents[Math.floor(Math.random() * contents.length)]
        })
      }
      
      return logs.sort((a, b) => b.time - a.time)
    }
    
    // 查询设备
    const queryDevices = () => {
      loading.value = true
      
      // 模拟API请求延迟
      setTimeout(() => {
        loading.value = false
      }, 500)
    }
    
    // 重置筛选条件
    const resetFilter = () => {
      filterForm.keyword = ''
      filterForm.deviceType = ''
      filterForm.status = ''
      filterForm.zoneId = ''
      pagination.currentPage = 1
      
      queryDevices()
    }
    
    // 导出设备列表
    const exportDeviceList = () => {
      ElMessageBox.confirm(
        '确定要导出设备列表吗？',
        '导出列表',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(() => {
        loading.value = true
        // 模拟导出操作
        setTimeout(() => {
          loading.value = false
          ElMessage.success('设备列表导出成功')
        }, 1000)
      }).catch(() => {
        // 取消导出
      })
    }
    
    // 处理选择变化
    const handleSelectionChange = (selection) => {
      selectedDevices.value = selection
    }
    
    // 处理分页大小变化
    const handleSizeChange = (size) => {
      pagination.pageSize = size
      pagination.currentPage = 1
    }
    
    // 处理当前页变化
    const handleCurrentChange = (current) => {
      pagination.currentPage = current
    }
    
    // 打开新增设备对话框
    const openAddDeviceDialog = () => {
      // 重置表单
      Object.assign(deviceForm, {
        id: '',
        name: '',
        type: '',
        zoneId: '',
        location: '',
        model: '',
        precision: '',
        status: 'online'
      })
      
      isEditMode.value = false
      dialogVisible.value = true
    }
    
    // 编辑设备
    const editDevice = (device) => {
      Object.assign(deviceForm, { ...device })
      isEditMode.value = true
      dialogVisible.value = true
    }
    
    // 保存设备
    const saveDevice = () => {
      if (isEditMode.value) {
        // 更新设备
        const index = devices.value.findIndex(d => d.id === deviceForm.id)
        if (index !== -1) {
          devices.value[index] = { ...deviceForm }
          ElMessage.success('设备更新成功')
        }
      } else {
        // 新增设备
        const newDevice = {
          ...deviceForm,
          id: `DEV-${deviceForm.type.charAt(0).toUpperCase()}${String(devices.value.length + 1).padStart(4, '0')}`,
          zoneName: zones.find(z => z.id === deviceForm.zoneId)?.name || '',
          installTime: new Date(),
          lastOnlineTime: new Date(),
          faultRecords: [],
          maintenanceLogs: []
        }
        devices.value.unshift(newDevice)
        ElMessage.success('设备新增成功')
      }
      
      dialogVisible.value = false
    }
    
    // 删除设备
    const deleteDevice = (device) => {
      ElMessageBox.confirm(
        `确定要删除设备「${device.name}」吗？`,
        '删除设备',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = devices.value.findIndex(d => d.id === device.id)
        if (index !== -1) {
          devices.value.splice(index, 1)
          ElMessage.success('设备删除成功')
        }
      }).catch(() => {
        // 取消删除
      })
    }
    
    // 重置设备状态
    const resetDeviceStatus = (device) => {
      ElMessageBox.confirm(
        `确定要重置设备「${device.name}」的状态吗？`,
        '重置状态',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(() => {
        const index = devices.value.findIndex(d => d.id === device.id)
        if (index !== -1) {
          devices.value[index].status = 'online'
          devices.value[index].lastOnlineTime = new Date()
          ElMessage.success('设备状态重置成功')
        }
      }).catch(() => {
        // 取消重置
      })
    }
    
    // 批量重置状态
    const batchResetStatus = () => {
      ElMessageBox.confirm(
        `确定要重置选中的 ${selectedDevices.value.length} 台设备状态吗？`,
        '批量重置状态',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(() => {
        selectedDevices.value.forEach(device => {
          const index = devices.value.findIndex(d => d.id === device.id)
          if (index !== -1) {
            devices.value[index].status = 'online'
            devices.value[index].lastOnlineTime = new Date()
          }
        })
        ElMessage.success('批量重置状态成功')
        selectedDevices.value = []
      }).catch(() => {
        // 取消操作
      })
    }
    
    // 批量删除设备
    const batchDeleteDevices = () => {
      ElMessageBox.confirm(
        `确定要删除选中的 ${selectedDevices.value.length} 台设备吗？`,
        '批量删除设备',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const deviceIds = selectedDevices.value.map(device => device.id)
        devices.value = devices.value.filter(device => !deviceIds.includes(device.id))
        ElMessage.success('批量删除成功')
        selectedDevices.value = []
      }).catch(() => {
        // 取消操作
      })
    }
    
    // 查看设备详情
    const viewDeviceDetail = (device) => {
      selectedDevice.value = { ...device }
      deviceDetailVisible.value = true
      
      nextTick(() => {
        initDeviceHistoryChart()
      })
    }
    
    // 远程控制
    const remoteControl = (device) => {
      ElMessageBox.confirm(
        `确定要对设备「${device.name}」进行远程重启吗？`,
        '远程控制',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(() => {
        ElMessage.success('远程重启命令已发送')
      }).catch(() => {
        // 取消操作
      })
    }
    
    // 初始化设备历史图表
    const initDeviceHistoryChart = () => {
      if (deviceHistoryChart.value && selectedDevice.value) {
        if (historyChartInstance) {
          historyChartInstance.dispose()
        }
        
        historyChartInstance = echarts.init(deviceHistoryChart.value)
        
        // 生成最近7天的数据
        const dates = []
        const values = []
        const now = new Date()
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          dates.push(date.toLocaleDateString('zh-CN'))
          
          // 根据设备类型生成不同范围的数据
          let baseValue = 0
          let range = 0
          
          switch (selectedDevice.value.type) {
            case 'electricity':
              baseValue = 10000
              range = 2000
              break
            case 'water':
              baseValue = 100
              range = 20
              break
            case 'gas':
              baseValue = 50
              range = 10
              break
            case 'heat':
              baseValue = 20
              range = 5
              break
          }
          
          values.push(baseValue + (Math.random() - 0.5) * 2 * range)
        }
        
        const energyConfig = {
          electricity: { name: '电量', unit: 'kWh', color: '#1890ff' },
          water: { name: '水量', unit: 'm³', color: '#13c2c2' },
          gas: { name: '气量', unit: 'm³', color: '#fa8c16' },
          heat: { name: '热量', unit: 'GJ', color: '#f5222d' }
        }
        
        const config = energyConfig[selectedDevice.value.type]
        
        const option = {
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: dates
          },
          yAxis: {
            type: 'value',
            name: config.unit
          },
          series: [{
            name: config.name,
            type: 'line',
            data: values,
            itemStyle: {
              color: config.color
            },
            smooth: true
          }]
        }
        
        historyChartInstance.setOption(option)
      }
    }
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (historyChartInstance) {
        historyChartInstance.resize()
      }
    }
    
    onMounted(() => {
      generateMockDevices()
      window.addEventListener('resize', handleResize)
    })
    
    // 组件卸载时清理
    const cleanup = () => {
      window.removeEventListener('resize', handleResize)
      if (historyChartInstance) {
        historyChartInstance.dispose()
      }
    }
    
    return {
      loading,
      filterForm,
      pagination,
      zones,
      devices,
      filteredDevices,
      selectedDevices,
      dialogVisible,
      isEditMode,
      deviceForm,
      deviceFormRules,
      deviceDetailVisible,
      selectedDevice,
      deviceHistoryChart,
      formatDateTime,
      getDeviceTypeName,
      getDeviceTypeTagType,
      getStatusName,
      getStatusTagType,
      queryDevices,
      resetFilter,
      exportDeviceList,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      openAddDeviceDialog,
      editDevice,
      saveDevice,
      deleteDevice,
      resetDeviceStatus,
      batchResetStatus,
      batchDeleteDevices,
      viewDeviceDetail,
      remoteControl
    }
  }
}
</script>

<style scoped>
.device-management {
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

.filter-card {
  margin-bottom: 20px;
}

.device-list-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.batch-operations {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.device-detail {
  padding: 10px 0;
}

.detail-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  font-weight: 600;
}

.detail-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .el-row {
    flex-wrap: wrap;
  }
  
  .el-col {
    margin-bottom: 10px;
  }
}

@media (max-width: 768px) {
  .batch-operations {
    flex-wrap: wrap;
  }
}
</style>