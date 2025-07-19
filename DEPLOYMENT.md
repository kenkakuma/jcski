# JCSKI Blog 部署指南

## 🚀 自动部署到AWS EC2

本指南将帮你设置GitHub Actions自动部署JCSKI Blog到AWS EC2实例。

### 📋 准备工作

#### 1. AWS EC2实例要求
- Ubuntu 20.04+ LTS
- 至少1GB RAM
- 安全组开放端口: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- 分配弹性IP地址

#### 2. 域名配置（可选）
- 将域名A记录指向EC2弹性IP
- 配置www子域名

### 🛠️ EC2服务器设置

#### 1. 连接到EC2实例
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 2. 运行自动设置脚本
```bash
# 下载并运行设置脚本
curl -fsSL https://raw.githubusercontent.com/your-username/jcski-blog-deploy/main/scripts/deploy-setup.sh | bash
```

#### 3. 手动配置环境变量
```bash
# 编辑生产环境配置
sudo nano /var/www/jcski-blog/.env.production

# 配置以下变量:
NODE_ENV=production
PORT=3222
DATABASE_URL=file:./prisma/prod.db
JWT_SECRET=your-super-secure-jwt-secret
BASE_URL=http://your-domain.com
ADMIN_EMAIL=admin@jcski.com
ADMIN_PASSWORD=your-secure-password
```

#### 4. 配置Nginx域名
```bash
# 编辑Nginx配置
sudo nano /etc/nginx/sites-available/jcski-blog

# 修改server_name为你的域名
server_name your-domain.com www.your-domain.com;
```

#### 5. 重启服务
```bash
sudo systemctl restart nginx
```

### 🔐 GitHub Secrets配置

在GitHub仓库的Settings → Secrets and variables → Actions中添加以下secrets:

| Secret名称 | 说明 | 示例值 |
|------------|------|--------|
| `EC2_HOST` | EC2实例IP地址 | `18.182.55.34` |
| `EC2_USER` | SSH用户名 | `ubuntu` |
| `EC2_SSH_KEY` | EC2私钥内容 | `-----BEGIN RSA PRIVATE KEY-----...` |
| `DATABASE_URL` | 生产数据库URL | `file:./prisma/prod.db` |
| `JWT_SECRET` | JWT密钥 | `your-super-secure-jwt-secret` |
| `BASE_URL` | 网站基础URL | `http://your-domain.com` |

### 📦 部署流程

1. **代码推送触发**
   ```bash
   git push origin main
   ```

2. **GitHub Actions自动执行**
   - 检出代码
   - 安装依赖
   - 构建应用
   - 部署到EC2
   - 重启PM2服务

3. **验证部署**
   - 访问你的域名
   - 检查管理后台: `http://your-domain.com/admin`

### 🔍 故障排除

#### 检查服务状态
```bash
# 检查PM2进程
pm2 status

# 检查应用日志
pm2 logs jcski-blog

# 检查Nginx状态
sudo systemctl status nginx

# 检查Nginx日志
sudo tail -f /var/log/nginx/error.log
```

#### 手动重启服务
```bash
# 重启应用
pm2 restart jcski-blog

# 重启Nginx
sudo systemctl restart nginx
```

#### 数据库初始化
```bash
cd /var/www/jcski-blog
npx prisma generate
npx prisma db push
node scripts/create-admin.js
```

### 🛡️ 安全建议

1. **防火墙配置**
   ```bash
   sudo ufw enable
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   ```

2. **SSL证书配置**
   ```bash
   # 使用Let's Encrypt
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **定期更新**
   ```bash
   # 系统更新
   sudo apt update && sudo apt upgrade

   # Node.js和npm更新
   sudo npm update -g
   ```

### 📊 监控和维护

#### PM2监控
```bash
# 安装PM2监控
pm2 install pm2-server-monit

# 查看监控面板
pm2 monit
```

#### 日志轮转
```bash
# 配置日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 🎯 优化建议

1. **性能优化**
   - 启用gzip压缩
   - 配置缓存策略
   - 使用CDN加速

2. **备份策略**
   - 定期备份数据库
   - 备份上传文件
   - 代码版本控制

---

## 📞 技术支持

如有问题，请查看：
- [GitHub Issues](https://github.com/your-username/jcski-blog-deploy/issues)
- [项目文档](./CLAUDE.md)
- [开发日志](./CLAUDE.md#版本历史)

---

*最后更新: 2025-07-19 | JCSKI Blog v0.4.0*