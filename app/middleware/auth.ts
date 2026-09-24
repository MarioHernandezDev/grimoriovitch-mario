export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // Si el usuario no está autenticado, redirigir a /login
  if (!user.value) {
    return navigateTo('/login')
  }
})