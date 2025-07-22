// JCSKI Blog 关键资源预加载组合函数 - v0.5.0 步骤17
// 为页面组件提供预加载功能

export const useCriticalPreload = () => {
  // 页面特定的关键资源配置
  const pageResources = {
    home: {
      styles: [
        '/_nuxt/index.B1zBKpVU.css',
        '/_nuxt/components.0VyAq_zM.css'
      ],
      images: [
        '/images/hero-bg.jpg',
        '/images/default-tech.jpg',
        '/images/default-music.jpg'
      ]
    },
    music: {
      styles: ['/_nuxt/music.h1htx1cO.css'],
      images: ['/images/music-hero.jpg']
    },
    tech: {
      styles: ['/_nuxt/tech.BtAgJstP.css'],
      images: ['/images/tech-hero.jpg']
    },
    skiing: {
      styles: ['/_nuxt/skiing.e6d2_FI9.css'],
      images: ['/images/skiing-hero.jpg']
    },
    fishing: {
      styles: ['/_nuxt/fishing.1fuY5MVu.css'],
      images: ['/images/fishing-hero.jpg']
    },
    about: {
      styles: ['/_nuxt/about.GwBPVRST.css'],
      images: ['/images/about-avatar.jpg']
    },
    contact: {
      styles: ['/_nuxt/contact.DCmpbtIr.css']
    },
    post: {
      styles: ['/_nuxt/_slug_.Db3MRNm2.css']
    },
    category: {
      styles: ['/_nuxt/_category_.DykgAv5w.css']
    }
  }

  // 预加载页面特定资源
  const preloadPageResources = (pageName: keyof typeof pageResources) => {
    if (process.server) return

    const resources = pageResources[pageName]
    if (!resources) return

    // 预加载样式
    resources.styles?.forEach(href => {
      preloadStylesheet(href)
    })

    // 预加载图片
    resources.images?.forEach((href: string) => {
      preloadImage(href)
    })
  }

  // 预加载样式表
  const preloadStylesheet = (href: string) => {
    if (process.server) return
    
    // 检查是否已经存在
    if (document.querySelector(`link[href="${href}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = 'style'
    link.onload = function(this: HTMLLinkElement) {
      this.onload = null
      this.rel = 'stylesheet'
    }
    
    document.head.appendChild(link)
    console.debug(`[useCriticalPreload] Preloaded stylesheet: ${href}`)
  }

  // 预加载图片
  const preloadImage = (href: string) => {
    if (process.server) return
    
    // 检查是否已经存在
    if (document.querySelector(`link[href="${href}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = 'image'
    
    document.head.appendChild(link)
    console.debug(`[useCriticalPreload] Preloaded image: ${href}`)
  }

  // 预加载脚本（模块）
  const preloadScript = (href: string) => {
    if (process.server) return
    
    if (document.querySelector(`link[href="${href}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = href
    
    document.head.appendChild(link)
    console.debug(`[useCriticalPreload] Preloaded script: ${href}`)
  }

  // prefetch资源（低优先级）
  const prefetchResource = (href: string) => {
    if (process.server) return
    
    if (document.querySelector(`link[href="${href}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    
    document.head.appendChild(link)
    console.debug(`[useCriticalPreload] Prefetched: ${href}`)
  }

  // 预连接到外部域名
  const preconnectDomain = (domain: string, crossorigin = false) => {
    if (process.server) return
    
    if (document.querySelector(`link[href="${domain}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    
    if (crossorigin) {
      link.crossOrigin = 'anonymous'
    }
    
    document.head.appendChild(link)
    console.debug(`[useCriticalPreload] Preconnected: ${domain}`)
  }

  // DNS预解析
  const dnsPrefetch = (domain: string) => {
    if (process.server) return
    
    if (document.querySelector(`link[href="${domain}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    
    document.head.appendChild(link)
    console.debug(`[useCriticalPreload] DNS prefetched: ${domain}`)
  }

  // 基于用户交互的智能预加载
  const setupInteractionPreload = () => {
    if (process.server) return

    // 监听导航链接的hover事件
    const setupLinkHover = () => {
      const links = document.querySelectorAll('a[href^="/"]')
      
      links.forEach(link => {
        let timeoutId: NodeJS.Timeout
        let preloaded = false
        
        link.addEventListener('mouseenter', () => {
          if (preloaded) return
          
          // 延迟100ms，避免快速滑过时的误触发
          timeoutId = setTimeout(() => {
            const href = link.getAttribute('href')
            if (href) {
              prefetchPageForHref(href)
              preloaded = true
            }
          }, 100)
        })
        
        link.addEventListener('mouseleave', () => {
          clearTimeout(timeoutId)
        })
      })
    }

    // 当DOM准备好时设置
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupLinkHover)
    } else {
      setupLinkHover()
    }
  }

  // 根据href预加载页面资源
  const prefetchPageForHref = (href: string) => {
    // 解析路径确定页面类型
    if (href === '/' || href === '') {
      prefetchResource('/_nuxt/index.B1zBKpVU.css')
    } else if (href.startsWith('/music')) {
      prefetchResource('/_nuxt/music.h1htx1cO.css')
    } else if (href.startsWith('/tech')) {
      prefetchResource('/_nuxt/tech.BtAgJstP.css')
    } else if (href.startsWith('/skiing')) {
      prefetchResource('/_nuxt/skiing.e6d2_FI9.css')
    } else if (href.startsWith('/fishing')) {
      prefetchResource('/_nuxt/fishing.1fuY5MVu.css')
    } else if (href.startsWith('/about')) {
      prefetchResource('/_nuxt/about.GwBPVRST.css')
    } else if (href.startsWith('/contact')) {
      prefetchResource('/_nuxt/contact.DCmpbtIr.css')
    } else if (href.startsWith('/posts/')) {
      prefetchResource('/_nuxt/_slug_.Db3MRNm2.css')
    } else if (href.startsWith('/category/')) {
      prefetchResource('/_nuxt/_category_.DykgAv5w.css')
    }
  }

  // 获取当前页面类型
  const getCurrentPageType = (): keyof typeof pageResources => {
    if (process.server) return 'home'
    
    const path = window.location.pathname
    
    if (path === '/' || path === '') return 'home'
    if (path.startsWith('/music')) return 'music'
    if (path.startsWith('/tech')) return 'tech'
    if (path.startsWith('/skiing')) return 'skiing'
    if (path.startsWith('/fishing')) return 'fishing'
    if (path.startsWith('/about')) return 'about'
    if (path.startsWith('/contact')) return 'contact'
    if (path.startsWith('/posts/')) return 'post'
    if (path.startsWith('/category/')) return 'category'
    
    return 'home'
  }

  // 自动预加载当前页面资源
  const autoPreloadCurrentPage = () => {
    const pageType = getCurrentPageType()
    preloadPageResources(pageType)
  }

  // 返回所有功能
  return {
    // 核心功能
    preloadPageResources,
    preloadStylesheet,
    preloadImage,
    preloadScript,
    prefetchResource,
    
    // 网络优化
    preconnectDomain,
    dnsPrefetch,
    
    // 智能预加载
    setupInteractionPreload,
    prefetchPageForHref,
    
    // 工具函数
    getCurrentPageType,
    autoPreloadCurrentPage,
    
    // 页面资源配置
    pageResources
  }
}