// JCSKI Blog 健康检查API - v0.5.0 步骤20
// 提供系统健康状态检查

import { defineEventHandler } from 'h3'
import { getHealthStatus } from '~/server/middleware/monitoring'

export default defineEventHandler(async (event) => {
  try {
    // 获取健康状态
    const health = getHealthStatus()
    
    // 检查数据库连接
    let dbStatus = 'unknown'
    try {
      // 简单的数据库连接测试
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      await prisma.$queryRaw`SELECT 1`
      await prisma.$disconnect()
      dbStatus = 'healthy'
    } catch (error) {
      console.error('[Health Check] Database error:', error)
      dbStatus = 'error'
    }
    
    // 检查磁盘空间
    let diskStatus = 'unknown'
    try {
      const fs = await import('fs')
      const stats = fs.statSync(process.cwd())
      diskStatus = 'healthy' // 简化检查
    } catch (error) {
      console.error('[Health Check] Disk error:', error)
      diskStatus = 'error'
    }
    
    // 总体健康状态
    const overallStatus = 
      health.status === 'healthy' && 
      dbStatus === 'healthy' && 
      diskStatus === 'healthy' ? 'healthy' : 'warning'
    
    const response = {
      status: overallStatus,
      services: {
        application: health,
        database: { status: dbStatus },
        storage: { status: diskStatus }
      },
      system: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      },
      timestamp: new Date().toISOString()
    }
    
    // 根据健康状态设置HTTP状态码
    if (overallStatus !== 'healthy') {
      event.node.res.statusCode = 503 // Service Unavailable
    }
    
    return response
    
  } catch (error) {
    console.error('[Health Check] Error:', error)
    
    event.node.res.statusCode = 500
    
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString()
    }
  }
})