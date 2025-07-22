#!/bin/bash

# JCSKI Blog 图片系统部署脚本
# 专门用于部署图片系统升级到EC2

echo "🚀 开始部署图片系统升级到EC2..."

# SSH到EC2并执行部署
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'DEPLOY_EOF'
set -e

echo "📁 进入项目目录..."
cd /var/www/jcski-blog || { echo "目录不存在"; exit 1; }

echo "📋 检查当前状态..."
pwd
git status

echo "🔄 拉取最新代码..."
git fetch --all
git reset --hard origin/main
git pull origin main

echo "📦 安装依赖..."
npm ci --production

echo "🗄️ 更新数据库..."
npx prisma generate
npx prisma db push

echo "🔧 构建应用..."
NODE_ENV=production npm run build

echo "📁 检查关键文件是否存在..."
ls -la components/SmartImage.vue || echo "❌ SmartImage.vue 不存在"
ls -la components/ExternalImagePicker.vue || echo "❌ ExternalImagePicker.vue 不存在"
ls -la components/RichTextEditor.vue || echo "❌ RichTextEditor.vue 不存在"
ls -la utils/media.ts || echo "❌ media.ts 不存在"
ls -la public/uploads/ || { echo "📁 创建uploads目录"; mkdir -p public/uploads; chmod 755 public/uploads; }

echo "🔧 PM2 进程管理..."
pm2 stop jcski-blog || echo "应用未运行"
pm2 delete jcski-blog || echo "应用不存在"

echo "🚀 启动应用..."
pm2 start ecosystem.config.js
pm2 save

echo "✅ 等待应用启动..."
sleep 15

echo "📊 检查应用状态..."
pm2 status
pm2 logs jcski-blog --lines 5

echo "🎉 图片系统部署完成！"

DEPLOY_EOF

echo "🔍 验证部署结果..."
sleep 5

echo "检查网站响应..."
curl -s -I "https://jcski.com/" | head -5

echo "检查API响应..."  
curl -s -I "https://jcski.com/api/posts" | head -3

echo "✨ 部署脚本执行完成！"