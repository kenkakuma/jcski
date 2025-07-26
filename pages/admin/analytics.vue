<template>
  <NuxtLayout name="admin">
    <div class="admin-analytics-page">
      <div class="page-header">
        <h1 class="page-title">📈 数据分析</h1>
        <p class="page-description">查看网站访问数据和性能分析</p>
      </div>
      
      <div class="page-content">
        <div class="analytics-placeholder">
          <div class="placeholder-icon">📊</div>
          <h3 class="placeholder-title">数据分析功能</h3>
          <p class="placeholder-description">
            网站访问数据、文章表现分析等功能正在开发中
          </p>
          
          <div class="feature-preview">
            <h4>计划功能:</h4>
            <ul class="feature-list">
              <li>📈 访问统计和趋势分析</li>
              <li>📝 文章阅读量和互动数据</li>
              <li>👥 用户行为分析</li>
              <li>🔍 SEO表现监控</li>
              <li>⚡ 性能指标追踪</li>
              <li>📱 设备和浏览器统计</li>
            </ul>
          </div>
          
          <div class="coming-soon">
            <span class="badge">即将推出</span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

useHead({
  title: '数据分析 - JCSKI Admin',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<style scoped>
.admin-analytics-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

.page-description {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.page-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.analytics-placeholder {
  text-align: center;
  padding: 60px 40px;
  max-width: 600px;
  margin: 0 auto;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.placeholder-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.placeholder-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.6;
}

.feature-preview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: left;
}

.feature-preview h4 {
  color: #333;
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: 600;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: 8px 0;
  color: #555;
  font-size: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.feature-list li:last-child {
  border-bottom: none;
}

.coming-soon {
  margin-top: 20px;
}

.badge {
  display: inline-block;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .analytics-placeholder {
    padding: 40px 20px;
  }
  
  .placeholder-icon {
    font-size: 3rem;
  }
  
  .placeholder-title {
    font-size: 1.5rem;
  }
}
</style>