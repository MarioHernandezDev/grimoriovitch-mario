<!-- pages/index.vue -->
<script setup>
definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient()
const user = useSupabaseUser()

const searchQuery = ref('')

// Las 24 Runas mapeadas a las letras teclado de la fuente RUNE.ttf
const runes = ref([
  // AETT DE FREYR (1 - 8)
  { id: 'fehu', name: 'Fehu', symbol: 'f', meaning: 'Riqueza, abundancia, energía vital', aett: 'Aett de Freyr' },
  { id: 'uruz', name: 'Uruz', symbol: 'u', meaning: 'Fuerza salvaje, salud, perseverancia', aett: 'Aett de Freyr' },
{ id: 'thurisaz', name: 'Thurisaz', symbol: 'x', meaning: 'Fuerza reactiva, protección, caos', aett: 'Aett de Freyr' },  { id: 'ansuz', name: 'Ansuz', symbol: 'a', meaning: 'Sabiduría, comunicación, aliento divino', aett: 'Aett de Freyr' },
  { id: 'raido', name: 'Raido', symbol: 'r', meaning: 'Viaje, ritmo, evolución personal', aett: 'Aett de Freyr' },
  { id: 'kenaz', name: 'Kenaz', symbol: 'k', meaning: 'Fuego interior, claridad, inspiración', aett: 'Aett de Freyr' },
  { id: 'gebo', name: 'Gebo', symbol: 'g', meaning: 'Regalo, intercambio, equilibrio', aett: 'Aett de Freyr' },
  { id: 'wunjo', name: 'Wunjo', symbol: 'w', meaning: 'Gozo, armonía, realización', aett: 'Aett de Freyr' },

  // AETT DE HEIMDALL (9 - 16)
  { id: 'hagalaz', name: 'Hagalaz', symbol: 'h', meaning: 'Granizo, ruptura necesaria, prueba', aett: 'Aett de Heimdall' },
  { id: 'nauthiz', name: 'Nauthiz', symbol: 'n', meaning: 'Necesidad, restricción, resistencia', aett: 'Aett de Heimdall' },
  { id: 'isa', name: 'Isa', symbol: 'i', meaning: 'Hielo, quietud, concentración', aett: 'Aett de Heimdall' },
  { id: 'jera', name: 'Jera', symbol: 'j', meaning: 'Cosecha, ciclo natural, paciencia', aett: 'Aett de Heimdall' },
  { id: 'eihwaz', name: 'Eihwaz', symbol: 'y', meaning: 'Tejo, transformación, eje del mundo', aett: 'Aett de Heimdall' },
  { id: 'perthro', name: 'Perthro', symbol: 'p', meaning: 'Misterio, destino, lo oculto', aett: 'Aett de Heimdall' },
  { id: 'algiz', name: 'Algiz', symbol: 'z', meaning: 'Protección divina, conexión espiritual', aett: 'Aett de Heimdall' },
  { id: 'sowilo', name: 'Sowilo', symbol: 's', meaning: 'Sol, victoria, energía sanadora', aett: 'Aett de Heimdall' },

  // AETT DE TYR (17 - 24)
  { id: 'tiwaz', name: 'Tiwaz', symbol: 't', meaning: 'Justicia, honor, sacrificio del ego', aett: 'Aett de Tyr' },
  { id: 'berkano', name: 'Berkano', symbol: 'b', meaning: 'Nacimiento, crecimiento, nutrición', aett: 'Aett de Tyr' },
  { id: 'ehwaz', name: 'Ehwaz', symbol: 'e', meaning: 'Caballo, lealtad, trabajo en equipo', aett: 'Aett de Tyr' },
  { id: 'mannaz', name: 'Mannaz', symbol: 'm', meaning: 'Humanidad, la mente, la comunidad', aett: 'Aett de Tyr' },
  { id: 'laguz', name: 'Laguz', symbol: 'l', meaning: 'Agua, intuición, flujo emocional', aett: 'Aett de Tyr' },
  { id: 'ingwaz', name: 'Ingwaz', symbol: 'q', meaning: 'Semilla, gestación, potencial interno', aett: 'Aett de Tyr' },
  { id: 'dagaz', name: 'Dagaz', symbol: 'd', meaning: 'Amanecer, despertar, transformación', aett: 'Aett de Tyr' },
  { id: 'othala', name: 'Othala', symbol: 'o', meaning: 'Hogar, ancestros, herencia espiritual', aett: 'Aett de Tyr' }
])

