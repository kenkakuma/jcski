#!/bin/bash

# JCSKI Blog 内存优化启动脚本
# v0.5.0 - AWS EC2 t2.micro (1GB RAM) 优化配置

echo "🚀 JCSKI Blog 内存优化启动 (v0.5.0)"
echo "📊 目标环境: AWS EC2 t2.micro (1GB RAM)"
echo ""

# 设置Node.js内存优化环境变量
export NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"
export UV_THREADPOOL_SIZE=4
export NODE_NO_WARNINGS=1

# 检查系统内存
echo "💾 系统内存信息:"
if command -v free >/dev/null 2>&1; then
    free -h
elif command -v vm_stat >/dev/null 2>&1; then
    vm_stat | head -4
fi

# 检查Node.js版本
echo ""
echo "🟢 Node.js版本: $(node --version)"

# 显示内存限制配置
echo ""
echo "⚙️ 内存优化配置:"
echo "  - 老生代堆内存限制: 512MB"
echo "  - 新生代堆内存限制: 64MB"
echo "  - 线程池大小: 4"
echo "  - 垃圾回收优化: 开启"
echo "  - 警告输出: 禁用"

# 构建项目
echo ""
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

# 启动应用
echo ""
echo "🚀 启动应用 (内存优化模式)..."
echo "📍 地址: http://localhost:3003/"
echo "💾 内存限制: 512MB"
echo ""

# 使用内存优化参数启动
node \
  --max-old-space-size=512 \
  --max-new-space-size=64 \
  --optimize-for-size \
  --gc-interval=100 \
  --initial-old-space-size=256 \
  .output/server/index.mjs