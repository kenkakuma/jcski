# JCSKI Blog 系统日志清理系统

## 📋 概述

为了优化 AWS EC2 t2.micro (1GB RAM) 实例的存储空间使用，我们实现了自动化的系统日志清理解决方案。这个系统包括智能日志轮转、自动清理过期文件、和存储空间监控功能。

## 🎯 设计目标

- **存储优化**: 防止日志文件占用过多磁盘空间
- **性能维护**: 避免大日志文件影响系统性能
- **自动化管理**: 减少手动维护工作量
- **灵活配置**: 支持不同环境和需求的配置

## 📁 文件结构

```
scripts/
├── log-cleanup.sh              # 主要日志清理脚本
├── install-log-cleanup-cron.sh # 定时任务安装脚本
└── LOG-CLEANUP-README.md       # 本文档
```

## 🔧 主要脚本功能

### log-cleanup.sh

**核心功能:**
- 清理 Nginx 访问日志和错误日志
- 管理 PM2 进程日志
- 处理应用程序日志
- 清理系统临时文件
- 生成清理报告

**智能特性:**
- 磁盘空间自适应清理策略
- 大文件自动截断（保留最近内容）
- 重要日志备份机制
- 跨平台兼容（Linux/macOS）

**使用方式:**
```bash
# 预览模式（不实际删除文件）
./scripts/log-cleanup.sh --dry-run

# 执行清理
./scripts/log-cleanup.sh --force

# 查看帮助
./scripts/log-cleanup.sh --help
```

### install-log-cleanup-cron.sh

**功能:**
- 自动安装定时清理任务
- 配置 logrotate 规则
- 备份现有 crontab 配置
- 验证安装结果

**定时任务计划:**
```bash
# 每天凌晨2点执行日志清理
0 2 * * * /var/www/jcski-blog/scripts/log-cleanup.sh --force

# 每周日执行深度清理
0 3 * * 0 /var/www/jcski-blog/scripts/log-cleanup.sh --force

# 每月1号清理cron日志本身
0 1 1 * * echo "" > /var/log/jcski-log-cleanup.log
```

**使用方式:**
```bash
# 安装定时任务
./scripts/install-log-cleanup-cron.sh

# 卸载定时任务
./scripts/install-log-cleanup-cron.sh --uninstall
```

## ⚙️ 配置参数

### 默认清理策略

```bash
# 日志保留天数
NGINX_RETAIN_DAYS=7      # Nginx日志保留7天
PM2_RETAIN_DAYS=5        # PM2日志保留5天
APP_RETAIN_DAYS=10       # 应用日志保留10天
SYSTEM_RETAIN_DAYS=3     # 系统日志保留3天

# 文件大小限制
MAX_LOG_SIZE=10          # 单个日志文件最大10MB
MAX_TOTAL_SIZE=100       # 所有日志文件总计最大100MB
```

### 磁盘空间不足时的策略

当可用空间 < 500MB 时，自动启用积极清理模式：
```bash
NGINX_RETAIN_DAYS=3      # 减少到3天
PM2_RETAIN_DAYS=2        # 减少到2天
APP_RETAIN_DAYS=5        # 减少到5天
MAX_LOG_SIZE=5           # 减少到5MB
MAX_TOTAL_SIZE=50        # 减少到50MB
```

## 📊 日志处理策略

### 1. Nginx 日志
- **目标**: `/var/log/nginx/access.log*`, `/var/log/nginx/error.log*`
- **策略**: 删除过期文件，截断过大当前日志
- **备份**: 截断前自动备份到 `/tmp/log-backups/`

### 2. PM2 日志
- **目标**: `~/.pm2/logs/*.log`
- **策略**: 删除旧文件，截断大文件，执行 `pm2 flush`
- **特点**: 保持最近1000行日志内容

### 3. 应用日志
- **目标**: `/var/www/jcski-blog/logs/*.log`
- **策略**: 清理过期文件，截断大文件
- **特点**: 保持最近2000行日志内容

