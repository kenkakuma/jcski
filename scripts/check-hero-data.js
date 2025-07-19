import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkHeroData() {
  try {
    console.log('🔍 检查Hero内容数据...')
    
    const heroContents = await prisma.heroContent.findMany({
      orderBy: {
        order: 'asc'
      }
    })
    
    console.log(`📊 找到 ${heroContents.length} 条Hero内容记录:`)
    console.log('=' .repeat(50))
    
    heroContents.forEach((hero, index) => {
      console.log(`${index + 1}. 类型: ${hero.type}`)
      console.log(`   标题: ${hero.title}`)
      console.log(`   副标题: ${hero.subtitle}`)
      console.log(`   描述: ${hero.description.substring(0, 50)}...`)
      console.log(`   状态: ${hero.active ? '启用' : '禁用'}`)
      console.log(`   排序: ${hero.order}`)
      console.log(`   创建时间: ${hero.createdAt}`)
      console.log('-'.repeat(30))
    })
    
    console.log('✅ 数据检查完成!')
  } catch (error) {
    console.error('❌ 检查数据失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkHeroData()