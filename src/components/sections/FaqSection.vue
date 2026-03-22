<script setup lang="ts">
import { ref } from 'vue'

const openIndex = ref<number | null>(null)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}

const faqs = [
  {
    q: 'Who can participate?',
    a: 'The hackathon is open to AI engineers, open-source contributors, startup founders, researchers, indie developers, students, and creators from around the world.',
  },
  {
    q: 'How big can teams be?',
    a: 'Teams of 1–3 people. You can come solo and find teammates during the lunch & team formation session on Day 1.',
  },
  {
    q: 'What do I need to submit?',
    a: 'A working demo, a GitHub repository, and a short slide deck. You\'ll have 5 minutes to present plus 3 minutes for Q&A.',
  },
  {
    q: 'Do I have to use a specific AI model?',
    a: 'You\'re encouraged to use the sponsor-provided models (GLM, MiniMax, Kimi) — all participants get free API credits. But you can also use other models or frameworks.',
  },
  {
    q: 'Is it free to participate?',
    a: 'Yes! Registration is free. Meals and refreshments are provided during the event.',
  },
  {
    q: 'What are the Spotlight Projects?',
    a: '5 outstanding projects (no ranking) will be selected. Winners receive round-trip flights and hotel accommodation to GOSIM Shenzhen in October 2026.',
  },
  {
    q: 'Where is the venue?',
    a: 'STATION F in Paris — the world\'s largest startup campus. Located at 5 Parvis Alan Turing, 75013 Paris.',
  },
]
</script>

<template>
  <section id="faq" class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="max-w-3xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <span class="text-accent-red text-sm font-semibold uppercase tracking-wider">Questions?</span>
        <h2 class="text-4xl md:text-5xl font-bold mt-4">
          <span class="heading-serif accent-text">FAQ</span>
        </h2>
      </div>

      <div class="space-y-3 reveal">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="glass-card overflow-hidden transition-all"
          :class="openIndex === i ? 'border-accent-red/30' : ''"
        >
          <button
            @click="toggle(i)"
            class="w-full flex items-center justify-between p-6 text-left"
          >
            <span class="font-semibold text-white pr-4">{{ faq.q }}</span>
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
