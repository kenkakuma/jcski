#!/bin/bash

# JCSKI Blog 系统日志清理脚本 - v0.5.0 步骤18
# 自动清理Nginx、PM2和应用日志，优化AWS EC2 t2.micro存储空间
# 作者：JCSKI
# 创建时间：2025-07-22
# 用途：通过cron定期运行，保持系统日志文件在合理大小

# 设置错误处理
set -euo pipefail

# 配置变量
LOG_DIR="/var/log"
NGINX_LOG_DIR="$LOG_DIR/nginx"
PM2_LOG_DIR="$HOME/.pm2/logs"
APP_LOG_DIR="/var/www/jcski-blog/logs"
BACKUP_DIR="/tmp/log-backups/$(date +%Y%m%d)"

# 日志保留策略 (天数)
NGINX_RETAIN_DAYS=7      # Nginx日志保留7天
PM2_RETAIN_DAYS=5        # PM2日志保留5天
APP_RETAIN_DAYS=10       # 应用日志保留10天
SYSTEM_RETAIN_DAYS=3     # 系统日志保留3天

# 日志大小限制 (MB)
MAX_LOG_SIZE=10          # 单个日志文件最大10MB
MAX_TOTAL_SIZE=100       # 所有日志文件总计最大100MB

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 创建备份目录
create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        log_info "创建备份目录: $BACKUP_DIR"
    fi
}

# 检查磁盘空间
check_disk_space() {
    local available_mb
    
    # 跨平台磁盘空间检查
    if command -v df >/dev/null 2>&1; then
        if df --output=avail /var >/dev/null 2>&1; then
            # Linux风格
            local available_space=$(df /var --output=avail | tail -1)
            available_mb=$((available_space / 1024))
        else
            # macOS/BSD风格
            available_mb=$(df -m /var 2>/dev/null | awk 'NR==2 {print $4}' || echo 1000)
        fi
    else
        log_warning "无法检查磁盘空间，使用默认值"
        available_mb=1000
    fi
    
    log_info "当前可用磁盘空间: ${available_mb}MB"
    
    if [[ $available_mb -lt 500 ]]; then
        log_warning "磁盘空间不足500MB，将执行积极清理策略"
        NGINX_RETAIN_DAYS=3
        PM2_RETAIN_DAYS=2
        APP_RETAIN_DAYS=5
        MAX_LOG_SIZE=5
        MAX_TOTAL_SIZE=50
    fi
}

# 清理Nginx日志
clean_nginx_logs() {
    log_info "开始清理Nginx日志..."
    
    if [[ ! -d "$NGINX_LOG_DIR" ]]; then
        log_warning "Nginx日志目录不存在: $NGINX_LOG_DIR"
        return 0
    fi
    
    local cleaned_count=0
    
    # 清理access.log和error.log的旧文件
    for log_type in access error; do
        local log_pattern="$NGINX_LOG_DIR/${log_type}.log.*"
        
        # 删除超过保留天数的日志
        if compgen -G "$log_pattern" > /dev/null; then
            find "$NGINX_LOG_DIR" -name "${log_type}.log.*" -mtime +$NGINX_RETAIN_DAYS -exec rm -f {} \; 2>/dev/null || true
            cleaned_count=$((cleaned_count + 1))
        fi
        
        # 检查当前日志文件大小
        local current_log="$NGINX_LOG_DIR/${log_type}.log"
        if [[ -f "$current_log" ]]; then
            local log_size=$(du -m "$current_log" | cut -f1)
            if [[ $log_size -gt $MAX_LOG_SIZE ]]; then
                log_warning "Nginx ${log_type}.log 过大 (${log_size}MB)，执行截断"
                # 备份并截断
                cp "$current_log" "$BACKUP_DIR/nginx-${log_type}-$(date +%H%M%S).log" 2>/dev/null || true
                tail -n 1000 "$current_log" > "$current_log.tmp" && mv "$current_log.tmp" "$current_log"
            fi
        fi
    done
    
    log_success "Nginx日志清理完成，处理了 $cleaned_count 个日志类型"
}

