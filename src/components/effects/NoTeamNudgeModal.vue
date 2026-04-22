<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useTeams } from '../../composables/useTeams'
import { supabase } from '../../lib/supabase'

const { user, isLoggedIn } = useAuth()
const { teams, myInvitations } = useTeams()

const dismissed = ref(false)
const toggling = ref(false)
const toggledOn = ref(false)

const hasTeam = computed(() => !!user.value?.teamId)
const hasIncomingInvites = computed(() => myInvitations.value.length > 0)

const shouldShow = computed(() =>
  isLoggedIn.value
  && user.value
  && !hasTeam.value
  && !dismissed.value
)

watch(() => user.value?.id, () => {
  dismissed.value = false
  toggledOn.value = !!user.value?.lookingForTeam
})

// Init on mount (useAuth populates later)
watch(() => user.value, (u) => {
  if (u) toggledOn.value = !!u.lookingForTeam
}, { immediate: true })

async function enableLookingForTeam() {
  if (!user.value || toggling.value) return
  toggling.value = true
  const { error: updErr } = await supabase.from('profiles').update({ looking_for_team: true }).eq('id', user.value.id)
  toggling.value = false
  if (!updErr) {
    toggledOn.value = true
    if (user.value) user.value.lookingForTeam = true
  }
}

function dismiss() {
  dismissed.value = true
}

function scrollToTeams() {
  const el = document.getElementById('teams')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  dismiss()
}

const upcomingTeamsCount = computed(() => teams.value.filter(t => !t.locked && t.members.length < t.maxSize).length)
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="shouldShow" class="fixed inset-0 z-[180] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div class="relative w-full max-w-lg bg-bg-primary border border-amber-400/40 shadow-2xl p-6">
          <button @click="dismiss" class="absolute top-3 right-3 text-text-muted hover:text-text-primary text-xs uppercase tracking-widest">
            Later
          </button>
          <div class="text-center mb-5">
            <div class="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 text-[10px] font-bold tracking-widest uppercase rounded mb-3">Action required</div>
            <h2 class="text-xl font-bold text-text-primary mb-2">You must join or create a team to complete your registration.</h2>
            <p class="text-sm text-text-secondary">
              Without a registered team, you won't be able to compete on event day.
              {{ upcomingTeamsCount }} teams are still open.
            </p>
          </div>

          <div class="space-y-3 mb-4">
            <button @click="scrollToTeams" class="w-full py-3 bg-btn-bg text-btn-text text-sm font-bold uppercase tracking-widest hover:bg-btn-hover transition-colors">
              Create or Browse Teams
            </button>
            <button
              v-if="!toggledOn"
              @click="enableLookingForTeam"
              :disabled="toggling"
              class="w-full py-2 text-xs text-text-muted hover:text-text-secondary uppercase tracking-widest disabled:opacity-50 transition-colors">
              {{ toggling ? 'Saving...' : 'Just mark me as Looking for Team' }}
            </button>
            <p v-else class="text-center text-xs text-emerald-400">You're marked as Looking for Team. Team leaders can now find you.</p>
          </div>

          <p v-if="hasIncomingInvites" class="text-[11px] text-amber-300 text-center mb-2">
            You have {{ myInvitations.length }} pending invitation{{ myInvitations.length > 1 ? 's' : '' }}.
          </p>
          <p class="text-[11px] text-text-muted text-center">
            You'll see this reminder until you join a team.
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
