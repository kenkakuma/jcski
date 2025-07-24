<template>
  <div class="file-preview-overlay" @click.self="$emit('close')">
    <div class="file-preview-modal" :class="{ 'full-screen': isFullScreen }">
      <!-- Header -->
      <div class="preview-header">
        <div class="header-left">
          <h3>{{ file.originalName }}</h3>
          <div class="file-meta">
            <span class="file-type">{{ getFileTypeLabel(file.type) }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <span class="upload-date">{{ formatDate(file.createdAt) }}</span>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="downloadFile" class="action-btn" title="下载">
            <i class="fas fa-download"></i>
          </button>
          <button @click="copyFileUrl" class="action-btn" title="复制链接">
            <i class="fas fa-copy"></i>
          </button>
          <button @click="toggleFullScreen" class="action-btn" title="全屏">
            <i :class="isFullScreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
          </button>
          <button @click="showDeleteModal = true" class="action-btn danger" title="删除">
            <i class="fas fa-trash"></i>
          </button>
          <button @click="$emit('close')" class="close-btn" title="关闭">
            &times;
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="preview-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- Image Preview -->
        <div v-else-if="file.type === 'image'" class="image-preview">
          <div class="image-container" @wheel="handleZoom">
            <img 
              ref="imageElement"
              :src="file.path" 
              :alt="file.originalName"
              :style="imageStyles"
              @load="handleImageLoad"
              @error="handleImageError"
            />
          </div>
          
          <div class="image-controls">
            <button @click="zoomOut" class="control-btn">
              <i class="fas fa-search-minus"></i>
            </button>
            <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
            <button @click="zoomIn" class="control-btn">
              <i class="fas fa-search-plus"></i>
            </button>
            <button @click="resetZoom" class="control-btn">
              <i class="fas fa-expand-arrows-alt"></i>
            </button>
            <button @click="rotateImage" class="control-btn">
              <i class="fas fa-undo"></i>
            </button>
          </div>
        </div>

        <!-- Audio Preview -->
        <div v-else-if="file.type === 'audio'" class="audio-preview">
          <div class="audio-player">
            <div class="audio-info">
              <div class="audio-icon">
                <i class="fas fa-music"></i>
              </div>
              <div class="audio-details">
                <h4>{{ file.originalName }}</h4>
                <p>音频文件 • {{ formatFileSize(file.size) }}</p>
              </div>
            </div>
            
            <audio controls preload="metadata" class="audio-element">
              <source :src="file.path" :type="file.mimetype">
              您的浏览器不支持音频播放
            </audio>
          </div>
        </div>

        <!-- Video Preview -->
        <div v-else-if="file.type === 'video'" class="video-preview">
          <video 
            controls 
            preload="metadata"
            class="video-element"
            :poster="videoPoster"
          >
            <source :src="file.path" :type="file.mimetype">
            您的浏览器不支持视频播放
          </video>
        </div>

        <!-- Document Preview -->
        <div v-else-if="file.type === 'document'" class="document-preview">
          <!-- PDF Preview -->
          <div v-if="file.mimetype === 'application/pdf'" class="pdf-preview">
            <iframe 
              :src="file.path + '#toolbar=1'"
              class="pdf-frame"
              title="PDF Preview"
            ></iframe>
          </div>
          
          <!-- Other Documents -->
          <div v-else class="document-info">
            <div class="document-icon">
              <i :class="getFileIcon(file.mimetype)"></i>
            </div>
            <h4>{{ file.originalName }}</h4>
            <p>{{ getFileTypeLabel(file.type) }} • {{ formatFileSize(file.size) }}</p>
            <div class="document-actions">
              <button @click="downloadFile" class="btn-primary">
                <i class="fas fa-download"></i>
                下载文件
              </button>
              <button v-if="canOpenInBrowser" @click="openInBrowser" class="btn-secondary">
                <i class="fas fa-external-link-alt"></i>
                在浏览器中打开
              </button>
            </div>
          </div>
        </div>

        <!-- Unknown File Type -->
        <div v-else class="unknown-file">
          <div class="file-icon">
            <i class="fas fa-file"></i>
          </div>
          <h4>{{ file.originalName }}</h4>
          <p>{{ file.mimetype }} • {{ formatFileSize(file.size) }}</p>
          <button @click="downloadFile" class="btn-primary">
            <i class="fas fa-download"></i>
            下载文件
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="preview-footer">
        <div class="footer-left">
          <div class="file-path">
            <i class="fas fa-link"></i>
            <span>{{ file.path }}</span>
          </div>
        </div>
        
        <div class="footer-right">
          <button @click="$emit('close')" class="btn-cancel">关闭</button>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="delete-modal-overlay" @click.self="showDeleteModal = false">
        <div class="delete-modal">
          <div class="delete-header">
            <h4>删除文件</h4>
          </div>
          
          <div class="delete-body">
            <div class="warning-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <p>确定要删除文件 <strong>{{ file.originalName }}</strong> 吗？</p>
            <p class="warning-text">此操作不可撤销，文件将被永久删除。</p>
          </div>
          
          <div class="delete-footer">
            <button @click="showDeleteModal = false" class="btn-cancel">取消</button>
            <button @click="confirmDelete" class="btn-danger">
              <i class="fas fa-trash"></i>
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  file: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'delete'])

