#!/bin/bash

# JCSKI Blog 系统监控脚本 - v0.5.0 步骤20
# AWS EC2 t2.micro 系统资源监控和告警
# 作者：JCSKI
# 创建时间：2025-07-22

set -euo pipefail

# 配置变量
LOG_FILE="/var/log/jcski-system-monitor.log"
ALERT_LOG="/var/log/jcski-alerts.log"
METRICS_FILE="/tmp/jcski-metrics.json"
PID_FILE="/var/run/jcski-monitor.pid"

# 阈值配置（适配t2.micro 1GB RAM）
MEMORY_THRESHOLD=85      # 内存使用超过85%告警
CPU_THRESHOLD=80         # CPU使用超过80%告警
DISK_THRESHOLD=90        # 磁盘使用超过90%告警
LOAD_THRESHOLD=2.0       # 系统负载超过2.0告警
RESPONSE_TIME_THRESHOLD=3000  # 响应时间超过3秒告警

# 服务配置
APP_URL="http://localhost:3222"
HEALTH_ENDPOINT="/api/monitoring/health"
METRICS_ENDPOINT="/api/monitoring/metrics"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE" "$ALERT_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE" "$ALERT_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 创建PID文件
create_pid_file() {
    echo $$ > "$PID_FILE"
}

# 清理PID文件
cleanup_pid_file() {
    rm -f "$PID_FILE"
}

# 捕获退出信号
trap cleanup_pid_file EXIT

# 检查是否已经在运行
check_running() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log_error "监控脚本已经在运行 (PID: $pid)"
            exit 1
        else
            rm -f "$PID_FILE"
        fi
    fi
}

# 获取系统内存使用情况
get_memory_usage() {
    if command -v free >/dev/null 2>&1; then
        # Linux系统
        local mem_info=$(free | grep '^Mem:')
        local total=$(echo "$mem_info" | awk '{print $2}')
        local used=$(echo "$mem_info" | awk '{print $3}')
        local usage_percent=$((used * 100 / total))
        
        echo "{\"total\":$total,\"used\":$used,\"percent\":$usage_percent}"
    else
        # macOS系统
        local mem_pressure=$(memory_pressure | head -1 | awk -F': ' '{print $2}' | tr -d '%' || echo "0")
        echo "{\"total\":1073741824,\"used\":0,\"percent\":$mem_pressure}"
    fi
}

# 获取CPU使用情况
get_cpu_usage() {
    if command -v iostat >/dev/null 2>&1; then
        # 使用iostat获取CPU使用率
        local cpu_usage=$(iostat -c 1 2 | tail -1 | awk '{print 100-$6}')
        printf "%.1f" "$cpu_usage"
    elif command -v top >/dev/null 2>&1; then
        # 使用top获取CPU使用率（Linux）
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}' || echo "0")
        echo "$cpu_usage"
    else
        # macOS系统使用ps命令
        local cpu_usage=$(ps -A -o %cpu | awk '{s+=$1} END {print s}')
        printf "%.1f" "${cpu_usage:-0}"
    fi
}

# 获取磁盘使用情况
get_disk_usage() {
    local disk_info=$(df -h / | tail -1)
    local usage_percent=$(echo "$disk_info" | awk '{print $5}' | tr -d '%')
    local available=$(echo "$disk_info" | awk '{print $4}')
    
    echo "{\"percent\":$usage_percent,\"available\":\"$available\"}"
}

# 获取系统负载
get_load_average() {
    if command -v uptime >/dev/null 2>&1; then
        local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
        echo "$load_avg"
    else
        echo "0.0"
    fi
}

# 检查应用程序健康状态
check_app_health() {
    local start_time=$(date +%s%3N)
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$APP_URL$HEALTH_ENDPOINT" || echo "000")
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    echo "{\"status_code\":$status_code,\"response_time\":$response_time}"
}

