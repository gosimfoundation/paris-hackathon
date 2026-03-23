<script setup lang="ts">
import { useScrollReveal } from './composables/useScrollReveal'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import HeroSection from './components/sections/HeroSection.vue'
import AboutSection from './components/sections/AboutSection.vue'
import VenueSection from './components/sections/VenueSection.vue'
import TracksSection from './components/sections/TracksSection.vue'
import TechSection from './components/sections/TechSection.vue'
import WhoSection from './components/sections/WhoSection.vue'
import PrizesSection from './components/sections/PrizesSection.vue'
import ScheduleSection from './components/sections/ScheduleSection.vue'
import JudgingSection from './components/sections/JudgingSection.vue'
import SponsorsSection from './components/sections/SponsorsSection.vue'
import TeamsSection from './components/sections/TeamsSection.vue'
import FaqSection from './components/sections/FaqSection.vue'
import CtaSection from './components/sections/CtaSection.vue'

useScrollReveal()
</script>

<template>
  <AppHeader />
  <main>
    <HeroSection />
    <AboutSection />
    <VenueSection />
    <TracksSection />
    <TechSection />
    <WhoSection />
    <PrizesSection />
    <ScheduleSection />
    <JudgingSection />
    <SponsorsSection />
    <TeamsSection />
    <FaqSection />
    <CtaSection />
  </main>
  <AppFooter />
</template>
