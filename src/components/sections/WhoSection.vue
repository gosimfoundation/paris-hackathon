<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const participants = computed(() => t('who.participants') as any[])
</script>

<template>
  <section class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="max-w-5xl mx-auto px-6">
      <div class="text-center mb-6 reveal">
        <h2 class="text-4xl md:text-5xl font-bold">
          {{ t('who.title') }} <span class="heading-serif accent-text">{{ t('who.titleAccent') }}</span>
        </h2>
        <p class="text-text-secondary mt-4 text-lg max-w-2xl mx-auto">
          {{ t('who.desc_prefix') }}<span class="text-gray-900 font-semibold">{{ t('who.desc_bold') }}</span>{{ t('who.desc_suffix') }}
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 reveal">
        <div
          v-for="p in participants"
          :key="p.title"
          class="glass-card glass-card-glow p-6 text-center hover:scale-105 transition-all group"
        >
          <h3 class="font-bold text-gray-900 group-hover:text-accent transition-colors">{{ p.title }}</h3>
          <p class="text-text-secondary text-sm mt-1">{{ p.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
