import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const published = query.published === 'all' ? undefined : 
                   query.published === 'true' ? true : 
                   query.published === 'false' ? false : undefined

  try {
    const where = published !== undefined ? { published } : {}
    
    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.blogPost.count({ where })

    return {
      data: {
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
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch posts'
    })
  }
})