<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-top">
        <div>
          <h3 class="footer-logo">JCSKI BLOG</h3>
        </div>
        
        <div class="footer-social">
          <span class="follow-text">FOLLOW US</span>
          <a href="#" class="social-link">Twitter</a>
          <a href="#" class="social-link">GitHub</a>
          <a href="#" class="social-link">LinkedIn</a>
        </div>
      </div>
      
      <div class="footer-content">
        <div class="footer-column">
          <h4 class="column-title">ABOUT</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/about" class="footer-link">プロフィール</NuxtLink></li>
            <li><a href="#" class="footer-link">プライバシーポリシー</a></li>
            <li><NuxtLink to="/contact" class="footer-link">お問い合わせ</NuxtLink></li>
            <li><a href="#" class="footer-link">サイトマップ</a></li>
          </ul>
        </div>
        
        <div class="footer-column">
          <h4 class="column-title">CATEGORIES</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/category/tech" class="footer-link">テクノロジー</NuxtLink></li>
            <li><NuxtLink to="/category/music" class="footer-link">音楽・エンタメ</NuxtLink></li>
            <li><NuxtLink to="/category/life" class="footer-link">ライフスタイル</NuxtLink></li>
            <li><a href="#" class="footer-link">プロジェクト</a></li>
          </ul>
        </div>
        
        <div class="footer-column">
          <h4 class="column-title">ADMIN</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/admin" class="footer-link">管理画面</NuxtLink></li>
            <li><NuxtLink to="/admin/login" class="footer-link">ログイン</NuxtLink></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: black;
  color: white;
  padding: 48px 0 32px;
  margin-top: 64px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.footer-logo {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.footer-social {
  display: flex;
  align-items: center;
  gap: 16px;
}

.follow-text {
  color: #9ca3af;
}

.social-link {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: white;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  margin-bottom: 32px;
}

.column-title {
  font-weight: bold;
  margin-bottom: 16px;
  color: white;
  font-size: 16px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 8px;
}

.footer-link {
  color: #d1d5db;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #3b82f6;
}
</style>