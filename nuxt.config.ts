export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxt/content',
    '@nuxtjs/google-fonts'
  ],
  css: [
    '~/assets/css/critical.css',
    '~/assets/css/main.css'
  ],
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