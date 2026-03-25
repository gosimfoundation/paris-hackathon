<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <section id="awards" class="relative py-32 bg-bg-primary particles overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <h2 class="text-4xl md:text-5xl">
          <span class="heading-serif accent-text">{{ t('awards.title') }}</span>
        </h2>
      </div>

      <!-- Main prize -->
      <div class="max-w-3xl mx-auto mb-12 reveal">
        <div class="relative gradient-border prize-pulse p-10 text-center overflow-hidden group hover:scale-[1.02] transition-transform">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-amber-600/8 animate-glow-pulse"></div>
          <div class="relative">
            <div class="text-sm text-amber-600 uppercase tracking-wider mb-4 font-semibold">{{ t('awards.mainLabel') }}</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ t('awards.mainTitle') }}</h3>
            <p class="text-text-secondary mb-6">{{ t('awards.mainDesc') }}</p>
          </div>
        </div>
      </div>

      <!-- Sponsor prizes -->
      <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto reveal reveal-delay-2">
        <div class="glass-card p-8 text-center hover:scale-105 transition-all group">
          <h3 class="font-bold text-gray-900 text-lg mb-1">{{ t('awards.zhipu') }}</h3>
          <p class="text-text-secondary text-sm">{{ t('awards.zhipuBy') }}</p>
          <div class="h-1 w-12 mx-auto mt-4 bg-accent rounded-full group-hover:w-20 transition-all"></div>
        </div>
        <div class="glass-card p-8 text-center hover:scale-105 transition-all group">
          <h3 class="font-bold text-gray-900 text-lg mb-1">{{ t('awards.minimax') }}</h3>
          <p class="text-text-secondary text-sm">{{ t('awards.minimaxBy') }}</p>
          <div class="h-1 w-12 mx-auto mt-4 bg-accent-blue rounded-full group-hover:w-20 transition-all"></div>
        </div>
        <div class="glass-card p-8 text-center hover:scale-105 transition-all group">
          <h3 class="font-bold text-gray-900 text-lg mb-1">{{ t('awards.moonshot') }}</h3>
          <p class="text-text-secondary text-sm">{{ t('awards.moonshotBy') }}</p>
          <div class="h-1 w-12 mx-auto mt-4 bg-blue-500 rounded-full group-hover:w-20 transition-all"></div>
        </div>
      </div>

      <p class="text-center text-text-secondary text-sm mt-12 reveal">
        {{ t('awards.allParticipants') }} <span class="text-amber-600 font-semibold">{{ t('awards.apiCredits') }}</span> {{ t('awards.fromSponsors') }}
      </p>
    </div>
  </section>
</template>
