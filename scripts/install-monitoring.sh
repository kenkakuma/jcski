#!/bin/bash

# JCSKI Blog 监控系统安装脚本 - v0.5.0 步骤20
# 在AWS EC2上安装和配置性能监控系统
# 作者：JCSKI
# 创建时间：2025-07-22

set -euo pipefail

# 配置变量
PROJECT_DIR="/var/www/jcski-blog"
SCRIPTS_DIR="$PROJECT_DIR/scripts"
LOG_FILE="/var/log/jcski-monitoring-install.log"
CRON_USER="ec2-user"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 检查运行环境
check_environment() {
    log_info "检查监控系统运行环境..."
    
    # 检查Node.js版本
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        log_info "Node.js版本: $node_version"
    else
        log_error "Node.js未安装"
        exit 1
    fi
    
    # 检查PM2
    if command -v pm2 >/dev/null 2>&1; then
        log_info "PM2已安装"
    else
        log_warning "PM2未安装，某些监控功能可能不可用"
    fi
    
    # 检查必要工具
    local missing_tools=()
    
    for tool in curl jq; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            missing_tools+=("$tool")
        fi
    done
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_warning "缺少工具: ${missing_tools[*]}"
        install_dependencies "${missing_tools[@]}"
    fi
    
    log_success "环境检查完成"
}

# 安装依赖
install_dependencies() {
    local tools=("$@")
    log_info "安装缺少的依赖: ${tools[*]}"
    
    # 检查包管理器
    if command -v yum >/dev/null 2>&1; then
        # Amazon Linux / CentOS / RHEL
        for tool in "${tools[@]}"; do
            case "$tool" in
                jq)
                    sudo yum install -y epel-release
                    sudo yum install -y jq
                    ;;
                curl)
                    sudo yum install -y curl
                    ;;
            esac
        done
    elif command -v apt >/dev/null 2>&1; then
        # Ubuntu / Debian
        sudo apt update
        for tool in "${tools[@]}"; do
            sudo apt install -y "$tool"
        done
    else
        log_warning "未找到支持的包管理器，请手动安装: ${tools[*]}"
    fi
}

# 配置监控中间件
configure_monitoring_middleware() {
    log_info "配置监控中间件..."
    
    # 检查中间件文件是否存在
    local middleware_file="$PROJECT_DIR/server/middleware/monitoring.ts"
    if [[ ! -f "$middleware_file" ]]; then
        log_error "监控中间件文件不存在: $middleware_file"
        return 1
    fi
    
    # 检查Nuxt配置
    local nuxt_config="$PROJECT_DIR/nuxt.config.ts"
    if [[ -f "$nuxt_config" ]]; then
        # 检查是否已经配置了监控中间件
        if grep -q "monitoring" "$nuxt_config"; then
            log_info "监控中间件已在Nuxt配置中启用"
        else
            log_warning "请确保在nuxt.config.ts中配置监控中间件"
        fi
    fi
    
    log_success "监控中间件配置检查完成"
}

