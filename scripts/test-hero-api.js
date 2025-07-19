import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testHeroAPI() {
  try {
    console.log('🧪 测试Hero API功能...')
    
    // 1. 直接从数据库获取数据（模拟API功能）
    console.log('\n1. 获取所有Hero内容:')
    const allHeroes = await prisma.heroContent.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })
    
    console.log(`   ✅ 找到 ${allHeroes.length} 条激活的Hero内容`)
    
    // 2. 测试按类型查询
    console.log('\n2. 按类型查询Hero内容:')
    const musicHero = await prisma.heroContent.findFirst({
      where: { type: 'music', active: true }
    })
    
    if (musicHero) {
      console.log(`   ✅ 音乐类型: ${musicHero.title} - ${musicHero.subtitle}`)
    } else {
      console.log('   ❌ 未找到音乐类型的Hero内容')
    }
    
    // 3. 测试前端交互数据
    console.log('\n3. 前端交互测试数据:')
    const types = ['music', 'skiing', 'tech', 'fishing', 'about']
    
    for (const type of types) {
      const hero = await prisma.heroContent.findFirst({
        where: { type, active: true }
      })
      
      if (hero) {
        console.log(`   ✅ ${type}: ${hero.title}`)
      } else {
        console.log(`   ❌ ${type}: 未找到`)
      }
    }
    
    console.log('\n🎉 Hero API功能测试完成!')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testHeroAPI()