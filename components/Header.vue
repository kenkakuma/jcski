<template>
  <header class="header">
    <div class="header-container">
      <h1 class="header-title">JCSKI BLOG</h1>
      
      <div class="social-links">
        <a href="#" class="social-link">Twitter</a>
        <a href="#" class="social-link">GitHub</a>
        <a href="#" class="social-link">LinkedIn</a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 32px;
  position: relative;
  z-index: 50;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 1px;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: #000;
}
</style>