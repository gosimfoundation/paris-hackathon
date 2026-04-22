<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const authed = ref(false)
const passInput = ref('')
const rows = ref<any[]>([])
const loading = ref(false)

async function sha256hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function checkPass() {
  const hash = await sha256hex(passInput.value)
  const { data } = await supabase.from('admin_config').select('value').eq('key', 'admin_pass_hash').single()
  if (data && data.value === hash) {
    authed.value = true
    await loadData()
  } else {
    alert('Wrong password')
  }
}

async function loadData() {
  loading.value = true
  const { data: profiles } = await supabase.from('profiles').select('name, email, team_id').not('team_id', 'is', null)
  const { data: teams } = await supabase.from('teams').select('id, name, model')
  const teamMap = Object.fromEntries((teams || []).map(t => [t.id, t]))
  rows.value = (profiles || []).map(p => ({
    name: p.name || '',
    email: p.email || '',
    team: teamMap[p.team_id]?.name || '',
    model: teamMap[p.team_id]?.model || '',
  })).sort((a, b) => a.team.localeCompare(b.team) || a.name.localeCompare(b.name))
  loading.value = false
}

function exportCSV() {
  const header = 'Name,Email,Team,Model'
  const lines = rows.value.map(r => `"${r.name}","${r.email}","${r.team}","${r.model}"`)
  const csv = [header, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `gosim-teams-${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(rows.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `gosim-teams-${new Date().toISOString().slice(0,10)}.json`
  a.click(); URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white flex flex-col items-center py-20 px-4">
    <div v-if="!authed" class="w-full max-w-sm mt-20">
      <h1 class="text-2xl font-bold mb-6 text-center">Export — Team Members</h1>
      <form @submit.prevent="checkPass" class="space-y-4">
        <input v-model="passInput" type="password" placeholder="Admin password" autofocus
          class="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none" />
        <button type="submit" class="w-full py-3 bg-gray-800 text-white font-bold uppercase tracking-widest hover:bg-gray-700 transition-colors">Enter</button>
      </form>
    </div>

    <div v-else class="w-full max-w-4xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">Team Members</h1>
          <p class="text-sm text-gray-500">{{ rows.length }} people in teams</p>
        </div>
        <div class="flex gap-3">
          <button @click="exportCSV" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-sm font-bold uppercase tracking-widest transition-colors">CSV</button>
          <button @click="exportJSON" class="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-sm font-bold uppercase tracking-widest transition-colors">JSON</button>
        </div>
      </div>

      <div v-if="loading" class="text-gray-500 text-center py-12">Loading...</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-800">
            <th class="py-3 px-3">#</th>
            <th class="py-3 px-3">Name</th>
            <th class="py-3 px-3">Email</th>
            <th class="py-3 px-3">Team</th>
            <th class="py-3 px-3">Model</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in rows" :key="i" class="border-b border-gray-800/50 hover:bg-gray-900/50">
            <td class="py-2 px-3 text-gray-600">{{ i + 1 }}</td>
            <td class="py-2 px-3">{{ r.name }}</td>
            <td class="py-2 px-3 text-gray-400">{{ r.email }}</td>
            <td class="py-2 px-3 text-gray-400">{{ r.team }}</td>
            <td class="py-2 px-3 text-gray-500">{{ r.model }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
