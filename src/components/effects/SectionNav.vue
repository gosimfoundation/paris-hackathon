<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

const sections = computed(() => [
  { id: 'about', label: t('nav.about') },
  { id: 'themes', label: t('nav.themes') },
  { id: 'awards', label: t('nav.awards') },
  { id: 'teams', label: t('nav.teams') },
  { id: 'schedule', label: t('nav.schedule') },
  { id: 'judging', label: t('nav.judging') },
  { id: 'faq', label: t('nav.faq') },
])

const activeId = ref('')
let observer: IntersectionObserver | null = null

function setupObserver() {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible.length > 0) {
        activeId.value = visible[0].target.id
      }
    },
    { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.1, 0.5, 1] }
  )
  for (const s of sections.value) {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  }
}

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  // wait a tick for sections to mount
  setTimeout(setupObserver, 500)
})
onUnmounted(() => {
  if (observer) observer.disconnect()
})

// Only show on home page
const visible = computed(() => route.path === '/')
</script>

<template>
  <nav v-if="visible" class="section-nav" aria-label="Section navigation">
    <a
      v-for="s in sections"
      :key="s.id"
      :href="'#' + s.id"
      @click.prevent="scrollTo(s.id)"
      class="section-nav__item"
      :class="{ 'section-nav__item--active': activeId === s.id }"
      :aria-label="s.label"
    >
      <span class="section-nav__dot"></span>
      <span class="section-nav__tooltip">{{ s.label }}</span>
    </a>
  </nav>
</template>

<style scoped>
.section-nav {
  position: fixed;
  top: 50%;
  right: 1.25rem;
  transform: translateY(-50%);
  z-index: 45;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 0.75rem 0.4rem;
  pointer-events: auto;
}

.section-nav__item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
  text-decoration: none;
}

.section-nav__dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.section-nav__item:hover .section-nav__dot {
  background: rgba(212, 160, 23, 0.6);
  border-color: rgba(212, 160, 23, 0.9);
  transform: scale(1.3);
}

.section-nav__item--active .section-nav__dot {
  background: #d4a017;
  border-color: #d4a017;
  width: 10px;
  height: 10px;
  box-shadow: 0 0 12px rgba(212, 160, 23, 0.6);
}

.section-nav__tooltip {
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%) translateX(8px);
  padding: 0.3rem 0.7rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 160, 23, 0.3);
  color: white;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.section-nav__item:hover .section-nav__tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

@media (max-width: 768px) {
  .section-nav { display: none; }
}
</style>
