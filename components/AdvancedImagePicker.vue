<template>
  <div class="advanced-image-picker-overlay" @click.self="$emit('close')">
    <div class="advanced-image-picker">
      <div class="picker-header">
        <h3>插入图片</h3>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>

      <div class="picker-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'upload' }]"
          @click="activeTab = 'upload'"
        >
          <i class="fas fa-upload"></i>
          上传图片
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'media' }]"
          @click="activeTab = 'media'"
        >
          <i class="fas fa-images"></i>
          媒体库
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'url' }]"
          @click="activeTab = 'url'"
        >
          <i class="fas fa-link"></i>
          网络图片
        </button>
      </div>

      <div class="picker-content">
        <!-- Upload Tab -->
        <div v-if="activeTab === 'upload'" class="tab-content">
          <div 
            class="upload-area"
            :class="{ dragover: isDragOver }"
            @click="triggerFileInput"
            @drop="handleDrop"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
          >
            <div v-if="!uploading && !uploadedImage" class="upload-placeholder">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>点击或拖拽图片到这里</p>
              <span class="upload-hint">支持 JPG、PNG、GIF、WebP、BMP、TIFF、HEIC 等格式，自动压缩至800x600</span>
            </div>
            
            <div v-if="uploading" class="uploading-state">
              <div class="spinner"></div>
              <p>上传中...</p>
            </div>
            
            <div v-if="uploadedImage" class="uploaded-preview">
              <img :src="uploadedImage.url" :alt="uploadedImage.alt" />
              <div class="image-info">
                <p><strong>{{ uploadedImage.name }}</strong></p>
                <p>{{ formatFileSize(uploadedImage.size) }}</p>
              </div>
            </div>
          </div>
          
          <input 
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            style="display: none"
          />

          <div v-if="uploadedImage" class="image-settings">
            <div class="form-group">
              <label>图片描述</label>
              <input 
                v-model="imageForm.alt" 
                type="text" 
                placeholder="请输入图片描述"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>图片标题</label>
              <input 
                v-model="imageForm.title" 
                type="text" 
                placeholder="图片标题（可选）"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>图片说明</label>
              <input 
                v-model="imageForm.caption" 
                type="text" 
                placeholder="图片说明（可选）"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Media Library Tab -->
        <div v-if="activeTab === 'media'" class="tab-content">
          <div class="media-search">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜索图片..."
              class="search-input"
            />
            <select v-model="mediaFilter" class="filter-select">
              <option value="all">全部类型</option>
              <option value="image">图片</option>
            </select>
          </div>

          <div v-if="loadingMedia" class="loading-state">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>

          <div v-else-if="filteredMedia.length === 0" class="empty-state">
            <i class="fas fa-images"></i>
            <p>暂无图片</p>
          </div>

          <div v-else class="media-grid">
            <div 
              v-for="media in filteredMedia" 
              :key="media.id"
              :class="['media-item', { selected: selectedMedia?.id === media.id }]"
              @click="selectMedia(media)"
            >
              <div class="media-preview">
                <img :src="media.path" :alt="media.originalName" />
                <div class="media-overlay">
                  <i class="fas fa-check"></i>
                </div>
              </div>
              <div class="media-info">
                <p class="media-name">{{ media.originalName }}</p>
                <p class="media-meta">{{ formatFileSize(media.size) }}</p>
              </div>
            </div>
          </div>

          <div v-if="selectedMedia" class="selected-media-settings">
            <div class="form-group">
              <label>图片描述</label>
              <input 
                v-model="mediaForm.alt" 
                type="text" 
                placeholder="请输入图片描述"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>图片标题</label>
              <input 
                v-model="mediaForm.title" 
                type="text" 
                placeholder="图片标题（可选）"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>图片说明</label>
              <input 
                v-model="mediaForm.caption" 
                type="text" 
                placeholder="图片说明（可选）"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- URL Tab -->
        <div v-if="activeTab === 'url'" class="tab-content">
          <div class="url-input-section">
            <div class="form-group">
              <label>图片链接</label>
              <input 
                v-model="urlForm.url"
                type="url" 
                placeholder="https://example.com/image.jpg"
                class="form-input"
                @blur="previewUrlImage"
              />
            </div>
            
            <div v-if="urlPreview" class="url-preview">
              <img :src="urlPreview.url" :alt="urlPreview.alt" @error="urlPreviewError = true" />
              <div v-if="urlPreviewError" class="preview-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>图片加载失败，请检查链接是否正确</p>
              </div>
            </div>
          </div>

          <div v-if="urlForm.url" class="url-settings">
            <div class="form-group">
              <label>图片描述</label>
              <input 
                v-model="urlForm.alt" 
                type="text" 
                placeholder="请输入图片描述"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>图片标题</label>
              <input 
                v-model="urlForm.title" 
                type="text" 
                placeholder="图片标题（可选）"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>图片说明</label>
              <input 
                v-model="urlForm.caption" 
                type="text" 
                placeholder="图片说明（可选）"
                class="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="picker-footer">
        <button @click="$emit('close')" class="btn-cancel">取消</button>
        <button 
          @click="insertImage" 
          :disabled="!canInsert"
          class="btn-primary"
        >
          插入图片
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close', 'insert'])

