export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/content'
  ],
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 3003
  },
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Special+Gothic+Expanded+One&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap'
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
