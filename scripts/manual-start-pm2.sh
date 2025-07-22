#!/bin/bash

echo "🔄 手动启动PM2应用..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'START_EOF'
cd /var/www/jcski-blog

echo "📁 检查构建输出目录:"
ls -la .output/server/

echo "📝 检查ecosystem配置文件:"
cat ecosystem.config.js | head -15

echo "🛑 清理PM2进程:"
pm2 kill || echo "PM2未运行"

echo "🚀 直接启动Nuxt应用:"
if [ -f ".output/server/server.mjs" ]; then
    echo "✅ 找到server.mjs文件"
    PORT=3222 NODE_ENV=production nohup node .output/server/server.mjs > server.log 2>&1 &
    echo "🎯 应用已在后台启动，端口3222"
else
    echo "❌ 找不到server.mjs文件"
    echo "📁 .output目录内容:"
    ls -la .output/
    if [ -d ".output/server" ]; then
        echo "📁 server目录内容:"
        ls -la .output/server/
    fi
fi

sleep 5
echo "🔍 检查进程:"
ps aux | grep node | grep -v grep

echo "🌐 测试本地连接:"
curl -I http://localhost:3222/ || echo "本地连接失败"

START_EOF

echo "✅ 手动启动完成，验证外部访问:"
sleep 3
curl -I "https://jcski.com/" | head -3

echo "🎉 手动启动过程完成"