<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const projects = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const { data: subs } = await supabase.from('submissions').select('team_id, github_url, submitted_at')
  const { data: teams } = await supabase.from('teams').select('id, name, model, avatar, project_idea')
  const { data: profiles } = await supabase.from('profiles').select('name, avatar, github_id, team_id')

  const teamMap = Object.fromEntries((teams || []).map(t => [t.id, t]))
  const memberMap: Record<string, any[]> = {}
  for (const p of profiles || []) {
    if (p.team_id) {
      if (!memberMap[p.team_id]) memberMap[p.team_id] = []
      memberMap[p.team_id].push(p)
    }
  }

  projects.value = (subs || []).map(s => ({
    ...s,
    team: teamMap[s.team_id],
    members: memberMap[s.team_id] || [],
  })).sort((a, b) => (a.team?.name || '').localeCompare(b.team?.name || ''))
  loading.value = false
})

function avatarUrl(p: any): string {
  if (p.avatar) return p.avatar
  if (p.github_id) return `https://avatars.githubusercontent.com/${p.github_id}`
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || '?')}&background=1f2937&color=fff&size=64`
}
</script>

<template>
  <div class="min-h-screen bg-bg-primary py-24 px-4">
    <div class="max-w-4xl mx-auto">
      <router-link to="/" class="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors mb-8">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back
      </router-link>

      <h1 class="text-3xl font-bold text-text-primary mb-2">Submitted Projects</h1>
      <p class="text-sm text-text-secondary mb-8">{{ projects.length }} projects submitted</p>

      <div v-if="loading" class="text-center text-text-muted py-12">Loading...</div>
      <div v-else-if="projects.length === 0" class="text-center text-text-muted py-12">No projects submitted yet.</div>
      <div v-else class="space-y-4">
        <a v-for="p in projects" :key="p.team_id" :href="p.github_url" target="_blank" rel="noopener"
          class="block p-5 bg-bg-secondary border border-border-subtle hover:border-accent/50 transition-colors">
          <div class="flex items-start gap-4">
            <img v-if="p.team?.avatar" :src="p.team.avatar" class="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h2 class="text-lg font-bold text-text-primary truncate">{{ p.team?.name || 'Unknown team' }}</h2>
                <span v-if="p.team?.model" class="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded shrink-0">{{ p.team.model }}</span>
              </div>
              <p v-if="p.team?.project_idea" class="text-sm text-text-secondary mb-2 line-clamp-2">{{ p.team.project_idea }}</p>
              <p class="text-xs text-accent truncate mb-2">{{ p.github_url }}</p>
              <div class="flex items-center gap-1">
                <img v-for="m in p.members.slice(0, 5)" :key="m.name" :src="avatarUrl(m)" :title="m.name"
                  class="w-6 h-6 rounded-full object-cover border border-border -ml-1 first:ml-0" />
                <span class="text-[10px] text-text-muted ml-1">{{ p.members.length }} member{{ p.members.length > 1 ? 's' : '' }}</span>
              </div>
            </div>
            <svg class="w-5 h-5 text-text-muted shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
