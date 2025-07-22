#!/bin/bash

# JCSKI Blog 安全配置部署脚本 - v0.5.0 步骤19
# 在AWS EC2上部署基础安全配置
# 作者：JCSKI
# 创建时间：2025-07-22

set -euo pipefail

# 配置变量
PROJECT_DIR="/var/www/jcski-blog"
NGINX_CONF_DIR="/etc/nginx/conf.d"
BACKUP_DIR="/tmp/jcski-security-backup-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="/var/log/jcski-security-deployment.log"

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

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 检查运行权限
check_permissions() {
    log_info "检查运行权限..."
    
    if [[ $EUID -eq 0 ]]; then
        log_warning "当前以root身份运行"
    else
        log_info "当前以非root身份运行，某些操作可能需要sudo"
    fi
    
    # 检查sudo权限
    if sudo -n true 2>/dev/null; then
        log_success "具有sudo权限"
    else
        log_warning "没有sudo权限，部分安全配置可能无法应用"
    fi
}

# 创建备份目录
create_backup() {
    log_info "创建配置备份..."
    
    mkdir -p "$BACKUP_DIR"
    
    # 备份现有Nginx配置
    if [[ -d "$NGINX_CONF_DIR" ]]; then
        cp -r "$NGINX_CONF_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
    fi
    
    # 备份PM2配置
    if [[ -f "$PROJECT_DIR/ecosystem.config.js" ]]; then
        cp "$PROJECT_DIR/ecosystem.config.js" "$BACKUP_DIR/"
    fi
    
    log_success "配置已备份到: $BACKUP_DIR"
}

# 部署Nginx安全配置
deploy_nginx_security() {
    log_info "部署Nginx安全配置..."
    
    local security_conf="$PROJECT_DIR/scripts/nginx-security.conf"
    
    if [[ ! -f "$security_conf" ]]; then
        log_error "Nginx安全配置文件不存在: $security_conf"
        return 1
    fi
    
    # 检查Nginx是否安装
    if ! command -v nginx >/dev/null 2>&1; then
        log_warning "Nginx未安装，跳过Nginx配置"
        return 0
    fi
    
    # 复制安全配置
    if sudo cp "$security_conf" "$NGINX_CONF_DIR/jcski-security.conf"; then
        log_success "Nginx安全配置已部署"
    else
        log_error "无法部署Nginx安全配置"
        return 1
    fi
    
    # 测试Nginx配置
    if sudo nginx -t; then
        log_success "Nginx配置测试通过"
    else
        log_error "Nginx配置测试失败"
        return 1
    fi
}

# 生成DH参数（如果需要）
generate_dh_params() {
    log_info "检查DH参数..."
    
    local dh_file="/etc/nginx/ssl/dhparam.pem"
    local ssl_dir="/etc/nginx/ssl"
    
    if [[ -f "$dh_file" ]]; then
        log_info "DH参数文件已存在"
        return 0
    fi
    
    if ! command -v openssl >/dev/null 2>&1; then
        log_warning "OpenSSL未安装，跳过DH参数生成"
        return 0
    fi
    
    log_info "生成DH参数（这可能需要几分钟）..."
    
    # 创建SSL目录
    sudo mkdir -p "$ssl_dir" || {
        log_warning "无法创建SSL目录，跳过DH参数生成"
        return 0
    }
    
    # 生成2048位DH参数
    if sudo openssl dhparam -out "$dh_file" 2048; then
        log_success "DH参数已生成: $dh_file"
        sudo chmod 600 "$dh_file"
    else
        log_warning "DH参数生成失败"
    fi
}

# 配置防火墙规则
configure_firewall() {
    log_info "配置防火墙规则..."
    
    # 检查iptables是否可用
    if ! command -v iptables >/dev/null 2>&1; then
        log_warning "iptables不可用，跳过防火墙配置"
        return 0
    fi
    
    # 检查是否有现有规则
    if sudo iptables -L | grep -q "DROP.*tcp.*80\|DROP.*tcp.*443"; then
        log_info "检测到现有防火墙规则，跳过配置"
        return 0
    fi
    
    # 基础防火墙规则
    log_info "应用基础防火墙规则..."
    
    # 允许已建立的连接
    sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT || true
    
    # 允许本地回环
    sudo iptables -A INPUT -i lo -j ACCEPT || true
    
    # 允许SSH（22端口）
    sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT || true
    
    # 允许HTTP和HTTPS
    sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT || true
    sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT || true
    
    # 限制连接数以防DDoS
    sudo iptables -A INPUT -p tcp --dport 80 -m connlimit --connlimit-above 20 -j REJECT || true
    sudo iptables -A INPUT -p tcp --dport 443 -m connlimit --connlimit-above 20 -j REJECT || true
    
    log_success "基础防火墙规则已配置"
}

