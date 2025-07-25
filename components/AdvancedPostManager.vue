<template>
  <div class="advanced-post-manager">
    <!-- 顶部工具栏 -->
    <div class="manager-header">
      <div class="header-left">
        <h2 class="manager-title">
          📝 文章管理中心
          <span class="title-badge">v3.0</span>
        </h2>
        <div class="quick-stats">
          <span class="stat-item">
            <span class="stat-number">{{ stats.total }}</span>
            <span class="stat-label">总计</span>
          </span>
          <span class="stat-item">
            <span class="stat-number">{{ stats.published }}</span>
            <span class="stat-label">已发布</span>
          </span>
          <span class="stat-item">
            <span class="stat-number">{{ stats.draft }}</span>
            <span class="stat-label">草稿</span>
          </span>
        </div>
      </div>
      <div class="header-actions">
        <button @click="showCreateModal = true" class="create-btn primary">
          ✨ 新建文章
        </button>
        <button @click="toggleBulkMode" :class="['bulk-btn', { active: bulkMode }]">
          {{ bulkMode ? '✓ 批量模式' : '📋 批量操作' }}
        </button>
        <button @click="showMediaManager = true" class="media-btn">
          🖼️ 媒体管理
        </button>
        <button @click="showAnalytics = true" class="analytics-btn">
          📊 数据分析
        </button>
      </div>
    </div>

    <!-- 搜索和过滤工具栏 -->
    <div class="search-toolbar">
      <div class="search-section">
        <div class="search-input-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 搜索文章标题、内容、标签..."
            class="search-input"
            @input="handleSearch"
          >
          <div v-if="searchQuery" class="search-results-count">
            找到 {{ filteredPosts.length }} 篇文章
          </div>
        </div>
      </div>
      <div class="filter-section">
        <select v-model="statusFilter" class="filter-select" @change="applyFilters">
          <option value="all">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
          <option value="pinned">置顶</option>
        </select>
        <select v-model="categoryFilter" class="filter-select" @change="applyFilters">
          <option value="all">全部分类</option>
          <option value="GAMING">游戏</option>
          <option value="TECH">科技</option>
          <option value="SKIING">滑雪</option>
          <option value="FISHING">钓鱼</option>
          <option value="BLOG">博客</option>
        </select>
        <select v-model="sortBy" class="filter-select" @change="applySorting">
          <option value="updated">最近更新</option>
          <option value="created">创建时间</option>
          <option value="title">标题</option>
          <option value="views">浏览量</option>
        </select>
      </div>
    </div>

    <!-- 批量操作工具栏 -->
    <div v-if="bulkMode && selectedPosts.length > 0" class="bulk-actions-bar">
      <div class="bulk-info">
        已选择 {{ selectedPosts.length }} 篇文章
      </div>
      <div class="bulk-actions">
        <button @click="bulkPublish" class="bulk-action-btn publish">
          📢 批量发布
        </button>
        <button @click="bulkUnpublish" class="bulk-action-btn unpublish">
          📝 转为草稿
        </button>
        <button @click="bulkDelete" class="bulk-action-btn delete">
          🗑️ 批量删除
        </button>
        <button @click="bulkPin" class="bulk-action-btn pin">
          📌 批量置顶
        </button>
      </div>
    </div>

    <!-- 文章列表 - 卡片布局 -->
    <div class="posts-grid">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="filteredPosts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>{{ searchQuery ? '未找到匹配的文章' : '还没有文章' }}</h3>
        <p>{{ searchQuery ? '尝试调整搜索条件' : '点击"新建文章"开始创作吧！' }}</p>
        <button v-if="!searchQuery" @click="showCreateModal = true" class="create-first-btn">
          ✨ 创建第一篇文章
        </button>
      </div>

      <div v-else class="posts-cards">
        <div
          v-for="post in paginatedPosts"
          :key="post.id"
          :class="['post-card', { 
            selected: selectedPosts.includes(post.id), 
            draft: !post.published,
            pinned: post.isPinned 
          }]"
          @click="bulkMode ? toggleSelection(post.id) : editPost(post)"
        >
          <!-- 选择框 -->
          <div v-if="bulkMode" class="selection-checkbox">
            <input
              type="checkbox"
              :checked="selectedPosts.includes(post.id)"
              @click.stop="toggleSelection(post.id)"
            >
          </div>

          <!-- 文章状态标识 -->
          <div class="post-status-indicators">
            <span v-if="post.isPinned" class="status-badge pinned" title="置顶文章">📌</span>
            <span :class="['status-badge', post.published ? 'published' : 'draft']">
              {{ post.published ? '已发布' : '草稿' }}
            </span>
          </div>

          <!-- 封面图片 -->
          <div class="post-thumbnail">
            <img
              v-if="post.coverImage || post.featuredImage"
              :src="post.coverImage || post.featuredImage"
              :alt="post.title"
              class="thumbnail-img"
            >
            <div v-else class="thumbnail-placeholder">
              <span class="category-icon">{{ getCategoryIcon(post.category) }}</span>
            </div>
          </div>

          <!-- 文章信息 -->
          <div class="post-info">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ post.excerpt }}</p>
            
            <div class="post-meta">
              <span :class="['category-tag', getCategoryClass(post.category)]">
                {{ post.category }}
              </span>
              <span class="post-date">{{ formatDate(post.updatedAt) }}</span>
            </div>

            <div class="post-tags" v-if="post.tags">
              <span
                v-for="tag in getTagsArray(post.tags)"
                :key="tag"
                class="tag"
              >
                #{{ tag }}
              </span>
            </div>

            <!-- 统计信息 -->
            <div class="post-stats">
              <span class="stat">👁️ {{ post.views || 0 }}</span>
              <span class="stat">💬 {{ post.comments || 0 }}</span>
              <span class="stat">❤️ {{ post.likes || 0 }}</span>
            </div>
          </div>

          <!-- 快速操作按钮 -->
          <div v-if="!bulkMode" class="post-actions">
            <button @click.stop="editPost(post)" class="action-btn edit" title="编辑">
              ✏️
            </button>
            <button @click.stop="previewPost(post)" class="action-btn preview" title="预览">
              👁️
            </button>
            <button @click.stop="openPublishWorkflow(post)" class="action-btn publish" title="发布">
              🚀
            </button>
            <button @click.stop="duplicatePost(post)" class="action-btn duplicate" title="复制">
              📋
            </button>
            <button @click.stop="deletePost(post.id)" class="action-btn delete" title="删除">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.totalPages > 1" class="pagination-section">
      <div class="pagination-info">
        显示第 {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, pagination.total) }} 条，
        共 {{ pagination.total }} 条记录
      </div>
      <div class="pagination-controls">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ← 上一页
        </button>
        <div class="page-numbers">
          <button
            v-for="page in getPageNumbers()"
            :key="page"
            @click="changePage(page)"
            :class="['page-number', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === pagination.totalPages"
          class="page-btn"
        >
          下一页 →
        </button>
      </div>
    </div>

    <!-- 创建/编辑文章模态框 -->
    <AdvancedPostEditor
      v-if="showCreateModal || editingPost"
      :post="editingPost"
      :visible="showCreateModal || !!editingPost"
      @close="closeEditor"
      @save="handlePostSave"
    />

    <!-- 预览模态框 -->
    <PostPreviewModal
      v-if="previewingPost"
      :post="previewingPost"
      :visible="!!previewingPost"
      @close="previewingPost = null"
    />

    <!-- 媒体管理模态框 -->
    <div v-if="showMediaManager" class="modal-overlay" @click.self="showMediaManager = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>媒体管理</h3>
          <button @click="showMediaManager = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <AdvancedMediaManager />
        </div>
      </div>
    </div>

    <!-- 数据分析模态框 -->
    <div v-if="showAnalytics" class="modal-overlay" @click.self="showAnalytics = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>文章数据分析</h3>
          <button @click="showAnalytics = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <PostAnalytics />
        </div>
      </div>
    </div>

    <!-- 发布工作流模态框 -->
    <PublishWorkflow
      v-if="showPublishWorkflow && publishingPost"
      :post="publishingPost"
      :visible="showPublishWorkflow"
      @close="closePublishWorkflow"
      @published="handlePostPublished"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import AdvancedPostEditor from './AdvancedPostEditor.vue'