// Reactive state
const loading = ref(false)
const isFullScreen = ref(false)
const showDeleteModal = ref(false)
const imageElement = ref(null)

// Image controls
const zoomLevel = ref(1)
const rotation = ref(0)

// Computed properties
const imageStyles = computed(() => ({
  transform: `scale(${zoomLevel.value}) rotate(${rotation.value}deg)`,
  transition: 'transform 0.3s ease'
}))

const videoPoster = computed(() => {
  // Generate poster image for video if available
  return null // Could be implemented with video thumbnail generation
})

const canOpenInBrowser = computed(() => {
  const browserSupportedTypes = [
    'text/plain', 'text/html', 'text/css', 'text/javascript',
    'application/json', 'application/xml'
  ]
  return browserSupportedTypes.includes(props.file.mimetype)
})

// Methods
const handleImageLoad = () => {
  loading.value = false
}

const handleImageError = () => {
  loading.value = false
  console.error('Failed to load image:', props.file.path)
}

const handleZoom = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.max(0.1, Math.min(5, zoomLevel.value + delta))
  zoomLevel.value = newZoom
}

const zoomIn = () => {
  zoomLevel.value = Math.min(5, zoomLevel.value + 0.2)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(0.1, zoomLevel.value - 0.2)
}

const resetZoom = () => {
  zoomLevel.value = 1
  rotation.value = 0
}

const rotateImage = () => {
  rotation.value = (rotation.value + 90) % 360
}

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
}

