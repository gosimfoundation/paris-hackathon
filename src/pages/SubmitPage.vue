<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useTeams } from '../composables/useTeams'
import { supabase } from '../lib/supabase'

const { user, isLoggedIn } = useAuth()
const { teams, loading: teamsLoading } = useTeams()

const githubUrl = ref('')
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')
const existingSubmission = ref<any>(null)

const myTeam = computed(() => teams.value.find(t => t.members.some(m => m.id === user.value?.id)))
const isLeader = computed(() => myTeam.value?.leaderId === user.value?.id)
// Load existing submission when team becomes available
watch(myTeam, async (team) => {
  if (!team) return
  const { data } = await supabase.from('submissions').select('*').eq('team_id', team.id).single()
  if (data) {
    existingSubmission.value = data
    githubUrl.value = data.github_url
  }
}, { immediate: true })

onMounted(async () => {
  if (!myTeam.value) return
  const { data } = await supabase.from('submissions').select('*').eq('team_id', myTeam.value.id).single()
  if (data) {
    existingSubmission.value = data
    githubUrl.value = data.github_url
  }
})

async function submit() {
  if (!myTeam.value || !user.value) return
  const url = githubUrl.value.trim()
  if (!url.startsWith('https://github.com/')) { error.value = 'Must be a GitHub URL (https://github.com/...)'; return }
  error.value = ''
  submitting.value = true
  const { error: dbErr } = await supabase.from('submissions').upsert({
    team_id: myTeam.value.id,
    github_url: url,
    submitted_by: user.value.id,
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'team_id' })
  submitting.value = false
  if (dbErr) { error.value = dbErr.message; return }
  submitted.value = true
  existingSubmission.value = { github_url: url }
}
</script>

<template>
  <div class="min-h-screen bg-bg-primary flex flex-col items-center py-24 px-4">
    <div class="w-full max-w-lg">
      <router-link to="/" class="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors mb-8">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back
      </router-link>

      <h1 class="text-3xl font-bold text-text-primary mb-2">Submit Your Project</h1>
      <p class="text-sm text-text-secondary mb-8">Provide your GitHub repository link. Make sure your repo includes a README, demo video link, and slides/presentation.</p>

      <template v-if="!isLoggedIn && !teamsLoading">
        <div class="p-6 bg-bg-secondary border border-border text-center">
          <p class="text-text-secondary mb-4">Please log in to submit.</p>
        </div>
      </template>

      <template v-else-if="teamsLoading">
        <div class="p-6 bg-bg-secondary border border-border text-center">
          <p class="text-text-secondary">Loading...</p>
        </div>
      </template>

      <template v-else-if="!myTeam">
        <div class="p-6 bg-bg-secondary border border-border text-center">
          <p class="text-text-secondary">You need to join or create a team before submitting.</p>
          <a href="/#teams" class="inline-block mt-4 px-6 py-2 bg-btn-bg text-btn-text text-sm font-bold uppercase tracking-widest hover:bg-btn-hover transition-colors">Go to Teams</a>
        </div>
      </template>

      <template v-else-if="!isLeader">
        <div class="p-6 bg-bg-secondary border border-border text-center">
          <p class="text-text-secondary">Only the team leader can submit. Ask <strong class="text-text-primary">{{ myTeam?.members.find(m => m.id === myTeam?.leaderId)?.name || 'your leader' }}</strong> to submit.</p>
        </div>
      </template>

      <template v-else>
        <div class="p-6 bg-bg-secondary border border-border">
          <div class="mb-4">
            <p class="text-xs text-text-muted uppercase tracking-wider mb-1">Team</p>
            <p class="text-lg font-bold text-text-primary">{{ myTeam.name }}</p>
          </div>

          <div v-if="existingSubmission && !submitted" class="mb-4 p-3 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-sm">
            Already submitted: <a :href="existingSubmission.github_url" target="_blank" class="underline">{{ existingSubmission.github_url }}</a>. You can update it below.
          </div>

          <div v-if="submitted" class="mb-4 p-3 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-sm">
            Submitted! You can update anytime before the deadline.
          </div>

          <label class="block text-xs text-text-muted uppercase tracking-wider mb-2">GitHub Repository URL</label>
          <input v-model="githubUrl" type="url" placeholder="https://github.com/your-org/your-project"
            class="w-full px-4 py-3 bg-input-bg border border-input-border text-text-primary placeholder-text-muted text-sm focus:border-accent focus:outline-none mb-2" />
          <p class="text-[11px] text-text-muted mb-4">Your repo should include: README, demo video link, and slides/presentation.</p>

          <p v-if="error" class="text-sm text-red-400 mb-3">{{ error }}</p>

          <button @click="submit" :disabled="submitting || !githubUrl.trim()"
            class="w-full py-3 bg-btn-bg text-btn-text text-sm font-bold uppercase tracking-widest hover:bg-btn-hover disabled:opacity-50 transition-colors">
            {{ submitting ? 'Submitting...' : existingSubmission ? 'Update Submission' : 'Submit' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
