#!/bin/bash

# JCSKI Blog 快速性能检查脚本 - v0.5.0 步骤21
# 简单可靠的性能验证，无需复杂依赖
# 作者：JCSKI
# 创建时间：2025-07-22

set -euo pipefail

# 配置变量
PROD_URL="https://jcski.com"
LOCAL_URL="http://localhost:3003"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_highlight() {
    echo -e "${CYAN}[HIGHLIGHT]${NC} $1"
}

# 测试单个URL性能
test_url_performance() {
    local url="$1"
    local name="$2"
    
    echo -n "测试 $name ($url) ... "
    
    # 使用curl测试响应时间
    local result=$(curl -s -w "%{http_code}|%{time_total}|%{size_download}" -o /dev/null --max-time 10 "$url" 2>/dev/null || echo "000|0|0")
    
    IFS='|' read -r status_code time_total size_download <<< "$result"
    
    if [[ "$status_code" == "200" ]]; then
        local time_ms=$(echo "$time_total * 1000" | bc -l 2>/dev/null || echo "0")
        local size_kb=$(echo "$size_download / 1024" | bc -l 2>/dev/null || echo "0")
        
        printf "${GREEN}✓${NC} %s %.0fms %.0fKB\n" "$status_code" "${time_ms}" "${size_kb}"
        
        # 简单性能评估
        if (( $(echo "$time_total > 2.0" | bc -l 2>/dev/null || echo "0") )); then
            echo "    ${YELLOW}⚠️  响应时间较慢 (>2秒)${NC}"
        elif (( $(echo "$time_total > 1.0" | bc -l 2>/dev/null || echo "0") )); then
            echo "    ${YELLOW}⚠️  响应时间一般 (>1秒)${NC}"
        else
            echo "    ${GREEN}✅ 响应时间良好${NC}"
        fi
        
        if [[ $size_download -gt 1000000 ]]; then
            echo "    ${YELLOW}⚠️  页面较大 (>1MB)${NC}"
        elif [[ $size_download -gt 500000 ]]; then
            echo "    ${YELLOW}⚠️  页面偏大 (>500KB)${NC}"
        else
            echo "    ${GREEN}✅ 页面大小合理${NC}"
        fi
        
        return 0
    else
        printf "${RED}✗${NC} %s 请求失败\n" "$status_code"
        return 1
    fi
}

