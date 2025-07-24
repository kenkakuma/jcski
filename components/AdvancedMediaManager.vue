<template>
  <div class="advanced-media-manager">
    <!-- Header Section -->
    <div class="media-header">
      <div class="header-left">
        <h2>媒体管理</h2>
        <div class="media-stats">
          <span class="stat-item">
            <i class="fas fa-images"></i>
            {{ totalFiles }} 个文件
          </span>
          <span class="stat-item">
            <i class="fas fa-hdd"></i>
            {{ formatFileSize(totalSize) }}
          </span>
        </div>
      </div>
      
      <div class="header-actions">
        <button @click="showUploadModal = true" class="btn-primary">
          <i class="fas fa-upload"></i>
          上传文件
        </button>
        <button 
          v-if="selectedFiles.length > 0" 
          @click="bulkDelete" 
          class="btn-danger"
        >
          <i class="fas fa-trash"></i>
          删除选中 ({{ selectedFiles.length }})
        </button>
      </div>
    </div>

    <!-- Filter and Search Section -->
    <div class="media-filters">
      <div class="filter-left">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索文件名..." 
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <select v-model="typeFilter" class="filter-select">
          <option value="all">所有类型</option>
          <option value="image">图片</option>
          <option value="audio">音频</option>
          <option value="video">视频</option>
          <option value="document">文档</option>
        </select>
        
        <select v-model="sortBy" class="filter-select">
          <option value="createdAt">上传时间</option>
          <option value="filename">文件名</option>
          <option value="size">文件大小</option>
          <option value="type">文件类型</option>
        </select>
        
        <button @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'" class="sort-order-btn">
          <i :class="sortOrder === 'desc' ? 'fas fa-sort-amount-down' : 'fas fa-sort-amount-up'"></i>
        </button>
      </div>
      
      <div class="filter-right">
        <div class="view-mode-toggle">
          <button 
            :class="['view-btn', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
          >
            <i class="fas fa-th"></i>
          </button>
          <button 
            :class="['view-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
        
        <button @click="selectAll" class="select-all-btn">
          <i class="fas fa-check-square"></i>
          {{ allSelected ? '取消全选' : '全选' }}
        </button>
      </div>
    </div>

    <!-- Media Content -->
    <div class="media-content" :class="viewMode">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="filteredFiles.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-folder-open"></i>
        </div>
        <h3>{{ searchQuery ? '未找到匹配的文件' : '暂无媒体文件' }}</h3>
        <p>{{ searchQuery ? '请尝试其他搜索关键词' : '点击上传按钮开始添加文件' }}</p>
        <button v-if="!searchQuery" @click="showUploadModal = true" class="btn-primary">
          <i class="fas fa-upload"></i>
          上传第一个文件
        </button>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="media-grid">
        <div 
          v-for="file in paginatedFiles" 
          :key="file.id"
          :class="['media-card', { selected: selectedFiles.includes(file.id) }]"
          @click="selectFile(file.id)"
        >
          <div class="card-header">
            <div class="file-checkbox">
              <input 
                type="checkbox" 
                :checked="selectedFiles.includes(file.id)"
                @click.stop="toggleFileSelection(file.id)"
              />
            </div>
            <div class="file-actions">
              <button @click.stop="previewFile(file)" class="action-btn" title="预览">
                <i class="fas fa-eye"></i>
              </button>
              <button @click.stop="downloadFile(file)" class="action-btn" title="下载">
                <i class="fas fa-download"></i>
              </button>
              <button @click.stop="deleteFile(file.id)" class="action-btn danger" title="删除">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="file-preview">
            <div v-if="file.type === 'image'" class="image-preview">
              <img :src="file.path" :alt="file.originalName" @error="handleImageError" />
            </div>
            <div v-else class="file-icon">
              <i :class="getFileIcon(file.mimetype)"></i>
            </div>
          </div>
          
          <div class="file-info">
            <h4 class="file-name" :title="file.originalName">{{ file.originalName }}</h4>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span class="file-date">{{ formatDate(file.createdAt) }}</span>
            </div>
            <div class="file-type-badge" :class="file.type">
              {{ getFileTypeLabel(file.type) }}
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="media-list">
        <div class="list-header">
          <div class="col-checkbox">
            <input 
              type="checkbox" 
              :checked="allSelected"
              @change="selectAll"
            />
          </div>
          <div class="col-preview">预览</div>
          <div class="col-name">文件名</div>
          <div class="col-type">类型</div>
          <div class="col-size">大小</div>
          <div class="col-date">上传时间</div>
          <div class="col-actions">操作</div>
        </div>
        
        <div 
          v-for="file in paginatedFiles" 
          :key="file.id"
          :class="['list-row', { selected: selectedFiles.includes(file.id) }]"
        >
          <div class="col-checkbox">
            <input 
              type="checkbox" 
              :checked="selectedFiles.includes(file.id)"
              @change="toggleFileSelection(file.id)"
            />
          </div>
          
          <div class="col-preview">
            <div v-if="file.type === 'image'" class="list-image-preview">
              <img :src="file.path" :alt="file.originalName" />
            </div>
            <div v-else class="list-file-icon">
              <i :class="getFileIcon(file.mimetype)"></i>
            </div>
          </div>
          
          <div class="col-name">
            <div class="file-name-container">
              <span class="file-name" :title="file.originalName">{{ file.originalName }}</span>
              <span class="file-path">{{ file.path }}</span>
            </div>
          </div>
          
          <div class="col-type">
            <span class="type-badge" :class="file.type">
              {{ getFileTypeLabel(file.type) }}
            </span>
          </div>
          
          <div class="col-size">{{ formatFileSize(file.size) }}</div>
          
          <div class="col-date">{{ formatDate(file.createdAt) }}</div>
          
          <div class="col-actions">
            <button @click="previewFile(file)" class="action-btn" title="预览">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="downloadFile(file)" class="action-btn" title="下载">
              <i class="fas fa-download"></i>
            </button>
            <button @click="deleteFile(file.id)" class="action-btn danger" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <div class="pagination-info">
        显示 {{ startIndex + 1 }}-{{ endIndex }} 条，共 {{ filteredFiles.length }} 条
      </div>
      
      <div class="pagination-controls">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>
        
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-angle-left"></i>
        </button>
        
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
      
      <select v-model="pageSize" class="page-size-select">
        <option value="20">20 / 页</option>
        <option value="50">50 / 页</option>
        <option value="100">100 / 页</option>
      </select>
    </div>

    <!-- Upload Modal -->
    <UploadModal 
      v-if="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="handleFilesUploaded"
    />

    <!-- Preview Modal -->
    <FilePreviewModal 
      v-if="previewFile && showPreviewModal"
      :file="previewFile"
      @close="showPreviewModal = false"
      @delete="handleFileDeleted"
    />
  </div>
