import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证必填字段
    if (!body.type || !body.title || !body.subtitle || !body.description) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少必填字段'
      })
    }

    // 检查type是否已存在
    const existingHero = await prisma.heroContent.findUnique({
      where: {
        type: body.type
      }
    })

    if (existingHero) {
      throw createError({
        statusCode: 400,
        statusMessage: '该类型的Hero内容已存在'
      })
    }

    // 创建新的hero内容
    const heroContent = await prisma.heroContent.create({
      data: {
        type: body.type,
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        image: body.image || null,
        active: body.active !== undefined ? body.active : true,
        order: body.order || 0
      }
    })

    return {
      success: true,
      data: heroContent
    }
  } catch (error) {
    console.error('创建Hero内容失败:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '创建Hero内容失败'
    })
  }
})