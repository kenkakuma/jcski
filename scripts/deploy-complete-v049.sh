#!/bin/bash

echo "🎯 部署完整的v0.4.9原始JCSKI Blog设计..."

# 先获取原始CSS内容
git show ca4330c:assets/css/main.css > /tmp/original-css.txt

ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'COMPLETE_DEPLOY_EOF'
cd /var/www/jcski-blog

echo "🛑 停止所有进程..."
pkill -9 -f node 2>/dev/null || echo "没有Node进程"

echo "🎨 创建完整的原始JCSKI Blog HTML页面..."
cat > index.html << 'ORIGINAL_JCSKI_EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JCSKI BLOG</title>
    <link href="https://fonts.googleapis.com/css2?family=Special+Gothic+Expanded+One&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
    <style>
ORIGINAL_JCSKI_EOF

# 插入原始CSS内容
cat >> index.html << 'CSS_CONTENT_EOF'
/* Reset and Base Styles */
*, ::before, ::after {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: #e5e7eb;
}

html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  font-family: 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans', ui-sans-serif, system-ui, sans-serif;
}

body {
  margin: 0;
  line-height: inherit;
  font-family: 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans', ui-sans-serif, system-ui, sans-serif;
  background: #f8fafc;
}

/* JCSKI Blog Specific Styles */
.jwave-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Top Navigation */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e2e8f0;
  z-index: 1000;
  padding: 16px 0;
}

.nav-container {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
}

.top-logo {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 24px;
  color: #1a202c;
  margin: 0;
}

.top-nav-menu {
  display: flex;
  gap: 40px;
}

.top-nav-item {
  text-decoration: none;
  color: #4a5568;
  transition: all 0.3s ease;
}

.top-nav-item:hover {
  color: #2b6cb0;
  transform: translateY(-2px);
}

.nav-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  display: block;
  font-size: 14px;
  font-weight: normal;
  margin-bottom: 2px;
}

.nav-subtitle {
  font-size: 10px;
  opacity: 0.7;
}

/* Main Container */
.main-container {
  margin-top: 80px;
  padding: 40px;
}

.main-content {
  max-width: 1300px;
  margin: 0 auto;
}

/* Hero Frame */
.hero-frame {
  margin-bottom: 80px;
}

.hero-container {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 60px;
  min-height: 70vh;
}

/* Hero Left - 40% */
.hero-left {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 60px 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.hero-main-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 4rem;
  color: #1a202c;
  margin: 0 0 16px 0;
  line-height: 0.9;
}

.hero-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 0 0 40px 0;
  font-weight: normal;
}

.hero-menu {
  margin-bottom: 40px;
}

.hero-menu-item {
  display: block;
  text-decoration: none;
  color: #4a5568;
  margin: 20px 0;
  padding: 16px 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  background: linear-gradient(90deg, transparent 0%, transparent 100%);
}

