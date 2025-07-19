<template>
  <div class="jwave-page">
    <!-- Top Navigation Bar -->
    <nav class="top-nav">
      <div class="nav-container">
        <h1 class="top-logo">
          <a href="/" class="logo-link">JCSKI BLOG</a>
        </h1>
        <div class="top-nav-menu">
          <a href="/music" class="top-nav-item">MUSIC</a>
          <a href="/skiing" class="top-nav-item">SKIING</a>
          <a href="/tech" class="top-nav-item active">TECH</a>
          <a href="/fishing" class="top-nav-item">FISHING</a>
          <a href="/about" class="top-nav-item">ABOUT</a>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <div class="main-container">
      <main class="main-content">
        <!-- Page Header -->
        <section class="page-header">
          <h1 class="page-title">TECH</h1>
          <p class="page-subtitle">テクノロジー | 科技探索与开发分享</p>
        </section>
        
        <!-- Content Section -->
        <section class="content-section">
          <div class="content-grid">
            <!-- Featured Article -->
            <article class="featured-article">
              <div class="article-image">
                <div class="image-placeholder tech-gradient"></div>
                <div class="article-date">2025.01.14</div>
              </div>
              <div class="article-content">
                <h2 class="article-title">2025年前端开发趋势：从框架到工具链</h2>
                <p class="article-excerpt">深入分析2025年前端开发的新趋势，包括框架演进、工具链优化、性能提升等方面。</p>
                <div class="article-tags">
                  <span class="tag">前端开发</span>
                  <span class="tag">技术趋势</span>
                  <span class="tag">框架对比</span>
                </div>
              </div>
            </article>
            
            <!-- Article List -->
            <div class="article-list">
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.11</span>
                  <span class="article-category">AI技术</span>
                </div>
                <h3 class="article-title">本地AI模型部署指南</h3>
                <p class="article-excerpt">详细介绍如何在本地环境部署和使用AI模型...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.08</span>
                  <span class="article-category">云计算</span>
                </div>
                <h3 class="article-title">Kubernetes集群管理最佳实践</h3>
                <p class="article-excerpt">分享Kubernetes在生产环境中的部署和管理经验...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.06</span>
                  <span class="article-category">编程语言</span>
                </div>
                <h3 class="article-title">Rust与Go性能对比分析</h3>
                <p class="article-excerpt">从内存安全、并发性能等角度对比两种语言的优劣...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.03</span>
                  <span class="article-category">开发工具</span>
                </div>
                <h3 class="article-title">提升开发效率的VS Code插件推荐</h3>
                <p class="article-excerpt">精选实用的VS Code插件，让开发工作更加高效...</p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
    
    <!-- Footer -->
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
            <h4 class="footer-title">CATEGORIES</h4>
            <ul class="footer-menu">
              <li><a href="/music" class="footer-link">音乐创作</a></li>
              <li><a href="/skiing" class="footer-link">滑雪运动</a></li>
              <li><a href="/tech" class="footer-link">科技探索</a></li>
              <li><a href="/fishing" class="footer-link">钓鱼生活</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h4 class="footer-title">CONTENTS</h4>
            <ul class="footer-menu">
              <li><a href="#" class="footer-link">最新文章</a></li>
              <li><a href="#" class="footer-link">热门内容</a></li>
              <li><a href="#" class="footer-link">作品展示</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h4 class="footer-title">LINK</h4>
            <ul class="footer-menu">
              <li><a href="/about" class="footer-link">关于我</a></li>
              <li><a href="#" class="footer-link">联系方式</a></li>
              <li><a href="#" class="footer-link">友情链接</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'TECH - JCSKI BLOG',
  meta: [
    { name: 'description', content: '科技探索与开发分享，包括前端技术、AI应用、云计算、编程语言等内容。' }
  ]
})
</script>

<style scoped>
/* Import base styles from main page */
@import url('~/assets/css/main.css');

/* Page specific styles */
.jwave-page {
  font-family: 'Helvetica Neue', 'Noto Sans JP', Arial, sans-serif;
  background: #fff;
}

/* Top Navigation */
.top-nav {
  background: #fff;
  border-bottom: 1px solid #000;
  padding: 12px 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.top-logo {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #000;
  margin: 0;
}

.logo-link {
  color: #000;
  text-decoration: none;
}

.top-nav-menu {
  display: flex;
  gap: 32px;
}

.top-nav-item {
  color: #000;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: color 0.2s ease;
}

.top-nav-item:hover, .top-nav-item.active {
  color: #666;
}

/* Main Container */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  width: 100%;
  padding: 40px 0;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 60px;
  padding-bottom: 30px;
  border-bottom: 2px solid #000;
}

.page-title {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 4px;
  color: #000;
  margin: 0 0 16px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* Content Section */
.content-section {
  margin-bottom: 60px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

/* Featured Article */
.featured-article {
  background: #fff;
  border: 1px solid #eee;
  overflow: hidden;
}

.article-image {
  position: relative;
  height: 300px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
}

.tech-gradient {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.article-date {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
}

.article-content {
  padding: 24px;
}

.article-title {
  font-size: 24px;
  font-weight: 900;
  line-height: 1.4;
  margin: 0 0 16px 0;
}

.article-excerpt {
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.article-tags {
  display: flex;
  gap: 8px;
}

.tag {
  background: #f0f0f0;
  color: #333;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 16px;
}

/* Article List */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.article-item {
  padding: 20px;
  border: 1px solid #eee;
  background: #fff;
  transition: box-shadow 0.2s ease;
}

.article-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.article-meta .article-date {
  position: static;
  background: none;
  color: #999;
  padding: 0;
  font-size: 12px;
}

.article-category {
  background: #3b82f6;
  color: #fff;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
}

.article-item .article-title {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.article-item .article-excerpt {
  font-size: 14px;
  margin: 0;
}

/* Footer */
.main-footer {
  background: #000;
  color: #fff;
  padding: 40px 0 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-brand {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #333;
}

.footer-logo {
  font-size: 20px;
  font-weight: 900;
  margin: 0;
}

.footer-social {
  display: flex;
  align-items: center;
  gap: 16px;
}

.follow-text {
  font-size: 12px;
  color: #999;
}

.social-links {
  display: flex;
  gap: 12px;
}

.footer-social-link {
  color: #999;
  text-decoration: none;
  font-size: 14px;
}

.footer-social-link:hover {
  color: #fff;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.footer-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-menu li {
  margin-bottom: 8px;
}

.footer-link {
  color: #ccc;
  text-decoration: none;
  font-size: 12px;
  line-height: 1.5;
}

.footer-link:hover {
  color: #fff;
}

/* Responsive */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .page-title {
    font-size: 36px;
    letter-spacing: 2px;
  }
  
  .top-nav-menu {
    gap: 16px;
  }
  
  .top-nav-item {
    font-size: 10px;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .top-nav-menu {
    gap: 8px;
  }
  
  .top-nav-item {
    font-size: 9px;
  }
  
  .page-title {
    font-size: 28px;
    letter-spacing: 1px;
  }
}
</style>