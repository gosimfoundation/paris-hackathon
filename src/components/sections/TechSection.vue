<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <section class="relative py-32 bg-bg-primary overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-8 reveal">
        <h2 class="text-4xl md:text-5xl heading-serif">
          {{ t('tech.title') }} <span class="heading-serif accent-text">{{ t('tech.titleAccent') }}</span>
        </h2>
      </div>

      <div class="max-w-3xl mx-auto text-center mb-16 reveal reveal-delay-1">
        <p class="text-text-secondary leading-relaxed">
          {{ t('tech.desc_prefix') }}<span class="text-text-primary font-semibold">{{ t('tech.desc_bold') }}</span>{{ t('tech.desc_suffix') }}
        </p>
      </div>

      <!-- Sponsors -->
      <h3 class="text-center text-sm text-text-secondary uppercase tracking-wider mb-6 reveal reveal-delay-2">{{ t('sponsors.title') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto reveal reveal-delay-2">
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

    </div>
  </section>
</template>
