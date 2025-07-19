import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 开始初始化Hero内容...')

  const heroContents = [
    {
      type: 'music',
      title: '音楽の世界',
      subtitle: '音楽制作・発見',
      description: '音楽制作、器具レビュー、新しい音楽の発見について。クリエイティブな音楽体験をお届けします。',
      order: 1,
      active: true
    },
    {
      type: 'skiing',
      title: 'スキーの冒険',
      subtitle: 'スキー・スノーボード',
      description: 'スキー技術、装備レビュー、雪山の魅力を共有。ウィンタースポーツの楽しさを発見しましょう。',
      order: 2,
      active: true
    },
    {
      type: 'tech',
      title: 'テクノロジー',
      subtitle: '技術・プログラミング',
      description: 'Web開発、AI技術、最新テクノロジーについて。プログラミングの世界を探求します。',
      order: 3,
      active: true
    },
    {
      type: 'fishing',
      title: '釣りの世界',
      subtitle: '釣り・アウトドア',
      description: '釣り技術、装備情報、釣り場レポート。自然との触れ合いを通じた体験を共有します。',
      order: 4,
      active: true
    },
    {
      type: 'about',
      title: 'プロフィール',
      subtitle: '私について',
      description: 'JCSKIの紹介、ブログの理念、連絡先について。このブログの背景と目的をご紹介します。',
      order: 5,
      active: true
    }
  ]

  // 检查是否已存在记录
  const existingRecords = await prisma.heroContent.findMany()
  
  if (existingRecords.length > 0) {
    console.log('⚠️  Hero内容已存在，跳过初始化')
    return
  }

  // 创建Hero内容
  for (const content of heroContents) {
    await prisma.heroContent.create({
      data: content
    })
    console.log(`✅ 创建了 ${content.type} 的Hero内容`)
  }

  console.log('🎉 Hero内容初始化完成!')
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })