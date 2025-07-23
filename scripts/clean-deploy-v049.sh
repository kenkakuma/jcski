#!/bin/bash

echo "🧹 完全清理并重新部署v0.4.9版本..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'CLEAN_DEPLOY_EOF'
cd /var/www/jcski-blog

echo "🛑 彻底停止所有进程..."
pkill -9 -f node 2>/dev/null || echo "没有Node进程"

echo "🧹 彻底清理v0.5.0痕迹..."
rm -rf server/api/monitoring.v0.5.0-backup
rm -rf server/middleware.v0.5.0-backup
rm -rf plugins.v0.5.0-backup
rm -rf backup-v0.5.1
rm -f nuxt.config.*.ts
rm -f simple-server.js
rm -f temp-index.html

echo "🔄 强制重置到v0.4.9版本..."
git clean -fd
git reset --hard ca4330c

echo "🔧 创建最简Nuxt配置（v0.4.9兼容）..."
cat > nuxt.config.ts << 'SIMPLE_CONFIG_EOF'
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxt/content'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'jcski-blog-super-secret-jwt-key-2025',
    public: {
      baseUrl: process.env.BASE_URL || 'https://jcski.com'
    }
  }
})
SIMPLE_CONFIG_EOF

echo "📋 确认文件状态..."
ls -la pages/index.vue
head -10 pages/index.vue

echo "🚀 启动v0.4.9版本（端口3003）..."
NODE_ENV=development DATABASE_URL="file:/var/www/jcski-blog/prisma/dev.db" nohup npx nuxt dev --port 3003 --host 0.0.0.0 > /tmp/nuxt-v049-clean.log 2>&1 &

echo "⏳ 等待应用启动..."
sleep 30

echo "📋 检查启动日志..."
tail -20 /tmp/nuxt-v049-clean.log

echo "🌐 测试本地连接..."
curl -I http://localhost:3003/ | head -3

# 临时更新nginx配置指向3003端口
echo "🔧 临时更新nginx配置..."
sudo sed -i 's/proxy_pass http:\/\/localhost:3222;/proxy_pass http:\/\/localhost:3003;/g' /etc/nginx/conf.d/jcski-blog.conf
sudo systemctl reload nginx

CLEAN_DEPLOY_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ 清理部署完成！"