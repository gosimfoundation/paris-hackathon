<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const frameworks = [
  'MCP', 'A2A', 'ACP', 'OpenClaw', 'LangGraph', 'CrewAI',
  'AutoGen', 'dora-rs', 'vLLM', 'SGLang', 'CopilotKit', 'Nexent',
]
</script>

<template>
  <section class="relative py-32 bg-bg-primary overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-8 reveal">
        <h2 class="text-4xl md:text-5xl heading-serif">
          {{ t('tech.title') }} <span class="heading-serif accent-text">{{ t('tech.titleAccent') }}</span>
        </h2>
      </div>

      <div class="max-w-3xl mx-auto text-center mb-16 reveal reveal-delay-1">
        <p class="text-text-secondary leading-relaxed">
          {{ t('tech.desc_prefix') }}<span class="text-gray-900 font-semibold">{{ t('tech.desc_bold') }}</span>{{ t('tech.desc_suffix') }}
        </p>
      </div>

      <!-- Sponsors -->
      <h3 class="text-center text-sm text-text-secondary uppercase tracking-wider mb-6 reveal reveal-delay-2">{{ t('sponsors.title') }}</h3>
      <div class="grid md:grid-cols-3 gap-8 mb-16 max-w-3xl mx-auto reveal reveal-delay-2">
        <a href="https://z.ai/" target="_blank" class="glass-card glass-card-glow glow-border p-8 flex items-center justify-center transition-all group block h-28">
          <img src="/sponsors/zhipu-wide.webp" alt="Zhipu AI" class="h-14 w-auto max-w-[240px] object-contain" />
        </a>
        <a href="https://www.minimaxi.com" target="_blank" class="glass-card glass-card-glow glow-border p-8 flex items-center justify-center transition-all group block h-28">
          <img src="/sponsors/minimax-logo.webp" alt="MiniMax" class="h-8 w-auto max-w-[180px] object-contain" />
        </a>
        <a href="https://www.kimi.com" target="_blank" class="glass-card glass-card-glow glow-border p-8 flex items-center justify-center transition-all group block h-28">
          <img src="/sponsors/kimi-wide.webp" alt="Moonshot AI" class="h-8 w-auto max-w-[180px] object-contain" />
        </a>
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
