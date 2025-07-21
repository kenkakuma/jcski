<template>
  <div class="subpage">
    <!-- Top Navigation Bar (JCSKI style) -->
    <nav class="top-nav">
      <div class="nav-container">
        <a href="/" class="top-logo">JCSKI BLOG</a>
        <div class="top-nav-menu">
          <a href="/music" class="top-nav-item active">
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
        <!-- Page Header -->
        <section class="page-header">
          <h1 class="page-title">MUSIC</h1>
          <p class="page-subtitle">音楽 | 音乐创作与分享</p>
          <div class="header-decoration music-decoration"></div>
        </section>
        
        <!-- Content Section -->
        <section class="content-section">
          <div class="content-grid">
            <!-- Featured Article -->
            <article class="featured-article">
              <div class="article-image">
                <div class="image-placeholder music-gradient">MUSIC FEATURED</div>
                <div class="article-date">2025.01.14</div>
              </div>
              <div class="article-content">
                <h2 class="article-title">我的音乐制作之路：从零开始的创作体验</h2>
                <p class="article-excerpt">分享我在音乐制作中的经验和感悟，包括软件使用、创作灵感来源以及技术技巧等。</p>
                <div class="article-tags">
                  <span class="tag">音乐制作</span>
                  <span class="tag">DAW</span>
                  <span class="tag">创作</span>
                </div>
              </div>
            </article>
            
            <!-- Article List -->
            <div class="article-list">
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.10</span>
                  <span class="article-category">设备评测</span>
                </div>
                <h3 class="article-title">电子音乐制作必备设备推荐</h3>
                <p class="article-excerpt">从入门到专业，推荐适合不同预算的音乐制作设备...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.08</span>
                  <span class="article-category">技术分享</span>
                </div>
                <h3 class="article-title">Logic Pro X 进阶技巧分享</h3>
                <p class="article-excerpt">深入探讨Logic Pro X的高级功能和创作技巧...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.05</span>
                  <span class="article-category">音乐理论</span>
                </div>
                <h3 class="article-title">和声进行的创作应用</h3>
                <p class="article-excerpt">如何在实际创作中运用和声理论，提升音乐表现力...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.03</span>
                  <span class="article-category">作品分享</span>
                </div>
                <h3 class="article-title">原创作品《Winter Solstice》制作解析</h3>
                <p class="article-excerpt">分享我的原创电子音乐作品的创作过程和技术细节...</p>
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
  title: 'MUSIC - JCSKI BLOG',
  meta: [
    { name: 'description', content: '音乐创作与分享，包括音乐制作技巧、设备推荐、作品展示等内容。' }
  ]
})
</script>

<style scoped>
@import url('~/assets/css/subpage.css');
</style>