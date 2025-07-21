import { cache } from '~/lib/cache'

export default defineEventHandler(async (event) => {
  // 简单的开发环境检查
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found'
    })
  }

  const stats = cache.getStats()
  
  return {
    status: 'active',
    stats,
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage()
  }
})