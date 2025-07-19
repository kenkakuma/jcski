export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('admin-token')
  
  if (!token.value) {
    return navigateTo('/admin/login')
  }
  
  // TODO: Verify token with server
  // For now, just check if token exists
})