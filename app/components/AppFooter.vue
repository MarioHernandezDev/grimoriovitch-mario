<!-- components/AppFooter.vue -->
<script setup>
const client = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(false)

const logout = async () => {
  loading.value = true
  await client.auth.signOut()
  loading.value = false
  await navigateTo('/login')
}
</script>

<template>
  <footer v-if="user" class="w-full py-8 flex justify-center">
    <button
      type="button"
      :disabled="loading"
      @click="logout"
      class="font-title text-xs uppercase tracking-[0.25em] text-[#b3ac9f]/70 hover:text-[#d4a359] disabled:opacity-50 transition-colors duration-300"
    >
      {{ loading ? 'Cerrando...' : 'Cerrar sesión' }}
    </button>
  </footer>
</template>
