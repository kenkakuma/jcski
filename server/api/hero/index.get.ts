import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 获取所有激活的hero内容，按order排序
    const heroContents = await prisma.heroContent.findMany({
      where: {
        active: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    return {
      success: true,
      data: heroContents
    }
  } catch (error) {
    console.error('获取Hero内容失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取Hero内容失败'
    })
  }
})