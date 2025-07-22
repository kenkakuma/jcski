#!/bin/bash

echo "🔍 检查PM2日志和状态..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'LOGS_EOF'
cd /var/www/jcski-blog

echo "📊 PM2状态详情:"
pm2 status

echo "📋 PM2错误日志:"
pm2 logs jcski-blog --err --lines 15

echo "📋 PM2输出日志:"
pm2 logs jcski-blog --out --lines 10

echo "🔍 检查端口占用:"
netstat -tulpn | grep 3222

echo "📝 检查.env.production文件:"
ls -la .env.production 2>/dev/null || echo ".env.production 文件不存在"

echo "📝 检查nuxt preview端口配置:"
cat package.json | grep -A5 -B5 preview

LOGS_EOF