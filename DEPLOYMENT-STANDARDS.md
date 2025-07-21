# JCSKI Blog 部署和排错标准流程

> 基于v0.4.8成功部署经验制定的标准化流程 (2025-07-21)

## 🎯 标准流程概述

本文档基于v0.4.8版本部署过程中的成功经验和失败教训，建立了标准化的部署和排错流程。所有未来的部署和问题处理都应遵循此标准。

---

## 📋 标准部署流程

### 阶段1: 部署前准备 ✅

```bash
# 1. 检查本地环境
git status
git log --oneline -3

# 2. 确保所有更改已提交
git add .
git commit -m "[type]: [description]

[detailed changes]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. 推送到远程仓库
git push origin main
```

### 阶段2: GitHub Actions监控 ⚠️

```bash
# 检查GitHub Actions状态 (等待2-3分钟)
curl -s "https://api.github.com/repos/kenkakuma/jcski/actions/runs?per_page=3" | \
python3 -c "
import json, sys
data = json.load(sys.stdin)
runs = data.get('workflow_runs', [])
if runs:
    latest = runs[0]
    status = latest.get('status', 'unknown')
    conclusion = latest.get('conclusion', 'unknown')
    print(f'最新运行: {status}/{conclusion}')
    if conclusion == 'failure':
        print('❌ GitHub Actions失败，需要手动部署')
        exit(1)
    elif status == 'completed' and conclusion == 'success':
        print('✅ GitHub Actions成功')
        exit(0)
    else:
        print('🟡 部署进行中，请等待...')
        exit(2)
else:
    print('❌ 无法获取workflow信息')
    exit(1)
"

# 返回值处理:
# 0 = 成功，继续验证
# 1 = 失败，执行手动部署
# 2 = 进行中，等待后重试
```

### 阶段3A: GitHub Actions成功验证 ✅

```bash
# 等待额外时间让部署完全生效
sleep 60

# 基础功能验证
echo "🔍 验证基础功能..."
curl -I "http://jcski.com/" | head -1
curl -s "http://jcski.com/api/posts" | python3 -c "import json, sys; print('✅' if json.load(sys.stdin).get('posts') else '❌')"

# 如果验证失败，转到手动部署
```

### 阶段3B: 手动部署执行 🚨

```bash
#!/bin/bash
echo "🚨 执行标准手动部署流程..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'EOF'
set -e

echo "🚀 开始手动部署..."
cd /var/www/jcski-blog
pwd

echo "📥 强制更新代码..."
git fetch --all
git reset --hard origin/main
git pull origin main
echo "当前commit: $(git rev-parse HEAD)"

echo "📦 安装依赖..."
npm ci --production

echo "🗄️ 更新数据库..."
npx prisma generate
npx prisma db push

echo "🔨 构建应用..."
npm run build

echo "📁 验证关键文件存在..."
ls -la server/api/posts/ | head -5
find assets/css/ -name "*.css" | head -3 || echo "CSS文件检查完成"

echo "🚀 重启PM2应用..."
pm2 stop jcski-blog || echo "应用未运行"
pm2 delete jcski-blog || echo "应用不存在"
pm2 start ecosystem.config.js
pm2 save

echo "⏳ 等待应用启动..."
sleep 15

echo "✅ PM2状态:"
pm2 status
EOF

echo "📋 手动部署完成"
```

### 阶段4: 标准验证清单 ✅