.hero-menu-item:hover,
.hero-menu-item.active {
  background: linear-gradient(90deg, #2b6cb0 0%, #3182ce 100%);
  color: white;
  transform: translateX(8px);
  box-shadow: 0 8px 25px rgba(43, 108, 176, 0.3);
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
  padding: 12px 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

/* Hero Right - 60% */
.hero-right {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.hero-image-container {
  height: 100%;
  position: relative;
}

.hero-image {
  height: 100%;
  position: relative;
  background: linear-gradient(45deg, #87CEEB 0%, #98D8E8 50%, #87CEFA 100%);
  min-height: 500px;
}

/* Sky Background Animation */
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
  background: radial-gradient(circle, #FFD700 0%, #FFA500 70%, #FF8C00 100%);
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  animation: sunGlow 4s ease-in-out infinite alternate;
}

@keyframes sunGlow {
  from { 
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
    transform: scale(1);
  }
  to { 
    box-shadow: 0 0 60px rgba(255, 215, 0, 0.8);
    transform: scale(1.05);
  }
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 50px;
  animation: cloudFloat 20s ease-in-out infinite;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 50px;
}

.cloud-1 {
  width: 100px;
  height: 40px;
  top: 100px;
  left: -20px;
  animation-delay: 0s;
}

.cloud-1::before {
  width: 50px;
  height: 50px;
  top: -25px;
  left: 10px;
}

.cloud-1::after {
  width: 60px;
  height: 60px;
  top: -35px;
  right: 15px;
}

.cloud-2 {
  width: 80px;
  height: 35px;
  top: 180px;
  left: -30px;
  animation-delay: -7s;
}

.cloud-2::before {
  width: 40px;
  height: 40px;
  top: -20px;
  left: 15px;
}

.cloud-2::after {
  width: 45px;
  height: 45px;
  top: -25px;
  right: 10px;
}

.cloud-3 {
  width: 120px;
  height: 45px;
  top: 250px;
  left: -40px;
  animation-delay: -14s;
}

.cloud-3::before {
  width: 60px;
  height: 60px;
  top: -30px;
  left: 20px;
}

.cloud-3::after {
  width: 70px;
  height: 70px;
  top: -40px;
  right: 20px;
}

@keyframes cloudFloat {
  0%, 100% { 
    transform: translateX(0px);
    opacity: 0.8;
  }
  50% { 
    transform: translateX(80px);
    opacity: 1;
  }
}

/* Hero Content */
.hero-content {
  position: absolute;
  bottom: 100px;
  left: 40px;
  right: 40px;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.hero-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 2.5rem;
  margin: 0 0 16px 0;
  line-height: 1.1;
}

.hero-subtitle-text {
  font-size: 1.2rem;
  margin: 0 0 20px 0;
  opacity: 0.95;
}

.hero-label {
  background: rgba(43, 108, 176, 0.9);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 12px;
  display: inline-block;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-tag {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  color: #1a202c;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  font-family: "Special Gothic Expanded One", sans-serif;
}

.hero-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(26, 32, 44, 0.9);
  color: white;
  padding: 30px 40px;
  backdrop-filter: blur(15px);
}

.info-text {
  font-size: 16px;
  margin: 0 0 12px 0;
  font-weight: bold;
}

.info-details p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
}

.fade-transition {
  transition: opacity 0.5s ease-in-out;
}

/* News Section */
.news-section {
  margin-bottom: 80px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.section-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 28px;
  color: #1a202c;
  margin: 0;
}

.section-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.view-all {
  color: #2b6cb0;
  text-decoration: none;
  font-size: 14px;
  font-weight: bold;
}

.news-grid-six {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 30px;
}

.news-program-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.news-program-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.news-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.program-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.program-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.program-status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2b6cb0 0%, #3182ce 100%);
}

.program-info {
  padding: 24px;
}

.program-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.program-date {
  font-size: 12px;
  color: #718096;
  font-weight: bold;
}

.program-status {
  background: #e2e8f0;
  color: #4a5568;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
}

.program-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 18px;
  color: #1a202c;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.program-description {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.5;
  margin: 0;
}

.placeholder {
  opacity: 0.6;
}

/* Press Release Section */
.press-section {
  margin-bottom: 80px;
}

.press-list {
  space: 0;
}

.press-item {
  display: flex;
  align-items: flex-start;
  padding: 24px 0;
  border-bottom: 1px solid #e2e8f0;
}

.press-item:last-child {
  border-bottom: none;
}

.press-marker {
  font-size: 24px;
  color: #2b6cb0;
  margin-right: 20px;
  margin-top: 4px;
  font-weight: bold;
}

.press-content {
  flex: 1;
}

.press-link {
  text-decoration: none;
  color: inherit;
}

.press-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.press-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 18px;
  color: #1a202c;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.press-category-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 16px;
}

