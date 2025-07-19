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

    // 检查hero内容是否存在
    const existingHero = await prisma.heroContent.findUnique({
      where: {
        id: parseInt(id)
      }
    })

    if (!existingHero) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Hero内容不存在'
      })
    }

    // 删除hero内容
    await prisma.heroContent.delete({
      where: {
        id: parseInt(id)
      }
    })

    return {
      success: true,
      message: 'Hero内容删除成功'
    }
  } catch (error) {
    console.error('删除Hero内容失败:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '删除Hero内容失败'
    })
  }
})