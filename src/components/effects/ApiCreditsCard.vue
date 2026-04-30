<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useTeams } from '../../composables/useTeams'
import { supabase } from '../../lib/supabase'

const { user, isLoggedIn } = useAuth()
const { teams } = useTeams()

const myTeam = computed(() => teams.value.find(t => t.members.some(m => m.id === user.value?.id)))
const myCode = ref<any>(null)
const codeRevealed = ref(false)
const dismissed = ref(false)

const shouldShow = computed(() =>
  isLoggedIn.value && user.value?.checkedIn && user.value?.teamId && !dismissed.value
)

const teamModel = computed(() => myTeam.value?.model || '')
const isCodeModel = computed(() => ['MiniMax', 'Kimi'].includes(teamModel.value))
const isRouteTokens = computed(() => !isCodeModel.value)

const platformLink = computed(() => {
  if (teamModel.value === 'MiniMax') return 'https://platform.minimax.io/docs/guides/pricing-token-plan'
  if (teamModel.value === 'Kimi') return 'https://platform.kimi.ai/docs/api/overview'
  return ''
})

async function loadCode() {
  if (!user.value) return
  const { data } = await supabase.from('redeem_codes').select('code, model').eq('assigned_to', user.value.id).eq('status', 'assigned').single()
  myCode.value = data || null
}

watch(shouldShow, (v) => { if (v && isCodeModel.value) loadCode() }, { immediate: true })
</script>

<template>
  <div v-if="shouldShow" class="fixed bottom-6 left-6 z-50 max-w-sm">
    <div class="bg-bg-primary border border-accent/40 shadow-2xl p-5 backdrop-blur-xl">
      <button @click="dismissed = true" class="absolute top-2 right-2 text-text-muted hover:text-text-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>

      <p class="text-xs text-accent uppercase tracking-widest font-bold mb-3">🔑 API Credits — {{ teamModel || 'DeepSeek' }}</p>

      <!-- MiniMax / Kimi: show redeem code -->
      <template v-if="isCodeModel && myCode">
        <p class="text-sm text-text-secondary mb-2">Your redemption code:</p>
        <code @click="codeRevealed = !codeRevealed"
          class="block px-4 py-3 bg-bg-secondary border border-accent/30 font-mono text-lg text-center mb-2 cursor-pointer transition-colors hover:border-accent"
          :class="codeRevealed ? 'text-accent select-all' : 'text-text-muted'">
          {{ codeRevealed ? myCode.code : '•••••••••••••' }}
        </code>
        <p v-if="!codeRevealed" class="text-[10px] text-text-muted text-center mb-3">Click to reveal</p>
        <a :href="platformLink" target="_blank"
          class="block w-full py-2.5 bg-accent text-black text-sm font-bold uppercase tracking-widest text-center hover:bg-accent-hover transition-colors">
          Redeem on {{ myCode.model }} →
        </a>
      </template>

      <!-- MiniMax / Kimi: no code assigned yet -->
      <template v-else-if="isCodeModel && !myCode">
        <p class="text-sm text-text-muted">Your code hasn't been assigned yet. Please contact staff on-site.</p>
      </template>

      <!-- GLM / DeepSeek / other: RouteTokens -->
      <template v-else-if="isRouteTokens">
        <p class="text-sm text-text-secondary mb-3">Register to get your API credits:</p>
        <a href="https://portal.routetokens.com/" target="_blank"
          class="block w-full py-2.5 bg-accent text-black text-sm font-bold uppercase tracking-widest text-center hover:bg-accent-hover transition-colors mb-2">
          portal.routetokens.com →
        </a>
        <p class="text-[11px] text-amber-400 mb-2">⚠ 用你在我们网站注册的邮箱注册，否则可能在获取 token 的时候遇到问题</p>
        <a href="https://docs.routetokens.com/" target="_blank" class="text-[10px] text-text-muted hover:text-text-secondary">Documentation →</a>
      </template>
    </div>
  </div>
</template>