const downloadFile = () => {
  const link = document.createElement('a')
  link.href = props.file.path
  link.download = props.file.originalName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copyFileUrl = async () => {
  try {
    const baseUrl = window.location.origin
    const fullUrl = `${baseUrl}${props.file.path}`
    await navigator.clipboard.writeText(fullUrl)
    
    // Show temporary feedback
    const button = event.target.closest('button')
    const icon = button.querySelector('i')
    const originalClass = icon.className
    icon.className = 'fas fa-check'
    setTimeout(() => {
      icon.className = originalClass
    }, 1000)
  } catch (error) {
    console.error('Failed to copy URL:', error)
  }
}

const openInBrowser = () => {
  window.open(props.file.path, '_blank')
}

const confirmDelete = async () => {
  try {
    const token = useCookie('auth-token').value
    const headers = { 'Authorization': `Bearer ${token}` }
    
    await $fetch(`/api/admin/media/${props.file.id}`, {
      method: 'DELETE',
      headers
    })
    
    emit('delete', props.file.id)
  } catch (error) {
    console.error('Failed to delete file:', error)
    alert('删除失败，请重试')
  }
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

const getFileIcon = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'fas fa-image'
  if (mimetype.startsWith('audio/')) return 'fas fa-music'
  if (mimetype.startsWith('video/')) return 'fas fa-video'
  if (mimetype.includes('pdf')) return 'fas fa-file-pdf'
  if (mimetype.includes('word')) return 'fas fa-file-word'
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'fas fa-file-excel'
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'fas fa-file-powerpoint'
  if (mimetype.includes('zip') || mimetype.includes('rar')) return 'fas fa-file-archive'
  if (mimetype.includes('text')) return 'fas fa-file-alt'
  return 'fas fa-file'
}

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    if (showDeleteModal.value) {
      showDeleteModal.value = false
    } else {
      emit('close')
    }
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    if (!showDeleteModal.value) {
      showDeleteModal.value = true
    }
  } else if (event.key === 'F11') {
    event.preventDefault()
    toggleFullScreen()
  } else if (props.file.type === 'image') {
    // Image-specific shortcuts
    if (event.key === '+' || event.key === '=') {
      zoomIn()
    } else if (event.key === '-') {
      zoomOut()
    } else if (event.key === '0') {
      resetZoom()
    } else if (event.key === 'r' || event.key === 'R') {
      rotateImage()
    }
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  
  if (props.file.type === 'image') {
    loading.value = true
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.file-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.file-preview-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1000px;
  height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.file-preview-modal.full-screen {
  max-width: none;
  height: 100vh;
  border-radius: 0;
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

.header-left h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6c757d;
}

.file-type {
  padding: 2px 6px;
  background: #e9ecef;
  border-radius: 3px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ced4da;
  background: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.action-btn.danger:hover {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
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

.preview-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Image Preview */
.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.image-container {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  cursor: move;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
}

.image-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.control-btn {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.zoom-level {
  padding: 8px 12px;
  font-size: 14px;
  color: white;
  font-weight: 500;
}

/* Audio Preview */
.audio-preview {
  width: 100%;
  max-width: 600px;
  padding: 40px;
}

.audio-player {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.audio-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.audio-details h4 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #212529;
}

.audio-details p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.audio-element {
  width: 100%;
  height: 54px;
}

/* Video Preview */
.video-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.video-element {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

/* Document Preview */
.document-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-preview {
  width: 100%;
  height: 100%;
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.document-info,
.unknown-file {
  text-align: center;
  padding: 40px;
  max-width: 400px;
}

.document-icon,
.file-icon {
  font-size: 64px;
  color: #6c757d;
  margin-bottom: 16px;
}

.document-info h4,
.unknown-file h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #212529;
}

.document-info p,
.unknown-file p {
  margin: 0 0 24px 0;
  color: #6c757d;
  font-size: 16px;
}

.document-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
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

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #ced4da;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.preview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  flex-shrink: 0;
  font-size: 12px;
}

.file-path {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  font-family: monospace;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #ced4da;
  background: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn-cancel:hover {
  background: #f8f9fa;
}

/* Delete Modal */
.delete-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.delete-modal {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.delete-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e9ecef;
}

.delete-header h4 {
  margin: 0;
  font-size: 18px;
  color: #212529;
}

.delete-body {
  padding: 20px 24px;
  text-align: center;
}

.warning-icon {
  font-size: 48px;
  color: #ffc107;
  margin-bottom: 16px;
}

.delete-body p {
  margin: 0 0 8px 0;
  color: #212529;
}

.warning-text {
  font-size: 14px;
  color: #6c757d;
}

.delete-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
}

.btn-danger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: #dc3545;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn-danger:hover {
  background: #c82333;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .file-preview-overlay {
    padding: 0;
  }

  .file-preview-modal {
    border-radius: 0;
    height: 100vh;
    max-width: none;
  }

  .preview-header {
    padding: 12px 16px;
  }

  .header-left h3 {
    max-width: 200px;
    font-size: 16px;
  }

  .file-meta {
    flex-direction: column;
    gap: 4px;
  }

  .header-actions {
    gap: 4px;
  }

  .action-btn,
  .close-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .image-controls {
    flex-wrap: wrap;
    gap: 4px;
  }

  .control-btn {
    padding: 6px 8px;
    font-size: 12px;
  }

  .audio-player {
    padding: 20px;
  }

  .audio-info {
    flex-direction: column;
    text-align: center;
  }

  .audio-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .document-info,
  .unknown-file {
    padding: 20px;
  }

  .document-icon,
  .file-icon {
    font-size: 48px;
  }

  .document-actions {
    flex-direction: column;
  }

  .preview-footer {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .file-path {
    justify-content: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>