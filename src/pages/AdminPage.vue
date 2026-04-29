<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function userAvatar(p: any): string {
  if (p.avatar) return p.avatar
  if (p.github_id) return `https://avatars.githubusercontent.com/${p.github_id.replace(/^@/, '')}`
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || '?')}&background=333&color=fff&size=64`
}

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
    loadData(); loadAnnouncement(); loadSubmissions()
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

const hoveredDay = ref(-1)

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

// Announcements
const announcementText = ref('')
const announcementSaving = ref(false)
const announcementHistory = ref<any[]>([])
async function loadAnnouncement() {
  const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(20)
  announcementHistory.value = data || []
  const active = (data || []).find((a: any) => a.active)
  announcementText.value = active?.content || ''
}
async function pushAnnouncement() {
  const content = announcementText.value.trim()
  if (!content) return
  announcementSaving.value = true
  await supabase.from('announcements').update({ active: false }).eq('active', true)
  await supabase.from('announcements').insert({ content, active: true })
  announcementSaving.value = false
  await loadAnnouncement()
}
async function clearAnnouncement() {
  await supabase.from('announcements').update({ active: false }).eq('active', true)
  announcementText.value = ''
  await loadAnnouncement()
}
async function reactivateAnnouncement(id: string) {
  await supabase.from('announcements').update({ active: false }).eq('active', true)
  await supabase.from('announcements').update({ active: true }).eq('id', id)
  await loadAnnouncement()
}

// Submissions
const submissions = ref<any[]>([])
async function loadSubmissions() {
  const { data } = await supabase.from('submissions').select('*')
  submissions.value = data || []
}

const passwords = {
  admin: 'MLfakcrkTR5xHtqYzHWA-Q',
  export: '6BhrMtDTDEpoMjtLdMYMMg',
  checkin: 'gosim2026checkin',
}

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
const approved = computed(() => profiles.value.filter(p => p.approved).length)
const confirmedYes = computed(() => profiles.value.filter(p => p.confirmed_attendance === 'yes').length)
const confirmedNo = computed(() => profiles.value.filter(p => p.confirmed_attendance === 'no').length)
const confirmedPending = computed(() => profiles.value.filter(p => !p.confirmed_attendance).length)
const noTeam = computed(() => profiles.value.filter(p => !p.team_id).length)
const inTeam = computed(() => profiles.value.filter(p => p.team_id).length)
const lookingForTeam = computed(() => profiles.value.filter(p => p.looking_for_team && !p.team_id).length)
const fullTeams = computed(() => teams.value.filter(t => {
  const members = profiles.value.filter(p => p.team_id === t.id).length
  return members >= (t.max_size || 3)
}).length)
const openTeams = computed(() => totalTeams.value - fullTeams.value)
const modelStats = computed(() => {
  const stats: Record<string, number> = { MiniMax: 0, Kimi: 0, GLM: 0 }
  teams.value.forEach(t => { if (t.model && t.model in stats) stats[t.model]++ })
  return stats
})
const roleStats = computed(() => {
  const stats: Record<string, number> = {}
  profiles.value.forEach(p => { const r = p.role || 'Unset'; stats[r] = (stats[r] || 0) + 1 })
  return Object.entries(stats).sort((a, b) => b[1] - a[1])
})
const recentSignups = computed(() => {
  const now = Date.now()
  return profiles.value.filter(p => now - new Date(p.created_at).getTime() < 24 * 60 * 60 * 1000).length
})

// Field completion rates
const fieldRates = computed(() => {
  const total = profiles.value.length || 1
  const fields = [
    { label: 'Email', key: 'email' },
    { label: 'Role', key: 'role' },
    { label: 'GitHub', key: 'github_id' },
    { label: 'Bio', key: 'bio' },
    { label: 'Discord', key: 'discord' },
    { label: 'Twitter', key: 'twitter' },
    { label: 'Telegram', key: 'telegram' },
    { label: 'LinkedIn', key: 'linkedin' },
  ]
  return fields.map(f => ({
    label: f.label,
    count: profiles.value.filter(p => p[f.key] && p[f.key].trim()).length,
    pct: Math.round(profiles.value.filter(p => p[f.key] && p[f.key].trim()).length / total * 100),
  }))
})

// Daily signups for chart (last 30 days)
const dailySignups = computed(() => {
  const days: Record<string, number> = {}
  profiles.value.forEach(p => {
    const d = (p.created_at || '').slice(0, 10)
    if (d) days[d] = (days[d] || 0) + 1
  })
  const sorted = Object.entries(days).sort((a, b) => a[0].localeCompare(b[0]))
  // Cumulative
  let cum = 0
  return sorted.map(([date, count]) => ({ date, count, cumulative: cum += count }))
})

// Chart dimensions: each day gets 50px width, min 400px
const chartPad = 20
const chartH = 180
const chartWidth = computed(() => Math.max(600, dailySignups.value.length * 80 + chartPad * 2))

const chartPoints = computed(() => {
  const data = dailySignups.value
  if (data.length < 2) return ''
  const maxCum = data[data.length - 1].cumulative
  const w = chartWidth.value
  return data.map((d, i) => {
    const x = chartPad + (i / (data.length - 1)) * (w - chartPad * 2)
    const y = chartH - chartPad - (d.cumulative / maxCum) * (chartH - chartPad * 2)
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
})
const chartBarData = computed(() => {
  const data = dailySignups.value
  if (!data.length) return []
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const w = chartWidth.value
  const barW = Math.max(8, (w - chartPad * 2) / data.length * 0.7)
  return data.map((d, i) => ({
    x: chartPad + (i / Math.max(data.length - 1, 1)) * (w - chartPad * 2) - barW / 2,
    height: (d.count / maxCount) * (chartH - chartPad * 2 - 20),
    y: chartH - chartPad - 16 - (d.count / maxCount) * (chartH - chartPad * 2 - 20),
    barW,
    date: d.date.slice(5),
    count: d.count,
  }))
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

const showExportMenu = ref(false)

function downloadBackup(format: string) {
  showExportMenu.value = false
  const date = new Date().toISOString().slice(0, 10)
  if (format === 'json') {
    const data = { profiles: profiles.value, teams: teams.value, exported_at: new Date().toISOString() }
    downloadFile(JSON.stringify(data, null, 2), `hackathon-backup-${date}.json`, 'application/json')
  } else if (format === 'csv') {
    const teamMap = Object.fromEntries(teams.value.map((t: any) => [t.id, t]))
    const header = ['Name','Email','Role','GitHub','Team','Model','Discord','Telegram','Checked In','Approved','Registered']
    const rows = profiles.value.map((p: any) => {
      const t = teamMap[p.team_id] || {}
      return [p.name, p.email||'', p.role||'', p.github_id||'', t.name||'', t.model||'', p.discord||'', p.telegram||'', p.checked_in?'Yes':'No', p.approved?'Yes':'No', (p.created_at||'').slice(0,10)]
    })
    const csv = [header, ...rows].map(r => r.map((c: string) => `"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n')
    downloadFile(csv, `hackathon-roster-${date}.csv`, 'text/csv')
  } else if (format === 'pdf') {
    exportPDF(date)
  }
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function exportPDF(date: string) {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text('GOSIM Agentic Hackathon 2026 — Participant Roster', 14, 15)
  doc.setFontSize(9)
  doc.setTextColor(128)
  doc.text(`${profiles.value.length} participants · ${teams.value.length} teams · Exported ${date}`, 14, 22)

  const teamMap = Object.fromEntries(teams.value.map((t: any) => [t.id, t]))
  const head = [['#', 'Name', 'Email', 'Role', 'GitHub', 'Team', 'Model', 'Checked In', 'Approved', 'Registered']]
  const body = profiles.value.map((p: any, i: number) => {
    const t = teamMap[p.team_id] || {}
    return [i+1, p.name||'', p.email||'—', p.role||'—', p.github_id||'—', t.name||'—', t.model||'—', p.checked_in?'Yes':'No', p.approved?'Yes':'No', (p.created_at||'').slice(0,10)]
  })
  autoTable(doc, { head, body, startY: 28, styles: { fontSize: 7, cellPadding: 2 }, headStyles: { fillColor: [26, 26, 46] } })
  doc.save(`hackathon-roster-${date}.pdf`)
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

// kickUser removed — use Supabase Dashboard for deletions

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
      <div class="flex flex-wrap items-center gap-2 mb-6 p-3 bg-gray-900 border border-gray-800">
        <span class="text-xs text-gray-500">Links:</span>
        <a href="/admin" class="text-xs px-2 py-1 bg-gray-800 text-amber-400 border border-gray-700">Admin</a>
        <a href="/export" class="text-xs px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 hover:text-white transition-colors">Export</a>
        <a href="/checkin" class="text-xs px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 hover:text-white transition-colors">Check-in</a>
        <a href="/projects" class="text-xs px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 hover:text-white transition-colors">Projects</a>
        <span class="text-gray-700 mx-1">|</span>
        <span class="text-[10px] text-gray-600">admin: <span class="text-gray-400 font-mono select-all">{{ passwords.admin }}</span></span>
        <span class="text-[10px] text-gray-600">export: <span class="text-gray-400 font-mono select-all">{{ passwords.export }}</span></span>
        <span class="text-[10px] text-gray-600">checkin: <span class="text-gray-400 font-mono select-all">{{ passwords.checkin }}</span></span>
      </div>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-white">GOSIM Hackathon Admin</h1>
        <div class="flex gap-2">
          <div class="relative">
            <button @click="showExportMenu = !showExportMenu" class="px-4 py-2 text-sm bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors">Export ▾</button>
            <div v-if="showExportMenu" class="absolute right-0 top-full mt-1 w-36 bg-gray-800 border border-gray-700 shadow-lg z-10">
              <button @click="downloadBackup('json')" class="w-full px-4 py-2 text-sm text-left hover:bg-gray-700">JSON</button>
              <button @click="downloadBackup('csv')" class="w-full px-4 py-2 text-sm text-left hover:bg-gray-700">CSV</button>
              <button @click="downloadBackup('pdf')" class="w-full px-4 py-2 text-sm text-left hover:bg-gray-700">PDF</button>
            </div>
          </div>
          <button @click="loadData" :disabled="loading" class="px-4 py-2 text-sm bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors">
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Stats Row 1: Key Numbers -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div class="bg-gray-900 border border-gray-800 p-4">
          <p class="text-3xl font-bold text-white">{{ totalUsers }}</p>
          <p class="text-xs text-gray-500 uppercase">Registered</p>
          <p class="text-[10px] text-gray-600 mt-1">+{{ recentSignups }} in last 24h</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 p-4">
          <p class="text-3xl font-bold text-white">{{ totalTeams }}</p>
          <p class="text-xs text-gray-500 uppercase">Teams</p>
          <p class="text-[10px] text-gray-600 mt-1">{{ fullTeams }} full · {{ openTeams }} open</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 p-4">
          <p class="text-3xl font-bold text-green-400">{{ checkedIn }}</p>
          <p class="text-xs text-gray-500 uppercase">Checked In</p>
          <p class="text-[10px] text-gray-600 mt-1">{{ totalUsers > 0 ? Math.round(checkedIn / totalUsers * 100) : 0 }}% of registered</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 p-4">
          <p class="text-3xl font-bold text-blue-400">{{ approved }}</p>
          <p class="text-xs text-gray-500 uppercase">Approved</p>
          <p class="text-[10px] text-gray-600 mt-1">{{ totalUsers - approved }} pending</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 p-4">
          <p class="text-3xl font-bold text-emerald-400">{{ confirmedYes }}</p>
          <p class="text-xs text-gray-500 uppercase">RSVP Yes</p>
          <p class="text-[10px] text-gray-600 mt-1">{{ confirmedNo }} no · {{ confirmedPending }} pending</p>
        </div>
      </div>

      <!-- Announcement Editor -->
      <div class="mb-8 p-4 bg-gray-900 border border-amber-500/30">
        <p class="text-xs text-amber-400 uppercase tracking-wider mb-2 font-bold">Live Announcement Banner</p>
        <div class="flex gap-2 mb-3">
          <input v-model="announcementText" type="text" placeholder="Type new announcement..."
            class="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-500 focus:outline-none" />
          <button @click="pushAnnouncement" :disabled="announcementSaving || !announcementText.trim()"
            class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-sm font-bold uppercase tracking-widest disabled:opacity-50">
            {{ announcementSaving ? '...' : 'Push' }}
          </button>
          <button @click="clearAnnouncement"
            class="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm border border-gray-700">
            Clear
          </button>
        </div>
        <div v-if="announcementHistory.length" class="space-y-1">
          <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">History (click to reactivate)</p>
          <button v-for="a in announcementHistory" :key="a.id" @click="reactivateAnnouncement(a.id)"
            class="w-full text-left px-3 py-1.5 text-xs rounded transition-colors flex items-center justify-between gap-2"
            :class="a.active ? 'bg-amber-900/30 text-amber-400 border border-amber-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'">
            <span class="truncate">{{ a.content }}</span>
            <span class="text-[10px] text-gray-600 shrink-0">{{ new Date(a.created_at).toLocaleString() }}</span>
          </button>
        </div>
      </div>

      <!-- Submissions -->
      <div v-if="submissions.length" class="mb-8 p-4 bg-gray-900 border border-gray-800">
        <p class="text-xs text-gray-500 uppercase tracking-wider mb-3 font-bold">Submissions ({{ submissions.length }})</p>
        <div v-for="s in submissions" :key="s.id" class="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
          <div>
            <p class="text-sm font-semibold">{{ teams.find(t => t.id === s.team_id)?.name || s.team_id }}</p>
            <a :href="s.github_url" target="_blank" class="text-xs text-blue-400 hover:underline">{{ s.github_url }}</a>
          </div>
          <span class="text-[10px] text-gray-600">{{ new Date(s.submitted_at).toLocaleString() }}</span>
        </div>
      </div>

      <!-- Stats Row 2: Breakdown -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <div class="bg-gray-900 border border-gray-800 p-4">
          <div class="flex items-baseline gap-3 mb-2">
            <span class="text-xl font-bold text-white">{{ inTeam }}</span>
            <span class="text-xs text-gray-500">in teams</span>
            <span class="text-xl font-bold text-amber-400 ml-auto">{{ noTeam }}</span>
            <span class="text-xs text-gray-500">no team</span>
          </div>
          <div class="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div class="h-full bg-white rounded-full" :style="{ width: totalUsers > 0 ? `${inTeam / totalUsers * 100}%` : '0%' }"></div>
          </div>
          <p class="text-[10px] text-gray-600 mt-1">{{ lookingForTeam }} looking for team</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 p-4">
          <p class="text-xs text-gray-500 uppercase mb-2">Models</p>
          <div class="space-y-1">
            <div v-for="(count, model) in modelStats" :key="model" class="flex items-center gap-2">
              <span class="text-xs text-gray-400 w-14">{{ model }}</span>
              <div class="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full bg-amber-500 rounded-full" :style="{ width: totalTeams > 0 ? `${count / totalTeams * 100}%` : '0%' }"></div>
              </div>
              <span class="text-xs text-white font-bold w-6 text-right">{{ count }}</span>
            </div>
          </div>
        </div>
        <div class="bg-gray-900 border border-gray-800 p-4">
          <p class="text-xs text-gray-500 uppercase mb-2">Roles</p>
          <div class="space-y-0.5">
            <div v-for="[role, count] in roleStats" :key="role" class="flex items-center justify-between">
              <span class="text-[11px] text-gray-400 truncate">{{ role }}</span>
              <span class="text-[11px] text-white font-bold ml-2">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Row 3: Charts & Completion -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <!-- Daily signups chart -->
        <div class="bg-gray-900 border border-gray-800 p-4">
          <p class="text-xs text-gray-500 uppercase mb-3">Registration Timeline</p>
          <div class="relative overflow-x-auto" ref="chartScroll">
            <svg v-if="dailySignups.length" :viewBox="`0 0 ${chartWidth} 200`" :width="chartWidth" height="200" class="block">
              <!-- Bars (daily count) -->
              <rect v-for="(d, i) in chartBarData" :key="'bar-'+i"
                :x="d.x" :y="d.y" :width="d.barW" :height="d.height"
                :fill="hoveredDay === i ? '#f59e0b' : '#f59e0b'" :opacity="hoveredDay === i ? 0.7 : 0.25" rx="2"
                class="cursor-pointer transition-opacity duration-150"
                @mouseenter="hoveredDay = i" @mouseleave="hoveredDay = -1" />
              <!-- Cumulative line -->
              <path :d="chartPoints" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              <!-- Dots -->
              <circle v-for="(d, i) in dailySignups" :key="'dot-'+i"
                :cx="chartPad + (i / Math.max(dailySignups.length - 1, 1)) * (chartWidth - chartPad * 2)"
                :cy="chartH - chartPad - (d.cumulative / dailySignups[dailySignups.length-1].cumulative) * (chartH - chartPad * 2)"
                :r="hoveredDay === i ? 6 : 3.5" :fill="hoveredDay === i ? '#fff' : '#f59e0b'" :opacity="hoveredDay === i ? 1 : 0.7"
                :stroke="hoveredDay === i ? '#f59e0b' : 'none'" :stroke-width="hoveredDay === i ? 2 : 0"
                class="cursor-pointer transition-all duration-150"
                @mouseenter="hoveredDay = i" @mouseleave="hoveredDay = -1" />
              <!-- X-axis date labels -->
              <text v-for="(d, i) in dailySignups" :key="'lbl-'+i"
                :x="chartPad + (i / Math.max(dailySignups.length - 1, 1)) * (chartWidth - chartPad * 2)"
                :y="chartH - 2"
                text-anchor="middle" class="text-[10px]" fill="#555">{{ d.date.slice(5) }}</text>
            </svg>
            <!-- Hover tooltip -->
            <div v-if="hoveredDay >= 0 && hoveredDay < dailySignups.length"
              class="absolute top-2 bg-gray-800 border border-gray-600 px-3 py-1.5 rounded shadow-lg pointer-events-none z-10"
              :style="{ left: `${chartPad + (hoveredDay / Math.max(dailySignups.length - 1, 1)) * (chartWidth - chartPad * 2)}px`, transform: 'translateX(-50%)' }">
              <p class="text-xs text-white font-bold">{{ dailySignups[hoveredDay].date }}</p>
              <p class="text-[10px] text-amber-400">+{{ dailySignups[hoveredDay].count }} new</p>
              <p class="text-[10px] text-gray-400">{{ dailySignups[hoveredDay].cumulative }} total</p>
            </div>
          </div>
        </div>

        <!-- Field completion rates -->
        <div class="bg-gray-900 border border-gray-800 p-4">
          <p class="text-xs text-gray-500 uppercase mb-3">Profile Completion</p>
          <div class="space-y-2">
            <div v-for="f in fieldRates" :key="f.label" class="flex items-center gap-2">
              <span class="text-[11px] text-gray-400 w-16 shrink-0">{{ f.label }}</span>
              <div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500"
                  :class="f.pct >= 50 ? 'bg-green-500' : f.pct >= 20 ? 'bg-amber-500' : 'bg-red-500'"
                  :style="{ width: `${f.pct}%` }"></div>
              </div>
              <span class="text-[11px] text-gray-400 w-16 text-right">{{ f.count }}/{{ totalUsers }} <span class="text-gray-600">({{ f.pct }}%)</span></span>
            </div>
          </div>
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
                <th class="py-3 px-3 text-center">RSVP</th>
                <th class="py-3 px-3">Registered</th>
                <th class="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredUsers" :key="p.id" class="border-b border-gray-800/50 hover:bg-gray-900/50">
                <td class="py-3 px-3">
                  <div class="flex items-center gap-2">
                    <img :src="userAvatar(p)"
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
                <td class="py-3 px-3 text-center">
                  <span v-if="p.confirmed_attendance === 'yes'" class="text-emerald-400 text-xs font-bold">YES</span>
                  <span v-else-if="p.confirmed_attendance === 'no'" class="text-red-400 text-xs font-bold">NO</span>
                  <span v-else class="text-gray-600 text-xs">—</span>
                </td>
                <td class="py-3 px-3 text-gray-500 text-xs">{{ new Date(p.created_at).toLocaleDateString() }}</td>
                <td class="py-3 px-3">
                  <div class="flex gap-2">
                    <button @click="showQr(p)" class="text-xs text-amber-400 hover:text-amber-300">QR</button>
                    <button @click="openEdit(p)" class="text-xs text-blue-400 hover:text-blue-300">Edit</button>
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
                  <img :src="userAvatar(m)" class="w-8 h-8 rounded-full object-cover" />
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
