<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <section id="sponsors" class="relative py-32 bg-bg-primary overflow-hidden">
    <div class="max-w-5xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <h2 class="text-4xl md:text-5xl font-bold">
          <span class="heading-serif accent-text">{{ t('sponsors.title') }}</span>
        </h2>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mb-12 reveal">
        <a href="https://z.ai/" target="_blank" class="glass-card glass-card-glow glow-border p-10 text-center transition-all group block">
          <img src="/sponsors/zhipu-v2.png" alt="Zhipu AI" class="w-14 h-14 mx-auto mb-4 object-cover rounded-xl" />
          <div class="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">Zhipu AI</div>
          <div class="text-sm text-gray-600 mt-1">GLM</div>
        </a>
        <a href="https://www.minimaxi.com" target="_blank" class="glass-card glass-card-glow glow-border p-10 text-center transition-all group block">
          <img src="/sponsors/minimax.png" alt="MiniMax" class="w-14 h-14 mx-auto mb-4 object-cover rounded-xl" />
          <div class="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">MiniMax</div>
          <div class="text-sm text-gray-600 mt-1">MiniMax</div>
        </a>
        <a href="https://www.kimi.com" target="_blank" class="glass-card glass-card-glow glow-border p-10 text-center transition-all group block">
          <img src="/sponsors/kimi.png" alt="Moonshot AI" class="w-14 h-14 mx-auto mb-4 object-cover rounded-xl" />
          <div class="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">Moonshot AI</div>
          <div class="text-sm text-gray-600 mt-1">Kimi</div>
        </a>
      </div>

      <div class="text-center reveal">
        <p class="text-gray-600 text-sm">
          {{ t('sponsors.contactPrefix') }}
          <a href="mailto:contact@gosim.org" class="text-gray-900 hover:text-gray-600 transition-colors font-semibold">{{ t('sponsors.contactLink') }}</a>
        </p>
      </div>
    </div>
  </section>
</template>
