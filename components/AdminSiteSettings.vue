<template>
  <div class="admin-settings">
    <div class="settings-header">
      <h2 class="settings-title">
        ⚙️ 系统设置中心
        <span class="title-badge">v3.0</span>
      </h2>
      <div class="settings-stats">
        <div class="stat-item">
          <span class="stat-number">{{ Object.keys(settings).length }}</span>
          <span class="stat-label">配置项</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ socialLinks.length }}</span>
          <span class="stat-label">社交链接</span>
        </div>
      </div>
    </div>

    <div class="settings-form">
      <!-- 快速操作面板 -->
      <div class="quick-actions">
        <button @click="resetToDefaults" class="action-btn reset" :disabled="saving">
          🔄 恢复默认
        </button>
        <button @click="exportSettings" class="action-btn export">
          📤 导出配置
        </button>
        <button @click="importSettings" class="action-btn import">
          📥 导入配置
        </button>
        <input ref="fileInput" type="file" accept=".json" @change="handleImport" style="display: none">
      </div>
      <!-- Basic Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">
            🏠 基本设置
          </h3>
          <p class="section-desc">配置网站的基本信息和元数据</p>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>网站名称</label>
            <input
              v-model="settings.siteName"
              type="text"
              class="form-input"
              placeholder="JCSKI"
            >
          </div>

          <div class="form-group">
            <label>网站描述</label>
            <input
              v-model="settings.siteDescription"
              type="text"
              class="form-input"
              placeholder="Personal Blog"
            >
          </div>
        </div>
      </div>

      <!-- Hero Section Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">
            🎆 首页横幅设置
          </h3>
          <p class="section-desc">自定义Hero区域的展示内容和视觉效果</p>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>主标题</label>
            <input
              v-model="settings.heroTitle"
              type="text"
              class="form-input"
              placeholder="JCSKI"
            >
          </div>

          <div class="form-group">
            <label>副标题</label>
            <input
              v-model="settings.heroSubtitle"
              type="text"
              class="form-input"
              placeholder="INSPIRE JCSKI いろいろな発見"
            >
          </div>

          <div class="form-group full-width">
            <label>描述文字</label>
            <textarea
              v-model="settings.heroDescription"
              class="form-textarea"
              rows="3"
              placeholder="様々なジャンルを超えた音楽や情報をお届けし..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>横幅背景图片</label>
            <div class="image-upload">
              <input
                v-model="settings.heroImage"
                type="text"
                class="form-input"
                placeholder="图片URL"
              >
              <button type="button" class="btn-upload">选择图片</button>
            </div>
            <div v-if="settings.heroImage" class="image-preview">
              <img :src="settings.heroImage" alt="Hero Image" class="preview-img">
            </div>
          </div>
        </div>
      </div>

      <!-- Audio Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">
            🎵 背景音乐设置
          </h3>
          <p class="section-desc">设置网站的背景音乐和音频体验</p>
        </div>
        <div class="form-group">
          <label>背景音乐文件</label>
          <div class="audio-upload">
            <input
              v-model="settings.backgroundMusic"
              type="text"
              class="form-input"
              placeholder="音频文件URL"
            >
            <button type="button" class="btn-upload">选择音频</button>
          </div>
          <div v-if="settings.backgroundMusic" class="audio-preview">
            <audio controls class="audio-player">
              <source :src="settings.backgroundMusic" type="audio/mpeg">
              您的浏览器不支持音频播放
            </audio>
          </div>
        </div>
      </div>

      <!-- Social Links -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">
            🔗 社交网络链接
          </h3>
          <p class="section-desc">管理社交媒体和外部链接</p>
        </div>
        <div class="social-links-editor">
          <div v-for="(link, index) in socialLinks" :key="index" class="social-link-item">
            <div class="link-fields">
              <input
                v-model="link.name"
                type="text"
                class="form-input"
                placeholder="平台名称 (如: Twitter)"
              >
              <input
                v-model="link.url"
                type="url"
                class="form-input"
                placeholder="链接地址"
              >
              <input
                v-model="link.icon"
                type="text"
                class="form-input"
                placeholder="图标 (emoji或字符)"
              >
            </div>
            <button @click="removeSocialLink(index)" class="btn-remove">删除</button>
          </div>
          <button @click="addSocialLink" class="btn-add">+ 添加社交链接</button>
        </div>
      </div>

      <!-- Save Button -->
      <div class="settings-actions">
        <div class="save-info">
          <p class="save-hint">设置修改后需要点击保存才能生效</p>
          <p class="last-saved" v-if="lastSaved">上次保存: {{ formatTime(lastSaved) }}</p>
        </div>
        <div class="action-buttons">
          <button @click="previewChanges" class="btn-secondary" :disabled="saving">
            👁️ 预览效果
          </button>
          <button @click="saveSettings" class="btn-primary" :disabled="saving">
            <span v-if="saving" class="loading-spinner"></span>
            {{ saving ? '保存中...' : '✨ 保存设置' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const settings = reactive({
  siteName: 'JCSKI',
  siteDescription: 'Personal Blog',
  heroTitle: 'JCSKI',
  heroSubtitle: 'INSPIRE JCSKI いろいろな発見',
  heroDescription: '様々なジャンルを超えた音楽や情報をお届けし、日常生活に新しいインスピレーションをもたらします。',
  heroImage: '',
  backgroundMusic: '',
  socialLinks: '[]'
})

const socialLinks = ref([])
const saving = ref(false)
const lastSaved = ref(null)
const fileInput = ref(null)

const resetToDefaults = async () => {
  if (confirm('确定要恢复默认设置吗？这将清除所有自定义配置。')) {
    Object.assign(settings, {
      siteName: 'JCSKI',
      siteDescription: 'Personal Blog',
      heroTitle: 'JCSKI',
      heroSubtitle: 'INSPIRE JCSKI いろいろな発見',
      heroDescription: '様々なジャンルを超えた音楽や情報をお届けし、日常生活に新しいインスピレーションをもたらします。',
      heroImage: '',
      backgroundMusic: '',
      socialLinks: '[]'
    })
    socialLinks.value = []
    alert('设置已恢复为默认值')
  }
}

const exportSettings = () => {
  const exportData = {
    ...settings,
    socialLinks: socialLinks.value,
    exportDate: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jcski-settings-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importSettings = () => {
  fileInput.value?.click()
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (file) {
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      if (importData.siteName && importData.heroTitle) {
        Object.assign(settings, importData)
        socialLinks.value = importData.socialLinks || []
        alert('设置导入成功！')
      } else {
        alert('导入文件格式不正确')
      }
    } catch (error) {
      alert('导入失败，请检查文件格式')
    }
  }
}

const previewChanges = () => {
  window.open('/', '_blank')
}

const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const loadSettings = async () => {
  try {
    const { data } = await $fetch('/api/admin/settings')
    if (data) {
      Object.assign(settings, data)
      socialLinks.value = JSON.parse(settings.socialLinks || '[]')
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    settings.socialLinks = JSON.stringify(socialLinks.value)
    
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: settings
    })
    
    lastSaved.value = new Date()
    alert('设置保存成功！')
  } catch (error) {
    console.error('Failed to save settings:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const addSocialLink = () => {
  socialLinks.value.push({
    name: '',
    url: '',
    icon: ''
  })
}

const removeSocialLink = (index) => {
  socialLinks.value.splice(index, 1)
}

onMounted(() => {
  loadSettings()
  // 模拟上次保存时间
  lastSaved.value = new Date(Date.now() - 1000 * 60 * 30) // 30分钟前
})
</script>

<style scoped>
.admin-settings {
  max-width: 800px;
}

.admin-settings h2 {
  margin-bottom: 24px;
  font-size: 20px;
  color: #333;
}

.settings-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-section {
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-input, .form-textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.image-upload, .audio-upload {
  display: flex;
  gap: 8px;
}

.btn-upload {
  padding: 10px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-upload:hover {
  background: #5a6268;
}

.image-preview, .audio-preview {
  margin-top: 12px;
}

.preview-img {
  max-width: 200px;
  height: auto;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.audio-player {
  width: 100%;
  max-width: 300px;
}

.social-links-editor {
  space-y: 12px;
}

.social-link-item {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 12px;
}

.link-fields {
  display: grid;
  grid-template-columns: 1fr 2fr 80px;
  gap: 8px;
  flex: 1;
}

.btn-remove {
  padding: 10px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-remove:hover {
  background: #c82333;
}

.btn-add {
  padding: 10px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
}

.btn-add:hover {
  background: #218838;
}

.settings-actions {
  padding: 24px;
  background: #f8f9fa;
  text-align: right;
}

.btn-primary {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .link-fields {
    grid-template-columns: 1fr;
  }
  
  .social-link-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .image-upload, .audio-upload {
    flex-direction: column;
  }
}
</style>