```bash
#!/bin/bash
echo "🔍 执行标准验证清单..."

# 1. 基础网站功能
echo "1. 检查网站首页..."
STATUS=$(curl -I "http://jcski.com/" 2>/dev/null | head -1)
echo "   首页状态: $STATUS"

# 2. API基础功能
echo "2. 检查API基础功能..."
API_CHECK=$(curl -s "http://jcski.com/api/posts" 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    posts = data.get('posts', [])
    print(f'✅ API正常，文章数量: {len(posts)}')
    if posts:
        print(f'   测试文章: {posts[0][\"title\"]} (slug: {posts[0][\"slug\"]})')
        print(posts[0]['slug'])  # 输出slug用于后续测试
except:
    print('❌ API异常')
    print('none')
" 2>/dev/null)
echo "   $API_CHECK"

# 获取测试文章slug
TEST_SLUG=$(echo "$API_CHECK" | tail -1)

if [ "$TEST_SLUG" != "none" ]; then
    # 3. 文章详情页API
    echo "3. 检查文章详情页API..."
    DETAIL_API=$(curl -I "http://jcski.com/api/posts/$TEST_SLUG" 2>/dev/null | head -1)
    echo "   详情API: $DETAIL_API"

    # 4. 文章详情页前端
    echo "4. 检查文章详情页前端..."
    DETAIL_PAGE=$(curl -I "http://jcski.com/posts/$TEST_SLUG" 2>/dev/null | head -1)
    echo "   详情页面: $DETAIL_PAGE"
fi

# 5. 子页面统一性检查
echo "5. 检查子页面统一性..."
for page in music tech skiing fishing about; do
    title=$(curl -s "http://jcski.com/$page" 2>/dev/null | grep -o '<title>[^<]*</title>' | head -1)
    if [[ "$title" == *"$page"* ]] || [[ "$title" == *"${page^^}"* ]]; then
        echo "   ✅ $page: $title"
    else
        echo "   ❌ $page: $title"
    fi
done

echo "📊 验证完成"
```

---

## 🚨 标准排错流程

### 1. 问题分类和初步诊断

```bash
# 标准诊断命令
echo "🔍 开始标准诊断..."

# GitHub Actions状态
echo "1. GitHub Actions状态:"
curl -s "https://api.github.com/repos/kenkakuma/jcski/actions/runs?per_page=1" | \
python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    run = data['workflow_runs'][0]
    print(f'   最新: {run[\"status\"]}/{run[\"conclusion\"]} ({run[\"created_at\"]})')
except:
    print('   ❌ 无法获取状态')
"

# EC2服务器连接
echo "2. EC2服务器状态:"
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 "pm2 status | grep jcski-blog" || echo "   ❌ 连接失败或应用未运行"

# 生产环境响应
echo "3. 生产环境响应:"
curl -I "http://jcski.com/" 2>/dev/null | head -1 || echo "   ❌ 网站无响应"
```

### 2. 问题类型判断

**A. GitHub Actions失败** → 使用手动部署
**B. EC2服务器问题** → 服务器诊断流程
**C. 应用运行异常** → 应用重启流程
**D. 特定功能问题** → 功能特定修复流程

### 3. 特定问题标准修复方案

#### Tags字段JSON解析问题
```bash
# 症状: 文章详情页无文字显示
# 检查: curl -s "http://jcski.com/api/posts/[slug]" | grep '"tags"'
# 修复: 确保pages/posts/[slug].vue包含JSON解析逻辑
```

#### API路由404问题
```bash
# 症状: /api/posts/[slug] 返回404
# 检查: ssh到EC2检查 ls -la server/api/posts/
# 修复: 重新构建和重启PM2
```

#### 子页面样式不统一
```bash
# 症状: 子页面字体样式不一致
# 检查: curl -s "http://jcski.com/tech" | grep "subpage"
# 修复: 确保assets/css/subpage.css存在并被导入
```

---

## 📊 质量控制标准

### 部署成功标准 ✅
- [ ] GitHub Actions运行成功 OR 手动部署完成
- [ ] HTTPS网站首页返回200状态 (`https://jcski.com`)
- [ ] HTTP自动重定向到HTTPS (`http://jcski.com` → `https://jcski.com`)
- [ ] API基础功能正常 (`https://jcski.com/api/posts` 返回文章列表)
- [ ] 文章详情页API正常 (`https://jcski.com/api/posts/[slug]` 返回200)
- [ ] 文章详情页前端正常 (`https://jcski.com/posts/[slug]` 返回200)
- [ ] 所有子页面HTTPS访问正常 (music/tech/skiing/fishing/about)
- [ ] 所有子页面标题格式统一 (`[PAGE] - JCSKI BLOG`)
- [ ] SSL证书有效且自动续期已配置
- [ ] PM2显示应用在线状态
- [ ] 关键功能无明显错误

### 回滚标准 ❌
如果以下任一条件满足，必须回滚到上一稳定版本:
- [ ] 网站主页无法访问 (5分钟以上)
- [ ] API基础功能完全失效
- [ ] PM2应用无法启动
- [ ] 数据库连接失败
- [ ] 关键用户功能受影响超过10分钟

---

## 🎯 预防措施标准

