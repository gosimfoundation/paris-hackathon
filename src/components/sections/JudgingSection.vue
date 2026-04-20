<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const animated = ref(false)
const activeIndex = ref(-1)

const pieColors = ['#4CAF50', '#3BA7D0', '#E8D44D', '#a855f7', '#f59e0b']

const criteria = computed(() =>
  (t('judging.criteria') as any[]).map((c: any, i: number) => ({
    ...c,
    color: pieColors[i],
  }))
)

// Donut chart using stroke-dasharray on circles
// Each segment is a circle with a thick stroke, showing only 1/5 of circumference
const radius = 110
const strokeWidth = 50
const circumference = 2 * Math.PI * radius
const segmentLength = circumference / 5
const gapLength = 6 // parallel gap in px
const dashLength = segmentLength - gapLength

function segmentStyle(index: number, isActive: boolean) {
  const offset = -index * segmentLength + circumference * 0.25 // rotate so first starts at top
  return {
    strokeDasharray: `${dashLength} ${circumference - dashLength}`,
    strokeDashoffset: offset,
    strokeWidth: isActive ? strokeWidth + 10 : strokeWidth,
    transition: 'stroke-dashoffset 0s, stroke-width 0.3s ease, opacity 0.5s ease',
    transitionDelay: animated.value ? `${index * 120}ms` : '0ms',
  }
}

// Label position: midpoint of each arc segment
function labelPos(index: number) {
  const midAngle = ((index * 72 + 36) - 90) * (Math.PI / 180)
  return {
    x: 160 + radius * Math.cos(midAngle),
    y: 160 + radius * Math.sin(midAngle),
  }
}

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
    <div class="max-w-5xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <h2 class="text-4xl md:text-5xl mt-4">
          {{ t('judging.title') }} <span class="heading-serif accent-text">{{ t('judging.titleAccent') }}</span>
        </h2>
        <p class="text-text-secondary mt-4">{{ t('judging.desc') }}</p>
      </div>

      <div class="flex flex-col md:flex-row items-center gap-12 md:gap-16">
        <!-- Donut Chart -->
        <div class="relative shrink-0 transition-all duration-700" :style="{ opacity: animated ? 1 : 0, transform: animated ? 'scale(1)' : 'scale(0.8)' }">
          <svg width="320" height="320" viewBox="0 0 320 320">
            <circle
              v-for="(c, i) in criteria"
              :key="i"
              cx="160" cy="160"
              :r="radius"
              fill="none"
              :stroke="c.color"
              :style="segmentStyle(i, activeIndex === i)"
              :opacity="animated ? (activeIndex === -1 || activeIndex === i ? 1 : 0.35) : 0"
              class="cursor-pointer"
              @mouseenter="activeIndex = i"
              @mouseleave="activeIndex = -1"
              @click="activeIndex = activeIndex === i ? -1 : i"
            />
            <!-- 20% labels -->
            <text
              v-for="(_c, i) in criteria"
              :key="'lbl-' + i"
              :x="labelPos(i).x"
              :y="labelPos(i).y"
              text-anchor="middle"
              dominant-baseline="central"
              class="text-[11px] font-bold fill-white pointer-events-none select-none"
              :opacity="animated ? 1 : 0"
              :style="{ transition: 'opacity 0.5s', transitionDelay: `${i * 120 + 300}ms` }"
            >20%</text>
            <!-- Center text -->
            <text x="160" y="155" text-anchor="middle" dominant-baseline="central" class="text-xs font-semibold" style="fill: var(--color-text-secondary, #888)">5</text>
            <text x="160" y="172" text-anchor="middle" dominant-baseline="central" class="text-[9px]" style="fill: var(--color-text-muted, #555)">DIMENSIONS</text>
          </svg>
        </div>

        <!-- Legend / Details -->
        <div class="flex-1 space-y-0">
          <div
            v-for="(c, i) in criteria"
            :key="i"
            class="group py-4 border-b border-border-subtle cursor-pointer transition-all duration-500"
            :class="[
              activeIndex === i ? 'pl-3' : 'pl-0'
            ]"
            :style="{ opacity: animated ? undefined : '0', transform: animated ? 'none' : 'translateY(20px)', transitionDelay: `${i * 100}ms` }"
            @mouseenter="activeIndex = i"
            @mouseleave="activeIndex = -1"
          >
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full shrink-0 transition-transform duration-200" :class="activeIndex === i ? 'scale-125' : ''" :style="{ backgroundColor: c.color }"></span>
              <h3 class="font-bold text-text-primary">{{ c.name }}</h3>
              <span class="text-sm font-mono text-text-secondary ml-auto">20%</span>
            </div>
            <p class="text-text-secondary text-sm mt-1 ml-6">{{ c.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
