const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const testPosts = [
  {
    title: "お知らせ: ブログ「JCSKI BLOG」デザインリニューアルとJ-WAVE風UIの実装について",
    content: "新年に向けて、JCSKI個人ブログのTOPページを全面的にJ-WAVE 81.3FM風にリニューアルしました。現代的なSPA（Single Page Application）アーキテクチャを採用し、Nuxt 3 + TypeScript + Prismaの技術スタックで完全に再構築。レスポンシブデザインにも対応し、デスクトップ・モバイル両方で最適な閲覧体験を提供します。",
    excerpt: "JCSKI個人ブログのTOPページをJ-WAVE 81.3FM風にリニューアルしました。現代的なSPA技術で完全再構築。",
    slug: "blog-redesign-jwave-style-2025",
    tags: ["デザイン", "J-WAVE", "Nuxt3", "リニューアル"],
    published: true,
    createdAt: new Date('2025-01-17T10:00:00Z'),
    updatedAt: new Date('2025-01-17T10:00:00Z')
  },
  {
    title: "新年スペシャル企画: 2025年プログラミング技術トレンドと学習ロードマップ完全版",
    content: "2025年に注目すべきプログラミング技術トレンドを徹底解説。AI・機械学習、Web3、クラウドネイティブ開発、エッジコンピューティングなど、最新技術の動向と実践的な学習方法をまとめました。初心者から上級者まで、レベル別の学習ロードマップも合わせてご紹介します。",
    excerpt: "2025年注目のプログラミング技術トレンドを徹底解説。AI・Web3・クラウドネイティブなど最新技術の学習ロードマップ。",
    slug: "programming-trends-2025-learning-roadmap",
    tags: ["プログラミング", "技術トレンド", "学習", "2025年"],
    published: true,
    createdAt: new Date('2025-01-15T14:30:00Z'),
    updatedAt: new Date('2025-01-15T14:30:00Z')
  },
  {
    title: "音楽制作者必見: Logic Pro X vs Ableton Live 12 徹底比較レビュー【2025年版】",
    content: "音楽制作の現場で最も使用されているDAW（Digital Audio Workstation）、Logic Pro XとAbleton Live 12の機能・操作性・音質を詳細に比較。EDM、ポップス、ロックなど、ジャンル別の制作フローや、プラグイン対応、オーディオエンジンの違いまで、実際の制作現場での使用感を交えて解説します。",
    excerpt: "音楽制作DAWの代表格、Logic Pro XとAbleton Live 12を徹底比較。ジャンル別制作フローや実際の使用感を詳細解説。",
    slug: "logic-pro-x-vs-ableton-live-12-comparison-2025",
    tags: ["音楽制作", "DAW", "Logic Pro X", "Ableton Live"],
    published: true,
    createdAt: new Date('2025-01-12T16:45:00Z'),
    updatedAt: new Date('2025-01-12T16:45:00Z')
  },
  {
    title: "スキーシーズン到来: 2025年おすすめスキー場ガイドと最新装備レビュー",
    content: "2025年のスキーシーズンに向けて、全国のおすすめスキー場を厳選紹介。雪質、コース設計、アクセス性を総合評価し、初心者から上級者まで楽しめるスキー場をピックアップ。また、最新のスキー装備（スキー板、ブーツ、ウェア）のレビューと、効果的なスキー上達テクニックも合わせてご紹介します。",
    excerpt: "2025年スキーシーズンの全国おすすめスキー場ガイド。最新装備レビューと上達テクニックも完全網羅。",
    slug: "ski-season-2025-resort-guide-equipment-review",
    tags: ["スキー", "スキー場", "装備", "ウィンタースポーツ"],
    published: true,
    createdAt: new Date('2025-01-10T11:20:00Z'),
    updatedAt: new Date('2025-01-10T11:20:00Z')
  },
  {
    title: "釣り愛好家向け: 冬の海釣り完全攻略法と厳選タックル紹介",
    content: "冬の海釣りは魚の活性が低下し難しい季節とされますが、適切な知識と装備があれば素晴らしい釣果を期待できます。冬場の魚の習性、効果的なポイント選び、おすすめの仕掛けとルアー、防寒対策まで、冬の海釣りを成功させるための実践的なノウハウを詳細に解説します。",
    excerpt: "冬の海釣りを成功させるための完全攻略法。魚の習性、ポイント選び、おすすめタックルまで実践的ノウハウを解説。",
    slug: "winter-sea-fishing-complete-guide-tackle-review",
    tags: ["釣り", "海釣り", "冬釣り", "タックル"],
    published: true,
    createdAt: new Date('2025-01-08T09:15:00Z'),
    updatedAt: new Date('2025-01-08T09:15:00Z')
  },
  {
    title: "年末年始特別企画: 2024年JCSKI BLOGアクセスランキングTOP10発表",
    content: "2024年一年間のJCSKI BLOGアクセスランキングを発表！技術記事、音楽制作、スキー、釣りなど、各カテゴリで最も読まれた記事をランキング形式でご紹介。読者の皆様からの温かいコメントやフィードバックも合わせて振り返ります。2025年もより充実したコンテンツをお届けしていきます。",
    excerpt: "2024年JCSKI BLOGアクセスランキングTOP10を発表。技術・音楽・スキー・釣りカテゴリの人気記事を振り返り。",
    slug: "jcski-blog-2024-access-ranking-top10",
    tags: ["ランキング", "2024年", "振り返り", "アクセス"],
    published: true,
    createdAt: new Date('2025-01-01T12:00:00Z'),
    updatedAt: new Date('2025-01-01T12:00:00Z')
  }
]

async function createTestPosts() {
  try {
    console.log('开始创建测试文章...')
    
    // 查找或创建默认用户
    let user = await prisma.user.findFirst({
      where: { email: 'admin@jcski.com' }
    })
    
    if (!user) {
      console.log('创建默认管理员用户...')
      const hashedPassword = await bcrypt.hash('admin123456', 10)
      user = await prisma.user.create({
        data: {
          email: 'admin@jcski.com',
          username: 'admin',
          password: hashedPassword,
          role: 'admin'
        }
      })
    }
    
    // 创建测试文章
    for (let i = 0; i < testPosts.length; i++) {
      const postData = {
        ...testPosts[i],
        tags: JSON.stringify(testPosts[i].tags),
        authorId: user.id
      }
      
      const post = await prisma.blogPost.create({
        data: postData
      })
      
      console.log(`创建文章 ${i + 1}/6: ${post.title}`)
    }
    
    console.log('✅ 所有测试文章创建成功!')
    
    // 显示创建的文章列表
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { username: true }
        }
      }
    })
    
    console.log('\n📝 已创建的文章列表:')
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`)
      console.log(`   作者: ${post.author.username}`)
      console.log(`   发布时间: ${post.createdAt.toLocaleDateString('ja-JP')}`)
      console.log(`   状态: ${post.published ? '已发布' : '草稿'}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('创建测试文章失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPosts()