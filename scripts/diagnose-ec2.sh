#!/bin/bash

# EC2实例诊断脚本 - 检查网站部署状态

echo "🔍 JCSKI Blog EC2 诊断开始..."
echo "=========================="

# 1. 系统信息
echo ""
echo "📋 1. 系统信息"
echo "操作系统: $(cat /etc/os-release | grep PRETTY_NAME)"
echo "当前用户: $(whoami)"
echo "当前路径: $(pwd)"
echo "系统时间: $(date)"

# 2. 检查网络连接
echo ""
echo "🌐 2. 网络连接检查"
echo "外网连接测试:"
ping -c 3 google.com
echo "本地端口监听:"
netstat -tlnp | grep -E ':(80|443|3222)'

# 3. 检查项目目录
echo ""
echo "📁 3. 项目目录检查"
if [ -d "/var/www/jcski-blog" ]; then
    echo "✅ 项目目录存在: /var/www/jcski-blog"
    cd /var/www/jcski-blog
    echo "目录所有者: $(ls -la /var/www/ | grep jcski-blog)"
    echo "目录内容:"
    ls -la
    
    # 检查Git状态
    if [ -d ".git" ]; then
        echo "Git状态:"
        git status --porcelain
        echo "当前分支: $(git branch --show-current)"
        echo "最新提交: $(git log --oneline -1)"
    else
        echo "❌ 未找到Git仓库"
    fi
else
    echo "❌ 项目目录不存在: /var/www/jcski-blog"
fi

# 4. 检查Node.js和npm
echo ""
echo "📦 4. Node.js环境检查"
if command -v node &> /dev/null; then
    echo "✅ Node.js版本: $(node --version)"
else
    echo "❌ Node.js未安装"
fi

if command -v npm &> /dev/null; then
    echo "✅ npm版本: $(npm --version)"
else
    echo "❌ npm未安装"
fi

# 5. 检查PM2
echo ""
echo "🔄 5. PM2进程管理器检查"
if command -v pm2 &> /dev/null; then
    echo "✅ PM2版本: $(pm2 --version)"
    echo "PM2进程状态:"
    pm2 status
    echo "PM2日志(最后20行):"
    pm2 logs --lines 20
else
    echo "❌ PM2未安装"
fi

# 6. 检查Nginx
echo ""
echo "🌐 6. Nginx检查"
if command -v nginx &> /dev/null; then
    echo "✅ Nginx版本: $(nginx -v 2>&1)"
    echo "Nginx状态:"
    sudo systemctl status nginx --no-pager
    echo "Nginx配置测试:"
    sudo nginx -t
    echo "Nginx配置文件:"
    ls -la /etc/nginx/conf.d/
    if [ -f "/etc/nginx/conf.d/jcski-blog.conf" ]; then
        echo "JCSKI配置内容:"
        cat /etc/nginx/conf.d/jcski-blog.conf
    fi
else
    echo "❌ Nginx未安装"
fi

# 7. 检查防火墙
echo ""
echo "🛡️ 7. 防火墙检查"
if command -v ufw &> /dev/null; then
    echo "UFW状态:"
    sudo ufw status
elif command -v firewall-cmd &> /dev/null; then
    echo "Firewalld状态:"
    sudo firewall-cmd --list-all
else
    echo "iptables规则:"
    sudo iptables -L
fi

# 8. 检查环境变量
echo ""
echo "⚙️ 8. 环境变量检查"
if [ -f "/var/www/jcski-blog/.env" ]; then
    echo "✅ 环境配置文件存在"
    echo "配置内容(敏感信息已隐藏):"
    cat /var/www/jcski-blog/.env | sed 's/PASSWORD=.*/PASSWORD=***/' | sed 's/SECRET=.*/SECRET=***/'
else
    echo "❌ 环境配置文件不存在"
fi

# 9. 测试本地访问
echo ""
echo "🧪 9. 本地访问测试"
echo "测试localhost:3222:"
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:3222/ || echo "连接失败"

echo "测试localhost:80:"
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:80/ || echo "连接失败"

# 10. 磁盘空间
echo ""
echo "💾 10. 磁盘空间检查"
df -h
echo ""
echo "内存使用:"
free -h

echo ""
echo "🎯 诊断完成！"
echo "=========================="