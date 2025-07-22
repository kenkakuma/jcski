# JCSKI Blog 安全配置系统

## 📋 概述

JCSKI Blog 实现了多层次的安全防护体系，专为 AWS EC2 t2.micro 实例优化，提供全面的 Web 应用安全保护。我们的安全策略涵盖应用层、网络层和系统层，确保在有限资源环境下提供最佳的安全防护。

## 🎯 安全目标

- **数据保护**: 防止数据泄露和未授权访问
- **服务可用性**: 防止 DDoS 攻击和资源耗尽
- **攻击防护**: 阻止常见 Web 攻击（XSS、CSRF、SQL注入）
- **隐私保护**: 保护用户隐私和敏感信息
- **合规要求**: 符合 Web 安全最佳实践

## 🛡️ 安全架构

### 多层次防护模型

```
Internet
    ↓
[AWS VPC + Security Groups]    ← 网络层防护
    ↓
[Nginx + 防火墙规则]           ← 边缘层防护
    ↓
[应用安全中间件]               ← 应用层防护
    ↓
[Nuxt 3 应用]                 ← 业务层
    ↓
[SQLite 数据库]               ← 数据层
```

## 🔧 安全组件

### 1. Nginx 安全配置

**位置**: `scripts/nginx-security.conf`

**核心功能**:
- **CSP (内容安全策略)**: 防止 XSS 攻击
- **CORS 策略**: 跨域请求控制
- **速率限制**: 防止暴力破解和 DDoS
- **安全头部**: 完整的 HTTP 安全头部配置
- **请求过滤**: 阻止恶意请求模式

**关键配置**:
```nginx
# 不同端点的速率限制
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=admin:10m rate=2r/s;

# 安全头部
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy $csp_policy always;
```

### 2. 应用层安全中间件

**位置**: `server/middleware/security.ts`

**核心功能**:
- **动态 CSP**: 根据环境自适应的内容安全策略
- **CORS 管理**: 智能跨域请求处理
- **安全头部**: 应用层安全头部设置
- **敏感信息隐藏**: 移除服务器版本信息

**配置示例**:
```typescript
csp: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  imgSrc: ["'self'", "data:", "blob:", "https:"]
}
```

### 3. 请求频率限制

**位置**: `server/middleware/ratelimit.ts`

**核心功能**:
- **智能限流**: 不同端点不同限制策略
- **内存存储**: 高效的请求计数存储
- **自动清理**: 定期清理过期记录
- **白名单支持**: 支持特定 IP 白名单

**限制策略**:
```typescript
// 管理 API: 15分钟 50次
// 认证 API: 15分钟 10次  
// 普通 API: 15分钟 200次
// 静态资源: 10分钟 1000次
// 页面访问: 15分钟 300次
```

### 4. 系统级安全配置

**位置**: `scripts/deploy-security.sh`

**核心功能**:
- **系统参数优化**: 内核安全参数调优
- **防火墙规则**: iptables 基础规则配置
- **文件权限**: 敏感文件权限加固
- **Fail2ban**: 自动入侵检测和阻止

**系统参数**:
```bash
# 启用 SYN Cookies 防护
net.ipv4.tcp_syncookies = 1

# 禁用 IP 转发
net.ipv4.ip_forward = 0

# 启用反向路径过滤
net.ipv4.conf.all.rp_filter = 1
```

## 📁 文件结构

```
scripts/
├── security/
│   ├── security.ts              # 应用层安全中间件
│   ├── ratelimit.ts            # 请求频率限制
│   ├── nginx-security.conf     # Nginx 安全配置
│   ├── deploy-security.sh      # 安全部署脚本
│   └── SECURITY-README.md      # 本文档
```

## 🚀 部署指南

### 自动化部署

```bash
# 完整安全配置部署
./scripts/deploy-security.sh

# 仅验证配置（不实际部署）
./scripts/deploy-security.sh --test

# 回滚配置
./scripts/deploy-security.sh --rollback /tmp/backup-dir
```

### 手动部署步骤

1. **部署 Nginx 配置**
```bash
sudo cp scripts/nginx-security.conf /etc/nginx/conf.d/jcski-security.conf
sudo nginx -t
sudo systemctl reload nginx
```

2. **配置防火墙**
```bash
# 基础防火墙规则
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

3. **系统参数优化**
```bash
# 应用系统安全参数
sudo sysctl -p /etc/sysctl.d/99-jcski-security.conf
```

4. **启动应用**
```bash
# 重启 PM2 应用以加载安全中间件
pm2 reload ecosystem.config.js
```

## 🔍 安全监控

### 日志监控

**Nginx 安全日志**:
```bash
# 查看安全事件
tail -f /var/log/nginx/jcski-security.log | grep -E "403|429|blocked"

