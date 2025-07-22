// JCSKI Blog 性能监控中间件 - v0.5.0 步骤20
// 轻量级性能监控系统，适配AWS EC2 t2.micro资源限制

import { defineEventHandler, getHeader, setHeader } from 'h3'

interface RequestMetrics {
  timestamp: number
  method: string
  path: string
  statusCode: number
  responseTime: number
  memoryUsage: number
  cpuUsage?: number
  userAgent: string
  ip: string
  size: number
}

interface PerformanceMetrics {
  requests: {
    total: number
    success: number
    error: number
    avgResponseTime: number
  }
  system: {
    memoryUsage: NodeJS.MemoryUsage
    uptime: number
    loadAverage: number[]
  }
  endpoints: Map<string, {
    count: number
    totalTime: number
    avgTime: number
    errors: number
  }>
}

// 内存中存储最近的请求指标（限制大小以节省内存）
const recentMetrics: RequestMetrics[] = []
const MAX_METRICS_HISTORY = 1000
const performanceMetrics: PerformanceMetrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0,
    avgResponseTime: 0
  },
  system: {
    memoryUsage: process.memoryUsage(),
    uptime: 0,
    loadAverage: []
  },
  endpoints: new Map()
}

// 清理旧指标的定时器
let cleanupTimer: NodeJS.Timeout | null = null

// 获取客户端IP
const getClientIP = (event: any): string => {
  const forwarded = event.node.req.headers['x-forwarded-for']
  const realIp = event.node.req.headers['x-real-ip']
  const remoteAddress = event.node.req.connection?.remoteAddress || 
                       event.node.req.socket?.remoteAddress

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  if (typeof realIp === 'string') {
    return realIp
  }
  return remoteAddress || 'unknown'
}

// 计算响应大小
const getResponseSize = (event: any): number => {
  const contentLength = event.node.res.getHeader('content-length')
  if (contentLength && typeof contentLength === 'string') {
    return parseInt(contentLength, 10) || 0
  }
  return 0
}

// 更新端点指标
const updateEndpointMetrics = (path: string, responseTime: number, isError: boolean) => {
  const endpoint = performanceMetrics.endpoints.get(path) || {
    count: 0,
    totalTime: 0,
    avgTime: 0,
    errors: 0
  }
  
  endpoint.count++
  endpoint.totalTime += responseTime
  endpoint.avgTime = endpoint.totalTime / endpoint.count
  
  if (isError) {
    endpoint.errors++
  }
  
  performanceMetrics.endpoints.set(path, endpoint)
}

// 更新系统指标
const updateSystemMetrics = () => {
  performanceMetrics.system.memoryUsage = process.memoryUsage()
  performanceMetrics.system.uptime = process.uptime()
  
  // 获取系统负载（仅Linux）
  try {
    const os = require('os')
    performanceMetrics.system.loadAverage = os.loadavg()
  } catch (e) {
    // macOS/Windows fallback
    performanceMetrics.system.loadAverage = [0, 0, 0]
  }
}

// 检查性能告警条件
const checkPerformanceAlerts = (metrics: RequestMetrics) => {
  const alerts: string[] = []
  
  // 响应时间告警（超过2秒）
  if (metrics.responseTime > 2000) {
    alerts.push(`Slow response: ${metrics.path} took ${metrics.responseTime}ms`)
  }
  
  // 内存使用告警（超过800MB，为1GB系统预留空间）
  if (metrics.memoryUsage > 800 * 1024 * 1024) {
    alerts.push(`High memory usage: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`)
  }
  
  // 4xx/5xx错误告警
  if (metrics.statusCode >= 400) {
    alerts.push(`HTTP Error: ${metrics.statusCode} on ${metrics.path}`)
  }
  
  // 记录告警
  if (alerts.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(`[Performance Alert] ${alerts.join(', ')}`)
  }
}

// 清理旧指标
const cleanupOldMetrics = () => {
  const now = Date.now()
  const oneHourAgo = now - (60 * 60 * 1000) // 1小时前
  
  // 只保留最近1小时的指标
  const recentCount = recentMetrics.length
  for (let i = recentMetrics.length - 1; i >= 0; i--) {
    if (recentMetrics[i].timestamp < oneHourAgo) {
      recentMetrics.splice(i, 1)
    }
  }
  
  // 如果还是太多，保留最新的1000条
  if (recentMetrics.length > MAX_METRICS_HISTORY) {
    recentMetrics.splice(0, recentMetrics.length - MAX_METRICS_HISTORY)
  }
  
  if (recentCount > recentMetrics.length) {
    console.debug(`[Monitoring] Cleaned up ${recentCount - recentMetrics.length} old metrics`)
  }
}