# 设置监控API访问权限
setup_monitoring_api() {
    log_info "设置监控API访问权限..."
    
    # 生成监控令牌（简单实现）
    local token="monitor-$(date +%s | sha256sum | head -c 16)"
    local env_file="$PROJECT_DIR/.env"
    
    if [[ -f "$env_file" ]]; then
        # 检查是否已有监控令牌
        if grep -q "MONITORING_TOKEN" "$env_file"; then
            log_info "监控令牌已存在"
        else
            echo "MONITORING_TOKEN=$token" >> "$env_file"
            log_success "监控令牌已添加到环境变量"
        fi
    else
        log_warning "环境变量文件不存在: $env_file"
    fi
    
    # 设置API访问权限
    local api_dir="$PROJECT_DIR/server/api/monitoring"
    if [[ -d "$api_dir" ]]; then
        # 确保API文件权限正确
        chmod 644 "$api_dir"/*.ts 2>/dev/null || true
        log_success "监控API权限已设置"
    else
        log_error "监控API目录不存在: $api_dir"
        return 1
    fi
}

# 安装系统监控脚本
install_system_monitor() {
    log_info "安装系统监控脚本..."
    
    local monitor_script="$SCRIPTS_DIR/system-monitor.sh"
    
    if [[ ! -f "$monitor_script" ]]; then
        log_error "系统监控脚本不存在: $monitor_script"
        return 1
    fi
    
    # 确保脚本可执行
    chmod +x "$monitor_script"
    
    # 创建日志目录
    sudo mkdir -p /var/log
    sudo touch /var/log/jcski-system-monitor.log
    sudo touch /var/log/jcski-alerts.log
    sudo chown "$CRON_USER:$CRON_USER" /var/log/jcski-*.log 2>/dev/null || true
    
    # 测试脚本
    if "$monitor_script" check >/dev/null 2>&1; then
        log_success "系统监控脚本测试通过"
    else
        log_warning "系统监控脚本测试失败，可能缺少依赖"
    fi
}

# 配置定时监控任务
setup_monitoring_cron() {
    log_info "配置定时监控任务..."
    
    local monitor_script="$SCRIPTS_DIR/system-monitor.sh"
    local temp_cron="/tmp/jcski-monitoring-crontab"
    
    # 备份现有crontab
    crontab -l 2>/dev/null > "$temp_cron" || touch "$temp_cron"
    
    # 移除现有的监控任务
    grep -v "jcski.*monitor" "$temp_cron" > "${temp_cron}.new" || touch "${temp_cron}.new"
    
    # 添加新的监控任务
    cat >> "${temp_cron}.new" << EOF

# JCSKI Blog 系统监控任务 - v0.5.0
# 每5分钟执行一次系统监控检查
*/5 * * * * $monitor_script check >> /var/log/jcski-system-monitor.log 2>&1

# 每小时生成监控报告
0 * * * * $monitor_script report > /tmp/jcski-hourly-report.txt 2>&1

EOF
    
    # 安装新的crontab
    crontab "${temp_cron}.new"
    rm -f "$temp_cron" "${temp_cron}.new"
    
    log_success "定时监控任务已配置"
}

# 配置日志轮转
setup_log_rotation() {
    log_info "配置监控日志轮转..."
    
    local logrotate_config="/etc/logrotate.d/jcski-monitoring"
    
    if command -v sudo >/dev/null 2>&1; then
        sudo tee "$logrotate_config" > /dev/null << 'EOF'
/var/log/jcski-system-monitor.log
/var/log/jcski-alerts.log
/var/log/jcski-monitoring-install.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
    create 644 ec2-user ec2-user
}
EOF
        log_success "监控日志轮转已配置"
    else
        log_warning "无sudo权限，跳过日志轮转配置"
    fi
}

# 创建监控仪表板配置
setup_dashboard_config() {
    log_info "配置监控仪表板..."
    
    local dashboard_page="$PROJECT_DIR/pages/admin/monitoring.vue"
    
    if [[ -f "$dashboard_page" ]]; then
        log_success "监控仪表板页面已存在"
    else
        log_warning "监控仪表板页面不存在: $dashboard_page"
    fi
    
    # 添加导航链接（如果管理后台存在）
    local admin_layout="$PROJECT_DIR/layouts/admin.vue"
    if [[ -f "$admin_layout" ]]; then
        if grep -q "monitoring" "$admin_layout"; then
            log_info "管理后台已包含监控导航"
        else
            log_info "可以在管理后台添加监控导航链接"
        fi
    fi
}

# 测试监控系统
test_monitoring_system() {
    log_info "测试监控系统..."
    
    local tests_passed=0
    local total_tests=4
    
    # 测试1: 健康检查API
    if curl -s "http://localhost:3222/api/monitoring/health" | grep -q "status"; then
        log_success "✓ 健康检查API正常"
        tests_passed=$((tests_passed + 1))
    else
        log_warning "✗ 健康检查API异常"
    fi
    
    # 测试2: 性能指标API
    if curl -s -H "Authorization: Bearer monitor-token" "http://localhost:3222/api/monitoring/metrics" | grep -q "success"; then
        log_success "✓ 性能指标API正常"
        tests_passed=$((tests_passed + 1))
    else
        log_warning "✗ 性能指标API异常"
    fi
    
    # 测试3: 系统监控脚本
    if "$SCRIPTS_DIR/system-monitor.sh" check >/dev/null 2>&1; then
        log_success "✓ 系统监控脚本正常"
        tests_passed=$((tests_passed + 1))
    else
        log_warning "✗ 系统监控脚本异常"
    fi
    
    # 测试4: cron任务配置
    if crontab -l | grep -q "system-monitor.sh"; then
        log_success "✓ 定时任务已配置"
        tests_passed=$((tests_passed + 1))
    else
        log_warning "✗ 定时任务未配置"
    fi
    
    log_info "监控系统测试完成: $tests_passed/$total_tests 项通过"
    
    if [[ $tests_passed -eq $total_tests ]]; then
        return 0
    else
        return 1
    fi
}

