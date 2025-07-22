// JCSKI Blog 安全中间件 - v0.5.0 步骤19
// 实现基础安全配置，包括CSP、CORS、安全头部等
// 针对AWS EC2生产环境优化

import { defineEventHandler, getHeader, setHeaders } from 'h3'

interface SecurityConfig {
  // CSP 配置
  csp: {
    defaultSrc: string[]
    scriptSrc: string[]
    styleSrc: string[]
    imgSrc: string[]
    fontSrc: string[]
    connectSrc: string[]
    mediaSrc: string[]
    objectSrc: string[]
    frameSrc: string[]
    childSrc: string[]
    workerSrc: string[]
  }
  // CORS 配置
  cors: {
    allowedOrigins: string[]
    allowedMethods: string[]
    allowedHeaders: string[]
    maxAge: number
  }
  // 安全头部
  headers: {
    hsts: boolean
    nosniff: boolean
    xframe: string
    xss: boolean
    referrer: string
  }
}

// 生产环境和开发环境的安全配置
const getSecurityConfig = (): SecurityConfig => {
  const isProduction = process.env.NODE_ENV === 'production'
  const baseUrl = process.env.BASE_URL || 'http://localhost:3003'
  const domain = isProduction ? 'jcski.com' : 'localhost:3003'
  
  return {
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Nuxt需要内联脚本
        "'unsafe-eval'",   // 开发模式需要
        "https://fonts.googleapis.com",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        ...(isProduction ? [] : ["'unsafe-eval'", "http://localhost:*"])
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // 样式内联是必要的
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "http:", // 开发环境允许HTTP图片
        `https://${domain}`,
        ...(isProduction ? [] : ["http://localhost:*"])
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com",
        `https://${domain}`
      ],
      connectSrc: [
        "'self'",
        `https://${domain}`,
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        ...(isProduction ? [] : [
          "http://localhost:*",
          "ws://localhost:*", // HMR WebSocket
          "wss://localhost:*"
        ])
      ],
      mediaSrc: [
        "'self'",
        "data:",
        "blob:",
        `https://${domain}`
      ],
      objectSrc: ["'none'"],
      frameSrc: [
        "'self'",
        // 如果需要嵌入外部内容，在这里添加
      ],
      childSrc: ["'self'"],
      workerSrc: [
        "'self'",
        "blob:"
      ]
    },
    cors: {
      allowedOrigins: isProduction 
        ? [`https://${domain}`, `https://www.${domain}`]
        : ['http://localhost:3003', 'http://localhost:3000', 'http://127.0.0.1:3003'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-CSRF-Token',
        'X-Requested-With',
        'Cache-Control'
      ],
      maxAge: 86400 // 24小时
    },
    headers: {
      hsts: isProduction, // 仅生产环境启用HSTS
      nosniff: true,
      xframe: 'DENY',
      xss: true,
      referrer: 'strict-origin-when-cross-origin'
    }
  }
}

// 构建CSP字符串
const buildCSPString = (csp: SecurityConfig['csp']): string => {
  const directives: string[] = []
  
  // 遍历所有CSP指令
  Object.entries(csp).forEach(([directive, sources]) => {
    if (sources && sources.length > 0) {
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase()
      directives.push(`${kebabDirective} ${sources.join(' ')}`)
    }
  })
  
  return directives.join('; ')
}

// 检查CORS来源
const isAllowedOrigin = (origin: string | undefined, allowedOrigins: string[]): boolean => {
  if (!origin) return true // 同源请求
  
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true
    if (allowed === origin) return true
    
    // 支持通配符子域名
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2)
      return origin.endsWith(domain)
    }
    
    return false
  })
}

// 安全中间件主函数
export default defineEventHandler(async (event) => {
  const config = getSecurityConfig()
  const origin = getHeader(event, 'origin')
  const method = event.node.req.method?.toUpperCase()
  
  // 设置基础安全头部
  const securityHeaders: Record<string, string> = {}
  
  // Content Security Policy
  const cspString = buildCSPString(config.csp)
  securityHeaders['Content-Security-Policy'] = cspString
  
  // CORS 处理
  if (isAllowedOrigin(origin, config.cors.allowedOrigins)) {
    securityHeaders['Access-Control-Allow-Origin'] = origin || '*'
    securityHeaders['Access-Control-Allow-Credentials'] = 'true'
  }
  
  if (method === 'OPTIONS') {
    // 预检请求处理
    securityHeaders['Access-Control-Allow-Methods'] = config.cors.allowedMethods.join(', ')
    securityHeaders['Access-Control-Allow-Headers'] = config.cors.allowedHeaders.join(', ')
    securityHeaders['Access-Control-Max-Age'] = config.cors.maxAge.toString()
    
    setHeaders(event, securityHeaders)
    return new Response(null, { 
      status: 204,
      headers: securityHeaders 
    })
  }
  
  // 其他安全头部
  if (config.headers.hsts) {
    securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }
  
  if (config.headers.nosniff) {
    securityHeaders['X-Content-Type-Options'] = 'nosniff'
  }
  
  securityHeaders['X-Frame-Options'] = config.headers.xframe
  
  if (config.headers.xss) {
    securityHeaders['X-XSS-Protection'] = '1; mode=block'
  }
  
  securityHeaders['Referrer-Policy'] = config.headers.referrer
  
  // 移除潜在的敏感信息头部
  securityHeaders['X-Powered-By'] = '' // 移除Express/Node.js版本信息
  securityHeaders['Server'] = 'JCSKI-Blog' // 自定义服务器标识
  
  // 设置安全cookie配置（如果有cookie）
  if (process.env.NODE_ENV === 'production') {
    securityHeaders['Set-Cookie-Secure'] = 'true'
    securityHeaders['Set-Cookie-SameSite'] = 'Strict'
  }
  
  // 应用所有安全头部
  setHeaders(event, securityHeaders)
  
  // 记录安全相关事件（生产环境）
  if (process.env.NODE_ENV === 'production' && origin && !isAllowedOrigin(origin, config.cors.allowedOrigins)) {
    console.warn(`[Security] Blocked request from unauthorized origin: ${origin}`)
  }
  
  // 继续处理请求
  return
})