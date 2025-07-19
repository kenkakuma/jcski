#!/bin/bash

# JCSKI Blog AWS EC2 部署设置脚本
# 此脚本需要在EC2实例上运行一次来设置环境

set -e

echo "🚀 开始设置 JCSKI Blog 部署环境..."

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
sudo npm install -g pm2

# 安装Nginx
sudo apt install nginx -y

# 创建应用目录
sudo mkdir -p /var/www/jcski-blog
sudo chown -R $USER:$USER /var/www/jcski-blog
cd /var/www/jcski-blog

# 创建日志目录
mkdir -p logs

# 初始化Git仓库（如果不存在）
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/kenkakuma/jcski.git
fi

# 创建生产环境配置
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3222
DATABASE_URL=file:./prisma/prod.db
JWT_SECRET=your-super-secure-jwt-secret-here
BASE_URL=http://your-domain.com
ADMIN_EMAIL=admin@jcski.com
ADMIN_PASSWORD=your-secure-password
EOF

echo "📝 请编辑 .env.production 文件设置正确的环境变量"

# 配置Nginx
sudo tee /etc/nginx/sites-available/jcski-blog > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
    }
}
EOF

# 启用Nginx站点
sudo ln -sf /etc/nginx/sites-available/jcski-blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 设置PM2开机自启
pm2 startup
echo "📝 请运行PM2显示的sudo命令来设置开机自启"

echo "✅ EC2环境设置完成！"
echo "📝 下一步："
echo "1. 编辑 /var/www/jcski-blog/.env.production"
echo "2. 修改 /etc/nginx/sites-available/jcski-blog 中的域名"
echo "3. 运行 PM2 startup 显示的命令"
echo "4. 在GitHub中配置Secrets"