# 重启相关服务
restart_services() {
    log_info "重启相关服务..."
    
    # 重启PM2应用以加载监控中间件
    if command -v pm2 >/dev/null 2>&1 && pm2 list 2>/dev/null | grep -q online; then
        pm2 reload ecosystem.config.js
        log_success "PM2应用已重启"
    else
        log_warning "PM2未运行或无应用，请手动重启应用"
    fi
    
    # 启动系统监控（如果未运行）
    if ! pgrep -f "system-monitor.sh monitor" >/dev/null; then
        nohup "$SCRIPTS_DIR/system-monitor.sh" monitor 300 >/dev/null 2>&1 &
        log_success "系统监控已启动"
    else
        log_info "系统监控已在运行"
    fi
}

# 生成安装报告
generate_install_report() {
    local report_file="/tmp/jcski-monitoring-install-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "JCSKI Blog 监控系统安装报告"
        echo "============================="
        echo "安装时间: $(date)"
        echo "执行用户: $(whoami)"
        echo "项目目录: $PROJECT_DIR"
        echo ""
        echo "已安装的监控组件:"
        echo "- 应用性能监控中间件"
        echo "- 监控API接口 (/api/monitoring/health, /api/monitoring/metrics)"
        echo "- 系统资源监控脚本"
        echo "- 监控仪表板页面"
        echo "- 定时监控任务"
        echo "- 日志轮转配置"
        echo ""
        echo "监控功能:"
        echo "- 内存使用监控 (阈值: 85%)"
        echo "- CPU使用监控 (阈值: 80%)"
        echo "- 磁盘使用监控 (阈值: 90%)"
        echo "- 系统负载监控 (阈值: 2.0)"
        echo "- 应用响应时间监控 (阈值: 3000ms)"
        echo "- 服务状态监控 (Nginx, PM2)"
        echo ""
        echo "访问地址:"
        echo "- 健康检查: http://localhost:3222/api/monitoring/health"
        echo "- 性能指标: http://localhost:3222/api/monitoring/metrics"
        echo "- 监控面板: http://localhost:3222/admin/monitoring"
        echo ""
        echo "日志文件:"
        echo "- 系统监控: /var/log/jcski-system-monitor.log"
        echo "- 告警日志: /var/log/jcski-alerts.log"
        echo "- 安装日志: $LOG_FILE"
        echo ""
        echo "定时任务:"
        crontab -l | grep "jcski.*monitor" || echo "未配置定时任务"
        echo ""
        echo "下一步建议:"
        echo "1. 访问监控面板检查系统状态"
        echo "2. 根据需要调整告警阈值"
        echo "3. 配置邮件或消息通知"
        echo "4. 设置更详细的监控指标"
        
    } > "$report_file"
    
    log_success "安装报告已生成: $report_file"
    cat "$report_file"
}

# 主函数
main() {
    log_info "开始安装JCSKI Blog监控系统 v0.5.0"
    log_info "目标：为AWS EC2 t2.micro提供轻量级性能监控"
    
    check_environment
    configure_monitoring_middleware
    setup_monitoring_api
    install_system_monitor
    setup_monitoring_cron
    setup_log_rotation
    setup_dashboard_config
    
    restart_services
    
    # 等待服务启动
    sleep 5
    
    if test_monitoring_system; then
        log_success "监控系统安装成功！"
    else
        log_warning "监控系统安装完成，但部分功能可能需要手动配置"
    fi
    
    generate_install_report
    
    log_info "安装完成！请访问 /admin/monitoring 查看监控面板"
}

# 脚本参数处理
case "${1:-}" in
    --test)
        log_info "TEST模式：仅测试监控系统"
        test_monitoring_system
        exit 0
        ;;
    --uninstall)
        log_info "UNINSTALL模式：移除监控系统"
        # 移除cron任务
        crontab -l 2>/dev/null | grep -v "jcski.*monitor" | crontab - || true
        # 停止监控进程
        "$SCRIPTS_DIR/system-monitor.sh" stop 2>/dev/null || true
        # 移除日志轮转
        sudo rm -f /etc/logrotate.d/jcski-monitoring 2>/dev/null || true
        log_success "监控系统已卸载"
        exit 0
        ;;
    --help|-h)
        echo "JCSKI Blog 监控系统安装脚本"
        echo "用法: $0 [选项]"
        echo "选项:"
        echo "  --test        仅测试监控系统"
        echo "  --uninstall   卸载监控系统"
        echo "  --help        显示此帮助信息"
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