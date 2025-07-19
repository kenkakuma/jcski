#!/bin/bash

# JCSKI Blog AWS EC2 (Amazon Linux) 部署设置脚本
# 此脚本专为Amazon Linux系统设计

set -e

echo "🚀 开始设置 JCSKI Blog 部署环境 (Amazon Linux)..."

# 更新系统
sudo yum update -y

# 安装Git（如果还没有）
sudo yum install -y git

# 安装Node.js 18 (使用官方二进制包)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证Node.js安装
echo "📦 Node.js版本: $(node --version)"
echo "📦 NPM版本: $(npm --version)"

# 安装PM2
sudo npm install -g pm2

# 安装Nginx
sudo yum install -y nginx

# 启动并启用Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 创建应用目录
sudo mkdir -p /var/www/jcski-blog
sudo chown -R ec2-user:ec2-user /var/www/jcski-blog
cd /var/www/jcski-blog

# 创建日志目录
mkdir -p logs

# 克隆项目代码
echo "📥 克隆项目代码..."
git clone https://github.com/kenkakuma/jcski.git .

# 安装项目依赖
echo "📦 安装项目依赖..."
npm install

# 创建生产环境配置
cat > .env << 'EOF'
NODE_ENV=production
PORT=3222
DATABASE_URL=file:./prisma/prod.db
JWT_SECRET=jcski-blog-production-super-secure-jwt-secret-2025
BASE_URL=http://ec2-54-168-203-21.ap-northeast-1.compute.amazonaws.com
ADMIN_EMAIL=admin@jcski.com
ADMIN_PASSWORD=admin123456
EOF

echo "📝 生产环境配置已创建: .env"

# 初始化数据库
echo "🗄️ 初始化数据库..."
npx prisma generate
npx prisma db push

# 创建管理员账户
echo "👤 创建管理员账户..."
node scripts/create-admin.js

# 构建应用
echo "🔨 构建应用..."
npm run build

# 配置Nginx
sudo tee /etc/nginx/conf.d/jcski-blog.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name ec2-54-168-203-21.ap-northeast-1.compute.amazonaws.com;

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

# 测试Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 启动应用
echo "🚀 启动应用..."
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置PM2开机自启
pm2 startup
echo "⚠️  请复制上面显示的sudo命令并执行以设置开机自启"

# 检查应用状态
pm2 status

echo ""
echo "✅ Amazon Linux EC2环境设置完成！"
echo ""
echo "📋 环境信息:"
echo "   🖥️  服务器: ec2-54-168-203-21.ap-northeast-1.compute.amazonaws.com"
echo "   🌐 网站URL: http://ec2-54-168-203-21.ap-northeast-1.compute.amazonaws.com"
echo "   🔐 管理后台: http://ec2-54-168-203-21.ap-northeast-1.compute.amazonaws.com/admin"
echo "   👤 管理员账户: admin@jcski.com / admin123456"
echo ""
echo "📝 下一步操作:"
echo "1. 复制并执行上面显示的PM2 startup命令"
echo "2. 在GitHub仓库中配置Secrets"
echo "3. 测试自动部署功能"
echo ""
echo "🔍 故障排除命令:"
echo "   pm2 status     # 查看应用状态"
echo "   pm2 logs       # 查看应用日志"
echo "   sudo systemctl status nginx  # 查看Nginx状态"