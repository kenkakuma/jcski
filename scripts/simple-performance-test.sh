#!/bin/bash

# JCSKI Blog 简化性能测试脚本 - v0.5.0 步骤21
# 不依赖Lighthouse的基础性能验证
# 作者：JCSKI
# 创建时间：2025-07-22

set -euo pipefail

# 配置变量
BASE_URL="http://localhost:3003"
PROD_URL="https://jcski.com"
RESULTS_FILE="/tmp/jcski-performance-simple-$(date +%Y%m%d-%H%M%S).json"

# 测试页面列表
declare -a TEST_PAGES=(
    "/"
    "/music"
    "/tech" 
    "/skiing"
    "/fishing"
    "/about"
)

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

log_highlight() {
    echo -e "${CYAN}[HIGHLIGHT]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 检查基础依赖
check_dependencies() {
    log_info "检查性能测试依赖..."
    
    local missing_tools=()
    
    for tool in curl jq; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            missing_tools+=("$tool")
        fi
    done
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "缺少依赖: ${missing_tools[*]}"
        log_info "请安装依赖: brew install ${missing_tools[*]} 或 sudo apt install ${missing_tools[*]}"
        exit 1
    fi
    
    log_success "基本依赖已就绪"
}

# 检查服务器状态
check_server_status() {
    local url="$1"
    local timeout=10
    
    log_info "检查服务器状态: $url"
    
    if curl -s --max-time "$timeout" "$url" >/dev/null; then
        log_success "服务器响应正常: $url"
        return 0
    else
        log_error "服务器无响应: $url"
        return 1
    fi
}

# 测试单个页面性能
test_page_performance() {
    local url="$1"
    local page_name="$2"
    
    # 静默模式，不输出日志到JSON
    
    # 执行多次请求以获得平均值
    local total_time=0
    local total_size=0
    local success_count=0
    local test_count=3
    
    for i in $(seq 1 $test_count); do
        # 使用curl测试页面加载
        local start_time=$(date +%s%3N)
        local response=$(curl -s -w "%{http_code}|%{size_download}|%{time_total}" --max-time 30 "$url" 2>/dev/null || echo "000|0|0")
        local end_time=$(date +%s%3N)
        
        IFS='|' read -r status_code size_download time_total <<< "$response"
        
        if [[ "$status_code" == "200" ]]; then
            total_time=$(echo "$total_time + $time_total" | bc -l 2>/dev/null || echo "$total_time")
            total_size=$((total_size + size_download))
            success_count=$((success_count + 1))
        fi
        
        sleep 1  # 短暂延迟避免服务器过载
    done
    
    if [[ $success_count -gt 0 ]]; then
        local avg_time=$(echo "scale=3; $total_time / $success_count" | bc -l 2>/dev/null || echo "0")
        local avg_size=$((total_size / success_count))
        
        # 基础性能评分（简化算法）
        local performance_score=100
        if (( $(echo "$avg_time > 1.0" | bc -l 2>/dev/null || echo "0") )); then
            performance_score=$((performance_score - 20))
        fi
        if (( $(echo "$avg_time > 2.0" | bc -l 2>/dev/null || echo "0") )); then
            performance_score=$((performance_score - 30))
        fi
        if [[ $avg_size -gt 1000000 ]]; then  # 大于1MB
            performance_score=$((performance_score - 10))
        fi
        
        echo "{\"page\":\"$page_name\",\"url\":\"$url\",\"response_time\":$avg_time,\"size_bytes\":$avg_size,\"performance_score\":$performance_score,\"success_rate\":$(echo "scale=2; $success_count * 100 / $test_count" | bc -l 2>/dev/null || echo "0")}"
    else
        echo "{\"page\":\"$page_name\",\"url\":\"$url\",\"response_time\":0,\"size_bytes\":0,\"performance_score\":0,\"success_rate\":0,\"error\":\"all_requests_failed\"}"
    fi
}

# 测试API响应性能
test_api_performance() {
    local base_url="$1"
    
    # 静默模式，不输出日志
    
    local api_endpoints=(
        "/api/posts"
        "/api/monitoring/health"
    )
    
    local api_results=()
    
    for endpoint in "${api_endpoints[@]}"; do
        local url="${base_url}${endpoint}"
        local start_time=$(date +%s%3N)
        local response=$(curl -s -w "%{http_code}|%{time_total}" --max-time 10 "$url" 2>/dev/null || echo "000|0")
        local end_time=$(date +%s%3N)
        
        IFS='|' read -r status_code time_total <<< "$response"
        
        local endpoint_name=$(echo "$endpoint" | sed 's|/api/||' | sed 's|/|_|g')
        api_results+=("{\"endpoint\":\"$endpoint_name\",\"status_code\":\"$status_code\",\"response_time\":$time_total}")
    done
    
    local api_json=$(printf '%s,' "${api_results[@]}")
    api_json="[${api_json%,}]"
    
    echo "$api_json"
}

# 运行完整性能测试套件
run_performance_test_suite() {
    local base_url="$1"
    local test_name="$2"
    
    log_highlight "开始性能测试套件: $test_name"
    log_info "测试URL: $base_url"
    
    local page_results=()
    local total_tests=${#TEST_PAGES[@]}
    local passed_tests=0
    
    # 测试页面性能
    for page in "${TEST_PAGES[@]}"; do
        local page_url="${base_url}${page}"
        local page_name=$(echo "$page" | sed 's|^/||' | sed 's|^$|home|')
        
        local result=$(test_page_performance "$page_url" "$page_name")
        local success_rate=$(echo "$result" | jq -r '.success_rate // 0')
        
        if (( $(echo "$success_rate > 50" | bc -l 2>/dev/null || echo "0") )); then
            passed_tests=$((passed_tests + 1))
        fi
        
        page_results+=("$result")
    done
    
    # 测试API性能
    local api_results=$(test_api_performance "$base_url")
    
    # 系统资源检查
    local memory_usage=0
    local cpu_usage=0
    
    if command -v free >/dev/null 2>&1; then
        memory_usage=$(free | grep '^Mem:' | awk '{print int($3*100/$2)}')
    fi
    
    if command -v ps >/dev/null 2>&1; then
        cpu_usage=$(ps -o %cpu -p $$ | tail -n 1 | tr -d ' ')
    fi
    
    # 生成完整测试结果
    local pages_json=$(printf '%s,' "${page_results[@]}")
    pages_json="[${pages_json%,}]"
    
    cat > "$RESULTS_FILE" << EOF
{
  "test_name": "$test_name",
  "base_url": "$base_url",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
  "summary": {
    "total_pages": $total_tests,
    "passed_pages": $passed_tests,
    "success_rate": $(echo "scale=2; $passed_tests * 100 / $total_tests" | bc -l 2>/dev/null || echo "0"),
    "avg_response_time": $(echo "$pages_json" | jq -r '[.[].response_time] | add / length'),
    "total_size": $(echo "$pages_json" | jq -r '[.[].size_bytes] | add'),
    "avg_performance_score": $(echo "$pages_json" | jq -r '[.[].performance_score] | add / length')
  },
  "pages": $pages_json,
  "apis": $api_results,
  "system": {
    "memory_usage_percent": $memory_usage,
    "cpu_usage_percent": $cpu_usage,
    "test_environment": "$(uname -s)"
  }
}
EOF
    
    log_highlight "测试套件完成: $test_name"
    log_info "成功测试: $passed_tests/$total_tests 个页面"
    log_info "结果保存到: $RESULTS_FILE"
    
    return $passed_tests
}

# 生成性能报告
generate_simple_report() {
    local results_file="$1"
    
    if [[ ! -f "$results_file" ]]; then
        log_error "结果文件不存在: $results_file"
        return 1
    fi
    
    log_highlight "=== JCSKI Blog v0.5.0 性能测试结果 ==="
    echo ""
    
    # 基本信息
    local test_name=$(jq -r '.test_name' "$results_file")
    local base_url=$(jq -r '.base_url' "$results_file")
    local timestamp=$(jq -r '.timestamp' "$results_file")
    
    echo "📋 测试信息："
    echo "   测试名称: $test_name"
    echo "   测试URL: $base_url"
    echo "   测试时间: $timestamp"
    echo ""
    
    # 总体性能
    echo "🎯 总体性能："
    echo "───────────"
    jq -r '
    "   页面成功率: \(.summary.success_rate)% (\(.summary.passed_pages)/\(.summary.total_pages))",
    "   平均响应时间: \(.summary.avg_response_time | . * 1000 | floor / 1000)秒",
    "   平均性能评分: \(.summary.avg_performance_score | floor)分",
    "   页面总大小: \(.summary.total_size / 1024 | floor)KB"
    ' "$results_file"
    echo ""
    
    # 页面详情
    echo "📄 页面性能详情："
    echo "───────────────"
    jq -r '
    .pages[] | 
    "   \(.page | ascii_upcase): \(.response_time | . * 1000 | floor)ms, \(.size_bytes / 1024 | floor)KB, 评分\(.performance_score)分"
    ' "$results_file"
    echo ""
    
    # API性能
    echo "🔧 API性能："
    echo "──────────"
    jq -r '
    .apis[]? // empty | 
    "   \(.endpoint): HTTP \(.status_code), \(.response_time | . * 1000 | floor)ms"
    ' "$results_file"
    echo ""
    
    # 系统资源
    echo "💻 系统资源："
    echo "──────────"
    jq -r '
    "   内存使用: \(.system.memory_usage_percent)%",
    "   CPU使用: \(.system.cpu_usage_percent // 0)%",
    "   测试环境: \(.system.test_environment)"
    ' "$results_file"
    echo ""
    
    # 优化建议
    echo "💡 优化建议："
    echo "──────────"
    
    local slow_pages=$(jq -r '.pages[] | select(.response_time > 1.0) | .page' "$results_file" | wc -l)
    local large_pages=$(jq -r '.pages[] | select(.size_bytes > 500000) | .page' "$results_file" | wc -l)
    local low_score_pages=$(jq -r '.pages[] | select(.performance_score < 80) | .page' "$results_file" | wc -l)
    
    if [[ $slow_pages -gt 0 ]]; then
        echo "   ⚠️  有 $slow_pages 个页面响应时间超过1秒，建议优化加载速度"
    fi
    
    if [[ $large_pages -gt 0 ]]; then
        echo "   ⚠️  有 $large_pages 个页面大小超过500KB，建议压缩资源"
    fi
    
    if [[ $low_score_pages -gt 0 ]]; then
        echo "   ⚠️  有 $low_score_pages 个页面性能评分低于80分，建议进一步优化"
    fi
    
    if [[ $slow_pages -eq 0 && $large_pages -eq 0 && $low_score_pages -eq 0 ]]; then
        echo "   ✅ 所有页面性能良好，无需特别优化"
    fi
    
    echo ""
    echo "📊 详细结果文件: $results_file"
    echo ""
}

# 主函数
main() {
    log_highlight "JCSKI Blog v0.5.0 简化性能测试"
    log_info "开始基础性能验证测试..."
    
    check_dependencies
    
    # 选择测试环境
    local test_url="$BASE_URL"
    local environment="开发环境"
    
    # 检查生产环境是否可用
    if check_server_status "$PROD_URL"; then
        test_url="$PROD_URL"
        environment="生产环境"
        log_info "将测试生产环境: $PROD_URL"
    elif check_server_status "$BASE_URL"; then
        log_info "将测试开发环境: $BASE_URL"
    else
        log_error "所有服务器都不可用，无法进行测试"
        exit 1
    fi
    
    # 运行性能测试
    if run_performance_test_suite "$test_url" "$environment v0.5.0测试"; then
        local passed_tests=$?
        log_success "性能测试完成，通过 $passed_tests 个测试"
        
        # 生成报告
        generate_simple_report "$RESULTS_FILE"
        
    else
        log_error "性能测试失败"
        exit 1
    fi
}

# 脚本参数处理
case "${1:-}" in
    --url)
        if [[ -n "${2:-}" ]]; then
            BASE_URL="$2"
            log_info "使用指定URL: $BASE_URL"
        fi
        main
        ;;
    --help|-h)
        echo "JCSKI Blog 简化性能测试脚本"
        echo "用法: $0 [选项]"
        echo ""
        echo "选项:"
        echo "  --url <URL>      指定测试URL"
        echo "  --help           显示此帮助信息"
        echo ""
        echo "默认: 自动检测可用环境并执行测试"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        log_error "未知参数: $1"
        echo "使用 --help 查看帮助信息"
        exit 1
        ;;
esac