import PostPreviewModal from './PostPreviewModal.vue'
import AdvancedMediaManager from './AdvancedMediaManager.vue'
import PostAnalytics from './PostAnalytics.vue'
import PublishWorkflow from './PublishWorkflow.vue'

// 添加debounce工具函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Props
const props = defineProps({
  initialData: {
    type: Array,
    default: () => []
  }
})

// Reactive state
const posts = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const sortBy = ref('updated')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const bulkMode = ref(false)
const selectedPosts = ref([])

// Modals
const showCreateModal = ref(false)
const editingPost = ref(null)
const previewingPost = ref(null)
const showMediaManager = ref(false)
const showAnalytics = ref(false)
const showPublishWorkflow = ref(false)
const publishingPost = ref(null)

// Stats
const stats = reactive({
  total: 0,
  published: 0,
  draft: 0
})

// Computed
const filteredPosts = computed(() => {
  let filtered = [...posts.value]

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      (post.tags && JSON.stringify(post.tags).toLowerCase().includes(query))
    )
  }

  // 状态过滤
  switch (statusFilter.value) {
    case 'published':
      filtered = filtered.filter(post => post.published)
      break
    case 'draft':
      filtered = filtered.filter(post => !post.published)
      break
    case 'pinned':
      filtered = filtered.filter(post => post.isPinned)
      break
  }

  // 分类过滤
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(post => post.category === categoryFilter.value)
  }

  // 排序
  switch (sortBy.value) {
    case 'created':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'views':
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
      break
    default: // updated
      filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }

  return filtered
})

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPosts.value.slice(start, end)
})

