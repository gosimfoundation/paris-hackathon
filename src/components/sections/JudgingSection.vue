<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const animated = ref(false)

const colors = ['bg-accent', 'bg-accent-blue', 'bg-accent-yellow', 'bg-blue-500', 'bg-accent']

const criteria = computed(() =>
  (t('judging.criteria') as any[]).map((c: any, i: number) => ({
    ...c,
    color: colors[i],
    icon: String(i + 1).padStart(2, '0'),
  }))
)

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
        <span class="text-accent-blue text-sm font-semibold uppercase tracking-wider">{{ t('judging.eyebrow') }}</span>
        <h2 class="text-4xl md:text-5xl mt-4">
          {{ t('judging.title') }} <span class="heading-serif accent-text">{{ t('judging.titleAccent') }}</span>
        </h2>
        <p class="text-text-secondary mt-4">{{ t('judging.desc') }}</p>
      </div>

      <div class="space-y-6">
        <div
          v-for="(c, i) in criteria"
          :key="i"
          class="glass-card p-6 flex items-center gap-6 reveal"
          :class="`reveal-delay-${i % 4 + 1}`"
        >
          <span class="text-2xl font-mono font-bold text-gray-500 shrink-0">{{ c.icon }}</span>
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
