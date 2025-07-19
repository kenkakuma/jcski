<template>
  <div class="jwave-page">
    <nav class="top-nav">
      <div class="nav-container">
        <h1 class="top-logo">
          <a href="/" class="logo-link">JCSKI BLOG</a>
        </h1>
        <div class="top-nav-menu">
          <a href="/music" class="top-nav-item">MUSIC</a>
          <a href="/skiing" class="top-nav-item">SKIING</a>
          <a href="/tech" class="top-nav-item">TECH</a>
          <a href="/fishing" class="top-nav-item">FISHING</a>
          <a href="/about" class="top-nav-item active">ABOUT</a>
        </div>
      </div>
    </nav>
    
    <div class="main-container">
      <main class="main-content">
        <section class="page-header">
          <h1 class="page-title">ABOUT</h1>
          <p class="page-subtitle">アバウト | 关于我与这个博客</p>
        </section>
        
        <section class="content-section">
          <div class="about-content">
            <div class="profile-section">
              <div class="profile-image">
                <div class="image-placeholder profile-gradient">
                  <span class="profile-initial">J</span>
                </div>
              </div>
              <div class="profile-text">
                <h2 class="profile-name">JCSKI</h2>
                <p class="profile-title">Developer | Creator | Outdoor Enthusiast</p>
                <p class="profile-description">
                  Hello! 我是JCSKI，一个热爱技术、音乐、滑雪和钓鱼的多元化创作者。
                  在这个博客中，我分享我在各个领域的体验、心得和创作。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    
    <footer class="main-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <h3 class="footer-logo">JCSKI BLOG</h3>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'ABOUT - JCSKI BLOG',
  meta: [
    { name: 'description', content: '关于JCSKI和这个博客的介绍。' }
  ]
})
</script>

<style scoped>
.jwave-page {
  font-family: 'Helvetica Neue', 'Noto Sans JP', Arial, sans-serif;
  background: #fff;
}

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

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  width: 100%;
  padding: 40px 0;
}

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

.profile-section {
  display: flex;
  gap: 40px;
  align-items: center;
}

.profile-image {
  flex-shrink: 0;
}

.image-placeholder {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 900;
  font-size: 72px;
}

.profile-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.profile-text {
  flex: 1;
}

.profile-name {
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #000;
  margin: 0 0 8px 0;
}

.profile-title {
  font-size: 18px;
  color: #666;
  margin: 0 0 20px 0;
}

.profile-description {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

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
  text-align: center;
}

.footer-logo {
  font-size: 20px;
  font-weight: 900;
  margin: 0;
}

@media (max-width: 768px) {
  .profile-section {
    flex-direction: column;
    text-align: center;
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
}
</style>