# JCSKI Blog 性能监控系统

## 📋 概述

JCSKI Blog 集成了轻量级但功能全面的性能监控系统，专门为 AWS EC2 t2.micro (1GB RAM) 实例优化。监控系统提供实时性能指标收集、告警通知、可视化仪表板和自动化报告功能。

## 🎯 监控目标

- **资源使用监控**: CPU、内存、磁盘使用率实时监控
- **应用性能监控**: 响应时间、请求统计、错误率追踪
- **服务健康监控**: Nginx、PM2、数据库连接状态检查
- **告警通知**: 自动检测异常情况并发送告警
- **历史数据**: 保存24小时历史数据用于趋势分析

## 🏗️ 系统架构

### 监控数据流

```
请求 → 监控中间件 → 指标收集 → 内存存储
                     ↓
系统监控脚本 ← 定时任务 ← 告警检查 ← API接口
     ↓              ↓         ↓
 告警日志    →  系统日志  →  仪表板展示
```

### 组件架构

```
前端层:
├── 监控仪表板 (/admin/monitoring)
├── 健康检查页面
└── 性能指标图表

应用层:
├── 监控中间件 (middleware/monitoring.ts)
├── 监控API (api/monitoring/*)
└── 数据聚合服务

系统层:
├── 系统监控脚本 (system-monitor.sh)
├── 定时任务 (cron)
└── 日志管理 (logrotate)
```

## 📁 文件结构

```
scripts/
├── monitoring/
│   ├── monitoring.ts           # 应用层监控中间件
│   ├── system-monitor.sh       # 系统级监控脚本
│   ├── install-monitoring.sh   # 监控系统安装脚本
│   └── MONITORING-README.md    # 本文档
│
server/
├── middleware/
│   └── monitoring.ts           # Nuxt监控中间件
└── api/monitoring/
    ├── health.get.ts           # 健康检查API
    └── metrics.get.ts          # 性能指标API

pages/admin/
└── monitoring.vue              # 监控仪表板
```

## 🔧 监控功能

### 1. 应用层监控

**监控中间件** (`server/middleware/monitoring.ts`)

**核心指标**:
- 请求响应时间
- 内存使用情况
- 请求状态码分布
- 端点性能统计
- 错误率统计

**特性**:
```typescript
interface RequestMetrics {
  timestamp: number
  method: string
  path: string
  statusCode: number
  responseTime: number
  memoryUsage: number
  userAgent: string
  ip: string
  size: number
}
```

**告警条件**:
- 响应时间 > 2000ms
- 内存使用 > 800MB
- HTTP 4xx/5xx 错误

### 2. 系统级监控

**监控脚本** (`scripts/system-monitor.sh`)

**系统指标**:
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 系统负载
- 服务状态

**告警阈值**:
```bash
MEMORY_THRESHOLD=85      # 内存使用超过85%
CPU_THRESHOLD=80         # CPU使用超过80%
DISK_THRESHOLD=90        # 磁盘使用超过90%
LOAD_THRESHOLD=2.0       # 系统负载超过2.0
RESPONSE_TIME_THRESHOLD=3000  # 响应时间超过3秒
```

### 3. 监控API

**健康检查** (`/api/monitoring/health`)
```json
{
  "status": "healthy",
  "services": {
    "application": { "status": "healthy", "uptime": 3600 },
    "database": { "status": "healthy" },
    "storage": { "status": "healthy" }
  }
}
```

**性能指标** (`/api/monitoring/metrics`)
```json
{
  "summary": {
    "requestCount": 1250,
    "avgResponseTime": 120,
    "errorRate": 0.8,
    "memoryUsage": { "average": 256, "peak": 512 }
  },
  "endpoints": {
    "/api/posts": { "count": 500, "avgTime": 80, "errors": 2 }
  }
}
```

### 4. 可视化仪表板

**监控面板** (`/admin/monitoring`)

**功能特性**:
- 实时系统状态显示
- 性能指标图表
- API端点统计表
- 最近请求列表
- 自动刷新功能
- 响应式设计

**状态指示器**:
- 🟢 健康 (正常运行)
- 🟡 警告 (轻微问题)
- 🔴 错误 (严重问题)

## 🚀 安装和配置

### 自动化安装

```bash
# 完整安装监控系统
./scripts/install-monitoring.sh

# 仅测试监控功能
./scripts/install-monitoring.sh --test

# 卸载监控系统
./scripts/install-monitoring.sh --uninstall
```

### 手动安装步骤

