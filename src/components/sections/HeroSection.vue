<script setup lang="ts">
import { useCountdown } from '../../composables/useCountdown'

const { days, hours, minutes, seconds } = useCountdown('2026-05-05T08:30:00+02:00')

const timeUnits = [
  { label: 'Days', value: days },
  { label: 'Hours', value: hours },
  { label: 'Mins', value: minutes },
  { label: 'Secs', value: seconds },
]
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary">
    <!-- Background photo with strong light overlay -->
    <div
      class="absolute inset-0 bg-cover bg-center opacity-10"
      style="background-image: url('/photos/gosim-stationf.jpg')"
    ></div>

    <!-- Content -->
    <div class="relative z-10 text-center px-6 max-w-6xl mx-auto pt-20">

      <!-- Eyebrow -->
      <div class="inline-flex items-center gap-3 mb-10">
        <div class="h-px w-12 bg-gray-300"></div>
        <span class="text-xs text-gray-500 font-light tracking-[0.2em] uppercase">Agentic AI Summit Paris · May 2026</span>
        <div class="h-px w-12 bg-gray-300"></div>
      </div>

      <!-- Main title -->
      <h1 class="font-black leading-[0.9] mb-6 tracking-tight">
        <span class="block text-6xl md:text-8xl lg:text-[10rem] text-gray-900">GOSIM</span>
        <span class="block text-3xl md:text-5xl lg:text-7xl heading-serif font-medium text-gray-600 mt-2">Agentic App</span>
        <span class="block text-3xl md:text-5xl lg:text-7xl heading-serif font-medium text-gray-600">Hackathon</span>
      </h1>

      <!-- Divider line -->
      <div class="flex items-center justify-center gap-6 my-10">
        <div class="h-px flex-1 max-w-24 bg-gray-200"></div>
        <span class="text-xs text-gray-500 tracking-[0.25em] uppercase">May 5–6, 2026 · STATION F · Paris</span>
        <div class="h-px flex-1 max-w-24 bg-gray-200"></div>
      </div>

      <!-- Countdown -->
      <div class="flex justify-center gap-2 md:gap-6 mb-12">
        <div v-for="unit in timeUnits" :key="unit.label" class="flex flex-col items-center min-w-[64px]">
          <span class="text-4xl md:text-6xl font-black font-mono text-gray-900 tabular-nums">
            {{ String(unit.value.value).padStart(2, '0') }}
          </span>
          <span class="text-[10px] text-gray-400 mt-1 uppercase tracking-[0.15em]">{{ unit.label }}</span>
        </div>
      </div>

      <!-- CTA -->
      <a
        href="#teams"
        class="inline-block px-10 py-4 bg-gray-900 text-white text-sm font-semibold tracking-widest uppercase hover:bg-gray-700 transition-colors"
      >
        Apply Now
      </a>

      <!-- Stats row -->
      <div class="flex justify-center gap-12 mt-16 text-center">
        <div>
          <div class="text-3xl font-black text-gray-900">100</div>
          <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">Participants</div>
        </div>
        <div class="w-px bg-gray-200"></div>
        <div>
          <div class="text-3xl font-black text-gray-900">5</div>
          <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">Themes</div>
        </div>
        <div class="w-px bg-gray-200"></div>
        <div>
          <div class="text-3xl font-black text-gray-900">2</div>
          <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">Days</div>
        </div>
        <div class="w-px bg-gray-200"></div>
        <div>
          <div class="text-3xl font-black text-gray-900">3</div>
          <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">Sponsors</div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
      <div class="w-px h-12 bg-gradient-to-b from-gray-300 to-transparent mx-auto"></div>
    </div>
  </section>
</template>
