#!/bin/bash

echo "🔄 恢复原始JCSKI Blog网站..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'RESTORE_EOF'
cd /var/www/jcski-blog

echo "🛑 停止所有服务..."
pkill -f python3 2>/dev/null || echo "没有Python服务"
pkill -f nuxt 2>/dev/null || echo "没有Nuxt服务"

echo "🔄 恢复原始配置文件..."
git restore index.html nuxt.config.ts

echo "🔧 临时禁用v0.5.0监控中间件（修复启动问题）..."
cp nuxt.config.ts nuxt.config.ts.original

# 临时注释掉有问题的serverHandlers配置
sed -i '/serverHandlers:/,/],/c\
  // serverHandlers: [\
  //   {\
  //     route: "/**",\
  //     middleware: "~/server/middleware/monitoring"\
  //   },\
  //   {\
  //     route: "/api/**",\
  //     middleware: "~/server/middleware/security"\
  //   },\
  //   {\
  //     route: "/**",\
  //     middleware: "~/server/middleware/ratelimit"\
  //   }\
  // ],' nuxt.config.ts

echo "🚀 启动原始Nuxt应用..."
NODE_ENV=development DATABASE_URL="file:/var/www/jcski-blog/prisma/dev.db" nohup npm run dev -- --port 3222 --host 0.0.0.0 > /tmp/nuxt-original.log 2>&1 &

echo "⏳ 等待应用启动..."
sleep 25

echo "📋 检查启动日志..."
tail -15 /tmp/nuxt-original.log

echo "🔍 检查进程..."
ps aux | grep -E "(nuxt|node.*3222)" | grep -v grep | head -3

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

RESTORE_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ 原始网站恢复完成！"