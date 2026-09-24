// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-09-23',

  // 1. Estilos globales (incluye el main.css que creamos)
  css: [
    '~/assets/css/main.css'
  ],

  // 2. Módulos de Nuxt
  modules: [
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  // 3. Configuración de Supabase
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: [], // Protege todas las rutas excepto /login por defecto
    }
  },

  // 4. Configuración de la PWA (Progressive Web App)
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Grivo',
      short_name: 'Grivo',
      description: 'Espacio personal de meditación, introspección y trabajo con runas.',
      theme_color: '#121113', // Tono oscuro ahumado de la paleta
      background_color: '#121113',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: false, // Evita que el service worker solicite assets de Workbox en desarrollo
      type: 'module'
    }
  }
})