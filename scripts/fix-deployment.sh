#!/bin/bash

# 快速修复部署问题脚本

set -e

echo "🔧 开始修复JCSKI Blog部署问题..."

# 1. 检查并创建项目目录
echo "📁 检查项目目录..."
if [ ! -d "/var/www/jcski-blog" ]; then
    echo "创建项目目录..."
    sudo mkdir -p /var/www/jcski-blog
    sudo chown -R ec2-user:ec2-user /var/www/jcski-blog
fi

cd /var/www/jcski-blog

# 2. 克隆或更新代码
echo "📥 获取最新代码..."
if [ ! -d ".git" ]; then
    echo "克隆项目代码..."
    git clone https://github.com/kenkakuma/jcski.git .
else
    echo "更新项目代码..."
    git fetch origin
    git reset --hard origin/main
fi

# 3. 安装依赖
echo "📦 安装项目依赖..."
npm ci

# 4. 创建环境配置
echo "⚙️ 创建环境配置..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3222
DATABASE_URL=file:./prisma/prod.db
JWT_SECRET=jcski-blog-production-super-secure-jwt-secret-2025
BASE_URL=http://jcski.com
ADMIN_EMAIL=admin@jcski.com
ADMIN_PASSWORD=admin123456
EOF

# 5. 初始化数据库
echo "🗄️ 初始化数据库..."
npx prisma generate
npx prisma db push

# 6. 创建管理员账户
echo "👤 创建管理员账户..."
node scripts/create-admin.js

# 7. 构建应用
echo "🔨 构建应用..."
npm run build

# 8. 配置Nginx
echo "🌐 配置Nginx..."
sudo tee /etc/nginx/conf.d/jcski-blog.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name jcski.com www.jcski.com 54.168.203.21 ec2-54-168-203-21.ap-northeast-1.compute.amazonaws.com;

    location / {
        proxy_pass http://localhost:3222;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# 9. 测试并重启Nginx
echo "🔄 重启Nginx..."
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 10. 启动应用
echo "🚀 启动应用..."
pm2 delete jcski-blog 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# 11. 测试应用
echo "🧪 测试应用..."
sleep 5
curl -s -o /dev/null -w "本地3222端口状态码: %{http_code}\n" http://localhost:3222/ || echo "应用启动失败"
curl -s -o /dev/null -w "Nginx 80端口状态码: %{http_code}\n" http://localhost:80/ || echo "Nginx代理失败"

echo ""
echo "✅ 修复完成！"
echo "🌐 请访问: http://jcski.com"
echo "🔐 管理后台: http://jcski.com/admin"
echo "👤 管理员: admin@jcski.com / admin123456"