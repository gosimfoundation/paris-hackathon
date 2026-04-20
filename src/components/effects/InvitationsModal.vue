<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useTeams } from '../../composables/useTeams'
import { supabase } from '../../lib/supabase'

const { isLoggedIn } = useAuth()
const { myInvitations, teams, users: allProfiles, respondToInvite, fetchInvitations } = useTeams()

const showModal = ref(false)
const busyId = ref<string | null>(null)
const toast = ref('')

const enriched = computed(() => {
  return myInvitations.value.map((i: any) => ({
    ...i,
    team: teams.value.find(t => t.id === i.team_id),
    inviter: allProfiles.value.find(u => u.id === i.invited_by),
  }))
})

const count = computed(() => myInvitations.value.length)

async function handleRespond(inviteId: string, accept: boolean) {
  busyId.value = inviteId
  const ok = await respondToInvite(inviteId, accept)
  busyId.value = null
  if (ok) {
    toast.value = accept ? 'Joined!' : 'Declined'
    setTimeout(() => (toast.value = ''), 2000)
    if (enriched.value.length === 0) showModal.value = false
  }
}

function avatarOf(u: any): string {
  if (u?.avatar) return u.avatar
  if (u?.githubId) return `https://avatars.githubusercontent.com/${u.githubId.replace(/^@/, '')}`
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || '?')}&background=1f2937&color=fff&size=64`
}

onMounted(() => {
  if (isLoggedIn.value) fetchInvitations()
  supabase.auth.onAuthStateChange(() => { fetchInvitations() })
})
</script>

<template>
  <!-- Floating button (only when logged in and has pending invites) -->
  <button v-if="isLoggedIn && count > 0 && !showModal"
    @click="showModal = true"
    class="invitations-fab"
    :title="`${count} pending invitation${count > 1 ? 's' : ''}`">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
    <span class="invitations-fab__text">INVITATIONS</span>
    <span class="invitations-fab__badge">{{ count }}</span>
  </button>

  <Teleport to="body">
    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="showModal" class="fixed inset-0 z-[205] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="showModal = false" />
        <div class="relative w-full max-w-lg max-h-[88vh] bg-bg-primary border border-border shadow-2xl flex flex-col" @click.stop>
          <div class="flex items-center justify-between p-5 border-b border-border shrink-0">
            <div>
              <h2 class="text-lg font-bold text-text-primary">Team Invitations</h2>
              <p class="text-xs text-text-muted mt-0.5">{{ count }} pending</p>
            </div>
            <button @click="showModal = false" class="text-text-secondary hover:text-text-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-if="enriched.length === 0" class="text-center text-text-muted py-8">No pending invitations.</div>
            <div v-for="inv in enriched" :key="inv.id" class="p-4 bg-bg-secondary border border-border-subtle rounded">
              <div class="flex items-center gap-3 mb-3">
                <img :src="avatarOf(inv.inviter)" class="w-10 h-10 rounded-full object-cover border border-border" />
                <div class="min-w-0">
                  <p class="text-sm text-text-primary">
                    <span class="font-semibold">{{ inv.inviter?.name || 'Someone' }}</span>
                    invited you to
                  </p>
                  <p class="text-base font-bold text-accent truncate">{{ inv.team?.name || '(team)' }}</p>
                </div>
              </div>
              <p v-if="inv.message" class="text-sm text-text-secondary italic mb-3 pl-3 border-l-2 border-accent/40">"{{ inv.message }}"</p>
              <div v-if="inv.team" class="flex items-center gap-3 text-xs text-text-muted mb-3">
                <span>{{ inv.team.members?.length || 0 }}/{{ inv.team.maxSize }} members</span>
                <span v-if="inv.team.model" class="px-1.5 py-0.5 bg-accent/10 text-accent rounded">{{ inv.team.model }}</span>
                <span v-if="inv.team.locked" class="text-red-400">LOCKED</span>
              </div>
              <div class="flex gap-2">
                <button @click="handleRespond(inv.id, true)" :disabled="busyId === inv.id"
                  class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50">
                  {{ busyId === inv.id ? 'Joining...' : 'Accept' }}
                </button>
                <button @click="handleRespond(inv.id, false)" :disabled="busyId === inv.id"
                  class="flex-1 py-2 bg-bg-card hover:bg-bg-elevated border border-border text-text-secondary text-xs font-bold uppercase tracking-widest disabled:opacity-50">
                  Decline
                </button>
              </div>
            </div>
            <p v-if="toast" class="text-sm text-emerald-400 text-center">{{ toast }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.invitations-fab {
  position: fixed;
  top: 5.5rem;
  right: 1.25rem;
  z-index: 55;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 1.15rem;
  background: linear-gradient(135deg, #d4a017 0%, #e94b7e 100%);
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 28px rgba(233, 75, 126, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: invpulse 1.8s ease-in-out infinite;
}
.invitations-fab:hover {
  transform: translateY(-2px) scale(1.03);
}
.invitations-fab__badge {
  background: rgba(0, 0, 0, 0.4);
  padding: 0.12rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0;
}
@keyframes invpulse {
  0%, 100% { box-shadow: 0 10px 28px rgba(233, 75, 126, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.3); }
  50% { box-shadow: 0 12px 40px rgba(233, 75, 126, 0.7), 0 0 0 8px rgba(233, 75, 126, 0.18); }
}
@media (max-width: 640px) {
  .invitations-fab {
    top: 4.5rem;
    right: 0.8rem;
    padding: 0.5rem 0.85rem;
    font-size: 0.65rem;
  }
  .invitations-fab__text { display: none; }
}
</style>
