<template>
  <div class="subpage">
    <!-- Top Navigation Bar (JCSKI style) -->
    <nav class="top-nav">
      <div class="nav-container">
        <a href="/" class="top-logo">JCSKI BLOG</a>
        <div class="top-nav-menu">
          <a href="/music" class="top-nav-item">
            <span class="nav-title">MUSIC</span>
            <span class="nav-subtitle">音楽</span>
          </a>
          <a href="/skiing" class="top-nav-item">
            <span class="nav-title">SKIING</span>
            <span class="nav-subtitle">スキー</span>
          </a>
          <a href="/tech" class="top-nav-item active">
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
        <!-- Page Header -->
        <section class="page-header">
          <h1 class="page-title">TECH</h1>
          <p class="page-subtitle">テクノロジー | 科技探索与开发分享</p>
          <div class="header-decoration tech-decoration"></div>
        </section>
        
        <!-- Content Section -->
        <section class="content-section">
          <div class="content-grid">
            <!-- Featured Article -->
            <article class="featured-article">
              <div class="article-image">
                <div class="image-placeholder tech-gradient">TECH FEATURED</div>
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
                  <span class="article-category">框架研究</span>
                </div>
                <h3 class="article-title">Vue 3 vs React 18：现代前端框架深度对比</h3>
                <p class="article-excerpt">从性能、开发体验、生态系统等角度对比两大主流前端框架...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.09</span>
                  <span class="article-category">工具分享</span>
                </div>
                <h3 class="article-title">TypeScript 5.0 新特性详解与实战应用</h3>
                <p class="article-excerpt">介绍 TypeScript 5.0 的新功能和改进，以及在项目中的应用实例...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.07</span>
                  <span class="article-category">性能优化</span>
                </div>
                <h3 class="article-title">Web性能优化：从首页加载到用户体验</h3>
                <p class="article-excerpt">分享网站性能优化的最佳实践，包括资源优化、缓存策略、渲染优化等...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.04</span>
                  <span class="article-category">技术趋势</span>
                </div>
                <h3 class="article-title">AI辅助编程：开发者的新时代工具</h3>
                <p class="article-excerpt">探讨AI在软件开发中的应用，包括代码生成、智能补全、代码审查等方面...</p>
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
              <li><a href="#" class="footer-link">技术文档</a></li>
              <li><a href="#" class="footer-link">开源项目</a></li>
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
@import url('~/assets/css/subpage.css');
</style>