<template>
  <div class="subpage">
    <!-- Top Navigation Bar (JCSKI style) -->
    <nav class="top-nav">
      <div class="nav-container">
        <a href="/" class="top-logo">JCSKI BLOG</a>
        <div class="top-nav-menu">
          <a href="/music" class="top-nav-item active">
            <span class="nav-title">GAMING</span>
            <span class="nav-subtitle">游戏</span>
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
          <h1 class="page-title">GAMING</h1>
          <p class="page-subtitle">游戏 | 游戏体验与分享</p>
          <div class="header-decoration music-decoration"></div>
        </section>
        
        <!-- Content Section -->
        <section class="content-section">
          <div class="content-grid">
            <!-- Featured Article -->
            <article class="featured-article">
              <div class="article-image">
                <div class="image-placeholder music-gradient">GAMING FEATURED</div>
                <div class="article-date">2025.01.14</div>
              </div>
              <div class="article-content">
                <h2 class="article-title">我的游戏之路：从休闲玩家到深度体验</h2>
                <p class="article-excerpt">分享我在游戏体验中的感悟和收获，包括各类游戏的深度玩法、游戏文化以及电竞赛事等。</p>
                <div class="article-tags">
                  <span class="tag">游戏体验</span>
                  <span class="tag">电竞</span>
                  <span class="tag">评测</span>
                </div>
              </div>
            </article>
            
            <!-- Article List -->
            <div class="article-list">
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.10</span>
                  <span class="article-category">硬件评测</span>
                </div>
                <h3 class="article-title">2025年游戏装备推荐：打造完美游戏体验</h3>
                <p class="article-excerpt">从入门到专业，推荐适合不同预算的游戏设备配置...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.08</span>
                  <span class="article-category">游戏攻略</span>
                </div>
                <h3 class="article-title">《塞尔达传说》新手进阶指南</h3>
                <p class="article-excerpt">深入探讨开放世界游戏的探索技巧和隐藏要素...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.05</span>
                  <span class="article-category">电竞观察</span>
                </div>
                <h3 class="article-title">电竞产业的发展趋势分析</h3>
                <p class="article-excerpt">分析当前电竞市场的发展状况和未来趋势...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.03</span>
                  <span class="article-category">游戏评测</span>
                </div>
                <h3 class="article-title">独立游戏《空洞骑士》深度体验</h3>
                <p class="article-excerpt">这款备受好评的独立游戏的游戏机制和艺术风格分析...</p>
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
              <li><a href="/music" class="footer-link">游戏体验</a></li>
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
// SEO and JSON-LD setup
const { setCategorySEO } = useSEO()
const { generateCategoryJsonLD, applyJsonLD } = useJsonLD()

onMounted(() => {
  setCategorySEO('GAMING')
  
  // 应用GAMING分类页面JSON-LD结构化数据
  const gamingJsonLD = generateCategoryJsonLD('GAMING')
  applyJsonLD(gamingJsonLD)
})
</script>

<style scoped>
@import url('~/assets/css/subpage.css');
</style>