### 4. 系统日志
- **目标**: `journalctl` 日志和 `/var/log/` 下的文件
- **策略**: 使用 `journalctl --vacuum-time` 清理
- **权限**: 需要 sudo 权限

### 5. 临时文件
- **目标**: `/tmp/*.tmp`, `/tmp/*.log`, npm 缓存
- **策略**: 清理1天以上的临时文件
- **范围**: Node.js 缓存，构建临时文件

## 🚀 部署步骤

### 在 AWS EC2 上安装

1. **上传脚本文件**
```bash
scp -i your-key.pem scripts/*.sh ec2-user@your-server:/var/www/jcski-blog/scripts/
```

2. **设置执行权限**
```bash
ssh -i your-key.pem ec2-user@your-server
chmod +x /var/www/jcski-blog/scripts/*.sh
```

3. **安装定时任务**
```bash
cd /var/www/jcski-blog
./scripts/install-log-cleanup-cron.sh
```

4. **验证安装**
```bash
# 查看定时任务
crontab -l

# 测试脚本
./scripts/log-cleanup.sh --dry-run

# 查看清理日志
tail -f /var/log/jcski-log-cleanup.log
```

## 📈 监控和维护

### 检查清理效果

```bash
# 查看清理历史
grep "清理完成" /var/log/jcski-log-cleanup.log

# 查看磁盘使用
df -h

# 查看日志目录大小
du -sh /var/log/nginx /var/www/jcski-blog/logs ~/.pm2/logs
```

### 手动触发清理

```bash
# 立即执行清理
./scripts/log-cleanup.sh --force

# 查看清理报告
ls -la /tmp/jcski-log-cleanup-report-*.txt
cat /tmp/jcski-log-cleanup-report-*.txt
```

### 调整清理策略

编辑 `log-cleanup.sh` 中的配置变量：
```bash
# 修改保留天数
NGINX_RETAIN_DAYS=14    # 延长到14天

# 修改文件大小限制
MAX_LOG_SIZE=20         # 增加到20MB
```

## 🔧 故障排除

### 常见问题

1. **权限问题**
```bash
# 确保脚本有执行权限
chmod +x scripts/*.sh

# 检查日志目录权限
ls -la /var/log/
```

2. **cron 任务不执行**
```bash
# 检查cron服务状态
sudo systemctl status crond  # CentOS/RHEL
sudo systemctl status cron   # Ubuntu/Debian

# 查看cron日志
sudo tail -f /var/log/cron
```

3. **磁盘空间仍然不足**
```bash
# 找出最大的文件
find /var -type f -size +50M -exec ls -lh {} \; 2>/dev/null

# 手动清理Docker日志（如果使用）
sudo docker system prune -f
```

4. **脚本执行错误**
```bash
# 检查脚本语法
bash -n scripts/log-cleanup.sh

# 查看详细执行过程
bash -x scripts/log-cleanup.sh --dry-run
```

### 紧急恢复

如果清理过度导致问题：
```bash
# 恢复crontab备份
crontab /tmp/jcski-crontab-backup-YYYYMMDD-HHMMSS

# 从备份恢复日志
ls -la /tmp/log-backups/
cp /tmp/log-backups/20250722/nginx-access-* /var/log/nginx/
```

## 📋 最佳实践

1. **定期监控**: 每月检查一次清理效果和磁盘使用
2. **备份重要日志**: 关键错误日志应该有外部备份
3. **调整策略**: 根据实际使用情况调整保留天数
4. **资源监控**: 配合系统监控工具使用
5. **测试验证**: 在生产环境部署前充分测试

## 🔗 相关资源

- [AWS EC2 存储优化最佳实践](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-optimizing.html)
- [Linux 日志管理指南](https://www.digitalocean.com/community/tutorials/how-to-view-and-configure-linux-logs-on-ubuntu-and-centos)
- [PM2 日志管理](https://pm2.keymetrics.io/docs/usage/log-management/)
- [Nginx 日志轮转](https://nginx.org/en/docs/control.html)

---

**版本**: v0.5.0  
**创建时间**: 2025-07-22  
**维护**: JCSKI Blog Team  
**项目**: https://jcski.com