const pagination = computed(() => ({
  total: filteredPosts.value.length,
  totalPages: Math.ceil(filteredPosts.value.length / itemsPerPage.value),
  currentPage: currentPage.value,
  itemsPerPage: itemsPerPage.value
}))

// Methods
const loadPosts = async () => {
  loading.value = true
  try {
    const token = useCookie('auth-token').value
    if (!token) {
      await navigateTo('/admin/login')
      return
    }

    const { data } = await $fetch('/api/admin/posts?all=true', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    posts.value = data.data.posts
    updateStats()
  } catch (error) {
    console.error('Failed to load posts:', error)
    if (error.statusCode === 401) {
      await navigateTo('/admin/login')
    }
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  stats.total = posts.value.length
  stats.published = posts.value.filter(p => p.published).length
  stats.draft = posts.value.filter(p => !p.published).length
}

const handleSearch = debounce(() => {
  currentPage.value = 1 // Reset to first page when searching
}, 300)

const applyFilters = () => {
  currentPage.value = 1
}

const applySorting = () => {
  // Computed property will handle the sorting
}

const toggleBulkMode = () => {
  bulkMode.value = !bulkMode.value
  if (!bulkMode.value) {
    selectedPosts.value = []
  }
}

const toggleSelection = (postId) => {
  const index = selectedPosts.value.indexOf(postId)
  if (index > -1) {
    selectedPosts.value.splice(index, 1)
  } else {
    selectedPosts.value.push(postId)
  }
}

const bulkPublish = async () => {
  if (!confirm(`确定要发布选中的 ${selectedPosts.value.length} 篇文章吗？`)) return
  
  try {
    const token = useCookie('auth-token').value
    await $fetch('/api/admin/posts/bulk', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        postIds: selectedPosts.value,
        action: 'publish'
      }
    })
    
    selectedPosts.value = []
    bulkMode.value = false
    await loadPosts()
  } catch (error) {
    console.error('Bulk publish failed:', error)
    alert('批量发布失败，请重试')
  }
}

