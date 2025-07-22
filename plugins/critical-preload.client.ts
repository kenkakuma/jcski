// JCSKI Blog 关键资源预加载插件 - v0.5.0 步骤17
// 客户端关键资源预加载优化

export default defineNuxtPlugin(() => {
  // 只在客户端运行
  if (process.server) return

  // 关键资源配置
  const criticalResources = {
    // 首页关键CSS
    styles: [
      '/_nuxt/entry.C6p_BC94.css',           // 主要样式文件
      '/_nuxt/index.B1zBKpVU.css',          // 首页样式  
      '/_nuxt/components.0VyAq_zM.css'      // 组件样式
    ],
    // 关键JavaScript
    scripts: [
      '/_nuxt/DXoKpSjT.js',                 // 主要脚本文件
      '/_nuxt/hbq1yEjU.js',                 // vendor chunk
      '/_nuxt/Cywg8Glq.js'                  // 核心组件
    ],
    // 图片资源
    images: [
      '/images/hero-bg.jpg',                // Hero背景图片
      '/images/default-tech.jpg',           // 默认TECH图片
      '/images/default-music.jpg',          // 默认MUSIC图片
      '/images/default-lifestyle.jpg'       // 默认LIFESTYLE图片
    ]
  }

  // 预加载资源函数
  const preloadResource = (href: string, as: string, type?: string, crossorigin?: string) => {
    // 避免重复添加
    if (document.querySelector(`link[href="${href}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    
    if (type) link.setAttribute('type', type)
    if (crossorigin) link.crossOrigin = crossorigin
    
    // 添加到head
    document.head.appendChild(link)
    
    // 调试日志
    console.debug(`[Critical Preload] ${as}: ${href}`)
  }

  // prefetch资源函数（低优先级资源）
  const prefetchResource = (href: string) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    
    document.head.appendChild(link)
    console.debug(`[Critical Prefetch] ${href}`)
  }

  // modulepreload函数（ES模块预加载）
  const modulePreload = (href: string) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = href
    
    document.head.appendChild(link)
    console.debug(`[Module Preload] ${href}`)
  }

  // 获取当前路由信息
  const getCurrentRoute = () => {
    return window.location.pathname
  }

  // 基于路由的智能预加载
  const intelligentPreload = () => {
    const route = getCurrentRoute()
    
    // 首页特殊处理
    if (route === '/' || route === '') {
      // 预加载首页关键资源
      criticalResources.styles.forEach(href => {
        preloadResource(href, 'style', 'text/css')
      })

      // 预加载关键脚本
      criticalResources.scripts.forEach(href => {
        modulePreload(href)
      })

      // 预加载Hero图片
      if (criticalResources.images.length > 0) {
        preloadResource(criticalResources.images[0], 'image', 'image/jpeg')
      }

      // prefetch子页面资源
      setTimeout(() => {
        prefetchResource('/_nuxt/music.h1htx1cO.css')
        prefetchResource('/_nuxt/tech.BtAgJstP.css')
        prefetchResource('/_nuxt/skiing.e6d2_FI9.css')
        prefetchResource('/_nuxt/fishing.1fuY5MVu.css')
      }, 2000)
    }
    
    // 子页面处理
    else if (route.startsWith('/music')) {
      preloadResource('/_nuxt/music.h1htx1cO.css', 'style', 'text/css')
    }
    else if (route.startsWith('/tech')) {
      preloadResource('/_nuxt/tech.BtAgJstP.css', 'style', 'text/css')
    }
    else if (route.startsWith('/skiing')) {
      preloadResource('/_nuxt/skiing.e6d2_FI9.css', 'style', 'text/css')
    }
    else if (route.startsWith('/fishing')) {
      preloadResource('/_nuxt/fishing.1fuY5MVu.css', 'style', 'text/css')
    }
    else if (route.startsWith('/about')) {
      preloadResource('/_nuxt/about.GwBPVRST.css', 'style', 'text/css')
    }
    else if (route.startsWith('/posts/')) {
      preloadResource('/_nuxt/_slug_.Db3MRNm2.css', 'style', 'text/css')
    }
  }

  // 网络状态感知
  const isSlowConnection = () => {
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (!connection) return false
    
    // 2G或更慢的连接
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
  }

  // 内存状态感知
  const isLowMemory = () => {
    // @ts-ignore
    const memory = navigator.deviceMemory
    
    if (!memory) return false
    
    // 少于2GB内存
    return memory < 2
  }

  // 自适应预加载策略
  const adaptivePreload = () => {
    const slowConnection = isSlowConnection()
    const lowMemory = isLowMemory()

    if (slowConnection || lowMemory) {
      // 慢速连接或低内存设备，只预加载最关键的资源
      console.debug('[Critical Preload] Adaptive mode: limited preloading')
      
      // 只预加载最关键的CSS
      preloadResource('/_nuxt/entry.C6p_BC94.css', 'style', 'text/css')
      
      if (getCurrentRoute() === '/' || getCurrentRoute() === '') {
        preloadResource('/_nuxt/index.B1zBKpVU.css', 'style', 'text/css')
      }
    } else {
      // 正常设备，执行完整预加载
      intelligentPreload()
    }
  }

  // Intersection Observer API - 视窗内容预加载
  const setupViewportPreload = () => {
    if (!('IntersectionObserver' in window)) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target
          
          // 根据元素的数据属性预加载资源
          const preloadHref = element.getAttribute('data-preload')
          const preloadAs = element.getAttribute('data-preload-as')
          
          if (preloadHref && preloadAs) {
            preloadResource(preloadHref, preloadAs)
            observer.unobserve(element)
          }
        }
      })
    }, {
      rootMargin: '50px'  // 提前50px开始预加载
    })

    // 观察需要预加载的元素
    document.querySelectorAll('[data-preload]').forEach(element => {
      observer.observe(element)
    })
  }

  // 性能监控
  const monitorPreloadPerformance = () => {
    if (!('performance' in window) || !('getEntriesByType' in performance)) {
      return
    }

    // 监控资源加载性能
    const resourceEntries = performance.getEntriesByType('resource')
    const preloadedResources = resourceEntries.filter(entry => 
      entry.name.includes('_nuxt') && 
      (entry.name.includes('.css') || entry.name.includes('.js'))
    )

    if (preloadedResources.length > 0) {
      console.debug('[Critical Preload] Performance metrics:', {
        count: preloadedResources.length,
        totalTime: preloadedResources.reduce((sum, entry) => sum + entry.duration, 0),
        avgTime: preloadedResources.reduce((sum, entry) => sum + entry.duration, 0) / preloadedResources.length
      })
    }
  }

  // 初始化预加载
  const initCriticalPreload = () => {
    // 等待DOM准备
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        adaptivePreload()
        setupViewportPreload()
        
        // 延迟监控性能
        setTimeout(monitorPreloadPerformance, 3000)
      })
    } else {
      // DOM已经准备好
      adaptivePreload()
      setupViewportPreload()
      
      setTimeout(monitorPreloadPerformance, 3000)
    }
  }

  // 启动关键资源预加载
  initCriticalPreload()

  // 导出工具函数
  return {
    provide: {
      criticalPreload: {
        preloadResource,
        prefetchResource,
        modulePreload,
        getCurrentRoute
      }
    }
  }
})