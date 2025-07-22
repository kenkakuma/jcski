<template>
  <div class="external-image-picker">
    <div class="picker-header">
      <h3>添加第三方图片</h3>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>
    
    <div class="picker-body">
      <div class="input-section">
        <label for="imageUrl">图片URL:</label>
        <div class="url-input-group">
          <input
            id="imageUrl"
            v-model="imageUrl"
            type="url"
            placeholder="请输入图片URL，如: https://example.com/image.jpg"
            class="url-input"
            @input="validateUrl"
            @paste="onPaste"
          />
          <button 
            @click="previewImage" 
            :disabled="!isValidUrl || isLoading"
            class="preview-btn"
          >
            {{ isLoading ? '验证中...' : '预览' }}
          </button>
        </div>
        <div v-if="urlError" class="error-message">{{ urlError }}</div>
        <div v-if="urlTips" class="tips-message">{{ urlTips }}</div>
      </div>

      <!-- Common image hosting services shortcuts -->
      <div class="quick-services">
        <h4>常用图片服务:</h4>
        <div class="service-buttons">
          <button @click="showServiceInfo('imgur')" class="service-btn">
            📷 Imgur
          </button>
          <button @click="showServiceInfo('github')" class="service-btn">
            📁 GitHub
          </button>
          <button @click="showServiceInfo('cloudinary')" class="service-btn">
            ☁️ Cloudinary
          </button>
          <button @click="showServiceInfo('unsplash')" class="service-btn">
            🎨 Unsplash
          </button>
        </div>
      </div>

      <!-- Image preview -->
      <div v-if="previewData" class="preview-section">
        <h4>图片预览:</h4>
        <div class="preview-container">
          <SmartImage
            :src="previewData.url"
            :alt="previewData.alt || 'External image preview'"
            :show-loading-placeholder="true"
            :show-error-placeholder="true"
            class="preview-image"
            @load="onPreviewLoad"
            @error="onPreviewError"
          />
          <div class="preview-info">
            <p><strong>URL:</strong> {{ previewData.url }}</p>
            <p v-if="previewData.dimensions"><strong>尺寸:</strong> {{ previewData.dimensions }}</p>
            <p v-if="previewData.size"><strong>大小:</strong> {{ previewData.size }}</p>
          </div>
        </div>

        <div class="image-options">
          <div class="option-group">
            <label for="altText">替代文本 (Alt):</label>
            <input
              id="altText"
              v-model="altText"
              type="text"
              placeholder="描述这张图片..."
              class="alt-input"
            />
          </div>
          
          <div class="option-group">
            <label for="imageTitle">图片标题:</label>
            <input
              id="imageTitle"
              v-model="imageTitle"
              type="text"
              placeholder="图片标题 (可选)"
              class="title-input"
            />
          </div>

          <div class="option-group">
            <label>
              <input type="checkbox" v-model="enableLazyLoading" />
              启用懒加载
            </label>
          </div>
        </div>
      </div>

      <!-- Service info modal -->
      <div v-if="showingService" class="service-info-modal">
        <div class="service-info">
          <h4>{{ serviceInfo.name }}</h4>
          <p>{{ serviceInfo.description }}</p>
          <div class="service-example">
            <strong>示例URL:</strong>
            <code>{{ serviceInfo.example }}</code>
          </div>
          <div class="service-tips">
            <strong>使用提示:</strong>
            <ul>
              <li v-for="tip in serviceInfo.tips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
          <button @click="showingService = false" class="close-service-btn">关闭</button>
        </div>
      </div>
    </div>

    <div class="picker-footer">
      <button @click="$emit('close')" class="btn-cancel">取消</button>
      <button 
        @click="confirmSelection" 
        :disabled="!previewData || hasPreviewError"
        class="btn-confirm"
      >
        添加图片
      </button>
    </div>
  </div>
</template>

<script setup>
import SmartImage from './SmartImage.vue'
import { validateImageUrl, processExternalImageUrl } from '~/utils/media'

const props = defineProps({
  initialUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'confirm'])

// Reactive state
const imageUrl = ref(props.initialUrl)
const isValidUrl = ref(false)
const urlError = ref('')
const urlTips = ref('')
const isLoading = ref(false)
const previewData = ref(null)
const hasPreviewError = ref(false)
const altText = ref('')
const imageTitle = ref('')
const enableLazyLoading = ref(true)
const showingService = ref(false)

// Service information
const serviceInfoMap = {
  imgur: {
    name: 'Imgur',
    description: '免费的图片托管服务，支持多种格式',
    example: 'https://i.imgur.com/abc123.jpg',
    tips: [
      '上传到Imgur后复制直链URL',
      '支持JPG、PNG、GIF等格式',
      '免费账户有上传限制'
    ]
  },
  github: {
    name: 'GitHub',
    description: '使用GitHub仓库存储图片',
    example: 'https://raw.githubusercontent.com/user/repo/main/image.jpg',
    tips: [
      '需要使用raw.githubusercontent.com域名',
      '图片需要在public仓库中',
      '适合开源项目的图片存储'
    ]
  },
  cloudinary: {
    name: 'Cloudinary',
    description: '专业的图片和视频管理服务',
    example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    tips: [
      '支持图片转换和优化',
      '提供免费套餐',
      '适合生产环境使用'
    ]
  },
  unsplash: {
    name: 'Unsplash',
    description: '高质量的免费图片库',
    example: 'https://images.unsplash.com/photo-123456789',
    tips: [
      '所有图片都是免费使用',
      '高质量摄影作品',
      '需要注明来源（建议）'
    ]
  }
}

