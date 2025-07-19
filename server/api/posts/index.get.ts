import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const published = query.published !== 'false'
  const pinned = query.pinned === 'true'

  try {
    // 构建查询条件
    const whereCondition: any = {}
    if (published) {
      whereCondition.published = true
    }
    if (pinned) {
      whereCondition.isPinned = true
    }

    const posts = await prisma.blogPost.findMany({
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

    const total = await prisma.blogPost.count({
      where: whereCondition
    })

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
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch posts'
    })
  }
})