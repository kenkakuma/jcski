#!/bin/bash

echo "🔄 完整恢复v0.4.9稳定版本的JCSKI Blog..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'RESTORE_V049_EOF'
cd /var/www/jcski-blog

echo "🛑 停止所有服务..."
pkill -9 -f node 2>/dev/null || echo "没有Node进程"
pkill -9 -f python3 2>/dev/null || echo "没有Python进程"

echo "🔄 回滚到v0.4.9稳定版本..."
git reset --hard ca4330c

echo "📋 检查回滚状态..."
git log --oneline -3
ls -la pages/index.vue assets/css/main.css

echo "🔧 使用最基础Nuxt配置..."
cat > nuxt.config.v049.ts << 'V049_CONFIG_EOF'
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxt/content'
  ],
  css: [
    '~/assets/css/main.css'
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
V049_CONFIG_EOF

echo "🚀 启动v0.4.9版本..."
NODE_ENV=development DATABASE_URL="file:/var/www/jcski-blog/prisma/dev.db" nohup npx nuxt dev --config nuxt.config.v049.ts --port 3222 --host 0.0.0.0 > /tmp/nuxt-v049.log 2>&1 &

echo "⏳ 等待应用启动..."
sleep 35

echo "📋 检查启动日志..."
tail -25 /tmp/nuxt-v049.log

echo "🔍 检查进程..."
ps aux | grep -E "(nuxt|node.*3222)" | grep -v grep | head -3

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

RESTORE_V049_EOF

echo "🔍 测试外部访问..."
sleep 8
curl -I "https://jcski.com/" | head -3

echo "✅ v0.4.9稳定版本恢复完成！"