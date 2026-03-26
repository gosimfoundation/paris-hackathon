<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTeams, type Team } from '../../composables/useTeams'
import { useAuth, type User } from '../../composables/useAuth'
import { useI18n } from '../../composables/useI18n'
import { teamFilter } from '../../composables/useTeamFilter'

const { t } = useI18n()
const { user, isLoggedIn, promptAuth } = useAuth()

const {
  teams, users, totalMembers, totalRegistered, spotsLeft, isFull, progress,
  modelStats, loading, error, lastUpdated,
  fetchTeams, createTeam, editTeam, deleteTeam, joinTeam, leaveTeam, likeTeam, approveJoin, rejectJoin
} = useTeams()

// Like tracking (localStorage)
const likedTeams = ref<Set<string>>(new Set(JSON.parse(localStorage.getItem('likedTeams') || '[]')))

async function handleLike(teamId: string, e: Event) {
  e.stopPropagation()
  if (likedTeams.value.has(teamId)) return
  const ok = await likeTeam(teamId)
  if (ok) {
    likedTeams.value.add(teamId)
    localStorage.setItem('likedTeams', JSON.stringify([...likedTeams.value]))
  }
}

// Theme filter (shared)
const filteredTeams = computed(() => {
  if (!teamFilter.value) return teams.value
  return teams.value.filter(team => (team.themes || []).some(th => th.includes(teamFilter.value)))
})

// Get members for a team from users array
function getTeamMembers(teamId: string): User[] {
  return users.value.filter(u => u.teamId === teamId)
}

// Hover detail
const hoveredTeam = ref<string | null>(null)

const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)
let toastTimer: number | undefined

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = { msg, type }
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => toast.value = null, 4000)
}

function timeAgo(date: Date | null) {
  if (!date) return ''
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 5) return 'just now'
  if (secs < 60) return `${secs}s ago`
  return `${Math.floor(secs / 60)}m ago`
}

const showModal = ref(false)
const modalMode = ref<'create' | 'view' | 'edit'>('create')
const viewingTeam = ref<Team | null>(null)
const teamLocked = ref(false)

const teamName = ref('')
const githubRepo = ref('')
const selectedTracks = ref<string[]>([])
const selectedModel = ref('')
const projectIdea = ref('')
const teamAvatar = ref('')
const maxSize = ref(3)

const tracks = [
  { id: 'agents-meet-apps', label: 'Agents Meet Apps', icon: assetUrl('/icons/theme-01.svg') },
  { id: 'claws-octos', label: 'Claws & Octos', icon: assetUrl('/icons/theme-02-v2.svg') },
  { id: 'hai', label: 'Human-Agent Interaction', icon: assetUrl('/icons/theme-03.svg') },
  { id: 'education', label: 'Education', icon: assetUrl('/icons/theme-04.svg') },
  { id: 'content-remix', label: 'Content Remixing', icon: assetUrl('/icons/theme-05.svg') },
  { id: 'productivity', label: 'Productivity', icon: assetUrl('/icons/theme-06.svg') },
  { id: 'agents-voices', label: 'Agents with Voices', icon: assetUrl('/icons/theme-07.svg') },
]

function toggleTrack(id: string) {
  const idx = selectedTracks.value.indexOf(id)
  if (idx >= 0) selectedTracks.value.splice(idx, 1)
  else selectedTracks.value.push(id)
}

function getTrackIcon(trackId: string) {
  return tracks.find(t => t.id === trackId || t.label === trackId)?.icon
}

function getTrackLabel(trackId: string) {
  return tracks.find(t => t.id === trackId || t.label === trackId)?.label || trackId
}

const modelOptions = [
  { id: 'GLM', label: 'GLM', icon: assetUrl('/sponsors/zhipu-v2.png') },
  { id: 'MiniMax', label: 'MiniMax', icon: assetUrl('/sponsors/minimax.png') },
  { id: 'Kimi', label: 'Kimi', icon: assetUrl('/sponsors/kimi.png') },
]

const avatarPresets = [
  { id: 'glm', label: 'GLM', src: assetUrl('/sponsors/zhipu-v2.png') },
  { id: 'minimax', label: 'MiniMax', src: assetUrl('/sponsors/minimax.png') },
  { id: 'kimi', label: 'Kimi', src: assetUrl('/sponsors/kimi.png') },
]

function selectModel(id: string) {
  selectedModel.value = selectedModel.value === id ? '' : id
}

function defaultAvatar(): string {
  return assetUrl('/default-avatar.svg')
}

import { API_BASE, assetUrl } from '../../composables/api'

