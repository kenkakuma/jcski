// JCSKI Blog 动态预加载插件 - v0.5.0 步骤17
// 处理动态文件名的关键资源预加载

export default defineNuxtPlugin(() => {
  // 只在客户端运行
  if (process.server) return

  // 从manifest获取实际的文件名
  const getCriticalResources = async () => {
    try {
      // 获取Nuxt构建的manifest
      const response = await fetch('/_nuxt/manifest.json')
      const manifest = await response.json()
      
      // 从manifest中提取关键资源
      const entryCSS = Object.values(manifest).find(entry => 
        typeof entry === 'string' && entry.includes('entry') && entry.endsWith('.css')
      )
      
      const indexCSS = Object.values(manifest).find(entry =>
        typeof entry === 'string' && entry.includes('index') && entry.endsWith('.css') 
      )
      
      const componentsCSS = Object.values(manifest).find(entry =>
        typeof entry === 'string' && entry.includes('components') && entry.endsWith('.css')
      )
      
      return {
        entryCSS,
        indexCSS,
        componentsCSS
      }
    } catch (error) {
      console.debug('[Dynamic Preload] Failed to load manifest:', error)
      return {
        entryCSS: undefined,
        indexCSS: undefined,
        componentsCSS: undefined
      }
    }
  }

  // 预加载关键CSS资源
  const preloadCriticalCSS = async () => {
    const resources = await getCriticalResources()
    
    if (resources.entryCSS) {
      createPreloadLink(resources.entryCSS, 'style')
    }
    
    // 只在首页预加载首页特定CSS
    if ((window.location.pathname === '/' || window.location.pathname === '') && resources.indexCSS) {
      createPreloadLink(resources.indexCSS, 'style')
    }
    
    if (resources.componentsCSS) {
      createPreloadLink(resources.componentsCSS, 'style')
    }
  }

  // 创建预加载链接
  const createPreloadLink = (href: string, as: string, type?: string) => {
    // 确保链接以/_nuxt/开头
    const fullHref = href.startsWith('/_nuxt/') ? href : `/_nuxt/${href}`
    
    // 检查是否已经存在
    if (document.querySelector(`link[href="${fullHref}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = fullHref
    link.as = as
    
    if (type) {
      link.type = type
    }
    
    // 对于CSS，添加onload处理使其实际生效
    if (as === 'style') {
      link.onload = function(this: HTMLLinkElement) {
        this.onload = null
        this.rel = 'stylesheet'
      }
    }
    
    document.head.appendChild(link)
    
    console.debug(`[Dynamic Preload] Added: ${fullHref}`)
  }

  // 基于用户行为的智能prefetch
  const setupIntelligentPrefetch = () => {
    // 鼠标悬停在导航链接上时prefetch页面资源
    const navLinks = document.querySelectorAll('a[href^="/"]')
    
    navLinks.forEach(link => {
      let prefetched = false
      
      link.addEventListener('mouseenter', () => {
        if (!prefetched) {
          const href = link.getAttribute('href')
          if (href) {
            prefetchPageResources(href)
            prefetched = true
          }
        }
      })
    })
  }

  // prefetch页面特定资源
  const prefetchPageResources = (path: string) => {
    const prefetchLink = (href: string) => {
      if (document.querySelector(`link[href="${href}"]`)) {
        return
      }
      
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      document.head.appendChild(link)
    }

    // 根据路径prefetch相应的CSS
    switch (path) {
      case '/music':
        prefetchLink('/_nuxt/music.h1htx1cO.css')
        break
      case '/tech':
        prefetchLink('/_nuxt/tech.BtAgJstP.css')
        break
      case '/skiing':
        prefetchLink('/_nuxt/skiing.e6d2_FI9.css')
        break
      case '/fishing':
        prefetchLink('/_nuxt/fishing.1fuY5MVu.css')
        break
      case '/about':
        prefetchLink('/_nuxt/about.GwBPVRST.css')
        break
      case '/contact':
        prefetchLink('/_nuxt/contact.DCmpbtIr.css')
        break
    }
  }

  // 滚动时预加载可见内容的资源
  const setupScrollPreload = () => {
    let scrollTimer: NodeJS.Timeout
    
    const handleScroll = () => {
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        // 检查是否接近页面底部
        const scrollPosition = window.scrollY + window.innerHeight
        const pageHeight = document.documentElement.scrollHeight
        
        if (scrollPosition > pageHeight * 0.7) {
          // 接近页面底部时，预加载更多资源
          prefetchAdditionalResources()
        }
      }, 100)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimer)
    }
  }

  // 预加载额外资源
  const prefetchAdditionalResources = () => {
    const additionalResources = [
      '/_nuxt/_category_.DykgAv5w.css',
      '/_nuxt/_slug_.Db3MRNm2.css'
    ]
    
    additionalResources.forEach(resource => {
      createPrefetchLink(resource)
    })
  }

  // 创建prefetch链接
  const createPrefetchLink = (href: string) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      return
    }
    
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
    
    console.debug(`[Dynamic Preload] Prefetched: ${href}`)
  }

  // 网络状态监听
  const setupNetworkAwarePreload = () => {
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (connection) {
      const handleConnectionChange = () => {
        if (connection.effectiveType === '4g' && connection.downlink > 2) {
          // 快速连接，积极预加载
          console.debug('[Dynamic Preload] Fast connection detected, aggressive preloading')
          prefetchAdditionalResources()
        } else {
          // 慢速连接，保守预加载
          console.debug('[Dynamic Preload] Slow connection detected, conservative preloading')
        }
      }
      
      connection.addEventListener('change', handleConnectionChange)
      handleConnectionChange() // 初始检查
    }
  }

  // 初始化动态预加载
  const initDynamicPreload = () => {
    // 立即预加载关键CSS
    preloadCriticalCSS()
    
    // DOM准备后设置其他功能
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setupIntelligentPrefetch()
        setupScrollPreload()
        setupNetworkAwarePreload()
      })
    } else {
      setupIntelligentPrefetch()
      setupScrollPreload()  
      setupNetworkAwarePreload()
    }
  }

  // 启动动态预加载
  initDynamicPreload()

  return {
    provide: {
      dynamicPreload: {
        preloadCriticalCSS,
        prefetchPageResources,
        createPreloadLink
      }
    }
  }
})