<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const openIndex = ref<number | null>(null)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}

const faqs = computed(() => t('faq.items') as any[])
</script>

<template>
  <section id="faq" class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="max-w-3xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <span class="text-accent text-sm font-semibold uppercase tracking-wider">{{ t('faq.eyebrow') }}</span>
        <h2 class="text-4xl md:text-5xl mt-4">
          <span class="heading-serif accent-text">{{ t('faq.title') }}</span>
        </h2>
      </div>

      <div class="space-y-3 reveal">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="glass-card overflow-hidden transition-all"
          :class="openIndex === i ? 'border-accent/30' : ''"
        >
          <button
            @click="toggle(i)"
            class="w-full flex items-center justify-between p-6 text-left"
          >
            <span class="font-semibold text-gray-900 pr-4">{{ faq.q }}</span>
            <svg
              class="w-5 h-5 text-text-secondary shrink-0 transition-transform duration-300"
              :class="openIndex === i ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div
            class="grid transition-all duration-300"
            :class="openIndex === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
          >
            <div class="overflow-hidden">
              <p class="px-6 pb-6 text-text-secondary leading-relaxed">{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