1. **安装依赖**
```bash
# Amazon Linux / CentOS
sudo yum install -y epel-release jq curl

# Ubuntu / Debian
sudo apt update && sudo apt install -y jq curl
```

2. **配置监控中间件**
```bash
# 确保中间件在 nuxt.config.ts 中注册
# serverHandlers 应包含 monitoring middleware
```

3. **设置系统监控**
```bash
# 设置监控脚本权限
chmod +x scripts/system-monitor.sh

# 测试监控脚本
./scripts/system-monitor.sh check
```

4. **配置定时任务**
```bash
# 编辑crontab
crontab -e

# 添加监控任务
*/5 * * * * /var/www/jcski-blog/scripts/system-monitor.sh check
0 * * * * /var/www/jcski-blog/scripts/system-monitor.sh report
```

5. **重启应用**
```bash
# 重启PM2以加载监控中间件
pm2 reload ecosystem.config.js
```

## 📊 使用指南

### 访问监控面板

**开发环境**:
```
http://localhost:3003/admin/monitoring
```

**生产环境**:
```
https://jcski.com/admin/monitoring
```

### 监控命令

**系统监控脚本**:
```bash
# 单次检查
./scripts/system-monitor.sh check

# 持续监控（5分钟间隔）
./scripts/system-monitor.sh monitor 300

# 生成报告
./scripts/system-monitor.sh report

# 查看状态
./scripts/system-monitor.sh status

# 停止监控
./scripts/system-monitor.sh stop
```

**API接口调用**:
```bash
# 健康检查
curl http://localhost:3222/api/monitoring/health

# 性能指标（需要认证）
curl -H "Authorization: Bearer monitor-token" \
     http://localhost:3222/api/monitoring/metrics
```

### 日志查看

**应用监控日志**:
```bash
# 实时监控日志
tail -f /var/log/jcski-system-monitor.log

# 告警日志
tail -f /var/log/jcski-alerts.log

# 最近的告警
grep "WARNING\|ERROR" /var/log/jcski-alerts.log | tail -10
```

**性能指标文件**:
```bash
# 当前指标
cat /tmp/jcski-metrics.json | jq '.'

# 历史指标
tail -20 /tmp/jcski-metrics-history.jsonl
```

## 🔔 告警配置

### 告警条件

**系统级告警**:
- 内存使用 > 85%
- CPU使用 > 80%
- 磁盘使用 > 90%
- 系统负载 > 2.0
- 应用响应时间 > 3000ms
- 服务状态异常

**应用级告警**:
- 响应时间 > 2000ms
- 内存使用 > 800MB
- HTTP错误率 > 5%
- API端点异常

### 告警通知

**当前实现**:
- 日志记录告警信息
- 控制台输出告警
- 告警计数和历史记录

**扩展选项** (可自定义实现):
```bash
# 邮件通知
send_email_alert() {
    echo "$1" | mail -s "JCSKI Alert" admin@jcski.com
}

# Slack通知
send_slack_alert() {
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"'"$1"'"}' \
        "$SLACK_WEBHOOK_URL"
}

# 钉钉通知
send_dingtalk_alert() {
    curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"msgtype": "text","text": {"content": "'"$1"'"}}' \
        "$DINGTALK_WEBHOOK_URL"
}
```

## 🔧 自定义配置

### 调整监控阈值

**编辑监控脚本**:
```bash
vim scripts/system-monitor.sh

# 修改阈值变量
MEMORY_THRESHOLD=90      # 调整内存告警阈值
CPU_THRESHOLD=85         # 调整CPU告警阈值
DISK_THRESHOLD=95        # 调整磁盘告警阈值
```

**修改应用监控**:
```typescript
// server/middleware/monitoring.ts
const checkPerformanceAlerts = (metrics: RequestMetrics) => {
  // 调整响应时间阈值
  if (metrics.responseTime > 5000) { // 改为5秒
    alerts.push(`Slow response: ${metrics.path}`)
  }
  
  // 调整内存使用阈值
  if (metrics.memoryUsage > 900 * 1024 * 1024) { // 改为900MB
    alerts.push(`High memory usage`)
  }
}
```

### 扩展监控指标

**添加自定义指标**:
```typescript
// 在监控中间件中添加
interface CustomMetrics {
  databaseConnections: number
  cacheHitRate: number
  activeUsers: number
}

const collectCustomMetrics = (): CustomMetrics => {
  return {
    databaseConnections: getDatabaseConnectionCount(),
    cacheHitRate: getCacheHitRate(),
    activeUsers: getActiveUserCount()
  }
}
```

