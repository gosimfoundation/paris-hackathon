import { ref, onMounted, onUnmounted } from 'vue'

export function useCountdown(targetDate: string) {
  const days = ref(0)
  const hours = ref(0)
  const minutes = ref(0)
  const seconds = ref(0)
  let timer: number

  function update() {
    const now = new Date().getTime()
    const target = new Date(targetDate).getTime()
    const diff = Math.max(0, target - now)

    days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
    hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
  }

  onMounted(() => {
    update()
    timer = window.setInterval(update, 1000)
  })

  onUnmounted(() => {
    clearInterval(timer)
  })

  return { days, hours, minutes, seconds }
}
