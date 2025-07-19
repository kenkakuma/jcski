<template>
  <div class="admin-posts">
    <div class="posts-header">
      <div class="header-left">
        <h2>文章管理</h2>
        <div class="posts-filters">
          <select v-model="filter" class="filter-select" @change="loadPosts">
            <option value="all">全部文章</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
        </div>
      </div>
      <button @click="showEditor = true" class="btn-primary">
        ✏️ 新建文章
      </button>
    </div>

    <!-- Posts List -->
    <div class="posts-list">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="posts.length === 0" class="empty-state">
        <p>暂无文章</p>
      </div>

      <div v-else class="posts-table">
        <div class="table-header">
          <div class="col-title">标题</div>
          <div class="col-category">分类</div>
          <div class="col-status">状态</div>
          <div class="col-pin">置顶</div>
          <div class="col-date">更新时间</div>
          <div class="col-actions">操作</div>
        </div>

        <div v-for="post in posts" :key="post.id" class="table-row">
          <div class="col-title">
            <h4>
              {{ post.title }}
              <span v-if="post.isPinned" class="pin-icon" title="置顶文章">📌</span>
            </h4>
            <p class="post-excerpt">{{ post.excerpt }}</p>
          </div>
          <div class="col-category">
            <span :class="['category-badge', getCategoryClass(post.category)]">
              {{ post.category }}
            </span>
          </div>
          <div class="col-status">
            <span :class="['status-badge', post.published ? 'published' : 'draft']">
              {{ post.published ? '已发布' : '草稿' }}
            </span>
          </div>
          <div class="col-pin">
            <span :class="['pin-badge', post.isPinned ? 'pinned' : 'not-pinned']">
              {{ post.isPinned ? '置顶' : '普通' }}
            </span>
          </div>
          <div class="col-date">
            {{ formatDate(post.updatedAt) }}
          </div>
          <div class="col-actions">
            <button @click="editPost(post)" class="btn-edit">编辑</button>
            <button @click="deletePost(post.id)" class="btn-delete">删除</button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="pagination">
        <button
          v-for="page in pagination.pages"
          :key="page"
          :class="['page-btn', { active: page === currentPage }]"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- Editor Modal -->
    <div v-if="showEditor" class="modal-overlay" @click.self="closeEditor">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingPost ? '编辑文章' : '新建文章' }}</h3>
          <button @click="closeEditor" class="close-btn">×</button>
        </div>

        <form @submit.prevent="savePost" class="editor-form">
          <div class="form-group">
            <label>标题</label>
            <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="请输入文章标题"
              required
            >
          </div>

          <div class="form-group">
            <label>URL别名</label>
            <input
              v-model="form.slug"
              type="text"
              class="form-input"
              placeholder="URL别名 (可选)"
            >
          </div>

          <div class="form-group">
            <label>摘要</label>
            <textarea
              v-model="form.excerpt"
              class="form-textarea"
              placeholder="请输入文章摘要"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>正文</label>
            <textarea
              v-model="form.content"
              class="form-textarea content-editor"
              placeholder="请输入文章内容（支持Markdown）"
              rows="15"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>分类</label>
              <select v-model="form.category" class="form-select" required>
                <option value="">请选择分类</option>
                <option value="MUSIC">MUSIC - 音乐</option>
                <option value="TECH">TECH - 科技</option>
                <option value="SKIING">SKIING - 滑雪</option>
                <option value="FISHING">FISHING - 钓鱼</option>
                <option value="BLOG">BLOG - 博客</option>
                <option value="NEWS">NEWS - 新闻</option>
                <option value="GAMING">GAMING - 游戏</option>
                <option value="PODCAST">PODCAST - 播客</option>
              </select>
            </div>

            <div class="form-group">
              <label>标签</label>
              <input
                v-model="tagsInput"
                type="text"
                class="form-input"
                placeholder="用逗号分隔多个标签"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>封面图片</label>
              <input
                v-model="form.coverImage"
                type="text"
                class="form-input"
                placeholder="图片URL"
              >
              <div v-if="form.coverImage" class="image-preview">
                <img :src="form.coverImage" alt="封面图片预览" class="preview-img" />
                <p class="preview-label">封面图片预览</p>
              </div>
            </div>
            <div class="form-group">
              <label>特色图片 <span class="label-hint">（用于首页JCSKI NEWS展示）</span></label>
              <input
                v-model="form.featuredImage"
                type="text"
                class="form-input"
                placeholder="特色图片URL"
              >
              <div v-if="form.featuredImage" class="image-preview">
                <img :src="form.featuredImage" alt="特色图片预览" class="preview-img" />
                <p class="preview-label">特色图片预览</p>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>音频文件</label>
            <input
              v-model="form.audioFile"
              type="text"
              class="form-input"
              placeholder="音频文件URL"
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="form.isPinned"
                  type="checkbox"
                  class="form-checkbox"
                >
                <span class="checkbox-text">
                  📌 置顶文章 
                  <span class="label-hint">（置顶文章将显示在首页JCSKI NEWS区域）</span>
                </span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeEditor" class="btn-cancel">
              取消
            </button>
            <button type="submit" name="draft" class="btn-secondary">
              保存草稿
            </button>
            <button type="submit" name="publish" class="btn-primary">
              {{ editingPost && editingPost.published ? '更新' : '发布' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const posts = ref([])
const loading = ref(false)
const showEditor = ref(false)
const editingPost = ref(null)
const filter = ref('all')
const currentPage = ref(1)
const pagination = ref({ pages: 1, total: 0 })

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  featuredImage: '',
  audioFile: '',
  category: 'BLOG',
  published: false,
  isPinned: false
})

