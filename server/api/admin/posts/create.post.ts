import { prisma } from '~/lib/prisma'
import { verifyToken } from '~/utils/auth'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
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

  const { title, content, excerpt, slug, coverImage, featuredImage, audioFile, tags, category, published, isPinned } = await readBody(event)

  if (!title || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title and content are required'
    })
  }

  // Auto-generate excerpt if not provided
  const finalExcerpt = excerpt || content.substring(0, 150) + '...'
  
  // Auto-generate slug if not provided
  const finalSlug = slug || (title.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    || 'post') + '-' + Date.now() // Add timestamp for uniqueness

  try {
    // 检查slug是否已存在
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: finalSlug }
    })

    if (existingPost) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug already exists'
      })
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        content,
        excerpt: finalExcerpt,
        slug: finalSlug,
        coverImage,
        featuredImage,
        audioFile,
        tags: JSON.stringify(tags || []),
        category: category || 'BLOG',
        published: published || false,
        isPinned: isPinned || false,
        authorId: userId
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
      statusMessage: 'Failed to create post'
    })
  }
})