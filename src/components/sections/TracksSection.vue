<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { setTeamFilter } from '../../composables/useTeamFilter'
import { assetUrl } from '../../composables/api'

const { t } = useI18n()

const themeIconSrc: Record<string, string> = {
  '01': assetUrl('/icons/theme-01.svg'),
  '02': assetUrl('/icons/theme-02-v2.svg'),
  '03': assetUrl('/icons/theme-03.svg'),
  '04': assetUrl('/icons/theme-04.svg'),
  '05': assetUrl('/icons/theme-05.svg'),
  '06': assetUrl('/icons/theme-06.svg'),
  '07': assetUrl('/icons/theme-07.svg'),
}

// Map theme number to track id used in team registration
const themeIds: Record<string, string> = {
  '01': 'agents-meet-apps',
  '02': 'claws-octos',
  '03': 'hai',
  '04': 'education',
  '05': 'content-remix',
  '06': 'productivity',
  '07': 'agents-voices',
}

const themes = computed(() => t('tracks.themes') as any[])

const expandedTheme = ref<string | null>('01')

function toggleTheme(number: string) {
  expandedTheme.value = expandedTheme.value === number ? null : number
}

const themeColors: Record<string, string> = {
  '01': '#4CAF50',
  '02': '#E8D44D',
  '03': '#3BA7D0',
  '04': '#ef4444',
  '05': '#a855f7',
  '06': '#f59e0b',
  '07': '#3b82f6',
}
</script>

<template>
  <section id="themes" class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-blue/5 rounded-full blur-[120px]"></div>

    <div class="max-w-7xl mx-auto px-6">
      <!-- Section intro -->
      <div class="text-center mb-8 reveal">
        <h2 class="text-4xl md:text-5xl mt-4">
          <span class="heading-serif accent-text">{{ t('tracks.title') }}</span>
        </h2>
      </div>

      <div class="max-w-3xl mx-auto text-center mb-16 reveal reveal-delay-1">
        <p class="text-text-secondary leading-relaxed">
          {{ t('tracks.intro') }}
        </p>
      </div>

      <!-- Theme list -->
      <div class="max-w-4xl mx-auto">
        <div
          v-for="(theme, i) in themes"
          :key="theme.number"
          class="relative pl-8 py-8 cursor-pointer glass-card-glow reveal border-l-2 border-transparent group hover:bg-bg-card/20 transition-colors"
          :class="`reveal-delay-${(i % 4) + 1}`"
          :style="{ borderImage: `linear-gradient(to bottom, ${themeColors[theme.number]}, transparent) 1` }"
          @click="toggleTheme(theme.number)"
        >
          <!-- Watermark number -->
          <span class="absolute -top-2 -left-3 text-7xl font-black gradient-number opacity-10 select-none" style="line-height:1;">{{ theme.number }}</span>

          <!-- Header -->
          <div class="relative flex items-start gap-4">
            <img v-if="themeIconSrc[theme.number]" :src="themeIconSrc[theme.number]" class="w-7 h-7 theme-icon shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="heading-serif text-xl text-text-primary">{{ theme.title }}</h3>
                <span class="text-sm text-text-muted">{{ theme.subtitle }}</span>
              </div>
              <p class="text-text-secondary text-sm leading-relaxed">{{ theme.description }}</p>
              <span v-if="expandedTheme !== theme.number" class="inline-flex items-center gap-1 text-xs text-text-muted mt-2 group-hover:text-text-secondary transition-colors">
                Click to explore
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>
            <svg
              class="w-5 h-5 shrink-0 mt-1 transition-all duration-300"
              :class="expandedTheme === theme.number ? 'rotate-180 text-text-secondary' : 'text-text-muted group-hover:text-text-secondary'"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <!-- Expanded content -->
          <Transition name="expand">
            <div v-if="expandedTheme === theme.number" class="relative mt-6 pl-11">
              <p class="text-text-secondary text-sm leading-relaxed mb-6">{{ theme.detail }}</p>
              <div>
                <h4 class="text-xs text-text-muted uppercase tracking-wider mb-3 font-semibold">Possible Directions</h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="dir in theme.directions"
                    :key="dir"
                    class="px-3 py-1.5 text-xs border border-border text-text-secondary"
                  >
                    {{ dir }}
                  </span>
                </div>
              </div>
              <button
                @click.stop="setTeamFilter(themeIds[theme.number] || theme.title)"
                class="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-border text-sm text-text-secondary hover:text-text-primary hover:border-border-strong transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
                View Teams
              </button>
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
