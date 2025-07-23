export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxtjs/google-fonts'
  ],
  // CSS optimizations
  css: [
    '~/assets/css/main.css',
    '~/assets/css/subpage.css',
    '~/assets/css/font-optimization.css',    // v0.5.0 字体和图标性能优化
    '~/assets/css/preload-optimization.css'  // v0.5.0 关键资源预加载优化
  ],
  // PostCSS optimizations
  postcss: {
    plugins: process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          discardEmpty: true,
          mergeRules: true,
          colormin: true,
          minifyFontValues: true,
          minifySelectors: true
        }]
      }
    } : {}
  },
  // Google Fonts optimization - v0.5.0 字体性能优化
  googleFonts: {
    families: {
      'Special Gothic Expanded One': true,
      'Noto Sans SC': [400, 700],
      'Noto Sans JP': [400, 700]
    },
    display: 'swap',           // 字体显示交换，避免FOIT(Flash of Invisible Text)
    download: true,            // 本地下载字体文件
    inject: true,              // 自动注入CSS
    overwriting: true,         // 覆盖现有字体配置
    stylePath: 'css/fonts.css',
    fontsDir: 'fonts',
    fontsPath: '/_nuxt/fonts',
    // 性能优化配置
    prefetch: false,           // 禁用预获取以节省带宽
    preconnect: false,         // 禁用预连接，已本地化
    preload: true,             // 启用关键字体预加载
    useStylesheet: false       // 使用@import而非link标签，减少关键渲染路径
  },
  // v0.5.0 内存和性能优化设置 - AWS EC2 t2.micro (1GB RAM)
  experimental: {
    payloadExtraction: false,     // 减少初始payload大小
    watcher: 'parcel',           // 使用更高效的文件监听器
    treeshakeClientOnly: true,   // 客户端代码tree-shaking
    emitRouteChunkError: 'manual' // 手动处理路由块错误
  },
  
  // 构建优化 - 内存使用优化
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,  // 提高chunk大小警告限制
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 手动分割chunks以减少内存使用
            if (id.includes('node_modules')) {
              return 'vendor'
            }
            if (id.includes('prisma') || id.includes('sqlite')) {
              return 'database'
            }
            if (id.includes('components')) {
              return 'components'
            }
            return null
          }
        }
      }
    },
    // 开发服务器内存优化
    server: {
      hmr: {
        overlay: false  // 禁用HMR overlay以节省内存
      }
    }
  },
  
  // Nitro 服务器优化
  nitro: {
    // 内存和性能优化配置
    experimental: {
      wasm: false  // 禁用WASM以节省内存
    },
    esbuild: {
      options: {
        target: 'es2020'  // 现代JavaScript目标以减少polyfill
      }
    },
    // 路由预渲染优化
    prerender: {
      crawlLinks: false,  // 禁用链接爬取以节省构建时间和内存
      routes: ['/sitemap.xml']  // 只预渲染必要路由
    }
  },
  
  // v0.5.0 服务器端中间件配置
  serverHandlers: [
    {
      route: '/**',
      middleware: '~/server/middleware/monitoring'
    },
    {
      route: '/api/**',
      middleware: '~/server/middleware/security'
    },
    {
      route: '/**',
      middleware: '~/server/middleware/ratelimit'
    }
  ],
  
  devServer: {
    port: 3003
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      // v0.5.0 关键资源预加载优化
      link: [
        // 关键字体预加载 (步骤16)
        {
          rel: 'preload',
          href: '/fonts/Special_Gothic_Expanded_One-normal-400-latin.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        },
        {
          rel: 'preload',
          href: '/fonts/Noto_Sans_SC-normal-400-latin.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        },
        // 关键CSS预加载 (步骤17)
        {
          rel: 'preload',
          href: '/_nuxt/entry.C6p_BC94.css',
          as: 'style',
          onload: "this.onload=null;this.rel='stylesheet'"
        },
        // DNS预连接优化
        {
          rel: 'dns-prefetch',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'dns-prefetch', 
          href: 'https://fonts.gstatic.com'
        }
      ]
    }
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'jcski-blog-super-secret-jwt-key-2025',
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3003'
    }
  }
})
