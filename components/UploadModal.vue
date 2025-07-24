<template>
  <div class="upload-modal-overlay" @click.self="$emit('close')">
    <div class="upload-modal">
      <div class="modal-header">
        <h3>上传文件</h3>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Upload Area -->
        <div 
          class="upload-area"
          :class="{ 
            'drag-over': isDragOver,
            'uploading': uploading,
            'has-files': selectedFiles.length > 0
          }"
          @click="triggerFileInput"
          @drop="handleDrop"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
        >
          <!-- Default State -->
          <div v-if="!uploading && selectedFiles.length === 0" class="upload-placeholder">
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <h4>拖拽文件到这里或点击选择</h4>
            <p>支持图片、音频、视频和文档</p>
            <div class="supported-formats">
              <span class="format-tag">JPG</span>
              <span class="format-tag">PNG</span>
              <span class="format-tag">GIF</span>
              <span class="format-tag">MP3</span>
              <span class="format-tag">MP4</span>
              <span class="format-tag">PDF</span>
            </div>
            <div class="upload-limits">
              <p>单个文件最大 50MB，最多同时上传 10 个文件</p>
            </div>
          </div>

          <!-- Uploading State -->
          <div v-if="uploading" class="uploading-state">
            <div class="upload-progress">
              <div class="progress-circle">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path
                    class="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="circle"
                    :stroke-dasharray="`${uploadProgress}, 100`"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div class="progress-text">{{ uploadProgress }}%</div>
              </div>
            </div>
            <h4>正在上传文件...</h4>
            <p>{{ currentUploadFile }}</p>
          </div>

          <!-- File List -->
          <div v-if="!uploading && selectedFiles.length > 0" class="file-list">
            <h4>准备上传 {{ selectedFiles.length }} 个文件</h4>
            <div class="file-items">
              <div 
                v-for="(file, index) in selectedFiles" 
                :key="index"
                class="file-item"
              >
                <div class="file-preview">
                  <div v-if="file.type.startsWith('image/')" class="image-preview">
                    <img :src="file.preview" :alt="file.name" />
                  </div>
                  <div v-else class="file-icon">
                    <i :class="getFileIcon(file.type)"></i>
                  </div>
                </div>
                
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  <div v-if="file.error" class="file-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    {{ file.error }}
                  </div>
                </div>
                
                <button @click="removeFile(index)" class="remove-file-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- File Input -->
        <input 
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
          @change="handleFileSelect"
          style="display: none"
        />

        <!-- Upload Settings -->
        <div v-if="selectedFiles.length > 0 && !uploading" class="upload-settings">
          <h4>上传设置</h4>
          
          <div class="setting-group">
            <label class="setting-label">
              <input 
                v-model="uploadSettings.autoOptimize" 
                type="checkbox"
                class="setting-checkbox"
              >
              <span class="checkbox-text">
                自动优化图片
                <small>压缩图片以减少文件大小，提高加载速度</small>
              </span>
            </label>
          </div>
          
          <div class="setting-group">
            <label class="setting-label">
              <input 
                v-model="uploadSettings.generateThumbnails" 
                type="checkbox"
                class="setting-checkbox"
              >
              <span class="checkbox-text">
                生成缩略图
                <small>为图片和视频生成缩略图，改善浏览体验</small>
              </span>
            </label>
          </div>
          
          <div class="setting-group">
            <label class="setting-label">文件命名规则</label>
            <select v-model="uploadSettings.namingRule" class="setting-select">
              <option value="original">保持原文件名</option>
              <option value="timestamp">时间戳命名</option>
              <option value="uuid">UUID命名</option>
              <option value="sequential">顺序编号</option>
            </select>
          </div>
        </div>

        <!-- Upload Results -->
        <div v-if="uploadResults.length > 0" class="upload-results">
          <h4>上传结果</h4>
          
          <div class="results-summary">
            <div class="summary-item success">
              <i class="fas fa-check-circle"></i>
              <span>成功: {{ successCount }}</span>
            </div>
            <div v-if="failureCount > 0" class="summary-item error">
              <i class="fas fa-times-circle"></i>
              <span>失败: {{ failureCount }}</span>
            </div>
          </div>
          
          <div class="results-list">
            <div 
              v-for="(result, index) in uploadResults" 
              :key="index"
              :class="['result-item', result.success ? 'success' : 'error']"
            >
              <div class="result-icon">
                <i :class="result.success ? 'fas fa-check' : 'fas fa-times'"></i>
              </div>
              
              <div class="result-info">
                <div class="result-filename">{{ result.filename }}</div>
                <div class="result-message">
                  {{ result.success ? '上传成功' : result.error }}
                </div>
              </div>
              
              <div v-if="result.success" class="result-actions">
                <button @click="copyFileUrl(result.path)" class="action-btn" title="复制链接">
                  <i class="fas fa-copy"></i>
                </button>
                <button @click="previewFile(result)" class="action-btn" title="预览">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-left">
          <button 
            v-if="uploadResults.length > 0" 
            @click="clearResults" 
            class="btn-secondary"
          >
            清除结果
          </button>
        </div>
        
        <div class="footer-right">
          <button @click="$emit('close')" class="btn-cancel">
            {{ uploading ? '最小化' : '取消' }}
          </button>
          
          <button 
            v-if="selectedFiles.length > 0 && !uploading"
            @click="startUpload" 
            class="btn-primary"
            :disabled="hasFileErrors"
          >
            <i class="fas fa-upload"></i>
            开始上传
          </button>
          
          <button 
            v-if="uploadResults.length > 0 && successCount > 0"
            @click="confirmUpload"
            class="btn-success"
          >
            <i class="fas fa-check"></i>
            完成 ({{ successCount }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close', 'uploaded'])

// Reactive state
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const currentUploadFile = ref('')
const selectedFiles = ref([])
const uploadResults = ref([])
const fileInput = ref(null)

// Upload settings
const uploadSettings = reactive({
  autoOptimize: true,
  generateThumbnails: true,
  namingRule: 'original' // original, timestamp, uuid, sequential
})

// Computed properties
const hasFileErrors = computed(() => {
  return selectedFiles.value.some(file => file.error)
})

const successCount = computed(() => {
  return uploadResults.value.filter(result => result.success).length
})

const failureCount = computed(() => {
  return uploadResults.value.filter(result => !result.success).length
})

// Methods
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
  event.target.value = '' // Reset input
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  if (selectedFiles.value.length + files.length > 10) {
    alert('最多只能同时上传 10 个文件')
    return
  }

  files.forEach(file => {
    const fileData = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: null,
      error: null
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      fileData.error = validation.error
    }

    // Generate preview for images
    if (file.type.startsWith('image/') && !fileData.error) {
      const reader = new FileReader()
      reader.onload = (e) => {
        fileData.preview = e.target.result
      }
      reader.readAsDataURL(file)
    }

    selectedFiles.value.push(fileData)
  })
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const validateFile = (file) => {
  // Check file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, error: '文件大小超过 50MB 限制' }
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '不支持的文件类型' }
  }

  return { valid: true }
}

