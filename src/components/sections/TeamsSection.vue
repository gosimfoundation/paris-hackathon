<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTeams, type Team } from '../../composables/useTeams'

const API_BASE = ''

const {
  teams, totalMembers, spotsLeft, isFull, progress,
  modelStats, loading, error, lastUpdated, fetchTeams, registerTeam, joinTeam
} = useTeams()

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
const modalMode = ref<'create' | 'join'>('create')
const joiningTeam = ref<Team | null>(null)

const teamName = ref('')
const contactEmail = ref('')
const githubRepo = ref('')
const memberCount = ref(1)
const members = ref([{ name: '', role: '', githubId: '' }])
const selectedTrack = ref('')
const selectedModel = ref('')
const projectIdea = ref('')
const teamAvatar = ref('')

const joinName = ref('')
const joinRole = ref('')
const joinEmail = ref('')
const joinGithubId = ref('')

const tracks = [
  'AI Hardware / IoT',
  'AI for Education',
  'Human–Computer Interaction',
  'Business Process Automation',
  'Info Retrieval & Knowledge Agents',
]

const roleOptions = [
  'AI Engineer', 'Full-Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Researcher', 'Designer', 'Product Manager', 'Student', 'Startup Founder', 'Other',
]

const modelOptions = [
  { id: 'GLM', label: 'GLM', icon: '/sponsors/zhipu.svg' },
  { id: 'MiniMax', label: 'MiniMax', icon: '/sponsors/minimax.webp' },
  { id: 'Kimi', label: 'Kimi', icon: '/sponsors/kimi.svg' },
]

const avatarPresets = [
  { id: 'glm', label: 'GLM', src: '/sponsors/zhipu.svg' },
  { id: 'minimax', label: 'MiniMax', src: '/sponsors/minimax.webp' },
  { id: 'kimi', label: 'Kimi', src: '/sponsors/kimi.svg' },
]

watch(memberCount, (n) => {
  while (members.value.length < n) members.value.push({ name: '', role: '', githubId: '' })
  while (members.value.length > n) members.value.pop()
})

function selectModel(id: string) {
  selectedModel.value = selectedModel.value === id ? '' : id
}

function defaultAvatar(): string {
  return '/default-avatar.svg'
}

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

function openCreateModal() {
  modalMode.value = 'create'
  teamName.value = ''
  contactEmail.value = ''
  githubRepo.value = ''
  memberCount.value = 1
  members.value = [{ name: '', role: '', githubId: '' }]
  selectedTrack.value = ''
  selectedModel.value = ''
  projectIdea.value = ''
  teamAvatar.value = ''
  error.value = ''
  showModal.value = true
}

function openJoinModal(team: Team) {
  if (team.members.length >= 3) return
  modalMode.value = 'join'
  joiningTeam.value = team
  joinName.value = ''
  joinRole.value = ''
  joinEmail.value = ''
  joinGithubId.value = ''
  error.value = ''
  showModal.value = true
}

async function submitCreate() {
  const ok = await registerTeam({
    name: teamName.value,
    contactEmail: contactEmail.value,
    githubRepo: githubRepo.value,
    track: selectedTrack.value,
    members: members.value.slice(0, memberCount.value),
    models: selectedModel.value ? [selectedModel.value] : [],
    projectIdea: projectIdea.value,
    avatar: teamAvatar.value || defaultAvatar(),
  })
  if (ok) {
    showModal.value = false
    showToast(`Team "${teamName.value}" registered! Good luck in Paris! 🎉`)
  }
}

async function submitJoin() {
  if (!joiningTeam.value) return
  const teamNameJoined = joiningTeam.value.name
  const ok = await joinTeam(joiningTeam.value.id, {
    name: joinName.value,
    role: joinRole.value,
    email: joinEmail.value,
    githubId: joinGithubId.value,
  })
  if (ok) {
    showModal.value = false
    showToast(`You've joined "${teamNameJoined}"! See you in Paris! 🎉`)
  }
}

function getModelIcon(model: string) {
  return modelOptions.find((o) => o.id === model)?.icon
}

function trackShort(track: string) {
  return track.length > 20 ? track.slice(0, 18) + '...' : track
}

