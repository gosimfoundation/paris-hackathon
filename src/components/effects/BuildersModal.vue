<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'
import { useTeams } from '../../composables/useTeams'

const { user, isLoggedIn } = useAuth()
const { teams, inviteToTeam, sentInvitations, error: teamsError } = useTeams()

const visible = ref(false)
const showModal = ref(false)
const profiles = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const filterRole = ref('')
const selected = ref<any>(null)
const inviteMessage = ref('')
const inviting = ref(false)
const inviteToast = ref('')

const myLedTeam = computed(() => teams.value.find(t => t.leaderId === user.value?.id))
const canInvite = computed(() => {
  if (!isLoggedIn.value || !myLedTeam.value) return false
  if (myLedTeam.value.locked) return false
  return myLedTeam.value.members.length < myLedTeam.value.maxSize
})

function isAlreadyInvitedByMe(userId: string): boolean {
  return sentInvitations.value.some(i => i.invited_user_id === userId && i.status === 'pending')
}

function isAlreadyOnMyTeam(userId: string): boolean {
  return !!myLedTeam.value?.members.some(m => m.id === userId)
}

async function handleInvite(p: any) {
  if (!myLedTeam.value || inviting.value) return
  inviting.value = true
  const inviteId = await inviteToTeam(myLedTeam.value.id, p.id, inviteMessage.value.trim())
  inviting.value = false
  if (inviteId) {
    inviteToast.value = `Invited ${p.name || 'builder'} to ${myLedTeam.value.name}`
    inviteMessage.value = ''
    setTimeout(() => (inviteToast.value = ''), 2500)
  } else {
    inviteToast.value = teamsError.value || 'Invite failed'
    setTimeout(() => (inviteToast.value = ''), 3500)
  }
}

let observer: IntersectionObserver | null = null

function userAvatar(p: any): string {
  if (p.avatar) return p.avatar
  if (p.github_id) return `https://avatars.githubusercontent.com/${p.github_id.replace(/^@/, '')}`
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || '?')}&background=1f2937&color=fff&size=128`
}

async function loadProfiles() {
  if (profiles.value.length > 0) return
  loading.value = true
  const { data } = await supabase
    .from('profiles')
    .select('id,name,avatar,role,bio,themes,github_id,discord,twitter,telegram,linkedin,website,looking_for_team,team_id')
    .order('created_at', { ascending: false })
  profiles.value = data || []
  loading.value = false
}

function open() {
  loadProfiles()
  showModal.value = true
}

const allRoles = computed(() => {
  const roles = new Set<string>()
  profiles.value.forEach(p => { if (p.role) roles.add(p.role) })
  return Array.from(roles).sort()
})

const filtered = computed(() => {
  let list = profiles.value
  if (filterRole.value) list = list.filter(p => p.role === filterRole.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.role || '').toLowerCase().includes(q) ||
      (p.bio || '').toLowerCase().includes(q) ||
      (p.themes || []).some((t: string) => t.toLowerCase().includes(q))
    )
  }
  return list
})

function ghLink(id?: string) { return id ? `https://github.com/${id.replace(/^@/, '')}` : '' }
function xLink(id?: string) { return id ? `https://x.com/${id.replace(/^@/, '')}` : '' }
function tgLink(id?: string) { return id ? `https://t.me/${id.replace(/^@/, '')}` : '' }
function liLink(id?: string) {
  if (!id) return ''
  return id.startsWith('http') ? id : `https://linkedin.com/in/${id}`
}

function setupObserver() {
  const teams = document.getElementById('teams')
  if (!teams) {
    setTimeout(setupObserver, 300)
    return
  }
  observer = new IntersectionObserver(
    ([entry]) => { visible.value = entry.isIntersecting },
    { threshold: 0, rootMargin: '0px 0px -20% 0px' }
  )
  observer.observe(teams)
}

onMounted(() => {
  setTimeout(setupObserver, 500)
})
onUnmounted(() => { if (observer) observer.disconnect() })
</script>

