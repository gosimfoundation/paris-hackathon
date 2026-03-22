import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface TeamMember {
  name: string
  role: string
  githubId: string
}

export interface Team {
  id: string
  name: string
  track: string
  members: TeamMember[]
  models: string[]
  projectIdea: string
  githubRepo: string
  avatar: string
  createdAt: string
}

const API_URL = '/api/teams'

const teams = ref<Team[]>([])
const totalMembers = ref(0)
const maxParticipants = ref(100)
const loading = ref(false)
const error = ref('')

let pollTimer: number | undefined

export function useTeams() {
  const spotsLeft = computed(() => maxParticipants.value - totalMembers.value)
  const isFull = computed(() => spotsLeft.value <= 0)
  const progress = computed(() => (totalMembers.value / maxParticipants.value) * 100)

  const modelStats = computed(() => {
    const stats: Record<string, number> = { GLM: 0, MiniMax: 0, Kimi: 0 }
    teams.value.forEach((t) => {
      t.models?.forEach((m) => {
        if (m in stats) stats[m]++
      })
    })
    return stats
  })

  async function fetchTeams() {
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      teams.value = data.teams
      totalMembers.value = data.totalMembers
      maxParticipants.value = data.maxParticipants
    } catch {
      // silent fail on poll
    }
  }

  async function registerTeam(payload: {
    name: string
    contactEmail: string
    githubRepo: string
    track: string
    members: TeamMember[]
    models: string[]
    projectIdea: string
    avatar: string
  }) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Registration failed'
        return false
      }
      await fetchTeams()
      return true
    } catch {
      error.value = 'Network error, please try again'
      return false
    } finally {
      loading.value = false
    }
  }

  async function joinTeam(teamId: string, member: { name: string; role: string; email: string; githubId: string }) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`${API_URL}/${teamId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to join team'
        return false
      }
      await fetchTeams()
      return true
    } catch {
      error.value = 'Network error, please try again'
      return false
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchTeams()
    pollTimer = window.setInterval(fetchTeams, 30000)
  })

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
  })

  return {
    teams, totalMembers, maxParticipants, spotsLeft, isFull, progress,
    modelStats, loading, error, fetchTeams, registerTeam, joinTeam,
  }
}
