import { ref, watch, type Ref } from 'vue'

/**
 * Tween a number toward its target over ~1s easing out.
 * Returns a display ref to bind in template.
 */
export function useCountUp(source: Ref<number>, duration = 1000) {
  const display = ref(0)
  let raf = 0
  let startVal = 0
  let startTime = 0
  let target = 0

  function animate(now: number) {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    display.value = Math.round(startVal + (target - startVal) * eased)
    if (t < 1) raf = requestAnimationFrame(animate)
  }

  watch(source, (v) => {
    if (v === display.value) return
    cancelAnimationFrame(raf)
    startVal = display.value
    target = v
    startTime = performance.now()
    raf = requestAnimationFrame(animate)
  }, { immediate: true })

  return display
}
