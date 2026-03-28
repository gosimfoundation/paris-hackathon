<script setup lang="ts">
import { useScrollReveal } from '../composables/useScrollReveal'
import { useCardGlow } from '../composables/useCardGlow'
import { useVideoAutoplay } from '../composables/useVideoAutoplay'
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
useVideoAutoplay()
</script>

<template>
  <!-- Safari banner disabled -->
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
