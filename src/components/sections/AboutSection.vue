<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()



</script>

<template>
  <section id="about" class="relative py-32 bg-bg-primary overflow-hidden">
    <!-- Background video (parallax) -->
    <div class="absolute inset-0 hidden md:block pointer-events-none parallax-bg">
      <video
        autoplay loop muted playsinline webkit-playsinline
        preload="auto"
        poster="/photos/hero-video-poster.jpg"
        class="w-full h-full object-cover opacity-15"
      ><source src="/photos/hero-video-4k.mp4" type="video/mp4" /></video>
      <!-- Fade overlays -->
      <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg-primary to-transparent"></div>
      <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-primary to-transparent"></div>
      <div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg-primary to-transparent"></div>
      <div class="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg-primary to-transparent"></div>
    </div>

    <div class="relative max-w-4xl mx-auto px-6">
      <!-- Quote -->
      <div class="text-center mb-16 reveal-blur">
        <blockquote class="heading-serif text-xl md:text-2xl text-text-tertiary leading-relaxed">
          {{ t('about.quote') }}
        </blockquote>
        <p class="text-sm text-text-muted mt-3">{{ t('about.quoteAuthor') }}</p>
      </div>

      <!-- Upstream philosophy -->
      <div class="reveal reveal-delay-1">
        <h2 class="text-4xl md:text-5xl text-center mb-10">
          <span class="heading-serif accent-text">{{ t('about.title') }}</span>
        </h2>

        <div class="grid md:grid-cols-[1fr_auto] gap-10 items-start">
        <div class="space-y-6 text-text-secondary text-base leading-relaxed">
          <p>
            {{ t('about.partOf') }} <a href="https://paris2026.gosim.org" target="_blank" class="text-text-primary font-semibold hover:text-accent-blue transition-colors">{{ t('about.partOfEvent') }}</a>{{ t('about.partOfSuffix') }}
          </p>
          <p class="text-text-primary font-medium text-lg">
            {{ t('about.p1') }}
          </p>
          <p>
            {{ t('about.p2') }}
          </p>
        </div>

        <!-- Art video -->
        <div class="hidden md:block shrink-0 reveal-right reveal-delay-2">
          <video
            autoplay loop muted playsinline webkit-playsinline preload="auto"
            poster="/photos/art-loop-poster.jpg"
            class="w-48 lg:w-56 rounded-2xl shadow-lg"
          ><source src="/photos/art-loop.mp4" type="video/mp4" /></video>
        </div>
        </div>
      </div>

      <!-- Three missions -->
      <div class="grid md:grid-cols-3 gap-10 mt-20 reveal reveal-delay-2">
        <div class="relative pl-6 border-l-2 border-transparent" style="border-image: linear-gradient(to bottom, #4CAF50, transparent) 1;">
          <span class="text-6xl font-black gradient-number opacity-20 absolute -top-4 -left-1 select-none" style="line-height:1;">01</span>
          <h3 class="heading-serif text-xl text-text-primary mb-3 relative">{{ t('about.mission1_title') }}</h3>
          <p class="text-text-secondary text-sm leading-relaxed relative">{{ t('about.mission1_desc') }}</p>
        </div>
        <div class="relative pl-6 border-l-2 border-transparent" style="border-image: linear-gradient(to bottom, #3BA7D0, transparent) 1;">
          <span class="text-6xl font-black gradient-number opacity-20 absolute -top-4 -left-1 select-none" style="line-height:1;">02</span>
          <h3 class="heading-serif text-xl text-text-primary mb-3 relative">{{ t('about.mission2_title') }}</h3>
          <p class="text-text-secondary text-sm leading-relaxed relative">{{ t('about.mission2_desc') }}</p>
        </div>
        <div class="relative pl-6 border-l-2 border-transparent" style="border-image: linear-gradient(to bottom, #E8D44D, transparent) 1;">
          <span class="text-6xl font-black gradient-number opacity-20 absolute -top-4 -left-1 select-none" style="line-height:1;">03</span>
          <h3 class="heading-serif text-xl text-text-primary mb-3 relative">{{ t('about.mission3_title') }}</h3>
          <p class="text-text-secondary text-sm leading-relaxed relative">{{ t('about.mission3_desc') }}</p>
        </div>
      </div>

      <p class="text-center text-text-tertiary heading-serif text-lg mt-16 reveal reveal-delay-3" style="font-style: italic;">
        {{ t('about.closing') }}
      </p>
    </div>
  </section>
</template>
