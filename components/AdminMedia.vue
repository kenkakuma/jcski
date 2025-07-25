<template>
  <div class="admin-media">
    <div class="media-header">
      <h2 class="media-title">
        🖼️ 媒体管理中心
        <span class="title-badge">v3.0</span>
      </h2>
      <div class="upload-section">
        <div class="storage-stats">
          <span class="stat-item">
            <span class="stat-number">{{ mediaFiles.length }}</span>
            <span class="stat-label">文件总数</span>
          </span>
          <span class="stat-item">
            <span class="stat-number">{{ formatStorageSize() }}</span>
            <span class="stat-label">已用空间</span>
          </span>
        </div>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,audio/*"
          @change="handleFileUpload"
          style="display: none"
        >
        <button @click="$refs.fileInput.click()" class="btn-primary">
          ✨ 上传文件
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
        <div class="drop-icon">🎨</div>
        <h3 class="drop-title">拖拽文件到这里上传</h3>
        <p class="drop-hint">支持 JPG、PNG、GIF、WebP、BMP、TIFF、HEIC、HEIF 格式</p>
        <p class="drop-sub-hint">文件将自动压缩至最佳质量 • 最大支持 50MB</p>
      </div>
    </div>

    <div class="media-filters">
      <div class="filter-section">
        <select v-model="filter" @change="loadMedia" class="filter-select">
          <option value="all">🗂️ 全部文件</option>
          <option value="image">🖼️ 图片文件</option>
          <option value="audio">🎵 音频文件</option>
        </select>
        <div class="view-toggle">
          <button 
            :class="['view-btn', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
          >
            🔲 网格
          </button>
          <button 
            :class="['view-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            📋 列表
          </button>
        </div>
      </div>
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

      <div v-else :class="[viewMode === 'grid' ? 'grid' : 'list-view']">
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
            <SmartImage
              v-if="file.type === 'image'"
              :src="file.path"
              :alt="file.originalName"
              class="preview-image"
              :show-loading-placeholder="true"
              :show-error-placeholder="true"
              @click="toggleFileSelection(file)"
            />
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
          <SmartImage
            v-if="selectedMedia.type === 'image'"
            :src="selectedMedia.path"
            :alt="selectedMedia.originalName"
            class="modal-image"
            :show-loading-placeholder="true"
            :show-error-placeholder="true"
          />
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
import SmartImage from './SmartImage.vue'
import { formatFileSize, isImageFile, isAudioFile } from '~/utils/media'

const mediaFiles = ref([])
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const filter = ref('all')
const selectedMedia = ref(null)
const dragOver = ref(false)
const selectionMode = ref(false)
const selectedFiles = ref([])
const viewMode = ref('grid')

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

// formatFileSize is now imported from utils/media

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatStorageSize = () => {
  const totalSize = mediaFiles.value.reduce((sum, file) => sum + (file.size || 0), 0)
  return formatFileSize(totalSize)
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.media-header {
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

.media-title {
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

.storage-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 18px;
  font-weight: 600;
}

.stat-label {
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  color: #667eea;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  margin-top: 8px;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  border-color: rgba(255, 255, 255, 1);
}

.btn-secondary {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 12px;
  margin-top: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Drag and Drop Zone */
.drop-zone {
  margin: 24px 0;
  padding: 60px 40px;
  border: 3px dashed rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  text-align: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.drop-zone.drag-over {
  border-color: #667eea;
  background: linear-gradient(135deg, #eef1ff 0%, #f0f2ff 100%);
  transform: scale(1.02);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
}

.drop-zone::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.05), transparent);
  animation: shimmer 3s infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.drop-zone:hover::before {
  opacity: 1;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.drop-content {
  color: #6c757d;
  position: relative;
  z-index: 1;
}

.drop-icon {
  font-size: 64px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.2));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.drop-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-family: 'Special Gothic Expanded One', 'Noto Sans SC', sans-serif;
}