### 1. 代码提交标准
- 所有提交必须包含详细的commit message
- 重大更改必须先在本地完整测试
- 涉及数据库schema变更需要额外验证

### 2. 部署时机标准
- 避免在访问高峰期部署
- 重大功能部署前通知相关人员
- 保持GitHub Actions和手动部署两套方案可用

### 3. 监控标准
- 部署后30分钟内持续监控基础指标
- 保留最近3个版本的部署记录
- 定期检查GitHub Actions工作流健康状态

---

## 📞 应急联系信息

**生产环境**: http://jcski.com  
**EC2服务器**: 54.168.203.21  
**SSH密钥**: ~/Documents/Kowp.pem  
**项目目录**: /var/www/jcski-blog  
**PM2应用**: jcski-blog  
**GitHub仓库**: https://github.com/kenkakuma/jcski  

**紧急回滚命令**:
```bash
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 "
cd /var/www/jcski-blog
git log --oneline -5
git reset --hard [上个稳定commit]
npm run build
pm2 restart jcski-blog
"
```

---

**标准建立时间**: 2025-07-21  
**基于版本**: v0.4.8成功部署经验  
**适用范围**: JCSKI Blog项目所有未来部署  
**更新策略**: 每次重大部署后根据经验更新标准  

## ✅ 使用承诺

**今后所有部署都将严格按照此标准执行:**
1. 🔄 标准部署流程 (GitHub Actions → 手动部署备用)
2. 🔍 标准验证清单 (5项核心检查)
3. 🚨 标准排错流程 (问题分类 → 对症解决)
4. 📊 质量控制标准 (成功标准 + 回滚标准)
5. 🎯 预防措施标准 (代码 + 部署 + 监控)

**确保每次部署的可靠性、可预测性和可恢复性！** 🎉

---

## 🔐 HTTPS/SSL配置标准 (v0.4.8+)

### SSL证书管理标准

**初始配置**:
```bash
# 1. 安装Certbot
sudo dnf install -y certbot python3-certbot-nginx

# 2. 申请SSL证书
sudo certbot --nginx -d jcski.com -d www.jcski.com \
    --non-interactive \
    --agree-tos \
    --email kenkakuma@outlook.com \
    --redirect

# 3. 配置自动续期
sudo systemctl start certbot-renew.timer
sudo systemctl enable certbot-renew.timer
```

**验证标准**:
```bash
# HTTPS访问验证
curl -I "https://jcski.com/" | head -1

# HTTP重定向验证  
curl -I "http://jcski.com/" | grep -E "(301|Location)"

# API HTTPS功能验证
curl -s "https://jcski.com/api/posts" | head -20

# 子页面HTTPS验证
for page in music tech skiing fishing about; do
    curl -I "https://jcski.com/$page" 2>/dev/null | head -1
done

# SSL证书状态检查
sudo certbot certificates
```

**证书续期监控**:
```bash
# 检查自动续期状态
sudo systemctl status certbot-renew.timer

# 手动测试续期 (dry run)
sudo certbot renew --dry-run

# 查看证书到期时间
sudo certbot certificates | grep "Expiry Date"
```

### HTTPS安全标准

**Nginx SSL配置优化** (由Certbot自动管理):
- SSL证书路径: `/etc/letsencrypt/live/jcski.com/`
- 安全配置文件: `/etc/letsencrypt/options-ssl-nginx.conf`
- DH参数文件: `/etc/letsencrypt/ssl-dhparams.pem`

**强制HTTPS重定向**:
- HTTP访问自动301重定向到HTTPS
- 确保所有API和页面都通过HTTPS访问
- 支持 `jcski.com` 和 `www.jcski.com` 两个域名

### 故障排查

**常见SSL问题**:
```bash
# 证书过期检查
sudo certbot certificates

# Nginx配置验证
sudo nginx -t

# 443端口监听检查
sudo netstat -tulpn | grep :443

# SSL握手测试
openssl s_client -connect jcski.com:443 -servername jcski.com
```

**应急处理**:
```bash
# 证书续期失败时手动续期
sudo certbot renew --force-renewal

# Nginx配置恢复
sudo certbot --nginx -d jcski.com -d www.jcski.com --force-renewal

# 重启相关服务
sudo systemctl restart nginx
sudo systemctl restart certbot-renew.timer
```