# 检查关键服务状态
check_services() {
    local services=("nginx" "pm2")
    local results=()
    
    for service in "${services[@]}"; do
        if command -v systemctl >/dev/null 2>&1; then
            # systemd系统
            if systemctl is-active "$service" >/dev/null 2>&1; then
                results+=("\"$service\":\"running\"")
            else
                results+=("\"$service\":\"stopped\"")
            fi
        elif command -v service >/dev/null 2>&1; then
            # SysV init系统
            if service "$service" status >/dev/null 2>&1; then
                results+=("\"$service\":\"running\"")
            else
                results+=("\"$service\":\"stopped\"")
            fi
        elif [[ "$service" == "pm2" ]] && command -v pm2 >/dev/null 2>&1; then
            # PM2特殊处理
            if pm2 list 2>/dev/null | grep -q online; then
                results+=("\"pm2\":\"running\"")
            else
                results+=("\"pm2\":\"stopped\"")
            fi
        else
            results+=("\"$service\":\"unknown\"")
        fi
    done
    
    local services_json=$(printf "%s," "${results[@]}")
    services_json="{${services_json%,}}"
    echo "$services_json"
}

# 生成系统指标
collect_metrics() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    local memory=$(get_memory_usage)
    local cpu=$(get_cpu_usage)
    local disk=$(get_disk_usage)
    local load=$(get_load_average)
    local app_health=$(check_app_health)
    local services=$(check_services)
    
    local metrics_json=$(cat <<EOF
{
  "timestamp": "$timestamp",
  "system": {
    "memory": $memory,
    "cpu": $cpu,
    "disk": $disk,
    "load": $load,
    "uptime": $(cat /proc/uptime 2>/dev/null | cut -d' ' -f1 || echo "0")
  },
  "application": $app_health,
  "services": $services,
  "alerts": []
}
EOF
    )
    
    echo "$metrics_json"
}

