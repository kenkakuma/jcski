<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>JCSKI Blog - Demo Preview</h1>
      <p>博客系统功能演示页面</p>
    </div>

    <div class="demo-content">
      <div class="demo-section">
        <h2>✅ 已完成功能</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>🏠 前端页面</h3>
            <p>J-WAVE风格首页设计</p>
            <ul>
              <li>响应式布局</li>
              <li>现代化导航</li>
              <li>内容展示区域</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>🎛️ 管理后台</h3>
            <p>完整的内容管理系统</p>
            <ul>
              <li>控制面板</li>
              <li>文章管理</li>
              <li>媒体管理</li>
              <li>网站设置</li>
              <li>日历管理</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>🗄️ 数据库</h3>
            <p>Prisma + SQLite</p>
            <ul>
              <li>博客文章</li>
              <li>媒体文件</li>
              <li>网站设置</li>
              <li>日历事件</li>
              <li>用户管理</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>🔐 认证系统</h3>
            <p>JWT安全认证</p>
            <ul>
              <li>管理员登录</li>
              <li>权限控制</li>
              <li>会话管理</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h2>📱 页面预览</h2>
        <div class="preview-grid">
          <div class="preview-item">
            <h4>首页</h4>
            <div class="preview-box">
              <div class="mini-header">JCSKI</div>
              <div class="mini-sidebar">导航菜单</div>
              <div class="mini-content">内容区域</div>
            </div>
          </div>

          <div class="preview-item">
            <h4>管理后台</h4>
            <div class="preview-box admin">
              <div class="mini-sidebar dark">Admin Panel</div>
              <div class="mini-content">Dashboard</div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h2>🚀 技术栈</h2>
        <div class="tech-list">
          <span class="tech-tag">Nuxt 3</span>
          <span class="tech-tag">TypeScript</span>
          <span class="tech-tag">Prisma ORM</span>
          <span class="tech-tag">SQLite</span>
          <span class="tech-tag">JWT Auth</span>
          <span class="tech-tag">Vue 3</span>
        </div>
      </div>

      <div class="demo-section">
        <h2>📁 项目结构</h2>
        <pre class="code-block">
nuxt-blog/
├── pages/               # 页面文件
│   ├── index.vue       # 首页 (J-WAVE风格)
│   └── admin/          # 管理后台
├── components/         # 组件
│   ├── AdminSidebar.vue
│   ├── AdminPosts.vue
│   └── AdminMedia.vue
├── server/api/         # API接口
├── prisma/            # 数据库
├── middleware/        # 中间件
└── assets/           # 静态资源
        </pre>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'JCSKI Blog Demo',
  meta: [
    { name: 'description', content: 'JCSKI博客系统演示页面' }
  ]
})
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.demo-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.demo-header h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 12px;
}

.demo-content {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  font-size: 24px;
  margin-bottom: 24px;
  color: #333;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #333;
}

.feature-card p {
  color: #666;
  margin-bottom: 16px;
}

.feature-card ul {
  list-style: none;
  padding: 0;
}

.feature-card li {
  padding: 4px 0;
  color: #555;
  position: relative;
  padding-left: 16px;
}

.feature-card li::before {
  content: '•';
  color: #667eea;
  position: absolute;
  left: 0;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.preview-item h4 {
  margin-bottom: 12px;
  color: #333;
}

.preview-box {
  height: 200px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar content";
  grid-template-rows: 40px 1fr;
  grid-template-columns: 80px 1fr;
}

.preview-box.admin {
  grid-template-areas: 
    "sidebar content";
  grid-template-rows: 1fr;
  grid-template-columns: 100px 1fr;
}

.mini-header {
  grid-area: header;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 600;
  font-size: 14px;
}

.mini-sidebar {
  grid-area: sidebar;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
}

.mini-sidebar.dark {
  background: #2c3e50;
  color: white;
}

.mini-content {
  grid-area: content;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-tag {
  background: #667eea;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.code-block {
  background: #2d3748;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .demo-header h1 {
    font-size: 32px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>