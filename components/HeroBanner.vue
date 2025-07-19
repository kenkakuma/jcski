<template>
  <section class="hero-banner">
    <!-- Sky Elements -->
    <div class="sky-elements">
      <!-- Sun -->
      <div class="sun"></div>
      
      <!-- Clouds -->
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
    </div>
    
    <!-- Main Content -->
    <div class="hero-content">
      <div class="hero-text">
        <h2 class="hero-title">INSPIRE</h2>
        <h3 class="hero-subtitle">CREATIVE</h3>
        <p class="hero-year">2025</p>
        <p class="hero-tagline">TECH & LIFESTYLE BLOG</p>
      </div>
    </div>
    
    <!-- Bottom Information Bar -->
    <div class="hero-info">
      <p class="info-title">JCSKI クリエイティブブログ</p>
      <p class="info-description">
        技術、音楽、ライフスタイルを中心とした個人ブログ。プログラミング、Web開発、音楽制作、日常の発見など、様々なトピックを通じて新しいインスピレーションをお届けします。
      </p>
    </div>
  </section>
</template>

<style scoped>
.hero-banner {
  position: relative;
  height: 320px;
  background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
  overflow: hidden;
}

.sky-elements {
  position: absolute;
  inset: 0;
}

.sun {
  position: absolute;
  top: 24px;
  right: 48px;
  width: 64px;
  height: 64px;
  background: #facc15;
  border-radius: 50%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cloud {
  position: absolute;
  background: white;
  border-radius: 50px;
}

.cloud-1 {
  top: 32px;
  left: 25%;
  width: 80px;
  height: 48px;
  opacity: 0.8;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.cloud-2 {
  top: 64px;
  right: 33.333%;
  width: 64px;
  height: 32px;
  opacity: 0.6;
}

.cloud-3 {
  top: 16px;
  left: 50%;
  width: 48px;
  height: 24px;
  opacity: 0.5;
}

.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  color: #374151;
  margin-bottom: 12px;
}

.hero-subtitle {
  font-size: 36px;
  color: #4b5563;
  margin-bottom: 16px;
}

.hero-year {
  font-size: 24px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 8px;
}

.hero-tagline {
  font-size: 18px;
  color: #6b7280;
}

.hero-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 16px;
}

.info-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.info-description {
  font-size: 12px;
  color: #d1d5db;
  margin: 0;
  line-height: 1.5;
}
</style>