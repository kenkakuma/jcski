import { prisma } from '~/lib/prisma'
import { verifyToken } from '~/utils/auth'
import { promises as fs } from 'fs'
import path from 'path'

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

  const fileId = parseInt(getRouterParam(event, 'id') as string)

  if (!fileId || isNaN(fileId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file ID'
    })
  }

  try {
    // 查找文件信息
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: fileId }
    })

    if (!mediaFile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }

    // 删除物理文件
    try {
      const filePath = path.join(process.cwd(), 'public', mediaFile.path)
      await fs.unlink(filePath)
    } catch (error) {
      console.error('Failed to delete physical file:', error)
      // 继续执行数据库清理，即使物理文件删除失败
    }

    // 从数据库中删除记录
    await prisma.mediaFile.delete({
      where: { id: fileId }
    })

    return {
      success: true,
      message: 'File deleted successfully'
    }
  } catch (error) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete file'
    })
  }
})