async function uploadTeamAvatar(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const form = new FormData()
  form.append('avatar', file)
  try {
    const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: form })
    const data = await res.json()
    if (data.url) teamAvatar.value = `${API_BASE}${data.url}`
    else showToast(data.error || 'Upload failed', 'error')
  } catch { showToast('Upload failed', 'error') }
}

function resetForm() {
  teamName.value = ''
  githubRepo.value = ''
  selectedTracks.value = []
  selectedModel.value = ''
  projectIdea.value = ''
  teamAvatar.value = ''
  teamLocked.value = false
  maxSize.value = 3
  error.value = ''
}

function openCreateModal() {
  modalMode.value = 'create'
  resetForm()
  showModal.value = true
}

function openViewModal(team: Team) {
  modalMode.value = 'view'
  viewingTeam.value = team
  error.value = ''
  showModal.value = true
}

function openEditModal() {
  if (!viewingTeam.value) return
  const team = viewingTeam.value
  modalMode.value = 'edit'
  teamName.value = team.name
  githubRepo.value = team.githubRepo
  selectedTracks.value = [...(team.themes || [])]
  selectedModel.value = team.model || ''
  projectIdea.value = team.projectIdea || ''
  teamAvatar.value = team.avatar || ''
  teamLocked.value = team.locked
  maxSize.value = team.maxSize || 3
  error.value = ''
}

async function submitCreate() {
  if (!isLoggedIn.value) return
  const ok = await createTeam({
    name: teamName.value,
    avatar: teamAvatar.value || defaultAvatar(),
    githubRepo: githubRepo.value,
    themes: selectedTracks.value,
    model: selectedModel.value,
    projectIdea: projectIdea.value,
    locked: teamLocked.value,
    maxSize: maxSize.value,
  })
  if (ok) {
    showModal.value = false
    showToast(`Team "${teamName.value}" created! Good luck in Paris!`)
  }
}

async function submitEdit() {
  if (!viewingTeam.value) return
  const ok = await editTeam(viewingTeam.value.id, {
    name: teamName.value,
    avatar: teamAvatar.value || defaultAvatar(),
    githubRepo: githubRepo.value,
    themes: selectedTracks.value,
    model: selectedModel.value,
    projectIdea: projectIdea.value,
    locked: teamLocked.value,
    maxSize: maxSize.value,
  })
  if (ok) {
    showModal.value = false
    showToast(`Team "${teamName.value}" updated!`)
  }
}

async function handleJoinTeam(teamId: string, e?: Event) {
  if (e) e.stopPropagation()
  if (!isLoggedIn.value) return
  const team = teams.value.find(t => t.id === teamId)
  const ok = await joinTeam(teamId)
  if (ok) {
    showToast(`Request sent to "${team?.name || 'the team'}". Waiting for leader approval.`)
    if (viewingTeam.value?.id === teamId) {
      viewingTeam.value = teams.value.find(t => t.id === teamId) || null
    }
  }
}

function hasPendingRequest(team: Team) {
  return user.value && (team.pendingJoins || []).includes(user.value.id)
}

async function handleApprove(teamId: string, userId: string) {
  const ok = await approveJoin(teamId, userId)
  if (ok) {
    showToast('Member approved!')
    viewingTeam.value = teams.value.find(t => t.id === teamId) || null
  }
}

async function handleReject(teamId: string, userId: string) {
  const ok = await rejectJoin(teamId, userId)
  if (ok) {
    showToast('Request declined.')
    viewingTeam.value = teams.value.find(t => t.id === teamId) || null
  }
}

async function handleLeaveTeam() {
  if (!viewingTeam.value) return
  const name = viewingTeam.value.name
  const ok = await leaveTeam(viewingTeam.value.id)
  if (ok) {
    showModal.value = false
    showToast(`You've left "${name}".`)
  }
}

async function handleDeleteTeam() {
  if (!viewingTeam.value) return
  if (!confirm(`Delete team "${viewingTeam.value.name}"? This cannot be undone.`)) return
  const ok = await deleteTeam(viewingTeam.value.id)
  if (ok) {
    showModal.value = false
    showToast(`Team deleted.`)
  }
}

function getModelIcon(model: string) {
  return modelOptions.find((o) => o.id === model)?.icon
}

function canJoin(team: Team) {
  const members = getTeamMembers(team.id)
  return !team.locked && members.length < (team.maxSize || 3) && !isFull.value
}

function isTeamMember(team: Team): boolean {
  if (!user.value) return false
  return user.value.teamId === team.id
}

function isTeamLeader(team: Team): boolean {
  if (!user.value) return false
  return team.leaderId === user.value.id
}