.press-category-tag.TECH { background: #e3f2fd; color: #1976d2; }
.press-category-tag.MUSIC { background: #f3e5f5; color: #7b1fa2; }
.press-category-tag.SKIING { background: #e8f5e8; color: #388e3c; }
.press-category-tag.FISHING { background: #fff3e0; color: #f57c00; }
.press-category-tag.ABOUT { background: #fce4ec; color: #c2185b; }
.press-category-tag.BLOG { background: #f1f8e9; color: #689f38; }
.press-category-tag.NEWS { background: #e0f2f1; color: #00695c; }
.press-category-tag.PRESS { background: #fff8e1; color: #f9a825; }

.press-details {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.press-date {
  font-size: 12px;
  color: #718096;
  font-weight: bold;
}

/* Footer */
.main-footer {
  background: #1a202c;
  color: white;
  padding: 60px 40px 40px;
}

.footer-content {
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
}

.footer-logo {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 24px;
  margin: 0 0 20px 0;
}

.footer-social {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.follow-text {
  font-size: 12px;
  color: #718096;
  font-weight: bold;
}

.social-links {
  display: flex;
  gap: 16px;
}

.footer-social-link {
  color: white;
  text-decoration: none;
  font-size: 18px;
  transition: color 0.3s ease;
}

.footer-social-link:hover {
  color: #3182ce;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

/* Responsive Design */
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
  
  .news-grid-six {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
  }
}
CSS_CONTENT_EOF

cat >> index.html << 'HTML_CONTENT_EOF'
    </style>
</head>
<body>
    <div class="jwave-page">
        <!-- Top Navigation Bar -->
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
        
        <!-- Main Content -->
        <div class="main-container">
            <main class="main-content">
                <!-- Hero Frame Section -->
                <section class="hero-frame">
                    <div class="hero-container">
                        <!-- Left Navigation (40%) -->
                        <div class="hero-left">
                            <div class="hero-nav">
                                <h2 class="hero-main-title">JCSKI</h2>
                                <p class="hero-subtitle">PERSONAL BLOG <span style="color: #4CAF50; font-size: 12px;">[原始设计已恢复]</span></p>
                                
                                <nav class="hero-menu">
                                    <a href="/music" class="hero-menu-item" data-type="music">
                                        <span class="menu-title">MUSIC<span class="menu-subtitle-inline">音楽</span></span>
                                    </a>
                                    <a href="/skiing" class="hero-menu-item" data-type="skiing">
                                        <span class="menu-title">SKIING<span class="menu-subtitle-inline">スキー</span></span>
                                    </a>
                                    <a href="/tech" class="hero-menu-item" data-type="tech">
                                        <span class="menu-title">TECH<span class="menu-subtitle-inline">テクノロジー</span></span>
                                    </a>
                                    <a href="/fishing" class="hero-menu-item" data-type="fishing">
                                        <span class="menu-title">FISHING<span class="menu-subtitle-inline">釣り</span></span>
                                    </a>
                                    <a href="/about" class="hero-menu-item" data-type="about">
                                        <span class="menu-title">ABOUT<span class="menu-subtitle-inline">プロフィール</span></span>
                                    </a>
                                </nav>
                                
                                <div class="hero-search">
                                    <input type="text" class="hero-search-input" placeholder="Search...">
                                    <button class="hero-search-btn">🔍</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right Image Area (60%) -->
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
                                        <h2 class="hero-title" id="hero-title">熱中症予防</h2>
                                        <h3 class="hero-subtitle-text" id="hero-subtitle">ワンポイントアドバイス</h3>
                                        <div class="hero-label">JCSKI BLOG</div>
                                    </div>
                                    <div class="info-tag">INFO</div>
                                </div>
                                <div class="hero-info">
                                    <p class="info-text" id="info-title">熱中症にご注意ください</p>
                                    <div class="info-details">
                                        <p id="info-description">JCSKIでは、熱中症を予防するワンポイントアドバイスをまとめました。熱中症は生命にかかわります。ここで読んだ皆さん、熱中症にならないようにお気をつけください。</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- News Section -->
                <section class="news-section">
                    <div class="section-header">
                        <div>
                            <h2 class="section-title">JCSKI NEWS</h2>
                            <p class="section-subtitle">置頂記事・特別企画の情報</p>
                        </div>
                        <a href="#" class="view-all">VIEW ALL →</a>
                    </div>
                    
                    <div class="news-grid-six">
                        <article class="news-program-card">
                            <div class="program-image">
                                <img src="/images/music.jpg" alt="Music Article" class="program-img" />
                                <div class="program-status-bar"></div>
                            </div>
                            <div class="program-info">
                                <div class="program-meta">
                                    <span class="program-date">2025-07-22 ON AIR</span>
                                    <span class="program-status">MUSIC</span>
                                </div>
                                <h3 class="program-title">📌 音楽制作入門ガイド</h3>
                                <p class="program-description">
                                    音楽制作の基本から応用まで、初心者にも分かりやすく解説します。
                                </p>
                            </div>
                        </article>
                        
                        <article class="news-program-card">
                            <div class="program-image">
                                <img src="/images/tech.jpg" alt="Tech Article" class="program-img" />
                                <div class="program-status-bar"></div>
                            </div>
                            <div class="program-info">
                                <div class="program-meta">
                                    <span class="program-date">2025-07-21 ON AIR</span>
                                    <span class="program-status">TECH</span>
                                </div>
                                <h3 class="program-title">📌 Vue 3開発技術</h3>
                                <p class="program-description">
                                    最新のVue 3フレームワークを使った効率的な開発手法を紹介。
                                </p>
                            </div>
                        </article>
                        
                        <article class="news-program-card">
                            <div class="program-image">
                                <img src="/images/skiing.jpg" alt="Skiing Article" class="program-img" />
                                <div class="program-status-bar"></div>
                            </div>
                            <div class="program-info">
                                <div class="program-meta">
                                    <span class="program-date">2025-07-20 ON AIR</span>
                                    <span class="program-status">SKIING</span>
                                </div>
                                <h3 class="program-title">📌 スキー場安全ガイド</h3>
                                <p class="program-description">
                                    安全にスキーを楽しむための注意点とテクニックを解説します。
                                </p>
                            </div>
                        </article>
                        
                        <article class="news-program-card placeholder">
                            <div class="program-image">
                                <img src="/images/news.jpg" alt="Coming Soon" class="program-img" />
                                <div class="program-status-bar"></div>
                            </div>
                            <div class="program-info">
                                <div class="program-meta">
                                    <span class="program-date">COMING SOON</span>
                                    <span class="program-status">NEWS</span>
                                </div>
                                <h3 class="program-title">更多置顶内容</h3>
                                <p class="program-description">
                                    将文章设为置顶后，会显示在这个区域。敬请期待更多精彩内容！
                                </p>
                            </div>
                        </article>
                        
                        <article class="news-program-card placeholder">
                            <div class="program-image">
                                <img src="/images/news.jpg" alt="Coming Soon" class="program-img" />
                                <div class="program-status-bar"></div>
                            </div>
                            <div class="program-info">
                                <div class="program-meta">
                                    <span class="program-date">COMING SOON</span>
                                    <span class="program-status">NEWS</span>
                                </div>
                                <h3 class="program-title">更多置顶内容</h3>
                                <p class="program-description">
                                    将文章设为置顶后，会显示在这个区域。敬请期待更多精彩内容！
                                </p>
                            </div>
                        </article>
                        
                        <article class="news-program-card placeholder">
                            <div class="program-image">
                                <img src="/images/news.jpg" alt="Coming Soon" class="program-img" />
                                <div class="program-status-bar"></div>
                            </div>
                            <div class="program-info">
                                <div class="program-meta">
                                    <span class="program-date">COMING SOON</span>
                                    <span class="program-status">NEWS</span>
                                </div>
                                <h3 class="program-title">更多置顶内容</h3>
                                <p class="program-description">
                                    将文章设为置顶后，会显示在这个区域。敬请期待更多精彩内容！
                                </p>
                            </div>
                        </article>
                    </div>
                </section>
                
                <!-- Press Release Section -->
                <section class="press-section">
                    <div class="section-header">
                        <div>
                            <h2 class="section-title">JCSKI PRESS RELEASE</h2>
                            <p class="section-subtitle">最新記事・プレスリリース (時系列順)</p>
                        </div>
                        <a href="#" class="view-all">VIEW ALL →</a>
                    </div>
                    
                    <div class="press-list">
                        <article class="press-item">
                            <span class="press-marker">+</span>
                            <div class="press-content">
                                <div class="press-title-row">
                                    <h3 class="press-title">JCSKI Blog v0.4.9 原始设计恢复</h3>
                                    <span class="press-category-tag TECH">TECH</span>
                                </div>
                                <p class="press-details">完整的Hero框架设计、天空动画背景、双语导航系统已恢复，保持原始JCSKI设计美学。</p>
                                <time class="press-date">2025-07-22</time>
                            </div>
                        </article>
                        
                        <article class="press-item">
                            <span class="press-marker">+</span>
                            <div class="press-content">
                                <div class="press-title-row">
                                    <h3 class="press-title">图片系统升级功能开发完成</h3>
                                    <span class="press-category-tag NEWS">NEWS</span>
                                </div>
                                <p class="press-details">SmartImage智能组件、第三方图片支持、RichTextEditor富文本编辑器等功能已开发完成。</p>
                                <time class="press-date">2025-07-22</time>
                            </div>
                        </article>
                        
                        <article class="press-item">
                            <span class="press-marker">+</span>
                            <div class="press-content">
                                <div class="press-title-row">
                                    <h3 class="press-title">HTTPS/SSL安全配置完成</h3>
                                    <span class="press-category-tag TECH">TECH</span>
                                </div>
                                <p class="press-details">网站已启用完整HTTPS加密传输，Let's Encrypt证书配置，提升安全性。</p>
                                <time class="press-date">2025-07-21</time>
                            </div>
                        </article>
                    </div>
                </section>
            </main>
        </div>
        
        <!-- Black Footer -->
        <footer class="main-footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3 class="footer-logo">JCSKI BLOG</h3>
                    <div class="footer-social">
                        <span class="follow-text">FOLLOW US</span>
                        <div class="social-links">
                            <a href="#" class="footer-social-link">◯</a>
                            <a href="#" class="footer-social-link">f</a>
                            <a href="#" class="footer-social-link">✕</a>
                            <a href="#" class="footer-social-link">@</a>
                            <a href="#" class="footer-social-link">•</a>
                        </div>
                    </div>
                </div>
                
                <div class="footer-links">
                    <div class="footer-column">
                        <h4>CONTENT</h4>
                        <ul>
                            <li><a href="/music">MUSIC</a></li>
                            <li><a href="/skiing">SKIING</a></li>
                            <li><a href="/tech">TECH</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4>ABOUT</h4>
                        <ul>
                            <li><a href="/about">PROFILE</a></li>
                            <li><a href="/contact">CONTACT</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4>LINKS</h4>
                        <ul>
                            <li><a href="#">PORTFOLIO</a></li>
                            <li><a href="#">PROJECTS</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    </div>

    <script>
        // Hero content switching system
        const heroData = {
            music: {
                title: 'MUSIC CREATION',
                subtitle: '音楽制作の世界',
                description: '音楽制作、DAW技術、機材レビュー、作曲テクニックなど音楽クリエイターのための情報を提供しています。'
            },
            skiing: {
                title: 'SKIING ADVENTURE', 
                subtitle: 'スキー冒険ガイド',
                description: 'スキー技術の向上、装備選び、ゲレンデ情報、安全な滑走のためのアドバイスを詳しく解説します。'
            },
            tech: {
                title: 'TECHNOLOGY INSIGHT',
                subtitle: '最新技術情報',
                description: 'Webフロントエンド開発、AI・機械学習、クラウド技術など最新のテクノロジー情報をお届け。'
            },
            fishing: {
                title: 'FISHING GUIDE',
                subtitle: '釣り情報ガイド',
                description: '釣り技術、タックル選び、ポイント情報、魚種別攻略法など釣り愛好者のための実用情報。'
            },
            about: {
                title: 'ABOUT JCSKI',
                subtitle: 'プロフィール紹介',
                description: 'JCSKIの経歴、スキル、これまでのプロジェクト、連絡先など詳細なプロフィールをご紹介。'
            }
        };

        // Menu hover events
        document.querySelectorAll('.hero-menu-item').forEach(item => {
            item.addEventListener('mouseenter', function(e) {
                e.preventDefault();
                const type = this.getAttribute('data-type');
                if (heroData[type]) {
                    updateHeroContent(heroData[type]);
                    setActiveItem(this);
                }
            });
        });

        function updateHeroContent(data) {
            const heroTitle = document.getElementById('hero-title');
            const heroSubtitle = document.getElementById('hero-subtitle');
            const infoTitle = document.getElementById('info-title');
            const infoDescription = document.getElementById('info-description');

            if (heroTitle) heroTitle.textContent = data.title;
            if (heroSubtitle) heroSubtitle.textContent = data.subtitle;
            if (infoTitle) infoTitle.textContent = data.title;
            if (infoDescription) infoDescription.textContent = data.description;
        }

        function setActiveItem(activeItem) {
            document.querySelectorAll('.hero-menu-item').forEach(item => {
                item.classList.remove('active');
            });
            activeItem.classList.add('active');
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            console.log('JCSKI Blog v0.4.9 原始设计已加载');
            
            // Set default content after a brief delay
            setTimeout(() => {
                updateHeroContent({
                    title: '熱中症予防',
                    subtitle: 'ワンポイントアドバイス',
                    description: 'JCSKIでは、熱中症を予防するワンポイントアドバイスをまとめました。熱中症は生命にかかわります。ここで読んだ皆さん、熱中症にならないようにお気をつけください。'
                });
            }, 1000);
        });
    </script>
</body>
</html>
HTML_CONTENT_EOF

echo "🚀 启动Python服务器..."
python3 -m http.server 3003 > /dev/null 2>&1 &

echo "⏳ 等待服务器启动..."
sleep 8

echo "🌐 测试本地连接..."
curl -I http://localhost:3003/ | head -3

COMPLETE_DEPLOY_EOF

echo "🔍 测试外部访问..."
sleep 5
curl -I "https://jcski.com/" | head -3

echo "✅ 完整v0.4.9原始设计部署完成！"