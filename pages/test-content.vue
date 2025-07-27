<template>
  <div class="test-content-page">
    <h1>Content Studio 测试页面</h1>
    
    <div v-if="pending">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error">
      <p style="color: red;">错误: {{ error }}</p>
    </div>
    
    <div v-else>
      <h2>Content 文件列表</h2>
      <ul>
        <li v-for="item in data" :key="item._path">
          <strong>{{ item.title || item._path }}</strong>
          <br>
          <small>路径: {{ item._path }}</small>
          <br>
          <small v-if="item.description">描述: {{ item.description }}</small>
        </li>
      </ul>
      
      <h2>Blog 文章</h2>
      <div v-if="blogPosts && blogPosts.length > 0">
        <div v-for="post in blogPosts" :key="post._path" style="border: 1px solid #ccc; margin: 10px 0; padding: 10px;">
          <h3>{{ post.title }}</h3>
          <p>{{ post.description }}</p>
          <p><strong>分类:</strong> {{ post.category }}</p>
          <p><strong>标签:</strong> {{ post.tags?.join(', ') }}</p>
          <p><strong>发布状态:</strong> {{ post.published ? '已发布' : '草稿' }}</p>
        </div>
      </div>
      <div v-else>
        <p>没有找到 blog 文章</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 查询所有 content 文件
const { data, pending, error } = await useAsyncData('all-content', () => queryContent().find())

// 专门查询 blog 文章
const { data: blogPosts } = await useAsyncData('blog-posts', () => queryContent('/blog').find())

console.log('All content:', data.value)
console.log('Blog posts:', blogPosts.value)
</script>

<style scoped>
.test-content-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

h1, h2 {
  color: #333;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background: #f5f5f5;
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
}
</style>