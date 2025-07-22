#!/bin/bash

echo "🚀 启动PM2应用 (最终版本)..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'FINAL_EOF'
cd /var/www/jcski-blog

echo "🛑 清理旧服务..."
# 杀死任何监听3222端口的进程
sudo netstat -tulpn | grep :3222 | awk '{print $7}' | cut -d/ -f1 | xargs -r sudo kill -9 2>/dev/null || echo "没有进程在3222端口"

echo "🗂️ 检查构建文件..."
ls -la .nuxt/dist/server/ | head -5

echo "📝 检查PM2配置..."
head -15 ecosystem.config.js

echo "🚀 启动PM2应用..."
pm2 start ecosystem.config.js

echo "⏳ 等待应用启动..."
sleep 15

echo "📊 检查PM2状态..."
pm2 status

echo "📋 保存PM2配置..."
pm2 save

echo "🔍 检查应用日志..."
pm2 logs jcski-blog --lines 10

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

FINAL_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ PM2应用启动完成！"