# 检查告警条件
check_alerts() {
    local metrics="$1"
    local alerts=()
    
    # 内存使用告警
    local mem_percent=$(echo "$metrics" | jq -r '.system.memory.percent')
    if [[ "$mem_percent" != "null" && "$mem_percent" -gt "$MEMORY_THRESHOLD" ]]; then
        alerts+=("High memory usage: ${mem_percent}%")
        log_warning "内存使用率过高: ${mem_percent}% (阈值: ${MEMORY_THRESHOLD}%)"
    fi
    
    # CPU使用告警
    local cpu_usage=$(echo "$metrics" | jq -r '.system.cpu' | cut -d'.' -f1)
    if [[ "$cpu_usage" != "null" && "$cpu_usage" -gt "$CPU_THRESHOLD" ]]; then
        alerts+=("High CPU usage: ${cpu_usage}%")
        log_warning "CPU使用率过高: ${cpu_usage}% (阈值: ${CPU_THRESHOLD}%)"
    fi
    
    # 磁盘使用告警
    local disk_percent=$(echo "$metrics" | jq -r '.system.disk.percent')
    if [[ "$disk_percent" != "null" && "$disk_percent" -gt "$DISK_THRESHOLD" ]]; then
        alerts+=("High disk usage: ${disk_percent}%")
        log_warning "磁盘使用率过高: ${disk_percent}% (阈值: ${DISK_THRESHOLD}%)"
    fi
    
    # 系统负载告警
    local load_avg=$(echo "$metrics" | jq -r '.system.load')
    if [[ "$load_avg" != "null" && $(echo "$load_avg > $LOAD_THRESHOLD" | bc -l 2>/dev/null || echo "0") -eq 1 ]]; then
        alerts+=("High system load: $load_avg")
        log_warning "系统负载过高: $load_avg (阈值: $LOAD_THRESHOLD)"
    fi
    
    # 应用响应时间告警
    local response_time=$(echo "$metrics" | jq -r '.application.response_time')
    if [[ "$response_time" != "null" && "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]]; then
        alerts+=("Slow response time: ${response_time}ms")
        log_warning "应用响应时间过慢: ${response_time}ms (阈值: ${RESPONSE_TIME_THRESHOLD}ms)"
    fi
    
    # 应用状态告警
    local status_code=$(echo "$metrics" | jq -r '.application.status_code')
    if [[ "$status_code" != "200" ]]; then
        alerts+=("Application health check failed: HTTP $status_code")
        log_error "应用健康检查失败: HTTP $status_code"
    fi
    
    # 服务状态告警
    local nginx_status=$(echo "$metrics" | jq -r '.services.nginx')
    if [[ "$nginx_status" == "stopped" ]]; then
        alerts+=("Nginx service is down")
        log_error "Nginx服务未运行"
    fi
    
    local pm2_status=$(echo "$metrics" | jq -r '.services.pm2')
    if [[ "$pm2_status" == "stopped" ]]; then
        alerts+=("PM2 service is down")
        log_error "PM2服务未运行"
    fi
    
    # 更新metrics中的告警信息
    local alerts_json="[]"
    if [[ ${#alerts[@]} -gt 0 ]]; then
        alerts_json="[\"$(printf '%s", "' "${alerts[@]}" | sed 's/, "$//')\"]"
    fi
    
    echo "$metrics" | jq ".alerts = $alerts_json"
}

# 保存指标到文件
save_metrics() {
    local metrics="$1"
    echo "$metrics" > "$METRICS_FILE"
    
    # 同时追加到历史日志（保留最近24小时）
    local history_file="/tmp/jcski-metrics-history.jsonl"
    echo "$metrics" >> "$history_file"
    
    # 清理24小时前的历史记录
    local cutoff=$(date -d '24 hours ago' +%s 2>/dev/null || date -v-24H +%s 2>/dev/null || echo "0")
    if [[ -f "$history_file" && "$cutoff" != "0" ]]; then
        local temp_file=$(mktemp)
        while IFS= read -r line; do
            local timestamp=$(echo "$line" | jq -r '.timestamp')
            local line_time=$(date -d "$timestamp" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%S" "${timestamp%.*}" +%s 2>/dev/null || echo "0")
            if [[ "$line_time" -gt "$cutoff" ]]; then
                echo "$line" >> "$temp_file"
            fi
        done < "$history_file"
        mv "$temp_file" "$history_file"
    fi
}

# 发送通知（可以扩展为邮件、Slack等）
send_notification() {
    local message="$1"
    local level="${2:-info}"
    
    # 简单的日志记录（可以扩展为更复杂的通知系统）
    case "$level" in
        error)
            log_error "$message"
            ;;
        warning)
            log_warning "$message"
            ;;
        success)
            log_success "$message"
            ;;
        *)
            log_info "$message"
            ;;
    esac
    
    # TODO: 可以在这里添加邮件、Slack、钉钉等通知
}

# 单次监控检查
run_single_check() {
    log_info "开始系统监控检查..."
    
    local metrics=$(collect_metrics)
    local metrics_with_alerts=$(check_alerts "$metrics")
    
    save_metrics "$metrics_with_alerts"
    
    # 检查是否有告警
    local alert_count=$(echo "$metrics_with_alerts" | jq '.alerts | length')
    if [[ "$alert_count" -gt 0 ]]; then
        local alerts=$(echo "$metrics_with_alerts" | jq -r '.alerts[]')
        send_notification "发现 $alert_count 个告警: $alerts" "warning"
    else
        log_info "所有指标正常"
    fi
    
    log_success "监控检查完成"
}

# 持续监控模式
run_continuous_monitor() {
    log_info "启动持续监控模式，间隔: ${1:-300}秒"
    
    local interval="${1:-300}" # 默认5分钟
    
    while true; do
        run_single_check
        sleep "$interval"
    done
}

# 生成监控报告
generate_report() {
    local report_file="/tmp/jcski-monitor-report-$(date +%Y%m%d-%H%M%S).txt"
    local history_file="/tmp/jcski-metrics-history.jsonl"
    
    {
        echo "JCSKI Blog 系统监控报告"
        echo "=========================="
        echo "生成时间: $(date)"
        echo "监控周期: 24小时"
        echo ""
        
        if [[ -f "$METRICS_FILE" ]]; then
            echo "当前系统状态:"
            echo "=============="
            local current=$(cat "$METRICS_FILE")
            echo "内存使用: $(echo "$current" | jq -r '.system.memory.percent')%"
            echo "CPU使用: $(echo "$current" | jq -r '.system.cpu')%"
            echo "磁盘使用: $(echo "$current" | jq -r '.system.disk.percent')%"
            echo "系统负载: $(echo "$current" | jq -r '.system.load')"
            echo "应用状态: HTTP $(echo "$current" | jq -r '.application.status_code')"
            echo "响应时间: $(echo "$current" | jq -r '.application.response_time')ms"
            echo ""
        fi
        
        if [[ -f "$history_file" ]]; then
            echo "24小时统计:"
            echo "============"
            local total_checks=$(wc -l < "$history_file")
            local alerts_count=$(grep -c '"alerts":\[.*[^]]\]' "$history_file" || echo "0")
            echo "总检查次数: $total_checks"
            echo "告警次数: $alerts_count"
            
            if [[ "$alerts_count" -gt 0 ]]; then
                echo ""
                echo "最近告警:"
                grep '"alerts":\[.*[^]]\]' "$history_file" | tail -5 | jq -r '.timestamp + " - " + (.alerts | join(", "))'
            fi
        fi
        
        echo ""
        echo "系统信息:"
        echo "========="
        echo "主机名: $(hostname)"
        echo "系统: $(uname -a)"
        echo "运行时间: $(uptime)"
        
    } > "$report_file"
    
    echo "$report_file"
}

# 显示使用帮助
show_help() {
    cat << 'EOF'
JCSKI Blog 系统监控脚本

用法: ./system-monitor.sh [选项]

选项:
  check                 执行单次监控检查
  monitor [interval]    持续监控模式 (默认300秒间隔)
  report               生成监控报告
  status               显示当前状态
  stop                 停止监控进程
  --help               显示此帮助信息

示例:
  ./system-monitor.sh check           # 单次检查
  ./system-monitor.sh monitor 180     # 每3分钟检查
  ./system-monitor.sh report          # 生成报告

配置文件: 在脚本中修改阈值变量
日志文件: /var/log/jcski-system-monitor.log
告警日志: /var/log/jcski-alerts.log
EOF
}

# 显示当前状态
show_status() {
    echo "JCSKI Blog 系统监控状态"
    echo "======================="
    
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "状态: 运行中 (PID: $pid)"
        else
            echo "状态: 已停止 (PID文件过期)"
            rm -f "$PID_FILE"
        fi
    else
        echo "状态: 未运行"
    fi
    
    if [[ -f "$METRICS_FILE" ]]; then
        echo ""
        echo "最后检查: $(date -r "$METRICS_FILE")"
        echo "指标文件: $METRICS_FILE"
    fi
    
    if [[ -f "$LOG_FILE" ]]; then
        echo "日志文件: $LOG_FILE"
        echo "最近日志:"
        tail -5 "$LOG_FILE"
    fi
}

# 停止监控进程
stop_monitor() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            log_info "监控进程已停止 (PID: $pid)"
        else
            log_warning "PID文件存在但进程未运行"
        fi
        rm -f "$PID_FILE"
    else
        log_info "监控进程未运行"
    fi
}

# 主函数
main() {
    # 检查依赖
    if ! command -v jq >/dev/null 2>&1; then
        log_error "需要安装jq: sudo yum install jq 或 sudo apt install jq"
        exit 1
    fi
    
    case "${1:-}" in
        check)
            run_single_check
            ;;
        monitor)
            check_running
            create_pid_file
            run_continuous_monitor "${2:-300}"
            ;;
        report)
            local report_file=$(generate_report)
            echo "监控报告已生成: $report_file"
            cat "$report_file"
            ;;
        status)
            show_status
            ;;
        stop)
            stop_monitor
            ;;
        --help|-h)
            show_help
            ;;
        "")
            echo "请指定操作。使用 --help 查看帮助。"
            exit 1
            ;;
        *)
            echo "未知操作: $1"
            echo "使用 --help 查看帮助。"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"