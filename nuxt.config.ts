// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-09-23',

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'theme-color', content: '#121113' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Grivo' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/pwa-64x64.png' }
      ]
    }
  },

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
      lang: 'es',
      id: '/',
      start_url: '/',
      scope: '/',
      icons: [
        { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//, /^\/confirm/],
      globPatterns: ['**/*.{js,css,html,png,ico,svg,woff,woff2,ttf,TTF,jpg}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
    },
    devOptions: {
      enabled: false, // Evita que el service worker solicite assets de Workbox en desarrollo
      type: 'module'
    }
  }
})