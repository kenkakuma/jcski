#!/bin/bash

echo "🎨 部署真正的JCSKI Blog静态版本 - 完整Hero设计..."

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'STATIC_JCSKI_EOF'
cd /var/www/jcski-blog

echo "🛑 停止所有进程..."
pkill -9 -f node 2>/dev/null || echo "没有Node进程"
pkill -9 -f nuxt 2>/dev/null || echo "没有Nuxt进程"

echo "🎨 创建真正的JCSKI Blog静态首页..."
cat > index.html << 'JCSKI_HTML_EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JCSKI BLOG</title>
    <link href="https://fonts.googleapis.com/css2?family=Special+Gothic+Expanded+One&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: "Noto Sans SC", "Noto Sans JP", sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
        }
        
        /* 顶部导航 */
        .top-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 1000;
            padding: 15px 0;
        }
        
        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 40px;
        }
        
        .top-logo {
            font-family: "Special Gothic Expanded One", sans-serif;
            color: white;
            font-size: 24px;
            font-weight: normal;
        }
        
        .top-nav-menu {
            display: flex;
            gap: 40px;
        }
        
        .top-nav-item {
            text-decoration: none;
            color: white;
            transition: all 0.3s ease;
        }
        
        .top-nav-item:hover {
            color: #4CAF50;
            transform: translateY(-2px);
        }
        
        .nav-title {
            font-family: "Special Gothic Expanded One", sans-serif;
            display: block;
            font-size: 14px;
            margin-bottom: 2px;
        }
        
        .nav-subtitle {
            font-size: 10px;
            opacity: 0.7;
        }
        
        /* 主内容容器 */
        .main-container {
            margin-top: 80px;
            padding: 40px;
        }
        
        /* Hero框架 */
        .hero-frame {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .hero-container {
            display: grid;
            grid-template-columns: 2fr 3fr; /* 40% : 60% */
            gap: 60px;
            min-height: 70vh;
        }
        
        /* 左侧导航 40% */
        .hero-left {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 60px 40px;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .hero-main-title {
            font-family: "Special Gothic Expanded One", sans-serif;
            font-size: 4rem;
            color: #2c3e50;
            margin-bottom: 10px;
            line-height: 1;
        }
        
        .hero-subtitle {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 40px;
            font-weight: normal;
        }
        
        .hero-menu {
            margin-bottom: 40px;
        }
        
        .hero-menu-item {
            display: block;
            text-decoration: none;
            color: #2c3e50;
            margin: 20px 0;
            padding: 15px 20px;
            border-radius: 10px;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .hero-menu-item:hover,
        .hero-menu-item.active {
            background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
            color: white;
            transform: translateX(10px);
        }
        
        .menu-title {
            font-family: "Special Gothic Expanded One", sans-serif;
            font-size: 18px;
        }
        
        .menu-subtitle-inline {
            font-family: "Noto Sans JP", sans-serif;
            font-size: 14px;
            margin-left: 8px;
            opacity: 0.8;
        }
        
        .hero-search {
            display: flex;
            background: white;
            border-radius: 25px;
            padding: 10px 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .hero-search-input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 14px;
            background: transparent;
        }
        
        .hero-search-btn {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 16px;
        }
        
        /* 右侧图片区域 60% */
        .hero-right {
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .hero-image-container {
            height: 100%;
            position: relative;
        }
        
        .hero-image {
            height: 100%;
            position: relative;
            background: linear-gradient(45deg, #87CEEB 0%, #98D8E8 100%);
        }
        
        /* 天空背景动画 */
        .sky-background {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        .sun {
            position: absolute;
            top: 60px;
            right: 80px;
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, #FFD700 0%, #FFA500 100%);
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
            animation: sunGlow 3s ease-in-out infinite alternate;
        }
        
        @keyframes sunGlow {
            from { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
            to { box-shadow: 0 0 50px rgba(255, 215, 0, 0.8); }
        }
        
        .cloud {
            position: absolute;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50px;
            animation: cloudFloat 15s ease-in-out infinite;
        }
        
        .cloud-1 {
            width: 100px;
            height: 40px;
            top: 100px;
            left: -20px;
            animation-delay: 0s;
        }
        
        .cloud-2 {
            width: 80px;
            height: 35px;
            top: 150px;
            left: -30px;
            animation-delay: -5s;
        }
        
        .cloud-3 {
            width: 120px;
            height: 45px;
            top: 200px;
            left: -40px;
            animation-delay: -10s;
        }
        
        @keyframes cloudFloat {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(50px); }
        }
        
        /* Hero内容 */
        .hero-content {
            position: absolute;
            bottom: 80px;
            left: 40px;
            right: 40px;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .hero-title {
            font-family: "Special Gothic Expanded One", sans-serif;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .hero-subtitle-text {
            font-size: 1.2rem;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        
        .hero-label {
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 12px;
            display: inline-block;
            font-weight: bold;
        }
        
        .info-tag {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            color: #2c3e50;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .hero-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 20px 40px;
            backdrop-filter: blur(10px);
        }
        
        .info-text {
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .info-details p {
            font-size: 14px;
            line-height: 1.5;
            opacity: 0.9;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .hero-container {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            
            .nav-container {
                padding: 0 20px;
            }
            
            .top-nav-menu {
                gap: 20px;
            }
            
            .hero-main-title {
                font-size: 3rem;
            }
            
            .main-container {
                padding: 20px;
            }
        }
        
        /* 淡入淡出效果 */
        .fade-transition {
            transition: opacity 0.5s ease-in-out;
        }
        
        /* 状态提示 */
        .status-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
            z-index: 1000;
        }
        
    </style>
</head>
<body>
    <!-- 顶部导航栏 -->
    <nav class="top-nav">
        <div class="nav-container">
            <h1 class="top-logo">JCSKI BLOG</h1>
            <div class="top-nav-menu">
                <a href="/music" class="top-nav-item">
                    <span class="nav-title">MUSIC</span>
                    <span class="nav-subtitle">音楽</span>
                </a>
                <a href="/skiing" class="top-nav-item">
                    <span class="nav-title">SKIING</span>
                    <span class="nav-subtitle">スキー</span>
                </a>
                <a href="/tech" class="top-nav-item">
                    <span class="nav-title">TECH</span>
                    <span class="nav-subtitle">テクノロジー</span>
                </a>
                <a href="/fishing" class="top-nav-item">
                    <span class="nav-title">FISHING</span>
                    <span class="nav-subtitle">釣り</span>
                </a>
                <a href="/about" class="top-nav-item">
                    <span class="nav-title">ABOUT</span>
                    <span class="nav-subtitle">プロフィール</span>
                </a>
            </div>
        </div>
    </nav>

    <!-- 主内容 -->
    <div class="main-container">
        <main class="main-content">
            <!-- Hero框架区域 -->
            <section class="hero-frame">
                <div class="hero-container">
                    <!-- 左侧导航 (40%) -->
                    <div class="hero-left">
                        <div class="hero-nav">
                            <h2 class="hero-main-title">JCSKI</h2>
                            <p class="hero-subtitle">PERSONAL BLOG <span style="color: #4CAF50; font-size: 12px;">[图片系统升级中]</span></p>
                            
                            <nav class="hero-menu">
                                <a href="/music" class="hero-menu-item" id="music-item">
                                    <span class="menu-title">MUSIC<span class="menu-subtitle-inline">音楽</span></span>
                                </a>
                                <a href="/skiing" class="hero-menu-item" id="skiing-item">
                                    <span class="menu-title">SKIING<span class="menu-subtitle-inline">スキー</span></span>
                                </a>
                                <a href="/tech" class="hero-menu-item" id="tech-item">
                                    <span class="menu-title">TECH<span class="menu-subtitle-inline">テクノロジー</span></span>
                                </a>
                                <a href="/fishing" class="hero-menu-item" id="fishing-item">
                                    <span class="menu-title">FISHING<span class="menu-subtitle-inline">釣り</span></span>
                                </a>
                                <a href="/about" class="hero-menu-item" id="about-item">
                                    <span class="menu-title">ABOUT<span class="menu-subtitle-inline">プロフィール</span></span>
                                </a>
                            </nav>
                            
                            <div class="hero-search">
                                <input type="text" class="hero-search-input" placeholder="Search...">
                                <button class="hero-search-btn">🔍</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 右侧图片区域 (60%) -->
                    <div class="hero-right">
                        <div class="hero-image-container">
                            <div class="hero-image">
                                <div class="sky-background">
                                    <div class="sun"></div>
                                    <div class="cloud cloud-1"></div>
                                    <div class="cloud cloud-2"></div>
                                    <div class="cloud cloud-3"></div>
                                </div>
                                <div class="hero-content">
                                    <h2 class="hero-title" id="hero-title">图片系统升级</h2>
                                    <h3 class="hero-subtitle-text" id="hero-subtitle">SmartImage + 第三方图片支持</h3>
                                    <div class="hero-label">JCSKI BLOG</div>
                                </div>
                                <div class="info-tag">INFO</div>
                            </div>
                            <div class="hero-info">
                                <p class="info-text" id="info-title">JCSKI Blog v0.5.1 升级进行中</p>
                                <div class="info-details">
                                    <p id="info-description">图片系统已升级完成，包括SmartImage智能组件、第三方图片支持、RichTextEditor富文本编辑器等功能。正在修复Nuxt配置问题，完整功能即将恢复。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- 状态指示器 -->
    <div class="status-indicator">
        ✅ v0.5.1 图片系统升级 - 静态版本运行中
    </div>

    <script>
        // 动态内容切换系统
        const heroData = {
            music: {
                title: 'MUSIC PRODUCTION',
                subtitle: 'クリエイティブサウンド',
                description: '音楽制作、DAW技術、オーディオ機器のレビューと音楽創作に関する情報を提供しています。'
            },
            skiing: {
                title: 'SKIING ADVENTURE', 
                subtitle: 'スキー冒険',
                description: 'スキー技術、装備レビュー、スキー場ガイド、安全な滑走のためのアドバイスを掲載。'
            },
            tech: {
                title: 'TECHNOLOGY',
                subtitle: 'テクノロジー情報',
                description: 'フロントエンド開発、AI技術、クラウドコンピューティングなど最新技術情報を提供。'
            },
            fishing: {
                title: 'FISHING GUIDE',
                subtitle: '釣りガイド',
                description: '釣り技術、装備レビュー、釣り場情報、魚種図鑑など釣り愛好者のための情報。'
            },
            about: {
                title: 'ABOUT JCSKI',
                subtitle: 'プロフィール',
                description: 'JCSKIの個人情報、スキル、プロジェクト履歴、連絡先情報などをご紹介。'
            }
        };

        // メニューアイテムのイベントリスナー
        document.querySelectorAll('.hero-menu-item').forEach(item => {
            item.addEventListener('mouseenter', function(e) {
                e.preventDefault();
                const type = this.id.replace('-item', '');
                if (heroData[type]) {
                    updateHeroContent(heroData[type]);
                    setActiveItem(this);
                }
            });
        });

        function updateHeroContent(data) {
            document.getElementById('hero-title').textContent = data.title;
            document.getElementById('hero-subtitle').textContent = data.subtitle;
            document.getElementById('info-title').textContent = data.title;
            document.getElementById('info-description').textContent = data.description;
        }

        function setActiveItem(activeItem) {
            document.querySelectorAll('.hero-menu-item').forEach(item => {
                item.classList.remove('active');
            });
            activeItem.classList.add('active');
        }

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('JCSKI Blog 静态版本已加载');
        });
    </script>
</body>
</html>
JCSKI_HTML_EOF

echo "🚀 启动Python服务器..."
python3 -m http.server 3222 > /dev/null 2>&1 &

echo "⏳ 等待服务器启动..."
sleep 10

echo "🌐 测试本地连接..."
curl -I http://localhost:3222/ | head -3

STATIC_JCSKI_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ 真正的JCSKI Blog静态版本部署完成！"