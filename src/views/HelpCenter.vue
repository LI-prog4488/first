<template>
  <div class="help-center">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>帮助中心</h1>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>帮助中心</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="输入关键词搜索帮助内容"
        prefix-icon="el-icon-search"
        clearable
        size="large"
        @keyup.enter="handleSearch"
        class="help-search-input"
      >
        <template #append>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 帮助中心选项卡 -->
    <el-tabs v-model="activeTab" type="border-card" class="help-tabs">
      <!-- 功能说明 -->
      <el-tab-pane label="功能说明" name="features">
        <div class="features-section">
          <!-- 分类导航 -->
          <el-card class="categories-card">
            <template #header>
              <div class="card-header">
                <span>功能分类</span>
              </div>
            </template>
            
            <el-menu
              :default-active="activeCategory"
              class="category-menu"
              @select="handleCategorySelect"
              router
            >
              <el-menu-item index="dashboard">
            <el-icon><PieChart /></el-icon>
            <span>仪表盘功能</span>
          </el-menu-item>
              <el-menu-item index="monitoring">
                <el-icon><VideoPlay /></el-icon>
                <span>实时监控</span>
              </el-menu-item>
              <el-menu-item index="query">
                <el-icon><Search /></el-icon>
                <span>历史查询</span>
              </el-menu-item>
              <el-menu-item index="analysis">
            <el-icon><DocumentCopy /></el-icon>
            <span>能耗分析</span>
          </el-menu-item>
              <el-menu-item index="devices">
                <el-icon><Monitor /></el-icon>
                <span>设备管理</span>
              </el-menu-item>
              <el-menu-item index="zones">
                <el-icon><Location /></el-icon>
                <span>区域管理</span>
              </el-menu-item>
              <el-menu-item index="enterprise">
            <el-icon><Document /></el-icon>
            <span>企业/用户管理</span>
          </el-menu-item>
              <el-menu-item index="alerts">
                <el-icon><Warning /></el-icon>
                <span>异常预警</span>
              </el-menu-item>
              <el-menu-item index="faults">
                <el-icon><Tools /></el-icon>
                <span>故障处理</span>
              </el-menu-item>
              <el-menu-item index="settings">
                <el-icon><Setting /></el-icon>
                <span>系统设置</span>
              </el-menu-item>
              <el-menu-item index="personal">
                <el-icon><User /></el-icon>
                <span>个人中心</span>
              </el-menu-item>
            </el-menu>
          </el-card>
          
          <!-- 功能详情 -->
          <el-card class="feature-detail-card">
            <template #header>
              <div class="card-header">
                <h3>{{ currentFeature.title }}</h3>
              </div>
            </template>
            
            <div class="feature-content">
              <div class="feature-description">
                <h4>功能概述</h4>
                <p>{{ currentFeature.description }}</p>
              </div>
              
              <div class="feature-steps">
                <h4>使用步骤</h4>
                <ol class="steps-list">
                  <li v-for="(step, index) in currentFeature.steps" :key="index">
                    <div class="step-number">{{ index + 1 }}</div>
                    <div class="step-content">
                      <h5>{{ step.title }}</h5>
                      <p>{{ step.description }}</p>
                      <div v-if="step.imageUrl" class="step-image">
                        <el-image
                          :src="step.imageUrl"
                          fit="cover"
                          :preview-src-list="[step.imageUrl]"
                          class="feature-image"
                        >
                          <template #placeholder>
                            <div class="image-placeholder">
                              <el-icon><Picture /></el-icon>
                            </div>
                          </template>
                        </el-image>
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div class="feature-notes">
                <h4>注意事项</h4>
                <ul class="notes-list">
                  <li v-for="(note, index) in currentFeature.notes" :key="index">
                    <el-icon><Check /></el-icon>
                    <span>{{ note }}</span>
                  </li>
                </ul>
              </div>
              
              <div class="feature-tips">
                <h4>常见问题</h4>
                <el-collapse v-model="activeFaqs">
                  <el-collapse-item
                    v-for="(faq, index) in currentFeature.faqs" 
                    :key="index"
                    :title="faq.question"
                    :name="index"
                  >
                    <div class="faq-answer">
                      {{ faq.answer }}
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
              
              <div class="feature-related">
                <h4>相关功能</h4>
                <el-tag
                  v-for="(related, index) in currentFeature.relatedFeatures"
                  :key="index"
                  type="info"
                  hit
                  @click="navigateToRelated(related)"
                  class="related-tag"
                >
                  {{ related }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 常见问题 -->
      <el-tab-pane label="常见问题" name="faq">
        <div class="faq-section">
          <div class="faq-filter">
            <el-tag
              v-for="category in faqCategories"
              :key="category.value"
              :type="activeFaqCategory === category.value ? 'primary' : 'info'"
              @click="activeFaqCategory = category.value"
              class="category-tag"
            >
              {{ category.label }}
            </el-tag>
          </div>
          
          <el-collapse v-model="activeFaqItems" class="faq-collapse">
            <el-collapse-item
              v-for="faq in filteredFaqs"
              :key="faq.id"
              :title="faq.question"
              :name="faq.id"
            >
              <div class="faq-content">
                <div class="faq-answer">
                  {{ faq.answer }}
                </div>
                <div class="faq-meta">
                  <el-tag size="small" type="info" :disable-transitions="true">
                    {{ getFaqCategoryLabel(faq.category) }}
                  </el-tag>
                  <span class="faq-date">
                    更新时间：{{ formatDate(faq.updatedAt) }}
                  </span>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
          
          <div v-if="filteredFaqs.length === 0" class="no-results">
            <el-empty description="暂无相关问题"></el-empty>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 视频教程 -->
      <el-tab-pane label="视频教程" name="videos">
        <div class="videos-section">
          <div class="videos-filter">
            <el-tabs v-model="videoCategory" type="border-card" class="video-categories">
              <el-tab-pane label="全部" name="all"></el-tab-pane>
              <el-tab-pane label="基础操作" name="basic"></el-tab-pane>
              <el-tab-pane label="数据查询" name="query"></el-tab-pane>
              <el-tab-pane label="系统配置" name="config"></el-tab-pane>
              <el-tab-pane label="预警处理" name="alert"></el-tab-pane>
              <el-tab-pane label="故障排除" name="troubleshooting"></el-tab-pane>
            </el-tabs>
          </div>
          
          <div class="videos-grid">
            <el-card
              v-for="video in filteredVideos"
              :key="video.id"
              class="video-card"
              @click="playVideo(video)"
            >
              <div class="video-thumbnail">
                <el-image
                  :src="video.thumbnailUrl"
                  fit="cover"
                  class="video-image"
                >
                  <template #placeholder>
                    <div class="image-placeholder">
                      <el-icon><VideoPlay /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="video-duration">
                  {{ video.duration }}
                </div>
                <div class="video-play-icon">
                  <el-icon><VideoPlay /></el-icon>
                </div>
              </div>
              <div class="video-info">
                <h3 class="video-title">{{ video.title }}</h3>
                <p class="video-description">{{ video.description }}</p>
                <div class="video-meta">
                  <span class="video-views">
                    <el-icon><View /></el-icon>
                    {{ formatNumber(video.views) }}
                  </span>
                  <span class="video-date">
                    {{ formatDate(video.updatedAt) }}
                  </span>
                </div>
              </div>
            </el-card>
          </div>
          
          <div v-if="filteredVideos.length === 0" class="no-results">
            <el-empty description="暂无相关视频"></el-empty>
          </div>
          
          <div class="videos-pagination" v-if="filteredVideos.length > 0">
            <el-pagination
              v-model:current-page="videoPage.current"
              v-model:page-size="videoPage.size"
              :page-sizes="[8, 12, 16, 24]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredVideos.length"
            ></el-pagination>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 联系客服 -->
      <el-tab-pane label="联系客服" name="contact">
        <div class="contact-section">
          <el-card class="contact-card">
            <template #header>
              <div class="card-header">
                <span>获取帮助</span>
              </div>
            </template>
            
            <div class="contact-info">
              <div class="contact-item">
                <div class="contact-icon">
                  <el-icon><Phone /></el-icon>
                </div>
                <div class="contact-content">
                  <h3>客服热线</h3>
                  <p class="contact-number">400-888-8888</p>
                  <p class="contact-time">工作时间：周一至周五 9:00-18:00</p>
                </div>
              </div>
              
              <div class="contact-item">
                <div class="contact-icon">
                  <el-icon><ChatDotSquare /></el-icon>
                </div>
                <div class="contact-content">
                  <h3>在线客服</h3>
                  <el-button type="primary" class="contact-btn">
                    <el-icon><ChatLineSquare /></el-icon>
                    立即咨询
                  </el-button>
                  <p class="contact-time">工作时间：周一至周日 8:00-22:00</p>
                </div>
              </div>
              
              <div class="contact-item">
                <div class="contact-icon">
                  <el-icon><Message /></el-icon>
                </div>
                <div class="contact-content">
                  <h3>邮件支持</h3>
                  <p class="contact-email">support@smartpark.com</p>
                  <p class="contact-time">我们会在24小时内回复</p>
                </div>
              </div>
              
              <div class="contact-item">
                <div class="contact-icon">
                  <el-icon><Postcard /></el-icon>
                </div>
                <div class="contact-content">
                  <h3>反馈问题</h3>
                  <el-button type="success" @click="showFeedbackDialog">
                    <el-icon><EditPen /></el-icon>
                    提交反馈
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
          
          <el-card class="faq-card">
            <template #header>
              <div class="card-header">
                <span>快速入口</span>
              </div>
            </template>
            
            <div class="quick-links">
              <el-button
                v-for="link in quickLinks"
                :key="link.id"
                :type="link.type"
                @click="navigateToLink(link)"
                class="quick-link-btn"
              >
                <el-icon :size="20"><component :is="link.icon" /></el-icon>
                {{ link.label }}
              </el-button>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 视频播放对话框 -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="currentVideo.title"
      width="80%"
      fullscreen
    >
      <div class="video-player-container">
        <div class="video-player">
          <video :src="currentVideo.videoUrl" controls autoplay></video>
        </div>
        <div class="video-player-info">
          <h3>{{ currentVideo.title }}</h3>
          <p>{{ currentVideo.description }}</p>
          <div class="video-meta">
            <span class="video-views">
              <el-icon><View /></el-icon>
              {{ formatNumber(currentVideo.views) }}
            </span>
            <span class="video-category">
              {{ getVideoCategoryLabel(currentVideo.category) }}
            </span>
            <span class="video-date">
              {{ formatDate(currentVideo.updatedAt) }}
            </span>
          </div>
          <div class="video-tags">
            <el-tag
              v-for="(tag, index) in currentVideo.tags"
              :key="index"
              size="small"
              type="info"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="videoDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadVideo(currentVideo)">
            <el-icon><Download /></el-icon>
            下载视频
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 反馈对话框 -->
    <el-dialog
      v-model="feedbackDialogVisible"
      title="问题反馈"
      width="600px"
    >
      <el-form :model="feedbackForm" :rules="feedbackRules" ref="feedbackFormRef" label-width="100px">
        <el-form-item label="反馈类型" prop="type">
          <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
            <el-option label="功能建议" value="suggestion"></el-option>
            <el-option label="系统问题" value="issue"></el-option>
            <el-option label="操作疑问" value="question"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="反馈内容" prop="content">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            rows="6"
            placeholder="请详细描述您的问题或建议..."
          ></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="feedbackForm.contact" placeholder="请留下您的邮箱或电话，方便我们联系您"></el-input>
        </el-form-item>
        <el-form-item label="上传截图">
          <el-upload
            action="#"
            list-type="picture-card"
            :on-change="handleImageUpload"
            :auto-upload="false"
            :limit="3"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                最多上传3张图片，单张不超过2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="feedbackDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback" :loading="submittingFeedback">
            <el-icon><CirclePlus /></el-icon>
            提交反馈
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search, PieChart, VideoPlay, DocumentCopy, Monitor,
  Location, Document, Warning, Tools, Setting,
  User, Picture, Check, View, Phone, ChatLineSquare,
  Message, Postcard, EditPen, Download,
  Plus, CirclePlus
} from '@element-plus/icons-vue'

