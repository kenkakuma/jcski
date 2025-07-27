/**
 * 混合数据源文章管理 Composable
 * 
 * 功能:
 * - 同时从数据库和 Content Studio 读取文章
 * - 合并和去重文章数据
 * - 提供统一的文章接口
 * - 支持分类筛选和搜索
 */

export interface HybridPost {
  id: number | string
  title: string
  content?: string
  excerpt: string
  slug: string
  coverImage?: string
  featuredImage?: string
  audioFile?: string
  tags: string[]
  category: string
  published: boolean
  isPinned?: boolean
  createdAt: string
  updatedAt: string
  source: 'database' | 'content' // 数据源标识
  _path?: string // Content 文章路径
}

export interface UseHybridPostsOptions {
  category?: string
  published?: boolean
  limit?: number
  includeContent?: boolean
}

/**
 * 转换数据库文章格式
 */
function transformDatabasePost(post: any): HybridPost {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt || '',
    slug: post.slug,
    coverImage: post.coverImage,
    featuredImage: post.featuredImage,
    audioFile: post.audioFile,
    tags: typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || []),
    category: post.category || 'BLOG',
    published: Boolean(post.published),
    isPinned: Boolean(post.isPinned),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    source: 'database'
  }
}

/**
 * 转换 Content 文章格式
 */
function transformContentPost(post: any): HybridPost {
  return {
    id: post._path || post.slug,
    title: post.title,
    content: post.body?.children ? '' : post.content, // Content 的正文在 body 中
    excerpt: post.description || post.excerpt || '',
    slug: post.slug,
    coverImage: post.coverImage,
    featuredImage: post.featuredImage,
    audioFile: post.audioFile,
    tags: post.tags || [],
    category: post.category || 'BLOG',
    published: Boolean(post.published),
    isPinned: Boolean(post.isPinned),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    source: 'content',
    _path: post._path
  }
}

/**
 * 合并和去重文章列表
 */
function mergeAndDeduplicatePosts(databasePosts: HybridPost[], contentPosts: HybridPost[]): HybridPost[] {
  const postMap = new Map<string, HybridPost>()
  
  // 添加数据库文章
  databasePosts.forEach(post => {
    postMap.set(post.slug, post)
  })
  
  // 添加 Content 文章（如果 slug 相同，Content 优先）
  contentPosts.forEach(post => {
    postMap.set(post.slug, post)
  })
  
  return Array.from(postMap.values())
}

/**
 * 主要的混合文章数据 Hook
 */
export function useHybridPosts(options: UseHybridPostsOptions = {}) {
  const {
    category,
    published = true,
    limit,
    includeContent = false
  } = options

  return useAsyncData(`hybrid-posts-${JSON.stringify(options)}`, async () => {
    try {
      // 并行获取数据库和 Content 数据
      const [databaseResponse, contentPosts] = await Promise.allSettled([
        // 从数据库获取文章
        $fetch('/api/posts', {
          query: {
            category,
            published,
            limit: limit || 100
          }
        }).catch(error => {
          console.warn('数据库文章获取失败:', error)
          return []
        }),
        
        // 从 Content 获取文章
        queryContent('/blog')
          .where({ 
            ...(category && { category }),
            ...(published !== undefined && { published })
          })
          .limit(limit || 100)
          .find()
          .catch(error => {
            console.warn('Content 文章获取失败:', error)
            return []
          })
      ])

      // 处理结果
      const databasePosts = databaseResponse.status === 'fulfilled' 
        ? (Array.isArray(databaseResponse.value) ? databaseResponse.value : [])
        : []
      
      const contentData = contentPosts.status === 'fulfilled' 
        ? (Array.isArray(contentPosts.value) ? contentPosts.value : [])
        : []

      // 转换格式
      const transformedDatabasePosts = databasePosts.map(transformDatabasePost)
      const transformedContentPosts = contentData.map(transformContentPost)

      // 合并和去重
      const mergedPosts = mergeAndDeduplicatePosts(transformedDatabasePosts, transformedContentPosts)

      // 排序（按创建时间倒序）
      mergedPosts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })

      // 应用限制
      const finalPosts = limit ? mergedPosts.slice(0, limit) : mergedPosts

      console.log(`🔄 混合数据源加载完成:`)
      console.log(`   📊 数据库文章: ${transformedDatabasePosts.length}`)
      console.log(`   📝 Content文章: ${transformedContentPosts.length}`)
      console.log(`   🔗 合并后总数: ${finalPosts.length}`)

      return finalPosts

    } catch (error) {
      console.error('混合文章数据获取失败:', error)
      throw error
    }
  })
}

/**
 * 获取单篇文章（混合数据源）
 */
export function useHybridPost(slug: string) {
  return useAsyncData(`hybrid-post-${slug}`, async () => {
    try {
      // 并行尝试从两个数据源获取
      const [databaseResponse, contentResponse] = await Promise.allSettled([
        // 从数据库获取
        $fetch(`/api/posts/${slug}`).catch(() => null),
        
        // 从 Content 获取
        queryContent(`/blog/${slug}`).findOne().catch(() => null)
      ])

      // 优先使用 Content 数据
      if (contentResponse.status === 'fulfilled' && contentResponse.value) {
        return transformContentPost(contentResponse.value)
      }

      // 备用数据库数据
      if (databaseResponse.status === 'fulfilled' && databaseResponse.value) {
        return transformDatabasePost(databaseResponse.value)
      }

      throw new Error(`文章未找到: ${slug}`)

    } catch (error) {
      console.error(`获取文章失败 [${slug}]:`, error)
      throw error
    }
  })
}

/**
 * 获取置顶文章（用于首页 NEWS 区域）
 */
export function usePinnedPosts(limit: number = 3) {
  return useAsyncData('pinned-posts', async () => {
    const { data: allPosts } = await useHybridPosts({ published: true })
    
    if (!allPosts.value) return []
    
    return allPosts.value
      .filter(post => post.isPinned)
      .slice(0, limit)
  })
}

/**
 * 按分类获取文章
 */
export function usePostsByCategory(category: string, limit?: number) {
  return useHybridPosts({ 
    category: category.toUpperCase(), 
    published: true, 
    limit 
  })
}

/**
 * 获取最新文章
 */
export function useLatestPosts(limit: number = 10) {
  return useHybridPosts({ 
    published: true, 
    limit 
  })
}