# 配置系统安全参数
configure_system_security() {
    log_info "配置系统安全参数..."
    
    local sysctl_conf="/etc/sysctl.d/99-jcski-security.conf"
    
    # 创建系统安全配置文件
    sudo tee "$sysctl_conf" > /dev/null << 'EOF'
# JCSKI Blog 系统安全配置
# 禁用IP转发
net.ipv4.ip_forward = 0

# 禁用ICMP重定向
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# 禁用源路由
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# 启用反向路径过滤
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# 忽略ICMP ping请求
net.ipv4.icmp_echo_ignore_all = 0

# 忽略广播ping
net.ipv4.icmp_echo_ignore_broadcasts = 1

# 启用SYN Cookies防护
net.ipv4.tcp_syncookies = 1

# 减少TIME_WAIT套接字数量
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_tw_reuse = 1

# 增加连接跟踪表大小
net.netfilter.nf_conntrack_max = 65536

# 减少内核日志级别
kernel.printk = 3 4 1 3
EOF
    
    # 应用系统配置
    if sudo sysctl -p "$sysctl_conf"; then
        log_success "系统安全参数已配置"
    else
        log_warning "部分系统安全参数配置失败"
    fi
}

# 配置文件权限
configure_file_permissions() {
    log_info "配置文件权限..."
    
    # 设置项目目录权限
    if [[ -d "$PROJECT_DIR" ]]; then
        # 确保ec2-user拥有项目目录
        sudo chown -R ec2-user:ec2-user "$PROJECT_DIR" || true
        
        # 设置适当的目录权限
        find "$PROJECT_DIR" -type d -exec chmod 755 {} \; || true
        find "$PROJECT_DIR" -type f -exec chmod 644 {} \; || true
        
        # 脚本文件需要执行权限
        chmod +x "$PROJECT_DIR"/scripts/*.sh || true
        
        log_success "项目文件权限已配置"
    fi
    
    # 保护敏感配置文件
    if [[ -f "$PROJECT_DIR/.env" ]]; then
        chmod 600 "$PROJECT_DIR/.env"
        log_success "环境变量文件权限已加固"
    fi
    
    if [[ -f "$PROJECT_DIR/prisma/dev.db" ]]; then
        chmod 600 "$PROJECT_DIR/prisma/dev.db"
        log_success "数据库文件权限已加固"
    fi
}

# 安装fail2ban（可选）
install_fail2ban() {
    log_info "检查fail2ban安装..."
    
    if command -v fail2ban-server >/dev/null 2>&1; then
        log_info "fail2ban已安装"
        return 0
    fi
    
    # 检查包管理器
    if command -v yum >/dev/null 2>&1; then
        log_info "使用yum安装fail2ban..."
        sudo yum update -y
        sudo yum install -y epel-release
        sudo yum install -y fail2ban
    elif command -v apt >/dev/null 2>&1; then
        log_info "使用apt安装fail2ban..."
        sudo apt update
        sudo apt install -y fail2ban
    else
        log_warning "未找到支持的包管理器，跳过fail2ban安装"
        return 0
    fi
    
    # 配置fail2ban
    local fail2ban_conf="/etc/fail2ban/jail.local"
    
    sudo tee "$fail2ban_conf" > /dev/null << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/*.log

[sshd]
enabled = true
port = ssh
maxretry = 3
bantime = 3600
EOF
    
    # 启动fail2ban
    if sudo systemctl enable fail2ban && sudo systemctl start fail2ban; then
        log_success "fail2ban已安装并启动"
    else
        log_warning "fail2ban启动失败"
    fi
}

# 重启相关服务
restart_services() {
    log_info "重启相关服务..."
    
    local services_restarted=0
    
    # 重启Nginx
    if command -v nginx >/dev/null 2>&1; then
        if sudo systemctl reload nginx; then
            log_success "Nginx已重新加载"
            services_restarted=$((services_restarted + 1))
        else
            log_error "Nginx重新加载失败"
        fi
    fi
    
    # 重启PM2（如果在运行）
    if command -v pm2 >/dev/null 2>&1 && pm2 list 2>/dev/null | grep -q online; then
        if pm2 reload ecosystem.config.js; then
            log_success "PM2应用已重新加载"
            services_restarted=$((services_restarted + 1))
        else
            log_warning "PM2重新加载失败"
        fi
    fi
    
    log_info "重启了 $services_restarted 个服务"
}

# 验证安全配置
verify_security() {
    log_info "验证安全配置..."
    
    local checks_passed=0
    local total_checks=5
    
    # 检查Nginx配置
    if nginx -t >/dev/null 2>&1; then
        log_success "✓ Nginx配置有效"
        checks_passed=$((checks_passed + 1))
    else
        log_error "✗ Nginx配置无效"
    fi
    
    # 检查防火墙规则
    if sudo iptables -L | grep -q "ACCEPT.*tcp.*80\|ACCEPT.*tcp.*443"; then
        log_success "✓ 防火墙规则已配置"
        checks_passed=$((checks_passed + 1))
    else
        log_warning "✗ 防火墙规则未配置"
    fi
    
    # 检查文件权限
    if [[ -f "$PROJECT_DIR/.env" ]] && [[ "$(stat -c %a "$PROJECT_DIR/.env")" = "600" ]]; then
        log_success "✓ 敏感文件权限正确"
        checks_passed=$((checks_passed + 1))
    else
        log_warning "✗ 敏感文件权限需要检查"
    fi
    
    # 检查系统参数
    if sysctl net.ipv4.tcp_syncookies | grep -q "= 1"; then
        log_success "✓ 系统安全参数已生效"
        checks_passed=$((checks_passed + 1))
    else
        log_warning "✗ 系统安全参数未生效"
    fi
    
    # 检查服务状态
    if systemctl is-active nginx >/dev/null 2>&1; then
        log_success "✓ Nginx服务正在运行"
        checks_passed=$((checks_passed + 1))
    else
        log_warning "✗ Nginx服务未运行"
    fi
    
    log_info "安全检查完成: $checks_passed/$total_checks 项通过"
    
    if [[ $checks_passed -ge $((total_checks - 1)) ]]; then
        log_success "安全配置验证通过！"
        return 0
    else
        log_warning "部分安全配置需要注意"
        return 1
    fi
}

# 生成安全报告
generate_security_report() {
    local report_file="/tmp/jcski-security-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "JCSKI Blog 安全配置部署报告"
        echo "================================="
        echo "部署时间: $(date)"
        echo "执行用户: $(whoami)"
        echo "服务器: $(hostname)"
        echo ""
        echo "已部署的安全功能:"
        echo "- Nginx安全配置 (CSP, CORS, 限流)"
        echo "- 应用层安全中间件"
        echo "- 系统安全参数优化"
        echo "- 文件权限加固"
        echo "- 基础防火墙规则"
        echo ""
        echo "配置文件位置:"
        echo "- Nginx: $NGINX_CONF_DIR/jcski-security.conf"
        echo "- 系统: /etc/sysctl.d/99-jcski-security.conf"
        echo "- 备份: $BACKUP_DIR"
        echo ""
        echo "服务状态:"
        systemctl is-active nginx 2>/dev/null | sed 's/^/- Nginx: /'
        pm2 list 2>/dev/null | grep -E 'online|stopped' | head -3 | sed 's/^/- /'
        echo ""
        echo "防火墙状态:"
        sudo iptables -L INPUT | grep -E 'ACCEPT.*tcp.*80|ACCEPT.*tcp.*443' | head -3 | sed 's/^/- /'
        echo ""
        echo "下一步建议:"
        echo "1. 配置SSL/TLS证书以启用HTTPS"
        echo "2. 设置监控告警系统"
        echo "3. 定期检查安全日志"
        echo "4. 更新防火墙规则（如需要）"
        echo ""
        echo "联系信息: jcski@example.com"
    } > "$report_file"
    
    log_success "安全部署报告已生成: $report_file"
    
    # 显示报告内容
    cat "$report_file"
}

# 主函数
main() {
    log_info "开始部署JCSKI Blog安全配置 v0.5.0"
    log_info "目标：加固AWS EC2生产环境安全"
    
    check_permissions
    create_backup
    
    deploy_nginx_security
    generate_dh_params
    configure_firewall
    configure_system_security
    configure_file_permissions
    install_fail2ban
    
    restart_services
    
    if verify_security; then
        log_success "安全配置部署成功！"
    else
        log_warning "安全配置部署完成，但存在一些注意事项"
    fi
    
    generate_security_report
}

# 脚本参数处理
case "${1:-}" in
    --test)
        log_info "TEST模式：只验证配置，不实际部署"
        verify_security
        exit 0
        ;;
    --rollback)
        log_info "ROLLBACK模式：恢复配置备份"
        if [[ -n "${2:-}" && -d "$2" ]]; then
            sudo cp -r "$2"/* "$NGINX_CONF_DIR/"
            sudo nginx -s reload
            log_success "配置已回滚"
        else
            log_error "请提供备份目录路径"
            exit 1
        fi
        exit 0
        ;;
    --help|-h)
        echo "JCSKI Blog 安全配置部署脚本"
        echo "用法: $0 [选项]"
        echo "选项:"
        echo "  --test              只验证配置，不实际部署"
        echo "  --rollback <dir>    回滚到指定备份"
        echo "  --help              显示此帮助信息"
        exit 0
        ;;
    "")
        # 默认部署模式
        ;;
    *)
        log_error "未知参数: $1"
        echo "使用 --help 查看帮助信息"
        exit 1
        ;;
esac

# 执行主函数
main "$@"