<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useTeams } from '../../composables/useTeams'

const { user, isLoggedIn } = useAuth()
const { teams, editTeam } = useTeams()

const DISMISS_KEY = 'model_nudge_dismissed_session'
const dismissed = ref(sessionStorage.getItem(DISMISS_KEY) === '1')
const saving = ref(false)
const justSaved = ref(false)

const myLedTeam = computed(() => teams.value.find(t => t.leaderId === user.value?.id))
const needsModel = computed(() =>
  isLoggedIn.value && myLedTeam.value && !myLedTeam.value.model && !dismissed.value && !justSaved.value
)

const models = [
  { id: 'MiniMax', color: '#E94B7E', desc: 'Multimodal agents with long context.' },
  { id: 'Kimi', color: '#3B82F6', desc: 'Strong reasoning and long-form workflows.' },
  { id: 'GLM', color: '#22C55E', desc: 'Flexible tool-using agents from Zhipu.' },
]

async function pick(model: string) {
  if (!myLedTeam.value) return
  saving.value = true
  const ok = await editTeam(myLedTeam.value.id, { model })
  saving.value = false
  if (ok) { justSaved.value = true; setTimeout(() => { justSaved.value = false }, 2000) }
}

function dismiss() {
  sessionStorage.setItem(DISMISS_KEY, '1')
  dismissed.value = true
}

// Reset session dismiss when user changes
watch(() => user.value?.id, () => {
  dismissed.value = sessionStorage.getItem(DISMISS_KEY) === '1'
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="needsModel" class="fixed inset-0 z-[180] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div class="relative w-full max-w-lg bg-bg-primary border border-accent/30 shadow-2xl p-6">
          <button @click="dismiss" class="absolute top-3 right-3 text-text-muted hover:text-text-primary text-xs uppercase tracking-widest">
            Later
          </button>
          <div class="text-center mb-5">
            <div class="inline-block px-3 py-1 bg-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase rounded mb-3">Action needed</div>
            <h2 class="text-xl font-bold text-text-primary mb-2">Pick your sponsored model</h2>
            <p class="text-sm text-text-secondary">
              Your team <strong>{{ myLedTeam?.name }}</strong> hasn't picked one yet. Sponsor credits are awarded per model, so this matters for your team's prizes.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <button v-for="m in models" :key="m.id" @click="pick(m.id)" :disabled="saving"
              class="p-4 bg-bg-secondary border border-border hover:border-accent transition-all disabled:opacity-50 text-left rounded">
              <div class="text-base font-bold mb-1" :style="{ color: m.color }">{{ m.id }}</div>
              <p class="text-[11px] text-text-muted leading-snug">{{ m.desc }}</p>
            </button>
          </div>
          <p v-if="justSaved" class="text-center text-sm text-emerald-400">Saved!</p>
          <p class="text-[11px] text-text-muted text-center">You can change this anytime from your team page.</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
