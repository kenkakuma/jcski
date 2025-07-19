<template>
  <div class="layout">
    <Header />
    
    <div class="layout-body">
      <Sidebar />
      
      <main class="main-content">
        <slot />
      </main>
    </div>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
// Layout setup
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: white;
}

.layout-body {
  display: flex;
}

.main-content {
  flex: 1;
  margin-left: 256px;
  min-height: calc(100vh - 73px);
}
</style>