.drop-hint {
  font-size: 14px;
  color: #667eea;
  margin: 8px 0;
  font-weight: 500;
}

.drop-sub-hint {
  font-size: 12px;
  color: #adb5bd;
  margin: 4px 0 0 0;
  opacity: 0.8;
}

.media-filters {
  margin-bottom: 24px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
}

.filter-select {
  padding: 12px 18px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.filter-select:hover {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.view-toggle {
  display: flex;
  gap: 8px;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px;
  border-radius: 12px;
}

.view-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: #667eea;
}

.view-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.view-btn:not(.active):hover {
  background: rgba(102, 126, 234, 0.1);
}

.upload-progress {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
}

.progress-bar {
  height: 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  position: relative;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.1) 10px,
    rgba(255, 255, 255, 0.1) 20px
  );
  animation: progressStripes 1s linear infinite;
}

@keyframes progressStripes {
  0% { transform: translateX(0); }
  100% { transform: translateX(20px); }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  transition: width 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  position: relative;
  z-index: 1;
}

.media-grid {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  padding: 24px;
  backdrop-filter: blur(10px);
}

.loading, .empty-state {
  text-align: center;
  color: #6c757d;
  padding: 60px 40px;
  font-size: 16px;
  font-weight: 500;
}

.empty-state {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  margin: 20px;
}

.loading {
  position: relative;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  margin: -16px 0 0 -16px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.media-item {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(10px);
  position: relative;
}

.list-view .media-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
}

.list-view .media-preview {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  margin-right: 16px;
}

.list-view .media-info {
  flex: 1;
  padding: 0;
}

.media-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.list-view .media-item:hover {
  transform: translateY(-2px) scale(1.01);
}

.media-item.selected {
  border-color: #667eea;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #eef1ff 0%, #f0f2ff 100%);
  transform: scale(1.05);
}

.media-item.selection-mode {
  cursor: pointer;
}

.selection-checkbox {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.selection-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.media-preview {
  position: relative;
  height: 180px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e9ecef 100%);
  cursor: pointer;
  overflow: hidden;
}

.media-preview::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  animation: shimmer 2s infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-preview:hover::before {
  opacity: 1;
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
  position: relative;
  z-index: 1;
}

.audio-icon {
  font-size: 40px;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.2));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.audio-controls {
  width: 90%;
}

.media-info {
  padding: 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}

.media-name {
  font-size: 15px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 6px 0;
  word-break: break-word;
  font-family: 'Special Gothic Expanded One', 'Noto Sans SC', sans-serif;
  line-height: 1.3;
}

.media-details {
  font-size: 12px;
  color: #6c757d;
  margin: 0 0 12px 0;
  opacity: 0.8;
}

.media-actions {
  display: flex;
  gap: 10px;
}

.btn-copy, .btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-copy {
  background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
}

.btn-copy:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.4);
}

.btn-delete {
  background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.btn-delete:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20px;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  box-shadow: 0 25px 80px rgba(102, 126, 234, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-radius: 20px 20px 0 0;
  backdrop-filter: blur(10px);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'Special Gothic Expanded One', 'Noto Sans SC', sans-serif;
}

.close-btn {
  background: rgba(102, 126, 234, 0.1);
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  color: #667eea;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.modal-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: contain;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.modal-audio {
  width: 100%;
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.media-url label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.url-copy {
  display: flex;
  gap: 12px;
}

.url-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 14px;
  background: rgba(248, 249, 255, 0.8);
  font-family: monospace;
  backdrop-filter: blur(10px);
}

.url-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(248, 249, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .admin-media {
    padding: 12px;
  }
  
  .media-header {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
    padding: 20px;
  }
  
  .storage-stats {
    justify-content: center;
  }
  
  .upload-section {
    align-items: stretch;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .view-toggle {
    align-self: center;
  }
  
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .drop-zone {
    padding: 40px 20px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
}
</style>