**添加业务指标**:
```bash
# 在系统监控脚本中添加
get_business_metrics() {
    local article_count=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM BlogPost WHERE published=1")
    local user_count=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM User")
    
    echo "{\"articles\":$article_count,\"users\":$user_count}"
}
```

## 📈 性能优化

### 监控系统优化

**内存使用优化**:
```typescript
// 限制历史数据大小
const MAX_METRICS_HISTORY = 1000  // 减少到500
const CLEANUP_INTERVAL = 5 * 60 * 1000  // 增加到10分钟

// 使用环形缓冲区
class CircularBuffer<T> {
  private buffer: T[] = []
  private size: number
  private index = 0
  
  constructor(size: number) {
    this.size = size
  }
  
  push(item: T) {
    this.buffer[this.index] = item
    this.index = (this.index + 1) % this.size
  }
}
```

**系统监控优化**:
```bash
# 减少监控频率
*/10 * * * * /path/to/system-monitor.sh check  # 改为10分钟

# 优化数据收集
get_memory_usage() {
    # 使用更轻量的方法
    awk '/MemTotal|MemAvailable/ {sum+=$2} END {print int((sum-$2)/sum*100)}' /proc/meminfo
}
```

## 🔍 故障排除

### 常见问题

1. **监控中间件未启动**
```bash
# 检查Nuxt配置
grep -A 10 "serverHandlers" nuxt.config.ts

# 检查中间件文件
ls -la server/middleware/monitoring.ts

# 重启应用
pm2 reload ecosystem.config.js
```

2. **API接口访问被拒绝**
```bash
# 检查认证令牌
grep MONITORING_TOKEN .env

# 测试健康检查（无需认证）
curl -I http://localhost:3222/api/monitoring/health

# 检查权限
ls -la server/api/monitoring/
```

3. **系统监控脚本失败**
```bash
# 检查依赖
which jq curl

# 检查权限
ls -la scripts/system-monitor.sh

# 手动测试
./scripts/system-monitor.sh check
```

4. **监控面板无法访问**
```bash
# 检查页面文件
ls -la pages/admin/monitoring.vue

# 检查管理后台路由
curl -I http://localhost:3222/admin/monitoring

# 检查认证状态
```

5. **定时任务未执行**
```bash
# 检查crontab
crontab -l | grep monitor

# 检查cron日志
sudo tail -f /var/log/cron

# 检查执行权限
ls -la scripts/system-monitor.sh
```

### 调试技巧

**启用调试日志**:
```bash
# 设置环境变量
export DEBUG=true

# 运行监控脚本
./scripts/system-monitor.sh check
```

**查看详细指标**:
```bash
# 实时监控数据
watch -n 5 'cat /tmp/jcski-metrics.json | jq .'

# API响应测试
curl -s http://localhost:3222/api/monitoring/health | jq '.'
```

**性能分析**:
```bash
# 监控脚本执行时间
time ./scripts/system-monitor.sh check

# 内存使用分析
ps aux | grep -E "(node|pm2|nginx)" | awk '{sum+=$6} END {print sum" KB"}'
```

## 📝 最佳实践

### 监控策略

1. **分层监控**: 系统层 → 应用层 → 业务层
2. **阈值设置**: 保守设置，避免误报
3. **数据保留**: 平衡存储成本和分析需求
4. **告警分级**: 区分警告、错误、紧急
5. **趋势分析**: 关注趋势而非单点数据

### 运维建议

1. **定期检查**:
   - 每日查看告警日志
   - 每周分析性能趋势
   - 每月调整监控阈值

2. **容量规划**:
   - 监控资源使用趋势
   - 提前预警资源瓶颈
   - 评估扩容需求

3. **事故响应**:
   - 建立告警响应流程
   - 准备应急处理脚本
   - 定期演练故障处理

## 📞 支持和扩展

### 技术支持

- **文档**: 查看本README和代码注释
- **日志**: 检查系统和应用日志
- **测试**: 使用测试命令验证功能
- **社区**: 参考Nuxt.js和Node.js社区

### 扩展功能

**可以扩展的功能**:
- 更丰富的图表和可视化
- 邮件/短信/Slack告警通知
- 更多业务指标监控
- 集成外部监控服务 (CloudWatch, DataDog)
- 机器学习异常检测
- 自动扩缩容建议

---

**版本**: v0.5.0  
**更新时间**: 2025-07-22  
**维护团队**: JCSKI Blog Performance Team  
**项目地址**: https://jcski.com