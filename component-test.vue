<template>
  <div class="component-test">
    <h1>🧪 组件加载测试</h1>
    
    <div class="test-section">
      <h2>📝 AdvancedPostManager</h2>
      <div class="test-result">
        <AdvancedPostManager v-if="showAdvancedPostManager" />
        <button @click="showAdvancedPostManager = !showAdvancedPostManager">
          {{ showAdvancedPostManager ? '隐藏' : '显示' }} AdvancedPostManager
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>🎯 AdminHero</h2>
      <div class="test-result">
        <AdminHero v-if="showAdminHero" />
        <button @click="showAdminHero = !showAdminHero">
          {{ showAdminHero ? '隐藏' : '显示' }} AdminHero
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>🖼️ AdminMedia</h2>
      <div class="test-result">
        <AdminMedia v-if="showAdminMedia" />
        <button @click="showAdminMedia = !showAdminMedia">
          {{ showAdminMedia ? '隐藏' : '显示' }} AdminMedia
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>⚙️ AdminSiteSettings</h2>
      <div class="test-result">
        <AdminSiteSettings v-if="showAdminSiteSettings" />
        <button @click="showAdminSiteSettings = !showAdminSiteSettings">
          {{ showAdminSiteSettings ? '隐藏' : '显示' }} AdminSiteSettings
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>📅 AdminCalendar</h2>
      <div class="test-result">
        <AdminCalendar v-if="showAdminCalendar" />
        <button @click="showAdminCalendar = !showAdminCalendar">
          {{ showAdminCalendar ? '隐藏' : '显示' }} AdminCalendar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdvancedPostManager from '~/components/AdvancedPostManager.vue'
import AdminHero from '~/components/AdminHero.vue'
import AdminMedia from '~/components/AdminMedia.vue'
import AdminSiteSettings from '~/components/AdminSiteSettings.vue'
import AdminCalendar from '~/components/AdminCalendar.vue'

const showAdvancedPostManager = ref(false)
const showAdminHero = ref(false)
const showAdminMedia = ref(false)
const showAdminSiteSettings = ref(false)
const showAdminCalendar = ref(false)
</script>

<style scoped>
.component-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin: 30px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.test-section h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.test-result {
  margin-top: 15px;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 15px;
}

button:hover {
  background: #0056b3;
}
</style>