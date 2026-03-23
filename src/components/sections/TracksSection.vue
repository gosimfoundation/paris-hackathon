<script setup lang="ts">
const themes = [
  {
    number: '01',
    title: 'AI Hardware / IoT',
    description: 'Agentic AI interacting with physical devices.',
    tags: ['Smart devices', 'Robotics', 'Edge AI systems', 'Autonomous IoT assistants'],
  },
  {
    number: '02',
    title: 'AI for Education',
    description: 'Agentic systems that support learning and knowledge creation.',
    tags: ['AI learning companions', 'Research assistants', 'Personalized education agents', 'Collaborative learning tools'],
  },
  {
    number: '03',
    title: 'Human–Computer Interaction',
    description: 'New interfaces for interacting with intelligent systems.',
    tags: ['Multimodal agents', 'Voice interfaces', 'Spatial computing', 'AI-native user interfaces'],
  },
  {
    number: '04',
    title: 'Business Process Automation',
    description: 'Agentic systems that automate workflows and business operations.',
    tags: ['Enterprise workflow agents', 'Autonomous assistants', 'AI operations tools', 'Productivity systems'],
  },
  {
    number: '05',
    title: 'Information Retrieval & Knowledge Agents',
    description: 'Agents that search, synthesize and reason across information sources.',
    tags: ['Research agents', 'Knowledge copilots', 'Intelligent search systems', 'Multi-source reasoning agents'],
  },
]
</script>

<template>
  <section id="themes" class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-blue/5 rounded-full blur-[120px]"></div>

    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <h2 class="text-4xl md:text-5xl font-bold mt-4">
          <span class="heading-serif accent-text">Inspiration Themes</span>
        </h2>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(theme, i) in themes"
          :key="theme.number"
          class="glass-card p-8 group hover:-translate-y-2 transition-all duration-300 reveal"
          :class="`reveal-delay-${i % 4 + 1}`"
        >
          <span class="text-5xl font-black text-gray-100 group-hover:text-gray-200 transition-colors">{{ theme.number }}</span>

          <h3 class="text-xl font-bold text-gray-900 mb-2 mt-4 group-hover:text-accent transition-colors">
            {{ theme.title }}
          </h3>

          <p class="text-text-secondary text-sm mb-4">{{ theme.description }}</p>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in theme.tags"
              :key="tag"
              class="px-3 py-1 text-xs rounded-full border border-gray-200 text-text-secondary group-hover:border-accent/30 group-hover:text-gray-700 transition-all"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
