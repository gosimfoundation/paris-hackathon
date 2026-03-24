import { ref } from 'vue'

export const teamFilter = ref('')

export function setTeamFilter(label: string) {
  teamFilter.value = label
  const el = document.getElementById('teams')
  el?.scrollIntoView({ behavior: 'smooth' })
}
