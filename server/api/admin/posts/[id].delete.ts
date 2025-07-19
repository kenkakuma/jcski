import { prisma } from '~/lib/prisma'
import { verifyToken } from '~/utils/auth'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'DELETE') {
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

    await prisma.blogPost.delete({
      where: { id: postId }
    })

    return {
      success: true,
      message: 'Post deleted successfully'
    }
  } catch (error) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete post'
    })
  }
})