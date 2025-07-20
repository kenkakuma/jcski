<template>
  <div class="admin-media">
    <div class="media-header">
      <h2>媒体管理</h2>
      <div class="upload-section">
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,audio/*"
          @change="handleFileUpload"
          style="display: none"
        >
        <button @click="$refs.fileInput.click()" class="btn-primary">
          📁 上传文件
        </button>
        <button v-if="selectionMode" @click="cancelSelection" class="btn-secondary">
          取消选择
        </button>
      </div>
    </div>

    <!-- Drag and Drop Zone -->
    <div 
      v-if="!uploading"
      class="drop-zone"
      :class="{ 'drag-over': dragOver }"
      @drop="handleDrop"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @dragenter.prevent
    >
      <div class="drop-content">
        <div class="drop-icon">📁</div>
        <p>拖拽文件到这里上传</p>
        <p class="drop-hint">或点击上方按钮选择文件</p>
      </div>
    </div>

    <div class="media-filters">
      <select v-model="filter" @change="loadMedia" class="filter-select">
        <option value="all">全部文件</option>
        <option value="image">图片</option>
        <option value="audio">音频</option>
      </select>
    </div>

    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p>上传中... {{ uploadProgress }}%</p>
    </div>

    <div class="media-grid">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="mediaFiles.length === 0" class="empty-state">
        <p>暂无媒体文件</p>
      </div>

      <div v-else class="grid">
        <div 
          v-for="file in mediaFiles" 
          :key="file.id" 
          class="media-item"
          :class="{ 
            'selected': selectedFiles.some(f => f.id === file.id),
            'selection-mode': selectionMode 
          }"
        >
          <div class="media-preview">
            <div v-if="selectionMode" class="selection-checkbox">
              <input 
                type="checkbox" 
                :checked="selectedFiles.some(f => f.id === file.id)"
                @change="toggleFileSelection(file)"
              >
            </div>
            <img
              v-if="file.type === 'image'"
              :src="file.path"
              :alt="file.originalName"
              class="preview-image"
              @click="toggleFileSelection(file)"
            >
            <div v-else class="audio-preview" @click="toggleFileSelection(file)">
              <div class="audio-icon">🎵</div>
              <audio controls class="audio-controls">
                <source :src="file.path" type="audio/mpeg">
              </audio>
            </div>
          </div>

          <div class="media-info">
            <h4 class="media-name">{{ file.originalName }}</h4>
            <p class="media-details">
              {{ formatFileSize(file.size) }} • {{ formatDate(file.createdAt) }}
            </p>
            <div class="media-actions">
              <button @click="copyUrl(file.path)" class="btn-copy">复制链接</button>
              <button @click="deleteMedia(file.id)" class="btn-delete">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Media Modal -->
    <div v-if="selectedMedia" class="modal-overlay" @click.self="selectedMedia = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ selectedMedia.originalName }}</h3>
          <button @click="selectedMedia = null" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <img
            v-if="selectedMedia.type === 'image'"
            :src="selectedMedia.path"
            :alt="selectedMedia.originalName"
            class="modal-image"
          >
          <audio
            v-else
            controls
            class="modal-audio"
          >
            <source :src="selectedMedia.path" type="audio/mpeg">
          </audio>
          
          <div class="media-url">
            <label>文件URL:</label>
            <div class="url-copy">
              <input
                :value="selectedMedia.path"
                readonly
                class="url-input"
              >
              <button @click="copyUrl(selectedMedia.path)" class="btn-copy">复制</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const mediaFiles = ref([])
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const filter = ref('all')
const selectedMedia = ref(null)
const dragOver = ref(false)
const selectionMode = ref(false)
const selectedFiles = ref([])

// 接收来自父组件的选择模式
const props = defineProps({
  selectMode: {
    type: Boolean,
    default: false
  },
  allowMultiple: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'cancel'])

const loadMedia = async () => {
  loading.value = true
  try {
    const token = useCookie('auth-token').value
    if (!token) {
      await navigateTo('/admin/login')
      return
    }

    const query = filter.value !== 'all' ? `?type=${filter.value}` : ''
    const response = await $fetch(`/api/admin/media${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    mediaFiles.value = response.data.files
  } catch (error) {
    console.error('Failed to load media:', error)
    if (error.statusCode === 401) {
      await navigateTo('/admin/login')
    }
  } finally {
    loading.value = false
  }
}

const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return

  // Validate file types and sizes
  for (const file of files) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('audio/')) {
      alert('只支持图片和音频文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过10MB限制`)
      return
    }
  }

  uploading.value = true
  uploadProgress.value = 0

  const token = useCookie('auth-token').value
  if (!token) {
    alert('认证已过期，请重新登录')
    await navigateTo('/admin/login')
    return
  }

  try {
    const formData = new FormData()
    files.forEach(file => formData.append('file', file))

    const response = await $fetch('/api/admin/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      onUploadProgress: (progress) => {
        uploadProgress.value = Math.round((progress.loaded / progress.total) * 100)
      }
    })

    uploadProgress.value = 100
    alert(response.data.message)
    
  } catch (error) {
    console.error('Failed to upload files:', error)
    if (error.statusCode === 401) {
      alert('认证已过期，请重新登录')
      await navigateTo('/admin/login')
    } else {
      alert('上传失败: ' + (error.data?.message || '请重试'))
    }
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    event.target.value = '' // Reset input
    loadMedia() // Refresh list
  }
}

const selectMedia = (file) => {
  selectedMedia.value = file
}

const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('链接已复制到剪贴板')
  } catch (error) {
    console.error('Failed to copy URL:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = url
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('链接已复制到剪贴板')
  }
}

const deleteMedia = async (id) => {
  if (!confirm('确定要删除这个文件吗？')) return

  const token = useCookie('auth-token').value
  if (!token) {
    alert('认证已过期，请重新登录')
    await navigateTo('/admin/login')
    return
  }

  try {
    await $fetch(`/api/admin/media/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    alert('文件删除成功')
    loadMedia()
  } catch (error) {
    console.error('Failed to delete media:', error)
    if (error.statusCode === 401) {
      alert('认证已过期，请重新登录')
      await navigateTo('/admin/login')
    } else {
      alert('删除失败: ' + (error.data?.message || '请重试'))
    }
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 拖拽上传功能
const handleDrop = (event) => {
  event.preventDefault()
  dragOver.value = false
  
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) {
    handleFileUploadFromFiles(files)
  }
}

const handleFileUploadFromFiles = async (files) => {
  // 验证文件类型和大小
  for (const file of files) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('audio/')) {
      alert('只支持图片和音频文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过10MB限制`)
      return
    }
  }

  uploading.value = true
  uploadProgress.value = 0

  const token = useCookie('auth-token').value
  if (!token) {
    alert('认证已过期，请重新登录')
    await navigateTo('/admin/login')
    return
  }

  try {
    const formData = new FormData()
    files.forEach(file => formData.append('file', file))

    const response = await $fetch('/api/admin/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    alert(response.data.message)
    
  } catch (error) {
    console.error('Failed to upload files:', error)
    if (error.statusCode === 401) {
      alert('认证已过期，请重新登录')
      await navigateTo('/admin/login')
    } else {
      alert('上传失败: ' + (error.data?.message || '请重试'))
    }
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    loadMedia() // Refresh list
  }
}

// 选择模式功能
const toggleFileSelection = (file) => {
  if (!props.selectMode) {
    selectMedia(file)
    return
  }

  if (props.allowMultiple) {
    const index = selectedFiles.value.findIndex(f => f.id === file.id)
    if (index > -1) {
      selectedFiles.value.splice(index, 1)
    } else {
      selectedFiles.value.push(file)
    }
  } else {
    selectedFiles.value = [file]
    emit('select', file)
  }
}

const cancelSelection = () => {
  selectedFiles.value = []
  selectionMode.value = false
  emit('cancel')
}

const confirmSelection = () => {
  if (props.allowMultiple) {
    emit('select', selectedFiles.value)
  } else {
    emit('select', selectedFiles.value[0])
  }
}

// 监听选择模式变化
watch(() => props.selectMode, (newVal) => {
  selectionMode.value = newVal
  if (!newVal) {
    selectedFiles.value = []
  }
})

onMounted(() => {
  selectionMode.value = props.selectMode
  loadMedia()
})
</script>

<style scoped>
.admin-media {
  max-width: 1200px;
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.media-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-primary {
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  padding: 10px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
}

.btn-secondary:hover {
  background: #545b62;
}

/* Drag and Drop Zone */
.drop-zone {
  margin: 20px 0;
  padding: 40px 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  background: #f8f9fa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.drop-zone.drag-over {
  border-color: #007bff;
  background: #e3f2fd;
}

