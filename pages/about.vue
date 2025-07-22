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
          <a href="/tech" class="top-nav-item">
            <span class="nav-title">TECH</span>
            <span class="nav-subtitle">テクノロジー</span>
          </a>
          <a href="/fishing" class="top-nav-item">
            <span class="nav-title">FISHING</span>
            <span class="nav-subtitle">釣り</span>
          </a>
          <a href="/about" class="top-nav-item active">
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
          <h1 class="page-title">ABOUT</h1>
          <p class="page-subtitle">プロフィール | 关于JCSKI</p>
          <div class="header-decoration about-decoration"></div>
        </section>
        
        <!-- About Content -->
        <section class="about-content">
          <div class="about-grid">
            <!-- Profile Section -->
            <div class="profile-section">
              <div class="profile-avatar">
                <div class="avatar-placeholder about-gradient">JC</div>
              </div>
              <div class="profile-info">
                <h2 class="profile-name">JCSKI</h2>
                <p class="profile-title">Web Developer & Multi-passionate Creator</p>
                <p class="profile-location">📍 Tokyo, Japan</p>
              </div>
            </div>
            
            <!-- Bio Section -->
            <div class="bio-section">
              <h3 class="section-title">自己紹介</h3>
              <div class="bio-content">
                <p>こんにちは！JCSKIです。東京を拠点に活動している Web Developer です。</p>
                <p>技術への情熱と創造性を持ち合わせ、ウェブ開発から音楽制作、アウトドア活動まで幅広い分野で活動しています。このブログでは、私の多様な興味と経験を通じて得た知識や洞察を共有していきます。</p>
                <p>常に新しいことを学び、挑戦することを大切にし、技術とクリエイティビティの融合を追求しています。</p>
              </div>
            </div>
            
            <!-- Skills Section -->
            <div class="skills-section">
              <h3 class="section-title">専門分野</h3>
              <div class="skills-grid">
                <div class="skill-category">
                  <div class="skill-icon music-gradient">♪</div>
                  <h4>MUSIC</h4>
                  <ul class="skill-list">
                    <li>電子音楽制作</li>
                    <li>Logic Pro X</li>
                    <li>音響機器</li>
                    <li>作品制作</li>
                  </ul>
                </div>
                
                <div class="skill-category">
                  <div class="skill-icon tech-gradient">⚡</div>
                  <h4>TECH</h4>
                  <ul class="skill-list">
                    <li>Frontend Development</li>
                    <li>Vue.js / Nuxt.js</li>
                    <li>TypeScript</li>
                    <li>UI/UX Design</li>
                  </ul>
                </div>
                
                <div class="skill-category">
                  <div class="skill-icon skiing-gradient">⛷</div>
                  <h4>SKIING</h4>
                  <ul class="skill-list">
                    <li>アルペンスキー</li>
                    <li>装備知識</li>
                    <li>雪山安全</li>
                    <li>スキー旅行</li>
                  </ul>
                </div>
                
                <div class="skill-category">
                  <div class="skill-icon fishing-gradient">🎣</div>
                  <h4>FISHING</h4>
                  <ul class="skill-list">
                    <li>海釣り</li>
                    <li>淡水釣り</li>
                    <li>釣具選び</li>
                    <li>魚類知識</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Timeline Section -->
            <div class="timeline-section">
              <h3 class="section-title">経歴</h3>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-date">2025</div>
                  <div class="timeline-content">
                    <h4>JCSKI BLOG 開設</h4>
                    <p>個人ブログを開設し、技術・音楽・アウトドアの情報発信を開始</p>
                  </div>
                </div>
                
                <div class="timeline-item">
                  <div class="timeline-date">2023-2024</div>
                  <div class="timeline-content">
                    <h4>フリーランス活動</h4>
                    <p>Web 開発プロジェクトに参加、現代的な技術スタックでの開発経験を積む</p>
                  </div>
                </div>
                
                <div class="timeline-item">
                  <div class="timeline-date">2020-2022</div>
                  <div class="timeline-content">
                    <h4>音楽制作活動</h4>
                    <p>電子音楽制作を本格化、各種 DAW ソフトウェアの習得と作品制作</p>
                  </div>
                </div>
                
                <div class="timeline-item">
                  <div class="timeline-date">2018-2020</div>
                  <div class="timeline-content">
                    <h4>アウトドア活動開始</h4>
                    <p>スキーと釣りを趣味として始め、装備や技術の研究を深める</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Contact Section -->
            <div class="contact-section">
              <h3 class="section-title">お問い合わせ</h3>
              <div class="contact-content">
                <p>ブログの内容や技術的な質問、コラボレーションのご相談など、お気軽にお声がけください。</p>
                <div class="contact-links">
                  <a href="#" class="contact-link">
                    <span class="contact-icon">✉</span>
                    <span>contact@jcski.com</span>
                  </a>
                  <a href="#" class="contact-link">
                    <span class="contact-icon">💼</span>
                    <span>LinkedIn Profile</span>
                  </a>
                  <a href="#" class="contact-link">
                    <span class="contact-icon">📱</span>
                    <span>Twitter @jcski</span>
                  </a>
                </div>
              </div>
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
              <li><a href="#" class="footer-link">个人项目</a></li>
              <li><a href="#" class="footer-link">作品集</a></li>
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
  setCategorySEO('ABOUT')
  
  // 应用ABOUT页面JSON-LD结构化数据
  const aboutJsonLD = generateCategoryJsonLD('ABOUT')
  applyJsonLD(aboutJsonLD)
})
</script>

<style scoped>
@import url('~/assets/css/subpage.css');

/* About Page Specific Styles */
.about-content {
  margin-bottom: 60px;
}

.about-grid {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

/* Profile Section */
.profile-section {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 12px;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36px;
  font-weight: 700;
  font-family: "Special Gothic Expanded One", sans-serif;
}

.profile-info h2 {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 32px;
  margin: 0 0 8px 0;
  color: #000;
}

.profile-title {
  font-size: 18px;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.profile-location {
  font-size: 16px;
  color: #888;
  margin: 0;
}

/* Bio Section */
.bio-section {
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 24px;
  margin: 0 0 24px 0;
  color: #000;
  text-align: center;
}

.bio-content p {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin: 0 0 16px 0;
}

/* Skills Section */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.skill-category {
  text-align: center;
  padding: 30px 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.skill-category:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.skill-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #fff;
  font-size: 24px;
}

.skill-category h4 {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #000;
}

.skill-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.skill-list li {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

/* Timeline Section */
.timeline {
  position: relative;
  padding-left: 30px;
  margin-top: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ddd;
}

.timeline-item {
  position: relative;
  margin-bottom: 40px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -23px;
  top: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #000;
}

.timeline-date {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.timeline-content h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.timeline-content p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

/* Contact Section */
.contact-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.contact-content p {
  font-size: 16px;
  color: #666;
  margin: 0 0 30px 0;
  line-height: 1.6;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
  min-width: 250px;
}

.contact-link:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.contact-icon {
  font-size: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-section {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
  }
  
  .avatar-placeholder {
    width: 100px;
    height: 100px;
    font-size: 30px;
  }
  
  .skills-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .contact-links {
    gap: 12px;
  }
  
  .contact-link {
    min-width: auto;
    width: 100%;
    max-width: 300px;
  }
}
</style>