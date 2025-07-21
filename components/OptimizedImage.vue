<template>
  <div ref="wrapperRef" class="optimized-image-wrapper" :style="{ height: height }">
    <img
      v-if="showImage"
      :src="src"
      :alt="alt"
      :class="['optimized-image', { 'loaded': imageLoaded }]"
      @load="onImageLoad"
      @error="onImageError"
    />
    <div v-else-if="showPlaceholder" class="image-placeholder" :style="{ height: height }">
      <div class="placeholder-content">
        <div class="loading-spinner"></div>
        <span class="loading-text">Loading...</span>
      </div>
    </div>
    <div v-if="hasError" class="error-placeholder" :style="{ height: height }">
      <div class="error-content">
        <span>⚠️ 图片加载失败</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt?: string
  height?: string
  placeholder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  height: 'auto',
  placeholder: true
})

const showImage = ref(false)
const showPlaceholder = ref(false)
const imageLoaded = ref(false)
const hasError = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

onMounted(() => {
  // 检查是否在浏览器环境并且支持 Intersection Observer
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window && wrapperRef.value) {
    // 创建 Intersection Observer
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 图片进入视窗，开始加载
            if (props.placeholder) {
              showPlaceholder.value = true
            }
            
            // 短暂延迟后显示图片
            setTimeout(() => {
              showImage.value = true
              showPlaceholder.value = false
            }, props.placeholder ? 100 : 0)
            
            // 停止观察此元素
            if (observer) {
              observer.unobserve(entry.target)
            }
          }
        })
      },
      {
        // 提前100px开始加载图片
        rootMargin: '100px 0px',
        threshold: 0.1
      }
    )

    // 开始观察
    observer.observe(wrapperRef.value)
  } else {
    // 不支持 Intersection Observer 或在服务端时直接显示图片
    showImage.value = true
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})

const onImageLoad = () => {
  imageLoaded.value = true
  hasError.value = false
}

const onImageError = () => {
  hasError.value = true
  imageLoaded.value = false
}
</script>

<style scoped>
.optimized-image-wrapper {
  position: relative;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.optimized-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.optimized-image.loaded {
  opacity: 1;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #666;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 12px;
  color: #888;
}

.error-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border: 1px dashed #ddd;
}

.error-content {
  text-align: center;
  color: #999;
  font-size: 12px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-spinner {
    width: 14px;
    height: 14px;
  }
  
  .loading-text,
  .error-content {
    font-size: 11px;
  }
}
</style>