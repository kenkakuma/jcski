import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const limit = Math.min(parseInt(query.limit as string) || 20, 50) // 最多50条
    const offset = parseInt(query.offset as string) || 0
    const type = query.type as string // 'all', 'posts', 'media', 'hero'
    
    // 获取最近活动的时间范围（默认30天）
    const days = Math.min(parseInt(query.days as string) || 30, 90) // 最多90天
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    let activities: any[] = []
    
    // 根据类型过滤活动
    if (type === 'all' || type === 'posts' || !type) {
      // 文章活动
      const postActivities = await prisma.blogPost.findMany({
        where: {
          OR: [
            { createdAt: { gte: since } },
            { updatedAt: { gte: since, not: { equals: prisma.blogPost.fields.createdAt } } }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          published: true,
          category: true,
          author: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
      
      // 转换为活动格式
      postActivities.forEach(post => {
        const isNew = post.createdAt.getTime() === post.updatedAt.getTime()
        
        activities.push({
          id: `post-${post.id}`,
          type: 'post',
          action: isNew ? 'created' : 'updated',
          title: post.title,
          description: `文章 "${post.title}" 已${isNew ? '创建' : '更新'}`,
          timestamp: post.updatedAt,
          author: post.author.name,
          metadata: {
            postId: post.id,
            slug: post.slug,
            category: post.category,
            published: post.published,
            status: post.published ? 'published' : 'draft'
          },
          url: `/admin#posts`,
          icon: isNew ? '📝' : '✏️',
          priority: isNew ? 'high' : 'medium'
        })
      })
    }
    
    if (type === 'all' || type === 'media' || !type) {
      // 媒体文件活动
      const mediaActivities = await prisma.mediaFile.findMany({
        where: {
          createdAt: { gte: since }
        },
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimetype: true,
          size: true,
          type: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
      
      mediaActivities.forEach(media => {
        activities.push({
          id: `media-${media.id}`,
          type: 'media',
          action: 'uploaded',
          title: media.originalName,
          description: `媒体文件 "${media.originalName}" 已上传`,
          timestamp: media.createdAt,
          author: '管理员', // 媒体文件没有关联用户，默认为管理员
          metadata: {
            mediaId: media.id,
            filename: media.filename,
            mimetype: media.mimetype,
            size: media.size,
            type: media.type,
            sizeFormatted: formatFileSize(media.size)
          },
          url: `/admin#media`,
          icon: media.type === 'image' ? '🖼️' : media.type === 'audio' ? '🎵' : '📎',
          priority: 'low'
        })
      })
    }
    
    if (type === 'all' || type === 'hero' || !type) {
      // Hero内容活动
      const heroActivities = await prisma.heroContent.findMany({
        where: {
          OR: [
            { createdAt: { gte: since } },
            { updatedAt: { gte: since, not: { equals: prisma.heroContent.fields.createdAt } } }
          ]
        },
        select: {
          id: true,
          menuItem: true,
          title: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' }
      })
      
      heroActivities.forEach(hero => {
        const isNew = hero.createdAt.getTime() === hero.updatedAt.getTime()
        
        activities.push({
          id: `hero-${hero.id}`,
          type: 'hero',
          action: isNew ? 'created' : 'updated',
          title: hero.title,
          description: `Hero内容 "${hero.title}" (${hero.menuItem}) 已${isNew ? '创建' : '更新'}`,
          timestamp: hero.updatedAt,
          author: '管理员',
          metadata: {
            heroId: hero.id,
            menuItem: hero.menuItem,
            isActive: hero.isActive,
            status: hero.isActive ? 'active' : 'inactive'
          },
          url: `/admin#hero`,
          icon: isNew ? '🎯' : '✨',
          priority: 'medium'
        })
      })
    }
    
    // 按时间排序并分页
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const paginatedActivities = activities.slice(offset, offset + limit)
    
    // 统计信息
    const stats = {
      total: activities.length,
      today: activities.filter(a => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return new Date(a.timestamp) >= today
      }).length,
      thisWeek: activities.filter(a => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return new Date(a.timestamp) >= weekAgo
      }).length,
      byType: {
        post: activities.filter(a => a.type === 'post').length,
        media: activities.filter(a => a.type === 'media').length,
        hero: activities.filter(a => a.type === 'hero').length
      }
    }
    
    return {
      activities: paginatedActivities,
      pagination: {
        limit,
        offset,
        total: activities.length,
        hasMore: offset + limit < activities.length
      },
      stats,
      filters: {
        type: type || 'all',
        days,
        since: since.toISOString()
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        source: 'dashboard-activity-api'
      }
    }
    
  } catch (error) {
    console.error('Dashboard activity API error:', error)
    
    return {
      activities: [],
      pagination: {
        limit: 20,
        offset: 0,
        total: 0,
        hasMore: false
      },
      stats: {
        total: 0,
        today: 0,
        thisWeek: 0,
        byType: { post: 0, media: 0, hero: 0 }
      },
      filters: {
        type: 'all',
        days: 30,
        since: new Date().toISOString()
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        source: 'dashboard-activity-api',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  } finally {
    await prisma.$disconnect()
  }
})

// 辅助函数：格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}