export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxt/content',
    '@nuxtjs/google-fonts'
  ],
  css: [
    '~/assets/css/critical.css',
    '~/assets/css/main.css',
    '~/assets/css/markdown.css'
  ],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
          integrity: 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==',
          crossorigin: 'anonymous'
        }
      ]
    }
  },
  googleFonts: {
    families: {
      'Special Gothic Expanded One': true,
      'Noto Sans SC': [400, 700],
      'Noto Sans JP': [400, 700]
    },
    display: 'swap',
    download: true
  },
  devServer: {
    port: 3003
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'jcski-blog-super-secret-jwt-key-2025',
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3003'
    }
  }
})