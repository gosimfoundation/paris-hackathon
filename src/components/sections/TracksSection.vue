<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { setTeamFilter } from '../../composables/useTeamFilter'

const { t } = useI18n()

const themeIcons: Record<string, string> = {
  '01': 'M13 10V3L4 14h7v7l9-11h-7z',
  '02': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  '03': 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122',
  '04': 'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5',
  '05': 'M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z',
  '06': 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5',
  '07': 'M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z',
}

const themes = computed(() => t('tracks.themes') as any[])

const expandedTheme = ref<string | null>(null)

function toggleTheme(number: string) {
  expandedTheme.value = expandedTheme.value === number ? null : number
}
</script>

<template>
  <section id="themes" class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-blue/5 rounded-full blur-[120px]"></div>

    <div class="max-w-7xl mx-auto px-6">
      <!-- Section intro -->
      <div class="text-center mb-8 reveal">
        <h2 class="text-4xl md:text-5xl font-bold mt-4">
          <span class="heading-serif accent-text">{{ t('tracks.title') }}</span>
        </h2>
      </div>

      <div class="max-w-3xl mx-auto text-center mb-16 reveal reveal-delay-1">
        <p class="text-text-secondary leading-relaxed">
          {{ t('tracks.intro') }}
        </p>
      </div>

      <!-- Theme cards -->
      <div class="space-y-6">
        <div
          v-for="(theme, i) in themes"
          :key="theme.number"
          class="glass-card glass-card-glow overflow-hidden reveal cursor-pointer"
          :class="`reveal-delay-${(i % 4) + 1}`"
          @click="toggleTheme(theme.number)"
        >
          <!-- Header -->
          <div class="p-8 flex items-start gap-6">
            <div class="shrink-0 flex flex-col items-center gap-2">
              <svg v-if="themeIcons[theme.number]" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" :d="themeIcons[theme.number]" /></svg>
              <span class="text-3xl font-black gradient-number">{{ theme.number }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-xl font-bold text-gray-900">{{ theme.title }}</h3>
                <span class="text-sm text-gray-400">{{ theme.subtitle }}</span>
              </div>
              <p class="text-text-secondary text-sm leading-relaxed">{{ theme.description }}</p>
            </div>
            <svg
              class="w-5 h-5 text-gray-400 shrink-0 mt-1 transition-transform duration-300"
              :class="{ 'rotate-180': expandedTheme === theme.number }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <!-- Expanded content -->
          <Transition name="expand">
            <div v-if="expandedTheme === theme.number" class="px-8 pb-8">
              <div class="border-t border-gray-200/60 pt-6">
                <p class="text-text-secondary text-sm leading-relaxed mb-6">{{ theme.detail }}</p>
                <div>
                  <h4 class="text-xs text-gray-400 uppercase tracking-wider mb-3 font-semibold">Possible Directions</h4>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="dir in theme.directions"
                      :key="dir"
                      class="px-3 py-1.5 text-xs rounded-full border border-gray-200 text-text-secondary bg-white/50"
                    >
                      {{ dir }}
                    </span>
                  </div>
                </div>
                <button
                  @click.stop="setTeamFilter(theme.title)"
                  class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-text-secondary hover:text-gray-900 hover:border-gray-400 transition-all"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
                  View Teams
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