</template>

<script setup>
// Reactive state
const mediaFiles = ref([])
const loading = ref(false)
const selectedFiles = ref([])
const searchQuery = ref('')
const typeFilter = ref('all')
const sortBy = ref('createdAt')
const sortOrder = ref('desc') 
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(20)
const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const previewFileData = ref(null)

// Computed properties
const filteredFiles = computed(() => {
  let filtered = [...mediaFiles.value]
  
  // Type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(file => file.type === typeFilter.value)
  }
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(file => 
      file.originalName.toLowerCase().includes(query) ||
      file.filename.toLowerCase().includes(query)
    )
  }
  
  // Sort
  filtered.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]
    
    if (sortBy.value === 'createdAt') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    } else if (sortBy.value === 'size') {
      aVal = parseInt(aVal)
      bVal = parseInt(bVal)
    } else {
      aVal = String(aVal).toLowerCase()
      bVal = String(bVal).toLowerCase()
    }
    
    if (sortOrder.value === 'desc') {
      return bVal > aVal ? 1 : -1
    } else {
      return aVal > bVal ? 1 : -1
    }
  })
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredFiles.value.length / pageSize.value))

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredFiles.value.length))

const paginatedFiles = computed(() => {
  return filteredFiles.value.slice(startIndex.value, endIndex.value)
})

