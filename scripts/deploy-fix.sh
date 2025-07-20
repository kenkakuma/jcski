#!/bin/bash

# JCSKI Blog 部署修复脚本
# 解决数据库路径和环境配置问题

set -e

echo "🚀 JCSKI Blog 部署修复脚本"
echo "=========================="

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "1. 更新生产环境配置..."
# 确保使用绝对路径的数据库URL
cat > .env.production << EOF
NODE_ENV=production
PORT=3222
DATABASE_URL="file:/var/www/jcski-blog/prisma/dev.db"
JWT_SECRET="jcski-blog-production-super-secure-jwt-secret-2025"
BASE_URL="http://jcski.com"
ADMIN_EMAIL="admin@jcski.com"
ADMIN_PASSWORD="admin123456"
DEBUG=0
EOF

echo "2. 备份并更新 Prisma schema..."
cp prisma/schema.prisma prisma/schema.prisma.backup
sed -i 's|url.*=.*"file:.*"|url = env("DATABASE_URL")|' prisma/schema.prisma

echo "3. 重新生成 Prisma 客户端..."
npx prisma generate

echo "4. 推送数据库 schema..."
npx prisma db push

echo "5. 创建管理员用户..."
node scripts/create-admin.js

echo "6. 重新构建项目..."
npm run build

echo "✅ 部署修复完成!"
echo ""
echo "🔧 后续步骤:"
echo "1. 确保 PM2 服务重启: pm2 restart jcski-blog"
echo "2. 检查服务状态: pm2 status"
echo "3. 查看日志: pm2 logs jcski-blog"
echo ""
echo "🌐 访问地址:"
echo "- 网站: http://jcski.com"
echo "- 管理后台: http://jcski.com/admin"
echo "- 默认账户: admin@jcski.com / admin123456"