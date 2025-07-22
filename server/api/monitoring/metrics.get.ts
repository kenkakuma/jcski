// JCSKI Blog 性能指标API - v0.5.0 步骤20
// 提供详细的性能监控数据

import { defineEventHandler, createError } from 'h3'
import { getMetrics } from '~/server/middleware/monitoring'

export default defineEventHandler(async (event) => {
  try {
    // 简单的认证检查（生产环境应使用更强的认证）
    const authHeader = event.node.req.headers.authorization
    const isAuthorized = authHeader === 'Bearer monitor-token' || 
                        process.env.NODE_ENV === 'development'
    
    if (!isAuthorized) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized access to monitoring data'
      })
    }
    
    // 获取性能指标
    const metrics = getMetrics()
    
    return {
      success: true,
      data: metrics,
      meta: {
        timestamp: new Date().toISOString(),
        server: 'JCSKI Blog v0.5.0',
        environment: process.env.NODE_ENV || 'development'
      }
    }
  } catch (error) {
    console.error('[Monitoring API] Error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch metrics',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
  }
})