const serviceInfo = ref(serviceInfoMap.imgur)

// Methods
const validateUrl = () => {
  urlError.value = ''
  urlTips.value = ''
  
  if (!imageUrl.value) {
    isValidUrl.value = false
    return
  }
  
  if (!validateImageUrl(imageUrl.value)) {
    isValidUrl.value = false
    urlError.value = '请输入有效的HTTP(S) URL'
    return
  }
  
  // Check common image extensions
  const hasImageExt = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(imageUrl.value)
  if (!hasImageExt) {
    urlTips.value = '建议使用明确的图片文件扩展名 (.jpg, .png, .gif 等)'
  }
  
  // Check for common image hosting patterns
  if (imageUrl.value.includes('github.com/') && !imageUrl.value.includes('raw.githubusercontent.com')) {
    urlTips.value = '建议使用 raw.githubusercontent.com 获取GitHub图片的直链'
  }
  
  isValidUrl.value = true
}

const previewImage = async () => {
  if (!isValidUrl.value) return
  
  isLoading.value = true
  hasPreviewError.value = false
  
  try {
    const processedImage = processExternalImageUrl(imageUrl.value)
    
    previewData.value = {
      url: processedImage.url,
      alt: processedImage.alt,
      fallback: processedImage.fallback
    }
    
    // Set default alt text if not provided
    if (!altText.value) {
      altText.value = processedImage.alt
    }
    
  } catch (error) {
    urlError.value = error.message
    previewData.value = null
  } finally {
    isLoading.value = false
  }
}

const onPreviewLoad = (event) => {
  if (previewData.value) {
    const img = event.target
    previewData.value.dimensions = `${img.naturalWidth} × ${img.naturalHeight}`
    
    // Estimate file size (rough calculation)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)
    
    canvas.toBlob((blob) => {
      if (blob && previewData.value) {
        previewData.value.size = formatBytes(blob.size)
      }
    }, 'image/jpeg', 0.8)
  }
  hasPreviewError.value = false
}

const onPreviewError = () => {
  hasPreviewError.value = true
  urlError.value = '图片加载失败，请检查URL是否有效'
}

const onPaste = async (event) => {
  // Handle clipboard paste
  const items = (event.clipboardData || event.originalEvent.clipboardData).items
  
  for (let item of items) {
    if (item.kind === 'string' && item.type === 'text/plain') {
      item.getAsString((pastedText) => {
        if (validateImageUrl(pastedText)) {
          imageUrl.value = pastedText
          validateUrl()
        }
      })
    }
  }
}

const showServiceInfo = (service) => {
  serviceInfo.value = serviceInfoMap[service]
  showingService.value = true
}

const confirmSelection = () => {
  if (!previewData.value || hasPreviewError.value) return
  
  const imageData = {
    url: previewData.value.url,
    alt: altText.value || previewData.value.alt || 'External image',
    title: imageTitle.value,
    lazy: enableLazyLoading.value,
    dimensions: previewData.value.dimensions,
    size: previewData.value.size,
    isExternal: true
  }
  
  emit('confirm', imageData)
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Watchers
watch(imageUrl, validateUrl)

// Auto-validate and preview if initial URL provided
onMounted(() => {
  if (props.initialUrl) {
    validateUrl()
    if (isValidUrl.value) {
      previewImage()
    }
  }
})
</script>

<style scoped>
.external-image-picker {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: #e9ecef;
}

.picker-body {
  padding: 24px;
}

.input-section {
  margin-bottom: 24px;
}

.input-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.url-input-group {
  display: flex;
  gap: 12px;
}

.url-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.url-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.preview-btn {
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.preview-btn:hover:not(:disabled) {
  background: #0056b3;
}

.preview-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 8px;
}

.tips-message {
  color: #856404;
  background: #fff3cd;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 8px;
}

.quick-services {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.quick-services h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.service-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.service-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-btn:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.preview-section {
  margin-bottom: 24px;
}

.preview-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.preview-container {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.preview-image {
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f9fa;
}

.preview-info {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.preview-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  word-break: break-all;
}

.image-options {
  display: grid;
  gap: 16px;
}

.option-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.alt-input,
.title-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.service-info-modal {
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
}

.service-info {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.service-info h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.service-example {
  margin: 16px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.service-example code {
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}

.service-tips {
  margin: 16px 0;
}

.service-tips ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.service-tips li {
  margin-bottom: 4px;
  font-size: 14px;
}

.close-service-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-confirm {
  background: #28a745;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #218838;
}

.btn-confirm:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .external-image-picker {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .url-input-group {
    flex-direction: column;
  }
  
  .preview-container {
    grid-template-columns: 1fr;
  }
  
  .service-buttons {
    justify-content: center;
  }
}
</style>