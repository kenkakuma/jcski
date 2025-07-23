#!/bin/bash

echo "🚀 启动简单静态服务器展示JCSKI Blog..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'STATIC_EOF'
cd /var/www/jcski-blog

echo "🛑 停止所有Node进程..."
pkill -u ec2-user -f node 2>/dev/null || echo "没有node进程"

echo "📄 创建临时主页..."
cat > temp-index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JCSKI BLOG - Personal Tech & Lifestyle</title>
    <link href="https://fonts.googleapis.com/css2?family=Special+Gothic+Expanded+One&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: "Noto Sans SC", -apple-system, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .top-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0,0,0,0.1);
            z-index: 1000;
            padding: 15px 0;
        }
        .nav-container {
            max-width: 1300px;
            margin: 0 auto;
            padding: 0 40px;
            display: flex;
            justify-content: center;
            gap: 60px;
        }
        .nav-item {
            font-family: "Special Gothic Expanded One", sans-serif;
            font-size: 14px;
            color: #333;
            text-decoration: none;
            transition: all 0.3s ease;
            position: relative;
        }
        .nav-item:hover {
            color: #667eea;
            transform: translateY(-2px);
        }
        .hero-frame {
            margin-top: 80px;
            padding: 60px 40px;
            max-width: 1300px;
            margin-left: auto;
            margin-right: auto;
            display: grid;
            grid-template-columns: 2fr 3fr;
            gap: 80px;
            min-height: 80vh;
        }
        .hero-left {
            background: rgba(255,255,255,0.95);
            border-radius: 20px;
            padding: 60px 40px;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .main-title {
            font-family: "Special Gothic Expanded One", sans-serif;
            font-size: 3.5rem;
            color: #2c3e50;
            margin-bottom: 20px;
            line-height: 1.1;
        }
        .subtitle {
            font-size: 1.2rem;
            color: #667eea;
            margin-bottom: 40px;
            font-weight: 300;
        }
        .nav-menu {
            list-style: none;
            margin-bottom: 40px;
        }
        .nav-menu li {
            margin: 20px 0;
        }
        .nav-menu a {
            font-family: "Special Gothic Expanded One", sans-serif;
            font-size: 18px;
            color: #34495e;
            text-decoration: none;
            display: block;
            padding: 15px 20px;
            border-radius: 10px;
            transition: all 0.3s ease;
            background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.1) 100%);
        }
        .nav-menu a:hover {
            background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(102, 126, 234, 0.3) 100%);
            color: #667eea;
            transform: translateX(10px);
        }
        .hero-right {
            background: rgba(255,255,255,0.9);
            border-radius: 20px;
            padding: 60px;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .status-badge {
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .upgrade-info {
            max-width: 400px;
        }
        .upgrade-info h2 {
            font-family: "Special Gothic Expanded One", sans-serif;
            font-size: 2rem;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .upgrade-info p {
            color: #7f8c8d;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .feature-list {
            text-align: left;
            margin-top: 20px;
        }
        .feature-item {
            color: #34495e;
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }
        .feature-item::before {
            content: "✅";
            position: absolute;
            left: 0;
            top: 0;
        }
        @media (max-width: 768px) {
            .hero-frame {
                grid-template-columns: 1fr;
                gap: 40px;
                padding: 40px 20px;
            }
            .main-title { font-size: 2.5rem; }
            .nav-container { gap: 30px; padding: 0 20px; }
        }
    </style>
</head>
<body>
    <nav class="top-nav">
        <div class="nav-container">
            <a href="/music" class="nav-item">MUSIC</a>
            <a href="/skiing" class="nav-item">SKIING</a>
            <a href="/tech" class="nav-item">TECH</a>
            <a href="/fishing" class="nav-item">FISHING</a>
            <a href="/about" class="nav-item">ABOUT</a>
        </div>
    </nav>

    <div class="hero-frame">
        <div class="hero-left">
            <h1 class="main-title">JCSKI</h1>
            <p class="subtitle">PERSONAL BLOG</p>
            
            <ul class="nav-menu">
                <li><a href="/music">音乐 | MUSIC</a></li>
                <li><a href="/skiing">滑雪 | SKIING</a></li>
                <li><a href="/tech">科技 | TECH</a></li>
                <li><a href="/fishing">钓鱼 | FISHING</a></li>
                <li><a href="/about">关于 | ABOUT</a></li>
            </ul>
        </div>
        
        <div class="hero-right">
            <div class="status-badge">v0.5.1 图片系统升级</div>
            <div class="upgrade-info">
                <h2>系统升级中</h2>
                <p>JCSKI Blog正在进行图片系统升级，新增以下功能：</p>
                <div class="feature-list">
                    <div class="feature-item">智能图片组件</div>
                    <div class="feature-item">第三方图片支持</div>
                    <div class="feature-item">富文本编辑器</div>
                    <div class="feature-item">媒体管理优化</div>
                </div>
                <p style="margin-top: 20px; font-style: italic;">完整功能即将恢复...</p>
            </div>
        </div>
    </div>
</body>
</html>
HTML_EOF

echo "🌐 启动Python HTTP服务器..."
cd /var/www/jcski-blog
python3 -m http.server 3222 --directory . > /dev/null 2>&1 &

echo "✅ 静态服务器已启动"
sleep 5

echo "🌐 测试连接..."
curl -I http://localhost:3222/temp-index.html | head -3

STATIC_EOF

echo "🔍 测试外部访问..."
sleep 3
curl -I "https://jcski.com/temp-index.html" | head -3

echo "✅ 临时网站部署完成！"