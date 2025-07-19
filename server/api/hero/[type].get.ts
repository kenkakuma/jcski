import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const type = getRouterParam(event, 'type')
    
    if (!type) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少类型参数'
      })
    }

    // 获取指定类型的hero内容
    const heroContent = await prisma.heroContent.findFirst({
      where: {
        type: type,
        active: true
      }
    })

    if (!heroContent) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到该类型的Hero内容'
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