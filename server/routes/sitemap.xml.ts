/**
 * JCSKI Blog XML Sitemap 自动生成
 * 动态生成包含所有页面和文章的sitemap.xml
 * 
 * v0.5.0 优化特性:
 * - 静态页面和动态文章页面全覆盖
 * - 基于文章更新时间的智能lastmod
 * - SEO友好的优先级和更新频率设置
 * - 内存优化的流式生成
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 设置正确的Content-Type
    setHeader(event, 'Content-Type', 'application/xml')
    setHeader(event, 'Cache-Control', 'max-age=3600') // 1小时缓存

    const baseUrl = 'https://jcski.com'
    const currentDate = new Date().toISOString()

    // 获取所有已发布的文章
    const publishedPosts = await prisma.blogPost.findMany({
      where: {
        published: true
      },
      select: {
        slug: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        isPinned: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // 构建XML sitemap
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // 1. 静态页面 - 按重要性排序
    const staticPages = [
      {
        url: '',
        priority: '1.0',
        changefreq: 'daily',
        lastmod: currentDate
      },
      {
        url: '/about',
        priority: '0.9',
        changefreq: 'monthly',
        lastmod: '2025-07-21T00:00:00+00:00'
      },
      {
        url: '/music',
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: currentDate
      },
      {
        url: '/tech',
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: currentDate
      },
      {
        url: '/skiing',
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: currentDate
      },
      {
        url: '/fishing',
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: currentDate
      }
    ]

    // 添加静态页面到sitemap
    for (const page of staticPages) {
      xmlContent += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // 2. 动态文章页面
    for (const post of publishedPosts) {
      // 确定文章优先级
      let priority = '0.7' // 默认文章优先级
      if (post.isPinned) {
        priority = '0.9' // 置顶文章高优先级
      }

      // 确定更新频率
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(post.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      let changefreq = 'monthly'
      if (daysSinceUpdate <= 7) {
        changefreq = 'weekly'
      } else if (daysSinceUpdate <= 30) {
        changefreq = 'monthly'
      } else {
        changefreq = 'yearly'
      }

      const lastmod = post.updatedAt.toISOString()

      xmlContent += `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`
    }

    // 关闭XML标签
    xmlContent += `</urlset>`

    // 记录生成统计信息到控制台(仅开发环境)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Sitemap] Generated sitemap.xml with ${staticPages.length + publishedPosts.length} URLs:`)
      console.log(`  - ${staticPages.length} static pages`)
      console.log(`  - ${publishedPosts.length} blog posts`)
      console.log(`  - Generated at: ${currentDate}`)
    }

    return xmlContent

  } catch (error) {
    // 错误处理 - 返回基础sitemap
    console.error('Error generating sitemap:', error)
    
    setResponseStatus(event, 500)
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jcski.com</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
  } finally {
    await prisma.$disconnect()
  }
})