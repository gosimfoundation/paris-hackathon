<script setup lang="ts">
const participants = [
  { title: 'AI Engineers', desc: 'Ready to push agentic systems beyond their limits' },
  { title: 'Open-Source Contributors', desc: 'Who shaped the tools we build with today' },
  { title: 'Startup Founders', desc: 'Betting that agents will change everything' },
  { title: 'Researchers', desc: 'Turning papers into working prototypes' },
  { title: 'Indie Developers', desc: 'Building in public, shipping fast' },
  { title: 'Students & Creators', desc: 'The next generation of agent builders' },
]
</script>

<template>
  <section class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="max-w-5xl mx-auto px-6">
      <div class="text-center mb-6 reveal">
        <h2 class="text-4xl md:text-5xl font-bold">
          Who Should <span class="heading-serif accent-text">Join</span>
        </h2>
        <p class="text-text-secondary mt-4 text-lg max-w-xl mx-auto">
          Whether you're shipping your first agent or your fiftieth — if you build, you belong here.
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 reveal">
        <div
          v-for="p in participants"
          :key="p.title"
          class="glass-card p-6 text-center hover:scale-105 transition-all group"
        >
          <h3 class="font-bold text-gray-900 group-hover:text-accent transition-colors">{{ p.title }}</h3>
          <p class="text-text-secondary text-sm mt-1">{{ p.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