// Reactive state
const activeTab = ref('upload')
const isDragOver = ref(false)
const uploading = ref(false)
const uploadedImage = ref(null)
const loadingMedia = ref(false)
const mediaList = ref([])
const selectedMedia = ref(null)
const searchQuery = ref('')
const mediaFilter = ref('all')
const urlPreview = ref(null)
const urlPreviewError = ref(false)
const fileInput = ref(null)

// Form data
const imageForm = reactive({
  alt: '',
  title: '',
  caption: ''
})

const mediaForm = reactive({
  alt: '',
  title: '',
  caption: ''
})

const urlForm = reactive({
  url: '',
  alt: '',
  title: '',
  caption: ''
})

// Computed
const filteredMedia = computed(() => {
  let filtered = mediaList.value

  if (mediaFilter.value !== 'all') {
    filtered = filtered.filter(media => media.type === mediaFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(media => 
      media.originalName.toLowerCase().includes(query)
    )
  }

  return filtered
})

const canInsert = computed(() => {
  switch (activeTab.value) {
    case 'upload':
      return uploadedImage.value && imageForm.alt.trim()
    case 'media':
      return selectedMedia.value && mediaForm.alt.trim()
    case 'url':
      return urlForm.url.trim() && urlForm.alt.trim() && !urlPreviewError.value
    default:
      return false
  }
})

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    uploadFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    uploadFile(files[0])
  }
}

