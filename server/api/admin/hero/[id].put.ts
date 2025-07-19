import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
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

    // 如果更新type，检查是否与其他记录冲突
    if (body.type && body.type !== existingHero.type) {
      const typeConflict = await prisma.heroContent.findUnique({
        where: {
          type: body.type
        }
      })
      
      if (typeConflict) {
        throw createError({
          statusCode: 400,
          statusMessage: '该类型的Hero内容已存在'
        })
      }
    }

    // 更新hero内容
    const updatedHero = await prisma.heroContent.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(body.type && { type: body.type }),
        ...(body.title && { title: body.title }),
        ...(body.subtitle && { subtitle: body.subtitle }),
        ...(body.description && { description: body.description }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.order !== undefined && { order: body.order })
      }
    })

    return {
      success: true,
      data: updatedHero
    }
  } catch (error) {
    console.error('更新Hero内容失败:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '更新Hero内容失败'
    })
  }
})