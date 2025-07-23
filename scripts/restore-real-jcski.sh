#!/bin/bash

echo "🎯 恢复真正的JCSKI Blog设计 - 回滚到v0.4.x稳定版本..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'RESTORE_REAL_EOF'
cd /var/www/jcski-blog

echo "🛑 彻底停止所有进程..."
pkill -9 -f node 2>/dev/null || echo "没有Node进程"
pkill -9 -f nuxt 2>/dev/null || echo "没有Nuxt进程"
pkill -9 -f npm 2>/dev/null || echo "没有npm进程"

echo "🔄 完全重置到稳定版本..."
# 保存当前的图片系统升级代码
mkdir -p backup-v0.5.1
cp -r components/SmartImage.vue utils/media.ts components/ExternalImagePicker.vue components/RichTextEditor.vue backup-v0.5.1/ 2>/dev/null || true

# 硬重置到稳定的commit（图片升级前的版本）
git reset --hard c825824

echo "📋 检查重置后的状态..."
git status
ls -la pages/index.vue

echo "🔧 使用最基础配置启动..."
cat > nuxt.config.basic.ts << 'BASIC_CONFIG_EOF'
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
BASIC_CONFIG_EOF

echo "🚀 启动基础Nuxt应用..."
NODE_ENV=development DATABASE_URL="file:/var/www/jcski-blog/prisma/dev.db" nohup npx nuxt dev --config nuxt.config.basic.ts --port 3222 --host 0.0.0.0 > /tmp/nuxt-basic.log 2>&1 &

echo "⏳ 等待应用启动..."
sleep 30

echo "📋 检查启动日志..."
tail -20 /tmp/nuxt-basic.log

echo "🔍 检查进程..."
ps aux | grep -E "(nuxt|node.*3222)" | grep -v grep | head -3

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

RESTORE_REAL_EOF

echo "🔍 测试外部访问..."
sleep 8
curl -I "https://jcski.com/" | head -3

echo "✅ 真正的JCSKI Blog恢复完成！"