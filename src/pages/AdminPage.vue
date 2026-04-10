<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import QRCode from 'qrcode'

const authed = ref(sessionStorage.getItem('admin_authed') === '1')
const passInput = ref('')
const passError = ref('')

async function sha256hex(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function tryAuth() {
  passError.value = ''
  const inputHash = await sha256hex(passInput.value)
  const { data } = await supabase.from('admin_config').select('value').eq('key', 'admin_pass_hash').single()
  if (data && data.value === inputHash) {
    sessionStorage.setItem('admin_authed', '1')
    authed.value = true
    loadData()
  } else {
    passError.value = 'Wrong password'
  }
}

// Data
const profiles = ref<any[]>([])
const teams = ref<any[]>([])
const loading = ref(false)
const tab = ref<'users' | 'teams'>('users')
const search = ref('')

// Edit modal
const editingUser = ref<any>(null)
const editFields = ref({ name: '', email: '', role: '', bio: '', github_id: '', discord: '', twitter: '', telegram: '' })

// QR modal
const qrUser = ref<any>(null)
const qrDataUrl = ref('')

async function showQr(user: any) {
  qrUser.value = user
  qrDataUrl.value = await QRCode.toDataURL(`https://create.gosim.org/profile/${user.id}`, {
    width: 280, margin: 1, color: { dark: '#000000', light: '#ffffff' },
  })
}

// Team view modal
const viewingTeam = ref<any>(null)

async function loadData() {
  loading.value = true
  const [{ data: p }, { data: t }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('teams').select('*').order('created_at', { ascending: false }),
  ])
  profiles.value = p || []
  teams.value = t || []
  loading.value = false
}

// Stats
const totalUsers = computed(() => profiles.value.length)
const totalTeams = computed(() => teams.value.length)
const checkedIn = computed(() => profiles.value.filter(p => p.checked_in).length)
const noTeam = computed(() => profiles.value.filter(p => !p.team_id).length)
const modelStats = computed(() => {
  const stats: Record<string, number> = { MiniMax: 0, Kimi: 0, GLM: 0 }
  teams.value.forEach(t => { if (t.model && t.model in stats) stats[t.model]++ })
  return stats
})

// Filtered users
const filteredUsers = computed(() => {
  if (!search.value.trim()) return profiles.value
  const q = search.value.toLowerCase()
  return profiles.value.filter(p =>
    (p.name || '').toLowerCase().includes(q) ||
    (p.email || '').toLowerCase().includes(q)
  )
})

function getTeamName(teamId: string | null) {
  if (!teamId) return '—'
  return teams.value.find(t => t.id === teamId)?.name || '—'
}

function getTeamMembers(teamId: string) {
  return profiles.value.filter(p => p.team_id === teamId)
}

function getLeaderName(teamId: string) {
  const team = teams.value.find(t => t.id === teamId)
  if (!team) return '—'
  const leader = profiles.value.find(p => p.id === team.leader_id)
  return leader?.name || '—'
}

// Actions
async function toggleCheckIn(user: any) {
  const newVal = !user.checked_in
  await supabase.from('profiles').update({ checked_in: newVal }).eq('id', user.id)
  user.checked_in = newVal
}

async function toggleApproved(user: any) {
  const newVal = !user.approved
  await supabase.from('profiles').update({ approved: newVal }).eq('id', user.id)
  user.approved = newVal
}

