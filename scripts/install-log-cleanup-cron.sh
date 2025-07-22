#!/bin/bash

# JCSKI Blog 日志清理定时任务安装脚本 - v0.5.0 步骤18
# 在AWS EC2上安装和配置定时日志清理任务
# 作者：JCSKI
# 创建时间：2025-07-22

set -euo pipefail

# 配置变量
PROJECT_DIR="/var/www/jcski-blog"
SCRIPT_PATH="$PROJECT_DIR/scripts/log-cleanup.sh"
CRON_USER="ec2-user"
BACKUP_CRON_FILE="/tmp/jcski-crontab-backup-$(date +%Y%m%d-%H%M%S)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 检查运行环境
check_environment() {
    log_info "检查运行环境..."
    
    # 检查是否在EC2上
    if [[ ! -f /sys/hypervisor/uuid ]] || ! grep -q "^ec2" /sys/hypervisor/uuid 2>/dev/null; then
        log_warning "可能不在AWS EC2环境中，继续安装..."
    fi
    
    # 检查脚本文件是否存在
    if [[ ! -f "$SCRIPT_PATH" ]]; then
        log_error "日志清理脚本不存在: $SCRIPT_PATH"
        exit 1
    fi
    
    # 检查脚本是否可执行
    if [[ ! -x "$SCRIPT_PATH" ]]; then
        log_info "设置脚本执行权限"
        chmod +x "$SCRIPT_PATH"
    fi
    
    # 检查cron服务
    if ! command -v crontab >/dev/null 2>&1; then
        log_error "crontab命令未找到，请先安装cron服务"
        exit 1
    fi
    
    log_success "环境检查完成"
}

# 备份现有crontab
backup_crontab() {
    log_info "备份现有crontab配置..."
    
    if crontab -l > "$BACKUP_CRON_FILE" 2>/dev/null; then
        log_success "crontab已备份到: $BACKUP_CRON_FILE"
    else
        log_info "没有现有的crontab配置"
        touch "$BACKUP_CRON_FILE"
    fi
}

# 安装cron任务
install_cron_jobs() {
    log_info "安装日志清理定时任务..."
    
    # 创建新的crontab内容
    local temp_cron="/tmp/jcski-new-crontab"
    
    # 保留现有的cron任务（如果有）
    crontab -l 2>/dev/null | grep -v "jcski-blog.*log-cleanup" > "$temp_cron" || touch "$temp_cron"
    
    # 添加JCSKI Blog日志清理任务
    cat >> "$temp_cron" << EOF

# JCSKI Blog 日志清理定时任务 - v0.5.0
# 每天凌晨2点执行日志清理
0 2 * * * $SCRIPT_PATH --force >> /var/log/jcski-log-cleanup.log 2>&1

# 每周日执行深度清理
0 3 * * 0 $SCRIPT_PATH --force >> /var/log/jcski-log-cleanup.log 2>&1

# 每月1号清理cron日志本身
0 1 1 * * echo "" > /var/log/jcski-log-cleanup.log 2>/dev/null || true

EOF
    
    # 安装新的crontab
    crontab "$temp_cron"
    rm -f "$temp_cron"
    
    log_success "定时任务安装完成"
}

# 验证安装结果
verify_installation() {
    log_info "验证定时任务安装..."
    
    local cron_count=$(crontab -l 2>/dev/null | grep -c "jcski.*log-cleanup" || echo 0)
    
    if [[ $cron_count -gt 0 ]]; then
        log_success "发现 $cron_count 个JCSKI日志清理任务"
        
        echo ""
        log_info "当前crontab配置:"
        echo "=================================="
        crontab -l 2>/dev/null | grep -A 2 -B 1 "jcski.*log-cleanup" || echo "无相关任务"
        echo "=================================="
    else
        log_error "定时任务安装失败"
        exit 1
    fi
}

# 测试脚本执行
test_script() {
    log_info "测试日志清理脚本..."
    
    # 先执行dry-run模式
    log_info "执行预览模式测试..."
    if "$SCRIPT_PATH" --dry-run; then
        log_success "脚本测试通过"
    else
        log_error "脚本测试失败"
        return 1
    fi
}

# 创建日志目录
create_log_directory() {
    log_info "创建日志目录..."
    
    # 确保日志目录存在
    local log_dir="/var/log"
    if [[ ! -d "$log_dir" ]]; then
        sudo mkdir -p "$log_dir" 2>/dev/null || {
            log_warning "无法创建系统日志目录，使用项目目录"
            log_dir="$PROJECT_DIR/logs"
            mkdir -p "$log_dir"
        }
    fi
    
    # 确保日志文件可写
    touch "$log_dir/jcski-log-cleanup.log" 2>/dev/null || {
        log_warning "无法写入系统日志，请检查权限"
    }
    
    log_success "日志目录配置完成"
}

# 设置logrotate配置（可选）
setup_logrotate() {
    log_info "配置logrotate..."
    
    local logrotate_config="/etc/logrotate.d/jcski-blog"
    
    if command -v sudo >/dev/null 2>&1; then
        sudo tee "$logrotate_config" > /dev/null << EOF
/var/log/jcski-log-cleanup.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}

/var/www/jcski-blog/logs/*.log {
    weekly
    missingok
    rotate 4
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
        log_success "logrotate配置已创建: $logrotate_config"
    else
        log_warning "无sudo权限，跳过logrotate配置"
    fi
}

# 显示使用说明
show_usage_info() {
    log_info "安装完成！使用说明："
    echo ""
    echo "1. 定时任务计划:"
    echo "   - 每天 02:00 - 自动清理日志"
    echo "   - 每周日 03:00 - 深度清理"
    echo "   - 每月1号 01:00 - 清理cron日志"
    echo ""
    echo "2. 手动执行命令:"
    echo "   - 预览模式: $SCRIPT_PATH --dry-run"
    echo "   - 立即清理: $SCRIPT_PATH --force"
    echo "   - 查看帮助: $SCRIPT_PATH --help"
    echo ""
    echo "3. 查看定时任务:"
    echo "   - 查看crontab: crontab -l"
    echo "   - 查看日志: tail -f /var/log/jcski-log-cleanup.log"
    echo ""
    echo "4. 卸载定时任务:"
    echo "   - 恢复备份: crontab $BACKUP_CRON_FILE"
    echo "   - 编辑crontab: crontab -e"
    echo ""
    log_success "日志清理系统已就绪！"
}

# 主函数
main() {
    log_info "开始安装JCSKI Blog日志清理定时任务..."
    
    check_environment
    backup_crontab
    create_log_directory
    test_script
    install_cron_jobs
    verify_installation
    setup_logrotate
    show_usage_info
    
    log_success "定时任务安装完成！"
}

# 脚本参数处理
case "${1:-}" in
    --uninstall)
        log_info "卸载模式：移除所有JCSKI相关定时任务"
        crontab -l 2>/dev/null | grep -v "jcski.*log-cleanup" | crontab -
        log_success "定时任务已移除"
        exit 0
        ;;
    --help|-h)
        echo "JCSKI Blog 日志清理定时任务安装脚本"
        echo "用法: $0 [选项]"
        echo "选项:"
        echo "  --uninstall  卸载所有相关定时任务"
        echo "  --help       显示此帮助信息"
        exit 0
        ;;
    "")
        # 默认安装模式
        ;;
    *)
        log_error "未知参数: $1"
        echo "使用 --help 查看帮助信息"
        exit 1
        ;;
esac

# 执行主函数
main "$@"