const tagsInput = ref('')

const loadPosts = async () => {
  loading.value = true
  try {
    const query = new URLSearchParams({
      page: currentPage.value,
      published: filter.value === 'all' ? 'all' : filter.value === 'published'
    })

    if (process.dev) {
      console.log('加载文章，查询参数:', query.toString())
    }
    
    const { data } = await $fetch(`/api/admin/posts?${query}`)
    
    if (process.dev) {
      console.log('获取的文章数据:', data)
    }
    
    posts.value = data.posts
    pagination.value = data.pagination
    
    if (process.dev) {
      console.log('文章列表已更新，数量:', posts.value.length)
    }
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

const editPost = (post) => {
  // 开发环境下的调试日志
  if (process.dev) {
    console.log('编辑文章数据:', post)
  }
  
  editingPost.value = post
  
  // 安全地处理所有字段，确保正确的类型转换
  Object.assign(form, {
    title: post.title || '',
    slug: post.slug || '',
    excerpt: post.excerpt || '',
    content: post.content || '',
    coverImage: post.coverImage || '',
    featuredImage: post.featuredImage || '',
    audioFile: post.audioFile || '',
    category: post.category || 'BLOG',
    published: Boolean(post.published),
    isPinned: Boolean(post.isPinned)
  })
  
  // 处理tags数据 - API返回的可能是数组或JSON字符串
  try {
    const tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags || '[]')
    tagsInput.value = Array.isArray(tags) ? tags.join(', ') : ''
  } catch (error) {
    console.error('解析tags数据出错:', error)
    tagsInput.value = ''
  }
  
  if (process.dev) {
    console.log('表单数据已设置:', form)
  }
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
  editingPost.value = null
  Object.assign(form, {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    featuredImage: '',
    audioFile: '',
    category: 'BLOG',
    published: false,
    isPinned: false
  })
  tagsInput.value = ''
}

const savePost = async (event) => {
  const isPublish = event.submitter.name === 'publish'
  const isDraft = event.submitter.name === 'draft'
  
  const postData = {
    ...form,
    published: isPublish ? true : isDraft ? false : form.published,
    tags: JSON.stringify(tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean))
  }

  if (process.dev) {
    console.log('保存文章数据:', postData)
    console.log('编辑中的文章:', editingPost.value)
  }

  try {
    let response
    if (editingPost.value) {
      if (process.dev) {
        console.log(`发送PUT请求到: /api/admin/posts/${editingPost.value.id}`)
      }
      response = await $fetch(`/api/admin/posts/${editingPost.value.id}`, {
        method: 'PUT',
        body: postData
      })
    } else {
      if (process.dev) {
        console.log('发送POST请求到: /api/admin/posts/create')
      }
      response = await $fetch('/api/admin/posts/create', {
        method: 'POST',
        body: postData
      })
    }

    if (process.dev) {
      console.log('保存响应:', response)
    }
    closeEditor()
    loadPosts()
  } catch (error) {
    console.error('保存失败详细信息:', error)
    alert(`保存失败: ${error.message || '请重试'}`)
  }
}

const deletePost = async (id) => {
  if (!confirm('确定要删除这篇文章吗？')) return

  try {
    await $fetch(`/api/admin/posts/${id}`, {
      method: 'DELETE'
    })
    loadPosts()
  } catch (error) {
    console.error('Failed to delete post:', error)
    alert('删除失败，请重试')
  }
}

const changePage = (page) => {
  currentPage.value = page
  loadPosts()
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

// 获取分类标签的CSS类（现在所有分类使用统一样式）
const getCategoryClass = (category) => {
  return 'category-unified'
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.admin-posts {
  max-width: 1200px;
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.posts-filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-primary, .btn-secondary, .btn-cancel {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-cancel {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.posts-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading, .empty-state {
  padding: 40px;
  text-align: center;
  color: #666;
}

.posts-table {
  overflow-x: auto;
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 1fr 120px 100px 80px 120px 120px;
  gap: 16px;
  padding: 16px 20px;
  align-items: center;
}

.table-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  font-size: 14px;
  color: #666;
}

.table-row {
  border-bottom: 1px solid #f0f0f0;
}

.table-row:hover {
  background: #f8f9fa;
}

.col-title h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
}

.post-excerpt {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.published {
  background: #d4edda;
  color: #155724;
}

.status-badge.draft {
  background: #fff3cd;
  color: #856404;
}

.category-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  background: #000;
  color: white;
}

.pin-icon {
  margin-left: 8px;
  font-size: 14px;
}

.pin-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.pin-badge.pinned {
  background: #ffe082;
  color: #f57f17;
}

.pin-badge.not-pinned {
  background: #f5f5f5;
  color: #999;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.col-actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.btn-edit {
  background: #17a2b8;
  color: white;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.page-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
}

.editor-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.label-hint {
  font-size: 12px;
  font-weight: 400;
  color: #666;
}

.image-preview {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.preview-img {
  max-width: 200px;
  max-height: 120px;
  width: auto;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-label {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #666;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #007bff;
}

.content-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .posts-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .col-pin, .col-actions {
    display: none;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .preview-img {
    max-width: 150px;
    max-height: 90px;
  }
}
</style>