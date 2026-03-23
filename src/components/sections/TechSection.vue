<script setup lang="ts">
const aiModels = [
  { name: 'GLM', by: 'Zhipu AI', icon: '/sponsors/zhipu.svg', url: 'https://z.ai' },
  { name: 'MiniMax', by: 'MiniMax', icon: '/sponsors/minimax.webp', url: 'https://www.minimaxi.com' },
  { name: 'Kimi', by: 'Moonshot AI', icon: '/sponsors/kimi.svg', url: 'https://www.kimi.com' },
]

const frameworks = [
  'MCP', 'A2A', 'ACP', 'OpenClaw', 'LangGraph', 'CrewAI',
  'AutoGen', 'dora-rs', 'vLLM', 'SGLang', 'CopilotKit', 'Nexent',
]
</script>

<template>
  <section class="relative py-32 bg-bg-primary overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <h2 class="text-4xl md:text-5xl font-bold">
          Technologies & <span class="heading-serif accent-text">Platforms</span>
        </h2>
      </div>

      <!-- AI Models -->
      <div class="mb-16 reveal">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <a :href="model.url" target="_blank" v-for="model in aiModels" :key="model.name" class="glass-card p-8 text-center hover:scale-105 transition-all group block">
            <img :src="model.icon" :alt="model.name" class="h-8 w-auto max-w-[120px] mx-auto mb-3 object-contain" />
            <div class="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">{{ model.name }}</div>
            <div class="text-gray-500 text-sm mt-1">{{ model.by }}</div>
          </a>
        </div>
      </div>

      <!-- Frameworks -->
      <div class="reveal">
        <h3 class="text-center text-sm text-text-secondary uppercase tracking-wider mb-8">Open-Source Frameworks & Tools</h3>
        <div class="relative overflow-hidden py-4">
          <div class="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-primary to-transparent z-10"></div>
          <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-primary to-transparent z-10"></div>
          <div class="flex gap-6 animate-marquee whitespace-nowrap">
            <template v-for="n in 2" :key="n">
              <span
                v-for="fw in frameworks"
                :key="`${n}-${fw}`"
                class="inline-flex px-6 py-3 glass-card text-sm font-mono text-text-secondary hover:text-gray-900 transition-colors shrink-0"
              >
                {{ fw }}
              </span>
            </template>
          </div>
        </div>
        <div class="relative overflow-hidden py-4 mt-2">
          <div class="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-primary to-transparent z-10"></div>
          <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-primary to-transparent z-10"></div>
          <div class="flex gap-6 animate-marquee-reverse whitespace-nowrap">
            <template v-for="n in 2" :key="n">
              <span
                v-for="fw in [...frameworks].reverse()"
                :key="`${n}-${fw}`"
                class="inline-flex px-6 py-3 glass-card text-sm font-mono text-text-secondary hover:text-gray-900 transition-colors shrink-0"
              >
                {{ fw }}
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
