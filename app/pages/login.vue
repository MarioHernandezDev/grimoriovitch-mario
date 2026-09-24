<!-- pages/login.vue -->
<script setup>
definePageMeta({
  layout: false
})

const client = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const { error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) throw error

    router.push('/')
  } catch (error) {
    errorMessage.value = error.message || 'Credenciales incorrectas o error de acceso'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Login Integrado (Completamente abierto y flotante) -->
    <div class="w-full max-w-xl p-4 sm:p-8 relative z-10 bg-transparent">
      
      <!-- Cabecera principal -->
      <div class="text-center mb-10">
        <h1 class="font-title text-5xl sm:text-6xl tracking-[0.2em] text-[#e6e1da] uppercase">
          Grimovitch
        </h1>
        <p class="text-base sm:text-lg text-[#b3ac9f] mt-3 font-light tracking-wide">
          Cuaderno de campo para pruebas personales !
        </p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="flex flex-col gap-6 max-w-md mx-auto">
        <div>
          <!-- Label con Kabilla -->
          <label class="font-title block text-sm sm:text-base text-[#b3ac9f] uppercase tracking-[0.15em] mb-2">
            CORREO
          </label>
          <input 
            v-model="email" 
            type="email" 
            required
            placeholder="tu@email.com"
            class="w-full bg-black/40 border border-[#363138]/80 px-5 py-4 text-base text-[#e6e1da] placeholder-[#9e968d]/50 focus:outline-none focus:border-[#d4a359] transition duration-200"
          />
        </div>

        <div>
          <!-- Label con Kabilla -->
          <label class="font-title block text-sm sm:text-base text-[#b3ac9f] uppercase tracking-[0.15em] mb-2">
            CONTRASEÑA
          </label>
          <input 
            v-model="password" 
            type="password" 
            required
            placeholder="••••••••"
            class="w-full bg-black/40 border border-[#363138]/80 px-5 py-4 text-base text-[#e6e1da] placeholder-[#9e968d]/50 focus:outline-none focus:border-[#d4a359] transition duration-200"
          />
        </div>

        <!-- Mensaje de Error -->
        <Transition name="fade">
          <div v-if="errorMessage" class="text-sm text-[#e879f9] bg-black/70 border border-[#501b2d] p-4 text-center leading-relaxed">
            {{ errorMessage }}
          </div>
        </Transition>

        <!-- Botón de Entrada Modo Píldora Revisitado -->
        <button 
          type="submit" 
          :disabled="loading"
          class="group font-title relative w-full overflow-hidden rounded-full py-4 px-8 mt-4 text-lg sm:text-xl text-[#e6e1da] uppercase tracking-[0.25em] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 bg-gradient-to-r from-[#8f553f] via-[#a86a51] to-[#c48e46] border border-[#d4a359]/40 shadow-[0_0_20px_rgba(168,106,81,0.25)] hover:shadow-[0_0_30px_rgba(212,163,89,0.45)] hover:border-[#d4a359]"
        >
          <!-- Destello de fondo dinámico -->
          <span class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          
          <span v-if="loading" class="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <span class="relative z-10 font-bold drop-shadow-md">
            {{ loading ? 'Abriendo umbral...' : 'LETS GO' }}
          </span>
        </button>
      </form>

      <!-- Pie estético -->
      <div class="mt-12 pt-6 border-t border-[#363138]/40 text-center max-w-md mx-auto">
        <span class="font-title text-sm text-[#b3ac9f]/80 tracking-widest uppercase">
          De mí para mí...
        </span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>