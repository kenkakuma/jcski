<template>
  <div class="preview-modal-overlay" @click.self="$emit('close')">
    <div class="preview-modal" :class="{ 'full-screen': isFullScreen }">
      <div class="preview-header">
        <div class="header-left">
          <h3>文章预览</h3>
          <div class="preview-mode-toggle">
            <button 
              :class="['mode-btn', { active: previewMode === 'desktop' }]"
              @click="previewMode = 'desktop'"
            >
              <i class="fas fa-desktop"></i>
              桌面版
            </button>
            <button 
              :class="['mode-btn', { active: previewMode === 'tablet' }]"
              @click="previewMode = 'tablet'"
            >
              <i class="fas fa-tablet-alt"></i>
              平板版
            </button>
            <button 
              :class="['mode-btn', { active: previewMode === 'mobile' }]"
              @click="previewMode = 'mobile'"
            >
              <i class="fas fa-mobile-alt"></i>
              手机版
            </button>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="toggleFullScreen" class="action-btn" title="全屏">
            <i :class="isFullScreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
          </button>
          <button @click="refreshPreview" class="action-btn" title="刷新">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button @click="$emit('close')" class="close-btn" title="关闭">
            &times;
          </button>
        </div>
      </div>

      <div class="preview-toolbar">
        <div class="toolbar-left">
          <span class="post-status" :class="statusClass">
            <i :class="statusIcon"></i>
            {{ statusText }}
          </span>
          <span class="word-count">{{ wordCount }} 字</span>
          <span class="last-updated">更新于 {{ formatDate(post.updatedAt) }}</span>
        </div>
        
        <div class="toolbar-right">
          <button v-if="!post.published" @click="publishPost" class="publish-btn">
            <i class="fas fa-paper-plane"></i>
            发布文章
          </button>
          <button @click="openInNewTab" class="open-btn">
            <i class="fas fa-external-link-alt"></i>
            新窗口打开
          </button>
        </div>
      </div>

      <div class="preview-content" :class="previewMode">
        <div class="preview-viewport">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>加载预览中...</p>
          </div>
          
          <div v-else class="preview-frame">
            <!-- Article Header -->
            <header class="article-header">
              <div class="article-meta">
                <span :class="['category-badge', getCategoryClass(post.category)]">
                  {{ getCategoryName(post.category) }}
                </span>
                <time :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
                <span v-if="post.isPinned" class="pinned-badge">
                  <i class="fas fa-thumbtack"></i>
                  置顶
                </span>
              </div>
              
              <h1 class="article-title">{{ post.title }}</h1>
              
              <div class="article-excerpt" v-if="post.excerpt">
                {{ post.excerpt }}
              </div>
              
              <div v-if="post.coverImage" class="article-cover">
                <img :src="post.coverImage" :alt="post.title" />
              </div>
              
              <div class="article-tags" v-if="tags.length > 0">
                <span v-for="tag in tags" :key="tag" class="tag">
                  #{{ tag }}
                </span>
              </div>
            </header>

            <!-- Article Content -->
            <main class="article-content">
              <div 
                class="content-body" 
                v-html="processedContent"
              ></div>
              
              <!-- Audio Player -->
              <div v-if="post.audioFile" class="audio-player">
                <h3>音频内容</h3>
                <audio controls>
                  <source :src="post.audioFile" type="audio/mpeg">
                  您的浏览器不支持音频播放
                </audio>
              </div>
            </main>

            <!-- Article Footer -->
            <footer class="article-footer">
              <div class="article-info">
                <div class="author-info">
                  <div class="author-avatar">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="author-details">
                    <p class="author-name">{{ post.author?.name || 'JCSKI' }}</p>
                    <p class="publish-date">发布于 {{ formatDate(post.createdAt) }}</p>
                  </div>
                </div>
                
                <div class="article-stats">
                  <span><i class="fas fa-eye"></i> 预览模式</span>
                  <span><i class="fas fa-comment"></i> 评论功能待开发</span>
                  <span><i class="fas fa-share-alt"></i> 分享功能待开发</span>
                </div>
              </div>
              
              <div class="related-articles">
                <h3>相关文章</h3>
                <p class="coming-soon">相关文章推荐功能开发中...</p>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <div v-if="showSEOPanel" class="seo-preview-panel">
        <div class="seo-panel-header">
          <h4>SEO 预览</h4>
          <button @click="showSEOPanel = false" class="panel-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="seo-preview">
          <div class="google-preview">
            <h5>Google 搜索结果预览</h5>
            <div class="search-result">
              <div class="result-url">{{ baseUrl }}/posts/{{ post.slug }}</div>
              <div class="result-title">{{ post.title }}</div>
              <div class="result-description">{{ post.excerpt || post.content.substring(0, 160) + '...' }}</div>
            </div>
          </div>
          
          <div class="social-preview">
            <h5>社交媒体分享预览</h5>
            <div class="og-preview">
              <div v-if="post.coverImage || post.featuredImage" class="og-image">
                <img :src="post.coverImage || post.featuredImage" :alt="post.title" />
              </div>
              <div class="og-content">
                <div class="og-title">{{ post.title }}</div>
                <div class="og-description">{{ post.excerpt || post.content.substring(0, 200) + '...' }}</div>
                <div class="og-url">{{ baseUrl }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'publish'])

