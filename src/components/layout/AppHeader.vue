<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const mobileOpen = ref(false)

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Themes', href: '#themes' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'Awards', href: '#awards' },
  { label: 'Judging', href: '#judging' },
  { label: 'Teams', href: '#teams' },
  { label: 'FAQ', href: '#faq' },
]

function onScroll() {
  scrolled.value = window.scrollY > 50
}

function scrollTo(href: string) {
  mobileOpen.value = false
  const el = document.querySelector(href)
  el?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-bg-primary/95 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo — dark version for light bg -->
      <a href="#" class="flex items-center gap-3 group">
        <img src="/gosim-logo.svg" alt="GOSIM" class="h-7 w-auto" />
        <span class="text-xs text-gray-500 font-light tracking-widest uppercase">Hackathon</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8">
        <a
          v-for="item in navItems"
          :key="item.href"
          @click.prevent="scrollTo(item.href)"
          class="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gray-900 after:transition-all hover:after:w-full"
        >
          {{ item.label }}
        </a>
        <a
          href="#teams"
          class="px-5 py-2 bg-gray-900 text-white text-xs font-semibold tracking-widest uppercase hover:bg-gray-700 transition-colors"
        >
          Apply Now
        </a>
      </nav>

      <!-- Mobile Toggle -->
      <button @click="mobileOpen = !mobileOpen" class="md:hidden text-gray-700">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="mobileOpen" class="md:hidden bg-bg-primary border-t border-gray-200 px-6 py-4">
        <a
          v-for="item in navItems"
          :key="item.href"
          @click.prevent="scrollTo(item.href)"
          class="block py-3 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          {{ item.label }}
        </a>
        <a href="#teams" class="mt-4 block text-center px-5 py-3 bg-gray-900 text-white text-xs font-semibold tracking-widest uppercase hover:bg-gray-700 transition-colors">
          Apply Now
        </a>
      </div>
    </Transition>
  </header>
</template>
