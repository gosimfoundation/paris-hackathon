import { onMounted, onUnmounted } from 'vue'

export function useCardGlow() {
  function handleMouseMove(e: MouseEvent) {
    const card = (e.target as HTMLElement).closest('.glass-card-glow')
    if (!card) return
    const rect = (card as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ;(card as HTMLElement).style.setProperty('--mouse-x', `${x}px`)
    ;(card as HTMLElement).style.setProperty('--mouse-y', `${y}px`)
  }

  onMounted(() => document.addEventListener('mousemove', handleMouseMove))
  onUnmounted(() => document.removeEventListener('mousemove', handleMouseMove))
}