// Reactive state
const previewMode = ref('desktop')
const isFullScreen = ref(false)
const loading = ref(false)
const showSEOPanel = ref(false)
const baseUrl = ref('https://jcski.com')

// Computed properties
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

const statusClass = computed(() => {
  return props.post.published ? 'published' : 'draft'
})

const statusIcon = computed(() => {
  return props.post.published ? 'fas fa-check-circle' : 'fas fa-edit'
})

const statusText = computed(() => {
  return props.post.published ? '已发布' : '草稿'
})

const processedContent = computed(() => {
  let content = props.post.content || ''
  
  // Process internal links
  content = content.replace(
    /href="\/posts\//g,
    `href="${baseUrl.value}/posts/`
  )
  
  // Process relative image paths
  content = content.replace(
    /src="\/uploads\//g,
    `src="${baseUrl.value}/uploads/`
  )
  
  return content
})

// Methods
const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
}

const refreshPreview = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const publishPost = () => {
  emit('publish', props.post)
}

const openInNewTab = () => {
  const url = `${baseUrl.value}/posts/${props.post.slug}`
  window.open(url, '_blank')
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

const getCategoryClass = (category) => {
  const classMap = {
    'MUSIC': 'music',
    'TECH': 'tech',
    'SKIING': 'skiing',
    'FISHING': 'fishing',
    'GAMING': 'gaming',
    'BLOG': 'blog',
    'NEWS': 'news',
    'PODCAST': 'podcast'
  }
  return classMap[category] || 'default'
}

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close')
  } else if (event.key === 'F11') {
    event.preventDefault()
    toggleFullScreen()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.preview-modal-overlay {
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

.preview-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.preview-modal.full-screen {
  max-width: none;
  height: 100vh;
  border-radius: 0;
  margin: 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.preview-mode-toggle {
  display: flex;
  border: 1px solid #ced4da;
  border-radius: 6px;
  overflow: hidden;
}

.mode-btn {
  padding: 8px 12px;
  border: none;
  background: white;
  color: #495057;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  border-right: 1px solid #ced4da;
}

.mode-btn:last-child {
  border-right: none;
}

.mode-btn:hover {
  background: #e9ecef;
}

.mode-btn.active {
  background: #007bff;
  color: white;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  padding: 8px;
  border: 1px solid #ced4da;
  background: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.close-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #c82333;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.post-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.post-status.published {
  background: #d4edda;
  color: #155724;
}

.post-status.draft {
  background: #fff3cd;
  color: #856404;
}

.word-count,
.last-updated {
  font-size: 12px;
  color: #6c757d;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.publish-btn,
.open-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.publish-btn {
  background: #28a745;
  color: white;
}

.publish-btn:hover {
  background: #218838;
}

.open-btn {
  background: #007bff;
  color: white;
}

.open-btn:hover {
  background: #0056b3;
}

.preview-content {
  flex: 1;
  overflow: auto;
  background: #f8f9fa;
  padding: 20px;
}

.preview-content.desktop .preview-viewport {
  max-width: 1200px;
  margin: 0 auto;
}

.preview-content.tablet .preview-viewport {
  max-width: 768px;
  margin: 0 auto;
}

.preview-content.mobile .preview-viewport {
  max-width: 375px;
  margin: 0 auto;
}

.preview-viewport {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preview-frame {
  padding: 40px;
}

/* Article Styles */
.article-header {
  margin-bottom: 40px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
}

.category-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-badge.music { background: #e1bee7; color: #7b1fa2; }
.category-badge.tech { background: #bbdefb; color: #1976d2; }
.category-badge.skiing { background: #b3e5fc; color: #0277bd; }
.category-badge.fishing { background: #c8e6c9; color: #388e3c; }
.category-badge.gaming { background: #ffcdd2; color: #d32f2f; }
.category-badge.blog { background: #f0f4c3; color: #689f38; }
.category-badge.news { background: #ffe0b2; color: #f57c00; }
.category-badge.podcast { background: #d1c4e9; color: #512da8; }
.category-badge.default { background: #e0e0e0; color: #424242; }

.pinned-badge {
  background: #fff3cd;
  color: #856404;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.article-excerpt {
  font-size: 18px;
  color: #6c757d;
  margin-bottom: 24px;
  line-height: 1.5;
}

.article-cover {
  margin: 24px 0;
  text-align: center;
}

.article-cover img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag {
  background: #f8f9fa;
  color: #495057;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.article-content {
  margin-bottom: 40px;
}

.content-body {
  font-size: 16px;
  line-height: 1.7;
  color: #212529;
}

/* Content body styles */
.content-body h1 { font-size: 28px; margin: 32px 0 16px 0; }
.content-body h2 { font-size: 24px; margin: 28px 0 14px 0; }
.content-body h3 { font-size: 20px; margin: 24px 0 12px 0; }
.content-body p { margin: 16px 0; }
.content-body ul, .content-body ol { margin: 16px 0; padding-left: 24px; }
.content-body li { margin: 8px 0; }
.content-body blockquote {
  margin: 24px 0;
  padding: 16px 20px;
  border-left: 4px solid #007bff;
  background: #f8f9fa;
  font-style: italic;
}
.content-body code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}
.content-body pre {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin: 24px 0;
  overflow-x: auto;
}
.content-body img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 16px 0;
}

.audio-player {
  margin: 32px 0;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.audio-player h3 {
  margin: 0 0 16px 0;
  color: #212529;
  font-size: 18px;
}

.audio-player audio {
  width: 100%;
  height: 40px;
}

.article-footer {
  border-top: 1px solid #e9ecef;
  padding-top: 32px;
}

.article-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.author-details p {
  margin: 0;
}

.author-name {
  font-weight: 600;
  color: #212529;
}

.publish-date {
  font-size: 14px;
  color: #6c757d;
}

.article-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6c757d;
}

.article-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.related-articles h3 {
  margin: 0 0 16px 0;
  color: #212529;
  font-size: 20px;
}

.coming-soon {
  color: #6c757d;
  font-style: italic;
  margin: 0;
}

/* SEO Preview Panel */
.seo-preview-panel {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 350px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.seo-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.seo-panel-header h4 {
  margin: 0;
  font-size: 16px;
  color: #212529;
}

.panel-close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
}

.seo-preview {
  padding: 20px;
}

.google-preview,
.social-preview {
  margin-bottom: 24px;
}

.google-preview h5,
.social-preview h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #212529;
}

.search-result {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px;
}

.result-url {
  font-size: 12px;
  color: #1a0dab;
  margin-bottom: 4px;
}

.result-title {
  font-size: 16px;
  color: #1a0dab;
  font-weight: 500;
  margin-bottom: 4px;
  text-decoration: underline;
}

.result-description {
  font-size: 13px;
  color: #4d5156;
  line-height: 1.4;
}

.og-preview {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.og-image {
  aspect-ratio: 1.91/1;
  overflow: hidden;
}

.og-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.og-content {
  padding: 12px;
}

.og-title {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
}

.og-description {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
  margin-bottom: 8px;
}

.og-url {
  font-size: 11px;
  color: #adb5bd;
  text-transform: uppercase;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .preview-modal-overlay {
    padding: 0;
  }

  .preview-modal {
    border-radius: 0;
    height: 100vh;
    max-width: none;
  }

  .preview-header {
    padding: 12px 16px;
  }

  .header-left {
    gap: 12px;
  }

  .preview-mode-toggle {
    display: none;
  }

  .preview-toolbar {
    padding: 8px 16px;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: space-between;
  }

  .preview-content {
    padding: 16px 8px;
  }

  .preview-frame {
    padding: 20px 16px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-excerpt {
    font-size: 16px;
  }

  .article-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .article-stats {
    flex-direction: column;
    gap: 8px;
  }

  .seo-preview-panel {
    position: static;
    width: 100%;
    margin-top: 16px;
  }
}
</style>