const startUpload = async () => {
  const validFiles = selectedFiles.value.filter(fileData => !fileData.error)
  
  if (validFiles.length === 0) {
    alert('没有有效的文件可以上传')
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  uploadResults.value = []

  for (let i = 0; i < validFiles.length; i++) {
    const fileData = validFiles[i]
    currentUploadFile.value = fileData.name

    try {
      const result = await uploadSingleFile(fileData)
      uploadResults.value.push({
        filename: fileData.name,
        success: true,
        path: result.path,
        id: result.id
      })
    } catch (error) {
      console.error('Upload failed:', error)
      uploadResults.value.push({
        filename: fileData.name,
        success: false,
        error: error.message || '上传失败'
      })
    }

    uploadProgress.value = Math.round(((i + 1) / validFiles.length) * 100)
  }

  uploading.value = false
  currentUploadFile.value = ''
}

const uploadSingleFile = async (fileData) => {
  const formData = new FormData()
  formData.append('file', fileData.file)
  formData.append('settings', JSON.stringify(uploadSettings))

  const token = useCookie('auth-token').value
  const headers = { 'Authorization': `Bearer ${token}` }

  const response = await $fetch('/api/admin/media/upload', {
    method: 'POST',
    headers,
    body: formData
  })

  return response.media
}

const copyFileUrl = async (path) => {
  try {
    const baseUrl = window.location.origin
    const fullUrl = `${baseUrl}${path}`
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

const previewFile = (result) => {
  window.open(result.path, '_blank')
}

const clearResults = () => {
  uploadResults.value = []
  selectedFiles.value = []
}

const confirmUpload = () => {
  const successfulUploads = uploadResults.value
    .filter(result => result.success)
    .map(result => ({
      id: result.id,
      path: result.path,
      filename: result.filename
    }))

  emit('uploaded', successfulUploads)
}

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'fas fa-image'
  if (mimetype.startsWith('audio/')) return 'fas fa-music'
  if (mimetype.startsWith('video/')) return 'fas fa-video'
  if (mimetype.includes('pdf')) return 'fas fa-file-pdf'
  if (mimetype.includes('word')) return 'fas fa-file-word'
  if (mimetype.includes('text')) return 'fas fa-file-alt'
  return 'fas fa-file'
}

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.key === 'Escape' && !uploading.value) {
    emit('close')
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  
  // Clean up preview URLs
  selectedFiles.value.forEach(fileData => {
    if (fileData.preview && fileData.preview.startsWith('blob:')) {
      URL.revokeObjectURL(fileData.preview)
    }
  })
})
</script>

