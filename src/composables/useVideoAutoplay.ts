import { onMounted } from 'vue'

/**
 * Safari blocks autoplay even with muted+playsinline.
 * This forces .play() on all <video autoplay> elements,
 * retrying on user interaction if needed.
 */
export function useVideoAutoplay() {
  onMounted(() => {
    function playAll() {
      document.querySelectorAll('video[autoplay]').forEach((v) => {
        const video = v as HTMLVideoElement
        if (video.paused) {
          video.play().catch(() => {})
        }
      })
    }

    // Try immediately
    playAll()

    // Retry after a short delay (Safari sometimes needs the DOM to settle)
    setTimeout(playAll, 500)
    setTimeout(playAll, 2000)

    // Fallback: play on first user interaction
    const onInteract = () => {
      playAll()
      document.removeEventListener('click', onInteract)
      document.removeEventListener('touchstart', onInteract)
      document.removeEventListener('scroll', onInteract)
    }
    document.addEventListener('click', onInteract, { once: true })
    document.addEventListener('touchstart', onInteract, { once: true })
    document.addEventListener('scroll', onInteract, { once: true })
  })
}
