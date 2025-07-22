<template>
  <div class="monitoring-dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">JCSKI Blog 性能监控</h1>
      <p class="page-subtitle">AWS EC2 t2.micro 实时监控面板</p>
      <div class="refresh-controls">
        <button @click="refreshData" :disabled="loading" class="refresh-btn">
          {{ loading ? '刷新中...' : '刷新数据' }}
        </button>
        <label>
          <input type="checkbox" v-model="autoRefresh" @change="toggleAutoRefresh">
          自动刷新 (30秒)
        </label>
      </div>
    </div>

    <div v-if="error" class="error-banner">
      <strong>错误:</strong> {{ error }}
    </div>

    <!-- 健康状态概览 -->
    <div class="status-overview">
      <div class="status-card" :class="health?.status">
        <h3>系统状态</h3>
        <div class="status-indicator">
          <span class="status-dot" :class="health?.status"></span>
          {{ health?.status || 'Unknown' }}
        </div>
        <div class="status-details">
          <p>运行时间: {{ formatUptime(health?.services?.application?.uptime) }}</p>
          <p>内存使用: {{ health?.services?.application?.memory?.used }}MB / 1GB</p>
        </div>
      </div>

      <div class="status-card" :class="health?.services?.database?.status">
        <h3>数据库</h3>
        <div class="status-indicator">
          <span class="status-dot" :class="health?.services?.database?.status"></span>
          {{ health?.services?.database?.status || 'Unknown' }}
        </div>
      </div>

      <div class="status-card" :class="health?.services?.storage?.status">
        <h3>存储</h3>
        <div class="status-indicator">
          <span class="status-dot" :class="health?.services?.storage?.status"></span>
          {{ health?.services?.storage?.status || 'Unknown' }}
        </div>
      </div>
    </div>

    <!-- 性能指标 -->
    <div v-if="metrics" class="metrics-section">
      <div class="metrics-grid">
        <!-- 请求统计 -->
        <div class="metric-card">
          <h3>请求统计 (1小时)</h3>
          <div class="metric-value">{{ metrics.summary?.requestCount || 0 }}</div>
          <div class="metric-details">
            <p>平均响应时间: {{ metrics.summary?.avgResponseTime || 0 }}ms</p>
            <p>错误率: {{ metrics.summary?.errorRate || 0 }}%</p>
          </div>
        </div>

        <!-- 内存使用 -->
        <div class="metric-card">
          <h3>内存使用</h3>
          <div class="metric-value">{{ metrics.summary?.memoryUsage?.average || 0 }}MB</div>
          <div class="metric-details">
            <p>峰值: {{ metrics.summary?.memoryUsage?.peak || 0 }}MB</p>
            <div class="memory-bar">
              <div 
                class="memory-usage" 
                :style="{ width: `${(metrics.summary?.memoryUsage?.average || 0) / 10}%` }">
              </div>
            </div>
          </div>
        </div>

        <!-- 系统负载 -->
        <div class="metric-card">
          <h3>系统负载</h3>
          <div class="metric-value">{{ formatLoadAvg(metrics.system?.loadAverage) }}</div>
          <div class="metric-details">
            <p>1分钟 / 5分钟 / 15分钟平均负载</p>
          </div>
        </div>
      </div>

      <!-- 端点统计 -->
      <div class="endpoints-section">
        <h3>API端点统计</h3>
        <div class="endpoints-table">
          <table>
            <thead>
              <tr>
                <th>端点</th>
                <th>请求数</th>
                <th>平均时间</th>
                <th>错误数</th>
                <th>错误率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, endpoint) in metrics.endpoints" :key="endpoint">
                <td class="endpoint-path">{{ endpoint }}</td>
                <td>{{ data.count }}</td>
                <td>{{ Math.round(data.avgTime) }}ms</td>
                <td>{{ data.errors }}</td>
                <td>{{ ((data.errors / data.count) * 100).toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 最近请求 -->
      <div class="recent-requests">
        <h3>最近请求 (最新10条)</h3>
        <div class="requests-table">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>方法</th>
                <th>路径</th>
                <th>状态</th>
                <th>响应时间</th>
                <th>内存</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in recentRequests" :key="request.timestamp" 
                  :class="{ error: request.statusCode >= 400 }">
                <td>{{ formatTime(request.timestamp) }}</td>
                <td>{{ request.method }}</td>
                <td class="endpoint-path">{{ request.path }}</td>
                <td :class="getStatusClass(request.statusCode)">{{ request.statusCode }}</td>
                <td>{{ request.responseTime }}ms</td>
                <td>{{ Math.round(request.memoryUsage / 1024 / 1024) }}MB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="last-updated">
      最后更新: {{ lastUpdated }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 响应式数据
const health = ref(null)
const metrics = ref(null)
const loading = ref(false)
const error = ref('')
const autoRefresh = ref(false)
const lastUpdated = ref('')
let refreshTimer: NodeJS.Timeout | null = null

// 计算属性
const recentRequests = computed(() => {
  if (!metrics.value?.recent) return []
  return metrics.value.recent.slice(-10).reverse()
})

// 获取健康状态
const fetchHealth = async () => {
  try {
    const response = await $fetch('/api/monitoring/health')
    health.value = response
  } catch (err) {
    console.error('Failed to fetch health:', err)
    error.value = 'Failed to fetch health status'
  }
}

// 获取性能指标
const fetchMetrics = async () => {
  try {
    const response = await $fetch('/api/monitoring/metrics', {
      headers: {
        'Authorization': 'Bearer monitor-token' // 简单认证
      }
    })
    metrics.value = response.data
  } catch (err) {
    console.error('Failed to fetch metrics:', err)
    error.value = 'Failed to fetch performance metrics'
  }
}

// 刷新所有数据
const refreshData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await Promise.all([fetchHealth(), fetchMetrics()])
    lastUpdated.value = new Date().toLocaleString()
  } catch (err) {
    console.error('Failed to refresh data:', err)
  } finally {
    loading.value = false
  }
}

// 切换自动刷新
const toggleAutoRefresh = () => {
  if (autoRefresh.value) {
    refreshTimer = setInterval(refreshData, 30000) // 30秒
  } else {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }
}

// 格式化函数
const formatUptime = (seconds: number) => {
  if (!seconds) return 'Unknown'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatLoadAvg = (loadAvg: number[]) => {
  if (!loadAvg || loadAvg.length !== 3) return '0.00 / 0.00 / 0.00'
  return loadAvg.map(l => l.toFixed(2)).join(' / ')
}

const getStatusClass = (status: number) => {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'warning'
  return 'error'
}

// 生命周期
onMounted(() => {
  refreshData()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

// SEO
useHead({
  title: 'JCSKI Blog - 性能监控',
  meta: [
    { name: 'description', content: 'JCSKI Blog 实时性能监控面板' }
  ]
})
</script>

<style scoped>
.monitoring-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans SC', 'Noto Sans JP', sans-serif;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #333;
}

.page-subtitle {
  color: #666;
  margin-bottom: 20px;
}

.refresh-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.refresh-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-banner {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.status-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.status-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #ddd;
}

.status-card.healthy {
  border-left-color: #4CAF50;
}

.status-card.warning {
  border-left-color: #FF9800;
}

.status-card.error {
  border-left-color: #F44336;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 10px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ddd;
}

.status-dot.healthy {
  background: #4CAF50;
}

.status-dot.warning {
  background: #FF9800;
}

.status-dot.error {
  background: #F44336;
}

.status-details p {
  margin: 4px 0;
  font-size: 0.9rem;
  color: #666;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metric-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4CAF50;
  margin-bottom: 8px;
}

.metric-details p {
  margin: 4px 0;
  font-size: 0.9rem;
  color: #666;
}

.memory-bar {
  background: #f0f0f0;
  height: 8px;
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
}

.memory-usage {
  background: linear-gradient(90deg, #4CAF50, #FF9800);
  height: 100%;
  transition: width 0.3s ease;
}

.endpoints-section, .recent-requests {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.endpoints-section h3, .recent-requests h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.endpoints-table, .requests-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

th {
  background: #f5f5f5;
  font-weight: 600;
}

.endpoint-path {
  font-family: monospace;
  font-size: 0.9rem;
}

tr.error {
  background: #ffebee;
}

.success {
  color: #4CAF50;
}

.warning {
  color: #FF9800;
}

.error {
  color: #F44336;
}

.last-updated {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .monitoring-dashboard {
    padding: 10px;
  }
  
  .status-overview {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .refresh-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  table {
    font-size: 0.8rem;
  }
  
  th, td {
    padding: 6px 8px;
  }
}
</style>