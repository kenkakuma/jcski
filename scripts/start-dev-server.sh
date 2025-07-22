#!/bin/bash

echo "🚀 启动开发服务器模式..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'DEV_EOF'
cd /var/www/jcski-blog

echo "🛑 停止任何现有进程..."
pm2 kill 2>/dev/null || echo "PM2未运行"

# 杀死任何监听3222端口的进程
sudo netstat -tulpn | grep :3222 | awk '{print $7}' | cut -d/ -f1 | xargs -r sudo kill -9 2>/dev/null || echo "没有进程在3222端口"

echo "🔧 安装依赖..."
npm ci --production

echo "🌐 直接启动Nuxt开发服务器..."
NODE_ENV=production PORT=3222 nohup npm run dev > /tmp/jcski-dev.log 2>&1 &

echo "⏳ 等待服务器启动..."
sleep 15

echo "🔍 检查进程状态..."
ps aux | grep node | grep 3222 || echo "未找到Node进程"

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

DEV_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ 开发服务器启动完成！"