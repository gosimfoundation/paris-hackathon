<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import { assetUrl } from '../../composables/api'

const { t } = useI18n()

const upstreamLogo = 'https://avatars.githubusercontent.com/u/238420183?s=200&v=4'

const awards = [
  { key: 'minicpm', color: '#4f46e5', img: assetUrl('/sponsors/minicpm-avatar.webp') },
  { key: 'zhipu', color: '#3b82f6', img: assetUrl('/sponsors/zhipu-v2.png') },
  { key: 'minimax', color: '#f43f5e', img: assetUrl('/sponsors/minimax.png') },
  { key: 'moonshot', color: '#a855f7', img: assetUrl('/sponsors/kimi.png') },
  { key: 'upstream', color: '#4CAF50', img: upstreamLogo },
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

      <!-- All awards in one row -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-10 max-w-5xl mx-auto mb-12 reveal-scale reveal-delay-1">
        <div v-for="award in awards" :key="award.key" class="flex flex-col items-center text-center">
          <div class="medal mb-4" :style="{ '--medal-color': award.color }">
            <div class="medal-ribbon"></div>
            <div class="medal-circle">
              <img :src="award.img" class="w-9 h-9 rounded-full object-cover" />
            </div>
          </div>
          <h3 class="heading-serif text-xl text-text-primary mb-1">{{ t(`awards.${award.key}`) }}</h3>
          <p class="text-text-secondary text-sm">{{ t(`awards.${award.key}By`) }}</p>
        </div>
      </div>

      <p class="text-center text-text-secondary text-sm mt-12 reveal">
        {{ t('awards.allParticipants') }} <span class="text-amber-600 font-semibold">{{ t('awards.apiCredits') }}</span> {{ t('awards.fromSponsors') }}
      </p>
    </div>
  </section>
</template>
