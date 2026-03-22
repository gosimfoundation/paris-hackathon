<script setup lang="ts">
import { useCountdown } from '../../composables/useCountdown'

const { days, hours, minutes, seconds } = useCountdown('2026-05-05T08:30:00+02:00')

const timeUnits = [
  { label: 'Days', value: days },
  { label: 'Hours', value: hours },
  { label: 'Minutes', value: minutes },
  { label: 'Seconds', value: seconds },
]
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Background Video -->
    <video
      autoplay
      muted
      loop
      playsinline
      class="absolute inset-0 w-full h-full object-cover"
    >
      <source src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4" type="video/mp4" />
    </video>

    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-bg-primary"></div>

    <!-- Animated gradient orbs -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-red/20 rounded-full blur-[120px] animate-float"></div>
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-blue/20 rounded-full blur-[100px] animate-float" style="animation-delay: -3s"></div>
    <div class="absolute top-1/2 right-1/3 w-64 h-64 bg-accent-cyan/15 rounded-full blur-[80px] animate-float" style="animation-delay: -5s"></div>

    <!-- Content -->
    <div class="relative z-10 text-center px-6 max-w-5xl mx-auto">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
        <span class="w-2 h-2 bg-accent-red rounded-full animate-glow-pulse"></span>
        <span class="text-sm text-text-secondary">Part of Agentic AI Summit Paris</span>
      </div>

      <!-- Title -->
      <h1 class="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4">
        <span class="text-white">GOSIM Paris 2026</span>
      </h1>
      <h2 class="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
        <span class="heading-serif accent-text">Agentic App Hackathon</span>
      </h2>

      <!-- Subtitle -->
      <p class="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-4">
        Build the Next Generation of Agentic Applications
      </p>

      <!-- Event info line -->
      <p class="text-sm text-text-secondary mb-12">
        May 5–6, 2026 &nbsp;|&nbsp; STATION F, Paris &nbsp;|&nbsp; 100 Participants &nbsp;|&nbsp; Teams of 1–3
      </p>

      <!-- Countdown -->
      <div class="flex justify-center gap-4 md:gap-6 mb-12">
        <div v-for="unit in timeUnits" :key="unit.label" class="flex flex-col items-center">
          <div class="glass-card w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
            <span class="text-2xl md:text-3xl font-bold font-mono text-white">
              {{ String(unit.value.value).padStart(2, '0') }}
            </span>
          </div>
          <span class="text-xs text-text-secondary mt-2 uppercase tracking-wider">{{ unit.label }}</span>
        </div>
      </div>

      <!-- CTA -->
      <div class="flex justify-center">
        <a
          href="#teams"
          class="px-8 py-4 bg-gradient-to-r from-accent-red to-accent-red-dark text-white font-bold text-lg rounded-full hover:shadow-xl hover:shadow-accent-red/30 transition-all hover:scale-105 active:scale-95"
        >
          Apply Now
        </a>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
      <svg class="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
      </svg>
    </div>
  </section>
</template>