function userHasTeam(): boolean {
  return !!user.value?.teamId
}

function teamVibe(count: number) {
  if (count === 1) return { label: 'Fly Solo', color: 'text-amber-600' }
  if (count === 2) return { label: 'Dynamic Duo', color: 'text-blue-600' }
  return { label: 'Three Musketeers', color: 'text-emerald-600' }
}

// function repoName(url: string) {
//   const m = url.match(/github\.com\/([^/]+\/[^/]+)/)
//   return m ? m[1] : url.replace(/https?:\/\//, '')
// }

const inputClass = 'w-full px-4 py-2.5 bg-input-bg border border-input-border text-text-primary placeholder-input-placeholder focus:border-accent/50 focus:outline-none transition-colors text-sm'
</script>

<template>
  <!-- Toast notification -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full text-sm font-semibold shadow-lg backdrop-blur-xl" :class="toast.type === 'success' ? 'bg-accent/90 text-white' : 'bg-red-600 text-white'">
        {{ toast.msg }}
      </div>
    </Transition>
  </Teleport>

  <section id="teams" class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-12 reveal">
        <h2 class="text-4xl md:text-5xl heading-serif">
          {{ t('teams.title') }} <span class="heading-serif accent-text">{{ t('teams.titleAccent') }}</span>
        </h2>
        <p class="text-text-secondary mt-3 text-base">{{ t('teams.subtitle') }}</p>
        <p class="text-amber-600 mt-2 text-sm font-semibold register-note-bounce">{{ t('teams.registerNote') }}</p>
        <p class="text-text-secondary mt-1 text-xs">{{ t('teams.registerWarn') }}</p>
        <div class="flex items-center justify-center gap-3 mt-3">
          <span class="text-xs text-text-secondary">Updated {{ timeAgo(lastUpdated) }}</span>
          <button @click="fetchTeams" class="text-xs text-blue-600 hover:text-text-primary transition-colors flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            {{ t('teams.refresh') }}
          </button>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="max-w-2xl mx-auto mb-12 reveal">
        <div class="flex justify-between text-sm mb-3">
          <span class="text-text-secondary">
            <span class="text-text-primary font-bold">{{ teams.length }}</span> {{ t('teams.teams') }} ·
            <span class="text-text-primary font-bold">{{ totalMembers }}</span> in teams ·
            <span class="text-text-primary font-bold">{{ totalRegistered }}</span> registered
          </span>
          <span class="text-text-secondary">
            <span class="text-amber-600 font-bold">{{ spotsLeft }}</span> {{ t('teams.spotsLeft') }}
          </span>
        </div>
        <div class="w-full h-1 bg-bg-elevated overflow-hidden">
          <div class="h-full bg-accent transition-all duration-1000" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="flex justify-center gap-6 mt-6">
          <div v-for="(count, model) in modelStats" :key="model" class="flex items-center gap-2">
            <img v-if="getModelIcon(model as string)" :src="getModelIcon(model as string)" class="h-5 w-auto max-w-[60px] object-contain rounded-[10px]" :title="(model as string)" />
            <span class="text-sm font-semibold text-text-primary">{{ count }}</span>
          </div>
        </div>
      </div>

      <div class="text-center mb-12 reveal">
        <template v-if="isLoggedIn">
          <button @click="openCreateModal" :disabled="isFull || userHasTeam()" class="px-8 py-4 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isFull ? t('teams.closedBtn') : userHasTeam() ? 'Already in a team' : t('teams.registerBtn') }}
          </button>
        </template>
        <template v-else>
          <button @click="promptAuth('register')" class="px-8 py-4 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors">
            {{ t('nav.applyNow') }}
          </button>
        </template>
      </div>

      <!-- Filter chips -->
      <div v-if="teamFilter" class="flex items-center gap-2 mb-6 reveal">
        <span class="text-sm text-text-secondary">Filtered by:</span>
        <button @click="teamFilter = ''" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          {{ getTrackLabel(teamFilter) }}
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Teams grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="team in filteredTeams"
          :key="team.id"
          @click="openViewModal(team)"
          @mouseenter="hoveredTeam = team.id"
          @mouseleave="hoveredTeam = null"
          class="team-card glass-card-glow p-6 transition-all group relative cursor-pointer flex flex-col"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3 min-w-0">
              <img :src="assetUrl(team.avatar) || assetUrl('/default-avatar.svg')" class="w-11 h-11 rounded-full shrink-0 object-cover border border-border" />
              <div class="min-w-0">
                <h3 class="font-bold text-text-primary text-base truncate group-hover:text-accent transition-colors">{{ team.name }}</h3>
                <div class="flex items-center gap-2 mt-0.5">
                  <template v-for="theme in (team.themes || []).slice(0, 3)" :key="theme">
                    <img v-if="getTrackIcon(theme)" :src="getTrackIcon(theme)" class="w-3.5 h-3.5 theme-icon" :title="getTrackLabel(theme)" />
                  </template>
                  <img v-if="team.model && getModelIcon(team.model)" :src="getModelIcon(team.model)" :alt="team.model" class="w-3.5 h-3.5 rounded-[10px]" />
                </div>
              </div>
            </div>
            <span class="text-xs font-mono text-text-muted shrink-0">{{ getTeamMembers(team.id).length }}/{{ team.maxSize || 3 }}</span>
          </div>

          <!-- Member slots grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            <div v-for="member in getTeamMembers(team.id)" :key="member.id" class="flex items-center gap-2 px-3 py-2 bg-bg-elevated/60 border border-border-subtle">
              <img :src="assetUrl(member.avatar) || assetUrl('/default-avatar.svg')" class="w-6 h-6 rounded-full shrink-0 object-cover" />
              <div class="min-w-0">
                <span v-if="member.id === team.leaderId" class="text-[9px] text-amber-600 block leading-tight">Lead</span>
                <span class="text-xs text-text-secondary truncate block">{{ member.name }}</span>
              </div>
            </div>
            <!-- Empty slots -->
            <div v-for="n in Math.max(0, (team.maxSize || 3) - getTeamMembers(team.id).length)" :key="'empty-' + n" class="flex items-center justify-center px-3 py-2 border border-dashed border-border-hover text-text-muted text-xs">
              Open
            </div>
          </div>

          <!-- Bottom -->
          <div class="mt-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
              <a v-if="team.githubRepo" :href="team.githubRepo" target="_blank" @click.stop class="inline-flex items-center gap-1 text-[11px] text-text-secondary hover:text-blue-600 transition-colors">
                <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                Repo
              </a>
              <span v-if="team.locked" class="text-[10px] text-text-muted inline-flex items-center gap-0.5">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                Locked
              </span>
            </div>
            <button
              @click="handleLike(team.id, $event)"
              class="inline-flex items-center gap-1 text-xs transition-colors"
              :class="likedTeams.has(team.id) ? 'text-red-500' : 'text-text-muted hover:text-red-400'"
            >
              <svg class="w-4 h-4" :fill="likedTeams.has(team.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
              {{ team.likes || 0 }}
            </button>
          </div>

          <!-- Project idea -->
          <p v-if="team.projectIdea" class="mt-3 pt-3 border-t border-border-subtle text-xs text-text-secondary leading-relaxed line-clamp-2 italic">"{{ team.projectIdea }}"</p>
        </div>
      </div>

      <div v-if="!teams.length" class="text-center py-16">
        <p class="text-text-secondary">{{ t('teams.noTeams') }}</p>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showModal = false"></div>

          <div class="relative w-full max-w-lg glass-card p-8 max-h-[90vh] overflow-y-auto border-accent-red/20">
            <button @click="showModal = false" class="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            <!-- CREATE MODE -->
            <template v-if="modalMode === 'create'">
              <h3 class="text-2xl font-bold text-text-primary mb-6">{{ t('teams.createTitle') }}</h3>

              <!-- Not logged in -->
              <div v-if="!isLoggedIn" class="text-center py-8">
                <p class="text-text-secondary mb-4">Register to create your team</p>
                <button @click="showModal = false; promptAuth('register')" class="px-6 py-3 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors">
                  Register
                </button>
              </div>

              <!-- Logged in: create form -->
              <template v-else>
                <div v-if="error" class="mb-4 p-3 bg-badge-danger-bg border border-accent-red/30 text-red-600 text-sm">{{ error }}</div>

                <form @submit.prevent="submitCreate" class="space-y-5">
                  <div>
                    <label class="block text-sm text-text-secondary mb-1">{{ t('teams.teamName') }} <span class="text-accent-red">*</span></label>
                    <input v-model="teamName" type="text" required placeholder="e.g. AgentX" :class="inputClass" />
                  </div>
                  <!-- Team Avatar -->
                  <div>
                    <label class="block text-sm text-text-secondary mb-2">{{ t('teams.teamAvatar') }}</label>
                    <div class="flex items-center gap-3">
                      <div class="w-14 h-14 rounded-[10px] border-2 border-border overflow-hidden shrink-0 flex items-center justify-center bg-bg-card">
                        <img :src="teamAvatar || defaultAvatar()" class="max-w-[80%] max-h-[80%] object-contain" />
                      </div>
                      <div class="flex flex-wrap items-center gap-2">
                        <button v-for="preset in avatarPresets" :key="preset.id" type="button" @click="teamAvatar = preset.src" class="w-10 h-10 rounded-[10px] border-2 overflow-hidden transition-all flex items-center justify-center bg-bg-card p-1" :class="teamAvatar === preset.src ? 'border-accent-red scale-110' : 'border-border hover:border-border-hover'">
                          <img :src="preset.src" class="max-w-full max-h-full object-contain rounded-[10px]" />
                        </button>
                        <label class="w-10 h-10 rounded-[10px] border-2 border-dashed border-border-hover hover:border-border-strong flex items-center justify-center cursor-pointer transition-all overflow-hidden" :class="teamAvatar && !avatarPresets.some(p => p.src === teamAvatar) ? 'border-accent-red' : ''">
                          <img v-if="teamAvatar && !avatarPresets.some(p => p.src === teamAvatar)" :src="teamAvatar" class="w-full h-full object-cover" />
                          <span v-else class="text-text-tertiary text-sm">+</span>
                          <input type="file" accept="image/*" class="hidden" @change="uploadTeamAvatar($event)" />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm text-text-secondary mb-1">{{ t('teams.githubRepo') }} <span class="text-accent-red">*</span></label>
                    <input v-model="githubRepo" type="url" required placeholder="https://github.com/your-org/project" :class="inputClass" />
                  </div>

                  <div>
                    <label class="block text-sm text-text-secondary mb-2">{{ t('teams.track') }} <span class="text-text-secondary text-xs">(multi-select)</span></label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="track in tracks"
                        :key="track.id"
                        type="button"
                        @click="toggleTrack(track.id)"
                        class="flex items-center gap-2 px-3 py-2.5 border text-left transition-all text-sm"
                        :class="selectedTracks.includes(track.id) ? 'bg-accent/10 border-accent/50 text-text-primary' : 'border-border text-text-secondary hover:border-border-hover'"
                      >
                        <img :src="track.icon" class="w-4 h-4 shrink-0 theme-icon" />
                        <span class="truncate">{{ track.label }}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm text-text-secondary mb-2">{{ t('teams.aiModels') }}</label>
                    <div class="flex gap-3">
                      <button v-for="model in modelOptions" :key="model.id" type="button" @click="selectModel(model.id)" class="flex-1 flex items-center justify-center gap-2 py-3 border transition-all" :class="selectedModel === model.id ? 'bg-accent/10 border-accent/50 text-text-primary' : 'border-border text-text-secondary hover:border-border-hover'">
                        <img :src="model.icon" class="w-5 h-5 rounded-[10px]" />
                        <span class="text-sm font-semibold">{{ model.label }}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm text-text-secondary mb-1">{{ t('teams.projectIdea') }} <span class="text-text-secondary text-xs">{{ t('teams.optional') }}</span></label>
                    <textarea v-model="projectIdea" rows="2" placeholder="Briefly describe what you plan to build..." :class="[inputClass, 'resize-none']"></textarea>
                  </div>

                  <!-- Lock toggle -->
                  <label class="flex items-center gap-3 cursor-pointer">
                    <div class="relative">
                      <input type="checkbox" v-model="teamLocked" class="sr-only peer" />
                      <div class="w-9 h-5 bg-border rounded-full peer-checked:bg-accent transition-colors"></div>
                      <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-bg-card rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <div>
                      <span class="text-sm text-text-primary">{{ t('teams.lockTeam') }}</span>
                      <p class="text-xs text-text-secondary">{{ t('teams.lockTeamDesc') }}</p>
                    </div>
                  </label>

                  <!-- Max size -->
                  <div>
                    <label class="block text-sm text-text-secondary mb-1">Max team size</label>
                    <div class="flex gap-3">
                      <button v-for="n in 3" :key="n" type="button" @click="maxSize = n" class="flex-1 py-2.5 border font-semibold transition-all flex flex-col items-center gap-0.5" :class="maxSize === n ? 'bg-accent/10 border-accent/50 text-text-primary' : 'border-border text-text-secondary hover:border-border-hover'">
                        <span>{{ n }}</span>
                        <span class="text-[10px] font-normal opacity-70">{{ teamVibe(n).label }}</span>
                      </button>
                    </div>
                  </div>

                  <button type="submit" :disabled="loading" class="w-full py-4 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors disabled:opacity-50">
                    {{ loading ? t('teams.submitting') : t('teams.submitBtn') }}
                  </button>
                </form>
              </template>
            </template>

            <!-- EDIT MODE -->
            <template v-else-if="modalMode === 'edit' && viewingTeam">
              <h3 class="text-2xl font-bold text-text-primary mb-6">Edit Team</h3>
              <div v-if="error" class="mb-4 p-3 bg-badge-danger-bg border border-accent-red/30 text-red-600 text-sm">{{ error }}</div>

              <form @submit.prevent="submitEdit" class="space-y-5">
                <div>
                  <label class="block text-sm text-text-secondary mb-1">{{ t('teams.teamName') }} <span class="text-accent-red">*</span></label>
                  <input v-model="teamName" type="text" required placeholder="e.g. AgentX" :class="inputClass" />
                </div>
                <!-- Team Avatar -->
                <div>
                  <label class="block text-sm text-text-secondary mb-2">{{ t('teams.teamAvatar') }}</label>
                  <div class="flex items-center gap-3">
                    <div class="w-14 h-14 rounded-[10px] border-2 border-border overflow-hidden shrink-0 flex items-center justify-center bg-bg-card">
                      <img :src="teamAvatar || defaultAvatar()" class="max-w-[80%] max-h-[80%] object-contain" />
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <button v-for="preset in avatarPresets" :key="preset.id" type="button" @click="teamAvatar = preset.src" class="w-10 h-10 rounded-[10px] border-2 overflow-hidden transition-all flex items-center justify-center bg-bg-card p-1" :class="teamAvatar === preset.src ? 'border-accent-red scale-110' : 'border-border hover:border-border-hover'">
                        <img :src="preset.src" class="max-w-full max-h-full object-contain rounded-[10px]" />
                      </button>
                      <label class="w-10 h-10 rounded-[10px] border-2 border-dashed border-border-hover hover:border-border-strong flex items-center justify-center cursor-pointer transition-all overflow-hidden" :class="teamAvatar && !avatarPresets.some(p => p.src === teamAvatar) ? 'border-accent-red' : ''">
                        <img v-if="teamAvatar && !avatarPresets.some(p => p.src === teamAvatar)" :src="teamAvatar" class="w-full h-full object-cover" />
                        <span v-else class="text-text-tertiary text-sm">+</span>
                        <input type="file" accept="image/*" class="hidden" @change="uploadTeamAvatar($event)" />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1">{{ t('teams.githubRepo') }} <span class="text-accent-red">*</span></label>
                  <input v-model="githubRepo" type="url" required placeholder="https://github.com/your-org/project" :class="inputClass" />
                </div>

                <div>
                  <label class="block text-sm text-text-secondary mb-2">{{ t('teams.track') }} <span class="text-text-secondary text-xs">(multi-select)</span></label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="track in tracks"
                      :key="track.id"
                      type="button"
                      @click="toggleTrack(track.id)"
                      class="flex items-center gap-2 px-3 py-2.5 border text-left transition-all text-sm"
                      :class="selectedTracks.includes(track.id) ? 'bg-accent/10 border-accent/50 text-text-primary' : 'border-border text-text-secondary hover:border-border-hover'"
                    >
                      <img :src="track.icon" class="w-4 h-4 shrink-0 theme-icon" />
                      <span class="truncate">{{ track.label }}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-text-secondary mb-2">{{ t('teams.aiModels') }}</label>
                  <div class="flex gap-3">
                    <button v-for="model in modelOptions" :key="model.id" type="button" @click="selectModel(model.id)" class="flex-1 flex items-center justify-center gap-2 py-3 border transition-all" :class="selectedModel === model.id ? 'bg-accent/10 border-accent/50 text-text-primary' : 'border-border text-text-secondary hover:border-border-hover'">
                      <img :src="model.icon" class="w-5 h-5 rounded-[10px]" />
                      <span class="text-sm font-semibold">{{ model.label }}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-text-secondary mb-1">{{ t('teams.projectIdea') }} <span class="text-text-secondary text-xs">{{ t('teams.optional') }}</span></label>
                  <textarea v-model="projectIdea" rows="2" placeholder="Briefly describe what you plan to build..." :class="[inputClass, 'resize-none']"></textarea>
                </div>

                <!-- Lock toggle -->
                <label class="flex items-center gap-3 cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" v-model="teamLocked" class="sr-only peer" />
                    <div class="w-9 h-5 bg-border rounded-full peer-checked:bg-accent transition-colors"></div>
                    <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-bg-card rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <div>
                    <span class="text-sm text-text-primary">{{ t('teams.lockTeam') }}</span>
                    <p class="text-xs text-text-secondary">{{ t('teams.lockTeamDesc') }}</p>
                  </div>
                </label>

                <!-- Max size -->
                <div>
                  <label class="block text-sm text-text-secondary mb-1">Max team size</label>
                  <div class="flex gap-3">
                    <button v-for="n in 3" :key="n" type="button" @click="maxSize = n" class="flex-1 py-2.5 border font-semibold transition-all flex flex-col items-center gap-0.5" :class="maxSize === n ? 'bg-accent/10 border-accent/50 text-text-primary' : 'border-border text-text-secondary hover:border-border-hover'">
                      <span>{{ n }}</span>
                      <span class="text-[10px] font-normal opacity-70">{{ teamVibe(n).label }}</span>
                    </button>
                  </div>
                </div>

                <button type="submit" :disabled="loading" class="w-full py-4 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors disabled:opacity-50">
                  {{ loading ? 'Saving...' : 'Save Changes' }}
                </button>
              </form>
            </template>

            <!-- VIEW MODE -->
            <template v-else-if="modalMode === 'view' && viewingTeam">
              <div class="flex items-center gap-4 mb-6">
                <img :src="assetUrl(viewingTeam.avatar) || assetUrl('/default-avatar.svg')" class="w-16 h-16 rounded-[10px] object-cover border border-border" />
                <div>
                  <h3 class="text-2xl font-bold text-text-primary">{{ viewingTeam.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-sm text-text-secondary">{{ getTeamMembers(viewingTeam.id).length }}/{{ viewingTeam.maxSize || 3 }} members</span>
                    <span v-if="viewingTeam.locked" class="text-[10px] px-1.5 py-0.5 rounded bg-badge-neutral-bg text-text-tertiary inline-flex items-center gap-0.5">
                      <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                      Locked
                    </span>
                  </div>
                </div>
              </div>

              <!-- Tracks -->
              <div v-if="viewingTeam.themes?.length" class="flex flex-wrap gap-2 mb-4">
                <span v-for="theme in viewingTeam.themes" :key="theme" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-badge-neutral-bg text-xs text-text-tertiary">
                  <img v-if="getTrackIcon(theme)" :src="getTrackIcon(theme)" class="w-3.5 h-3.5 theme-icon" />
                  {{ getTrackLabel(theme) }}
                </span>
              </div>

              <!-- Model -->
              <div v-if="viewingTeam.model" class="flex gap-2 mb-4">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-badge-neutral-bg text-xs text-text-tertiary">
                  <img v-if="getModelIcon(viewingTeam.model)" :src="getModelIcon(viewingTeam.model)" class="w-4 h-4 rounded" />
                  {{ viewingTeam.model }}
                </div>
              </div>

              <!-- Project Idea -->
              <div v-if="viewingTeam.projectIdea" class="mb-6 p-4 bg-bg-elevated">
                <p class="text-xs text-text-muted uppercase tracking-wider mb-2 font-semibold">{{ t('teams.projectIdeaLabel') }}</p>
                <p class="text-sm text-text-secondary leading-relaxed">"{{ viewingTeam.projectIdea }}"</p>
              </div>

              <!-- Members -->
              <div class="mb-6">
                <p class="text-xs text-text-muted uppercase tracking-wider mb-3 font-semibold">{{ t('teams.membersLabel') }}</p>
                <div class="space-y-3">
                  <div v-for="member in getTeamMembers(viewingTeam.id)" :key="member.id" class="flex items-center gap-3 p-3 bg-bg-elevated">
                    <img :src="assetUrl(member.avatar) || assetUrl('/default-avatar.svg')" class="w-8 h-8 rounded-full shrink-0 object-cover border border-border" />
                    <div class="flex-1 min-w-0">
                      <span class="text-sm font-semibold text-text-primary">{{ member.name }}</span>
                      <span v-if="member.id === viewingTeam.leaderId" class="text-[10px] text-amber-600 ml-1">{{ t('teams.lead') }}</span>
                      <span v-if="member.role" class="text-xs text-text-secondary ml-2">{{ member.role }}</span>
                    </div>
                    <a v-if="member.githubId" :href="'https://github.com/' + member.githubId.replace(/^@/, '')" target="_blank" @click.stop class="text-xs text-text-secondary hover:text-blue-600 transition-colors">@{{ member.githubId.replace(/^@/, '') }}</a>
                  </div>
                </div>
              </div>

              <!-- GitHub Repo -->
              <a v-if="viewingTeam.githubRepo" :href="viewingTeam.githubRepo" target="_blank" @click.stop class="inline-flex items-center gap-2 mb-6 text-sm text-text-secondary hover:text-blue-600 transition-colors">
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                {{ viewingTeam.githubRepo }}
              </a>

              <!-- Action buttons -->
              <div class="flex gap-3">
                <button
                  @click="handleLike(viewingTeam.id, $event)"
                  class="flex-1 py-3 border transition-all flex items-center justify-center gap-2 text-sm"
                  :class="likedTeams.has(viewingTeam.id) ? 'border-accent-red/30 bg-badge-danger-bg text-red-500' : 'border-border text-text-secondary hover:border-border-hover'"
                >
                  <svg class="w-4 h-4" :fill="likedTeams.has(viewingTeam.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                  {{ viewingTeam.likes || 0 }}
                </button>

                <!-- Join: logged in, team open, user has no team -->
                <button
                  v-if="isLoggedIn && canJoin(viewingTeam) && !userHasTeam() && !hasPendingRequest(viewingTeam)"
                  @click="handleJoinTeam(viewingTeam.id)"
                  :disabled="loading"
                  class="flex-[2] py-3 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors disabled:opacity-50"
                >
                  {{ loading ? 'Sending...' : 'Request to Join' }}
                </button>
                <!-- Already requested -->
                <span
                  v-else-if="isLoggedIn && hasPendingRequest(viewingTeam)"
                  class="flex-[2] py-3 text-center text-sm text-amber-600 border border-amber-600/30"
                >
                  Pending Approval
                </span>

                <!-- Not logged in: register to join -->
                <button v-else-if="!isLoggedIn && canJoin(viewingTeam)" @click="showModal = false; promptAuth('register')" class="flex-[2] py-3 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors">
                  Register to Join
                </button>

                <!-- Locked -->
                <span v-else-if="viewingTeam.locked" class="flex-[2] py-3 text-center text-sm text-text-muted border border-border">
                  {{ t('teams.notAccepting') }}
                </span>
              </div>

              <!-- Member actions: leave -->
              <div v-if="isLoggedIn && isTeamMember(viewingTeam) && !isTeamLeader(viewingTeam)" class="mt-3">
                <button
                  @click="handleLeaveTeam"
                  :disabled="loading"
                  class="w-full py-3 border border-accent-red/30 text-red-500 text-sm font-semibold hover:bg-badge-danger-bg transition-colors disabled:opacity-50"
                >
                  {{ loading ? 'Leaving...' : 'Leave Team' }}
                </button>
              </div>

              <!-- Pending join requests (leader only) -->
              <div v-if="isLoggedIn && isTeamLeader(viewingTeam) && viewingTeam.pendingUsers?.length" class="mt-4 p-4 border border-amber-600/30 bg-badge-warning-bg/30">
                <p class="text-xs text-amber-600 uppercase tracking-wider mb-3 font-semibold">Pending Requests ({{ viewingTeam.pendingUsers.length }})</p>
                <div class="space-y-2">
                  <div v-for="pu in viewingTeam.pendingUsers" :key="pu.id" class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 min-w-0">
                      <img :src="assetUrl(pu.avatar) || assetUrl('/default-avatar.svg')" class="w-6 h-6 rounded-full shrink-0 object-cover" />
                      <span class="text-sm text-text-primary truncate">{{ pu.name }}</span>
                      <span v-if="pu.role" class="text-[10px] text-text-muted truncate">{{ pu.role }}</span>
                    </div>
                    <div class="flex gap-2 shrink-0">
                      <button @click="handleApprove(viewingTeam.id, pu.id)" class="px-3 py-1 text-xs bg-badge-success-bg text-badge-success-text font-semibold hover:opacity-80 transition-opacity">Approve</button>
                      <button @click="handleReject(viewingTeam.id, pu.id)" class="px-3 py-1 text-xs bg-badge-danger-bg text-badge-danger-text font-semibold hover:opacity-80 transition-opacity">Decline</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Leader actions: edit + delete -->
              <div v-if="isLoggedIn && isTeamLeader(viewingTeam)" class="mt-3 flex gap-3">
                <button
                  @click="openEditModal"
                  class="flex-1 py-3 border border-border text-text-secondary text-sm font-semibold hover:bg-bg-elevated transition-colors"
                >
                  Edit Team
                </button>
                <button
                  @click="handleDeleteTeam"
                  :disabled="loading"
                  class="flex-1 py-3 border border-accent-red/30 text-red-500 text-sm font-semibold hover:bg-badge-danger-bg transition-colors disabled:opacity-50"
                >
                  {{ loading ? 'Deleting...' : 'Delete Team' }}
                </button>
              </div>

              <!-- Leader leave (dissolve note) -->
              <div v-if="isLoggedIn && isTeamLeader(viewingTeam)" class="mt-2">
                <p class="text-[11px] text-text-secondary text-center">As team leader, delete the team to leave.</p>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
