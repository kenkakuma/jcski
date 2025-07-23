#!/bin/bash

echo "🧹 清理v0.5.0功能并启动原始JCSKI Blog..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'CLEAN_START_EOF'
cd /var/www/jcski-blog

echo "🧹 备份v0.5.0新增功能..."
if [ -d "server/api/monitoring" ]; then
    mv server/api/monitoring server/api/monitoring.v0.5.0-backup
    echo "✅ 监控API已备份"
fi

echo "🧹 移除v0.5.0新增的插件..."
if [ -f "plugins/critical-preload.client.ts" ]; then
    mkdir -p plugins.v0.5.0-backup
    mv plugins/critical-*.ts plugins.v0.5.0-backup/ 2>/dev/null || true
    mv plugins/dynamic-*.ts plugins.v0.5.0-backup/ 2>/dev/null || true
    mv plugins/font-*.ts plugins.v0.5.0-backup/ 2>/dev/null || true
    echo "✅ v0.5.0插件已备份"
fi

echo "🚀 重新启动清理后的应用..."
NODE_ENV=development DATABASE_URL="file:/var/www/jcski-blog/prisma/dev.db" nohup npx nuxt dev --config nuxt.config.minimal.ts --port 3222 --host 0.0.0.0 > /tmp/nuxt-clean.log 2>&1 &

echo "⏳ 等待应用启动..."
sleep 25

echo "📋 检查启动日志..."
tail -15 /tmp/nuxt-clean.log

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

CLEAN_START_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ 清理完成！"