#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateMusicToGaming() {
  try {
    console.log('🎮 开始更新MUSIC为GAMING...')
    
    // 更新数据库中的music类型Hero内容
    const result = await prisma.heroContent.update({
      where: {
        type: 'music'
      },
      data: {
        title: 'ゲームの世界',
        subtitle: 'ゲーム・エンターテインメント',
        description: 'ゲーム体験、レビュー、攻略情報について。様々なゲームの魅力と楽しさを共有します。PC、コンソール、モバイルゲームまで幅広くカバー。'
      }
    })
    
    console.log('✅ Hero内容更新成功:')
    console.log(`- 标题: ${result.title}`)
    console.log(`- 副标题: ${result.subtitle}`)
    console.log(`- 描述: ${result.description}`)
    
  } catch (error) {
    console.error('❌ 更新失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateMusicToGaming()