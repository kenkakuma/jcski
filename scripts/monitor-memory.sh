#!/bin/bash

# JCSKI Blog 内存监控脚本
# v0.5.0 - 实时监控Node.js应用内存使用

echo "📊 JCSKI Blog 内存监控工具 (v0.5.0)"
echo "🎯 优化目标: AWS EC2 t2.micro (1GB RAM)"
echo ""

# 检查PM2是否运行
if command -v pm2 >/dev/null 2>&1; then
    if pm2 list | grep -q "jcski-blog"; then
        echo "📈 PM2应用状态:"
        pm2 show jcski-blog
        echo ""
        
        echo "💾 PM2内存监控:"
        pm2 monit
    else
        echo "⚠️ PM2中未找到jcski-blog应用"
    fi
else
    echo "⚠️ PM2未安装，使用系统监控"
fi

# 查找Node.js进程
echo "🔍 Node.js进程监控:"
if command -v ps >/dev/null 2>&1; then
    ps aux | grep -E "(node|jcski)" | grep -v grep
fi

echo ""
echo "📊 系统内存使用:"
if command -v free >/dev/null 2>&1; then
    # Linux系统
    free -h
elif command -v vm_stat >/dev/null 2>&1; then
    # macOS系统
    echo "物理内存: $(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024 " GB"}')"
    vm_stat | head -10
fi

echo ""
echo "💽 磁盘使用:"
df -h | head -1
df -h | grep -E "/$|/var" | head -3

# 如果在EC2上，显示更多系统信息
if [ -f /sys/hypervisor/uuid ] && [ "$(head -c 3 /sys/hypervisor/uuid)" == "ec2" ]; then
    echo ""
    echo "☁️ AWS EC2系统信息:"
    echo "实例类型: $(curl -s http://169.254.169.254/latest/meta-data/instance-type 2>/dev/null || echo '未知')"
    echo "可用区: $(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone 2>/dev/null || echo '未知')"
fi

# 内存使用警告
echo ""
if command -v free >/dev/null 2>&1; then
    MEMORY_USAGE=$(free | awk '/^Mem:/{printf("%.1f", $3/$2 * 100)}')
    if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
        echo "🚨 警告: 内存使用率 ${MEMORY_USAGE}% (建议 < 80%)"
    else
        echo "✅ 内存使用率: ${MEMORY_USAGE}% (良好)"
    fi
fi

echo ""
echo "🔄 实时监控命令:"
echo "  监控PM2: pm2 monit"
echo "  查看日志: pm2 logs jcski-blog"
echo "  内存状态: watch -n 1 'free -h'"
echo "  进程监控: htop"