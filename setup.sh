#!/bin/bash

echo "🚀 JCSKI Blog v0.0.1 Setup"
echo "=========================="

# 清理旧的缓存
echo "🧹 Cleaning cache..."
rm -rf .nuxt .output node_modules package-lock.json

# 创建简化的package.json用于演示
echo "📦 Setting up minimal dependencies..."
cat > package.json << 'EOF'
{
  "name": "jcski-blog",
  "private": true,
  "version": "0.0.1",
  "description": "JCSKI Personal blog built with Nuxt 3",
  "scripts": {
    "dev": "nuxt dev --port 3001",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "devDependencies": {
    "nuxt": "^3.12.3"
  },
  "dependencies": {
    "@nuxt/content": "^2.13.1"
  }
}
EOF

# 创建简化的nuxt.config.ts
echo "⚙️ Creating Nuxt config..."
cat > nuxt.config.ts << 'EOF'
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/content'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3001'
    }
  }
})
EOF

echo "✅ Setup complete!"
echo ""
echo "📋 To run the project:"
echo "1. npm install"
echo "2. npm run dev"
echo "3. Open http://localhost:3001"
echo ""
echo "📱 Available pages:"
echo "- Homepage: http://localhost:3001"
echo "- Demo page: http://localhost:3001/demo"
echo "- Admin (mock): http://localhost:3001/admin/login"