<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t, locale } = useI18n()

const aiModels = [
  { name: 'GLM', byEn: 'Zhipu AI', byZh: '智谱 AI', icon: '/sponsors/zhipu-v2.png', url: 'https://z.ai' },
  { name: 'MiniMax', byEn: 'MiniMax', byZh: 'MiniMax', icon: '/sponsors/minimax.png', url: 'https://www.minimaxi.com' },
  { name: 'Kimi', byEn: 'Moonshot AI', byZh: '月之暗面', icon: '/sponsors/kimi.png', url: 'https://www.kimi.com' },
]

const frameworks = [
  'MCP', 'A2A', 'ACP', 'OpenClaw', 'LangGraph', 'CrewAI',
  'AutoGen', 'dora-rs', 'vLLM', 'SGLang', 'CopilotKit', 'Nexent',
]
</script>

<template>
  <section class="relative py-32 bg-bg-primary overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-8 reveal">
        <h2 class="text-4xl md:text-5xl font-bold">
          {{ t('tech.title') }} <span class="heading-serif accent-text">{{ t('tech.titleAccent') }}</span>
        </h2>
      </div>

      <div class="max-w-3xl mx-auto text-center mb-16 reveal reveal-delay-1">
        <p class="text-text-secondary leading-relaxed">
          {{ t('tech.desc_prefix') }}<span class="text-gray-900 font-semibold">{{ t('tech.desc_bold') }}</span>{{ t('tech.desc_suffix') }}
        </p>
      </div>

      <!-- AI Models -->
      <div class="mb-16 reveal reveal-delay-2">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <a :href="model.url" target="_blank" v-for="model in aiModels" :key="model.name" class="glass-card glass-card-glow p-8 text-center hover:scale-105 transition-all group block">
            <img :src="model.icon" :alt="model.name" class="w-14 h-14 mx-auto mb-3 object-cover rounded-xl" />
            <div class="text-gray-600 text-sm mt-1">{{ locale === 'zh' ? model.byZh : model.byEn }}</div>
          </a>
        </div>
      </div>

      <!-- Frameworks -->
      <div class="reveal reveal-delay-3">
        <h3 class="text-center text-sm text-text-secondary uppercase tracking-wider mb-8">{{ t('tech.frameworks') }}</h3>
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
