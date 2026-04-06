<script setup lang="ts">
import { provideI18n } from './composables/useI18n'
import { provideAuth } from './composables/useAuth'
import { provideTheme } from './composables/useTheme'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import RulesPage from './pages/RulesPage.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

provideI18n()
provideAuth()
provideTheme()

const route = useRoute()
const currentPath = computed(() => {
  console.log('Route path:', route.path)
  return route.path
})
</script>

<template>
  <AppHeader />
  <RulesPage v-if="currentPath === '/rules'" />
  <router-view v-else />
  <AppFooter />
</template>
