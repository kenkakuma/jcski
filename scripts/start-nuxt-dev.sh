#!/bin/bash

echo "🚀 启动JCSKI Blog Nuxt开发服务器..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'NUXT_EOF'
cd /var/www/jcski-blog

echo "🛑 停止现有服务..."
pkill -f python3 2>/dev/null || echo "没有Python服务"
pkill -f nuxt 2>/dev/null || echo "没有Nuxt服务"
pm2 kill 2>/dev/null || echo "没有PM2服务"

# 杀死3222端口进程
sudo netstat -tulpn | grep :3222 | awk '{print $7}' | cut -d/ -f1 | xargs -r sudo kill -9 2>/dev/null || echo "3222端口空闲"

echo "🔧 使用正确的环境变量启动Nuxt开发服务器..."
export NODE_ENV=production
export PORT=3222
export DATABASE_URL="file:/var/www/jcski-blog/prisma/dev.db" 
export JWT_SECRET="jcski-blog-production-super-secure-jwt-secret-2025"
export BASE_URL="https://jcski.com"

echo "🌐 在后台启动Nuxt开发服务器..."
nohup npm run dev -- --port 3222 > /tmp/nuxt-dev.log 2>&1 &

echo "⏳ 等待服务器启动..."
sleep 20

echo "🔍 检查进程状态..."
ps aux | grep -E "(nuxt|node.*3222)" | grep -v grep

echo "📋 检查日志..."
tail -10 /tmp/nuxt-dev.log

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

NUXT_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ Nuxt服务器启动完成！"