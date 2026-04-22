<script setup lang="ts">
import { ref } from 'vue'

const EB_URL = 'https://www.eventbrite.com/e/1984013840806/?discount=AGENTICHACKATHON26'
const show = ref(true)
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="show" class="fixed inset-0 z-[250] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/85 backdrop-blur-sm" />
        <div class="relative w-full max-w-md bg-bg-primary border border-accent-yellow/50 shadow-2xl p-6">
          <button @click="show = false" class="absolute top-3 right-3 text-text-muted hover:text-text-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div class="text-center mb-5">
            <div class="inline-block px-3 py-1 bg-accent-red/20 text-red-400 text-[10px] font-bold tracking-widest uppercase rounded mb-3">Required for entry</div>
            <h2 class="text-xl font-bold text-text-primary mb-2">Register on Eventbrite</h2>
            <p class="text-sm text-text-secondary leading-relaxed">
              You also need a <strong class="text-text-primary">free Eventbrite ticket</strong> to enter STATION F on event day. Our discount code is already applied.
            </p>
          </div>

          <p class="text-xs text-red-400/80 text-center mb-4">Without this ticket, venue security won't let you in.</p>

          <a :href="EB_URL" target="_blank" rel="noopener"
            class="block w-full py-3 bg-btn-bg text-btn-text text-sm font-bold uppercase tracking-widest text-center hover:bg-btn-hover transition-colors">
            Get Free Ticket
          </a>

          <button @click="show = false" class="block w-full mt-2 py-2 text-xs text-text-muted hover:text-text-secondary text-center uppercase tracking-widest">
            I already have a ticket
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