function canJoin(team: Team) {
  return team.members.length < 3 && !isFull.value
}

function teamVibe(count: number) {
  if (count === 1) return { label: 'Fly Solo', color: 'text-amber-600' }
  if (count === 2) return { label: 'Dynamic Duo', color: 'text-blue-600' }
  return { label: 'Three Musketeers', color: 'text-accent' }
}

function repoName(url: string) {
  const m = url.match(/github\.com\/([^/]+\/[^/]+)/)
  return m ? m[1] : url.replace(/https?:\/\//, '')
}

const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-accent/50 focus:outline-none transition-colors text-sm'
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
      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full text-sm font-semibold shadow-lg backdrop-blur-xl" :class="toast.type === 'success' ? 'bg-accent/90 text-gray-900' : 'bg-red-600 text-gray-900'">
        {{ toast.msg }}
      </div>
    </Transition>
  </Teleport>

  <section id="teams" class="relative py-32 bg-bg-secondary overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-12 reveal">
        <h2 class="text-4xl md:text-5xl font-bold">
          Registered <span class="heading-serif accent-text">Teams</span>
        </h2>
        <p class="text-text-secondary mt-3 text-sm">Click on a team to join, or create your own.</p>
        <div class="flex items-center justify-center gap-3 mt-3">
          <span class="text-xs text-text-secondary">Updated {{ timeAgo(lastUpdated) }}</span>
          <button @click="fetchTeams" class="text-xs text-blue-600 hover:text-gray-900 transition-colors flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="max-w-2xl mx-auto mb-12 reveal">
        <div class="flex justify-between text-sm mb-3">
          <span class="text-text-secondary">
            <span class="text-gray-900 font-bold">{{ teams.length }}</span> teams ·
            <span class="text-gray-900 font-bold">{{ totalMembers }}</span> participants
          </span>
          <span class="text-text-secondary">
            <span class="text-amber-600 font-bold">{{ spotsLeft }}</span> spots left
          </span>
        </div>
        <div class="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
          <div class="h-full bg-gray-900 rounded-full transition-all duration-1000" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="flex justify-center gap-6 mt-6">
          <div v-for="(count, model) in modelStats" :key="model" class="flex items-center gap-2">
            <img v-if="getModelIcon(model as string)" :src="getModelIcon(model as string)" class="h-5 w-auto max-w-[60px] object-contain" :title="(model as string)" />
            <span class="text-sm font-semibold text-gray-900">{{ count }}</span>
          </div>
        </div>
      </div>

      <div class="text-center mb-12 reveal">
        <button @click="openCreateModal" :disabled="isFull" class="px-8 py-4 bg-accent text-gray-900 text-sm font-semibold tracking-widest uppercase hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isFull ? 'Registration Closed' : 'Register Your Team' }}
        </button>
      </div>

      <!-- Teams grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="team in teams" :key="team.id" @click="canJoin(team) && openJoinModal(team)" class="glass-card p-5 transition-all group" :class="canJoin(team) ? 'cursor-pointer hover:scale-[1.03] hover:border-accent-cyan/40' : ''">
          <div class="flex items-center gap-3 mb-2">
            <img :src="team.avatar || '/default-avatar.svg'" class="w-10 h-10 rounded-full shrink-0 object-cover border border-gray-200" />
            <div class="min-w-0">
              <h3 class="font-bold text-gray-900 text-sm truncate group-hover:text-accent transition-colors">{{ team.name }}</h3>
              <p class="text-text-secondary text-xs truncate">{{ trackShort(team.track) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 font-semibold" :class="teamVibe(team.members.length).color">{{ teamVibe(team.members.length).label }}</span>
            <span v-if="canJoin(team)" class="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">+{{ 3 - team.members.length }} open</span>
          </div>

          <div class="space-y-1.5">
            <div v-for="member in team.members" :key="member.name" class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
              <span class="text-xs text-gray-700 truncate">{{ member.name }}</span>
              <a v-if="member.githubId" :href="(member.githubId.includes('gitlab') ? 'https://gitlab.com/' : 'https://github.com/') + member.githubId.replace(/^@/, '')" target="_blank" @click.stop class="text-[10px] text-text-secondary hover:text-blue-600 transition-colors truncate">@{{ member.githubId.replace(/^@/, '') }}</a>
            </div>
          </div>

          <a v-if="team.githubRepo" :href="team.githubRepo" target="_blank" @click.stop class="inline-flex items-center gap-1 mt-2 text-[11px] text-text-secondary hover:text-blue-600 transition-colors">
            <svg class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            {{ repoName(team.githubRepo) }}
          </a>

          <p v-if="team.projectIdea" class="text-[11px] text-text-secondary mt-2 line-clamp-2 italic">"{{ team.projectIdea }}"</p>

          <div v-if="team.models?.length" class="flex gap-1.5 mt-3">
            <img v-for="model in team.models" :key="model" :src="getModelIcon(model) || ''" :alt="model" :title="model" class="w-4 h-4 rounded opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      <div v-if="!teams.length" class="text-center py-16">
        <p class="text-text-secondary">No teams registered yet. Be the first!</p>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showModal = false"></div>

          <div class="relative w-full max-w-lg glass-card p-8 max-h-[90vh] overflow-y-auto border-accent-red/20">
            <button @click="showModal = false" class="absolute top-4 right-4 text-text-secondary hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            <!-- CREATE MODE -->
            <template v-if="modalMode === 'create'">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Register Your Team</h3>
              <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{{ error }}</div>

              <form @submit.prevent="submitCreate" class="space-y-5">
                <div>
                  <label class="block text-sm text-text-secondary mb-1">Team Name <span class="text-accent">*</span></label>
                  <input v-model="teamName" type="text" required placeholder="e.g. AgentX" :class="inputClass" />
                </div>
                <!-- Team Avatar -->
                <div>
                  <label class="block text-sm text-text-secondary mb-2">Team Avatar</label>
                  <div class="flex items-center gap-3">
                    <div class="w-14 h-14 rounded-full border-2 border-gray-200 overflow-hidden shrink-0">
                      <img :src="teamAvatar || defaultAvatar()" class="w-full h-full object-cover" />
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <button v-for="preset in avatarPresets" :key="preset.id" type="button" @click="teamAvatar = preset.src" class="w-9 h-9 rounded-full border-2 overflow-hidden transition-all" :class="teamAvatar === preset.src ? 'border-accent-red scale-110' : 'border-gray-200 hover:border-gray-300'">
                        <img :src="preset.src" class="w-full h-full object-cover" />
                      </button>
                      <label class="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center cursor-pointer transition-all overflow-hidden" :class="teamAvatar && !avatarPresets.some(p => p.src === teamAvatar) ? 'border-accent-red' : ''">
                        <img v-if="teamAvatar && !avatarPresets.some(p => p.src === teamAvatar)" :src="teamAvatar" class="w-full h-full object-cover" />
                        <span v-else class="text-gray-400 text-sm">+</span>
                        <input type="file" accept="image/*" class="hidden" @change="uploadTeamAvatar($event)" />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1">Contact Email <span class="text-accent">*</span></label>
                  <input v-model="contactEmail" type="email" required placeholder="team-lead@example.com" :class="inputClass" />
                  <p class="text-xs text-text-secondary mt-1">Not displayed publicly.</p>
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1">GitHub Repository <span class="text-accent">*</span></label>
                  <input v-model="githubRepo" type="url" required placeholder="https://github.com/your-org/project" :class="inputClass" />
                </div>

                <div>
                  <label class="block text-sm text-text-secondary mb-1">Team Size <span class="text-accent">*</span></label>
                  <div class="flex gap-3">
                    <button v-for="n in 3" :key="n" type="button" @click="memberCount = n" class="flex-1 py-2.5 rounded-lg border font-semibold transition-all flex flex-col items-center gap-0.5" :class="memberCount === n ? 'bg-accent/10 border-accent/50 text-gray-900' : 'border-gray-200 text-text-secondary hover:border-gray-300'">
                      <span>{{ n }}</span>
                      <span class="text-[10px] font-normal opacity-70">{{ teamVibe(n).label }}</span>
                    </button>
                  </div>
                </div>

                <!-- Members -->
                <div>
                  <label class="block text-sm text-text-secondary mb-2">Members <span class="text-accent">*</span></label>
                  <div class="space-y-3">
                    <div v-for="(_, i) in members.slice(0, memberCount)" :key="i" class="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p class="text-xs text-text-secondary mb-2">Member {{ i + 1 }} {{ i === 0 ? '(Team Lead)' : '' }}</p>
                      <input v-model="members[i].name" type="text" required placeholder="Name" :class="inputClass" />
                      <input v-model="members[i].githubId" type="text" required placeholder="GitHub or GitLab username (required)" :class="[inputClass, 'mt-2']" />
                      <select v-model="members[i].role" :class="[inputClass, 'mt-2 appearance-none']">
                        <option value="" class="bg-bg-primary text-text-secondary">Role (optional)</option>
                        <option v-for="r in roleOptions" :key="r" :value="r" class="bg-bg-primary">{{ r }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-text-secondary mb-1">Track <span class="text-accent">*</span></label>
                  <select v-model="selectedTrack" required :class="[inputClass, 'appearance-none']">
                    <option value="" disabled class="bg-bg-primary">Select a track</option>
                    <option v-for="t in tracks" :key="t" :value="t" class="bg-bg-primary">{{ t }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm text-text-secondary mb-2">AI Models You Plan to Use</label>
                  <div class="flex gap-3">
                    <button v-for="model in modelOptions" :key="model.id" type="button" @click="selectModel(model.id)" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all" :class="selectedModel === model.id ? 'bg-accent/10 border-accent/50 text-gray-900' : 'border-gray-200 text-text-secondary hover:border-gray-300'">
                      <img :src="model.icon" class="w-5 h-5 rounded" />
                      <span class="text-sm font-semibold">{{ model.label }}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-text-secondary mb-1">Project Idea <span class="text-text-secondary text-xs">(optional)</span></label>
                  <textarea v-model="projectIdea" rows="2" placeholder="Briefly describe what you plan to build..." :class="[inputClass, 'resize-none']"></textarea>
                </div>

                <button type="submit" :disabled="loading" class="w-full py-4 bg-accent text-gray-900 text-sm font-semibold tracking-widest uppercase hover:bg-accent-hover transition-colors disabled:opacity-50">
                  {{ loading ? 'Registering...' : 'Submit Registration' }}
                </button>
              </form>
            </template>

            <!-- JOIN MODE -->
            <template v-else-if="modalMode === 'join' && joiningTeam">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Join Team</h3>
              <p class="text-accent font-semibold mb-1">{{ joiningTeam.name }}</p>
              <p class="text-text-secondary text-sm mb-6">{{ joiningTeam.track }} · {{ joiningTeam.members.length }}/3 members</p>

              <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{{ error }}</div>

              <form @submit.prevent="submitJoin" class="space-y-5">
                <div>
                  <label class="block text-sm text-text-secondary mb-1">Your Name <span class="text-accent">*</span></label>
                  <input v-model="joinName" type="text" required placeholder="Your name" :class="inputClass" />
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1">GitHub / GitLab Username <span class="text-accent">*</span></label>
                  <input v-model="joinGithubId" type="text" required placeholder="e.g. octocat" :class="inputClass" />
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1">Your Email <span class="text-accent">*</span></label>
                  <input v-model="joinEmail" type="email" required placeholder="your@email.com" :class="inputClass" />
                  <p class="text-xs text-text-secondary mt-1">Not displayed publicly.</p>
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1">Your Role</label>
                  <select v-model="joinRole" :class="[inputClass, 'appearance-none']">
                    <option value="" class="bg-bg-primary text-text-secondary">Select role (optional)</option>
                    <option v-for="r in roleOptions" :key="r" :value="r" class="bg-bg-primary">{{ r }}</option>
                  </select>
                </div>

                <button type="submit" :disabled="loading" class="w-full py-4 bg-accent text-gray-900 text-sm font-semibold tracking-widest uppercase hover:bg-accent-hover transition-colors disabled:opacity-50">
                  {{ loading ? 'Joining...' : 'Join This Team' }}
                </button>
              </form>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
