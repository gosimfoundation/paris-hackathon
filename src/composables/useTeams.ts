import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { User } from './useAuth'

export interface Team {
  id: string
  name: string
  leaderId: string
  avatar: string
  githubRepo: string
  themes: string[]
  model: string
  projectIdea: string
  locked: boolean
  maxSize: number
  likes: number
  members: User[]
  createdAt: string
}

const API_URL = '/api/teams'

const teams = ref<Team[]>([])
const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const lastUpdated = ref<Date | null>(null)

let pollTimer: number | undefined

function getToken() {
  return localStorage.getItem('auth_token')
}

function authHeaders(): Record<string, string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export function useTeams() {
  const totalMembers = computed(() => users.value.filter(u => u.teamId).length)
  const maxParticipants = ref(100)
  const spotsLeft = computed(() => maxParticipants.value - users.value.length)
  const isFull = computed(() => spotsLeft.value <= 0)
  const progress = computed(() => (users.value.length / maxParticipants.value) * 100)

  const modelStats = computed(() => {
    const stats: Record<string, number> = { GLM: 0, MiniMax: 0, Kimi: 0 }
    teams.value.forEach((t) => {
      if (t.model && t.model in stats) stats[t.model]++
    })
    return stats
  })

  async function fetchTeams() {
    try {
      const [teamsRes, usersRes] = await Promise.all([
        fetch(API_URL),
        fetch('/api/users'),
      ])
      if (teamsRes.ok) {
        const data = await teamsRes.json()
        teams.value = data.teams
      }
      if (usersRes.ok) {
        const data = await usersRes.json()
        users.value = data.users
      }
      lastUpdated.value = new Date()
    } catch {
      // silent
    }
  }

  async function createTeam(payload: {
    name: string
    avatar: string
    githubRepo: string
    themes: string[]
    model: string
    projectIdea: string
    locked: boolean
    maxSize: number
  }) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to create team'
        return false
      }
      await fetchTeams()
      return true
    } catch {
      error.value = 'Network error'
      return false
    } finally {
      loading.value = false
    }
  }

  async function editTeam(teamId: string, payload: Record<string, any>) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`${API_URL}/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to edit team'
        return false
      }
      await fetchTeams()
      return true
    } catch {
      error.value = 'Network error'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteTeam(teamId: string) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`${API_URL}/${teamId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) {
        const data = await res.json()
        error.value = data.error || 'Failed to delete team'
        return false
      }
      await fetchTeams()
      return true
    } catch {
      error.value = 'Network error'
      return false
    } finally {
      loading.value = false
    }
  }

  async function joinTeam(teamId: string) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`${API_URL}/${teamId}/join`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to join team'
        return false
      }
      await fetchTeams()
      return true
    } catch {
      error.value = 'Network error'
      return false
    } finally {
      loading.value = false
    }
  }

  async function leaveTeam(teamId: string) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`${API_URL}/${teamId}/leave`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to leave team'
        return false
      }
      await fetchTeams()
      return true
    } catch {
      error.value = 'Network error'
      return false
    } finally {
      loading.value = false
    }
  }

  async function likeTeam(teamId: string) {
    try {
      const res = await fetch(`${API_URL}/${teamId}/like`, { method: 'POST' })
      if (!res.ok) return false
      const data = await res.json()
      const team = teams.value.find(t => t.id === teamId)
      if (team) team.likes = data.likes ?? data.team?.likes ?? team.likes + 1
      return true
    } catch { return false }
  }

  onMounted(() => {
    fetchTeams()
    pollTimer = window.setInterval(fetchTeams, 30000)
  })

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
  })

  return {
    teams, users, totalMembers, maxParticipants, spotsLeft, isFull, progress,
    modelStats, loading, error, lastUpdated,
    fetchTeams, createTeam, editTeam, deleteTeam, joinTeam, leaveTeam, likeTeam,
  }
}
