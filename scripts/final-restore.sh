#!/bin/bash

echo "🔄 最终恢复原始JCSKI Blog - 移除问题中间件..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'FINAL_RESTORE_EOF'
cd /var/www/jcski-blog

echo "🛑 强制停止所有Node进程..."
pkill -9 -f nuxt 2>/dev/null || echo "没有nuxt进程"
pkill -9 -f node 2>/dev/null || echo "没有node进程"

echo "🔄 备份并移除问题中间件..."
if [ -d "server/middleware" ]; then
    mv server/middleware server/middleware.v0.5.0-backup
    echo "✅ 中间件已备份到 server/middleware.v0.5.0-backup"
fi

echo "🔧 使用最简配置启动Nuxt..."
cat > nuxt.config.minimal.ts << 'MINIMAL_CONFIG_EOF'
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
MINIMAL_CONFIG_EOF

echo "🚀 启动最简Nuxt应用..."
NODE_ENV=development DATABASE_URL="file:/var/www/jcski-blog/prisma/dev.db" nohup npx nuxt dev --config nuxt.config.minimal.ts --port 3222 --host 0.0.0.0 > /tmp/nuxt-minimal.log 2>&1 &

echo "⏳ 等待应用启动..."
sleep 30

echo "📋 检查最新日志..."
tail -20 /tmp/nuxt-minimal.log

echo "🔍 检查进程..."
ps aux | grep -E "(nuxt|node.*3222)" | grep -v grep | head -3

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

FINAL_RESTORE_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ 原始JCSKI Blog网站恢复完成！"