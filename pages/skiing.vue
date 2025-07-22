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
          <a href="/skiing" class="top-nav-item active">
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
          <h1 class="page-title">SKIING</h1>
          <p class="page-subtitle">スキー | 滑雪运动与雪山体验</p>
          <div class="header-decoration skiing-decoration"></div>
        </section>
        
        <!-- Content Section -->
        <section class="content-section">
          <div class="content-grid">
            <!-- Featured Article -->
            <article class="featured-article">
              <div class="article-image">
                <div class="image-placeholder skiing-gradient">SKIING FEATURED</div>
                <div class="article-date">2025.01.15</div>
              </div>
              <div class="article-content">
                <h2 class="article-title">北海道粉雪体验：二世谷滑雪度假村深度游</h2>
                <p class="article-excerpt">分享在日本北海道二世谷(Niseko)滑雪的完整体验，包括雪况分析、滑道推荐、装备选择和住宿建议。</p>
                <div class="article-tags">
                  <span class="tag">滑雪旅行</span>
                  <span class="tag">北海道</span>
                  <span class="tag">粉雪</span>
                  <span class="tag">度假村</span>
                </div>
              </div>
            </article>
            
            <!-- Article List -->
            <div class="article-list">
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.12</span>
                  <span class="article-category">装备评测</span>
                </div>
                <h3 class="article-title">2025年最佳滑雪装备推荐指南</h3>
                <p class="article-excerpt">从雪板到雪靴，从头盔到护具，为不同水平的滑雪者推荐最适合的装备...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.10</span>
                  <span class="article-category">技术分享</span>
                </div>
                <h3 class="article-title">从初学者到高级：滑雪技巧进阶之路</h3>
                <p class="article-excerpt">详细介绍滑雪技术的学习路径，包括基础动作、转弯技巧、高级技术等...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.08</span>
                  <span class="article-category">雪场攻略</span>
                </div>
                <h3 class="article-title">世界顶级滑雪场深度对比分析</h3>
                <p class="article-excerpt">比较分析阿尔卑斯山、洛基山脉、日本等地区的顶级滑雪场特色...</p>
              </article>
              
              <article class="article-item">
                <div class="article-meta">
                  <span class="article-date">2025.01.05</span>
                  <span class="article-category">安全知识</span>
                </div>
                <h3 class="article-title">雪山安全指南：如何避免滑雪意外</h3>
                <p class="article-excerpt">介绍滑雪安全的重要知识，包括天气判断、装备检查、紧急救援等...</p>
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
              <li><a href="#" class="footer-link">专题系列</a></li>
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
  setCategorySEO('SKIING')
  
  // 应用SKIING分类页面JSON-LD结构化数据
  const skiingJsonLD = generateCategoryJsonLD('SKIING')
  applyJsonLD(skiingJsonLD)
})
</script>

<style scoped>
@import url('~/assets/css/subpage.css');
</style>