<script setup lang="ts">
const participants = [
  { title: 'AI Engineers', desc: 'Building intelligent systems' },
  { title: 'Open-Source Contributors', desc: 'Shaping the ecosystem' },
  { title: 'Startup Founders', desc: 'Turning ideas into products' },
  { title: 'Researchers', desc: 'Pushing the boundaries' },
  { title: 'Indie Developers', desc: 'Crafting independent solutions' },
  { title: 'Students & Creators', desc: 'Learning by building' },
]
</script>

<template>
  <section class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="max-w-5xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <h2 class="text-4xl md:text-5xl font-bold">
          Who Should <span class="heading-serif accent-text">Join</span>
        </h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-6 reveal">
        <div
          v-for="p in participants"
          :key="p.title"
          class="glass-card p-6 text-center hover:scale-105 transition-all group"
        >
          <h3 class="font-bold text-white group-hover:text-accent-red transition-colors">{{ p.title }}</h3>
          <p class="text-text-secondary text-sm mt-1">{{ p.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
