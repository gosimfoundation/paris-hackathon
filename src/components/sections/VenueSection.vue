<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <section class="relative py-24 bg-bg-primary overflow-hidden">
    <!-- Background: STATION F faded -->
    <div
      class="absolute inset-0 bg-cover bg-center opacity-10"
      style="background-image: url('/photos/gosim-stationf.jpg');"
    ></div>
    <div class="relative max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <!-- Left: text -->
        <div class="reveal">
          <span class="text-xs text-text-secondary uppercase tracking-[0.2em]">{{ t('venue.label') }}</span>
          <h2 class="text-4xl md:text-5xl font-black mt-4 mb-6">
            {{ t('venue.title') }}<br /><span class="heading-serif font-medium text-gray-600">{{ t('venue.subtitle') }}</span>
          </h2>
          <p class="text-text-secondary leading-relaxed mb-6">
            {{ t('venue.desc') }}
          </p>
          <div class="flex gap-8">
            <div>
              <div class="text-2xl font-black text-gray-900">1000+</div>
              <div class="text-xs text-text-secondary uppercase tracking-widest mt-1">{{ t('venue.startups') }}</div>
            </div>
            <div class="w-px bg-gray-200"></div>
            <div>
              <div class="text-2xl font-black text-gray-900">34 000</div>
              <div class="text-xs text-text-secondary uppercase tracking-widest mt-1">{{ t('venue.campus') }}</div>
            </div>
            <div class="w-px bg-gray-200"></div>
            <div>
              <div class="text-2xl font-black text-gray-900">13th</div>
              <div class="text-xs text-text-secondary uppercase tracking-widest mt-1">{{ t('venue.district') }}</div>
            </div>
          </div>
        </div>

        <!-- Right: photo -->
        <div class="reveal reveal-delay-2">
          <img
            src="/photos/gosim-stationf.jpg"
            alt="STATION F Paris"
            class="w-full h-80 object-cover"
          />
        </div>
      </div>

      <!-- GOSIM past events - scrolling photo wall -->
      <div class="mt-20">
        <div class="text-center mb-10 reveal">
          <span class="text-xs text-text-secondary uppercase tracking-[0.2em]">{{ t('venue.pastEvents') }}</span>
          <h3 class="text-2xl font-black mt-2">{{ t('venue.pastEventsTitle') }}</h3>
        </div>

        <!-- Row 1: scroll left -->
        <div class="relative overflow-hidden reveal">
          <div class="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg-primary to-transparent z-10"></div>
          <div class="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg-primary to-transparent z-10"></div>
          <div class="flex gap-4 animate-marquee" style="animation-duration: 65s;">
            <template v-for="n in 2" :key="n">
              <img src="/photos/gosim-event-1.jpg" alt="GOSIM" class="w-72 h-44 object-cover rounded-lg shrink-0" />
              <img src="/photos/gosim-event-4.jpg" alt="GOSIM" class="w-64 h-44 object-cover rounded-lg shrink-0" />
              <img src="/photos/gosim-event-2.jpg" alt="GOSIM" class="w-72 h-44 object-cover rounded-lg shrink-0" />
              <img src="/photos/gosim-event-3.jpg" alt="GOSIM" class="w-80 h-44 object-cover rounded-lg shrink-0" />
            </template>
          </div>
        </div>

        <!-- Row 2: scroll right (reverse) -->
        <div class="relative overflow-hidden mt-4 reveal reveal-delay-1">
          <div class="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg-primary to-transparent z-10"></div>
          <div class="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg-primary to-transparent z-10"></div>
          <div class="flex gap-4 animate-marquee-reverse" style="animation-duration: 70s;">
            <template v-for="n in 2" :key="n">
              <img src="/photos/gosim-event-9.jpg" alt="GOSIM" class="w-72 h-44 object-cover rounded-lg shrink-0" />
              <img src="/photos/gosim-event-5.jpg" alt="GOSIM" class="w-80 h-44 object-cover rounded-lg shrink-0" />
              <img src="/photos/gosim-event-6.jpg" alt="GOSIM" class="w-64 h-44 object-cover rounded-lg shrink-0" />
              <img src="/photos/gosim-stationf.jpg" alt="GOSIM" class="w-72 h-44 object-cover rounded-lg shrink-0" />
              <img src="/photos/gosim-event-4.jpg" alt="GOSIM" class="w-80 h-44 object-cover rounded-lg shrink-0" />
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
