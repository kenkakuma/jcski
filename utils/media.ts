/**
 * 媒体文件工具函数
 * 统一处理图片路径解析、第三方图片支持等功能
 */

export interface ExternalImageOptions {
  url: string
  fallback?: string
  lazy?: boolean
  alt?: string
}

export interface MediaFile {
  id: number
  filename: string
  originalName: string
  path: string
  mimetype: string
  size: number
  type: string
  createdAt: string
}

/**
 * 解析图片路径，确保正确的URL格式
 */
export const resolveImagePath = (path: string | null | undefined): string | null => {
  if (!path) return null

  // 如果是完整的HTTP(S) URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // 如果是相对路径且以/uploads/开头，在开发环境直接返回
  if (path.startsWith('/uploads/')) {
    return path
  }

  // 处理不规范的路径格式
  if (path.startsWith('uploads/')) {
    return '/' + path
  }

  // 其他情况返回null
  return null
}

/**
 * 验证图片URL是否有效（用于第三方图片）
 */
export const validateImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 获取默认分类图片
 */
export const getDefaultImage = (category: string): string => {
  const defaultImages = {
    'MUSIC': '/images/music.webp',
    'TECH': '/images/tech.webp', 
    'SKIING': '/images/skiing.webp',
    'FISHING': '/images/fishing.webp',
    'GAMING': '/images/gaming.webp',
    'NEWS': '/images/news.webp',
    'BLOG': '/images/news.webp',
    'PRESS_RELEASE': '/images/news.webp'
  }
  
  return defaultImages[category as keyof typeof defaultImages] || '/images/news.webp'
}

/**
 * 支持第三方图片的图片组件属性生成器
 */
export const createImageProps = (
  primaryPath: string | null | undefined, 
  fallbackPath: string | null | undefined,
  options: Partial<ExternalImageOptions> = {}
) => {
  const resolvedPrimary = resolveImagePath(primaryPath)
  const resolvedFallback = resolveImagePath(fallbackPath)
  
  return {
    src: resolvedPrimary || resolvedFallback || getDefaultImage('NEWS'),
    alt: options.alt || 'Image',
    loading: options.lazy ? 'lazy' : 'eager' as const,
    onerror: resolvedPrimary && resolvedFallback 
      ? `this.src='${resolvedFallback}'` 
      : undefined
  }
}

/**
 * 第三方图片URL处理
 */
export const processExternalImageUrl = (url: string): ExternalImageOptions => {
  // 基础验证
  if (!validateImageUrl(url)) {
    throw new Error('Invalid image URL')
  }

  // 常见图片托管服务优化处理
  let processedUrl = url

  // GitHub用户内容优化
  if (url.includes('github.com') || url.includes('githubusercontent.com')) {
    processedUrl = url.replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/')
  }

  // 添加图片格式检查
  const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(processedUrl)
  
  return {
    url: processedUrl,
    fallback: getDefaultImage('NEWS'),
    lazy: true,
    alt: hasImageExtension ? 'External image' : 'External content'
  }
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 检查是否为图片文件
 */
export const isImageFile = (mimetype: string | undefined): boolean => {
  return mimetype ? mimetype.startsWith('image/') : false
}

/**
 * 检查是否为音频文件  
 */
export const isAudioFile = (mimetype: string | undefined): boolean => {
  return mimetype ? mimetype.startsWith('audio/') : false
}