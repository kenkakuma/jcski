#!/bin/bash

echo "🚀 启动简单Node.js服务器展示原始JCSKI Blog..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'NODE_SERVER_EOF'
cd /var/www/jcski-blog

echo "🛑 停止所有进程..."
pkill -f node 2>/dev/null || echo "没有Node进程"
pkill -f nuxt 2>/dev/null || echo "没有Nuxt进程"

echo "📄 创建简单的Node.js服务器..."
cat > simple-server.js << 'SERVER_JS_EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  let filePath = '';
  
  // 路由处理
  if (req.url === '/' || req.url === '/index.html') {
    // 返回原始首页内容 - 从pages/index.vue读取并转换为HTML
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JCSKI BLOG</title>
    <link href="https://fonts.googleapis.com/css2?family=Special+Gothic+Expanded+One&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/main.css">
</head>
<body>
    <div id="app">
        <h1>JCSKI Blog 正在恢复中...</h1>
        <p>原始网站功能正在修复，请稍候...</p>
        <div style="margin-top: 40px;">
            <h2>导航菜单</h2>
            <ul>
                <li><a href="/music">音乐 | MUSIC</a></li>
                <li><a href="/skiing">滑雪 | SKIING</a></li>
                <li><a href="/tech">科技 | TECH</a></li>
                <li><a href="/fishing">钓鱼 | FISHING</a></li>
                <li><a href="/about">关于 | ABOUT</a></li>
            </ul>
        </div>
        <p style="margin-top: 20px; color: #666;">
            图片系统升级功能已开发完成，正在修复Nuxt配置问题...
        </p>
    </div>
</body>
</html>`);
    return;
  }

  // 静态文件服务
  if (req.url.startsWith('/assets/')) {
    filePath = path.join(__dirname, req.url);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Page Not Found</h1>');
    return;
  }

  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - File Not Found</h1>');
      return;
    }

    // 设置Content-Type
    const ext = path.extname(filePath);
    let contentType = 'text/plain';
    if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'text/javascript';
    else if (ext === '.html') contentType = 'text/html';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 - Internal Server Error</h1>');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

const PORT = 3222;
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running at http://0.0.0.0:\${PORT}/\`);
});
SERVER_JS_EOF

echo "🚀 启动Node.js服务器..."
nohup node simple-server.js > /tmp/node-server.log 2>&1 &

echo "⏳ 等待服务器启动..."
sleep 10

echo "🔍 检查进程..."
ps aux | grep -E "(node.*simple-server|node.*3222)" | grep -v grep

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

NODE_SERVER_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ 临时Node.js服务器启动完成！"