# 清理PM2日志
clean_pm2_logs() {
    log_info "开始清理PM2日志..."
    
    if [[ ! -d "$PM2_LOG_DIR" ]]; then
        log_warning "PM2日志目录不存在: $PM2_LOG_DIR"
        return 0
    fi
    
    local cleaned_files=0
    
    # 清理旧的日志文件
    find "$PM2_LOG_DIR" -name "*.log" -mtime +$PM2_RETAIN_DAYS -exec rm -f {} \; 2>/dev/null || true
    
    # 检查并截断大日志文件
    for log_file in "$PM2_LOG_DIR"/*.log; do
        if [[ -f "$log_file" ]]; then
            local log_size=$(du -m "$log_file" | cut -f1)
            if [[ $log_size -gt $MAX_LOG_SIZE ]]; then
                log_warning "PM2日志文件过大: $(basename "$log_file") (${log_size}MB)"
                # 备份最后1000行
                tail -n 1000 "$log_file" > "$log_file.tmp" && mv "$log_file.tmp" "$log_file"
                cleaned_files=$((cleaned_files + 1))
            fi
        fi
    done
    
    # PM2 flush命令清理
    if command -v pm2 >/dev/null 2>&1; then
        pm2 flush >/dev/null 2>&1 || log_warning "PM2 flush命令执行失败"
    fi
    
    log_success "PM2日志清理完成，截断了 $cleaned_files 个大文件"
}

# 清理应用日志
clean_app_logs() {
    log_info "开始清理应用日志..."
    
    if [[ ! -d "$APP_LOG_DIR" ]]; then
        log_info "应用日志目录不存在，跳过: $APP_LOG_DIR"
        return 0
    fi
    
    local cleaned_files=0
    
    # 清理旧的应用日志
    find "$APP_LOG_DIR" -name "*.log" -mtime +$APP_RETAIN_DAYS -exec rm -f {} \; 2>/dev/null || true
    
    # 检查并处理大日志文件
    for log_file in "$APP_LOG_DIR"/*.log; do
        if [[ -f "$log_file" ]]; then
            local log_size=$(du -m "$log_file" | cut -f1)
            if [[ $log_size -gt $MAX_LOG_SIZE ]]; then
                log_warning "应用日志文件过大: $(basename "$log_file") (${log_size}MB)"
                tail -n 2000 "$log_file" > "$log_file.tmp" && mv "$log_file.tmp" "$log_file"
                cleaned_files=$((cleaned_files + 1))
            fi
        fi
    done
    
    log_success "应用日志清理完成，处理了 $cleaned_files 个文件"
}

# 清理系统日志
clean_system_logs() {
    log_info "开始清理系统日志..."
    
    local cleaned_count=0
    
    # 清理旧的系统日志（需要sudo权限）
    if command -v sudo >/dev/null 2>&1; then
        # 清理journalctl日志
        sudo journalctl --vacuum-time=${SYSTEM_RETAIN_DAYS}d >/dev/null 2>&1 || true
        cleaned_count=$((cleaned_count + 1))
        
        # 清理/var/log下的旧文件
        sudo find /var/log -name "*.log.*" -mtime +$SYSTEM_RETAIN_DAYS -exec rm -f {} \; 2>/dev/null || true
        cleaned_count=$((cleaned_count + 1))
    else
        log_warning "无sudo权限，跳过系统日志清理"
    fi
    
    log_success "系统日志清理完成，处理了 $cleaned_count 个任务"
}

# 清理临时文件
clean_temp_files() {
    log_info "开始清理临时文件..."
    
    local cleaned_items=0
    
    # 清理/tmp下的旧文件
    find /tmp -name "*.tmp" -mtime +1 -exec rm -f {} \; 2>/dev/null || true
    find /tmp -name "*.log" -mtime +1 -exec rm -f {} \; 2>/dev/null || true
    cleaned_items=$((cleaned_items + 2))
    
    # 清理Node.js缓存
    if [[ -d "$HOME/.npm/_cacache" ]]; then
        find "$HOME/.npm/_cacache" -mtime +7 -delete 2>/dev/null || true
        cleaned_items=$((cleaned_items + 1))
    fi
    
    # 清理旧的备份目录
    find "/tmp/log-backups" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    
    log_success "临时文件清理完成，处理了 $cleaned_items 项"
}

# 生成清理报告
generate_report() {
    local total_log_size=0
    local report_file="/tmp/jcski-log-cleanup-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "JCSKI Blog 日志清理报告"
        echo "========================"
        echo "清理时间: $(date)"
        echo "清理策略:"
        echo "  - Nginx日志保留: ${NGINX_RETAIN_DAYS}天"
        echo "  - PM2日志保留: ${PM2_RETAIN_DAYS}天"
        echo "  - 应用日志保留: ${APP_RETAIN_DAYS}天"
        echo "  - 单文件最大: ${MAX_LOG_SIZE}MB"
        echo ""
        echo "磁盘使用情况:"
        if df -h /var >/dev/null 2>&1; then
            df -h /var 2>/dev/null | tail -1 || echo "无法获取磁盘使用情况"
        else
            echo "无法获取磁盘使用情况"
        fi
        echo ""
        echo "日志目录大小:"
        
        # 计算各目录大小
        for dir in "$NGINX_LOG_DIR" "$PM2_LOG_DIR" "$APP_LOG_DIR"; do
            if [[ -d "$dir" ]]; then
                local dir_size=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "0B")
                echo "  - $dir: $dir_size"
            fi
        done
        
        echo ""
        echo "备份文件位置: $BACKUP_DIR"
        if [[ -d "$BACKUP_DIR" ]]; then
            echo "备份文件数量: $(find "$BACKUP_DIR" -type f | wc -l 2>/dev/null || echo 0)"
        fi
    } > "$report_file"
    
    log_success "清理报告已生成: $report_file"
    
    # 显示报告内容
    cat "$report_file"
}

# 主函数
main() {
    log_info "开始JCSKI Blog系统日志清理 v0.5.0"
    log_info "目标：优化AWS EC2 t2.micro存储空间使用"
    
    # 检查运行环境
    check_disk_space
    
    # 创建备份目录
    create_backup_dir
    
    # 执行各项清理任务
    clean_nginx_logs
    clean_pm2_logs
    clean_app_logs
    clean_system_logs
    clean_temp_files
    
    # 生成报告
    generate_report
    
    log_success "所有日志清理任务完成！"
}

# 脚本参数处理
case "${1:-}" in
    --dry-run)
        log_info "DRY RUN模式：只显示将要清理的文件，不实际删除"
        # 在所有find命令中添加-print而不是-delete/-exec rm
        ;;
    --force)
        log_info "FORCE模式：跳过确认，直接清理"
        ;;
    --help|-h)
        echo "JCSKI Blog 日志清理脚本"
        echo "用法: $0 [选项]"
        echo "选项:"
        echo "  --dry-run    预览模式，不实际删除文件"
        echo "  --force      强制模式，跳过确认"
        echo "  --help       显示此帮助信息"
        exit 0
        ;;
    "")
        # 默认模式，正常执行
        ;;
    *)
        log_error "未知参数: $1"
        echo "使用 --help 查看帮助信息"
        exit 1
        ;;
esac

# 执行主函数
main "$@"