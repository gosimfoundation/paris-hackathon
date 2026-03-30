import { onMounted, onUnmounted } from 'vue'

export function useScrollReveal() {
  let observer: IntersectionObserver
  let rafId: number

  function updateParallax() {
    document.querySelectorAll('.parallax-bg').forEach((el) => {
      const rect = (el as HTMLElement).getBoundingClientRect()
      const offset = (rect.top + rect.height / 2) / window.innerHeight
      ;(el as HTMLElement).style.setProperty('--parallax-y', `${(offset - 0.5) * -40}px`)
    })
    rafId = requestAnimationFrame(updateParallax)
  }

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-blur, .reveal-scale').forEach((el) => {
      observer.observe(el)
    })

    // Start parallax
    rafId = requestAnimationFrame(updateParallax)
  })

  onUnmounted(() => {
    observer?.disconnect()
    cancelAnimationFrame(rafId)
  })
}
