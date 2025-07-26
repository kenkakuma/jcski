import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 并行查询所有统计数据以提高性能
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      pinnedPosts,
      totalMediaFiles,
      heroContents,
      recentPosts,
      mediaFileStats
    ] = await Promise.all([
      // 文章统计
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.blogPost.count({ where: { published: false } }),
      prisma.blogPost.count({ where: { isPinned: true } }),
      
      // 媒体文件统计
      prisma.mediaFile.count(),
      
      // Hero内容统计
      prisma.heroContent.count(),
      
      // 最近文章（最近7天）
      prisma.blogPost.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          published: true,
          category: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // 媒体文件详细统计
      prisma.mediaFile.groupBy({
        by: ['type'],
        _count: { id: true },
        _sum: { size: true }
      })
    ])

    // 计算媒体存储统计
    const mediaStats = {
      totalFiles: totalMediaFiles,
      totalSize: 0,
      imageFiles: 0,
      audioFiles: 0,
      otherFiles: 0,
      imageSize: 0,
      audioSize: 0,
      otherSize: 0
    }

    mediaFileStats.forEach(stat => {
      const count = stat._count.id
      const size = stat._sum.size || 0
      
      if (stat.type === 'image') {
        mediaStats.imageFiles = count
        mediaStats.imageSize = size
      } else if (stat.type === 'audio') {
        mediaStats.audioFiles = count
        mediaStats.audioSize = size
      } else {
        mediaStats.otherFiles += count
        mediaStats.otherSize += size
      }
      
      mediaStats.totalSize += size
    })

    // 按分类统计文章
    const postsByCategory = await prisma.blogPost.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { published: true }
    })

    const categoryStats = postsByCategory.reduce((acc, item) => {
      acc[item.category] = item._count.id
      return acc
    }, {} as Record<string, number>)

    // 计算本月新增统计
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const [
      newPostsThisMonth,
      newMediaThisMonth
    ] = await Promise.all([
      prisma.blogPost.count({
        where: {
          createdAt: { gte: thisMonth }
        }
      }),
      prisma.mediaFile.count({
        where: {
          createdAt: { gte: thisMonth }
        }
      })
    ])

    // 活动日志统计（近30天的创建和更新活动）
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const recentActivity = await prisma.blogPost.findMany({
      where: {
        OR: [
          { createdAt: { gte: thirtyDaysAgo } },
          { updatedAt: { gte: thirtyDaysAgo } }
        ]
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        published: true,
        category: true,
        author: {
          select: {
            username: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    })

    // 系统健康状态
    const systemHealth = {
      database: 'healthy',
      storage: mediaStats.totalSize < 100 * 1024 * 1024 ? 'healthy' : 'warning', // 100MB阈值
      posts: totalPosts > 0 ? 'healthy' : 'warning',
      media: totalMediaFiles > 0 ? 'healthy' : 'info'
    }

    // 格式化响应数据
    const response = {
      // 基础统计
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        pinnedPosts,
        totalMediaFiles,
        heroContents,
        newPostsThisMonth,
        newMediaThisMonth
      },
      
      // 媒体统计
      mediaStats,
      
      // 分类统计
      categoryStats,
      
      // 最近文章
      recentPosts: recentPosts.map(post => ({
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
        published: post.published,
        category: post.category,
        status: post.published ? 'published' : 'draft'
      })),
      
      // 活动记录
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        title: activity.title,
        type: activity.createdAt.getTime() === activity.updatedAt.getTime() ? 'created' : 'updated',
        timestamp: activity.updatedAt,
        author: activity.author?.username || 'Unknown',
        category: activity.category,
        published: activity.published
      })),
      
      // 系统状态
      systemHealth,
      
      // 性能指标
      performance: {
        responseTime: Date.now(), // 将在前端计算实际响应时间
        dataFreshness: new Date().toISOString(),
        queriesExecuted: 8 // 实际执行的查询数量
      },
      
      // 元数据
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        source: 'dashboard-stats-api'
      }
    }

    return response

  } catch (error) {
    console.error('Dashboard stats API error:', error)
    
    // 返回错误响应但包含基础数据结构
    return {
      stats: {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        pinnedPosts: 0,
        totalMediaFiles: 0,
        heroContents: 0,
        newPostsThisMonth: 0,
        newMediaThisMonth: 0
      },
      mediaStats: {
        totalFiles: 0,
        totalSize: 0,
        imageFiles: 0,
        audioFiles: 0,
        otherFiles: 0,
        imageSize: 0,
        audioSize: 0,
        otherSize: 0
      },
      categoryStats: {},
      recentPosts: [],
      recentActivity: [],
      systemHealth: {
        database: 'error',
        storage: 'unknown',
        posts: 'unknown',
        media: 'unknown'
      },
      performance: {
        responseTime: Date.now(),
        dataFreshness: new Date().toISOString(),
        queriesExecuted: 0
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        source: 'dashboard-stats-api',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  } finally {
    await prisma.$disconnect()
  }
})