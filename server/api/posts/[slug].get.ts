import { prisma } from '~/lib/prisma'
import { withCache, CacheKeys } from '~/lib/cache'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug parameter is required'
    })
  }

  try {
    // 使用缓存获取文章详情
    const post = await withCache(
      CacheKeys.POST_DETAIL(slug),
      async () => {
        return await prisma.blogPost.findFirst({
          where: {
            slug: slug,
            published: true
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })
      },
      10 * 60 * 1000 // 10分钟缓存（文章内容相对稳定）
    )

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    // 获取相关文章（同分类的其他文章，排除当前文章）
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        category: post.category,
        published: true,
        id: {
          not: post.id
        }
      },
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
        createdAt: 'desc'
      },
      take: 3
    })

    // 获取前一篇和后一篇文章（按创建时间）
    const previousPost = await prisma.blogPost.findFirst({
      where: {
        published: true,
        createdAt: {
          lt: post.createdAt
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true
      }
    })

    const nextPost = await prisma.blogPost.findFirst({
      where: {
        published: true,
        createdAt: {
          gt: post.createdAt
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        title: true,
        slug: true
      }
    })

    // 格式化响应数据
    const formattedPost = {
      ...post,
      tags: (() => {
        try {
          return typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || [])
        } catch (e) {
          console.error('Failed to parse tags:', post.tags, e)
          return []
        }
      })()
    }

    const formattedRelatedPosts = relatedPosts.map(relatedPost => ({
      ...relatedPost,
      tags: (() => {
        try {
          return typeof relatedPost.tags === 'string' ? JSON.parse(relatedPost.tags) : (relatedPost.tags || [])
        } catch (e) {
          console.error('Failed to parse related post tags:', relatedPost.tags, e)
          return []
        }
      })()
    }))

    return {
      success: true,
      data: formattedPost,
      related: formattedRelatedPosts,
      navigation: {
        previous: previousPost,
        next: nextPost
      }
    }
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    
    // 如果是已知的HTTP错误，直接抛出
    if (error.statusCode) {
      throw error
    }
    
    // 其他错误返回500
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch post'
    })
  }
})