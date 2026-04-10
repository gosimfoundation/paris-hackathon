<script setup lang="ts">
import { provideI18n } from './composables/useI18n'
import { provideAuth } from './composables/useAuth'
import { provideTheme } from './composables/useTheme'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import RulesPage from './pages/RulesPage.vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'

provideI18n()
const { user, isLoggedIn } = provideAuth()
provideTheme()

const route = useRoute()
const currentPath = computed(() => route.path)

const showQrModal = ref(false)
const showQrTip = ref(false)
const qrDataUrl = ref('')

watch(isLoggedIn, async (v) => {
  if (v && user.value) {
    qrDataUrl.value = await QRCode.toDataURL(`https://create.gosim.org/profile/${user.value.id}`, {
      width: 280, margin: 1, color: { dark: '#000000', light: '#ffffff' },
    })
    // 登录后弹出气泡提示
    setTimeout(() => { showQrTip.value = true }, 1000)
    setTimeout(() => { showQrTip.value = false }, 6000)
  }
}, { immediate: true })
</script>

<template>
  <AppHeader />
  <RulesPage v-if="currentPath === '/rules'" />
  <router-view v-else />
  <AppFooter />

  <!-- Floating QR button (logged in only) -->
  <div v-if="isLoggedIn" class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
    <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 translate-y-2" leave-active-class="transition-all duration-200" leave-to-class="opacity-0 translate-y-2">
      <div v-if="showQrTip" class="qr-bubble px-4 py-2 bg-white text-gray-800 text-sm font-medium rounded-lg shadow-lg relative">
        Your check-in QR code
        <div class="absolute -bottom-1.5 right-5 w-3 h-3 bg-white rotate-45 shadow-sm"></div>
        <button @click.stop="showQrTip = false" class="ml-2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
      </div>
    </Transition>
    <button @click="showQrModal = true; showQrTip = false" class="w-12 h-12 bg-btn-bg text-btn-text rounded-full shadow-lg flex items-center justify-center hover:bg-btn-hover transition-colors qr-fab-pulse" title="Check-in QR Code">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17 17h1v1h-1zM14 14h1v1h-1zM14 17h1v1h-1zM17 14h1v1h-1zM20 17h1v1h-1zM20 14h1v1h-1zM17 20h1v1h-1zM20 20h1v1h-1z"/></svg>
    </button>
  </div>

  <!-- QR Modal -->
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
      <div v-if="showQrModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click="showQrModal = false">
        <div class="absolute inset-0 bg-black/80" />
        <div class="relative bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center" @click.stop>
          <h3 class="text-lg font-bold text-gray-900 mb-1">{{ user?.name }}</h3>
          <p class="text-sm text-gray-500 mb-4">GOSIM Hackathon Check-in</p>
          <img v-if="qrDataUrl" :src="qrDataUrl" class="w-56 h-56" />
          <p class="text-xs text-gray-400 mt-3">Show this to staff at entrance</p>
          <button @click="showQrModal = false" class="mt-4 px-6 py-2 bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors">Close</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.qr-fab-pulse {
  animation: qr-pulse 2s ease-in-out 3;
}
@keyframes qr-pulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  50% { box-shadow: 0 4px 20px rgba(212,160,23,0.5), 0 0 0 6px rgba(212,160,23,0.15); }
}
</style>
