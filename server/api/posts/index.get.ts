import { prisma } from '~/lib/prisma'
import { withCache, CacheKeys } from '~/lib/cache'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const published = query.published !== 'false'
  const pinned = query.pinned === 'true'

  try {
    // 生成缓存键
    const cacheKey = CacheKeys.POSTS_LIST(page, limit, published, pinned)
    const countCacheKey = CacheKeys.POSTS_COUNT(published, pinned)

    // 使用缓存获取文章列表和总数
    const [posts, total] = await Promise.all([
      withCache(cacheKey, async () => {
        // 构建查询条件
        const whereCondition: any = {}
        if (published) {
          whereCondition.published = true
        }
        if (pinned) {
          whereCondition.isPinned = true
        }

        return await prisma.blogPost.findMany({
          where: whereCondition,
          include: {
            author: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          },
          orderBy: pinned 
            ? [{ isPinned: 'desc' }, { createdAt: 'desc' }] // 置顶文章按置顶状态和创建时间排序
            : { createdAt: 'desc' }, // 普通文章按创建时间排序
          skip: (page - 1) * limit,
          take: limit
        })
      }, 2 * 60 * 1000), // 2分钟缓存

      withCache(countCacheKey, async () => {
        const whereCondition: any = {}
        if (published) {
          whereCondition.published = true
        }
        if (pinned) {
          whereCondition.isPinned = true
        }

        return await prisma.blogPost.count({
          where: whereCondition
        })
      }, 5 * 60 * 1000) // 5分钟缓存（计数变化较少）
    ])

    return {
      posts: posts.map(post => ({
        ...post,
        tags: JSON.parse(post.tags || '[]')
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Posts API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch posts'
    })
  }
})