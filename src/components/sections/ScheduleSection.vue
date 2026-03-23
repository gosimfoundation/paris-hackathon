<script setup lang="ts">
import { ref } from 'vue'

const activeDay = ref<1 | 2>(1)

const schedule = {
  1: [
    { time: '08:30–09:00', title: 'Check-in', desc: '' },
    { time: '09:30–10:10', title: 'GOSIM Keynote', desc: '' },
    { time: '10:30–11:00', title: 'Hackathon Opening', desc: 'Introduction, themes, judging criteria' },
    { time: '11:00–12:00', title: 'Setup Session', desc: 'Dev environment, API access, toolchain setup, challenge topics revealed' },
    { time: '12:00–13:00', title: 'Lunch + Team Formation', desc: '' },
    { time: '13:00–18:00', title: 'Hacking', desc: '' },
    { time: '18:00–18:30', title: 'Checkpoint', desc: '1-min team updates, mentor Q&A' },
  ],
  2: [
    { time: '08:30–09:30', title: 'Check-in', desc: '' },
    { time: '09:30–10:00', title: 'GOSIM Keynote', desc: '' },
    { time: '10:00–12:00', title: 'Hacking Sprint', desc: 'Final push + demo prep' },
    { time: '12:00–13:30', title: 'Demo & Presentations', desc: '5 min demo + 3 min Q&A per team' },
    { time: '13:30–14:30', title: 'Judging', desc: '' },
    { time: 'Afternoon', title: 'Awards Ceremony', desc: 'At GOSIM closing session' },
    { time: '18:30–20:00', title: 'Dinner & Networking', desc: 'Winners, sponsors & judges' },
  ],
}
</script>

<template>
  <section id="schedule" class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="max-w-4xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <span class="text-accent text-sm font-semibold uppercase tracking-wider">Two Intense Days</span>
        <h2 class="text-4xl md:text-5xl font-bold mt-4">
          <span class="heading-serif accent-text">Schedule</span>
        </h2>
      </div>

      <!-- Day tabs -->
      <div class="flex justify-center gap-4 mb-12 reveal">
        <button
          v-for="day in ([1, 2] as const)"
          :key="day"
          @click="activeDay = day"
          class="px-8 py-3 text-sm font-semibold tracking-wider uppercase transition-all border"
          :class="activeDay === day
            ? 'bg-accent border-accent text-gray-900'
            : 'border-gray-200 bg-transparent text-text-secondary hover:text-gray-900 hover:border-gray-300'"
        >
          Day {{ day }} — May {{ day + 4 }} ({{ day === 1 ? 'Tuesday' : 'Wednesday' }})
        </button>
      </div>

      <!-- Timeline -->
      <div class="relative">
        <!-- Vertical line -->
        <div class="absolute left-[7px] md:left-[140px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500"></div>

        <div
          v-for="(item, i) in schedule[activeDay]"
          :key="`${activeDay}-${i}`"
          class="relative flex gap-6 md:gap-8 mb-8 group"
        >
          <!-- Dot -->
          <div class="absolute left-0 md:left-[133px] w-4 h-4 rounded-full bg-white border-2 border-gray-900-red group-hover:bg-gray-900 group-hover:scale-125 transition-all mt-1"></div>

          <!-- Time -->
          <div class="hidden md:block w-[120px] text-right shrink-0">
            <span class="text-sm font-mono text-amber-600">{{ item.time }}</span>
          </div>

          <!-- Content -->
          <div class="ml-8 md:ml-6 glass-card p-6 flex-1 group-hover:-translate-y-1 transition-transform">
            <span class="md:hidden text-xs font-mono text-amber-600">{{ item.time }}</span>
            <h3 class="font-bold text-gray-900 text-lg">{{ item.title }}</h3>
            <p v-if="item.desc" class="text-text-secondary text-sm mt-1">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
