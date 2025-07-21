/**
 * 轻量级内存缓存系统
 * 针对AWS免费层EC2优化，内存使用控制在合理范围内
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5分钟默认TTL，最多100项
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
    
    // 每10分钟清理一次过期缓存
    setInterval(() => this.cleanup(), 10 * 60 * 1000)
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // 如果缓存已满，删除最旧的项目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * 生成缓存键
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    return `${prefix}:${sortedParams}`
  }
}

// 创建全局缓存实例
export const cache = new MemoryCache(50, 3 * 60 * 1000) // 最多50项，3分钟TTL

/**
 * 缓存装饰器函数
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const startTime = Date.now()
  
  // 尝试从缓存获取
  const cached = cache.get<T>(key)
  if (cached !== null) {
    const hitTime = Date.now() - startTime
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🚀 Cache HIT: ${key} (${hitTime}ms)`)
    }
    return cached
  }

  // 缓存未命中，执行查询
  const data = await fetcher()
  const queryTime = Date.now() - startTime
  
  // 存入缓存
  cache.set(key, data, ttl)
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`💾 Cache MISS: ${key} (${queryTime}ms) - Data cached`)
  }
  
  return data
}

/**
 * 预定义的缓存键生成器
 */
export const CacheKeys = {
  POSTS_LIST: (page: number, limit: number, published: boolean, pinned?: boolean) => 
    cache.generateKey('posts', { page, limit, published, pinned: pinned || false }),
  
  PINNED_POSTS: (limit: number) => 
    cache.generateKey('pinned_posts', { limit }),
  
  POST_DETAIL: (slug: string) => 
    cache.generateKey('post_detail', { slug }),
  
  POSTS_COUNT: (published: boolean, pinned?: boolean) => 
    cache.generateKey('posts_count', { published, pinned: pinned || false })
}

/**
 * 缓存失效策略
 */
export const CacheInvalidation = {
  // 文章相关缓存失效
  invalidatePostCaches: () => {
    const stats = cache.getStats()
    stats.keys.forEach(key => {
      if (key.startsWith('posts:') || key.startsWith('pinned_posts:') || key.startsWith('post_detail:')) {
        cache.delete(key)
      }
    })
  },
  
  // 特定文章缓存失效
  invalidatePostCache: (slug: string) => {
    cache.delete(CacheKeys.POST_DETAIL(slug))
    // 也清理列表缓存，因为文章可能影响列表
    CacheInvalidation.invalidatePostCaches()
  }
}