const filteredRunes = computed(() => {
  if (!searchQuery.value.trim()) return runes.value
  const query = searchQuery.value.toLowerCase()
  return runes.value.filter(r => 
    r.name.toLowerCase().includes(query) ||
    r.meaning.toLowerCase().includes(query) ||
    r.aett.toLowerCase().includes(query)
  )
})

const groupedRunes = computed(() => {
  const groups = {}
  filteredRunes.value.forEach(rune => {
    if (!groups[rune.aett]) {
      groups[rune.aett] = []
    }
    groups[rune.aett].push(rune)
  })
  return groups
})
</script>

<template>
  <div class="min-h-screen w-full pb-20">
    <!-- BARRA SUPERIOR CON BUSCADOR -->
    <header class="w-full bg-black/40 backdrop-blur-md border-b border-[#363138]/60 sticky top-0 z-30 px-4 sm:px-8 py-4">
      <div class="max-w-4xl mx-auto">
        <div class="relative w-full">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por runa, significado o Aett..."
            class="w-full bg-black/50 border border-[#363138] rounded-full px-6 py-3.5 text-base text-[#e6e1da] placeholder-[#b3ac9f]/50 focus:outline-none focus:border-[#d4a359] focus:ring-1 focus:ring-[#d4a359]/40 transition duration-200 shadow-inner"
          />
        </div>
      </div>
    </header>

    <!-- CONTENIDO PRINCIPAL FULLWIDTH -->
    <main class="w-full pt-8 sm:pt-12">
      
      <!-- Título de la vista -->
      <div class="max-w-5xl mx-auto px-4 sm:px-8 mb-10 text-center">
        <h1 class="font-title text-4xl sm:text-6xl text-[#e6e1da] uppercase tracking-[0.2em]">
          Grimorio Digital
        </h1>
        <p class="text-sm sm:text-base text-[#b3ac9f] mt-3 font-light tracking-wide">
          Consulta y explora las energías del Futhark Antiguo
        </p>
      </div>

      <!-- Sin resultados -->
      <div v-if="Object.keys(groupedRunes).length === 0" class="text-center py-20">
        <p class="font-title text-xl text-[#b3ac9f]">No se encontraron runas con esa búsqueda...</p>
      </div>

      <!-- SECCIONES POR AETT FULLWIDTH SIN BORDE EXTERIOR -->
      <div v-else class="space-y-16">
        <section v-for="(runeGroup, aettName) in groupedRunes" :key="aettName" class="w-full">
          
          <!-- Encabezado del Aett -->
          <div class="max-w-5xl mx-auto px-4 sm:px-8 flex items-center justify-between mb-6 border-b border-[#363138]/50 pb-3">
            <h2 class="font-title text-2xl sm:text-3xl text-[#d4a359] uppercase tracking-widest">
              {{ aettName }}
            </h2>
            <span class="text-xs text-[#b3ac9f]/60 font-light tracking-wider uppercase">
              {{ runeGroup.length }} RUNAS
            </span>
          </div>

          <!-- Grid Fullwidth: Fondo al 10% y divisiones internas sin borde exterior -->
          <div class="w-full grid grid-cols-2 sm:grid-cols-4 bg-black/10 backdrop-blur-[2px]">
            <NuxtLink 
              v-for="(rune, index) in runeGroup" 
              :key="rune.id"
              :to="`/runas/${rune.id}`"
              class="group flex flex-col items-center justify-center text-center p-6 sm:p-10 transition-all duration-300 hover:bg-[#d4a359]/10 border-b border-r border-[#363138]/50 cursor-pointer select-none [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(4n)]:border-r-0"
            >
              <!-- Símbolo Rúnico -->
              <div class="rune-glyph text-6xl sm:text-7xl text-[#d4a359] group-hover:text-[#e6e1da] group-hover:scale-110 transition duration-300 drop-shadow-[0_2px_8px_rgba(212,163,89,0.3)] mb-3 leading-none">
                {{ rune.symbol }}
              </div>

              <!-- Nombre -->
              <h3 class="font-title text-base sm:text-lg text-[#e6e1da] tracking-wider uppercase mb-1">
                {{ rune.name }}
              </h3>

              <!-- Significado -->
              <p class="text-xs text-[#b3ac9f] font-light line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition duration-200 max-w-[200px]">
                {{ rune.meaning }}
              </p>
            </NuxtLink>
          </div>

        </section>
      </div>

    </main>
  </div>
</template>