.drop-content {
  color: #666;
}

.drop-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.drop-zone p {
  margin: 8px 0;
  font-size: 16px;
}

.drop-hint {
  font-size: 14px !important;
  color: #999 !important;
}

.media-filters {
  margin-bottom: 20px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.upload-progress {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.media-grid {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.loading, .empty-state {
  text-align: center;
  color: #666;
  padding: 40px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.media-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.media-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.media-item.selected {
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.media-item.selection-mode {
  cursor: pointer;
}

.selection-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: white;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.selection-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.media-preview {
  position: relative;
  height: 150px;
  background: #f8f9fa;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.audio-preview {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.audio-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.audio-controls {
  width: 90%;
}

.media-info {
  padding: 12px;
}

.media-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
  word-break: break-word;
}

.media-details {
  font-size: 12px;
  color: #666;
  margin: 0 0 10px 0;
}

.media-actions {
  display: flex;
  gap: 8px;
}

.btn-copy, .btn-delete {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.btn-copy {
  background: #17a2b8;
  color: white;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
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

.modal-body {
  padding: 20px;
}

.modal-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  margin-bottom: 20px;
}

.modal-audio {
  width: 100%;
  margin-bottom: 20px;
}

.media-url label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.url-copy {
  display: flex;
  gap: 8px;
}

.url-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .media-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>