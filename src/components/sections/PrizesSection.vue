<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import { assetUrl } from '../../composables/api'

const { t } = useI18n()

const upstreamLogo = '/sponsors/gosim.png'

const gold = '#D4A017'

const sponsorAwards = [
  { key: 'minimax', color: gold, img: assetUrl('/sponsors/minimax.png') },
  { key: 'moonshot', color: gold, img: assetUrl('/sponsors/kimi.png') },
  { key: 'zhipu', color: gold, img: assetUrl('/sponsors/zhipu-v2.png') },
]

const upstreamAwards = [
  { key: 'upstream', color: gold, img: upstreamLogo },
  { key: 'upstream2', color: gold, img: upstreamLogo },
]
</script>

<template>
  <section id="awards" class="relative py-32 bg-bg-primary overflow-hidden">
    <div class="max-w-4xl mx-auto px-6">
      <div class="text-center mb-8 reveal">
        <h2 class="text-4xl md:text-5xl">
          <span class="heading-serif accent-text">{{ t('awards.title') }}</span>
        </h2>
      </div>

      <p class="text-center text-text-secondary mb-16 reveal">{{ t('awards.subtitle') }}</p>

      <!-- All 5 awards in one row -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-5xl mx-auto reveal-scale reveal-delay-1">
        <div v-for="award in [...sponsorAwards, ...upstreamAwards]" :key="award.key" class="flex flex-col items-center text-center">
          <div class="medal mb-4" :style="{ '--medal-color': award.color }">
            <div class="medal-ribbon"></div>
            <div class="medal-circle">
              <img :src="award.img" class="w-9 h-9 rounded-full object-cover" />
            </div>
          </div>
          <h3 class="heading-serif text-lg text-text-primary mb-1">{{ t(`awards.${award.key}`) }}</h3>
          <p v-if="t(`awards.${award.key}By`)" class="prize-amount animate-pulse-slow font-bold text-sm mt-1" :style="{ color: award.color }">{{ t(`awards.${award.key}By`) }}</p>
        </div>
      </div>

      <p class="text-center text-text-secondary text-sm mt-12 reveal">
        {{ t('awards.allParticipants') }} <span class="text-amber-600 font-semibold">{{ t('awards.apiCredits') }}</span> {{ t('awards.fromSponsors') }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.prize-amount {
  letter-spacing: 0.02em;
  text-shadow: 0 0 12px currentColor;
  animation: prize-breathe 2.5s ease-in-out infinite;
}

@keyframes prize-breathe {
  0%, 100% { opacity: 1; text-shadow: 0 0 8px currentColor; }
  50% { opacity: 0.7; text-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }
}
</style>
