<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../../lib/supabase'

const count = ref(0)
let channel: ReturnType<typeof supabase.channel> | null = null

function generateAnonId() {
  // Fresh ID per page load — sessionStorage gets copied on tab duplication
  return 'viewer_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 11)
}

onMounted(async () => {
  const userId = generateAnonId()
  channel = supabase.channel('site_viewers', { config: { presence: { key: userId } } })

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel!.presenceState()
      count.value = Object.keys(state).length
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel!.track({ joined_at: new Date().toISOString() })
      }
    })
})

onUnmounted(() => {
  if (channel) {
    channel.untrack()
    supabase.removeChannel(channel)
  }
})
</script>

<template>
  <div v-if="count > 0" class="live-viewers">
    <span class="live-viewers__dot">
      <span class="live-viewers__dot-ping"></span>
      <span class="live-viewers__dot-core"></span>
    </span>
    <span class="live-viewers__count tabular-nums">{{ count }}</span>
    <span class="live-viewers__label">viewing now</span>
  </div>
</template>

<style scoped>
.live-viewers {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 50;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 999px;
  font-size: 0.75rem;
  color: rgba(229, 231, 235, 0.9);
  pointer-events: none;
  animation: live-viewers-in 0.5s ease-out;
}

@keyframes live-viewers-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.live-viewers__dot {
  position: relative;
  display: inline-flex;
  width: 8px;
  height: 8px;
}

.live-viewers__dot-ping {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgb(74, 222, 128);
  opacity: 0.75;
  animation: live-viewers-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.live-viewers__dot-core {
  position: relative;
  display: inline-flex;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(34, 197, 94);
}

@keyframes live-viewers-ping {
  0% { transform: scale(1); opacity: 0.75; }
  75%, 100% { transform: scale(2.2); opacity: 0; }
}

.live-viewers__count {
  font-weight: 700;
  color: rgb(74, 222, 128);
}

.live-viewers__label {
  color: rgba(156, 163, 175, 0.9);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .live-viewers {
    bottom: 1rem;
    left: 1rem;
    padding: 0.4rem 0.7rem;
    font-size: 0.7rem;
  }
}
</style>