const bulkUnpublish = async () => {
  if (!confirm(`确定要将选中的 ${selectedPosts.value.length} 篇文章转为草稿吗？`)) return
  
  try {
    const token = useCookie('auth-token').value
    await $fetch('/api/admin/posts/bulk', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        postIds: selectedPosts.value,
        action: 'unpublish'
      }
    })
    
    selectedPosts.value = []
    bulkMode.value = false
    await loadPosts()
  } catch (error) {
    console.error('Bulk unpublish failed:', error)
    alert('批量转换失败，请重试')
  }
}

const bulkDelete = async () => {
  if (!confirm(`⚠️ 确定要删除选中的 ${selectedPosts.value.length} 篇文章吗？此操作不可恢复！`)) return
  
  try {
    const token = useCookie('auth-token').value
    await $fetch('/api/admin/posts/bulk', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        postIds: selectedPosts.value
      }
    })
    
    selectedPosts.value = []
    bulkMode.value = false
    await loadPosts()
  } catch (error) {
    console.error('Bulk delete failed:', error)
    alert('批量删除失败，请重试')
  }
}

const bulkPin = async () => {
  if (!confirm(`确定要置顶选中的 ${selectedPosts.value.length} 篇文章吗？`)) return
  
  try {
    const token = useCookie('auth-token').value
    await $fetch('/api/admin/posts/bulk', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        postIds: selectedPosts.value,
        action: 'pin'
      }
    })
    
    selectedPosts.value = []
    bulkMode.value = false
    await loadPosts()
  } catch (error) {
    console.error('Bulk pin failed:', error)
    alert('批量置顶失败，请重试')
  }
}

const editPost = (post) => {
  editingPost.value = post
}

const previewPost = (post) => {
  previewingPost.value = post
}

const openPublishWorkflow = (post) => {
  publishingPost.value = post
  showPublishWorkflow.value = true
}

const closePublishWorkflow = () => {
  showPublishWorkflow.value = false
  publishingPost.value = null
}

const handlePostPublished = (publishedPost) => {
  // 更新文章状态
  const index = posts.value.findIndex(p => p.id === publishedPost.id)
  if (index > -1) {
    posts.value[index] = publishedPost
  }
  updateStats()
  closePublishWorkflow()
}

const duplicatePost = async (post) => {
  try {
    const token = useCookie('auth-token').value
    await $fetch('/api/admin/posts/duplicate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: { postId: post.id }
    })
    
    await loadPosts()
  } catch (error) {
    console.error('Duplicate post failed:', error)
    alert('复制文章失败，请重试')
  }
}

