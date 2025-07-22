<template>
  <div class="smart-image-container" :style="containerStyle">
    <img 
      :src="currentSrc"
      :alt="alt"
      :loading="loading"
      :class="['smart-image', imageClass, { loading: isLoading, error: hasError }]"
      @load="onLoad"
      @error="onError"
      :style="imageStyle"
    />
    
    <!-- Loading placeholder -->
    <div v-if="isLoading && showLoadingPlaceholder" class="image-placeholder loading">
      <div class="loading-spinner">⏳</div>
      <span>加载中...</span>
    </div>
    
    <!-- Error placeholder -->
    <div v-if="hasError && showErrorPlaceholder" class="image-placeholder error">
      <div class="error-icon">❌</div>
      <span>{{ errorMessage }}</span>
      <button v-if="canRetry" @click="retry" class="retry-btn">重试</button>
    </div>

    <!-- External image indicator -->
    <div v-if="isExternal && !hasError" class="external-indicator" title="第三方图片">
      🌐
    </div>
  </div>
</template>

<script setup>
import { resolveImagePath, validateImageUrl, getDefaultImage, processExternalImageUrl } from '~/utils/media'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  fallback: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'Image'
  },
  loading: {
    type: String,
    default: 'lazy',
    validator: (value) => ['lazy', 'eager'].includes(value)
  },
  width: {
    type: [String, Number],
    default: undefined
  },
  height: {
    type: [String, Number],
    default: undefined
  },
  objectFit: {
    type: String,
    default: 'cover',
    validator: (value) => ['contain', 'cover', 'fill', 'none', 'scale-down'].includes(value)
  },
  showLoadingPlaceholder: {
    type: Boolean,
    default: true
  },
  showErrorPlaceholder: {
    type: Boolean,
    default: true
  },
  imageClass: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'NEWS'
  }
})

const emit = defineEmits(['load', 'error', 'retry'])

// Reactive state
const isLoading = ref(true)
const hasError = ref(false)
const currentSrc = ref('')
const errorMessage = ref('')
const retryCount = ref(0)
const maxRetries = 3

// Computed properties
const isExternal = computed(() => {
  return currentSrc.value.startsWith('http://') || currentSrc.value.startsWith('https://')
})

const canRetry = computed(() => {
  return retryCount.value < maxRetries && isExternal.value
})

const containerStyle = computed(() => {
  const style = {}
  if (props.width) style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  if (props.height) style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  return style
})

const imageStyle = computed(() => {
  return {
    objectFit: props.objectFit
  }
})

// Methods
const initializeImage = () => {
  let finalSrc = ''
  
  // 1. 尝试主要图片源
  if (props.src) {
    const resolvedSrc = resolveImagePath(props.src)
    if (resolvedSrc) {
      finalSrc = resolvedSrc
    }
  }
  
  // 2. 如果主要源无效，尝试fallback
  if (!finalSrc && props.fallback) {
    const resolvedFallback = resolveImagePath(props.fallback)
    if (resolvedFallback) {
      finalSrc = resolvedFallback
    }
  }
  
  // 3. 如果都无效，使用默认分类图片
  if (!finalSrc) {
    finalSrc = getDefaultImage(props.category)
  }
  
  currentSrc.value = finalSrc
  isLoading.value = true
  hasError.value = false
}

const onLoad = (event) => {
  isLoading.value = false
  hasError.value = false
  emit('load', event)
}

const onError = (event) => {
  isLoading.value = false
  hasError.value = true
  
  // 如果当前是主要源失败，尝试fallback
  if (currentSrc.value === resolveImagePath(props.src) && props.fallback) {
    const fallbackSrc = resolveImagePath(props.fallback)
    if (fallbackSrc && fallbackSrc !== currentSrc.value) {
      currentSrc.value = fallbackSrc
      hasError.value = false
      isLoading.value = true
      return
    }
  }
  
  // 如果fallback也失败，使用默认图片
  const defaultSrc = getDefaultImage(props.category)
  if (currentSrc.value !== defaultSrc) {
    currentSrc.value = defaultSrc
    hasError.value = false
    isLoading.value = true
    return
  }
  
  // 设置错误消息
  if (isExternal.value) {
    errorMessage.value = '第三方图片加载失败'
  } else {
    errorMessage.value = '图片加载失败'
  }
  
  emit('error', event)
}

const retry = () => {
  if (!canRetry.value) return
  
  retryCount.value++
  hasError.value = false
  isLoading.value = true
  
  // 重新触发图片加载
  const currentUrl = currentSrc.value
  currentSrc.value = ''
  nextTick(() => {
    currentSrc.value = currentUrl
  })
  
  emit('retry', { attempt: retryCount.value, src: currentSrc.value })
}

// Watchers
watch(() => props.src, () => {
  retryCount.value = 0
  initializeImage()
})

watch(() => props.fallback, () => {
  if (hasError.value) {
    initializeImage()
  }
})

// Lifecycle
onMounted(() => {
  initializeImage()
})
</script>

<style scoped>
.smart-image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.smart-image {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
}

.smart-image.loading {
  opacity: 0.7;
}

.smart-image.error {
  opacity: 0.3;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #6c757d;
  font-size: 14px;
  text-align: center;
  padding: 16px;
}

.image-placeholder.loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.image-placeholder.error {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.loading-spinner, .error-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.retry-btn {
  margin-top: 8px;
  padding: 4px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #0056b3;
}

.external-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

@keyframes loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-placeholder {
    font-size: 12px;
    padding: 12px;
  }
  
  .loading-spinner, .error-icon {
    font-size: 20px;
  }
  
  .external-indicator {
    width: 20px;
    height: 20px;
    top: 4px;
    right: 4px;
    font-size: 10px;
  }
}
</style>