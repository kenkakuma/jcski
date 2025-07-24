<template>
  <div v-if="visible" class="advanced-post-editor-overlay" @click.self="handleClose">
    <div class="advanced-post-editor">
      <!-- 编辑器头部 -->
      <div class="editor-header">
        <div class="header-left">
          <h2 class="editor-title">
            {{ isEditing ? '✏️ 编辑文章' : '✨ 新建文章' }}
          </h2>
          <div class="auto-save-indicator" :class="{ saving: isSaving, saved: lastSaved }">
            <span v-if="isSaving">💾 自动保存中...</span>
            <span v-else-if="lastSaved">✅ 已保存 {{ formatSaveTime(lastSaved) }}</span>
            <span v-else>📝 等待保存</span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="togglePreview" :class="['preview-btn', { active: showPreview }]">
            {{ showPreview ? '📝 编辑模式' : '👁️ 预览模式' }}
          </button>
          <button @click="handleClose" class="close-btn">✕</button>
        </div>
      </div>

      <!-- 编辑器主体 -->
      <div class="editor-body">
        <!-- 左侧编辑区 -->
        <div v-show="!showPreview" class="editor-panel">
          <!-- 基本信息 -->
          <div class="basic-info-section">
            <div class="title-input-wrapper">
              <input
                v-model="form.title"
                type="text"
                class="title-input"
                placeholder="请输入文章标题..."
                @input="handleTitleChange"
                ref="titleInput"
              >
              <div class="title-counter">{{ form.title.length }}/100</div>
            </div>

            <div class="slug-input-wrapper">
              <label class="field-label">
                URL别名
                <span class="label-hint">(留空自动生成)</span>
              </label>
              <input
                v-model="form.slug"
                type="text"
                class="slug-input"
                placeholder="url-slug"
                @input="validateSlug"
              >
              <div v-if="slugError" class="error-message">{{ slugError }}</div>
            </div>
          </div>

          <!-- 内容编辑器 -->
          <div class="content-editor-section">
            <div class="editor-modes">
              <button
                @click="editorMode = 'rich'"
                :class="['mode-btn', { active: editorMode === 'rich' }]"
              >
                🎨 富文本
              </button>
              <button
                @click="editorMode = 'markdown'"
                :class="['mode-btn', { active: editorMode === 'markdown' }]"
              >
                📝 Markdown
              </button>
              <button
                @click="editorMode = 'html'"
                :class="['mode-btn', { active: editorMode === 'html' }]"
              >
                🔧 HTML
              </button>
            </div>

            <!-- 富文本编辑器 -->
            <div v-show="editorMode === 'rich'" class="rich-editor-wrapper">
              <AdvancedRichTextEditor
                v-model="form.content"
                :placeholder="'开始写作...'"
                @change="handleContentChange"
              />
            </div>

            <!-- Markdown编辑器 -->
            <div v-show="editorMode === 'markdown'" class="markdown-editor-wrapper">
              <div class="markdown-toolbar">
                <button @click="insertMarkdown('**', '**')" class="md-btn" title="加粗">
                  <strong>B</strong>
                </button>
                <button @click="insertMarkdown('*', '*')" class="md-btn" title="斜体">
                  <em>I</em>
                </button>
                <button @click="insertMarkdown('## ', '')" class="md-btn" title="标题">
                  H2
                </button>
                <button @click="insertMarkdown('- ', '')" class="md-btn" title="列表">
                  •
                </button>
                <button @click="insertMarkdown('[', '](url)')" class="md-btn" title="链接">
                  🔗
                </button>
                <button @click="insertMarkdown('![alt](', ')')" class="md-btn" title="图片">
                  🖼️
                </button>
                <button @click="insertMarkdown('`', '`')" class="md-btn" title="代码">
                  &lt;/&gt;
                </button>
              </div>
              <textarea
                v-model="markdownContent"
                class="markdown-textarea"
                placeholder="使用 Markdown 语法编写..."
                @input="handleMarkdownChange"
              ></textarea>
            </div>

            <!-- HTML编辑器 -->
            <div v-show="editorMode === 'html'" class="html-editor-wrapper">
              <textarea
                v-model="form.content"
                class="html-textarea"
                placeholder="直接编写 HTML 代码..."
                @input="handleContentChange"
              ></textarea>
            </div>
          </div>

          <!-- 摘要 -->
          <div class="excerpt-section">
            <label class="field-label">
              文章摘要
              <span class="label-hint">(留空自动生成)</span>
            </label>
            <textarea
              v-model="form.excerpt"
              class="excerpt-textarea"
              placeholder="简要描述文章内容..."
              rows="3"
              @input="autoSave"
            ></textarea>
            <div class="excerpt-counter">{{ form.excerpt.length }}/300</div>
          </div>
        </div>

        <!-- 右侧预览区 -->
        <div v-show="showPreview" class="preview-panel">
          <div class="preview-header">
            <h1 class="preview-title">{{ form.title || '无标题文章' }}</h1>
            <div class="preview-meta">
              <span class="preview-category" :class="getCategoryClass(form.category)">
                {{ form.category }}
              </span>
              <span class="preview-date">{{ formatDate(new Date()) }}</span>
            </div>
          </div>
          <div class="preview-content" v-html="previewContent"></div>
        </div>

        <!-- 侧边栏设置 -->
        <div class="sidebar-settings">
          <div class="settings-section">
            <h3 class="section-title">📊 发布设置</h3>
            
            <div class="publish-status">
              <label class="checkbox-label">
                <input
                  v-model="form.published"
                  type="checkbox"
                  @change="autoSave"
                >
                <span class="checkbox-text">
                  {{ form.published ? '✅ 已发布' : '📝 草稿' }}
                </span>
              </label>
            </div>

            <div class="pin-status">
              <label class="checkbox-label">
                <input
                  v-model="form.isPinned"
                  type="checkbox"
                  @change="autoSave"
                >
                <span class="checkbox-text">
                  📌 置顶文章
                  <span class="hint">在首页 JCSKI NEWS 显示</span>
                </span>
              </label>
            </div>
          </div>

          <div class="settings-section">
            <h3 class="section-title">🏷️ 分类标签</h3>
            
            <div class="category-select">
              <label class="field-label">分类</label>
              <select v-model="form.category" class="category-dropdown" @change="autoSave">
                <option value="GAMING">🎮 游戏</option>
                <option value="TECH">💻 科技</option>
                <option value="SKIING">🎿 滑雪</option>
                <option value="FISHING">🎣 钓鱼</option>
                <option value="BLOG">📝 博客</option>
                <option value="NEWS">📰 新闻</option>
              </select>
            </div>

            <div class="tags-input">
              <label class="field-label">标签</label>
              <div class="tags-wrapper">
                <div class="tag-list">
                  <span
                    v-for="tag in tagsArray"
                    :key="tag"
                    class="tag-item"
                  >
                    #{{ tag }}
                    <button @click="removeTag(tag)" class="remove-tag">×</button>
                  </span>
                </div>
                <input
                  v-model="newTag"
                  type="text"
                  class="tag-input"
                  placeholder="添加标签..."
                  @keydown.enter="addTag"
                  @keydown.comma="addTag"
                >
              </div>
              <div class="tags-suggestion">
                <span>建议标签：</span>
                <button
                  v-for="suggested in suggestedTags"
                  :key="suggested"
                  @click="addSuggestedTag(suggested)"
                  class="suggested-tag"
                >
                  #{{ suggested }}
                </button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3 class="section-title">🖼️ 媒体资源</h3>
            
            <div class="cover-image">
              <label class="field-label">封面图片</label>
              <ImagePicker
                v-model="form.coverImage"
                placeholder="选择封面图片"
              />
            </div>

            <div class="featured-image">
              <label class="field-label">
                特色图片
                <span class="hint">首页展示用</span>
              </label>
              <ImagePicker
                v-model="form.featuredImage"
                placeholder="选择特色图片"
              />
            </div>

            <div class="audio-file">
              <label class="field-label">音频文件</label>
              <input
                v-model="form.audioFile"
                type="url"
                class="audio-input"
                placeholder="音频文件 URL"
                @input="autoSave"
              >
            </div>
          </div>

          <div class="settings-section">
            <h3 class="section-title">⚙️ SEO 设置</h3>
            
            <div class="seo-title">
              <label class="field-label">SEO 标题</label>
              <input
                v-model="form.seoTitle"
                type="text"
                class="seo-input"
                :placeholder="form.title || '文章标题'"
                @input="autoSave"
              >
              <div class="char-count">{{ (form.seoTitle || form.title).length }}/60</div>
            </div>

            <div class="seo-description">
              <label class="field-label">SEO 描述</label>
              <textarea
                v-model="form.seoDescription"
                class="seo-textarea"
                :placeholder="form.excerpt || '文章描述'"
                rows="3"
                @input="autoSave"
              ></textarea>
              <div class="char-count">{{ (form.seoDescription || form.excerpt).length }}/160</div>
            </div>

            <div class="seo-keywords">
              <label class="field-label">关键词</label>
              <input
                v-model="form.seoKeywords"
                type="text"
                class="seo-input"
                placeholder="关键词1, 关键词2, 关键词3"
                @input="autoSave"
              >
            </div>
          </div>

          <div class="settings-section">
            <h3 class="section-title">📊 统计信息</h3>
            
            <div class="word-stats">
              <div class="stat-item">
                <span class="stat-label">字数统计</span>
                <span class="stat-value">{{ wordCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">预计阅读</span>
                <span class="stat-value">{{ readingTime }} 分钟</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">字符数</span>
                <span class="stat-value">{{ charCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑器底部 -->
      <div class="editor-footer">
        <div class="footer-left">
          <div class="save-status">
            <span v-if="hasUnsavedChanges" class="unsaved">● 有未保存的更改</span>
            <span v-else class="saved">✓ 所有更改已保存</span>
          </div>
        </div>
        <div class="footer-actions">
          <button @click="handleClose" class="cancel-btn">
            取消
          </button>
          <button @click="saveDraft" class="draft-btn" :disabled="isSaving">
            {{ isSaving ? '保存中...' : '保存草稿' }}
          </button>
          <button @click="saveAndPublish" class="publish-btn" :disabled="isSaving || !canPublish">
            {{ isEditing && form.published ? '更新文章' : '发布文章' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { debounce } from 'lodash-es'
import AdvancedRichTextEditor from './AdvancedRichTextEditor.vue'
import ImagePicker from './ImagePicker.vue'

// Props
const props = defineProps({
  post: {
    type: Object,
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'save'])

// Reactive state
const titleInput = ref(null)
const showPreview = ref(false)
const editorMode = ref('rich')
const isSaving = ref(false)
const lastSaved = ref(null)
const hasUnsavedChanges = ref(false)
const slugError = ref('')
const newTag = ref('')
const markdownContent = ref('')

// Form data
const form = reactive({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  featuredImage: '',
  audioFile: '',
  category: 'GAMING',
  published: false,
  isPinned: false,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: ''
})

// Computed
const isEditing = computed(() => !!props.post)

const tagsArray = computed(() => {
  try {
    return Array.isArray(form.tags) ? form.tags : JSON.parse(form.tags || '[]')
  } catch {
    return []
  }
})

const suggestedTags = computed(() => {
  const categoryTags = {
    GAMING: ['游戏评测', '电竞', '游戏攻略', '游戏新闻'],
    TECH: ['前端开发', '编程', '人工智能', '科技资讯'],
    SKIING: ['滑雪技巧', '雪场攻略', '滑雪装备', '冬季运动'],
    FISHING: ['钓鱼技巧', '钓点推荐', '渔具评测', '户外运动'],
    BLOG: ['生活感悟', '随笔', '思考', '分享'],
    NEWS: ['资讯', '新闻', '时事', '热点']
  }
  return categoryTags[form.category] || []
})

const previewContent = computed(() => {
  if (editorMode.value === 'markdown') {
    // 简单的 Markdown 到 HTML 转换
    return markdownToHtml(markdownContent.value)
  }
  return form.content
})

const wordCount = computed(() => {
  const text = form.content.replace(/<[^>]*>/g, '').replace(/\s+/g, '')
  return text.length
})

const charCount = computed(() => {
  return form.content.length
})

const readingTime = computed(() => {
  const wordsPerMinute = 200
  return Math.ceil(wordCount.value / wordsPerMinute) || 1
})

const canPublish = computed(() => {
  return form.title.trim() && form.content.trim()
})

// Methods
const initializeForm = () => {
  if (props.post) {
    Object.assign(form, {
      title: props.post.title || '',
      slug: props.post.slug || '',
      content: props.post.content || '',
      excerpt: props.post.excerpt || '',
      coverImage: props.post.coverImage || '',
      featuredImage: props.post.featuredImage || '',
      audioFile: props.post.audioFile || '',
      category: props.post.category || 'GAMING',
      published: Boolean(props.post.published),
      isPinned: Boolean(props.post.isPinned),
      seoTitle: props.post.seoTitle || '',
      seoDescription: props.post.seoDescription || '',
      seoKeywords: props.post.seoKeywords || ''
    })
    
    // 处理标签
    try {
      const tags = Array.isArray(props.post.tags) ? props.post.tags : JSON.parse(props.post.tags || '[]')
      form.tags = JSON.stringify(tags)
    } catch {
      form.tags = '[]'
    }
  } else {
    // 重置表单
    Object.assign(form, {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      coverImage: '',
      featuredImage: '',
      audioFile: '',
      category: 'GAMING',
      published: false,
      isPinned: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      tags: '[]'
    })
  }
  
  hasUnsavedChanges.value = false
  markdownContent.value = form.content
}

const handleTitleChange = () => {
  hasUnsavedChanges.value = true
  autoSave()
}

const handleContentChange = () => {
  hasUnsavedChanges.value = true
  autoSave()
}

const handleMarkdownChange = () => {
  form.content = markdownToHtml(markdownContent.value)
  hasUnsavedChanges.value = true
  autoSave()
}

const validateSlug = () => {
  const slug = form.slug.trim()
  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    slugError.value = 'URL别名只能包含小写字母、数字和连字符'
  } else {
    slugError.value = ''
  }
  hasUnsavedChanges.value = true
  autoSave()
}

const autoSave = debounce(async () => {
  if (!hasUnsavedChanges.value || !canPublish.value) return
  
  isSaving.value = true
  try {
    await savePost(false, true) // 自动保存为草稿
    lastSaved.value = new Date()
    hasUnsavedChanges.value = false
  } catch (error) {
    console.error('Auto save failed:', error)
  } finally {
    isSaving.value = false
  }
}, 2000)

const savePost = async (publish = false, autoSave = false) => {
  if (!canPublish.value) {
    alert('请填写标题和内容')
    return
  }

  // 生成 slug
  if (!form.slug.trim()) {
    form.slug = generateSlug(form.title)
  }

  // 生成摘要
  if (!form.excerpt.trim()) {
    form.excerpt = generateExcerpt(form.content)
  }

  const postData = {
    ...form,
    published: publish || form.published,
    tags: form.tags
  }

  const token = useCookie('auth-token').value
  if (!token) {
    await navigateTo('/admin/login')
    return
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/posts/${props.post.id}`, {
        method: 'PUT',
        headers,
        body: postData
      })
    } else {
      await $fetch('/api/admin/posts/create', {
        method: 'POST',
        headers,
        body: postData
      })
    }

    if (!autoSave) {
      emit('save')
    }
  } catch (error) {
    console.error('Save failed:', error)
    if (error.statusCode === 401) {
      await navigateTo('/admin/login')
    } else {
      alert(`保存失败: ${error.message || '请重试'}`)
    }
    throw error
  }
}

const saveDraft = async () => {
  isSaving.value = true
  try {
    await savePost(false)
  } finally {
    isSaving.value = false
  }
}

const saveAndPublish = async () => {
  isSaving.value = true
  try {
    await savePost(true)
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  if (hasUnsavedChanges.value) {
    if (!confirm('有未保存的更改，确定要关闭吗？')) {
      return
    }
  }
  emit('close')
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const addTag = (event) => {
  event.preventDefault()
  const tag = newTag.value.trim().replace(/[,，]/g, '')
  if (tag && !tagsArray.value.includes(tag)) {
    const updatedTags = [...tagsArray.value, tag]
    form.tags = JSON.stringify(updatedTags)
    newTag.value = ''
    hasUnsavedChanges.value = true
    autoSave()
  }
}

const removeTag = (tagToRemove) => {
  const updatedTags = tagsArray.value.filter(tag => tag !== tagToRemove)
  form.tags = JSON.stringify(updatedTags)
  hasUnsavedChanges.value = true
  autoSave()
}

const addSuggestedTag = (tag) => {
  if (!tagsArray.value.includes(tag)) {
    const updatedTags = [...tagsArray.value, tag]
    form.tags = JSON.stringify(updatedTags)
    hasUnsavedChanges.value = true
    autoSave()
  }
}

const insertMarkdown = (start, end) => {
  const textarea = document.querySelector('.markdown-textarea')
  const startPos = textarea.selectionStart
  const endPos = textarea.selectionEnd
  const selectedText = markdownContent.value.substring(startPos, endPos)
  
  const beforeText = markdownContent.value.substring(0, startPos)
  const afterText = markdownContent.value.substring(endPos)
  
  markdownContent.value = beforeText + start + selectedText + end + afterText
  
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(
      startPos + start.length,
      startPos + start.length + selectedText.length
    )
  })
  
  handleMarkdownChange()
}

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50) + '-' + Date.now()
}

const generateExcerpt = (content) => {
  const plainText = content.replace(/<[^>]*>/g, '').trim()
  return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '')
}

const markdownToHtml = (markdown) => {
  // 简单的 Markdown 转换实现
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/^- (.*)$/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/gim, '<br>')
}

const formatSaveTime = (date) => {
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  return date.toLocaleString()
}

const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getCategoryClass = (category) => {
  return `category-${category.toLowerCase()}`
}

// Keyboard shortcuts
const handleKeyboardShortcuts = (event) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 's':
        event.preventDefault()
        if (event.shiftKey) {
          saveAndPublish()
        } else {
          saveDraft()
        }
        break
      case 'p':
        event.preventDefault()
        togglePreview()
        break
    }
  }
}

// Watchers
watch(() => props.visible, (visible) => {
  if (visible) {
    initializeForm()
    nextTick(() => {
      titleInput.value?.focus()
    })
  }
})

watch(() => editorMode.value, (mode) => {
  if (mode === 'markdown' && !markdownContent.value) {
    // Convert HTML to Markdown (simplified)
    markdownContent.value = form.content
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyboardShortcuts)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})
</script>

<style scoped>
.advanced-post-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.advanced-post-editor {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1600px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Header */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editor-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.auto-save-indicator {
  font-size: 12px;
  opacity: 0.8;
}

.auto-save-indicator.saving {
  color: #ffd43b;
}

.auto-save-indicator.saved {
  color: #69db7c;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.preview-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-btn:hover, .preview-btn.active {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Body */
.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px;
  gap: 24px;
}

.preview-panel {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8f9fa;
}

.sidebar-settings {
  width: 320px;
  border-left: 1px solid #e9ecef;
  overflow-y: auto;
  padding: 24px;
  background: #f8f9fa;
}

/* Basic Info */
.basic-info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-input-wrapper {
  position: relative;
}

.title-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  background: white;
  transition: border-color 0.3s ease;
}

.title-input:focus {
  outline: none;
  border-color: #667eea;
}

.title-input::placeholder {
  color: #aaa;
  font-weight: 400;
}

.title-counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: #999;
}

.slug-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.label-hint {
  font-weight: 400;
  color: #666;
  font-size: 12px;
}

.slug-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Monaco', 'Courier New', monospace;
}

.slug-input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  font-size: 12px;
  color: #dc3545;
}

/* Content Editor */
.content-editor-section {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.editor-modes {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.mode-btn {
  padding: 12px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-right: 1px solid #e9ecef;
}

.mode-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.mode-btn.active {
  background: #667eea;
  color: white;
}

.rich-editor-wrapper,
.markdown-editor-wrapper,
.html-editor-wrapper {
  min-height: 400px;
}

.markdown-toolbar {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.md-btn {
  padding: 6px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.md-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.markdown-textarea,
.html-textarea {
  width: 100%;
  min-height: 400px;
  padding: 20px;
  border: none;
  resize: none;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.markdown-textarea:focus,
.html-textarea:focus {
  outline: none;
}

/* Excerpt */
.excerpt-section {
  position: relative;
}

.excerpt-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.excerpt-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.excerpt-counter {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 11px;
  color: #999;
  background: white;
  padding: 2px 4px;
}

/* Preview */
.preview-header {
  margin-bottom: 32px;
}

.preview-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.preview-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.preview-category {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.preview-date {
  font-size: 14px;
  color: #666;
}

.preview-content {
  font-size: 16px;
  line-height: 1.7;
  color: #333;
}

.preview-content h1,
.preview-content h2,
.preview-content h3 {
  margin: 32px 0 16px 0;
  color: #333;
}

.preview-content p {
  margin: 16px 0;
}

.preview-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
}

/* Sidebar Settings */
.settings-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e9ecef;
}

.settings-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 12px;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 2px;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hint {
  font-size: 11px;
  color: #666;
}

.category-dropdown,
.audio-input,
.seo-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.category-dropdown:focus,
.audio-input:focus,
.seo-input:focus {
  outline: none;
  border-color: #667eea;
}

.tags-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 24px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 12px;
}

.remove-tag {
  width: 16px;
  height: 16px;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 50%;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.tags-suggestion {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  font-size: 11px;
  color: #666;
}

.suggested-tag {
  padding: 2px 6px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggested-tag:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.seo-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
  resize: vertical;
  min-height: 60px;
}

.char-count {
  font-size: 11px;
  color: #999;
  text-align: right;
  margin-top: 4px;
}

.word-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* Footer */
.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.save-status .unsaved {
  color: #ffc107;
  font-size: 14px;
}

.save-status .saved {
  color: #28a745;
  font-size: 14px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.draft-btn,
.publish-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.draft-btn {
  background: #6c757d;
  color: white;
}

.publish-btn {
  background: #28a745;
  color: white;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.draft-btn:hover:not(:disabled) {
  background: #5a6268;
}

.publish-btn:hover:not(:disabled) {
  background: #218838;
}

.draft-btn:disabled,
.publish-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Category colors */
.category-gaming {
  background: #e3f2fd;
  color: #1565c0;
}

.category-tech {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category-skiing {
  background: #e0f2f1;
  color: #00695c;
}

.category-fishing {
  background: #fff3e0;
  color: #ef6c00;
}

.category-blog {
  background: #fce4ec;
  color: #c2185b;
}

.category-news {
  background: #fff8e1;
  color: #f57f17;
}

/* Responsive */
@media (max-width: 1200px) {
  .editor-body {
    flex-direction: column;
  }
  
  .sidebar-settings {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e9ecef;
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .advanced-post-editor-overlay {
    padding: 10px;
  }
  
  .advanced-post-editor {
    height: 95vh;
  }
  
  .editor-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .editor-panel {
    padding: 16px;
  }
  
  .sidebar-settings {
    padding: 16px;
  }
  
  .title-input {
    font-size: 20px;
    padding: 12px 16px;
  }
}
</style>