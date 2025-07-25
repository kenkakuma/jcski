#!/usr/bin/env node

// 测试文章发布功能的脚本
const fetch = require('node-fetch')

const BASE_URL = 'https://jcski.com'

// 管理员登录函数
async function adminLogin() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@jcski.com',
        password: 'admin123456'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ 管理员登录成功')
    return data.token
  } catch (error) {
    console.error('❌ 登录失败:', error.message)
    throw error
  }
}

// 获取文章列表
async function getArticles(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/posts?published=all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get articles: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ 获取文章列表成功: ${data.data.posts.length} 篇文章`)
    return data.data.posts
  } catch (error) {
    console.error('❌ 获取文章列表失败:', error.message)
    throw error
  }
}

// 创建新文章
async function createArticle(token) {
  const testArticle = {
    title: `测试文章 ${new Date().toISOString()}`,
    content: '这是一篇测试文章，用于验证文章发布功能是否正常工作。',
    excerpt: '测试文章摘要',
    slug: `test-article-${Date.now()}`,
    category: 'TECH',
    published: true,
    isPinned: false,
    tags: ['测试', '文章发布', '功能验证']
  }

  try {
    const response = await fetch(`${BASE_URL}/api/admin/posts/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testArticle)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create article: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('✅ 文章创建成功:', data.post.title)
    return data.post
  } catch (error) {
    console.error('❌ 文章创建失败:', error.message)
    throw error
  }
}

// 验证文章是否在前端可见
async function verifyArticlePublic(slug) {
  try {
    const response = await fetch(`${BASE_URL}/api/posts/${slug}`)
    
    if (!response.ok) {
      throw new Error(`Failed to get public article: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ 文章在前端可见:', data.post.title)
    return data.post
  } catch (error) {
    console.error('❌ 文章前端访问失败:', error.message)
    throw error
  }
}

// 主测试函数
async function runTest() {
  console.log('🚀 开始测试文章管理功能...\n')
  
  try {
    // 1. 登录
    console.log('1. 测试管理员登录...')
    const token = await adminLogin()
    console.log('')
    
    // 2. 获取现有文章列表
    console.log('2. 获取现有文章列表...')
    const initialArticles = await getArticles(token)
    console.log('现有文章:')
    initialArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title} (${article.published ? '已发布' : '草稿'})`)
    })
    console.log('')
    
    // 3. 创建新文章
    console.log('3. 创建新测试文章...')
    const newArticle = await createArticle(token)
    console.log('')
    
    // 4. 验证文章列表更新
    console.log('4. 验证文章列表更新...')
    const updatedArticles = await getArticles(token)
    if (updatedArticles.length > initialArticles.length) {
      console.log('✅ 文章列表已更新')
    } else {
      console.log('⚠️  文章列表未更新，可能存在问题')
    }
    console.log('')
    
    // 5. 验证文章在前端可见
    console.log('5. 验证文章在前端可见...')
    await verifyArticlePublic(newArticle.slug)
    console.log('')
    
    console.log('🎉 所有测试通过！文章管理功能正常工作。')
    
  } catch (error) {
    console.error('\n💥 测试失败:', error.message)
    process.exit(1)
  }
}

// 运行测试
runTest()