<style scoped>
.upload-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.upload-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.close-btn {
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

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.upload-area {
  border: 2px dashed #ced4da;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
  background: #fdfdfd;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #007bff;
  background: #f8f9ff;
}

.upload-area.uploading {
  cursor: not-allowed;
  opacity: 0.8;
}

.upload-area.has-files {
  cursor: default;
  border-style: solid;
  border-color: #28a745;
  background: #f8fff9;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 64px;
  color: #007bff;
  margin-bottom: 8px;
}

.upload-placeholder h4 {
  margin: 0;
  font-size: 18px;
  color: #212529;
  font-weight: 600;
}

.upload-placeholder p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}

.supported-formats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.format-tag {
  padding: 4px 8px;
  background: #e9ecef;
  color: #495057;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.upload-limits {
  margin-top: 8px;
}

.upload-limits p {
  font-size: 12px;
  color: #6c757d;
}

.uploading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-progress {
  position: relative;
}

.progress-circle {
  position: relative;
  width: 80px;
  height: 80px;
}

.circular-chart {
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: #f0f0f0;
  stroke-width: 2;
}

.circle {
  fill: none;
  stroke: #007bff;
  stroke-width: 2;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dasharray 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: 600;
  color: #007bff;
}

.uploading-state h4 {
  margin: 0;
  font-size: 16px;
  color: #212529;
}

.uploading-state p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}

.file-list h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #212529;
  text-align: left;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: #007bff;
}

.file-preview {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 20px;
  color: #6c757d;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #212529;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #6c757d;
}

.file-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #dc3545;
  margin-top: 4px;
}

.remove-file-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #f8f9fa;
  color: #6c757d;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  background: #dc3545;
  color: white;
}

.upload-settings {
  margin-bottom: 24px;
}

.upload-settings h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #212529;
}

.setting-group {
  margin-bottom: 16px;
}

.setting-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
}

.setting-checkbox {
  margin-top: 2px;
  cursor: pointer;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkbox-text small {
  color: #6c757d;
  font-size: 12px;
}

.setting-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.upload-results {
  border-top: 1px solid #e9ecef;
  padding-top: 24px;
  margin-top: 24px;
}

.upload-results h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #212529;
}

.results-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.summary-item.success {
  background: #d4edda;
  color: #155724;
}

.summary-item.error {
  background: #f8d7da;
  color: #721c24;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.result-item.success {
  background: #f8fff9;
  border-color: #28a745;
}

.result-item.error {
  background: #fff5f5;
  border-color: #dc3545;
}

.result-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.result-item.success .result-icon {
  background: #28a745;
  color: white;
}

.result-item.error .result-icon {
  background: #dc3545;
  color: white;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-filename {
  font-weight: 500;
  color: #212529;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-message {
  font-size: 12px;
  color: #6c757d;
}

.result-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f8f9fa;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #007bff;
  color: white;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-secondary,
.btn-primary,
.btn-success {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #545b62;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #ced4da;
}

.btn-secondary:hover {
  background: #e9ecef;
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

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .upload-modal-overlay {
    padding: 10px;
  }

  .upload-modal {
    max-height: 95vh;
  }

  .modal-body {
    padding: 16px;
  }

  .upload-area {
    padding: 24px 16px;
  }

  .upload-icon {
    font-size: 48px;
  }

  .supported-formats {
    gap: 6px;
  }

  .format-tag {
    font-size: 11px;
    padding: 3px 6px;
  }

  .progress-circle {
    width: 60px;
    height: 60px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .footer-left,
  .footer-right {
    justify-content: space-between;
  }
}
</style>