const deletePost = async (postId) => {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复！')) return
  
  try {
    const token = useCookie('auth-token').value
    await $fetch(`/api/admin/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    await loadPosts()
  } catch (error) {
    console.error('Delete post failed:', error)
    alert('删除失败，请重试')
  }
}

const closeEditor = () => {
  showCreateModal.value = false
  editingPost.value = null
}

const handlePostSave = () => {
  closeEditor()
  loadPosts()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const getPageNumbers = () => {
  const total = pagination.value.totalPages
  const current = currentPage.value
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCategoryIcon = (category) => {
  const icons = {
    GAMING: '🎮',
    TECH: '💻',
    SKIING: '🎿',
    FISHING: '🎣',
    BLOG: '📝',
    NEWS: '📰'
  }
  return icons[category] || '📄'
}

const getCategoryClass = (category) => {
  return `category-${category.toLowerCase()}`
}

const getTagsArray = (tags) => {
  try {
    return Array.isArray(tags) ? tags : JSON.parse(tags || '[]')
  } catch {
    return []
  }
}

// Watchers
watch(() => filteredPosts.value.length, () => {
  if (currentPage.value > pagination.value.totalPages) {
    currentPage.value = Math.max(1, pagination.value.totalPages)
  }
})

// Lifecycle
onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.advanced-post-manager {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.manager-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Special Gothic Expanded One', 'Noto Sans SC', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.title-badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quick-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.create-btn, .bulk-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn.primary {
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  color: #667eea;
  border: 1px solid rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  font-weight: 600;
}

.create-btn.primary:hover {
  background: linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  border-color: rgba(255, 255, 255, 1);
}

.bulk-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  font-weight: 600;
}

.bulk-btn:hover, .bulk-btn.active {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.media-btn, .analytics-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.media-btn:hover, .analytics-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Search and Filter Toolbar */
.search-toolbar {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
}

.search-section {
  flex: 1;
}

.search-input-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.search-results-count {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.filter-section {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 14px 18px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.filter-select:hover {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* Bulk Actions Bar */
.bulk-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #fff3cd 0%, #fef9e7 100%);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(255, 193, 7, 0.15);
  backdrop-filter: blur(10px);
}

.bulk-info {
  font-weight: 500;
  color: #856404;
}

.bulk-actions {
  display: flex;
  gap: 8px;
}

.bulk-action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bulk-action-btn.publish {
  background: #d4edda;
  color: #155724;
}

.bulk-action-btn.unpublish {
  background: #fff3cd;
  color: #856404;
}

.bulk-action-btn.delete {
  background: #f8d7da;
  color: #721c24;
}

.bulk-action-btn.pin {
  background: #ffe082;
  color: #f57f17;
}

/* Posts Grid */
.posts-grid {
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-radius: 20px;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  margin: 40px 0;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.7;
  filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.2));
}

.empty-state h3 {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 12px;
  font-family: 'Special Gothic Expanded One', 'Noto Sans SC', sans-serif;
  font-weight: 700;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 32px;
  font-size: 16px;
  line-height: 1.6;
}

.create-first-btn {
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  font-family: 'Special Gothic Expanded One', 'Noto Sans SC', sans-serif;
}

.create-first-btn:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6a5acd 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
}

/* Post Cards */
.posts-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.post-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  position: relative;
  backdrop-filter: blur(10px);
}

.post-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.post-card.selected {
  border: 2px solid #667eea;
  transform: translateY(-2px);
}

.post-card.draft {
  opacity: 0.8;
  border-left: 4px solid #ffc107;
}

.post-card.pinned {
  border-top: 3px solid #ff6b6b;
}

.selection-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

.selection-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.post-status-indicators {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  gap: 4px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.published {
  background: #d4edda;
  color: #155724;
}

.status-badge.draft {
  background: #fff3cd;
  color: #856404;
}

.status-badge.pinned {
  background: #ffe082;
  color: #f57f17;
}

.post-thumbnail {
  height: 200px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #f8f9ff 0%, #e9ecef 100%);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  height: 100%;
  background: linear-gradient(135deg, #f8f9ff 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.thumbnail-placeholder::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.category-icon {
  font-size: 48px;
}

.post-info {
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}

.post-title {
  font-size: 17px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: 'Special Gothic Expanded One', 'Noto Sans SC', sans-serif;
}

.post-excerpt {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

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

.post-date {
  font-size: 12px;
  color: #999;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.tag {
  font-size: 10px;
  color: #667eea;
  background: #f0f2ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.post-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.post-actions {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.post-card:hover .post-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #1565c0;
}

.action-btn.preview {
  background: #f3e5f5;
  color: #7b1fa2;
}

.action-btn.duplicate {
  background: #e0f2f1;
  color: #00695c;
}

.action-btn.delete {
  background: #ffebee;
  color: #c62828;
}

.action-btn.publish {
  background: #e8f5e8;
  color: #2e7d32;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 10px 18px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.page-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.page-number:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.page-number.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: scale(1.05);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(102, 126, 234, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  backdrop-filter: blur(10px);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'Special Gothic Expanded One', 'Noto Sans SC', sans-serif;
}

.modal-header .close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-header .close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .advanced-post-manager {
    padding: 12px;
  }
  
  .manager-header {
    padding: 20px;
  }
  
  .search-toolbar {
    padding: 16px;
  }
  
  .manager-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .create-btn, .bulk-btn {
    flex: 1;
  }
  
  .search-toolbar {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-section {
    flex-wrap: wrap;
  }
  
  .posts-cards {
    grid-template-columns: 1fr;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>