const totalFiles = computed(() => mediaFiles.value.length)

const totalSize = computed(() => {
  return mediaFiles.value.reduce((sum, file) => sum + parseInt(file.size), 0)
})

const allSelected = computed(() => {
  return paginatedFiles.value.length > 0 && 
         paginatedFiles.value.every(file => selectedFiles.value.includes(file.id))
})

// Methods
const loadMediaFiles = async () => {
  loading.value = true
  try {
    const token = useCookie('auth-token').value
    const headers = { 'Authorization': `Bearer ${token}` }
    
    const response = await $fetch('/api/admin/media', { headers })
    mediaFiles.value = response.media || []
  } catch (error) {
    console.error('Failed to load media files:', error)
  } finally {
    loading.value = false
  }
}

const selectFile = (fileId) => {
  toggleFileSelection(fileId)
}

const toggleFileSelection = (fileId) => {
  const index = selectedFiles.value.indexOf(fileId)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(fileId)
  }
}

const selectAll = () => {
  if (allSelected.value) {
    // 取消全选当前页
    paginatedFiles.value.forEach(file => {
      const index = selectedFiles.value.indexOf(file.id)
      if (index > -1) {
        selectedFiles.value.splice(index, 1)
      }
    })
  } else {
    // 全选当前页
    paginatedFiles.value.forEach(file => {
      if (!selectedFiles.value.includes(file.id)) {
        selectedFiles.value.push(file.id)
      }
    })
  }
}

const previewFile = (file) => {
  previewFileData.value = file
  showPreviewModal.value = true
}

