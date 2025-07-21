# JCSKI Blog 部署故障排查快速参考

> 基于v0.4.8部署经验总结 (2025-07-21)

## 🚨 常见部署问题快速检查

### 1. GitHub Actions失败排查

```bash
# 检查最新3次workflow运行状态
curl -s "https://api.github.com/repos/kenkakuma/jcski/actions/runs?per_page=3" | \
python3 -c "
import json, sys
data = json.load(sys.stdin)
for run in data.get('workflow_runs', [])[:3]:
    status = run.get('status', 'unknown')
    conclusion = run.get('conclusion', 'unknown') 
    created = run.get('created_at', 'unknown')
    print(f'{created}: {status}/{conclusion}')
"
```

**如果显示连续failure** → 使用手动部署方案

### 2. 手动部署脚本 (备用方案)

```bash
#!/bin/bash
# 快速部署到EC2
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'EOF'
set -e
cd /var/www/jcski-blog
echo "📥 强制更新代码..."
git fetch --all
git reset --hard origin/main
git pull origin main
echo "当前commit: $(git rev-parse HEAD)"

echo "📦 安装依赖并构建..."
npm ci --production
npx prisma generate
npx prisma db push  
npm run build

echo "🔍 验证关键文件..."
ls -la server/api/posts/
ls -la assets/css/subpage.css || echo "subpage.css缺失"

echo "🚀 重启应用..."
pm2 stop jcski-blog || echo "未运行"
pm2 delete jcski-blog || echo "不存在"
pm2 start ecosystem.config.js
pm2 save
sleep 10
pm2 status
EOF
```

### 3. 部署验证清单

```bash
# 基础功能检查
curl -I "http://jcski.com/" | head -1
curl -s "http://jcski.com/api/posts" | python3 -c "import json, sys; print('✅ API正常' if json.load(sys.stdin).get('posts') else '❌ API异常')"

# 文章详情页功能检查  
curl -I "http://jcski.com/api/posts/test-1753020544792" | head -1
curl -I "http://jcski.com/posts/test-1753020544792" | head -1

# 子页面统一性检查
for page in music tech skiing fishing about; do
  title=$(curl -s "http://jcski.com/$page" | grep -o '<title>[^<]*</title>')
  echo "$page: $title"
done
```

### 4. EC2服务器状态检查

```bash
# SSH连接检查
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 "
cd /var/www/jcski-blog
echo '📋 Git状态:'
git log --oneline -3
echo '📁 关键文件:'
ls -la server/api/posts/
echo '🚀 PM2状态:'
pm2 status
echo '💾 磁盘空间:'
df -h /var/www/jcski-blog
"
```

## 🔧 特定问题修复方案

### Tags字段JSON解析问题

**症状**: 文章详情页无文字显示  
**原因**: Vue模板无法迭代JSON字符串

**修复**: 在`pages/posts/[slug].vue`中添加解析逻辑
```javascript
if (typeof articleData.tags === 'string') {
  try {
    articleData.tags = JSON.parse(articleData.tags)
  } catch (e) {
    console.warn('Failed to parse tags JSON:', e)
    articleData.tags = []
  }
}
```

### API路由404问题

**症状**: `/api/posts/[slug]` 返回404
**原因**: 新API文件未正确部署或构建失败

**排查步骤**:
```bash
# 1. 检查文件是否存在
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 "ls -la /var/www/jcski-blog/server/api/posts/"

# 2. 检查构建输出
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 "ls -la /var/www/jcski-blog/.output/server/chunks/routes/api/posts/"

# 3. 重新构建
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 "cd /var/www/jcski-blog && npm run build && pm2 restart jcski-blog"
```

### 子页面样式不统一

**症状**: 不同页面字体和样式不一致
**解决**: 确保`assets/css/subpage.css`存在且被正确导入

```bash
# 检查样式文件
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 "ls -la /var/www/jcski-blog/assets/css/subpage.css"

# 检查页面是否导入
curl -s "http://jcski.com/tech" | grep -o "subpage.css"
```

## 📞 紧急联系信息

**EC2服务器**: 54.168.203.21  
**SSH密钥**: ~/Documents/Kowp.pem  
**项目目录**: /var/www/jcski-blog  
**PM2应用名**: jcski-blog  
**生产域名**: http://jcski.com  

## 🎯 成功部署标志

- ✅ API基础功能: `curl -s "http://jcski.com/api/posts" | head -1` 返回JSON
- ✅ 文章详情API: `curl -I "http://jcski.com/api/posts/test-1753020544792"` 返回200
- ✅ 前端详情页: `curl -I "http://jcski.com/posts/test-1753020544792"` 返回200  
- ✅ 子页面统一: 所有子页面标题格式为 `[PAGE] - JCSKI BLOG`
- ✅ PM2状态: `pm2 status` 显示 `jcski-blog | online`

---

*创建时间: 2025-07-21 | 基于版本: v0.4.8 | 用途: 快速故障排查和问题解决*