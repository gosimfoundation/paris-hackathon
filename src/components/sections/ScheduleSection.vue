<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const activeDay = ref<1 | 2>(1)

const schedule = computed(() => t('schedule.items') as any)
</script>

<template>
  <section id="schedule" class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="max-w-4xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <span class="text-accent text-sm font-semibold uppercase tracking-wider">{{ t('schedule.eyebrow') }}</span>
        <h2 class="text-4xl md:text-5xl mt-4">
          <span class="heading-serif accent-text">{{ t('schedule.title') }}</span>
        </h2>
      </div>

      <!-- Day tabs -->
      <div class="flex justify-center gap-4 mb-12 reveal">
        <button
          v-for="day in ([1, 2] as const)"
          :key="day"
          @click="activeDay = day"
          class="px-8 py-3 text-sm font-semibold tracking-wider uppercase transition-all border"
          :class="activeDay === day
            ? 'bg-accent border-accent text-white'
            : 'border-gray-200 bg-transparent text-text-secondary hover:text-gray-900 hover:border-gray-300'"
        >
          {{ day === 1 ? t('schedule.day1') : t('schedule.day2') }}
        </button>
      </div>

      <!-- Timeline -->
      <div class="relative">
        <!-- Vertical line -->
        <div class="absolute left-[7px] md:left-[140px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500"></div>

        <div
          v-for="(item, i) in schedule[activeDay]"
          :key="`${activeDay}-${i}`"
          class="relative flex gap-6 md:gap-8 mb-8 group"
        >
          <!-- Dot -->
          <div class="absolute left-0 md:left-[133px] w-4 h-4 rounded-full bg-white border-2 border-gray-400 group-hover:bg-gray-900 group-hover:scale-125 transition-all mt-1"></div>

          <!-- Time -->
          <div class="hidden md:block w-[120px] text-right shrink-0">
            <span class="text-sm font-mono text-amber-600">{{ item.time }}</span>
          </div>

          <!-- Content -->
          <div class="ml-8 md:ml-6 glass-card p-6 flex-1 group-hover:-translate-y-1 transition-transform">
            <span class="md:hidden text-xs font-mono text-amber-600">{{ item.time }}</span>
            <h3 class="font-bold text-gray-900 text-lg">{{ item.title }}</h3>
            <p v-if="item.desc" class="text-text-secondary text-sm mt-1">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
