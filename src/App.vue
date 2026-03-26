<script setup lang="ts">
import { provideI18n } from './composables/useI18n'
import { provideAuth } from './composables/useAuth'
import { provideTheme } from './composables/useTheme'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

provideI18n()
provideAuth()
provideTheme()
</script>

<template>
  <AppHeader />
  <router-view />
  <AppFooter />
</template>
