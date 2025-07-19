import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少Hero内容ID'
      })
    }

    // 获取单个hero内容
    const heroContent = await prisma.heroContent.findUnique({
      where: {
        id: parseInt(id)
      }
    })

    if (!heroContent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Hero内容不存在'
      })
    }

    return {
      success: true,
      data: heroContent
    }
  } catch (error) {
    console.error('获取Hero内容失败:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '获取Hero内容失败'
    })
  }
})