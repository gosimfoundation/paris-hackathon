<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTeams } from '../../composables/useTeams'
import type { User } from '../../composables/useAuth'

const { users, teams, fetchTeams } = useTeams()

// Always fetch on mount to ensure fresh data
onMounted(() => fetchTeams())

const tracks = [
  { id: 'agents-meet-apps', label: 'Agents Meet Apps', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'claws-octos', label: 'Claws & Octos', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'hai', label: 'Human-Agent Interaction', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122' },
  { id: 'education', label: 'Education', icon: 'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5' },
  { id: 'content-remix', label: 'Content Remixing', icon: 'M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z' },
  { id: 'productivity', label: 'Productivity', icon: 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5' },
  { id: 'agents-voices', label: 'Agents with Voices', icon: 'M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z' },
]

const modelOptions = [
  { id: 'GLM', label: 'GLM', icon: '/sponsors/zhipu-v2.png' },
  { id: 'MiniMax', label: 'MiniMax', icon: '/sponsors/minimax.png' },
  { id: 'Kimi', label: 'Kimi', icon: '/sponsors/kimi.png' },
]

const totalRegistered = computed(() => users.value.length)
const lookingForTeamCount = computed(() => users.value.filter(u => u.lookingForTeam).length)

function getTrackIcon(trackId: string) {
  return tracks.find(t => t.id === trackId || t.label === trackId)?.icon
}

function getTrackLabel(trackId: string) {
  return tracks.find(t => t.id === trackId || t.label === trackId)?.label || trackId
}

function getModelIcon(model: string) {
  return modelOptions.find(o => o.id === model)?.icon
}

function getUserTeam(user: User) {
  if (!user.teamId) return null
  return teams.value.find(t => t.id === user.teamId) || null
}

// User detail modal
const showUserModal = ref(false)
const viewingUser = ref<User | null>(null)

function openUserModal(user: User) {
  viewingUser.value = user
  showUserModal.value = true
}
</script>

<template>
  <section id="participants" class="relative py-32 bg-bg-primary overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center mb-12 reveal">
        <h2 class="text-4xl md:text-5xl heading-serif">
          All <span class="heading-serif accent-text">Participants</span>
        </h2>
        <p class="text-text-secondary mt-3 text-sm">Everyone registered for the hackathon</p>

        <!-- Stats -->
        <div class="flex items-center justify-center gap-6 mt-4">
          <span class="text-sm text-text-secondary">
            <span class="text-gray-900 font-bold">{{ totalRegistered }}</span> registered
          </span>
          <span class="text-sm text-text-secondary">
            <span class="text-emerald-600 font-bold">{{ lookingForTeamCount }}</span> looking for team
          </span>
        </div>
      </div>

      <!-- User card grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="user in users"
          :key="user.id"
          @click="openUserModal(user)"
          class="glass-card p-4 transition-all group relative cursor-pointer hover:border-accent-cyan/40 flex flex-col"
        >
          <!-- Avatar + name + role -->
          <div class="flex items-center gap-3 mb-2">
            <img :src="user.avatar || '/default-avatar.svg'" class="w-10 h-10 rounded-full shrink-0 object-cover border border-gray-200" />
            <div class="min-w-0">
              <h3 class="font-bold text-gray-900 text-sm truncate group-hover:text-accent transition-colors">{{ user.name }}</h3>
              <p v-if="user.role" class="text-[11px] text-text-secondary truncate">{{ user.role }}</p>
            </div>
          </div>

          <!-- GitHub -->
          <a
            v-if="user.githubId"
            :href="'https://github.com/' + user.githubId.replace(/^@/, '')"
            target="_blank"
            @click.stop
            class="inline-flex items-center gap-1 text-[11px] text-text-secondary hover:text-blue-600 transition-colors mb-2 truncate"
          >
            <svg class="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            @{{ user.githubId.replace(/^@/, '') }}
          </a>

          <!-- Theme badges -->
          <div v-if="user.themes?.length" class="flex flex-wrap gap-1 mb-2">
            <span
              v-for="theme in user.themes"
              :key="theme"
              class="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
              :title="getTrackLabel(theme)"
            >
              <svg v-if="getTrackIcon(theme)" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" :d="getTrackIcon(theme)" /></svg>
            </span>
          </div>

          <!-- Model icon -->
          <div v-if="user.preferredModel" class="flex items-center gap-1 mb-2">
            <img v-if="getModelIcon(user.preferredModel)" :src="getModelIcon(user.preferredModel)" :alt="user.preferredModel" :title="user.preferredModel" class="w-4 h-4 rounded opacity-60 group-hover:opacity-100 transition-opacity" />
            <span class="text-[10px] text-text-secondary">{{ user.preferredModel }}</span>
          </div>

          <!-- Bottom tags -->
          <div class="mt-auto flex flex-wrap items-center gap-1.5">
            <span v-if="user.lookingForTeam" class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Looking for Team</span>
            <span v-if="getUserTeam(user)" class="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 truncate max-w-[120px]">{{ getUserTeam(user)!.name }}</span>
          </div>
        </div>
      </div>

      <div v-if="!users.length" class="text-center py-16">
        <p class="text-text-secondary">No participants yet. Be the first to register!</p>
      </div>
    </div>

    <!-- User detail modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showUserModal && viewingUser" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showUserModal = false"></div>

          <div class="relative w-full max-w-lg glass-card p-8 max-h-[90vh] overflow-y-auto border-accent-red/20">
            <button @click="showUserModal = false" class="absolute top-4 right-4 text-text-secondary hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            <!-- Profile header -->
            <div class="flex items-center gap-4 mb-6">
              <img :src="viewingUser.avatar || '/default-avatar.svg'" class="w-16 h-16 rounded-full object-cover border border-gray-200" />
              <div>
                <h3 class="text-2xl font-bold text-gray-900">{{ viewingUser.name }}</h3>
                <p v-if="viewingUser.role" class="text-sm text-text-secondary">{{ viewingUser.role }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span v-if="viewingUser.lookingForTeam" class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Looking for Team</span>
                </div>
              </div>
            </div>

            <!-- GitHub -->
            <a
              v-if="viewingUser.githubId"
              :href="'https://github.com/' + viewingUser.githubId.replace(/^@/, '')"
              target="_blank"
              class="inline-flex items-center gap-2 mb-4 text-sm text-text-secondary hover:text-blue-600 transition-colors"
            >
              <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              @{{ viewingUser.githubId.replace(/^@/, '') }}
            </a>

            <!-- Bio -->
            <div v-if="viewingUser.bio" class="mb-6 p-4 bg-gray-50 rounded-lg">
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Bio</p>
              <p class="text-sm text-text-secondary leading-relaxed">{{ viewingUser.bio }}</p>
            </div>

            <!-- Themes -->
            <div v-if="viewingUser.themes?.length" class="mb-4">
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-3 font-semibold">Interested Themes</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="theme in viewingUser.themes" :key="theme" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                  <svg v-if="getTrackIcon(theme)" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" :d="getTrackIcon(theme)" /></svg>
                  {{ getTrackLabel(theme) }}
                </span>
              </div>
            </div>

            <!-- Preferred Model -->
            <div v-if="viewingUser.preferredModel" class="mb-6">
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-3 font-semibold">Preferred Model</p>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                <img v-if="getModelIcon(viewingUser.preferredModel)" :src="getModelIcon(viewingUser.preferredModel)" class="w-4 h-4 rounded" />
                {{ viewingUser.preferredModel }}
              </div>
            </div>

            <!-- Team link -->
            <div v-if="getUserTeam(viewingUser)" class="p-4 bg-gray-50 rounded-lg">
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Team</p>
              <div class="flex items-center gap-3">
                <img :src="getUserTeam(viewingUser)!.avatar || '/default-avatar.svg'" class="w-8 h-8 rounded-full object-cover border border-gray-200" />
                <span class="text-sm font-semibold text-gray-900">{{ getUserTeam(viewingUser)!.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
