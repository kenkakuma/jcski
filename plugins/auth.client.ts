export default defineNuxtPlugin(() => {
  // 这个插件用于在客户端添加认证拦截器
  // 由于 $fetch.create 在某些情况下可能不可用，我们使用更简单的方法
  
  // 设置全局认证token处理
  if (process.client) {
    const authToken = useCookie('auth-token')
    
    // 提供一个全局的认证状态检查函数
    const checkAuth = () => {
      return !!authToken.value
    }
    
    // 将认证检查函数添加到全局上下文
    return {
      provide: {
        checkAuth,
        getAuthToken: () => authToken.value
      }
    }
  }
})