// 启动清理定时器
const startCleanupTimer = () => {
  if (cleanupTimer) return
  
  // 每10分钟清理一次
  cleanupTimer = setInterval(() => {
    cleanupOldMetrics()
    updateSystemMetrics()
  }, 10 * 60 * 1000)
}

// 停止清理定时器
const stopCleanupTimer = () => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
}

// 生成性能摘要
const generatePerformanceSummary = () => {
  const now = Date.now()
  const oneHourAgo = now - (60 * 60 * 1000)
  const recentRequests = recentMetrics.filter(m => m.timestamp > oneHourAgo)
  
  if (recentRequests.length === 0) {
    return null
  }
  
  const totalTime = recentRequests.reduce((sum, m) => sum + m.responseTime, 0)
  const avgResponseTime = totalTime / recentRequests.length
  
  const errorRequests = recentRequests.filter(m => m.statusCode >= 400)
  const errorRate = (errorRequests.length / recentRequests.length) * 100
  
  const memoryValues = recentRequests.map(m => m.memoryUsage)
  const avgMemory = memoryValues.reduce((sum, m) => sum + m, 0) / memoryValues.length
  const maxMemory = Math.max(...memoryValues)
  
  return {
    timeWindow: '1 hour',
    requestCount: recentRequests.length,
    avgResponseTime: Math.round(avgResponseTime),
    errorRate: Math.round(errorRate * 100) / 100,
    memoryUsage: {
      average: Math.round(avgMemory / 1024 / 1024), // MB
      peak: Math.round(maxMemory / 1024 / 1024)     // MB
    },
    timestamp: new Date().toISOString()
  }
}

// 主监控中间件
export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const path = event.node.req.url || ''
  const method = event.node.req.method || 'GET'
  
  // 跳过某些路径
  if (path.startsWith('/favicon.ico') || 
      path.startsWith('/_nuxt/') || 
      path.startsWith('/monitoring') ||
      path === '/health') {
    return
  }
  
  // 启动清理定时器
  startCleanupTimer()
  
  // 等待请求处理完成
  event.node.res.on('finish', () => {
    const endTime = Date.now()
    const responseTime = endTime - startTime
    const statusCode = event.node.res.statusCode || 200
    const currentMemory = process.memoryUsage().heapUsed
    
    // 创建指标记录
    const metrics: RequestMetrics = {
      timestamp: startTime,
      method,
      path: path.split('?')[0], // 移除查询参数
      statusCode,
      responseTime,
      memoryUsage: currentMemory,
      userAgent: getHeader(event, 'user-agent') || '',
      ip: getClientIP(event),
      size: getResponseSize(event)
    }
    
    // 存储指标
    recentMetrics.push(metrics)
    
    // 更新聚合指标
    performanceMetrics.requests.total++
    if (statusCode < 400) {
      performanceMetrics.requests.success++
    } else {
      performanceMetrics.requests.error++
    }
    
    // 更新平均响应时间
    const totalRequests = performanceMetrics.requests.total
    const oldAvg = performanceMetrics.requests.avgResponseTime
    performanceMetrics.requests.avgResponseTime = 
      (oldAvg * (totalRequests - 1) + responseTime) / totalRequests
    
    // 更新端点指标
    updateEndpointMetrics(path.split('?')[0], responseTime, statusCode >= 400)
    
    // 检查告警条件
    checkPerformanceAlerts(metrics)
    
    // 在响应头中添加性能信息（开发环境）
    if (process.env.NODE_ENV === 'development') {
      setHeader(event, 'X-Response-Time', `${responseTime}ms`)
      setHeader(event, 'X-Memory-Usage', `${Math.round(currentMemory / 1024 / 1024)}MB`)
    }
  })
  
  return
})

// 性能监控API端点
export const getMetrics = () => {
  return {
    summary: generatePerformanceSummary(),
    system: performanceMetrics.system,
    endpoints: Object.fromEntries(performanceMetrics.endpoints),
    recent: recentMetrics.slice(-100) // 最近100个请求
  }
}

export const getHealthStatus = () => {
  const memory = process.memoryUsage()
  const uptime = process.uptime()
  const memoryUsageMB = Math.round(memory.heapUsed / 1024 / 1024)
  
  return {
    status: memoryUsageMB > 800 ? 'warning' : 'healthy',
    uptime: Math.round(uptime),
    memory: {
      used: memoryUsageMB,
      total: Math.round(memory.heapTotal / 1024 / 1024),
      limit: '1GB (AWS t2.micro)'
    },
    timestamp: new Date().toISOString()
  }
}

// 导出清理函数
export { stopCleanupTimer, recentMetrics, performanceMetrics }