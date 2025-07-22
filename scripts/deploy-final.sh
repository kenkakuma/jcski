#!/bin/bash

echo "🚀 最终部署脚本 - 使用nuxt preview..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'DEPLOY_FINAL_EOF'
cd /var/www/jcski-blog

echo "📁 拉取最新代码..."
git pull origin main

echo "🛑 清理PM2进程..."
pm2 kill

echo "🚀 启动PM2应用 (使用nuxt preview)..."
pm2 start ecosystem.config.js

echo "⏳ 等待应用启动..."
sleep 20

echo "📊 检查PM2状态..."
pm2 status

echo "📋 保存PM2配置..."
pm2 save

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

DEPLOY_FINAL_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "🎉 最终部署完成！"