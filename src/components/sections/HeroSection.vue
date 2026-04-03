<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCountdown } from '../../composables/useCountdown'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
const { days, hours, minutes, seconds, isLive, isOver } = useCountdown('2026-05-05T08:30:00+02:00', '2026-05-06T20:00:00+02:00')

// Typewriter for subtitle (looping)
const subtitle = 'Agentic Hackathon'
const typedSubtitle = ref('')
const showCursor = ref(true)

onMounted(() => {
  let i = 0
  let isDeleting = false

  const typeLoop = () => {
    if (!isDeleting) {
      // Typing
      typedSubtitle.value = subtitle.slice(0, ++i)
      if (i > subtitle.length) {
        isDeleting = true
        setTimeout(typeLoop, 2000) // Pause at end
        return
      }
    } else {
      // Deleting
      typedSubtitle.value = subtitle.slice(0, --i)
      if (i === 0) {
        isDeleting = false
      }
    }
    setTimeout(typeLoop, isDeleting ? 50 : 80)
  }

  typeLoop()
})

const timeUnits = [
  { key: 'hero.days', value: days },
  { key: 'hero.hours', value: hours },
  { key: 'hero.mins', value: minutes },
  { key: 'hero.secs', value: seconds },
]

// Slow down hero background video
const heroBgVideo = ref<HTMLVideoElement | null>(null)
onMounted(() => {
  if (heroBgVideo.value) heroBgVideo.value.playbackRate = 0.5
})

// Magnetic button effect
const ctaRef = ref<HTMLElement | null>(null)
const ctaTransform = ref('')
function onCtaMouseMove(e: MouseEvent) {
  if (!ctaRef.value) return
  const rect = ctaRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  ctaTransform.value = `translate(${x * 0.3}px, ${y * 0.3}px)`
}
function onCtaMouseLeave() {
  ctaTransform.value = 'translate(0, 0)'
}

