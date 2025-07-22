// JCSKI Blog 字体优化插件 - v0.5.0
// 客户端字体加载优化和性能监控

export default defineNuxtPlugin(() => {
  // 只在客户端运行
  if (process.server) return

  // 字体加载状态管理
  const fontLoadingStates = {
    'Special Gothic Expanded One': false,
    'Noto Sans SC': false,
    'Noto Sans JP': false
  }

  // 检测字体加载完成
  const checkFontLoaded = (fontFamily: string): Promise<boolean> => {
    if (!('fonts' in document)) {
      // 回退：如果不支持Font Loading API
      return Promise.resolve(true)
    }

    return document.fonts.ready.then(() => {
      const fonts = document.fonts
      for (const font of fonts) {
        if (font.family === fontFamily && font.status === 'loaded') {
          return true
        }
      }
      return false
    }).catch(() => false)
  }

  // 优化字体显示
  const optimizeFontDisplay = () => {
    const body = document.body
    
    // 添加字体加载状态类
    body.classList.add('fonts-loading')
    
    // 检查关键字体
    Promise.all([
      checkFontLoaded('Special Gothic Expanded One'),
      checkFontLoaded('Noto Sans SC'),
      checkFontLoaded('Noto Sans JP')
    ]).then(results => {
      const [specialGothic, notoSC, notoJP] = results
      
      // 更新加载状态
      fontLoadingStates['Special Gothic Expanded One'] = specialGothic
      fontLoadingStates['Noto Sans SC'] = notoSC
      fontLoadingStates['Noto Sans JP'] = notoJP
      
      // 所有关键字体加载完成
      if (specialGothic) {
        body.classList.remove('fonts-loading')
        body.classList.add('fonts-loaded')
        
        // 提供给性能监控
        if ('performance' in window && 'mark' in performance) {
          performance.mark('fonts-loaded')
        }
      }
    }).catch(error => {
      console.warn('Font loading check failed:', error)
      // 失败时仍然移除loading状态
      body.classList.remove('fonts-loading')
      body.classList.add('fonts-fallback')
    })
  }

  // 预加载关键字体文件
  const preloadCriticalFonts = () => {
    const fontFiles = [
      // 根据Google Fonts生成的实际路径调整
      '/fonts/Special_Gothic_Expanded_One-normal-400-latin.woff2',
      '/fonts/Noto_Sans_SC-normal-400-latin.woff2',
      '/fonts/Noto_Sans_JP-normal-400-latin.woff2'
    ]

    fontFiles.forEach(fontUrl => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = fontUrl
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      
      // 避免重复添加
      if (!document.querySelector(`link[href="${fontUrl}"]`)) {
        document.head.appendChild(link)
      }
    })
  }

  // 字体性能监控
  const monitorFontPerformance = () => {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'resource' && entry.name.includes('font')) {
            // 记录字体加载性能
            console.debug('Font loaded:', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize
            })
          }
        })
      })
      
      observer.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.debug('Font performance monitoring failed:', error)
    }
  }

  // Emoji优化 - 确保emoji正确渲染
  const optimizeEmojis = () => {
    // 为emoji元素添加优化类
    const emojiElements = document.querySelectorAll('span, div, p')
    emojiElements.forEach(element => {
      if (/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(element.textContent || '')) {
        element.classList.add('emoji-icon')
      }
    })
  }

  // 初始化优化
  const initFontOptimization = () => {
    // DOM准备好后执行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        optimizeFontDisplay()
        preloadCriticalFonts()
        monitorFontPerformance()
        optimizeEmojis()
      })
    } else {
      // DOM已经准备好
      optimizeFontDisplay()
      preloadCriticalFonts()
      monitorFontPerformance()
      optimizeEmojis()
    }
  }

  // 启动优化
  initFontOptimization()

  // 导出字体状态供其他组件使用
  return {
    provide: {
      fontLoadingStates: readonly(ref(fontLoadingStates)),
      isFontLoaded: (fontFamily: string) => fontLoadingStates[fontFamily] || false
    }
  }
})