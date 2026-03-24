<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <footer class="bg-bg-primary border-t border-gray-100 py-12">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="text-text-secondary text-sm">
          {{ t('footer.copyright') }}
        </div>
        <div class="flex gap-6">
          <a href="https://gosim.org" target="_blank" class="text-text-secondary hover:text-gray-900 transition-colors text-sm">
            {{ t('footer.mainSite') }}
          </a>
          <a href="#teams" class="text-text-secondary hover:text-accent transition-colors text-sm font-semibold">
            {{ t('footer.register') }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
