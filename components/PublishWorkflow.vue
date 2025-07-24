<template>
  <div class="publish-workflow">
    <!-- Workflow Header -->
    <div class="workflow-header">
      <h3>发布流程</h3>
      <div class="workflow-progress">
        <div 
          v-for="(step, index) in workflowSteps" 
          :key="step.id"
          :class="['progress-step', {
            'completed': step.status === 'completed',
            'active': step.status === 'active',
            'error': step.status === 'error'
          }]"
        >
          <div class="step-indicator">
            <i v-if="step.status === 'completed'" class="fas fa-check"></i>
            <i v-else-if="step.status === 'error'" class="fas fa-times"></i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>
    </div>

    <!-- Workflow Content -->
    <div class="workflow-content">
      <!-- Step 1: Content Validation -->
      <div v-if="currentStep === 'validation'" class="workflow-step">
        <div class="step-header">
          <h4>
            <i class="fas fa-check-circle"></i>
            内容验证
          </h4>
          <p>检查文章内容的完整性和质量</p>
        </div>

        <div class="validation-checks">
          <div 
            v-for="check in validationChecks" 
            :key="check.id"
            :class="['validation-item', check.status]"
          >
            <div class="check-icon">
              <i v-if="check.status === 'pass'" class="fas fa-check-circle"></i>
              <i v-else-if="check.status === 'fail'" class="fas fa-times-circle"></i>
              <i v-else class="fas fa-clock"></i>
            </div>
            
            <div class="check-content">
              <div class="check-title">{{ check.title }}</div>
              <div class="check-description">{{ check.description }}</div>
              <div v-if="check.suggestion" class="check-suggestion">
                <i class="fas fa-lightbulb"></i>
                {{ check.suggestion }}
              </div>
            </div>
            
            <div v-if="check.action" class="check-action">
              <button @click="check.action" class="action-btn">
                {{ check.actionLabel }}
              </button>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button @click="runValidation" class="btn-primary" :disabled="validating">
            <i class="fas fa-play"></i>
            {{ validating ? '验证中...' : '开始验证' }}
          </button>
          <button 
            @click="nextStep" 
            class="btn-success" 
            :disabled="!canProceedFromValidation"
          >
            <i class="fas fa-arrow-right"></i>
            下一步
          </button>
        </div>
      </div>

      <!-- Step 2: SEO Optimization -->
      <div v-if="currentStep === 'seo'" class="workflow-step">
        <div class="step-header">
          <h4>
            <i class="fas fa-search"></i>
            SEO 优化
          </h4>
          <p>优化文章的搜索引擎表现</p>
        </div>

        <div class="seo-panel">
          <div class="seo-section">
            <h5>基础 SEO 信息</h5>
            
            <div class="form-group">
              <label>SEO 标题</label>
              <input 
                v-model="seoData.title"
                type="text" 
                class="form-input"
                :placeholder="post.title"
                maxlength="60"
              />
              <div class="char-counter">{{ seoData.title.length }}/60</div>
              <div class="field-hint">建议长度: 50-60个字符</div>
            </div>
            
            <div class="form-group">
              <label>Meta 描述</label>
              <textarea 
                v-model="seoData.description"
                class="form-textarea"
                rows="3"
                :placeholder="post.excerpt"
                maxlength="160"
              ></textarea>
              <div class="char-counter">{{ seoData.description.length }}/160</div>
              <div class="field-hint">建议长度: 150-160个字符</div>
            </div>
            
            <div class="form-group">
              <label>关键词</label>
              <div class="keywords-input">
                <input 
                  v-model="keywordInput"
                  type="text" 
                  placeholder="输入关键词后按回车添加"
                  @keydown.enter.prevent="addKeyword"
                  class="form-input"
                />
                <div class="keywords-list">
                  <span 
                    v-for="(keyword, index) in seoData.keywords" 
                    :key="index"
                    class="keyword-tag"
                  >
                    {{ keyword }}
                    <button @click="removeKeyword(index)" class="remove-keyword">
                      <i class="fas fa-times"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="seo-section">
            <h5>结构化数据</h5>
            
            <div class="form-group">
              <label>文章类型</label>
              <select v-model="seoData.articleType" class="form-select">
                <option value="Article">普通文章</option>
                <option value="BlogPosting">博客文章</option>
                <option value="NewsArticle">新闻文章</option>
                <option value="TechArticle">技术文章</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="seoData.enableBreadcrumbs" type="checkbox" />
                启用面包屑导航
              </label>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="seoData.enableFAQ" type="checkbox" />
                启用FAQ结构化数据
              </label>
            </div>
          </div>

          <div class="seo-preview">
            <h5>搜索结果预览</h5>
            <div class="search-preview">
              <div class="preview-url">{{ baseUrl }}/posts/{{ post.slug }}</div>
              <div class="preview-title">{{ seoData.title || post.title }}</div>
              <div class="preview-description">{{ seoData.description || post.excerpt }}</div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button @click="previousStep" class="btn-secondary">
            <i class="fas fa-arrow-left"></i>
            上一步
          </button>
          <button @click="generateSEO" class="btn-primary">
            <i class="fas fa-magic"></i>
            智能生成
          </button>
          <button @click="nextStep" class="btn-success">
            <i class="fas fa-arrow-right"></i>
            下一步
          </button>
        </div>
      </div>

      <!-- Step 3: Social Media -->
      <div v-if="currentStep === 'social'" class="workflow-step">
        <div class="step-header">
          <h4>
            <i class="fas fa-share-alt"></i>
            社交媒体优化
          </h4>
          <p>为社交媒体分享优化内容展示</p>
        </div>

        <div class="social-panel">
          <div class="social-section">
            <h5>Open Graph 设置</h5>
            
            <div class="form-group">
              <label>分享标题</label>
              <input 
                v-model="socialData.ogTitle"
                type="text" 
                class="form-input"
                :placeholder="post.title"
                maxlength="95"
              />
              <div class="char-counter">{{ socialData.ogTitle.length }}/95</div>
            </div>
            
            <div class="form-group">
              <label>分享描述</label>
              <textarea 
                v-model="socialData.ogDescription"
                class="form-textarea"
                rows="3"
                :placeholder="post.excerpt"
                maxlength="200"
              ></textarea>
              <div class="char-counter">{{ socialData.ogDescription.length }}/200</div>
            </div>
            
            <div class="form-group">
              <label>分享图片</label>
              <div class="image-selector">
                <div v-if="socialData.ogImage" class="selected-image">
                  <img :src="socialData.ogImage" alt="分享图片" />
                  <button @click="socialData.ogImage = ''" class="remove-image">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button v-else @click="selectSocialImage" class="select-image-btn">
                  <i class="fas fa-image"></i>
                  选择分享图片
                </button>
              </div>
              <div class="field-hint">推荐尺寸: 1200x630 像素</div>
            </div>
          </div>

          <div class="social-section">
            <h5>Twitter 卡片</h5>
            
            <div class="form-group">
              <label>卡片类型</label>
              <select v-model="socialData.twitterCard" class="form-select">
                <option value="summary">摘要卡片</option>
                <option value="summary_large_image">大图摘要卡片</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Twitter 账号</label>
              <input 
                v-model="socialData.twitterSite"
                type="text" 
                class="form-input"
                placeholder="@your_twitter"
              />
            </div>
          </div>

          <div class="social-preview">
            <h5>社交分享预览</h5>
            <div class="platform-previews">
              <div class="preview-item">
                <h6>Facebook / LinkedIn</h6>
                <div class="og-preview">
                  <div v-if="socialData.ogImage" class="og-image">
                    <img :src="socialData.ogImage" alt="" />
                  </div>
                  <div class="og-content">
                    <div class="og-title">{{ socialData.ogTitle || post.title }}</div>
                    <div class="og-description">{{ socialData.ogDescription || post.excerpt }}</div>
                    <div class="og-url">{{ baseUrl }}</div>
                  </div>
                </div>
              </div>
              
              <div class="preview-item">
                <h6>Twitter</h6>
                <div class="twitter-preview">
                  <div v-if="socialData.ogImage" class="twitter-image">
                    <img :src="socialData.ogImage" alt="" />
                  </div>
                  <div class="twitter-content">
                    <div class="twitter-title">{{ socialData.ogTitle || post.title }}</div>
                    <div class="twitter-description">{{ socialData.ogDescription || post.excerpt }}</div>
                    <div class="twitter-url">{{ baseUrl }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button @click="previousStep" class="btn-secondary">
            <i class="fas fa-arrow-left"></i>
            上一步
          </button>
          <button @click="useDefaultSocial" class="btn-primary">
            <i class="fas fa-magic"></i>
            使用默认设置
          </button>
          <button @click="nextStep" class="btn-success">
            <i class="fas fa-arrow-right"></i>
            下一步
          </button>
        </div>
      </div>

      <!-- Step 4: Publishing -->
      <div v-if="currentStep === 'publishing'" class="workflow-step">
        <div class="step-header">
          <h4>
            <i class="fas fa-rocket"></i>
            发布设置
          </h4>
          <p>配置文章的发布选项</p>
        </div>

        <div class="publishing-panel">
          <div class="publishing-section">
            <h5>发布时间</h5>
            
            <div class="publish-options">
              <label class="radio-option">
                <input 
                  v-model="publishData.publishType" 
                  type="radio" 
                  value="immediate"
                />
                <span class="radio-text">
                  <strong>立即发布</strong>
                  <small>文章将立即发布并对所有用户可见</small>
                </span>
              </label>
              
              <label class="radio-option">
                <input 
                  v-model="publishData.publishType" 
                  type="radio" 
                  value="scheduled"
                />
                <span class="radio-text">
                  <strong>定时发布</strong>
                  <small>在指定时间自动发布文章</small>
                </span>
              </label>
              
              <label class="radio-option">
                <input 
                  v-model="publishData.publishType" 
                  type="radio" 
                  value="draft"
                />
                <span class="radio-text">
                  <strong>保存为草稿</strong>
                  <small>保存更改但不发布，稍后再发布</small>
                </span>
              </label>
            </div>
            
            <div v-if="publishData.publishType === 'scheduled'" class="schedule-settings">
              <div class="form-group">
                <label>发布日期</label>
                <input 
                  v-model="publishData.scheduledDate"
                  type="date" 
                  class="form-input"
                  :min="minDate"
                />
              </div>
              
              <div class="form-group">
                <label>发布时间</label>
                <input 
                  v-model="publishData.scheduledTime"
                  type="time" 
                  class="form-input"
                />
              </div>
              
              <div class="scheduled-info">
                <i class="fas fa-clock"></i>
                将在 {{ formatScheduledTime }} 发布
              </div>
            </div>
          </div>

          <div class="publishing-section">
            <h5>发布选项</h5>
            
            <div class="publish-settings">
              <label class="checkbox-option">
                <input v-model="publishData.isPinned" type="checkbox" />
                <span class="checkbox-text">
                  <strong>置顶文章</strong>
                  <small>在首页和文章列表中置顶显示</small>
                </span>
              </label>
              
              <label class="checkbox-option">
                <input v-model="publishData.enableComments" type="checkbox" />
                <span class="checkbox-text">
                  <strong>允许评论</strong>
                  <small>读者可以对此文章发表评论</small>
                </span>
              </label>
              
              <label class="checkbox-option">
                <input v-model="publishData.sendNotification" type="checkbox" />
                <span class="checkbox-text">
                  <strong>发送通知</strong>
                  <small>向订阅者发送新文章通知</small>
                </span>
              </label>
              
              <label class="checkbox-option">
                <input v-model="publishData.addToSitemap" type="checkbox" />
                <span class="checkbox-text">
                  <strong>添加到站点地图</strong>
                  <small>自动更新XML站点地图</small>
                </span>
              </label>
            </div>
          </div>

          <div class="publishing-section">
            <h5>发布摘要</h5>
            
            <div class="publish-summary">
              <div class="summary-item">
                <span class="summary-label">文章标题:</span>
                <span class="summary-value">{{ post.title }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">分类:</span>
                <span class="summary-value">{{ getCategoryName(post.category) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">标签:</span>
                <span class="summary-value">{{ tags.join(', ') || '无' }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">字数:</span>
                <span class="summary-value">{{ wordCount }} 字</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">预计阅读时间:</span>
                <span class="summary-value">{{ Math.ceil(wordCount / 200) }} 分钟</span>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button @click="previousStep" class="btn-secondary">
            <i class="fas fa-arrow-left"></i>
            上一步
          </button>
          <button @click="previewPost" class="btn-primary">
            <i class="fas fa-eye"></i>
            预览文章
          </button>
          <button @click="publishPost" class="btn-success" :disabled="publishing">
            <i class="fas fa-rocket"></i>
            {{ getPublishButtonText() }}
          </button>
        </div>
      </div>
    </div>

    <!-- Image Picker Modal -->
    <AdvancedImagePicker
      v-if="showImagePicker"
      @close="showImagePicker = false"
      @insert="handleSocialImageSelected"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'published', 'preview'])

// Reactive state
const currentStep = ref('validation')
const validating = ref(false)
const publishing = ref(false)
const showImagePicker = ref(false)
const keywordInput = ref('')
const baseUrl = ref('https://jcski.com')

// Workflow steps
const workflowSteps = ref([
  { id: 'validation', label: '内容验证', status: 'active' },
  { id: 'seo', label: 'SEO优化', status: 'pending' },
  { id: 'social', label: '社交媒体', status: 'pending' },
  { id: 'publishing', label: '发布设置', status: 'pending' }
])

// Validation checks
const validationChecks = ref([
  {
    id: 'title',
    title: '标题检查',
    description: '文章标题不能为空且应具有吸引力',
    status: 'pending',
    suggestion: null,
    action: null,
    actionLabel: null
  },
  {
    id: 'content',
    title: '内容长度',
    description: '文章内容应有足够的长度和深度',
    status: 'pending',
    suggestion: null,
    action: null,
    actionLabel: null
  },
  {
    id: 'excerpt',
    title: '摘要检查',
    description: '文章摘要有助于读者了解内容概要',
    status: 'pending',
    suggestion: null,
    action: null,
    actionLabel: null
  },
  {
    id: 'images',
    title: '图片检查',
    description: '检查图片的可访问性和优化情况',
    status: 'pending',
    suggestion: null,
    action: null,
    actionLabel: null
  },
  {
    id: 'links',
    title: '链接验证',
    description: '验证文章中的外部链接是否有效',
    status: 'pending',
    suggestion: null,
    action: null,
    actionLabel: null
  }
])

// SEO data
const seoData = reactive({
  title: '',
  description: '',
  keywords: [],
  articleType: 'Article',
  enableBreadcrumbs: true,
  enableFAQ: false
})

// Social media data
const socialData = reactive({
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterCard: 'summary_large_image',
  twitterSite: '@jcski'
})

// Publishing data
const publishData = reactive({
  publishType: 'immediate',
  scheduledDate: '',
  scheduledTime: '',
  isPinned: false,
  enableComments: true,
  sendNotification: true,
  addToSitemap: true
})

// Computed properties
const canProceedFromValidation = computed(() => {
  return validationChecks.value.every(check => check.status === 'pass')
})

const tags = computed(() => {
  try {
    return Array.isArray(props.post.tags) 
      ? props.post.tags 
      : JSON.parse(props.post.tags || '[]')
  } catch {
    return []
  }
})

const wordCount = computed(() => {
  const content = props.post.content || ''
  const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, '')
  return textContent.length
})

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const formatScheduledTime = computed(() => {
  if (!publishData.scheduledDate || !publishData.scheduledTime) return ''
  
  const dateTime = new Date(`${publishData.scheduledDate}T${publishData.scheduledTime}`)
  return dateTime.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Methods
const runValidation = async () => {
  validating.value = true
  
  // Reset all checks
  validationChecks.value.forEach(check => {
    check.status = 'pending'
    check.suggestion = null
  })

  // Simulate validation process
  for (const check of validationChecks.value) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    switch (check.id) {
      case 'title':
        if (!props.post.title || props.post.title.length < 5) {
          check.status = 'fail'
          check.suggestion = '建议标题长度至少5个字符，并包含关键词'
        } else {
          check.status = 'pass'
        }
        break
        
      case 'content':
        const contentLength = props.post.content?.replace(/<[^>]*>/g, '').length || 0
        if (contentLength < 100) {
          check.status = 'fail'
          check.suggestion = '建议文章内容至少100字，以提供足够的信息价值'
        } else {
          check.status = 'pass'
        }
        break
        
      case 'excerpt':
        if (!props.post.excerpt || props.post.excerpt.length < 20) {
          check.status = 'fail'
          check.suggestion = '建议添加文章摘要，长度20-160字符'
          check.action = () => generateExcerpt()
          check.actionLabel = '自动生成'
        } else {
          check.status = 'pass'
        }
        break
        
      case 'images':
        // Check if images exist and are accessible
        check.status = 'pass' // Simplified for demo
        break
        
      case 'links':
        // Validate external links
        check.status = 'pass' // Simplified for demo
        break
    }
  }
  
  validating.value = false
  updateStepStatus('validation', 'completed')
}

const generateExcerpt = () => {
  const content = props.post.content || ''
  const textContent = content.replace(/<[^>]*>/g, '')
  const excerpt = textContent.substring(0, 150) + '...'
  
  // Emit update to parent component
  emit('update:excerpt', excerpt)
}

const nextStep = () => {
  const steps = workflowSteps.value.map(s => s.id)
  const currentIndex = steps.indexOf(currentStep.value)
  
  if (currentIndex < steps.length - 1) {
    updateStepStatus(currentStep.value, 'completed')
    currentStep.value = steps[currentIndex + 1]
    updateStepStatus(currentStep.value, 'active')
  }
}

const previousStep = () => {
  const steps = workflowSteps.value.map(s => s.id)
  const currentIndex = steps.indexOf(currentStep.value)
  
  if (currentIndex > 0) {
    updateStepStatus(currentStep.value, 'pending')
    currentStep.value = steps[currentIndex - 1]
    updateStepStatus(currentStep.value, 'active')
  }
}

const updateStepStatus = (stepId, status) => {
  const step = workflowSteps.value.find(s => s.id === stepId)
  if (step) {
    step.status = status
  }
}

const addKeyword = () => {
  const keyword = keywordInput.value.trim()
  if (keyword && !seoData.keywords.includes(keyword)) {
    seoData.keywords.push(keyword)
    keywordInput.value = ''
  }
}

const removeKeyword = (index) => {
  seoData.keywords.splice(index, 1)
}

const generateSEO = () => {
  // Auto-generate SEO data based on post content
  if (!seoData.title) {
    seoData.title = props.post.title
  }
  
  if (!seoData.description) {
    seoData.description = props.post.excerpt || 
      props.post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
  }
  
  // Auto-generate keywords from content
  const content = props.post.content.replace(/<[^>]*>/g, '').toLowerCase()
  const commonWords = ['的', '了', '是', '在', '和', '有', '我', '你', '他', '她', '它']
  const words = content.split(/\s+/).filter(word => 
    word.length > 1 && !commonWords.includes(word)
  )
  
  const wordFreq = {}
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })
  
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
  
  seoData.keywords = [...new Set([...seoData.keywords, ...topWords])]
}

const selectSocialImage = () => {
  showImagePicker.value = true
}

const handleSocialImageSelected = (imageData) => {
  socialData.ogImage = imageData.url
  showImagePicker.value = false
}

const useDefaultSocial = () => {
  socialData.ogTitle = props.post.title
  socialData.ogDescription = props.post.excerpt || 
    props.post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
  
  if (props.post.coverImage || props.post.featuredImage) {
    socialData.ogImage = props.post.coverImage || props.post.featuredImage
  }
}

const previewPost = () => {
  emit('preview', {
    post: props.post,
    seo: seoData,
    social: socialData,
    publish: publishData
  })
}

const publishPost = async () => {
  publishing.value = true
  
  try {
    const publishPayload = {
      ...props.post,
      seo: seoData,
      social: socialData,
      publishSettings: publishData,
      published: publishData.publishType !== 'draft',
      isPinned: publishData.isPinned,
      scheduledAt: publishData.publishType === 'scheduled' 
        ? new Date(`${publishData.scheduledDate}T${publishData.scheduledTime}`)
        : null
    }
    
    emit('published', publishPayload)
    
  } catch (error) {
    console.error('Publishing failed:', error)
    alert('发布失败，请重试')
  } finally {
    publishing.value = false
  }
}

const getPublishButtonText = () => {
  if (publishing.value) return '发布中...'
  
  switch (publishData.publishType) {
    case 'immediate':
      return '立即发布'
    case 'scheduled':
      return '定时发布'
    case 'draft':
      return '保存草稿'
    default:
      return '发布'
  }
}

const getCategoryName = (category) => {
  const categoryMap = {
    'MUSIC': 'MUSIC - 音乐',
    'TECH': 'TECH - 科技', 
    'SKIING': 'SKIING - 滑雪',
    'FISHING': 'FISHING - 钓鱼',
    'GAMING': 'GAMING - 游戏',
    'BLOG': 'BLOG - 博客',
    'NEWS': 'NEWS - 新闻',
    'PODCAST': 'PODCAST - 播客'
  }
  return categoryMap[category] || category
}

// Initialize default values
onMounted(() => {
  // Set default scheduled time to 1 hour from now
  const now = new Date()
  now.setHours(now.getHours() + 1)
  
  publishData.scheduledDate = now.toISOString().split('T')[0]
  publishData.scheduledTime = now.toTimeString().slice(0, 5)
  
  // Initialize SEO data from post
  seoData.title = props.post.title
  seoData.description = props.post.excerpt || ''
  
  // Initialize social data from post
  socialData.ogTitle = props.post.title
  socialData.ogDescription = props.post.excerpt || ''
  socialData.ogImage = props.post.coverImage || props.post.featuredImage || ''
  
  // Initialize publish data from post
  publishData.isPinned = props.post.isPinned || false
})
</script>

<style scoped>
.publish-workflow {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.workflow-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.workflow-header h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #212529;
}

.workflow-progress {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.workflow-progress::before {
  content: '';
  position: absolute;
  top: 16px;
  left: 24px;
  right: 24px;
  height: 2px;
  background: #e9ecef;
  z-index: 1;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progress-step.active .step-indicator {
  background: #007bff;
  color: white;
}

.progress-step.completed .step-indicator {
  background: #28a745;
  color: white;
}

.progress-step.error .step-indicator {
  background: #dc3545;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  text-align: center;
}

.progress-step.active .step-label {
  color: #007bff;
}

.progress-step.completed .step-label {
  color: #28a745;
}

.workflow-content {
  padding: 32px;
}

.workflow-step {
  max-width: 800px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-header h4 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #212529;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.step-header p {
  margin: 0;
  color: #6c757d;
  font-size: 16px;
}

/* Validation Step */
.validation-checks {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.validation-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.validation-item.pass {
  border-color: #28a745;
  background: #f8fff9;
}

.validation-item.fail {
  border-color: #dc3545;
  background: #fff5f5;
}

.check-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.validation-item.pass .check-icon {
  background: #28a745;
  color: white;
}

.validation-item.fail .check-icon {
  background: #dc3545;
  color: white;
}

.validation-item.pending .check-icon {
  background: #ffc107;
  color: white;
}

.check-content {
  flex: 1;
}

.check-title {
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
}

.check-description {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 8px;
}

.check-suggestion {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #007bff;
  font-size: 14px;
  font-style: italic;
}

.check-action {
  flex-shrink: 0;
}

.action-btn {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #0056b3;
}

/* SEO Step */
.seo-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.seo-section {
  padding: 24px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.seo-section h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.seo-preview {
  grid-column: 1 / -1;
  padding: 24px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
}

.search-preview {
  max-width: 600px;
}

.preview-url {
  color: #1a0dab;
  font-size: 14px;
  margin-bottom: 4px;
}

.preview-title {
  color: #1a0dab;
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 4px;
  text-decoration: underline;
}

.preview-description {
  color: #4d5156;
  font-size: 14px;
  line-height: 1.4;
}

/* Form Elements */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #212529;
  font-size: 14px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.char-counter {
  font-size: 12px;
  color: #6c757d;
  text-align: right;
  margin-top: 4px;
}

.field-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.keywords-input {
  position: relative;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.keyword-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e9ecef;
  color: #495057;
  border-radius: 4px;
  font-size: 12px;
}

.remove-keyword {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 10px;
  padding: 2px;
}

.remove-keyword:hover {
  color: #dc3545;
}

/* Social Media Step */
.social-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.social-section {
  grid-column: 1 / -1;
  padding: 24px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.social-preview {
  grid-column: 1 / -1;
  padding: 24px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
}

.platform-previews {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.preview-item h6 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.og-preview,
.twitter-preview {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.og-image,
.twitter-image {
  aspect-ratio: 1.91/1;
  overflow: hidden;
}

.og-image img,
.twitter-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.og-content,
.twitter-content {
  padding: 12px;
}

.og-title,
.twitter-title {
  font-weight: 600;
  color: #212529;
  font-size: 14px;
  margin-bottom: 4px;
}

.og-description,
.twitter-description {
  color: #6c757d;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.og-url,
.twitter-url {
  color: #adb5bd;
  font-size: 11px;
  text-transform: uppercase;
}

.image-selector {
  position: relative;
}

.selected-image {
  position: relative;
  display: inline-block;
}

.selected-image img {
  width: 200px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
}

.select-image-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 200px;
  height: 100px;
  border: 2px dashed #ced4da;
  background: #f8f9fa;
  color: #6c757d;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.select-image-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

/* Publishing Step */
.publishing-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.publishing-section {
  padding: 24px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.publishing-section h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.publish-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-option:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.radio-option input[type="radio"] {
  margin-top: 2px;
}

.radio-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.radio-text strong {
  color: #212529;
  font-size: 14px;
}

.radio-text small {
  color: #6c757d;
  font-size: 12px;
}

.schedule-settings {
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.scheduled-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 14px;
}

.publish-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkbox-text strong {
  color: #212529;
  font-size: 14px;
}

.checkbox-text small {
  color: #6c757d;
  font-size: 12px;
}

.publish-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-weight: 500;
  color: #495057;
}

.summary-value {
  color: #212529;
}

/* Step Actions */
.step-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.btn-primary,
.btn-secondary,
.btn-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-success:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .workflow-content {
    padding: 20px;
  }

  .seo-panel,
  .platform-previews {
    grid-template-columns: 1fr;
  }

  .social-section {
    grid-column: 1;
  }

  .step-actions {
    flex-direction: column;
  }

  .workflow-progress {
    flex-wrap: wrap;
    gap: 16px;
  }

  .workflow-progress::before {
    display: none;
  }
}
</style>