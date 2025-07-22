#!/bin/bash

# 重新启动JCSKI Blog PM2应用

echo "🔄 检查并重启PM2应用..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'PM2_EOF'
echo "📊 当前PM2状态:"
pm2 status

echo "🛑 停止旧应用..."
pm2 stop all || echo "没有运行的应用"
pm2 delete all || echo "没有要删除的应用"

echo "📁 进入项目目录..."
cd /var/www/jcski-blog

echo "🚀 启动应用..."
pm2 start ecosystem.config.js
pm2 save

echo "⏳ 等待应用启动..."
sleep 10

echo "📊 检查应用状态..."
pm2 status
pm2 logs jcski-blog --lines 10

PM2_EOF

echo "🔍 验证应用是否正常运行..."
sleep 5
curl -I "https://jcski.com/"

echo "✅ PM2应用重启完成"