export default {
  name: 'HelpCenter',
  components: {
    Search, PieChart, VideoPlay, DocumentCopy, Monitor, 
    Location, Document, Warning, Tools, Setting, 
    User, Picture, Check, View, Phone, ChatLineSquare,
    Message, Postcard, EditPen, Download,
    Plus, CirclePlus
  },
  setup() {
    // 状态
    const activeTab = ref('features')
    const searchQuery = ref('')
    const activeCategory = ref('dashboard')
    const activeFaqCategory = ref('all')
    const activeFaqItems = ref(['1'])
    const activeFaqs = ref([])
    const videoCategory = ref('all')
    const videoPage = reactive({
      current: 1,
      size: 8
    })
    
    // 对话框
    const videoDialogVisible = ref(false)
    const feedbackDialogVisible = ref(false)
    const submittingFeedback = ref(false)
    
    // 表单
    const feedbackFormRef = ref(null)
    const feedbackForm = reactive({
      type: '',
      content: '',
      contact: '',
      images: []
    })
    
    const feedbackRules = {
      type: [
        { required: true, message: '请选择反馈类型', trigger: 'change' }
      ],
      content: [
        { required: true, message: '请输入反馈内容', trigger: 'blur' },
        { min: 10, message: '反馈内容至少10个字符', trigger: 'blur' }
      ],
      contact: [
        { required: true, message: '请输入联系方式', trigger: 'blur' }
      ]
    }
    
    // 功能数据
    const featureData = ref([])
    const faqData = ref([])
    const videoData = ref([])
    
    // 计算属性
    const currentFeature = computed(() => {
      const feature = featureData.value.find(f => f.category === activeCategory.value)
      return feature || featureData.value[0] || {
        title: '功能说明',
        description: '暂无功能描述',
        steps: [],
        notes: [],
        faqs: [],
        relatedFeatures: []
      }
    })
    
    const filteredFaqs = computed(() => {
      return faqData.value.filter(faq => {
        if (activeFaqCategory.value !== 'all' && faq.category !== activeFaqCategory.value) {
          return false
        }
        if (searchQuery.value && 
            !faq.question.toLowerCase().includes(searchQuery.value.toLowerCase()) && 
            !faq.answer.toLowerCase().includes(searchQuery.value.toLowerCase())) {
          return false
        }
        return true
      })
    })
    
    const filteredVideos = computed(() => {
      return videoData.value.filter(video => {
        if (videoCategory.value !== 'all' && video.category !== videoCategory.value) {
          return false
        }
        if (searchQuery.value && 
            !video.title.toLowerCase().includes(searchQuery.value.toLowerCase()) && 
            !video.description.toLowerCase().includes(searchQuery.value.toLowerCase())) {
          return false
        }
        return true
      })
    })
    
    const currentVideo = ref({
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: '',
      views: 0,
      category: '',
      tags: [],
      updatedAt: ''
    })
    
    // FAQ分类
    const faqCategories = [
      { label: '全部', value: 'all' },
      { label: '账号问题', value: 'account' },
      { label: '数据查询', value: 'data' },
      { label: '设备管理', value: 'device' },
      { label: '系统配置', value: 'system' },
      { label: '其他问题', value: 'other' }
    ]
    
    // 快速链接
    const quickLinks = [
      { id: 1, label: '用户手册下载', type: 'primary', icon: 'Document' },
      { id: 2, label: 'API文档', type: 'success', icon: 'Connection' },
      { id: 3, label: '系统更新日志', type: 'info', icon: 'News' },
      { id: 4, label: '常见故障处理', type: 'warning', icon: 'Warning' }
    ]
    
    // 格式化数字
    const formatNumber = (num) => {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      }
      return num.toString()
    }
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '--'
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    
    // 处理搜索
    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        ElMessage.success(`搜索关键词: ${searchQuery.value}`)
        // 实际应用中这里会进行搜索操作
      }
    }
    
    // 处理分类选择
    const handleCategorySelect = (index) => {
      activeCategory.value = index
    }
    
    // 导航到相关功能
    const navigateToRelated = (featureName) => {
      const feature = featureData.value.find(f => f.title.includes(featureName) || f.relatedFeatures.includes(featureName))
      if (feature) {
        activeCategory.value = feature.category
      }
    }
    
    // 获取FAQ分类标签
    const getFaqCategoryLabel = (category) => {
      const cat = faqCategories.find(c => c.value === category)
      return cat ? cat.label : '其他'
    }
    
    // 获取视频分类标签
    const getVideoCategoryLabel = (category) => {
      const categories = {
        'basic': '基础操作',
        'query': '数据查询',
        'config': '系统配置',
        'alert': '预警处理',
        'troubleshooting': '故障排除'
      }
      return categories[category] || '其他'
    }
    
    // 播放视频
    const playVideo = (video) => {
      currentVideo.value = { ...video }
      videoDialogVisible.value = true
      // 模拟增加观看次数
      video.views++
    }
    
    // 下载视频
    const downloadVideo = (video) => {
      // 实际应用中这里会处理视频下载
      ElMessage.success(`视频「${video.title}」开始下载`)
    }
    
    // 显示反馈对话框
    const showFeedbackDialog = () => {
      feedbackDialogVisible.value = true
    }
    
    // 处理图片上传
    const handleImageUpload = (file, fileList) => {
      feedbackForm.images = fileList.map(file => file.raw)
    }
    
    // 提交反馈
    const submitFeedback = () => {
      if (!feedbackFormRef.value) return
      
      feedbackFormRef.value.validate((valid) => {
        if (valid) {
          submittingFeedback.value = true
          
          // 模拟提交
          setTimeout(() => {
            ElMessage.success('感谢您的反馈，我们会尽快处理！')
            feedbackDialogVisible.value = false
            submittingFeedback.value = false
            
            // 重置表单
            Object.assign(feedbackForm, {
              type: '',
              content: '',
              contact: '',
              images: []
            })
            feedbackFormRef.value.resetFields()
          }, 1500)
        }
      })
    }
    
    // 导航到链接
    const navigateToLink = (link) => {
      ElMessage.info(`跳转到: ${link.label}`)
      // 实际应用中这里会进行页面跳转或文件下载
    }
    
    // 生成模拟数据
    const generateMockData = () => {
      // 功能说明数据
      featureData.value = [
        {
          category: 'dashboard',
          title: '仪表盘功能',
          description: '仪表盘提供系统核心数据概览，包括园区总能耗实时数据、今日/本月能耗趋势、异常预警数量、设备在线率等关键指标。',
          steps: [
            {
              title: '登录系统',
              description: '输入账号密码登录智慧园区能源消耗检测系统',
              imageUrl: 'https://via.placeholder.com/600x300?text=登录界面'
            },
            {
              title: '进入仪表盘',
              description: '登录成功后，系统自动跳转到仪表盘页面，或点击左侧导航栏的「仪表盘」进入',
              imageUrl: 'https://via.placeholder.com/600x300?text=导航菜单'
            },
            {
              title: '查看数据概览',
              description: '在仪表盘顶部查看园区总能耗、今日用电量、设备在线率等关键指标',
              imageUrl: 'https://via.placeholder.com/600x300?text=数据概览'
            },
            {
              title: '分析可视化图表',
              description: '查看能耗总览饼图、近7天能耗趋势图等可视化数据',
              imageUrl: 'https://via.placeholder.com/600x300?text=能耗图表'
            },
            {
              title: '使用快捷入口',
              description: '点击快捷入口卡片，快速跳转到实时监控、异常处理等核心功能',
              imageUrl: 'https://via.placeholder.com/600x300?text=快捷入口'
            }
          ],
          notes: [
            '仪表盘数据默认每30秒自动刷新一次，可在系统设置中调整刷新频率',
            '点击图表可查看详细数据，部分图表支持时间范围选择',
            '预警信息会实时更新，点击预警可查看详细信息',
            '不同角色用户登录后看到的数据范围可能有所不同'
          ],
          faqs: [
            {
              question: '仪表盘数据不更新怎么办？',
              answer: '请检查网络连接是否正常，或尝试手动刷新页面。如果问题持续存在，请联系系统管理员。'
            },
            {
              question: '如何自定义仪表盘显示内容？',
              answer: '目前系统暂不支持自定义仪表盘内容，我们会在后续版本中增加此功能。'
            },
            {
              question: '预警信息多久更新一次？',
              answer: '预警信息实时更新，系统检测到异常会立即显示在仪表盘上。'
            }
          ],
          relatedFeatures: ['实时监控', '异常预警', '能耗分析']
        },
        {
          category: 'monitoring',
          title: '实时监控',
          description: '实时监控页面提供园区各能源类型和区域的实时能耗数据，以及设备的在线状态监控。',
          steps: [
            {
              title: '进入实时监控',
              description: '点击左侧导航栏的「实时监控」进入监控页面',
              imageUrl: 'https://via.placeholder.com/600x300?text=导航菜单'
            },
            {
              title: '查看能源类型数据',
              description: '在页面上方查看电力、水、燃气、热力等能源的实时数据',
              imageUrl: 'https://via.placeholder.com/600x300?text=能源类型数据'
            },
            {
              title: '切换区域视图',
              description: '使用区域选择器切换不同楼栋或区域的能耗数据',
              imageUrl: 'https://via.placeholder.com/600x300?text=区域选择'
            },
            {
              title: '查看设备状态',
              description: '在设备状态列表中查看各计量设备的在线状态和数据传输情况',
              imageUrl: 'https://via.placeholder.com/600x300?text=设备状态'
            }
          ],
          notes: [
            '实时数据默认每5秒刷新一次',
            '设备离线超过设定时间会自动触发预警',
            '部分数据可能存在延迟，具体取决于数据采集设备',
            '数据异常（如负值、突变）会被标记并可能触发预警'
          ],
          faqs: [
            {
              question: '为什么有些设备显示离线？',
              answer: '设备离线可能是因为网络连接问题、设备电源问题或设备故障。请检查设备的物理连接和电源状态。'
            },
            {
              question: '如何设置能耗超标的阈值？',
              answer: '请在系统设置页面中的预警阈值设置部分进行配置。'
            }
          ],
          relatedFeatures: ['异常预警', '设备管理', '能耗分析']
        },
        {
          category: 'query',
          title: '历史查询',
          description: '历史查询页面支持按多维度筛选和查询园区能耗历史数据，并可导出数据用于进一步分析。',
          steps: [
            {
              title: '进入历史查询',
              description: '点击左侧导航栏的「历史查询」进入查询页面',
              imageUrl: 'https://via.placeholder.com/600x300?text=导航菜单'
            },
            {
              title: '设置筛选条件',
              description: '选择时间范围、能源类型、区域/楼栋等筛选条件',
              imageUrl: 'https://via.placeholder.com/600x300?text=筛选条件'
            },
            {
              title: '执行查询',
              description: '点击「查询」按钮执行数据查询',
              imageUrl: 'https://via.placeholder.com/600x300?text=查询按钮'
            },
            {
              title: '查看查询结果',
              description: '在数据表格中查看查询结果，包括能耗数值、环比/同比变化等',
              imageUrl: 'https://via.placeholder.com/600x300?text=查询结果'
            },
            {
              title: '导出数据',
              description: '点击「导出」按钮，选择Excel或PDF格式导出数据',
              imageUrl: 'https://via.placeholder.com/600x300?text=导出功能'
            }
          ],
          notes: [
            '数据查询范围过大可能会影响查询速度',
            '导出大量数据时可能需要较长时间，请耐心等待',
            '历史数据保留期限可在系统设置中配置',
            '数据统计基于系统记录的原始数据，如有异常数据已在统计时进行标识'
          ],
          faqs: [
            {
              question: '如何查询特定时间段的数据？',
              answer: '使用页面顶部的时间范围选择器，可选择日、周、月、年或自定义时间范围。'
            },
            {
              question: '导出的数据格式有哪些？',
              answer: '系统支持Excel(.xlsx)和PDF两种格式的数据导出。'
            },
            {
              question: '为什么查询结果中有些数据显示为异常？',
              answer: '数据异常可能是因为设备故障、数据传输错误或超出正常范围。系统会自动识别并标记这些异常数据。'
            }
          ],
          relatedFeatures: ['能耗分析', '系统设置', '报表生成']
        }
        // 可以添加更多功能说明
      ]
      
      // FAQ数据
      faqData.value = [
        {
          id: '1',
          category: 'account',
          question: '如何修改登录密码？',
          answer: '登录系统后，点击右上角用户头像，选择「个人中心」，在「密码修改」页面进行密码修改操作。密码修改成功后需要重新登录系统。',
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          category: 'account',
          question: '忘记密码怎么办？',
          answer: '在登录页面点击「忘记密码」，按照提示输入注册时的手机号或邮箱，获取验证码后可以重置密码。如需帮助，请联系系统管理员。',
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          category: 'data',
          question: '如何查看指定区域的能耗数据？',
          answer: '在实时监控或历史查询页面，使用区域选择器选择需要查看的区域或楼栋，系统会自动显示该区域的能耗数据。',
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          category: 'data',
          question: '系统中的能耗数据是如何采集的？',
          answer: '系统通过安装在园区各个位置的智能计量设备（电表、水表、燃气表等）实时采集能耗数据，经由数据采集网关传输到系统平台进行处理和分析。',
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          category: 'device',
          question: '如何添加新的计量设备？',
          answer: '管理员用户可以在「设备管理」页面点击「新增设备」按钮，填写设备信息（设备ID、类型、安装位置等），完成设备添加。添加后需要与物理设备进行绑定。',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '6',
          category: 'device',
          question: '设备显示离线如何处理？',
          answer: '首先检查设备的电源和网络连接是否正常。如物理连接正常，可在设备管理页面尝试「远程重启」设备。如问题仍未解决，请联系运维人员进行现场检查。',
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '7',
          category: 'system',
          question: '如何设置能耗预警阈值？',
          answer: '管理员用户可以在「系统设置」页面中的「预警阈值设置」部分，为不同类型的能源设置预警阈值。超过阈值的数据会触发异常预警。',
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '8',
          category: 'system',
          question: '如何导出系统日志？',
          answer: '管理员用户可以在「系统设置」页面的「日志管理」标签页，选择日志类型和时间范围，点击「导出」按钮导出系统日志。',
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '9',
          category: 'other',
          question: '系统支持哪些浏览器？',
          answer: '系统支持主流浏览器，包括Chrome 90+、Firefox 88+、Safari 14+、Edge 90+等。为获得最佳体验，建议使用Chrome浏览器。',
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '10',
          category: 'other',
          question: '如何获取更多技术支持？',
          answer: '您可以通过「联系客服」页面提供的联系方式获取技术支持，包括在线客服、客服热线和邮件支持。',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      // 视频教程数据
      videoData.value = [
        {
          id: '1',
          title: '系统登录与基本操作',
          description: '本视频介绍如何登录系统、熟悉系统界面以及基本的操作流程。',
          videoUrl: 'https://example.com/videos/login.mp4',
          thumbnailUrl: 'https://via.placeholder.com/400x225?text=系统登录与基本操作',
          duration: '05:30',
          views: 1250,
          category: 'basic',
          tags: ['登录', '基本操作', '界面介绍'],
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: '仪表盘功能详解',
          description: '详细介绍仪表盘各模块功能，包括数据概览、可视化图表和快捷入口的使用方法。',
          videoUrl: 'https://example.com/videos/dashboard.mp4',
          thumbnailUrl: 'https://via.placeholder.com/400x225?text=仪表盘功能详解',
          duration: '08:45',
          views: 980,
          category: 'basic',
          tags: ['仪表盘', '数据概览', '图表分析'],
          updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: '实时监控功能使用指南',
          description: '介绍如何使用实时监控功能查看各能源类型和区域的实时能耗数据。',
          videoUrl: 'https://example.com/videos/monitoring.mp4',
          thumbnailUrl: 'https://via.placeholder.com/400x225?text=实时监控功能使用指南',
          duration: '06:20',
          views: 860,
          category: 'query',
          tags: ['实时监控', '能源数据', '设备状态'],
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          title: '历史数据查询与导出',
          description: '详细讲解如何按多维度筛选和查询历史能耗数据，以及如何导出数据。',
          videoUrl: 'https://example.com/videos/history.mp4',
          thumbnailUrl: 'https://via.placeholder.com/400x225?text=历史数据查询与导出',
          duration: '07:15',
          views: 1120,
          category: 'query',
          tags: ['历史查询', '数据导出', 'Excel', 'PDF'],
          updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          title: '能耗分析报表生成教程',
          description: '介绍如何生成能耗分析报表，包括趋势分析、对比分析等功能。',
          videoUrl: 'https://example.com/videos/report.mp4',
          thumbnailUrl: 'https://via.placeholder.com/400x225?text=能耗分析报表生成教程',
          duration: '10:30',
          views: 750,
          category: 'config',
          tags: ['报表生成', '能耗分析', '趋势对比'],
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '6',
          title: '系统设置配置指南',
          description: '详细讲解系统设置页面的各项配置，包括基础配置、权限管理和日志管理。',
          videoUrl: 'https://example.com/videos/settings.mp4',
          thumbnailUrl: 'https://via.placeholder.com/400x225?text=系统设置配置指南',
          duration: '12:45',
          views: 680,
          category: 'config',
          tags: ['系统设置', '权限管理', '日志管理'],
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '7',
          title: '异常预警处理流程',
          description: '介绍如何查看和处理系统生成的异常预警信息。',
          videoUrl: 'https://example.com/videos/alert.mp4',
          thumbnailUrl: 'https://via.placeholder.com/400x225?text=异常预警处理流程',
          duration: '08:10',
          views: 920,
          category: 'alert',
          tags: ['预警处理', '异常信息', '派单流程'],
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '8',
          title: '设备管理操作教程',
          description: '详细讲解如何管理系统中的计量设备，包括新增、编辑、删除和状态管理。',
          videoUrl: 'https://example.com/videos/devices.mp4',
          thumbnailUrl: 'https://via.placeholder.com/400x225?text=设备管理操作教程',
          duration: '09:25',
          views: 830,
          category: 'config',
          tags: ['设备管理', '新增设备', '状态管理'],
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '9',
          title: '常见故障排除指南',
          description: '介绍系统使用过程中常见故障的排除方法，包括设备离线、数据异常等问题。',
          videoUrl: 'https://example.com/videos/troubleshooting.mp4',
          thumbnailUrl: 'https://via.placeholder.com/400x225?text=常见故障排除指南',
          duration: '11:40',
          views: 1350,
          category: 'troubleshooting',
          tags: ['故障排除', '设备离线', '数据异常'],
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '10',
          title: '企业用户管理教程',
          description: '详细讲解如何管理入驻园区的企业信息和用户权限。',
          videoUrl: 'https://example.com/videos/enterprise.mp4',
          thumbnailUrl: 'https://via.placeholder.com/400x225?text=企业用户管理教程',
          duration: '08:50',
          views: 580,
          category: 'config',
          tags: ['企业管理', '用户管理', '权限配置'],
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
    
    onMounted(() => {
      generateMockData()
    })
    
    return {
      activeTab,
      searchQuery,
      activeCategory,
      activeFaqCategory,
      activeFaqItems,
      activeFaqs,
      videoCategory,
      videoPage,
      videoDialogVisible,
      feedbackDialogVisible,
      submittingFeedback,
      feedbackFormRef,
      feedbackForm,
      feedbackRules,
      currentFeature,
      filteredFaqs,
      filteredVideos,
      currentVideo,
      faqCategories,
      quickLinks,
      formatNumber,
      formatDate,
      handleSearch,
      handleCategorySelect,
      navigateToRelated,
      getFaqCategoryLabel,
      getVideoCategoryLabel,
      playVideo,
      downloadVideo,
      showFeedbackDialog,
      handleImageUpload,
      submitFeedback,
      navigateToLink
    }
  }
}
</script>

<style scoped>
.help-center {
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

.search-container {
  margin-bottom: 20px;
}

.help-search-input {
  max-width: 600px;
}

.help-tabs {
  margin-bottom: 20px;
}

/* 功能说明部分 */
.features-section {
  display: flex;
  gap: 20px;
}

.categories-card {
  flex: 0 0 280px;
}

.category-menu {
  border-right: none;
}

.category-menu .el-menu-item {
  padding: 12px 20px;
}

.category-menu .el-menu-item.is-active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.feature-detail-card {
  flex: 1;
}

.feature-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 10px 0;
  color: #303133;
}

.feature-content h4:first-child {
  margin-top: 0;
}

.feature-description p {
  line-height: 1.6;
  color: #606266;
  margin-bottom: 10px;
}

.steps-list {
  padding-left: 20px;
}

.steps-list li {
  margin-bottom: 20px;
  position: relative;
  list-style: none;
  padding-left: 40px;
}

.step-number {
  position: absolute;
  left: 0;
  top: 0;
  width: 28px;
  height: 28px;
  background-color: #1890ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.step-content h5 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.step-content p {
  line-height: 1.6;
  color: #606266;
  margin-bottom: 10px;
}

.step-image {
  margin-top: 10px;
}

.feature-image {
  max-width: 100%;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notes-list {
  padding-left: 20px;
}

.notes-list li {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  color: #606266;
}

.notes-list li .el-icon {
  margin-right: 8px;
  color: #1890ff;
  flex-shrink: 0;
  margin-top: 4px;
}

.faq-tips {
  margin: 20px 0;
}

.faq-answer {
  line-height: 1.6;
  color: #606266;
  padding: 10px 0;
}

.related-tag {
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

/* FAQ部分 */
.faq-section {
  padding: 10px 0;
}

.faq-filter {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-tag {
  cursor: pointer;
}

.faq-collapse {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.faq-content {
  padding: 10px 0;
}

.faq-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.faq-date {
  color: #909399;
  font-size: 13px;
}

.no-results {
  padding: 40px 0;
}

/* 视频教程部分 */
.videos-section {
  padding: 10px 0;
}

.video-categories {
  margin-bottom: 20px;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.video-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.video-thumbnail {
  position: relative;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.video-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.video-card:hover .video-play-icon {
  opacity: 1;
}

.video-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
  line-height: 1.4;
}

.video-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin: 0 0 10px 0;
  flex: 1;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #909399;
}

.video-views {
  display: flex;
  align-items: center;
  gap: 5px;
}

.videos-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 联系客服部分 */
.contact-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.contact-info {
  display: grid;
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.contact-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 24px;
  color: #1890ff;
}

.contact-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.contact-number {
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
  margin: 0 0 4px 0;
}

.contact-time {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.contact-btn {
  margin-bottom: 8px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 10px 0;
}

.quick-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 10px;
}

/* 视频播放对话框 */
.video-player-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-player {
  width: 100%;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.video-player video {
  max-width: 100%;
  max-height: 600px;
}

.video-player-info h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #303133;
}

.video-player-info p {
  line-height: 1.6;
  color: #606266;
  margin: 0 0 15px 0;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

/* 图片占位符 */
.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 32px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .features-section {
    flex-direction: column;
  }
  
  .categories-card {
    flex: 1;
    max-width: 100%;
  }
  
  .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .contact-item {
    flex-direction: column;
    text-align: center;
  }
  
  .quick-links {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .videos-grid {
    grid-template-columns: 1fr;
  }
  
  .video-player video {
    max-height: 400px;
  }
}
</style>