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

const shouldShow = computed(() =>
  isLoggedIn.value && user.value?.checkedIn && user.value?.teamId
)

const isRouteTokens = computed(() =>
  myTeam.value && !['MiniMax', 'Kimi'].includes(myTeam.value.model)
)

async function loadCode() {
  if (!user.value) return
  const { data } = await supabase.from('redeem_codes').select('code, model').eq('assigned_to', user.value.id).eq('status', 'assigned').single()
  myCode.value = data || null
}

watch(shouldShow, (v) => { if (v) loadCode() }, { immediate: true })
</script>

<template>
  <div v-if="shouldShow" class="fixed bottom-6 left-6 z-50 max-w-sm">
    <div class="bg-bg-primary border border-accent/40 shadow-2xl p-4 backdrop-blur-xl">
      <p class="text-xs text-accent uppercase tracking-widest font-bold mb-2">API Credits</p>

      <template v-if="myCode">
        <p class="text-sm text-text-secondary mb-1">Your <strong class="text-text-primary">{{ myCode.model }}</strong> code:</p>
        <code @click="codeRevealed = !codeRevealed" class="block px-3 py-2 bg-bg-secondary border border-accent/30 text-accent font-mono text-base mb-2 cursor-pointer" :class="codeRevealed ? 'select-all' : ''">{{ codeRevealed ? myCode.code : '••••••••••••' }}</code>
        <p v-if="!codeRevealed" class="text-[10px] text-text-muted mb-1">Click to reveal</p>
        <a v-if="myCode.model === 'MiniMax'" href="https://platform.minimax.io/docs/guides/pricing-token-plan" target="_blank" class="text-xs text-accent hover:underline">→ Redeem on MiniMax Platform</a>
        <a v-else-if="myCode.model === 'Kimi'" href="https://platform.kimi.ai/docs/api/overview" target="_blank" class="text-xs text-accent hover:underline">→ Redeem on Kimi Platform</a>
      </template>

      <template v-else-if="isRouteTokens">
        <p class="text-sm text-text-secondary mb-2">Register on RouteTokens:</p>
        <a href="https://portal.routetokens.com/" target="_blank" class="block px-3 py-2 bg-bg-secondary border border-accent/30 text-accent text-sm hover:bg-accent/5 transition-colors mb-1">→ portal.routetokens.com</a>
        <p class="text-[11px] text-amber-400 mb-1">用你在我们网站注册的邮箱注册，否则可能在获取 token 的时候遇到问题</p>
        <a href="https://docs.routetokens.com/" target="_blank" class="text-[10px] text-text-muted hover:text-text-secondary">Documentation →</a>
      </template>

      <template v-else>
        <p class="text-xs text-text-muted">Code not assigned yet. Please contact staff on-site.</p>
      </template>
    </div>
  </div>
</template>
