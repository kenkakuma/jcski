import { prisma } from '~/lib/prisma'
import { verifyToken } from '~/utils/auth'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'PUT') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const userId = verifyToken(token)
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  const postId = parseInt(getRouterParam(event, 'id') as string)
  const { title, content, excerpt, slug, coverImage, featuredImage, audioFile, tags, category, published, isPinned } = await readBody(event)

  if (!postId || isNaN(postId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid post ID'
    })
  }

  try {
    // 检查文章是否存在
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    // 检查slug是否已被其他文章使用
    if (slug && slug !== existingPost.slug) {
      const slugExists = await prisma.blogPost.findFirst({
        where: {
          slug,
          id: { not: postId }
        }
      })

      if (slugExists) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Slug already exists'
        })
      }
    }

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        title: title || existingPost.title,
        content: content || existingPost.content,
        excerpt: excerpt || existingPost.excerpt,
        slug: slug || existingPost.slug,
        coverImage: coverImage !== undefined ? coverImage : existingPost.coverImage,
        featuredImage: featuredImage !== undefined ? featuredImage : existingPost.featuredImage,
        audioFile: audioFile !== undefined ? audioFile : existingPost.audioFile,
        tags: tags ? JSON.stringify(tags) : existingPost.tags,
        category: category || existingPost.category,
        published: published !== undefined ? published : existingPost.published,
        isPinned: isPinned !== undefined ? isPinned : existingPost.isPinned
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    return {
      success: true,
      data: {
        ...post,
        tags: JSON.parse(post.tags || '[]')
      }
    }
  } catch (error) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update post'
    })
  }
})