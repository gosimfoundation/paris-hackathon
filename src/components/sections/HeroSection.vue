<script setup lang="ts">
import { useCountdown } from '../../composables/useCountdown'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
const { days, hours, minutes, seconds, isLive, isOver } = useCountdown('2026-05-05T08:30:00+02:00', '2026-05-06T20:00:00+02:00')

const timeUnits = [
  { key: 'hero.days', value: days },
  { key: 'hero.hours', value: hours },
  { key: 'hero.mins', value: minutes },
  { key: 'hero.secs', value: seconds },
]
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary">
    <!-- Animated gradient background -->
    <div
      class="absolute inset-0 opacity-8 animate-gradient-shift"
      style="background: linear-gradient(-45deg, #4CAF50, #C8D84C, #E8D44D, #7CC9A0, #3BA7D0); background-size: 400% 400%;"
    ></div>

    <!-- Grid pattern overlay -->
    <div
      class="absolute inset-0 opacity-[0.03]"
      style="background-image: linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px); background-size: 60px 60px;"
    ></div>

    <!-- Background video -->
    <div class="absolute inset-0">
      <video
        autoplay loop muted playsinline webkit-playsinline
        poster="/photos/hero-bg-poster.jpg"
        preload="auto"
        class="w-full h-full object-cover opacity-25"
      ><source src="/photos/hero-bg.mp4" type="video/mp4" /></video>
    </div>


    <!-- Content -->
    <div class="relative z-10 text-center px-6 max-w-6xl mx-auto pt-20">

      <!-- Eyebrow -->
      <div class="inline-flex items-center gap-3 mb-10">
        <div class="h-px w-12 bg-border-hover"></div>
        <span class="text-xs text-text-tertiary font-light tracking-[0.2em] uppercase">{{ t('hero.eyebrow') }}</span>
        <div class="h-px w-12 bg-border-hover"></div>
      </div>

      <!-- Main title -->
      <div class="mb-6">
        <div class="shimmer-text text-6xl md:text-8xl lg:text-[10rem] pb-4" style="font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 400; line-height: 1.1;">Upstream</div>
        <div class="heading-serif text-2xl md:text-4xl lg:text-5xl text-text-tertiary mt-4">Agentic Hackathon</div>
      </div>

      <!-- Tagline -->
      <p class="text-lg md:text-xl text-text-tertiary font-light tracking-wide mt-4 mb-2 heading-serif" style="font-style: italic;">
        {{ t('hero.tagline') }}
      </p>

      <!-- Divider line -->
      <div class="flex items-center justify-center gap-6 my-10">
        <div class="h-px flex-1 max-w-24 bg-border"></div>
        <span class="text-xs text-text-tertiary tracking-[0.25em] uppercase">{{ t('hero.location') }}</span>
        <div class="h-px flex-1 max-w-24 bg-border"></div>
      </div>

      <!-- LIVE indicator -->
      <div v-if="isLive" class="flex justify-center items-center gap-3 mb-12">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span class="text-lg font-bold text-red-600 uppercase tracking-widest">LIVE NOW</span>
      </div>

      <!-- Countdown with glass cards -->
      <div v-else-if="!isOver" class="flex justify-center gap-2 md:gap-4 mb-12">
        <div
          v-for="unit in timeUnits"
          :key="unit.key"
          class="flex flex-col items-center min-w-[64px] md:min-w-[80px] px-3 py-4 md:px-5 md:py-5 bg-bg-card/60 backdrop-blur-md border border-bg-card/40 shadow-sm countdown-card"
        >
          <span class="text-4xl md:text-6xl font-black font-mono text-text-primary tabular-nums inline-block countdown-num" :key="unit.value.value">
            {{ String(unit.value.value).padStart(2, '0') }}
          </span>
          <span class="text-[10px] text-text-tertiary mt-1 uppercase tracking-[0.15em]">{{ t(unit.key) }}</span>
        </div>
      </div>

      <!-- Event ended -->
      <div v-else class="mb-12">
        <span class="text-lg text-text-tertiary uppercase tracking-widest font-semibold">Event Concluded</span>
      </div>

      <!-- CTA -->
      <a
        href="#teams"
        class="inline-block px-10 py-4 text-white text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"
        style="background: linear-gradient(135deg, #2c3e6b, #16A085);"
      >
        {{ t('nav.applyNow') }}
      </a>

    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
      <div class="w-px h-12 bg-gradient-to-b from-text-muted to-transparent mx-auto"></div>
    </div>
  </section>
</template>
