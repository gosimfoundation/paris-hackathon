<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <section id="sponsors" class="relative py-32 bg-bg-primary overflow-hidden">
    <div class="max-w-5xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <h2 class="text-4xl md:text-5xl">
          <span class="heading-serif accent-text">{{ t('sponsors.title') }}</span>
        </h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 reveal">
        <a href="https://github.com/OpenBMB/MiniCPM" target="_blank" class="glass-card glass-card-glow glow-border sponsor-logo-card p-8 flex items-center justify-center transition-all group block h-28">
          <img src="/sponsors/minicpm.svg" alt="MiniCPM" class="max-h-12 w-auto max-w-[180px] object-contain" />
        </a>
        <a href="https://z.ai/" target="_blank" class="glass-card glass-card-glow glow-border sponsor-logo-card p-8 flex items-center justify-center transition-all group block h-28">
          <img src="/sponsors/zhipu-wide.webp" alt="Zhipu AI" class="max-h-[4.5rem] w-auto max-w-[320px] object-contain" />
        </a>
        <a href="https://www.minimaxi.com" target="_blank" class="glass-card glass-card-glow glow-border sponsor-logo-card p-8 flex items-center justify-center transition-all group block h-28">
          <img src="/sponsors/minimax-wide.webp" alt="MiniMax" class="max-h-10 w-auto max-w-[180px] object-contain" />
        </a>
        <a href="https://www.kimi.com" target="_blank" class="glass-card glass-card-glow glow-border sponsor-logo-card p-8 flex items-center justify-center transition-all group block h-28">
          <img src="/sponsors/kimi-wide.webp" alt="Moonshot AI" class="max-h-10 w-auto max-w-[180px] object-contain" />
        </a>
      </div>

      <div class="text-center reveal">
        <p class="text-text-tertiary text-sm">
          {{ t('sponsors.contactPrefix') }}
          <a href="mailto:contact@gosim.org" class="text-text-primary hover:text-text-tertiary transition-colors font-semibold">{{ t('sponsors.contactLink') }}</a>
        </p>
      </div>
    </div>
  </section>
</template>
