<template>
  <div class="zone-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>区域/楼栋管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="openAddZoneDialog">
          <el-icon><Plus /></el-icon>
          新增区域
        </el-button>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="content-layout">
      <!-- 左侧地图区域 -->
      <el-card class="map-card">
        <template #header>
          <div class="card-header">
            <span>园区地图</span>
            <div class="map-controls">
              <el-select v-model="mapViewMode" placeholder="视图模式" size="small">
                <el-option label="平面地图" value="2d"></el-option>
                <el-option label="楼层分布" value="floor"></el-option>
              </el-select>
              <el-button size="small" @click="zoomIn">
                <el-icon><ZoomIn /></el-icon>
              </el-button>
              <el-button size="small" @click="zoomOut">
                <el-icon><ZoomOut /></el-icon>
              </el-button>
              <el-button size="small" @click="resetZoom">重置</el-button>
            </div>
          </div>
        </template>
        <div class="map-container">
          <!-- 模拟园区地图 - 使用SVG -->
          <svg 
            ref="parkMap" 
            viewBox="0 0 800 600" 
            class="park-svg"
            :style="{ transform: `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)` }"
          >
            <!-- 背景 -->
            <rect x="0" y="0" width="800" height="600" fill="#f0f2f5" />
            
            <!-- 道路 -->
            <rect x="100" y="250" width="600" height="40" fill="#c0c0c0" />
            <rect x="380" y="100" width="40" height="400" fill="#c0c0c0" />
            
            <!-- 楼栋 - A栋 -->
            <rect 
              x="150" 
              y="150" 
              width="200" 
              height="80" 
              rx="5" 
              :fill="selectedZoneId === 'a' ? '#409eff' : '#909399'"
              :stroke="getZoneAlertLevel('a') ? getAlertColor(getZoneAlertLevel('a')) : '#606266'"
              stroke-width="3"
              @click="selectZone('a')"
              class="zone-building"
            />
            <text x="250" y="190" text-anchor="middle" fill="white" font-size="16" font-weight="bold">A栋</text>
            <!-- A栋预警标记 -->
            <circle 
              v-if="getZoneAlertLevel('a')" 
              cx="340" 
              cy="150" 
              r="10" 
              :fill="getAlertColor(getZoneAlertLevel('a'))"
            />
            
            <!-- 楼栋 - B栋 -->
            <rect 
              x="450" 
              y="150" 
              width="200" 
              height="80" 
              rx="5" 
              :fill="selectedZoneId === 'b' ? '#409eff' : '#909399'"
              :stroke="getZoneAlertLevel('b') ? getAlertColor(getZoneAlertLevel('b')) : '#606266'"
              stroke-width="3"
              @click="selectZone('b')"
              class="zone-building"
            />
            <text x="550" y="190" text-anchor="middle" fill="white" font-size="16" font-weight="bold">B栋</text>
            <!-- B栋预警标记 -->
            <circle 
              v-if="getZoneAlertLevel('b')" 
              cx="640" 
              cy="150" 
              r="10" 
              :fill="getAlertColor(getZoneAlertLevel('b'))"
            />
            
            <!-- 楼栋 - C栋 -->
            <rect 
              x="150" 
              y="350" 
              width="200" 
              height="80" 
              rx="5" 
              :fill="selectedZoneId === 'c' ? '#409eff' : '#909399'"
              :stroke="getZoneAlertLevel('c') ? getAlertColor(getZoneAlertLevel('c')) : '#606266'"
              stroke-width="3"
              @click="selectZone('c')"
              class="zone-building"
            />
            <text x="250" y="390" text-anchor="middle" fill="white" font-size="16" font-weight="bold">C栋</text>
            <!-- C栋预警标记 -->
            <circle 
              v-if="getZoneAlertLevel('c')" 
              cx="340" 
              cy="350" 
              r="10" 
              :fill="getAlertColor(getZoneAlertLevel('c'))"
            />
            
            <!-- 楼栋 - D栋 -->
            <rect 
              x="450" 
              y="350" 
              width="200" 
              height="80" 
              rx="5" 
              :fill="selectedZoneId === 'd' ? '#409eff' : '#909399'"
              :stroke="getZoneAlertLevel('d') ? getAlertColor(getZoneAlertLevel('d')) : '#606266'"
              stroke-width="3"
              @click="selectZone('d')"
              class="zone-building"
            />
            <text x="550" y="390" text-anchor="middle" fill="white" font-size="16" font-weight="bold">D栋</text>
            <!-- D栋预警标记 -->
            <circle 
              v-if="getZoneAlertLevel('d')" 
              cx="640" 
              cy="350" 
              r="10" 
              :fill="getAlertColor(getZoneAlertLevel('d'))"
            />
            
            <!-- 停车场 -->
            <rect 
              x="150" 
              y="480" 
              width="500" 
              height="80" 
              rx="5" 
              :fill="selectedZoneId === 'parking' ? '#409eff' : '#909399'"
              :stroke="getZoneAlertLevel('parking') ? getAlertColor(getZoneAlertLevel('parking')) : '#606266'"
              stroke-width="3"
              @click="selectZone('parking')"
              class="zone-building"
            />
            <text x="400" y="520" text-anchor="middle" fill="white" font-size="16" font-weight="bold">停车场</text>
          </svg>
          
          <!-- 图例 -->
          <div class="map-legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: #409eff;"></div>
              <span>已选中</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #f56c6c;"></div>
              <span>高能耗</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #e6a23c;"></div>
              <span>中能耗</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #67c23a;"></div>
              <span>正常能耗</span>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 右侧区域列表和详情 -->
      <div class="right-panel">
        <!-- 区域列表 -->
        <el-card class="zone-list-card">
          <template #header>
            <div class="card-header">
              <span>区域列表</span>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索区域名称"
                clearable
                size="small"
                style="width: 200px;"
              ></el-input>
            </div>
          </template>
          <el-table 
            :data="filteredZones" 
            style="width: 100%"
            border
            @row-click="handleZoneClick"
          >
            <el-table-column prop="name" label="区域名称" width="120">
              <template #default="scope">
                <div class="zone-name-wrapper">
                  <span :class="{ 'highlight': selectedZoneId === scope.row.id }">{{ scope.row.name }}</span>
                  <el-tag 
                    v-if="getZoneAlertLevel(scope.row.id)" 
                    :type="getAlertTagType(getZoneAlertLevel(scope.row.id))" 
                    size="small"
                    style="margin-left: 5px;"
                  >
                    {{ getAlertText(getZoneAlertLevel(scope.row.id)) }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="deviceCount" label="设备数量" width="100" align="center"></el-table-column>
            <el-table-column prop="energyBaseline" label="能耗基准值" width="120" align="right">
              <template #default="scope">
                <span>{{ scope.row.energyBaseline }} kWh/天</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click.stop="editZone(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click.stop="deleteZone(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        
        <!-- 区域详情 -->
        <el-card v-if="selectedZone" class="zone-detail-card">
          <template #header>
            <div class="card-header">{{ selectedZone.name }} - 详情</div>
          </template>
          
          <!-- 基本信息 -->
          <el-descriptions :column="1" border>
            <el-descriptions-item label="区域ID">{{ selectedZone.id }}</el-descriptions-item>
            <el-descriptions-item label="区域名称">{{ selectedZone.name }}</el-descriptions-item>
            <el-descriptions-item label="包含设备数">{{ selectedZone.deviceCount }}</el-descriptions-item>
            <el-descriptions-item label="所属企业">{{ getEnterpriseNames(selectedZone.enterpriseIds) }}</el-descriptions-item>
            <el-descriptions-item label="能耗基准值">{{ selectedZone.energyBaseline }} kWh/天</el-descriptions-item>
            <el-descriptions-item label="今日能耗">{{ selectedZone.todayEnergy }} kWh</el-descriptions-item>
            <el-descriptions-item label="本月能耗">{{ selectedZone.monthEnergy }} kWh</el-descriptions-item>
            <el-descriptions-item label="能耗状态">
              <el-tag :type="getZoneStatusTagType(selectedZone.id)">
                {{ getZoneStatusText(selectedZone.id) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <!-- 操作按钮 -->
          <div class="detail-actions">
            <el-button type="primary" @click="associateDevice">关联设备</el-button>
            <el-button type="primary" @click="associateEnterprise">关联企业</el-button>
            <el-button @click="viewZoneEnergyData">能耗数据</el-button>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 新增/编辑区域对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑区域' : '新增区域'"
      width="500px"
    >
      <el-form ref="zoneForm" :model="zoneForm" label-width="120px" :rules="zoneFormRules">
        <el-form-item label="区域ID" prop="id" v-if="isEditMode">
          <el-input v-model="zoneForm.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="区域名称" prop="name">
          <el-input v-model="zoneForm.name" placeholder="请输入区域名称"></el-input>
        </el-form-item>
        <el-form-item label="能耗基准值" prop="energyBaseline">
          <el-input v-model.number="zoneForm.energyBaseline" placeholder="请输入能耗基准值"></el-input>
          <div class="el-form-item__help">单位: kWh/天</div>
        </el-form-item>
        <el-form-item label="所属企业" prop="enterpriseIds">
          <el-select v-model="zoneForm.enterpriseIds" placeholder="请选择所属企业" multiple collapse-tags>
            <el-option v-for="enterprise in enterprises" :key="enterprise.id" :label="enterprise.name" :value="enterprise.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区域描述">
          <el-input v-model="zoneForm.description" placeholder="请输入区域描述" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveZone">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 关联设备对话框 -->
    <el-dialog
      v-model="associateDeviceDialogVisible"
      title="关联设备"
      width="700px"
    >
      <el-form :model="associateDeviceForm" label-width="120px">
        <el-form-item label="已关联设备">
          <div class="device-tags">
            <el-tag 
              v-for="deviceId in selectedZone.associatedDevices" 
              :key="deviceId" 
              closable 
              :disable-transitions="false"
              @close="disassociateDevice(deviceId)"
            >
              {{ getDeviceName(deviceId) }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="未关联设备">
          <el-input
            v-model="deviceSearchKeyword"
            placeholder="搜索设备名称"
            clearable
            size="small"
            style="width: 200px; margin-bottom: 10px;"
          ></el-input>
          <el-checkbox-group v-model="selectedDevices">
            <el-checkbox 
              v-for="device in unassociatedDevices" 
              :key="device.id" 
              :label="device.id"
              style="display: block; margin-bottom: 5px;"
            >
              {{ device.name }} ({{ getDeviceTypeName(device.type) }})
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="associateDeviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAssociateDevices">确定关联</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 关联企业对话框 -->
    <el-dialog
      v-model="associateEnterpriseDialogVisible"
      title="关联企业"
      width="500px"
    >
      <el-form :model="associateEnterpriseForm" label-width="120px">
        <el-form-item label="选择企业">
          <el-checkbox-group v-model="zoneForm.enterpriseIds">
            <el-checkbox 
              v-for="enterprise in enterprises" 
              :key="enterprise.id" 
              :label="enterprise.id"
              style="display: block; margin-bottom: 5px;"
            >
              {{ enterprise.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="associateEnterpriseDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAssociateEnterprises">确定关联</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, ZoomIn, ZoomOut
} from '@element-plus/icons-vue'

export default {
  name: 'ZoneManagement',
  components: {
    Plus, ZoomIn, ZoomOut
  },
  setup() {
    // 地图相关
    const parkMap = ref(null)
    const mapViewMode = ref('2d')
    const zoomLevel = ref(1)
    const translateX = ref(0)
    const translateY = ref(0)
    
    // 筛选和选中状态
    const searchKeyword = ref('')
    const selectedZoneId = ref('')
    const deviceSearchKeyword = ref('')
    
    // 对话框状态
    const dialogVisible = ref(false)
    const isEditMode = ref(false)
    const associateDeviceDialogVisible = ref(false)
    const associateEnterpriseDialogVisible = ref(false)
    
    // 区域数据
    const zones = ref([])
    const selectedZone = computed(() => {
      return zones.value.find(z => z.id === selectedZoneId.value) || null
    })
    
    // 设备数据
    const devices = ref([])
    const selectedDevices = ref([])
    
    // 企业数据
    const enterprises = ref([])
    
    // 区域表单
    const zoneForm = reactive({
      id: '',
      name: '',
      energyBaseline: 1000,
      enterpriseIds: [],
      description: ''
    })
    
    // 区域表单验证规则
    const zoneFormRules = {
      name: [{ required: true, message: '请输入区域名称', trigger: 'blur' }],
      energyBaseline: [
        { required: true, message: '请输入能耗基准值', trigger: 'blur' },
        { type: 'number', min: 0, message: '能耗基准值必须为非负数', trigger: 'blur' }
      ]
    }
    
    // 关联设备表单
    const associateDeviceForm = reactive({})
    
    // 关联企业表单
    const associateEnterpriseForm = reactive({})
    
    // 过滤后的区域列表
    const filteredZones = computed(() => {
      if (!searchKeyword.value) return zones.value
      const keyword = searchKeyword.value.toLowerCase()
      return zones.value.filter(zone => 
        zone.name.toLowerCase().includes(keyword)
      )
    })
    
    // 未关联的设备列表
    const unassociatedDevices = computed(() => {
      if (!selectedZone.value) return []
      const associatedDeviceIds = selectedZone.value.associatedDevices || []
      let result = devices.value.filter(device => 
        !associatedDeviceIds.includes(device.id)
      )
      
      if (deviceSearchKeyword.value) {
        const keyword = deviceSearchKeyword.value.toLowerCase()
        result = result.filter(device => 
          device.name.toLowerCase().includes(keyword)
        )
      }
      
      return result
    })
    
    // 获取区域预警级别
    const getZoneAlertLevel = (zoneId) => {
      const zone = zones.value.find(z => z.id === zoneId)
      if (!zone) return null
      
      const ratio = zone.todayEnergy / zone.energyBaseline
      if (ratio > 1.2) return 'high'
      if (ratio > 1.0) return 'medium'
      return null
    }
    
    // 获取预警颜色
    const getAlertColor = (level) => {
      const colors = {
        high: '#f56c6c',
        medium: '#e6a23c',
        low: '#67c23a'
      }
      return colors[level] || '#909399'
    }
    
    // 获取预警标签类型
    const getAlertTagType = (level) => {
      const types = {
        high: 'danger',
        medium: 'warning',
        low: 'success'
      }
      return types[level] || 'info'
    }
    
    // 获取预警文本
    const getAlertText = (level) => {
      const texts = {
        high: '高能耗',
        medium: '中能耗',
        low: '正常'
      }
      return texts[level] || '未知'
    }
    
    // 获取区域状态标签类型
    const getZoneStatusTagType = (zoneId) => {
      const level = getZoneAlertLevel(zoneId)
      return getAlertTagType(level)
    }
    
    // 获取区域状态文本
    const getZoneStatusText = (zoneId) => {
      const level = getZoneAlertLevel(zoneId)
      return level ? getAlertText(level) : '正常'
    }
    
    // 获取企业名称列表
    const getEnterpriseNames = (enterpriseIds) => {
      if (!enterpriseIds || enterpriseIds.length === 0) return '--'
      return enterpriseIds
        .map(id => enterprises.value.find(e => e.id === id)?.name || '')
        .filter(name => name)
        .join(', ')
    }
    
    // 获取设备名称
    const getDeviceName = (deviceId) => {
      const device = devices.value.find(d => d.id === deviceId)
      return device ? device.name : deviceId
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
    
    // 选择区域
    const selectZone = (zoneId) => {
      selectedZoneId.value = zoneId
    }
    
    // 处理区域点击
    const handleZoneClick = (row) => {
      selectZone(row.id)
    }
    
    // 地图缩放
    const zoomIn = () => {
      if (zoomLevel.value < 2) {
        zoomLevel.value += 0.1
      }
    }
    
    const zoomOut = () => {
      if (zoomLevel.value > 0.5) {
        zoomLevel.value -= 0.1
      }
    }
    
    const resetZoom = () => {
      zoomLevel.value = 1
      translateX.value = 0
      translateY.value = 0
    }
    
    // 打开新增区域对话框
    const openAddZoneDialog = () => {
      // 重置表单
      Object.assign(zoneForm, {
        id: '',
        name: '',
        energyBaseline: 1000,
        enterpriseIds: [],
        description: ''
      })
      
      isEditMode.value = false
      dialogVisible.value = true
    }
    
    // 编辑区域
    const editZone = (zone) => {
      Object.assign(zoneForm, { ...zone })
      isEditMode.value = true
      dialogVisible.value = true
    }
    
    // 保存区域
    const saveZone = () => {
      if (isEditMode.value) {
        // 更新区域
        const index = zones.value.findIndex(z => z.id === zoneForm.id)
        if (index !== -1) {
          zones.value[index] = { ...zones.value[index], ...zoneForm }
          ElMessage.success('区域更新成功')
        }
      } else {
        // 新增区域
        const newZone = {
          ...zoneForm,
          id: `zone-${Date.now()}`,
          deviceCount: 0,
          todayEnergy: 0,
          monthEnergy: 0,
          associatedDevices: []
        }
        zones.value.push(newZone)
        ElMessage.success('区域新增成功')
      }
      
      dialogVisible.value = false
    }
    
    // 删除区域
    const deleteZone = (zone) => {
      ElMessageBox.confirm(
        `确定要删除区域「${zone.name}」吗？`,
        '删除区域',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = zones.value.findIndex(z => z.id === zone.id)
        if (index !== -1) {
          zones.value.splice(index, 1)
          if (selectedZoneId.value === zone.id) {
            selectedZoneId.value = ''
          }
          ElMessage.success('区域删除成功')
        }
      }).catch(() => {
        // 取消删除
      })
    }
    
    // 关联设备
    const associateDevice = () => {
      if (!selectedZone.value) {
        ElMessage.warning('请先选择一个区域')
        return
      }
      selectedDevices.value = []
      associateDeviceDialogVisible.value = true
    }
    
    // 取消关联设备
    const disassociateDevice = (deviceId) => {
      if (!selectedZone.value) return
      const index = selectedZone.value.associatedDevices.indexOf(deviceId)
      if (index !== -1) {
        selectedZone.value.associatedDevices.splice(index, 1)
        selectedZone.value.deviceCount = selectedZone.value.associatedDevices.length
        ElMessage.success('设备取消关联成功')
      }
    }
    
    // 确认关联设备
    const confirmAssociateDevices = () => {
      if (!selectedZone.value || selectedDevices.value.length === 0) {
        ElMessage.warning('请选择要关联的设备')
        return
      }
      
      // 添加新关联的设备
      selectedDevices.value.forEach(deviceId => {
        if (!selectedZone.value.associatedDevices.includes(deviceId)) {
          selectedZone.value.associatedDevices.push(deviceId)
        }
      })
      
      // 更新设备数量
      selectedZone.value.deviceCount = selectedZone.value.associatedDevices.length
      
      ElMessage.success(`成功关联 ${selectedDevices.value.length} 台设备`)
      associateDeviceDialogVisible.value = false
    }
    
    // 关联企业
    const associateEnterprise = () => {
      if (!selectedZone.value) {
        ElMessage.warning('请先选择一个区域')
        return
      }
      // 复制当前选中区域的企业ID
      zoneForm.enterpriseIds = [...selectedZone.value.enterpriseIds]
      associateEnterpriseDialogVisible.value = true
    }
    
    // 确认关联企业
    const confirmAssociateEnterprises = () => {
      if (!selectedZone.value) return
      
      selectedZone.value.enterpriseIds = [...zoneForm.enterpriseIds]
      ElMessage.success('企业关联成功')
      associateEnterpriseDialogVisible.value = false
    }
    
    // 查看区域能耗数据
    const viewZoneEnergyData = () => {
      if (!selectedZone.value) {
        ElMessage.warning('请先选择一个区域')
        return
      }
      // 这里可以跳转到能耗数据页面或打开能耗数据对话框
      ElMessage.info(`查看 ${selectedZone.value.name} 的能耗数据`)
    }
    
    // 生成模拟数据
    const generateMockData = () => {
      // 生成模拟区域数据
      zones.value = [
        {
          id: 'a',
          name: 'A栋',
          deviceCount: 25,
          energyBaseline: 1200,
          todayEnergy: 1350,
          monthEnergy: 38500,
          enterpriseIds: [1, 2],
          description: '办公楼A栋',
          associatedDevices: ['DEV-E0001', 'DEV-E0002', 'DEV-W0001', 'DEV-G0001']
        },
        {
          id: 'b',
          name: 'B栋',
          deviceCount: 20,
          energyBaseline: 1000,
          todayEnergy: 980,
          monthEnergy: 29500,
          enterpriseIds: [3],
          description: '办公楼B栋',
          associatedDevices: ['DEV-E0003', 'DEV-W0002', 'DEV-G0002']
        },
        {
          id: 'c',
          name: 'C栋',
          deviceCount: 15,
          energyBaseline: 800,
          todayEnergy: 750,
          monthEnergy: 22000,
          enterpriseIds: [2, 4],
          description: '研发中心C栋',
          associatedDevices: ['DEV-E0004', 'DEV-W0003', 'DEV-G0003', 'DEV-H0001']
        },
        {
          id: 'd',
          name: 'D栋',
          deviceCount: 18,
          energyBaseline: 900,
          todayEnergy: 1080,
          monthEnergy: 28500,
          enterpriseIds: [1, 4],
          description: '生产车间D栋',
          associatedDevices: ['DEV-E0005', 'DEV-W0004', 'DEV-G0004']
        },
        {
          id: 'parking',
          name: '停车场',
          deviceCount: 10,
          energyBaseline: 300,
          todayEnergy: 280,
          monthEnergy: 8500,
          enterpriseIds: [],
          description: '地下停车场',
          associatedDevices: ['DEV-E0006', 'DEV-E0007']
        }
      ]
      
      // 生成模拟设备数据
      devices.value = [
        { id: 'DEV-E0001', name: 'A栋电表1', type: 'electricity' },
        { id: 'DEV-E0002', name: 'A栋电表2', type: 'electricity' },
        { id: 'DEV-E0003', name: 'B栋电表1', type: 'electricity' },
        { id: 'DEV-E0004', name: 'C栋电表1', type: 'electricity' },
        { id: 'DEV-E0005', name: 'D栋电表1', type: 'electricity' },
        { id: 'DEV-E0006', name: '停车场电表1', type: 'electricity' },
        { id: 'DEV-E0007', name: '停车场电表2', type: 'electricity' },
        { id: 'DEV-E0008', name: '备用电表1', type: 'electricity' },
        { id: 'DEV-W0001', name: 'A栋水表1', type: 'water' },
        { id: 'DEV-W0002', name: 'B栋水表1', type: 'water' },
        { id: 'DEV-W0003', name: 'C栋水表1', type: 'water' },
        { id: 'DEV-W0004', name: 'D栋水表1', type: 'water' },
        { id: 'DEV-W0005', name: '备用水表1', type: 'water' },
        { id: 'DEV-G0001', name: 'A栋燃气表1', type: 'gas' },
        { id: 'DEV-G0002', name: 'B栋燃气表1', type: 'gas' },
        { id: 'DEV-G0003', name: 'C栋燃气表1', type: 'gas' },
        { id: 'DEV-G0004', name: 'D栋燃气表1', type: 'gas' },
        { id: 'DEV-G0005', name: '备用燃气表1', type: 'gas' },
        { id: 'DEV-H0001', name: 'C栋热量表1', type: 'heat' },
        { id: 'DEV-H0002', name: '备用热量表1', type: 'heat' }
      ]
      
      // 生成模拟企业数据
      enterprises.value = [
        { id: 1, name: '科技有限公司' },
        { id: 2, name: '智慧园区管理处' },
        { id: 3, name: '绿色能源公司' },
        { id: 4, name: '物业服务公司' }
      ]
    }
    
    onMounted(() => {
      generateMockData()
    })
    
    return {
      parkMap,
      mapViewMode,
      zoomLevel,
      translateX,
      translateY,
      searchKeyword,
      selectedZoneId,
      deviceSearchKeyword,
      dialogVisible,
      isEditMode,
      associateDeviceDialogVisible,
      associateEnterpriseDialogVisible,
      zones,
      selectedZone,
      devices,
      selectedDevices,
      enterprises,
      zoneForm,
      zoneFormRules,
      associateDeviceForm,
      associateEnterpriseForm,
      filteredZones,
      unassociatedDevices,
      getZoneAlertLevel,
      getAlertColor,
      getAlertTagType,
      getAlertText,
      getZoneStatusTagType,
      getZoneStatusText,
      getEnterpriseNames,
      getDeviceName,
      getDeviceTypeName,
      selectZone,
      handleZoneClick,
      zoomIn,
      zoomOut,
      resetZoom,
      openAddZoneDialog,
      editZone,
      saveZone,
      deleteZone,
      associateDevice,
      disassociateDevice,
      confirmAssociateDevices,
      associateEnterprise,
      confirmAssociateEnterprises,
      viewZoneEnergyData
    }
  }
}
</script>

<style scoped>
.zone-management {
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

.content-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.map-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.map-container {
  position: relative;
  height: 500px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.park-svg {
  transition: transform 0.3s ease;
  cursor: move;
}

.zone-building {
  cursor: pointer;
  transition: all 0.3s ease;
}

.zone-building:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.map-legend {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
  font-size: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.zone-name-wrapper {
  display: flex;
  align-items: center;
}

.highlight {
  color: #409eff;
  font-weight: bold;
}

.zone-list-card {
  margin-bottom: 20px;
}

.zone-detail-card {
  border-radius: 8px;
}

.detail-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.device-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .map-container {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .map-controls {
    width: 100%;
    justify-content: flex-start;
  }
  
  .detail-actions {
    flex-wrap: wrap;
  }
}
</style>