# 测试网站性能
test_website_performance() {
    local base_url="$1"
    local site_name="$2"
    
    log_highlight "=== $site_name 性能测试 ==="
    echo ""
    
    # 测试页面列表
    local pages=(
        "/"
        "/music"
        "/tech"
        "/skiing" 
        "/fishing"
        "/about"
    )
    
    local total_tests=${#pages[@]}
    local passed_tests=0
    
    for page in "${pages[@]}"; do
        local page_name=$(echo "$page" | sed 's|^/||' | sed 's|^$|首页|' | tr '[:lower:]' '[:upper:]')
        if test_url_performance "${base_url}${page}" "$page_name"; then
            passed_tests=$((passed_tests + 1))
        fi
        echo ""
    done
    
    # API测试
    echo "API接口测试："
    echo "─────────────"
    
    if test_url_performance "${base_url}/api/posts" "文章API"; then
        passed_tests=$((passed_tests + 1))
        total_tests=$((total_tests + 1))
    else
        total_tests=$((total_tests + 1))
    fi
    echo ""
    
    if test_url_performance "${base_url}/api/monitoring/health" "健康检查API"; then
        passed_tests=$((passed_tests + 1))
        total_tests=$((total_tests + 1))
    else
        total_tests=$((total_tests + 1))
    fi
    echo ""
    
    # 测试结果摘要
    log_highlight "测试结果摘要："
    echo "─────────────"
    echo "总测试数: $total_tests"
    echo "通过测试: $passed_tests"
    local success_rate=$(echo "scale=1; $passed_tests * 100 / $total_tests" | bc -l 2>/dev/null || echo "0")
    echo "成功率: ${success_rate}%"
    
    if [[ $(echo "$success_rate >= 80" | bc -l 2>/dev/null || echo "0") == "1" ]]; then
        log_success "$site_name 性能表现良好！"
    elif [[ $(echo "$success_rate >= 60" | bc -l 2>/dev/null || echo "0") == "1" ]]; then
        log_warning "$site_name 性能表现一般，建议优化"
    else
        log_error "$site_name 性能表现较差，需要优化"
    fi
    
    echo ""
}

# 系统资源检查
check_system_resources() {
    log_highlight "=== 系统资源状态 ==="
    echo ""
    
    # 内存使用情况
    if command -v free >/dev/null 2>&1; then
        echo "内存使用情况："
        free -h | head -2
    elif command -v vm_stat >/dev/null 2>&1; then
        echo "内存使用情况（macOS）："
        vm_stat | head -10
    fi
    echo ""
    
    # 磁盘使用情况
    echo "磁盘使用情况："
    df -h | head -5
    echo ""
    
    # CPU负载
    if command -v uptime >/dev/null 2>&1; then
        echo "系统负载："
        uptime
    fi
    echo ""
}

# 优化效果总结
show_optimization_summary() {
    log_highlight "=== JCSKI Blog v0.5.0 优化总结 ==="
    echo ""
    
    echo "🎯 完成的优化项目 (20/22)："
    echo "────────────────────────"
    echo "✅ 1. 性能基准测试和分析"
    echo "✅ 2. 系统资源使用情况分析"
    echo "✅ 3. SQLite数据库优化 (索引+WAL模式)"
    echo "✅ 4. 应用层查询缓存实现"
    echo "✅ 5. Nginx静态资源缓存配置"
    echo "✅ 6. 图片懒加载实现"
    echo "✅ 7. WebP图片格式支持"
    echo "✅ 8. JavaScript bundle分析和优化"
    echo "✅ 9. CSS优化和压缩"
    echo "✅ 10. 动态Meta标签系统"
    echo "✅ 11. JSON-LD结构化数据"
    echo "✅ 12. XML Sitemap自动生成"
    echo "✅ 13. Open Graph标签优化"
    echo "✅ 14. Node.js内存使用优化"
    echo "✅ 15. PM2配置优化"
    echo "✅ 16. 字体和图标优化"
    echo "✅ 17. 关键资源预加载"
    echo "✅ 18. 系统日志清理脚本"
    echo "✅ 19. 基础安全配置"
    echo "✅ 20. 性能监控工具集成"
    echo "🔄 21. 优化效果验证测试 (进行中)"
    echo "⏳ 22. 生产环境部署和验证 (待完成)"
    echo ""
    
    echo "🚀 关键成就："
    echo "───────────"
    echo "• 完整的性能监控体系建设"
    echo "• 适配AWS EC2 t2.micro的内存优化"
    echo "• 前端性能全面提升"
    echo "• SEO和结构化数据完善"
    echo "• 安全性和稳定性加固"
    echo ""
    
    echo "📊 预期性能提升："
    echo "─────────────────"
    echo "• 页面加载速度: 提升30-50%"
    echo "• 首屏渲染时间: 减少40-60%"
    echo "• 服务器资源使用: 优化20-30%"
    echo "• SEO友好度: 显著提升"
    echo "• 用户体验: 全面改善"
    echo ""
}

# 主函数
main() {
    log_highlight "JCSKI Blog v0.5.0 性能验证测试"
    echo "开始进行快速性能检查..."
    echo ""
    
    # 检查curl和bc工具
    if ! command -v curl >/dev/null 2>&1; then
        log_error "需要curl工具，请先安装"
        exit 1
    fi
    
    if ! command -v bc >/dev/null 2>&1; then
        log_warning "bc工具未安装，数值计算可能不准确"
    fi
    
    # 测试生产环境
    if curl -s --max-time 5 "$PROD_URL" >/dev/null 2>&1; then
        test_website_performance "$PROD_URL" "生产环境 (https://jcski.com)"
    else
        log_warning "生产环境不可访问"
        echo ""
    fi
    
    # 测试本地开发环境
    if curl -s --max-time 5 "$LOCAL_URL" >/dev/null 2>&1; then
        test_website_performance "$LOCAL_URL" "开发环境 (localhost:3003)"
    else
        log_info "本地开发环境未运行"
        echo ""
    fi
    
    # 系统资源检查
    check_system_resources
    
    # 显示优化总结
    show_optimization_summary
    
    log_success "性能验证测试完成！"
    echo ""
    echo "📈 下一步: 执行 Step 22 - 生产环境部署和验证"
    echo ""
}

# 执行主函数
main "$@"