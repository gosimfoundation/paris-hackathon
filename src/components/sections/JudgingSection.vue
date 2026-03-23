<script setup lang="ts">
import { ref, onMounted } from 'vue'

const animated = ref(false)

const criteria = [
  { name: 'Innovation', desc: 'Originality and novelty of the idea', color: 'bg-accent', icon: '01' },
  { name: 'Technical Depth', desc: 'Architecture, code quality, technical complexity', color: 'bg-accent-blue', icon: '02' },
  { name: 'Completeness', desc: 'Working demo, functional completeness', color: 'bg-accent-yellow', icon: '03' },
  { name: 'Practicality', desc: 'Real-world problem-solving potential', color: 'bg-blue-500', icon: '04' },
  { name: 'Presentation', desc: 'Clarity and persuasiveness of the demo', color: 'bg-accent', icon: '05' },
]

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) animated.value = true },
    { threshold: 0.3 }
  )
  const el = document.getElementById('judging')
  if (el) observer.observe(el)
})
</script>

<template>
  <section id="judging" class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="max-w-4xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <span class="text-accent-blue text-sm font-semibold uppercase tracking-wider">Equal Weight</span>
        <h2 class="text-4xl md:text-5xl font-bold mt-4">
          Judging <span class="heading-serif accent-text">Criteria</span>
        </h2>
        <p class="text-text-secondary mt-4">Each dimension counts for 20% of the total score.</p>
      </div>

      <div class="space-y-6">
        <div
          v-for="(c, i) in criteria"
          :key="c.name"
          class="glass-card p-6 flex items-center gap-6 reveal"
          :class="`reveal-delay-${i % 4 + 1}`"
        >
          <span class="text-2xl font-mono font-bold text-gray-300 shrink-0">{{ c.icon }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-gray-900">{{ c.name }}</h3>
              <span class="text-sm font-mono text-text-secondary">20%</span>
            </div>
            <div class="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-1000 ease-out"
                :class="c.color"
                :style="{ width: animated ? '100%' : '0%', transitionDelay: `${i * 200}ms` }"
              ></div>
            </div>
            <p class="text-text-secondary text-sm mt-2">{{ c.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