function downloadBackup() {
  const data = { profiles: profiles.value, teams: teams.value, exported_at: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gosim-hackathon-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function openEdit(user: any) {
  editingUser.value = user
  editFields.value = {
    name: user.name || '',
    email: user.email || '',
    role: user.role || '',
    bio: user.bio || '',
    github_id: user.github_id || '',
    discord: user.discord || '',
    twitter: user.twitter || '',
    telegram: user.telegram || '',
  }
}

async function saveEdit() {
  if (!editingUser.value) return
  await supabase.from('profiles').update(editFields.value).eq('id', editingUser.value.id)
  Object.assign(editingUser.value, editFields.value)
  editingUser.value = null
}

async function kickUser(user: any) {
  if (!confirm(`Remove "${user.name}" from the hackathon? This cannot be undone.`)) return
  // Remove from team if in one
  if (user.team_id) {
    const team = teams.value.find(t => t.id === user.team_id)
    if (team) {
      const members = (team.members || []).filter((id: string) => id !== user.id)
      await supabase.from('teams').update({ members }).eq('id', team.id)
    }
  }
  await supabase.from('profiles').delete().eq('id', user.id)
  profiles.value = profiles.value.filter(p => p.id !== user.id)
}

async function dissolveTeam(team: any) {
  if (!confirm(`Dissolve team "${team.name}"? Members will become teamless.`)) return
  // Clear team_id for all members
  const members = profiles.value.filter(p => p.team_id === team.id)
  for (const m of members) {
    await supabase.from('profiles').update({ team_id: null }).eq('id', m.id)
    m.team_id = null
  }
  await supabase.from('teams').delete().eq('id', team.id)
  teams.value = teams.value.filter(t => t.id !== team.id)
}

onMounted(() => { if (authed.value) loadData() })
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-200 pt-20 pb-16">
    <!-- Auth gate -->
    <div v-if="!authed" class="max-w-sm mx-auto px-6 pt-20">
      <h1 class="text-2xl font-bold text-white mb-6 text-center">Admin Access</h1>
      <form @submit.prevent="tryAuth" class="space-y-4">
        <input v-model="passInput" type="password" placeholder="Enter admin password" autofocus
          class="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none" />
        <p v-if="passError" class="text-red-400 text-sm">{{ passError }}</p>
        <button type="submit" class="w-full py-3 bg-amber-600 text-black font-semibold hover:bg-amber-500 transition-colors">Enter</button>
      </form>
    </div>

    <!-- Admin panel -->
    <div v-else class="max-w-7xl mx-auto px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-white">GOSIM Hackathon Admin</h1>
        <div class="flex gap-2">
          <button @click="downloadBackup" class="px-4 py-2 text-sm bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors">Download Backup</button>
          <button @click="loadData" :disabled="loading" class="px-4 py-2 text-sm bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors">
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div class="bg-gray-900 border border-gray-800 p-4 text-center">
          <p class="text-2xl font-bold text-white">{{ totalUsers }}</p>
          <p class="text-xs text-gray-500 uppercase">Registered</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 p-4 text-center">
          <p class="text-2xl font-bold text-white">{{ totalTeams }}</p>
          <p class="text-xs text-gray-500 uppercase">Teams</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 p-4 text-center">
          <p class="text-2xl font-bold text-green-400">{{ checkedIn }}</p>
          <p class="text-xs text-gray-500 uppercase">Checked In</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 p-4 text-center">
          <p class="text-2xl font-bold text-amber-400">{{ noTeam }}</p>
          <p class="text-xs text-gray-500 uppercase">No Team</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 p-4 text-center">
          <div class="flex justify-center gap-3">
            <span v-for="(count, model) in modelStats" :key="model" class="text-xs"><span class="text-white font-bold">{{ count }}</span> {{ model }}</span>
          </div>
          <p class="text-xs text-gray-500 uppercase mt-1">Models</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 border-b border-gray-800">
        <button @click="tab = 'users'" class="px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors"
          :class="tab === 'users' ? 'text-white border-amber-500' : 'text-gray-500 border-transparent hover:text-gray-300'">
          Users ({{ totalUsers }})
        </button>
        <button @click="tab = 'teams'" class="px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors"
          :class="tab === 'teams' ? 'text-white border-amber-500' : 'text-gray-500 border-transparent hover:text-gray-300'">
          Teams ({{ totalTeams }})
        </button>
      </div>

      <!-- Users tab -->
      <div v-if="tab === 'users'">
        <input v-model="search" type="text" placeholder="Search by name or email..."
          class="w-full max-w-md px-4 py-2 mb-4 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none text-sm" />

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-800">
                <th class="py-3 px-3">User</th>
                <th class="py-3 px-3">Email</th>
                <th class="py-3 px-3">Role</th>
                <th class="py-3 px-3">Team</th>
                <th class="py-3 px-3 text-center">Approved</th>
                <th class="py-3 px-3 text-center">Check-in</th>
                <th class="py-3 px-3">Registered</th>
                <th class="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredUsers" :key="p.id" class="border-b border-gray-800/50 hover:bg-gray-900/50">
                <td class="py-3 px-3">
                  <div class="flex items-center gap-2">
                    <img :src="p.avatar || `https://avatars.githubusercontent.com/${(p.github_id || '').replace(/^@/, '')}`"
                      class="w-7 h-7 rounded-full object-cover" />
                    <span class="text-white">{{ p.name }}</span>
                  </div>
                </td>
                <td class="py-3 px-3 text-gray-400">{{ p.email || '—' }}</td>
                <td class="py-3 px-3 text-gray-400">{{ p.role || '—' }}</td>
                <td class="py-3 px-3 text-gray-400">{{ getTeamName(p.team_id) }}</td>
                <td class="py-3 px-3 text-center">
                  <button @click="toggleApproved(p)" class="w-6 h-6 border-2 rounded inline-flex items-center justify-center transition-colors"
                    :class="p.approved ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-600 hover:border-blue-500'">
                    <svg v-if="p.approved" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  </button>
                </td>
                <td class="py-3 px-3 text-center">
                  <button @click="toggleCheckIn(p)" class="w-6 h-6 border-2 rounded inline-flex items-center justify-center transition-colors"
                    :class="p.checked_in ? 'bg-green-600 border-green-600 text-white' : 'border-gray-600 hover:border-green-500'">
                    <svg v-if="p.checked_in" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  </button>
                </td>
                <td class="py-3 px-3 text-gray-500 text-xs">{{ new Date(p.created_at).toLocaleDateString() }}</td>
                <td class="py-3 px-3">
                  <div class="flex gap-2">
                    <button @click="showQr(p)" class="text-xs text-amber-400 hover:text-amber-300">QR</button>
                    <button @click="openEdit(p)" class="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                    <button @click="kickUser(p)" class="text-xs text-red-400 hover:text-red-300">Kick</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Teams tab -->
      <div v-if="tab === 'teams'">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-800">
                <th class="py-3 px-3">Team</th>
                <th class="py-3 px-3">Leader</th>
                <th class="py-3 px-3">Members</th>
                <th class="py-3 px-3">Model</th>
                <th class="py-3 px-3">Themes</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in teams" :key="t.id" class="border-b border-gray-800/50 hover:bg-gray-900/50">
                <td class="py-3 px-3">
                  <div class="flex items-center gap-2">
                    <img :src="t.avatar || '/default-team-avatar.svg'" class="w-7 h-7 rounded object-cover" />
                    <span class="text-white">{{ t.name }}</span>
                  </div>
                </td>
                <td class="py-3 px-3 text-gray-400">{{ getLeaderName(t.id) }}</td>
                <td class="py-3 px-3 text-gray-400">{{ getTeamMembers(t.id).length }} / {{ t.max_size || 3 }}</td>
                <td class="py-3 px-3 text-gray-400">{{ t.model || '—' }}</td>
                <td class="py-3 px-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="theme in (t.themes || [])" :key="theme" class="px-1.5 py-0.5 text-[10px] bg-gray-800 text-gray-400 rounded">{{ theme.split(':')[0] }}</span>
                  </div>
                </td>
                <td class="py-3 px-3">
                  <span :class="t.locked ? 'text-red-400' : 'text-green-400'" class="text-xs font-semibold">{{ t.locked ? 'Locked' : 'Open' }}</span>
                </td>
                <td class="py-3 px-3">
                  <div class="flex gap-2">
                    <button @click="viewingTeam = t" class="text-xs text-blue-400 hover:text-blue-300">View</button>
                    <button @click="dissolveTeam(t)" class="text-xs text-red-400 hover:text-red-300">Dissolve</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
        <div v-if="editingUser" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70" @click="editingUser = null" />
          <div class="relative w-full max-w-md bg-gray-900 border border-gray-700 p-6 max-h-[80vh] overflow-y-auto">
            <h3 class="text-lg font-bold text-white mb-4">Edit: {{ editingUser.name }}</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Name</label>
                <input v-model="editFields.name" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Email</label>
                <input v-model="editFields.email" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Role</label>
                <input v-model="editFields.role" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Bio</label>
                <textarea v-model="editFields.bio" rows="2" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-500 focus:outline-none resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">GitHub</label>
                  <input v-model="editFields.github_id" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Discord</label>
                  <input v-model="editFields.discord" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Twitter</label>
                  <input v-model="editFields.twitter" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Telegram</label>
                  <input v-model="editFields.telegram" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button @click="saveEdit" class="flex-1 py-2 bg-amber-600 text-black font-semibold text-sm hover:bg-amber-500 transition-colors">Save</button>
              <button @click="editingUser = null" class="flex-1 py-2 bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- View Team Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
        <div v-if="viewingTeam" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70" @click="viewingTeam = null" />
          <div class="relative w-full max-w-md bg-gray-900 border border-gray-700 p-6">
            <h3 class="text-lg font-bold text-white mb-1">{{ viewingTeam.name }}</h3>
            <p v-if="viewingTeam.project_idea" class="text-sm text-gray-400 mb-4 italic">"{{ viewingTeam.project_idea }}"</p>
            <div class="mb-4">
              <p class="text-xs text-gray-500 uppercase mb-2">Members ({{ getTeamMembers(viewingTeam.id).length }} / {{ viewingTeam.max_size || 3 }})</p>
              <div class="space-y-2">
                <div v-for="m in getTeamMembers(viewingTeam.id)" :key="m.id" class="flex items-center gap-3 p-2 bg-gray-800 rounded">
                  <img :src="m.avatar || `https://avatars.githubusercontent.com/${(m.github_id || '').replace(/^@/, '')}`" class="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p class="text-sm text-white">{{ m.name }} <span v-if="m.id === viewingTeam.leader_id" class="text-amber-400 text-xs">Lead</span></p>
                    <p class="text-xs text-gray-500">{{ m.role || '' }} {{ m.email ? `· ${m.email}` : '' }}</p>
                  </div>
                  <span :class="m.checked_in ? 'text-green-400' : 'text-gray-600'" class="ml-auto text-xs">{{ m.checked_in ? 'Checked in' : 'Not here' }}</span>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs text-gray-400">
              <p><span class="text-gray-600">Model:</span> {{ viewingTeam.model || '—' }}</p>
              <p><span class="text-gray-600">Status:</span> {{ viewingTeam.locked ? 'Locked' : 'Open' }}</p>
              <p v-if="viewingTeam.github_repo"><span class="text-gray-600">Repo:</span> <a :href="viewingTeam.github_repo" target="_blank" class="text-blue-400 hover:underline">Link</a></p>
            </div>
            <button @click="viewingTeam = null" class="w-full mt-4 py-2 bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors">Close</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- QR Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
        <div v-if="qrUser" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click="qrUser = null">
          <div class="absolute inset-0 bg-black/80" />
          <div class="relative bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center" @click.stop>
            <h3 class="text-lg font-bold text-gray-900 mb-1">{{ qrUser.name }}</h3>
            <p class="text-sm text-gray-500 mb-1">{{ qrUser.email || '' }}</p>
            <span :class="qrUser.approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="text-xs font-semibold px-2 py-0.5 rounded mb-4">
              {{ qrUser.approved ? 'APPROVED' : 'NOT APPROVED' }}
            </span>
            <img v-if="qrDataUrl" :src="qrDataUrl" class="w-56 h-56" />
            <p class="text-xs text-gray-400 mt-3">{{ qrUser.id }}</p>
            <button @click="qrUser = null" class="mt-4 px-6 py-2 bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors">Close</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