// Scroll indicator fade
const isScrolled = ref(false)
onMounted(() => {
  const onScroll = () => {
    isScrolled.value = window.scrollY > 100
    if (isScrolled.value) {
      document.body.classList.add('scrolled')
    } else {
      document.body.classList.remove('scrolled')
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary">
    <!-- Background video -->
    <div class="absolute inset-0">
      <video
        ref="heroBgVideo"
        autoplay loop muted playsinline webkit-playsinline
        preload="auto"
        poster="/photos/hero-bg-poster.jpg"
        class="w-full h-full object-cover opacity-30"
      ><source src="/photos/hero-bg.mp4" type="video/mp4" /></video>
    </div>

    <!-- Red-blue gradient overlay -->
    <div
      class="absolute inset-0 opacity-20 animate-gradient-shift"
      style="background: linear-gradient(-45deg, #dc2626, #991b1b, #1e3a8a, #2563eb, #dc2626); background-size: 400% 400%;"
    ></div>


    <!-- Content -->
    <div class="relative z-10 text-center px-6 max-w-6xl mx-auto pt-20">

      <!-- Eyebrow -->
      <div class="inline-flex items-center gap-3 mb-10">
        <div class="h-px w-12 bg-text-primary/30"></div>
        <span class="text-xs text-text-primary/70 font-light tracking-[0.2em] uppercase">{{ t('hero.eyebrow') }}</span>
        <div class="h-px w-12 bg-text-primary/30"></div>
      </div>

      <!-- Main title -->
      <div class="mb-6">
        <div class="shimmer-text text-6xl md:text-8xl lg:text-[10rem] pb-4" style="font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 400; line-height: 1.1;">GOSIM</div>
        <div class="heading-serif text-2xl md:text-4xl lg:text-5xl text-text-primary mt-4">{{ typedSubtitle }}<span v-if="showCursor" class="animate-pulse">|</span></div>
        <p class="text-sm md:text-base text-text-primary/60 font-light tracking-[0.15em] uppercase mt-4">{{ t('hero.organizer') }}</p>
      </div>

      <!-- Sponsor line -->
      <div class="mb-6">
        <p class="text-sm md:text-lg text-text-primary/80 font-light tracking-wide">
          Sponsored by Your Favorite Tokens from
          <span class="font-semibold text-text-primary">GLM</span>,
          <span class="font-semibold text-text-primary">Kimi</span>,
          <span class="font-semibold text-text-primary">MiniMax</span>
        </p>
        <div class="flex items-center justify-center gap-6 md:gap-14 mt-6 max-w-sm md:max-w-none mx-auto">
          <div class="flex items-center justify-center"><img src="/sponsors/zhipu-wide.webp" alt="Zhipu AI (GLM)" class="h-6 md:h-[4.75rem] w-auto object-contain brightness-0 invert opacity-90" /></div>
          <div class="flex items-center justify-center"><img src="/sponsors/kimi-wide.webp" alt="Moonshot AI (Kimi)" class="h-6 md:h-9 w-auto object-contain brightness-0 invert opacity-90" /></div>
          <div class="flex items-center justify-center"><img src="/sponsors/minimax-wide.webp" alt="MiniMax" class="h-6 md:h-9 w-auto object-contain brightness-0 invert opacity-90" /></div>
        </div>
      </div>

      <!-- Tagline (hidden for now) -->
      <!-- <p class="text-lg md:text-xl text-text-tertiary font-light tracking-wide mt-4 mb-2 heading-serif" style="font-style: italic;">
        {{ t('hero.tagline') }}
      </p> -->

      <!-- Divider line -->
      <div class="flex items-center justify-center gap-6 my-10">
        <div class="h-px flex-1 max-w-24 bg-text-primary/30"></div>
        <span class="text-xs text-text-primary tracking-[0.25em] uppercase">{{ t('hero.location') }}</span>
        <div class="h-px flex-1 max-w-24 bg-text-primary/30"></div>
      </div>

      <!-- LIVE indicator -->
      <div v-if="isLive" class="flex justify-center items-center gap-3 mb-12">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span class="text-lg font-bold text-red-600 uppercase tracking-widest">LIVE NOW</span>
      </div>

      <!-- Countdown with glass cards -->
      <div v-else-if="!isOver" class="flex justify-center gap-2 md:gap-4 mb-6">
        <div
          v-for="unit in timeUnits"
          :key="unit.key"
          class="flex flex-col items-center min-w-[64px] md:min-w-[80px] px-3 py-4 md:px-5 md:py-5 bg-bg-card/60 backdrop-blur-md border border-bg-card/40 shadow-sm countdown-card countdown-pulse"
        >
          <div class="relative overflow-hidden">
            <span class="text-4xl md:text-6xl font-black font-mono text-text-primary tabular-nums inline-block countdown-flip" :key="unit.value.value">
              {{ String(unit.value.value).padStart(2, '0') }}
            </span>
          </div>
          <span class="text-[10px] text-text-primary/60 mt-1 uppercase tracking-[0.15em]">{{ t(unit.key) }}</span>
        </div>
      </div>

      <!-- Event ended -->
      <div v-else class="mb-6">
        <span class="text-lg text-text-primary/60 uppercase tracking-widest font-semibold">Event Concluded</span>
      </div>

      <!-- CTA -->
      <a
        ref="ctaRef"
        href="#teams"
        @mousemove="onCtaMouseMove"
        @mouseleave="onCtaMouseLeave"
        class="inline-block px-10 py-4 text-white text-sm font-semibold tracking-widest uppercase hover:shadow-lg hover:shadow-blue-500/20"
        :style="{ background: 'linear-gradient(135deg, #2c3e6b, #16A085)', transform: ctaTransform || undefined, transition: 'transform 0.2s ease-out, box-shadow 0.3s' }"
      >
        {{ t('nav.applyNow') }}
      </a>

    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
      <div class="w-px h-12 bg-gradient-to-b from-text-muted to-transparent mx-auto"></div>
    </div>
  </section>
</template>
