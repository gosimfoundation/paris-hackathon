<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <section class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]"></div>

    <div class="relative max-w-3xl mx-auto px-6 text-center reveal">
      <h2 class="text-4xl md:text-5xl font-bold mb-6">
        <span class="heading-serif accent-text">{{ t('cta.title') }}</span>
      </h2>
      <p class="text-text-secondary text-lg mb-2 heading-serif" style="font-style: italic;">
        {{ t('cta.tagline') }}
      </p>
      <p class="text-text-secondary text-sm mb-10">
        {{ t('cta.location') }}
      </p>
      <a
        href="#teams"
        class="inline-block px-10 py-4 text-white text-sm font-semibold tracking-widest uppercase transition-all duration-300 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"
        style="background: linear-gradient(135deg, #111827, #2563eb);"
      >
        {{ t('nav.applyNow') }}
      </a>
    </div>
  </section>
</template>