const downloadFile = (file) => {
  const link = document.createElement('a')
  link.href = file.path
  link.download = file.originalName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const deleteFile = async (fileId) => {
  if (!confirm('确定要删除这个文件吗？此操作不可撤销。')) return
  
  try {
    const token = useCookie('auth-token').value
    const headers = { 'Authorization': `Bearer ${token}` }
    
    await $fetch(`/api/admin/media/${fileId}`, {
      method: 'DELETE',
      headers
    })
    
    mediaFiles.value = mediaFiles.value.filter(file => file.id !== fileId)
    selectedFiles.value = selectedFiles.value.filter(id => id !== fileId)
  } catch (error) {
    console.error('Failed to delete file:', error)
    alert('删除失败，请重试')
  }
}

const bulkDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectedFiles.value.length} 个文件吗？此操作不可撤销。`)) return
  
  try {
    const token = useCookie('auth-token').value
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    
    await $fetch('/api/admin/media/bulk-delete', {
      method: 'POST',
      headers,
      body: { fileIds: selectedFiles.value }
    })
    
    mediaFiles.value = mediaFiles.value.filter(file => !selectedFiles.value.includes(file.id))
    selectedFiles.value = []
  } catch (error) {
    console.error('Failed to bulk delete files:', error)
    alert('批量删除失败，请重试')
  }
}

const handleFilesUploaded = (newFiles) => {
  mediaFiles.value.unshift(...newFiles)
  showUploadModal.value = false
}

const handleFileDeleted = (fileId) => {
  mediaFiles.value = mediaFiles.value.filter(file => file.id !== fileId)
  selectedFiles.value = selectedFiles.value.filter(id => id !== fileId)
  showPreviewModal.value = false
}

const handleImageError = (event) => {
  event.target.src = '/images/broken-image.svg'
}

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

const getFileIcon = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'fas fa-image'
  if (mimetype.startsWith('audio/')) return 'fas fa-music'
  if (mimetype.startsWith('video/')) return 'fas fa-video'
  if (mimetype.includes('pdf')) return 'fas fa-file-pdf'
  if (mimetype.includes('word')) return 'fas fa-file-word'
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'fas fa-file-excel'
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'fas fa-file-powerpoint'
  if (mimetype.includes('zip') || mimetype.includes('rar')) return 'fas fa-file-archive'
  return 'fas fa-file'
}

const getFileTypeLabel = (type) => {
  const typeMap = {
    'image': '图片',
    'audio': '音频',
    'video': '视频',
    'document': '文档'
  }
  return typeMap[type] || '其他'
}

// Watchers
watch([searchQuery, typeFilter, sortBy, sortOrder], () => {
  currentPage.value = 1
})

watch(pageSize, () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadMediaFiles()
})
</script>

<style scoped>
.advanced-media-manager {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #212529;
}

.media-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6c757d;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-danger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
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

.btn-primary:hover {
  background: #0056b3;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.media-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-bottom: 1px solid #e9ecef;
  gap: 16px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #6c757d;
  font-size: 14px;
}

.search-input {
  padding: 10px 12px 10px 36px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  min-width: 250px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.clear-search:hover {
  background: #f8f9fa;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.sort-order-btn {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  color: #495057;
  transition: all 0.2s ease;
}

.sort-order-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-mode-toggle {
  display: flex;
  border: 1px solid #ced4da;
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  padding: 10px 12px;
  border: none;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  border-right: 1px solid #ced4da;
}

.view-btn:last-child {
  border-right: none;
}

.view-btn:hover {
  background: #f8f9fa;
}

.view-btn.active {
  background: #007bff;
  color: white;
}

.select-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-all-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.media-content {
  min-height: 400px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 64px;
  color: #ced4da;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #495057;
  font-size: 20px;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #6c757d;
  font-size: 16px;
}

/* Grid View Styles */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 32px;
}

.media-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.media-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.media-card.selected {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.file-checkbox input {
  cursor: pointer;
}

.file-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.media-card:hover .file-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: #f8f9fa;
  color: #495057;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e9ecef;
}

.action-btn.danger:hover {
  background: #dc3545;
  color: white;
}

.file-preview {
  aspect-ratio: 16/10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 48px;
  color: #ced4da;
}

.file-info {
  padding: 16px;
}

.file-name {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
}

.file-type-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.file-type-badge.image { background: #e3f2fd; color: #1976d2; }
.file-type-badge.audio { background: #f3e5f5; color: #7b1fa2; }
.file-type-badge.video { background: #e8f5e8; color: #388e3c; }
.file-type-badge.document { background: #fff3e0; color: #f57c00; }

/* List View Styles */
.media-list {
  padding: 0;
}

.list-header {
  display: grid;
  grid-template-columns: 40px 80px 1fr 80px 100px 120px 120px;
  gap: 16px;
  padding: 16px 32px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.list-row {
  display: grid;
  grid-template-columns: 40px 80px 1fr 80px 100px 120px 120px;
  gap: 16px;
  padding: 16px 32px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: background-color 0.2s ease;
}

.list-row:hover {
  background: #f8f9fa;
}

.list-row.selected {
  background: #f0f8ff;
}

.list-image-preview {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  overflow: hidden;
  background: #f8f9fa;
}

.list-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-file-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 24px;
  color: #ced4da;
}

.file-name-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 500;
  color: #212529;
  font-size: 14px;
}

.file-path {
  font-size: 12px;
  color: #6c757d;
  font-family: monospace;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.type-badge.image { background: #e3f2fd; color: #1976d2; }
.type-badge.audio { background: #f3e5f5; color: #7b1fa2; }
.type-badge.video { background: #e8f5e8; color: #388e3c; }
.type-badge.document { background: #fff3e0; color: #f57c00; }

.col-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.list-row:hover .col-actions {
  opacity: 1;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 8px 10px;
  border: 1px solid #ced4da;
  background: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 0 12px;
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.page-size-select {
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .media-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px;
  }

  .header-actions {
    justify-content: space-between;
  }

  .media-filters {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .filter-left {
    flex-wrap: wrap;
  }

  .search-input {
    min-width: 200px;
  }

  .media-grid {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 16px;
  }

  .list-header,
  .list-row {
    grid-template-columns: 30px 60px 1fr 60px 80px;
    padding: 12px 20px;
    gap: 12px;
  }

  .col-type,
  .col-date {
    display: none;
  }

  .pagination {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
}
</style>