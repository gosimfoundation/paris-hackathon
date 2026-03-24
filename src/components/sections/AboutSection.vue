<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <section id="about" class="relative py-32 bg-bg-primary overflow-hidden">
    <div class="max-w-4xl mx-auto px-6">
      <!-- Quote -->
      <div class="text-center mb-16 reveal">
        <blockquote class="heading-serif text-xl md:text-2xl text-gray-500 leading-relaxed">
          {{ t('about.quote') }}
        </blockquote>
        <p class="text-sm text-gray-400 mt-3">{{ t('about.quoteAuthor') }}</p>
      </div>

      <!-- Upstream philosophy -->
      <div class="reveal reveal-delay-1">
        <h2 class="text-4xl md:text-5xl font-bold text-center mb-10">
          <span class="heading-serif accent-text">{{ t('about.title') }}</span>
        </h2>

        <div class="grid md:grid-cols-[1fr_auto] gap-10 items-start">
        <div class="space-y-6 text-text-secondary text-base leading-relaxed">
          <p>
            {{ t('about.partOf') }} <a href="https://paris2026.gosim.org" target="_blank" class="text-gray-900 font-semibold hover:text-accent-blue transition-colors">{{ t('about.partOfEvent') }}</a>{{ t('about.partOfSuffix') }}
          </p>
          <p>
            {{ t('about.p1') }}
          </p>
          <p>
            {{ t('about.p2') }}
          </p>
          <p class="text-gray-900 font-medium text-lg">
            {{ t('about.p3') }}
          </p>
          <p>
            <span class="font-semibold text-gray-900">{{ t('about.p4_prefix') }}</span>{{ t('about.p4') }}<span class="font-semibold text-gray-900">{{ t('about.p4_bold') }}</span>{{ t('about.p4_suffix') }}
          </p>
        </div>

        <!-- Art video -->
        <div class="hidden md:block shrink-0 reveal reveal-delay-2">
          <video
            src="/photos/art-loop.mp4"
            autoplay loop muted playsinline
            class="w-48 lg:w-56 rounded-2xl shadow-lg"
          ></video>
        </div>
        </div>
      </div>

      <!-- Three missions -->
      <div class="grid md:grid-cols-3 gap-6 mt-16 reveal reveal-delay-2">
        <div class="glass-card glass-card-glow p-8 text-center">
          <div class="text-3xl mb-4 font-black gradient-number">01</div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">{{ t('about.mission1_title') }}</h3>
          <p class="text-text-secondary text-sm">{{ t('about.mission1_desc') }}</p>
        </div>
        <div class="glass-card glass-card-glow p-8 text-center">
          <div class="text-3xl mb-4 font-black gradient-number">02</div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">{{ t('about.mission2_title') }}</h3>
          <p class="text-text-secondary text-sm">{{ t('about.mission2_desc') }}</p>
        </div>
        <div class="glass-card glass-card-glow p-8 text-center">
          <div class="text-3xl mb-4 font-black gradient-number">03</div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">{{ t('about.mission3_title') }}</h3>
          <p class="text-text-secondary text-sm">{{ t('about.mission3_desc') }}</p>
        </div>
      </div>

      <p class="text-center text-gray-500 heading-serif text-lg mt-16 reveal reveal-delay-3" style="font-style: italic;">
        {{ t('about.closing') }}
      </p>
    </div>
  </section>
</template>
