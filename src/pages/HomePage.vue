<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useCardGlow } from '../composables/useCardGlow'
import HeroSection from '../components/sections/HeroSection.vue'
import AboutSection from '../components/sections/AboutSection.vue'
import VenueSection from '../components/sections/VenueSection.vue'
import TracksSection from '../components/sections/TracksSection.vue'
import TechSection from '../components/sections/TechSection.vue'
import PrizesSection from '../components/sections/PrizesSection.vue'
import ScheduleSection from '../components/sections/ScheduleSection.vue'
import JudgingSection from '../components/sections/JudgingSection.vue'
import TeamsSection from '../components/sections/TeamsSection.vue'
import FaqSection from '../components/sections/FaqSection.vue'
import CtaSection from '../components/sections/CtaSection.vue'

useScrollReveal()
useCardGlow()

const showSafariBanner = ref(false)
const copied = ref(false)

onMounted(() => {
  const ua = navigator.userAgent
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)
  if (isSafari) showSafariBanner.value = true
})

function copyUrlForChrome() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  })
}
</script>

<template>
  <!-- Safari banner -->
  <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 -translate-y-full" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0 -translate-y-full">
    <div v-if="showSafariBanner" class="fixed top-0 left-0 right-0 z-[200] bg-amber-50 border-b border-amber-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-amber-800">
      <span>Some animations may not display correctly in Safari. For the full experience, please open in <strong>Chrome</strong> or <strong>Firefox</strong>.</span>
      <div class="flex gap-2">
        <button @click="copyUrlForChrome" class="px-3 py-1 rounded bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors">
          {{ copied ? 'Copied!' : 'Copy URL' }}
        </button>
        <button @click="showSafariBanner = false" class="px-3 py-1 rounded border border-amber-300 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors">Dismiss</button>
      </div>
    </div>
  </Transition>
  <main>
    <HeroSection />
    <AboutSection />
    <VenueSection />
    <TracksSection />
    <TechSection />
    <PrizesSection />
    <TeamsSection />
    <ScheduleSection />
    <JudgingSection />
    <FaqSection />
    <CtaSection />
  </main>
</template>
