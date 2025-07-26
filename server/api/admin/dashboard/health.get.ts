import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const checks: Record<string, any> = {}
  
  try {
    // 数据库健康检查
    try {
      const dbStart = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const dbTime = Date.now() - dbStart
      
      checks.database = {
        status: 'healthy',
        responseTime: dbTime,
        message: '数据库连接正常',
        details: {
          connectionTime: `${dbTime}ms`,
          type: 'SQLite'
        }
      }
    } catch (dbError) {
      checks.database = {
        status: 'error',
        responseTime: -1,
        message: '数据库连接失败',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }
    }
    
    // 存储空间检查
    try {
      const uploadsPath = join(process.cwd(), 'public', 'uploads')
      const mediaFiles = await prisma.mediaFile.findMany({
        select: { size: true }
      })
      
      const totalSize = mediaFiles.reduce((sum, file) => sum + file.size, 0)
      const fileCount = mediaFiles.length
      
      // 检查uploads目录是否存在且可写
      let diskInfo = {
        accessible: true,
        writable: true,
        path: uploadsPath
      }
      
      try {
        await fs.access(uploadsPath, fs.constants.F_OK | fs.constants.W_OK)
      } catch {
        try {
          await fs.mkdir(uploadsPath, { recursive: true })
        } catch (mkdirError) {
          diskInfo.accessible = false
          diskInfo.writable = false
        }
      }
      
      const sizeInMB = totalSize / (1024 * 1024)
      const status = sizeInMB > 100 ? 'warning' : totalSize > 500 * 1024 * 1024 ? 'error' : 'healthy'
      
      checks.storage = {
        status,
        message: status === 'healthy' 
          ? '存储空间正常' 
          : status === 'warning' 
            ? '存储空间使用较多，建议清理' 
            : '存储空间不足',
        details: {
          totalFiles: fileCount,
          totalSize: `${sizeInMB.toFixed(2)} MB`,
          totalSizeBytes: totalSize,
          accessible: diskInfo.accessible,
          writable: diskInfo.writable,
          path: diskInfo.path,
          threshold: {
            warning: '100 MB',
            error: '500 MB'
          }
        }
      }
    } catch (storageError) {
      checks.storage = {
        status: 'error',
        message: '存储检查失败',
        error: storageError instanceof Error ? storageError.message : 'Unknown storage error'
      }
    }
    
    // 内容健康检查
    try {
      const [postCount, publishedCount, heroCount, mediaCount] = await Promise.all([
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { published: true } }),
        prisma.heroContent.count({ where: { active: true } }),
        prisma.mediaFile.count()
      ])
      
      const contentStatus = postCount === 0 ? 'warning' : publishedCount === 0 ? 'warning' : 'healthy'
      
      checks.content = {
        status: contentStatus,
        message: contentStatus === 'healthy' 
          ? '内容状态正常' 
          : '内容数量较少，建议添加更多内容',
        details: {
          totalPosts: postCount,
          publishedPosts: publishedCount,
          activeHeroContents: heroCount,
          mediaFiles: mediaCount,
          publishRate: postCount > 0 ? ((publishedCount / postCount) * 100).toFixed(1) + '%' : '0%'
        }
      }
    } catch (contentError) {
      checks.content = {
        status: 'error',
        message: '内容检查失败',
        error: contentError instanceof Error ? contentError.message : 'Unknown content error'
      }
    }
    
    // 系统性能检查
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    const memoryInMB = memoryUsage.heapUsed / 1024 / 1024
    const performanceStatus = memoryInMB > 100 ? 'warning' : memoryInMB > 200 ? 'error' : 'healthy'
    
    checks.performance = {
      status: performanceStatus,
      message: performanceStatus === 'healthy' 
        ? '系统性能正常' 
        : performanceStatus === 'warning' 
          ? '内存使用较高' 
          : '系统性能异常',
      details: {
        memoryUsage: {
          heapUsed: `${memoryInMB.toFixed(2)} MB`,
          heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
          rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`
        },
        uptime: {
          seconds: Math.floor(uptime),
          formatted: formatUptime(uptime)
        },
        nodeVersion: process.version,
        platform: process.platform
      }
    }
    
    // API响应时间检查
    const apiResponseTime = Date.now() - startTime
    const apiStatus = apiResponseTime > 1000 ? 'warning' : apiResponseTime > 2000 ? 'error' : 'healthy'
    
    checks.api = {
      status: apiStatus,
      message: apiStatus === 'healthy' 
        ? 'API响应正常' 
        : 'API响应较慢',
      details: {
        responseTime: `${apiResponseTime}ms`,
        threshold: {
          warning: '1000ms',
          error: '2000ms'
        }
      }
    }
    
    // 计算总体健康状态
    const statuses = Object.values(checks).map(check => check.status)
    const hasError = statuses.includes('error')
    const hasWarning = statuses.includes('warning')
    
    const overallStatus = hasError ? 'error' : hasWarning ? 'warning' : 'healthy'
    const healthyCount = statuses.filter(s => s === 'healthy').length
    const warningCount = statuses.filter(s => s === 'warning').length
    const errorCount = statuses.filter(s => s === 'error').length
    
    return {
      status: overallStatus,
      message: overallStatus === 'healthy' 
        ? '系统运行正常' 
        : overallStatus === 'warning' 
          ? '系统存在一些警告' 
          : '系统存在严重问题',
      summary: {
        total: statuses.length,
        healthy: healthyCount,
        warning: warningCount,
        error: errorCount,
        score: ((healthyCount + warningCount * 0.5) / statuses.length * 100).toFixed(1) + '%'
      },
      checks,
      performance: {
        responseTime: apiResponseTime,
        timestamp: new Date().toISOString(),
        uptime: formatUptime(uptime)
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        source: 'dashboard-health-api',
        environment: process.env.NODE_ENV || 'development'
      }
    }
    
  } catch (error) {
    console.error('Health check error:', error)
    
    return {
      status: 'error',
      message: '健康检查失败',
      summary: {
        total: 0,
        healthy: 0,
        warning: 0,
        error: 1,
        score: '0%'
      },
      checks: {
        system: {
          status: 'error',
          message: '系统检查失败',
          error: error instanceof Error ? error.message : 'Unknown system error'
        }
      },
      performance: {
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        uptime: formatUptime(process.uptime())
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        source: 'dashboard-health-api',
        environment: process.env.NODE_ENV || 'development'
      }
    }
  } finally {
    await prisma.$disconnect()
  }
})

// 辅助函数：格式化运行时间
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟 ${secs}秒`
  } else {
    return `${secs}秒`
  }
}