const uploadFile = async (file) => {
  if (!isValidImageFile(file)) {
    alert('请选择有效的图片文件')
    return
  }

  // 移除文件大小限制，由服务器端压缩处理
  const validTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'image/bmp', 'image/tiff', 'image/svg+xml', 'image/heic', 'image/heif'
  ]
  
  if (!validTypes.includes(file.type)) {
    alert('不支持的图片格式，请选择 JPG、PNG、GIF、WebP、BMP、TIFF、HEIC 等格式的图片')
    return
  }

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch('/api/admin/media/upload', {
      method: 'POST',
      body: formData
    })

    uploadedImage.value = {
      id: response.media.id,
      url: response.media.path,
      name: file.name,
      size: file.size,
      alt: file.name.replace(/\.[^/.]+$/, '') // Remove extension
    }

    imageForm.alt = uploadedImage.value.alt

  } catch (error) {
    console.error('Upload failed:', error)
    alert('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

const loadMediaLibrary = async () => {
  loadingMedia.value = true
  try {
    const response = await $fetch('/api/admin/media')
    mediaList.value = response.media || []
  } catch (error) {
    console.error('Failed to load media:', error)
  } finally {
    loadingMedia.value = false
  }
}

const selectMedia = (media) => {
  selectedMedia.value = media
  mediaForm.alt = media.originalName.replace(/\.[^/.]+$/, '')
  mediaForm.title = ''
  mediaForm.caption = ''
}

const previewUrlImage = () => {
  if (!urlForm.url) return

  urlPreviewError.value = false
  urlPreview.value = {
    url: urlForm.url,
    alt: urlForm.alt || 'External image'
  }

  // Set default alt text from URL if not provided
  if (!urlForm.alt) {
    const filename = urlForm.url.split('/').pop()?.split('?')[0] || 'External image'
    urlForm.alt = filename.replace(/\.[^/.]+$/, '')
  }
}

const insertImage = () => {
  let imageData = null

  switch (activeTab.value) {
    case 'upload':
      if (uploadedImage.value) {
        imageData = {
          url: uploadedImage.value.url,
          alt: imageForm.alt,
          title: imageForm.title,
          caption: imageForm.caption
        }
      }
      break

    case 'media':
      if (selectedMedia.value) {
        imageData = {
          url: selectedMedia.value.path,
          alt: mediaForm.alt,
          title: mediaForm.title,
          caption: mediaForm.caption
        }
      }
      break

    case 'url':
      imageData = {
        url: urlForm.url,
        alt: urlForm.alt,
        title: urlForm.title,
        caption: urlForm.caption
      }
      break
  }

  if (imageData) {
    emit('insert', imageData)
  }
}

const isValidImageFile = (file) => {
  const validTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'image/bmp', 'image/tiff', 'image/svg+xml', 'image/heic', 'image/heif'
  ]
  return validTypes.includes(file.type)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Watchers
watch(activeTab, (newTab) => {
  if (newTab === 'media' && mediaList.value.length === 0) {
    loadMediaLibrary()
  }
})

// Lifecycle
onMounted(() => {
  if (activeTab.value === 'media') {
    loadMediaLibrary()
  }
})
</script>

<style scoped>
.advanced-image-picker-overlay {
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

.advanced-image-picker {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.picker-header h3 {
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

.picker-tabs {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.tab-btn {
  flex: 1;
  padding: 16px 20px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.tab-btn.active {
  background: white;
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.picker-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.tab-content {
  height: 100%;
}

/* Upload Tab Styles */
.upload-area {
  border: 2px dashed #ced4da;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: #007bff;
  background: #f8f9ff;
}

.upload-placeholder i {
  font-size: 48px;
  color: #ced4da;
  margin-bottom: 16px;
}

.upload-placeholder p {
  font-size: 16px;
  color: #495057;
  margin: 0 0 8px 0;
}

.upload-hint {
  font-size: 14px;
  color: #6c757d;
}

.uploading-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
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

.uploaded-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}

.uploaded-preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.image-info p {
  margin: 0;
  color: #495057;
}

.image-info strong {
  font-weight: 600;
}

/* Media Library Styles */
.media-search {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input,
.filter-select {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input {
  flex: 1;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.media-item {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.media-item:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.media-item.selected {
  border-color: #007bff;
  background: #f0f8ff;
}

.media-preview {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #007bff;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.media-item.selected .media-overlay {
  opacity: 1;
}

.media-info {
  padding: 8px;
  text-align: center;
}

.media-name {
  font-size: 12px;
  font-weight: 500;
  color: #495057;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-meta {
  font-size: 11px;
  color: #6c757d;
  margin: 0;
}

/* URL Tab Styles */
.url-input-section {
  margin-bottom: 24px;
}

.url-preview {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  text-align: center;
}

.url-preview img {
  max-width: 200px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 6px;
}

.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #dc3545;
}

.preview-error i {
  font-size: 24px;
}

/* Form Styles */
.image-settings,
.selected-media-settings,
.url-settings {
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

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

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Footer */
.picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.btn-cancel,
.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #545b62;
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .advanced-image-picker-overlay {
    padding: 10px;
  }

  .advanced-image-picker {
    max-height: 95vh;
  }

  .picker-content {
    padding: 16px;
  }

  .upload-area {
    padding: 24px 16px;
    min-height: 150px;
  }

  .upload-placeholder i {
    font-size: 32px;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }

  .media-search {
    flex-direction: column;
  }

  .tab-btn {
    padding: 12px 16px;
    font-size: 13px;
  }

  .picker-header,
  .picker-footer {
    padding: 16px;
  }
}
</style>