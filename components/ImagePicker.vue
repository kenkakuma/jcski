<template>
  <div class="image-picker">
    <!-- Trigger Button -->
    <div class="picker-trigger" @click="showPicker = true">
      <div v-if="selectedImage" class="selected-image">
        <SmartImage 
          :src="selectedImage" 
          :alt="placeholder" 
          class="preview-img"
          :show-loading-placeholder="true"
          :show-error-placeholder="true"
        />
        <div class="image-overlay">
          <span>点击更换图片</span>
        </div>
      </div>
      <div v-else class="placeholder">
        <div class="placeholder-icon">🖼️</div>
        <span>{{ placeholder }}</span>
      </div>
    </div>

    <!-- Image Picker Modal -->
    <div v-if="showPicker" class="modal-overlay" @click.self="showPicker = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>选择图片</h3>
          <button @click="showPicker = false" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <!-- Upload Tab -->
          <div class="picker-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'upload' }]"
              @click="activeTab = 'upload'"
            >
              上传新图片
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'library' }]"
              @click="activeTab = 'library'"
            >
              从媒体库选择
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'external' }]"
              @click="activeTab = 'external'"
            >
              第三方图片
            </button>
          </div>

          <!-- Upload Tab Content -->
          <div v-if="activeTab === 'upload'" class="tab-content">
            <div class="upload-area">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                style="display: none"
              >
              <div 
                class="drop-zone"
                :class="{ 'drag-over': dragOver }"
                @drop="handleDrop"
                @dragover.prevent="dragOver = true"
                @dragleave="dragOver = false"
                @dragenter.prevent
                @click="$refs.fileInput.click()"
              >
                <div class="upload-content">
                  <div class="upload-icon">📁</div>
                  <p>点击选择图片或拖拽到这里</p>
                  <p class="upload-hint">支持 JPG, PNG, GIF 格式，最大 10MB</p>
                </div>
              </div>
              
              <div v-if="uploading" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <p>上传中... {{ uploadProgress }}%</p>
              </div>
            </div>
          </div>

          <!-- Library Tab Content -->
          <div v-if="activeTab === 'library'" class="tab-content">
            <AdminMedia 
              :select-mode="true"
              :allow-multiple="false"
              @select="handleImageSelect"
              @cancel="showPicker = false"
            />
          </div>

          <!-- External Image Tab Content -->
          <div v-if="activeTab === 'external'" class="tab-content">
            <ExternalImagePicker
              @close="showPicker = false"
              @confirm="handleExternalImageSelect"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showPicker = false" class="btn-cancel">取消</button>
          <button 
            v-if="selectedImage && !tempImage"
            @click="removeImage" 
            class="btn-danger"
          >
            移除图片
          </button>
          <button 
            v-if="tempImage"
            @click="confirmSelection" 
            class="btn-primary"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AdminMedia from './AdminMedia.vue'
import SmartImage from './SmartImage.vue'
import ExternalImagePicker from './ExternalImagePicker.vue'
import { resolveImagePath } from '~/utils/media'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '选择图片'
  }
})

const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)
const activeTab = ref('library')
const dragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const tempImage = ref('')

const selectedImage = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleImageSelect = (file) => {
  tempImage.value = resolveImagePath(file.path)
}

const handleExternalImageSelect = (imageData) => {
  tempImage.value = imageData.url
  showPicker.value = false
  selectedImage.value = imageData.url
}

const confirmSelection = () => {
  selectedImage.value = tempImage.value
  tempImage.value = ''
  showPicker.value = false
}

const removeImage = () => {
  selectedImage.value = ''
  showPicker.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  dragOver.value = false
  
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0 && files[0].type.startsWith('image/')) {
    uploadImage(files[0])
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    uploadImage(file)
  }
}

const uploadImage = async (file) => {
  if (file.size > 10 * 1024 * 1024) {
    alert('文件大小不能超过10MB')
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  const token = useCookie('auth-token').value
  if (!token) {
    alert('认证已过期，请重新登录')
    uploading.value = false
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch('/api/admin/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (response.success && response.data.files.length > 0) {
      const uploadedFile = response.data.files[0]
      tempImage.value = uploadedFile.path
      activeTab.value = 'library' // Switch to library tab to show the uploaded image
    }
    
  } catch (error) {
    console.error('Failed to upload image:', error)
    alert('上传失败: ' + (error.data?.message || '请重试'))
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// 重置状态当模态框关闭
watch(showPicker, (newVal) => {
  if (!newVal) {
    tempImage.value = ''
    activeTab.value = 'library'
  }
})
</script>

<style scoped>
.image-picker {
  width: 100%;
}

.picker-trigger {
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.picker-trigger:hover {
  border-color: #007bff;
}

.selected-image {
  position: relative;
  width: 100%;
  height: 120px;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.selected-image:hover .image-overlay {
  opacity: 1;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: #f8f9fa;
  color: #666;
  text-align: center;
}

.placeholder-icon {
  font-size: 32px;
  margin-bottom: 8px;
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
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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

.modal-body {
  flex: 1;
  padding: 24px;
}

/* Tabs */
.picker-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: #007bff;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-content {
  min-height: 400px;
}

/* Upload Area */
.upload-area {
  max-width: 500px;
  margin: 0 auto;
}

.drop-zone {
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

.upload-content {
  color: #666;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}

.upload-progress {
  margin-top: 20px;
  text-align: center;
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

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

.btn-primary, .btn-cancel, .btn-danger {
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

.btn-cancel {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .picker-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    text-align: left;
    border-bottom: none;
    border-left: 3px solid transparent;
  }
  
  .tab-btn.active {
    border-left-color: #007bff;
    border-bottom-color: transparent;
  }
}
</style>