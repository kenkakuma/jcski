export default defineNuxtPlugin(() => {
  const { $fetch } = useNuxtApp()

  // 拦截所有 admin API 请求，自动添加认证token
  $fetch.create({
    onRequest({ request, options }) {
      // 只对admin API请求添加认证头
      if (typeof request === 'string' && request.includes('/api/admin/')) {
        const token = useCookie('auth-token').value
        if (token) {
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
          }
        }
      }
    },
    onResponseError({ response }) {
      // 如果收到401错误，清除token并重定向到登录页
      if (response.status === 401) {
        const token = useCookie('auth-token')
        token.value = null
        navigateTo('/admin/login')
      }
    }
  })
})