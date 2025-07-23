#!/bin/bash

echo "🚀 最终修复部署 - 恢复JCSKI Blog网站..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'FINAL_FIX_EOF'
cd /var/www/jcski-blog

echo "🛑 停止所有进程..."
pkill -u ec2-user -f nuxt 2>/dev/null || echo "没有nuxt进程"
pkill -u ec2-user -f node 2>/dev/null || echo "没有node进程"

echo "📥 拉取最新代码..."
git pull origin main

echo "🔧 创建简化的nuxt配置（临时修复）..."
cat > nuxt.config.simple.ts << 'NUXT_CONFIG_EOF'
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxt/content'
  ],
  css: [
    '~/assets/css/main.css',
    '~/assets/css/subpage.css'
  ],
  devServer: {
    port: 3222,
    host: '0.0.0.0'
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'jcski-blog-super-secret-jwt-key-2025',
    public: {
      baseUrl: process.env.BASE_URL || 'https://jcski.com'
    }
  }
})
NUXT_CONFIG_EOF

echo "🌐 使用简化配置启动Nuxt开发服务器..."
NODE_ENV=development DATABASE_URL="file:/var/www/jcski-blog/prisma/dev.db" nohup npx nuxt dev --config nuxt.config.simple.ts --port 3222 --host 0.0.0.0 > /tmp/nuxt-simple.log 2>&1 &

echo "⏳ 等待服务器启动..."
sleep 25

echo "🔍 检查进程状态..."
ps aux | grep -E "(nuxt|node.*3222)" | grep -v grep | head -3

echo "📋 检查启动日志..."
tail -15 /tmp/nuxt-simple.log

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

FINAL_FIX_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ 部署修复完成！"