<template>
  <!-- Floating button (visible only when teams section is in view) -->
  <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 translate-y-3" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-3">
    <button
      v-if="visible"
      @click="open"
      class="builders-fab"
      title="Browse all builders"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
      <span class="builders-fab__text">BROWSE ALL BUILDERS</span>
      <span class="builders-fab__count tabular-nums">{{ profiles.length || '·' }}</span>
    </button>
  </Transition>

  <!-- Modal -->
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="showModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="showModal = false" />
        <div class="relative w-full max-w-5xl max-h-[88vh] bg-bg-primary border border-border shadow-2xl flex flex-col" @click.stop>
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-border shrink-0">
            <div>
              <h2 class="text-xl font-bold text-text-primary">All Builders</h2>
              <p class="text-xs text-text-muted mt-1">{{ filtered.length }} of {{ profiles.length }} builders</p>
            </div>
            <button @click="showModal = false" class="text-text-secondary hover:text-text-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-3 p-4 border-b border-border shrink-0">
            <input
              v-model="search"
              type="text"
              placeholder="Search by name, role, theme..."
              class="flex-1 px-4 py-2 bg-input-bg border border-input-border text-text-primary placeholder-text-muted text-sm focus:border-accent focus:outline-none"
            />
            <select v-model="filterRole" class="px-4 py-2 bg-input-bg border border-input-border text-text-primary text-sm focus:border-accent focus:outline-none">
              <option value="">All Roles</option>
              <option v-for="r in allRoles" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>

          <!-- Builders grid -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="loading" class="text-center text-text-muted py-12">Loading...</div>
            <div v-else-if="filtered.length === 0" class="text-center text-text-muted py-12">No builders found.</div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div v-for="p in filtered" :key="p.id" @click="selected = p" class="bg-bg-secondary border border-border-subtle p-4 hover:border-accent/50 hover:bg-bg-elevated transition-colors flex flex-col cursor-pointer">
                <div class="flex items-start gap-3 mb-2">
                  <img :src="userAvatar(p)" :alt="p.name" class="w-12 h-12 rounded-full object-cover border border-border shrink-0" />
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm font-semibold text-text-primary truncate">{{ p.name }}</h3>
                    <p v-if="p.role" class="text-xs text-text-secondary truncate">{{ p.role }}</p>
                    <span v-if="p.team_id" class="inline-block mt-1 px-1.5 py-0.5 text-[9px] bg-green-900/40 text-green-400 rounded">In team</span>
                    <span v-else-if="p.looking_for_team" class="inline-block mt-1 px-1.5 py-0.5 text-[9px] bg-amber-900/40 text-amber-400 rounded">Looking for team</span>
                  </div>
                </div>
                <p v-if="p.bio" class="text-xs text-text-muted mb-2 line-clamp-2">{{ p.bio }}</p>
                <div v-if="p.themes?.length" class="flex flex-wrap gap-1 mb-2">
                  <span v-for="t in p.themes.slice(0, 3)" :key="t" class="text-[9px] px-1.5 py-0.5 bg-accent/10 text-accent rounded">{{ t.split(':')[0] }}</span>
                </div>
                <div class="mt-auto flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
                  <a v-if="p.github_id" :href="ghLink(p.github_id)" target="_blank" rel="noopener" @click.stop class="text-text-tertiary hover:text-text-primary transition-colors" title="GitHub">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                  <span v-if="p.discord" class="text-text-tertiary cursor-help" :title="`Discord: ${p.discord}`">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  </span>
                  <a v-if="p.twitter" :href="xLink(p.twitter)" target="_blank" rel="noopener" @click.stop class="text-text-tertiary hover:text-text-primary transition-colors" title="X / Twitter">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a v-if="p.telegram" :href="tgLink(p.telegram)" target="_blank" rel="noopener" @click.stop class="text-text-tertiary hover:text-text-primary transition-colors" title="Telegram">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </a>
                  <a v-if="p.linkedin" :href="liLink(p.linkedin)" target="_blank" rel="noopener" @click.stop class="text-text-tertiary hover:text-text-primary transition-colors" title="LinkedIn">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a v-if="p.website" :href="p.website" target="_blank" rel="noopener" @click.stop class="text-text-tertiary hover:text-text-primary transition-colors" title="Website">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Detail overlay (on top of modal) -->
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="selected" class="fixed inset-0 z-[210] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/85 backdrop-blur-sm" @click="selected = null" />
        <div class="relative w-full max-w-md bg-bg-primary border border-border shadow-2xl max-h-[88vh] overflow-y-auto" @click.stop>
          <!-- Back button -->
          <button @click="selected = null" class="absolute top-4 right-4 text-text-secondary hover:text-text-primary z-10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div class="p-8">
            <!-- Avatar + name -->
            <div class="flex flex-col items-center text-center mb-6">
              <img :src="userAvatar(selected)" :alt="selected.name" class="w-24 h-24 rounded-full object-cover border-2 border-border mb-3" />
              <h3 class="text-xl font-bold text-text-primary">{{ selected.name }}</h3>
              <p v-if="selected.role" class="text-sm text-text-secondary mt-1">{{ selected.role }}</p>
              <div class="flex gap-2 mt-2">
                <span v-if="selected.team_id" class="px-2 py-0.5 text-[10px] bg-green-900/40 text-green-400 rounded font-semibold">IN TEAM</span>
                <span v-else-if="selected.looking_for_team" class="px-2 py-0.5 text-[10px] bg-amber-900/40 text-amber-400 rounded font-semibold">LOOKING FOR TEAM</span>
              </div>
            </div>

            <!-- Bio -->
            <div v-if="selected.bio" class="mb-5">
              <p class="text-xs text-text-muted uppercase tracking-wider mb-2">Bio</p>
              <p class="text-sm text-text-secondary whitespace-pre-line">{{ selected.bio }}</p>
            </div>

            <!-- Invite to my team (leader only) -->
            <div v-if="canInvite && selected.id !== user?.id" class="mb-5 p-4 border border-accent/30 bg-accent/5 rounded">
              <p class="text-xs text-accent uppercase tracking-wider mb-2 font-semibold">Invite to {{ myLedTeam?.name }}</p>
              <template v-if="isAlreadyOnMyTeam(selected.id)">
                <p class="text-xs text-text-muted">Already on your team.</p>
              </template>
              <template v-else-if="isAlreadyInvitedByMe(selected.id)">
                <p class="text-xs text-amber-400">Invitation already pending.</p>
              </template>
              <template v-else>
                <textarea v-model="inviteMessage" rows="2" placeholder="Optional message..."
                  class="w-full px-3 py-2 mb-2 bg-input-bg border border-input-border text-text-primary placeholder-text-muted text-xs focus:border-accent focus:outline-none" />
                <button @click="handleInvite(selected)" :disabled="inviting"
                  class="w-full py-2 bg-btn-bg text-btn-text text-xs font-bold uppercase tracking-widest hover:bg-btn-hover disabled:opacity-50 transition-colors">
                  {{ inviting ? 'Sending...' : 'Send Invite' }}
                </button>
                <p v-if="inviteToast" class="text-[11px] text-emerald-400 text-center mt-2">{{ inviteToast }}</p>
              </template>
            </div>

            <!-- Themes -->
            <div v-if="selected.themes?.length" class="mb-5">
              <p class="text-xs text-text-muted uppercase tracking-wider mb-2">Interested Themes</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="t in selected.themes" :key="t" class="px-2 py-1 text-xs bg-accent/10 text-accent rounded">{{ t }}</span>
              </div>
            </div>

            <!-- Social links full list -->
            <div class="space-y-2 pt-4 border-t border-border-subtle">
              <a v-if="selected.github_id" :href="ghLink(selected.github_id)" target="_blank" rel="noopener" class="flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span class="truncate">{{ selected.github_id }}</span>
              </a>
              <p v-if="selected.discord" class="flex items-center gap-3 text-sm text-text-secondary">
                <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                <span class="truncate">{{ selected.discord }}</span>
              </p>
              <a v-if="selected.twitter" :href="xLink(selected.twitter)" target="_blank" rel="noopener" class="flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span class="truncate">{{ selected.twitter }}</span>
              </a>
              <a v-if="selected.telegram" :href="tgLink(selected.telegram)" target="_blank" rel="noopener" class="flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                <span class="truncate">{{ selected.telegram }}</span>
              </a>
              <a v-if="selected.linkedin" :href="liLink(selected.linkedin)" target="_blank" rel="noopener" class="flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <span class="truncate">{{ selected.linkedin }}</span>
              </a>
              <a v-if="selected.website" :href="selected.website" target="_blank" rel="noopener" class="flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                <span class="truncate">{{ selected.website }}</span>
              </a>
              <p v-if="!selected.github_id && !selected.discord && !selected.twitter && !selected.telegram && !selected.linkedin && !selected.website" class="text-xs text-text-muted text-center italic">No public contact info shared.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.builders-fab {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, rgba(212, 160, 23, 0.95), rgba(233, 75, 126, 0.85));
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 24px rgba(212, 160, 23, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.builders-fab:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 12px 32px rgba(212, 160, 23, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.3);
}
.builders-fab__count {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  letter-spacing: 0;
}
@media (max-width: 640px) {
  .builders-fab {
    padding: 0.6rem 1rem;
    font-size: 0.65rem;
  }
  .builders-fab__text { display: none; }
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
