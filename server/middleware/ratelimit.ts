// JCSKI Blog 请求频率限制中间件 - v0.5.0 步骤19
// 防止API滥用和DDoS攻击，保护AWS EC2资源

import { defineEventHandler, getCookie, setCookie, createError } from 'h3'

interface RateLimitConfig {
  windowMs: number      // 时间窗口（毫秒）
  maxRequests: number   // 最大请求数
  skipSuccessfulRequests: boolean
  skipFailedRequests: boolean
  message: string
  headers: boolean
}

interface ClientInfo {
  count: number
  firstRequest: number
  lastRequest: number
  blocked: boolean
}

// 内存存储（生产环境可考虑Redis）
const clients = new Map<string, ClientInfo>()

// 清理过期记录的定时器
let cleanupTimer: NodeJS.Timeout | null = null

// 不同端点的限流配置
const getRateLimitConfig = (path: string): RateLimitConfig => {
  // API端点更严格的限制
  if (path.startsWith('/api/admin')) {
    return {
      windowMs: 15 * 60 * 1000, // 15分钟
      maxRequests: 50,          // 管理API每15分钟50次
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many admin requests, please try again later',
      headers: true
    }
  }
  
  if (path.startsWith('/api/auth')) {
    return {
      windowMs: 15 * 60 * 1000, // 15分钟
      maxRequests: 10,          // 认证API每15分钟10次
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many authentication attempts, please try again later',
      headers: true
    }
  }
  
  if (path.startsWith('/api/')) {
    return {
      windowMs: 15 * 60 * 1000, // 15分钟
      maxRequests: 200,         // 普通API每15分钟200次
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
      message: 'Too many requests, please try again later',
      headers: true
    }
  }
  
  // 静态资源更宽松的限制
  if (path.startsWith('/_nuxt/') || path.startsWith('/images/') || path.startsWith('/uploads/')) {
    return {
      windowMs: 10 * 60 * 1000, // 10分钟
      maxRequests: 1000,        // 静态资源每10分钟1000次
      skipSuccessfulRequests: true,
      skipFailedRequests: true,
      message: 'Too many resource requests',
      headers: false
    }
  }
  
  // 默认页面访问限制
  return {
    windowMs: 15 * 60 * 1000,   // 15分钟
    maxRequests: 300,           // 页面访问每15分钟300次
    skipSuccessfulRequests: true,
    skipFailedRequests: true,
    message: 'Too many requests, please slow down',
    headers: false
  }
}

// 获取客户端标识
const getClientId = (event: any): string => {
  // 优先使用真实IP
  const forwarded = event.node.req.headers['x-forwarded-for']
  const realIp = event.node.req.headers['x-real-ip']
  const remoteAddress = event.node.req.connection?.remoteAddress || 
                       event.node.req.socket?.remoteAddress

  let ip = ''
  
  if (typeof forwarded === 'string') {
    ip = forwarded.split(',')[0].trim()
  } else if (typeof realIp === 'string') {
    ip = realIp
  } else if (remoteAddress) {
    ip = remoteAddress
  }
  
  // 清理IPv6地址
  ip = ip.replace(/^::ffff:/, '')
  
  // 如果是本地地址，使用用户代理作为补充标识
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
    const userAgent = event.node.req.headers['user-agent'] || ''
    ip = `${ip}-${Buffer.from(userAgent).toString('base64').slice(0, 8)}`
  }
  
  return ip || 'unknown'
}

// 清理过期记录
const cleanupExpiredClients = (windowMs: number) => {
  const now = Date.now()
  const expiredThreshold = now - windowMs
  
  for (const [clientId, info] of clients.entries()) {
    if (info.lastRequest < expiredThreshold) {
      clients.delete(clientId)
    }
  }
}

// 启动清理定时器
const startCleanupTimer = () => {
  if (cleanupTimer) return
  
  // 每5分钟清理一次
  cleanupTimer = setInterval(() => {
    cleanupExpiredClients(15 * 60 * 1000) // 清理15分钟前的记录
  }, 5 * 60 * 1000)
}

// 停止清理定时器
const stopCleanupTimer = () => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
}

// 检查是否在白名单中
const isWhitelisted = (clientId: string): boolean => {
  // 内部健康检查
  if (clientId.includes('127.0.0.1') || clientId.includes('::1')) {
    return false // 本地也要限流，防止开发时的无限循环
  }
  
  // 可以添加特定的白名单IP
  const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || []
  return whitelist.some(ip => clientId.startsWith(ip.trim()))
}

// 主要的限流逻辑
const checkRateLimit = (clientId: string, config: RateLimitConfig): { allowed: boolean; info: ClientInfo } => {
  const now = Date.now()
  const windowStart = now - config.windowMs
  
  let clientInfo = clients.get(clientId)
  
  if (!clientInfo || clientInfo.firstRequest < windowStart) {
    // 新客户端或窗口已过期
    clientInfo = {
      count: 1,
      firstRequest: now,
      lastRequest: now,
      blocked: false
    }
    clients.set(clientId, clientInfo)
    return { allowed: true, info: clientInfo }
  }
  
  // 更新最后请求时间
  clientInfo.lastRequest = now
  clientInfo.count++
  
  // 检查是否超过限制
  if (clientInfo.count > config.maxRequests) {
    clientInfo.blocked = true
    clients.set(clientId, clientInfo)
    return { allowed: false, info: clientInfo }
  }
  
  clients.set(clientId, clientInfo)
  return { allowed: true, info: clientInfo }
}

// 限流中间件
export default defineEventHandler(async (event) => {
  const path = event.node.req.url || ''
  const method = event.node.req.method || 'GET'
  
  // 跳过某些请求
  if (method === 'OPTIONS') return
  if (path.startsWith('/favicon.ico')) return
  if (path.startsWith('/.well-known/')) return
  
  const config = getRateLimitConfig(path)
  const clientId = getClientId(event)
  
  // 启动清理定时器
  startCleanupTimer()
  
  // 白名单检查
  if (isWhitelisted(clientId)) {
    return
  }
  
  // 执行限流检查
  const { allowed, info } = checkRateLimit(clientId, config)
  
  // 设置限流头部
  if (config.headers) {
    const remainingRequests = Math.max(0, config.maxRequests - info.count)
    const resetTime = new Date(info.firstRequest + config.windowMs)
    
    event.node.res.setHeader('X-RateLimit-Limit', config.maxRequests.toString())
    event.node.res.setHeader('X-RateLimit-Remaining', remainingRequests.toString())
    event.node.res.setHeader('X-RateLimit-Reset', resetTime.toISOString())
    event.node.res.setHeader('X-RateLimit-Window', (config.windowMs / 1000).toString())
  }
  
  if (!allowed) {
    // 记录限流事件
    console.warn(`[RateLimit] Client ${clientId} blocked for path ${path}. Count: ${info.count}/${config.maxRequests}`)
    
    // 设置Retry-After头部
    const retryAfter = Math.ceil((info.firstRequest + config.windowMs - Date.now()) / 1000)
    event.node.res.setHeader('Retry-After', retryAfter.toString())
    
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: {
        message: config.message,
        retryAfter: retryAfter,
        limit: config.maxRequests,
        window: config.windowMs / 1000
      }
    })
  }
  
  return
})

// 导出清理函数用于测试或手动调用
export { stopCleanupTimer, cleanupExpiredClients, clients }