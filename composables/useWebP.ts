/**
 * WebP支持检测和图片格式优化
 * 针对AWS免费层优化，减少带宽使用
 */

export const useWebP = () => {
  // 检测浏览器是否支持WebP
  const supportsWebP = ref<boolean | null>(null)
  const isChecking = ref(false)

  // 检测WebP支持
  const checkWebPSupport = async (): Promise<boolean> => {
    if (process.server) {
      return false // 服务端默认不支持
    }

    if (supportsWebP.value !== null) {
      return supportsWebP.value
    }

    if (isChecking.value) {
      // 避免重复检测，等待当前检测完成
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (supportsWebP.value !== null) {
            clearInterval(checkInterval)
            resolve(supportsWebP.value)
          }
        }, 10)
      })
    }

    isChecking.value = true

    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = () => {
        const supported = webP.width > 0 && webP.height > 0
        supportsWebP.value = supported
        isChecking.value = false
        resolve(supported)
      }
      webP.onerror = () => {
        supportsWebP.value = false
        isChecking.value = false
        resolve(false)
      }
      // 使用一个很小的WebP图片进行测试
      webP.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA'
    })
  }

  // 根据浏览器支持情况优化图片URL
  const optimizeImageUrl = (originalUrl: string, options?: {
    quality?: number
    width?: number
    height?: number
  }): string => {
    if (!originalUrl) return originalUrl

    // 如果已经是WebP格式，直接返回
    if (originalUrl.includes('.webp')) {
      return originalUrl
    }

    // 如果是外部URL，不进行转换
    if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
      return originalUrl
    }

    // 获取文件名和扩展名
    const lastDotIndex = originalUrl.lastIndexOf('.')
    if (lastDotIndex === -1) return originalUrl

    const basePath = originalUrl.substring(0, lastDotIndex)
    const extension = originalUrl.substring(lastDotIndex).toLowerCase()

    // 只转换支持的图片格式
    const supportedExtensions = ['.jpg', '.jpeg', '.png']
    if (!supportedExtensions.includes(extension)) {
      return originalUrl
    }

    // 生成WebP版本的URL
    let webpUrl = `${basePath}.webp`

    // 如果有优化参数，添加查询字符串
    if (options && Object.keys(options).length > 0) {
      const params = new URLSearchParams()
      if (options.quality) params.set('q', options.quality.toString())
      if (options.width) params.set('w', options.width.toString())
      if (options.height) params.set('h', options.height.toString())
      
      const queryString = params.toString()
      if (queryString) {
        webpUrl += `?${queryString}`
      }
    }

    return webpUrl
  }

  // 获取带fallback的图片源
  const getImageSources = (originalUrl: string, options?: {
    quality?: number
    width?: number
    height?: number
  }) => {
    const webpUrl = optimizeImageUrl(originalUrl, options)
    
    return {
      webp: webpUrl,
      fallback: originalUrl,
      // 生成<picture>标签所需的sources数组
      sources: [
        {
          srcset: webpUrl,
          type: 'image/webp'
        }
      ]
    }
  }

  // 预加载WebP支持检测
  onMounted(() => {
    if (process.client) {
      checkWebPSupport()
    }
  })

  return {
    supportsWebP: readonly(supportsWebP),
    isChecking: readonly(isChecking),
    checkWebPSupport,
    optimizeImageUrl,
    getImageSources
  }
}

// 全局WebP工具函数
export const generateWebPImages = async (imagePath: string) => {
  // 这个函数在生产环境中应该由构建工具或服务器端脚本调用
  // 用于将现有图片转换为WebP格式
  console.warn('generateWebPImages should be implemented in build process')
  return imagePath
}