# 分析攻击模式
awk '{print $1}' /var/log/nginx/jcski-security.log | sort | uniq -c | sort -nr | head -10
```

**应用层日志**:
```bash
# 查看限流事件
grep "RateLimit" /var/log/jcski-*.log

# 查看安全事件
grep "Security" /var/log/jcski-*.log
```

### 实时监控命令

```bash
# 监控连接数
ss -tuln | grep :80
ss -tuln | grep :443

# 监控防火墙日志
sudo tail -f /var/log/messages | grep -i iptables

# 检查 Fail2ban 状态
sudo fail2ban-client status
sudo fail2ban-client status nginx-limit-req
```

## 🛠️ 配置调优

### 根据流量调整限流策略

**高流量网站**:
```nginx
limit_req_zone $binary_remote_addr zone=api:20m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:20m rate=20r/s;
```

**开发环境**:
```nginx
limit_req_zone $binary_remote_addr zone=api:5m rate=50r/s;
limit_req_zone $binary_remote_addr zone=general:5m rate=100r/s;
```

### CSP 策略调整

**严格模式**:
```typescript
csp: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],        // 不允许内联脚本
  styleSrc: ["'self'"],         // 不允许内联样式
  imgSrc: ["'self'", "data:"]   // 只允许同源和 data URI
}
```

**开发模式**:
```typescript
csp: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "blob:", "http:", "https:"]
}
```

## 🔧 故障排除

### 常见问题

1. **CSP 阻止资源加载**
```bash
# 检查浏览器控制台的 CSP 错误
# 在 CSP 策略中添加相应的源

# 临时禁用 CSP（仅调试）
# 注释掉 nginx 配置中的 CSP 头部
```

2. **限流过于严格**
```bash
# 检查限流日志
grep "limiting requests" /var/log/nginx/error.log

# 调整限流参数
# 增加 burst 值或提高 rate
limit_req zone=api burst=50 nodelay;
```

3. **CORS 问题**
```bash
# 检查请求来源
curl -H "Origin: https://example.com" -I http://jcski.com/api/posts

# 在 CORS 配置中添加允许的域名
```

4. **SSL/HTTPS 配置**
```bash
# 检查 SSL 证书
openssl x509 -in /etc/letsencrypt/live/jcski.com/fullchain.pem -text -noout

# 测试 SSL 配置
curl -I https://jcski.com
```

### 应急处理

**阻止特定 IP**:
```bash
# 临时阻止 IP
sudo iptables -A INPUT -s 192.168.1.100 -j DROP

# 永久阻止（Fail2ban）
sudo fail2ban-client set nginx-limit-req banip 192.168.1.100
```

**恢复配置**:
```bash
# 恢复 Nginx 配置
sudo cp /path/to/backup/nginx.conf /etc/nginx/conf.d/
sudo nginx -s reload

# 恢复防火墙规则
sudo iptables-restore < /path/to/backup/iptables.rules
```

## 📊 安全指标

### 关键性能指标 (KPI)

- **阻止的攻击次数**: 每日被阻止的恶意请求数量
- **误报率**: 合法请求被误阻的比例
- **响应时间影响**: 安全中间件对响应时间的影响
- **资源使用**: 安全功能对系统资源的消耗

### 监控脚本

```bash
#!/bin/bash
# 安全监控脚本
echo "=== JCSKI Security Status ==="
echo "Date: $(date)"
echo ""

echo "Blocked IPs (last 24h):"
sudo fail2ban-client status nginx-limit-req | grep "Banned IP list"

echo ""
echo "Rate limiting events (last hour):"
grep -c "limiting requests" /var/log/nginx/error.log

echo ""
echo "Top attacking IPs:"
awk '$9 ~ /40[0-9]/ {print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -5
```

## 🔐 安全最佳实践

### 定期维护

1. **每日检查**
   - 查看安全日志
   - 监控异常访问模式
   - 检查系统资源使用

2. **每周维护**
   - 更新 Fail2ban 规则
   - 分析攻击趋势
   - 调整限流策略

3. **每月审计**
   - 全面安全配置审查
   - 更新 CSP 策略
   - 评估新的安全威胁

### 安全检查清单

- [ ] Nginx 配置文件语法正确
- [ ] SSL 证书有效且未过期
- [ ] 防火墙规则正确配置
- [ ] Fail2ban 正常运行
- [ ] 安全头部正确设置
- [ ] 文件权限适当配置
- [ ] 备份配置文件已创建
- [ ] 监控告警正常工作

## 📞 支持和反馈

- **技术支持**: 检查 GitHub Issues
- **安全报告**: 如发现安全漏洞，请私下联系
- **功能请求**: 通过 GitHub Issues 提交
- **文档更新**: 欢迎提交 PR 改进文档

---

**版本**: v0.5.0  
**更新时间**: 2025-07-22  
**维护团队**: JCSKI Blog Security Team  
**项目地址**: https://jcski.com