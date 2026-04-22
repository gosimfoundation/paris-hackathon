<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useAuth } from '../../composables/useAuth'
import { useTheme } from '../../composables/useTheme'
import { useTeams } from '../../composables/useTeams'
import { assetUrl } from '../../composables/api'
import QRCode from 'qrcode'

const { t, locale, toggleLocale } = useI18n()
const { user, isLoggedIn, login, register, logout, updateProfile, changePassword, sendPasswordReset, error: authError, showAuthModal, authModalTab, showChangePasswordModal } = useAuth()
const newPassword = ref('')
const confirmPassword = ref('')
const changePwError = ref('')
async function handleChangePassword() {
  changePwError.value = ''
  if (newPassword.value.length < 6) { changePwError.value = 'Password must be at least 6 characters'; return }
  if (newPassword.value !== confirmPassword.value) { changePwError.value = 'Passwords do not match'; return }
  const ok = await changePassword(newPassword.value)
  if (ok) {
    newPassword.value = ''
    confirmPassword.value = ''
    showHeaderToast('Password changed!')
  } else {
    changePwError.value = authError.value || 'Failed to change password'
  }
}
const { isDark, toggleTheme } = useTheme()
const { createTeam, teams, approveJoin, rejectJoin, cancelJoin } = useTeams()

const myTeam = computed(() =>
  teams.value.find(t => t.id === user.value?.teamId) ||
  teams.value.find(t => t.pendingJoins?.includes(user.value?.id ?? ''))
)
const myPendingTeams = computed(() =>
  teams.value.filter(t =>
    t.pendingJoins?.includes(user.value?.id ?? '') &&
    t.id !== user.value?.teamId
  )
)
const pendingCount = computed(() => {
  if (!myTeam.value || myTeam.value.leaderId !== user.value?.id) return 0
  return myTeam.value.pendingJoins?.length ?? 0
})

const headerToast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)
let headerToastTimer: number | undefined
function showHeaderToast(msg: string, type: 'success' | 'error' = 'success') {
  headerToast.value = { msg, type }
  clearTimeout(headerToastTimer)
  headerToastTimer = window.setTimeout(() => headerToast.value = null, 4000)
}

async function handleApprove(teamId: string, userId: string) {
  await approveJoin(teamId, userId)
}
async function handleReject(teamId: string, userId: string) {
  await rejectJoin(teamId, userId)
}
async function handleCancelJoin(teamId: string) {
  const ok = await cancelJoin(teamId)
  showHeaderToast(ok ? 'Application cancelled.' : 'Failed to cancel', ok ? 'success' : 'error')
}

const scrolled = ref(false)
const mobileOpen = ref(false)

const navItems = computed(() => [
  { label: t('nav.about'), href: '#about' },
  { label: t('nav.themes'), href: '#themes' },
  { label: t('nav.awards'), href: '#awards' },
  { label: t('nav.teams'), href: '#teams' },
  { label: t('nav.schedule'), href: '#schedule' },
  { label: t('nav.judging'), href: '#judging' },
  { label: t('nav.faq'), href: '#faq' },
])

function onScroll() {
  scrolled.value = window.scrollY > 50
}

function scrollTo(href: string) {
  mobileOpen.value = false
  const el = document.querySelector(href)
  el?.scrollIntoView({ behavior: 'smooth' })
}

function handleOpenProfileEvent() { openProfileModal() }
onMounted(() => { window.addEventListener('scroll', onScroll); window.addEventListener('open-profile-modal', handleOpenProfileEvent) })
onUnmounted(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('open-profile-modal', handleOpenProfileEvent) })

// Auth modal uses shared state from useAuth (showAuthModal, authModalTab)

// Login form
const loginEmail = ref('')
const loginPassword = ref('')

// Register form
const regName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regGithubId = ref('')
const regRole = ref('')
const regDiscord = ref('')
const regTwitter = ref('')
const regTelegram = ref('')
const regLinkedin = ref('')
const regWebsite = ref('')
const regLookingForTeam = ref(false)
const regWantCreateTeam = ref(false)
const regTeamName = ref('')
const regTeamTracks = ref<string[]>([])
const regTeamGithubRepo = ref('')
const regTeamModel = ref('')
const regTeamProjectIdea = ref('')
const regTeamMaxSize = ref(3)
const regTeamLocked = ref(false)

const regTrackOptions = [
  { id: 'agents-meet-apps', label: 'Agents Meet Apps' },
  { id: 'claws-octos', label: 'Claws & Octos' },
  { id: 'hai', label: 'Human-Agent Interaction' },
  { id: 'education', label: 'Education' },
  { id: 'content-remix', label: 'Content Remixing' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'agents-voices', label: 'Agents with Voices' },
]

function toggleRegTrack(id: string) {
  const idx = regTeamTracks.value.indexOf(id)
  if (idx >= 0) regTeamTracks.value.splice(idx, 1)
  else regTeamTracks.value.push(id)
}

const roleOptions = [
  'AI Engineer', 'Full-Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Researcher', 'Designer', 'Product Manager', 'Student', 'Startup Founder', 'Other',
]

const authLoading = ref(false)

watch(showAuthModal, (open) => {
  if (open) {
    authError.value = ''
    loginEmail.value = ''
    loginPassword.value = ''
    regName.value = ''
    regEmail.value = ''
    regPassword.value = ''
    regGithubId.value = ''
    regRole.value = ''
    regDiscord.value = ''
    regTwitter.value = ''
    regTelegram.value = ''
    regLinkedin.value = ''
    regWebsite.value = ''
    regLookingForTeam.value = false
    regWantCreateTeam.value = false
    regTeamName.value = ''
    regTeamTracks.value = []
    regTeamGithubRepo.value = ''
    regTeamModel.value = ''
    regTeamProjectIdea.value = ''
    regTeamMaxSize.value = 3
    regTeamLocked.value = false
  }
})

const forgotSent = ref(false)
const registerNeedsConfirm = ref(false)
const confirmedEmail = ref('')

async function submitLogin() {
  authLoading.value = true
  const ok = await login(loginEmail.value, loginPassword.value)
  authLoading.value = false
  if (ok) showAuthModal.value = false
}

async function submitForgot() {
  authLoading.value = true
  forgotSent.value = false
  const ok = await sendPasswordReset(loginEmail.value)
  authLoading.value = false
  if (ok) forgotSent.value = true
}

async function submitRegister() {
  authLoading.value = true
  const ok = await register({
    name: regName.value,
    email: regEmail.value,
    password: regPassword.value,
    githubId: regGithubId.value,
    role: regRole.value,
    avatar: '',
    themes: regWantCreateTeam.value ? regTeamTracks.value : [],
    preferredModel: '',
    bio: '',
    discord: regDiscord.value,
    twitter: regTwitter.value,
    telegram: regTelegram.value,
    linkedin: regLinkedin.value,
    website: regWebsite.value,
    lookingForTeam: regLookingForTeam.value,
  })
  if (ok && regWantCreateTeam.value && regTeamName.value.trim()) {
    await createTeam({
      name: regTeamName.value.trim(),
      avatar: '',
      githubRepo: regTeamGithubRepo.value.trim(),
      themes: regTeamTracks.value,
      model: regTeamModel.value,
      projectIdea: regTeamProjectIdea.value.trim(),
      locked: regTeamLocked.value,
      maxSize: regTeamMaxSize.value,
    })
  }
  authLoading.value = false
  if (ok) {
    if (isLoggedIn.value) {
      showAuthModal.value = false
      setTimeout(() => {
        document.getElementById('teams')?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else {
      // 需要邮件确认
      confirmedEmail.value = regEmail.value
      registerNeedsConfirm.value = true
    }
  }
}

function handleLogout() {
  logout()
  mobileOpen.value = false
}

const inputClass = 'w-full px-4 py-2.5  bg-input-bg border border-input-border text-text-primary placeholder-input-placeholder focus:border-accent/50 focus:outline-none transition-colors text-sm'

// User dropdown
const showUserDropdown = ref(false)

// Profile edit modal
const showProfileModal = ref(false)
const profileName = ref('')
const profileGithubId = ref('')
const profileRole = ref('')
const profileBio = ref('')
const profileThemes = ref<string[]>([])
const profilePreferredModel = ref('')
const profileDiscord = ref('')
const profileTwitter = ref('')
const profileTelegram = ref('')
const profileLinkedin = ref('')
const profileWebsite = ref('')
const profileLookingForTeam = ref(false)
const profileLoading = ref(false)

const trackOptions = [
  { id: 'agents-meet-apps', label: 'Agents Meet Apps' },
  { id: 'claws-octos', label: 'Claws & Octos' },
  { id: 'hai', label: 'Human-Agent Interaction' },
  { id: 'education', label: 'Education' },
  { id: 'content-remix', label: 'Content Remixing' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'agents-voices', label: 'Agents with Voices' },
]

const modelChoices = ['MiniMax', 'Kimi', 'GLM']

const showMyTeamModal = ref(false)

function goToMyTeam() {
  showMyTeamModal.value = true
}

const profileQr = ref('')

async function openProfileModal() {
  showUserDropdown.value = false
  if (user.value) {
    profileName.value = user.value.name
    profileGithubId.value = user.value.githubId
    profileRole.value = user.value.role
    profileBio.value = user.value.bio || ''
    profileThemes.value = [...(user.value.themes || [])]
    profilePreferredModel.value = user.value.preferredModel || ''
    profileDiscord.value = user.value.discord || ''
    profileTwitter.value = user.value.twitter || ''
    profileTelegram.value = user.value.telegram || ''
    profileLinkedin.value = user.value.linkedin || ''
    profileWebsite.value = user.value.website || ''
    profileLookingForTeam.value = user.value.lookingForTeam
    profileQr.value = await QRCode.toDataURL(`https://create.gosim.org/profile/${user.value.id}`, {
      width: 200, margin: 1, color: { dark: '#000000', light: '#ffffff' },
    })
  }
  showProfileModal.value = true
}

function toggleProfileTheme(id: string) {
  const idx = profileThemes.value.indexOf(id)
  if (idx >= 0) profileThemes.value.splice(idx, 1)
  else profileThemes.value.push(id)
}

async function saveProfile() {
  profileLoading.value = true
  const ok = await updateProfile({
    name: profileName.value,
    githubId: profileGithubId.value,
    role: profileRole.value,
    bio: profileBio.value,
    themes: profileThemes.value,
    preferredModel: profilePreferredModel.value,
    discord: profileDiscord.value,
    twitter: profileTwitter.value,
    telegram: profileTelegram.value,
    linkedin: profileLinkedin.value,
    website: profileWebsite.value,
    lookingForTeam: profileLookingForTeam.value,
  })
  profileLoading.value = false
  if (ok) showProfileModal.value = false
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-bg-primary/95 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-3 group">
        <img :src="isDark ? assetUrl('/gosim-logo-white.svg') : assetUrl('/gosim-logo.svg')" alt="GOSIM" class="h-7 w-auto" />
        <span class="text-xs text-text-tertiary font-light tracking-widest uppercase">Hackathon</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-3 lg:gap-5">
        <a
          v-for="item in navItems"
          :key="item.href"
          @click.prevent="scrollTo(item.href)"
          class="text-xs text-text-primary/80 hover:text-text-primary transition-colors cursor-pointer relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all hover:after:w-full"
        >
          {{ item.label }}
        </a>
        <router-link
          to="/vision"
          class="text-xs text-text-primary/80 hover:text-text-primary transition-colors cursor-pointer relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all hover:after:w-full"
        >
          Vision
        </router-link>
        <router-link
          to="/rules"
          class="text-xs text-text-primary/80 hover:text-text-primary transition-colors cursor-pointer relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all hover:after:w-full"
        >
          Rules
        </router-link>

        <!-- Theme toggle -->
        <button
          @click="toggleTheme"
          class="text-text-tertiary hover:text-text-primary transition-colors p-1.5 border border-border"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>

        <!-- Language toggle -->
        <button
          @click="toggleLocale"
          class="text-xs text-text-tertiary hover:text-text-primary transition-colors font-mono border border-border px-2 py-1"
        >
          {{ locale === 'en' ? '中文' : 'EN' }}
        </button>

        <!-- User area -->
        <template v-if="isLoggedIn && user">
          <div class="relative">
            <button @click="showUserDropdown = !showUserDropdown" class="relative flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
              <span class="relative">
                <img :src="assetUrl(user.avatar) || (user.githubId ? `https://avatars.githubusercontent.com/${user.githubId.replace('@', '')}` : '/default-avatar.svg')" class="w-7 h-7 rounded-full object-cover border border-border" />
                <span v-if="pendingCount > 0" class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-accent-red text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none border-2 border-bg-primary">{{ pendingCount }}</span>
              </span>
              <span class="max-w-[80px] truncate">{{ user.name }}</span>
            </button>
            <Transition
              enter-active-class="transition-all duration-150"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-100"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div v-if="showUserDropdown" class="absolute right-0 top-full mt-2 w-44 bg-bg-card border border-border shadow-lg py-1 z-50">
                <button @click="openProfileModal" class="w-full text-left px-4 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  Edit Profile
                </button>
                <button v-if="isLoggedIn" @click="goToMyTeam(); showUserDropdown = false" class="w-full text-left px-4 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors flex items-center justify-between">
                  <span>My Team</span>
                  <span v-if="pendingCount > 0" class="text-xs bg-accent-red text-white rounded-full px-1.5 py-0.5 leading-none">{{ pendingCount }}</span>
                </button>
                <button @click="handleLogout(); showUserDropdown = false" class="w-full text-left px-4 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  Logout
                </button>
              </div>
            </Transition>
          </div>
        </template>
        <a href="https://discord.gg/7ZRHz76gP2" target="_blank" rel="noopener" class="text-text-secondary hover:text-text-primary transition-colors" title="Join Discord">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
        </a>
        <a
          href="#teams"
          class="px-4 py-1.5 bg-btn-bg text-btn-text text-[11px] font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors whitespace-nowrap"
        >
          {{ t('nav.applyNow') }}
        </a>
      </nav>

      <!-- Mobile Toggle -->
      <button @click="mobileOpen = !mobileOpen" class="md:hidden text-text-secondary">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="mobileOpen" class="md:hidden bg-bg-primary border-t border-border px-6 py-4">
        <a
          v-for="item in navItems"
          :key="item.href"
          @click.prevent="scrollTo(item.href)"
          class="block py-3 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
        >
          {{ item.label }}
        </a>
        <router-link
          to="/vision"
          @click="mobileOpen = false"
          class="block py-3 text-text-tertiary hover:text-text-primary transition-colors"
        >
          Vision
        </router-link>
        <router-link
          to="/rules"
          @click="mobileOpen = false"
          class="block py-3 text-text-tertiary hover:text-text-primary transition-colors"
        >
          Rules
        </router-link>
        <button
          @click="toggleLocale"
          class="block py-3 text-text-tertiary hover:text-text-primary transition-colors font-mono text-sm"
        >
          {{ locale === 'en' ? '切换中文' : 'Switch to English' }}
        </button>

        <!-- Mobile user area -->
        <template v-if="isLoggedIn && user">
          <div class="flex items-center gap-2 py-3 border-t border-border-subtle mt-2">
            <img :src="assetUrl(user.avatar) || (user.githubId ? `https://avatars.githubusercontent.com/${user.githubId.replace('@', '')}` : '/default-avatar.svg')" class="w-7 h-7 rounded-full object-cover border border-border" />
            <span class="text-sm text-text-secondary truncate">{{ user.name }}</span>
          </div>
          <button @click="openProfileModal(); mobileOpen = false" class="block py-3 text-text-tertiary hover:text-text-primary transition-colors text-sm">
            Edit Profile
          </button>
          <button @click="handleLogout" class="block py-3 text-text-tertiary hover:text-text-primary transition-colors text-sm">
            Logout
          </button>
        </template>
        <a href="#teams" class="mt-4 block text-center px-5 py-3 bg-btn-bg text-btn-text text-xs font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors">
          {{ t('nav.applyNow') }}
        </a>
      </div>
    </Transition>
  </header>

  <!-- Auth Modal -->
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showAuthModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showAuthModal = false"></div>

        <div class="relative w-full max-w-md glass-card p-8 max-h-[90vh] overflow-y-auto border-accent-red/20">
          <button @click="showAuthModal = false" class="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <!-- Tabs -->
          <div class="flex gap-6 mb-6 border-b border-border">
            <button
              @click="authModalTab = 'login'; authError = ''"
              class="pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px"
              :class="authModalTab === 'login' ? 'text-text-primary border-accent' : 'text-text-secondary border-transparent hover:text-text-secondary'"
            >
              Login
            </button>
            <button
              @click="authModalTab = 'register'; authError = ''"
              class="pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px"
              :class="authModalTab === 'register' ? 'text-text-primary border-accent' : 'text-text-secondary border-transparent hover:text-text-secondary'"
            >
              Register
            </button>
          </div>

          <div v-if="authError" class="mb-4 p-3  bg-badge-danger-bg border border-accent-red/30 text-badge-danger-text text-sm">{{ authError }}</div>

          <!-- Login form -->
          <form v-if="authModalTab === 'login'" @submit.prevent="submitLogin" class="space-y-5">
            <div>
              <label class="block text-sm text-text-secondary mb-1">Email <span class="text-accent-red">*</span></label>
              <input v-model="loginEmail" type="email" required placeholder="your@email.com" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-1">Password <span class="text-accent-red">*</span></label>
              <input v-model="loginPassword" type="password" required placeholder="Password" :class="inputClass" />
            </div>
            <button type="submit" :disabled="authLoading" class="w-full py-3 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors disabled:opacity-50">
              {{ authLoading ? 'Logging in...' : 'Login' }}
            </button>
            <p class="text-center text-xs text-text-secondary mt-1">
              <button type="button" @click="authModalTab = 'forgot'; authError = ''" class="text-accent hover:underline">Forgot password?</button>
            </p>
            <p class="text-center text-xs text-text-secondary">
              Don't have an account?
              <button type="button" @click="authModalTab = 'register'; authError = ''" class="text-accent hover:underline">Register</button>
            </p>
          </form>

          <!-- Forgot password form -->
          <div v-else-if="authModalTab === 'forgot'" class="space-y-5">
            <p class="text-sm text-text-secondary">Enter your email and we'll send you a reset link.</p>
            <div>
              <label class="block text-sm text-text-secondary mb-1">Email</label>
              <input v-model="loginEmail" type="email" required placeholder="your@email.com" :class="inputClass" />
            </div>
            <div v-if="forgotSent" class="text-green-400 text-sm text-center">Reset email sent! Check your inbox.</div>
            <button type="button" :disabled="authLoading" @click="submitForgot" class="w-full py-3 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors disabled:opacity-50">
              {{ authLoading ? 'Sending...' : 'Send Reset Link' }}
            </button>
            <p class="text-center text-xs text-text-secondary">
              <button type="button" @click="authModalTab = 'login'; authError = ''" class="text-accent hover:underline">Back to login</button>
            </p>
          </div>

          <!-- Register form -->
          <form v-else @submit.prevent="submitRegister" class="space-y-5">
            <div>
              <label class="block text-sm text-text-secondary mb-1">Name <span class="text-accent-red">*</span></label>
              <input v-model="regName" type="text" required placeholder="Your name" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-1">Email <span class="text-accent-red">*</span></label>
              <input v-model="regEmail" type="email" required placeholder="your@email.com" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-1">Password <span class="text-accent-red">*</span></label>
              <input v-model="regPassword" type="password" required placeholder="Password" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-1">GitHub Username <span class="text-accent-red">*</span></label>
              <input v-model="regGithubId" type="text" required placeholder="e.g. octocat" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-1">Role</label>
              <select v-model="regRole" :class="[inputClass, 'appearance-none']">
                <option value="" class="bg-bg-primary text-text-secondary">Select role (optional)</option>
                <option v-for="r in roleOptions" :key="r" :value="r" class="bg-bg-primary">{{ r }}</option>
              </select>
            </div>
            <!-- Social links with stronger guidance -->
            <div class="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                <span class="text-sm font-medium text-text-primary">Connect with teammates</span>
                <span class="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded">recommended</span>
              </div>
              <p class="text-xs text-text-tertiary mb-3">Add at least one way for teammates to reach you</p>
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                      <svg class="w-3.5 h-3.5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                      Discord
                    </label>
                    <input v-model="regDiscord" type="text" placeholder="username" :class="[inputClass, regDiscord ? 'border-emerald-500/50' : '']" />
                  </div>
                  <div>
                    <label class="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                      <svg class="w-3.5 h-3.5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      Twitter / X
                    </label>
                    <input v-model="regTwitter" type="text" placeholder="@handle" :class="[inputClass, regTwitter ? 'border-emerald-500/50' : '']" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                      <svg class="w-3.5 h-3.5 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                      Telegram
                    </label>
                    <input v-model="regTelegram" type="text" placeholder="@username" :class="[inputClass, regTelegram ? 'border-emerald-500/50' : '']" />
                  </div>
                  <div>
                    <label class="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                      <svg class="w-3.5 h-3.5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </label>
                    <input v-model="regLinkedin" type="text" placeholder="yourname" :class="[inputClass, regLinkedin ? 'border-emerald-500/50' : '']" />
                  </div>
                </div>
                <div>
                  <label class="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                    <svg class="w-3.5 h-3.5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                    Personal Website
                  </label>
                  <input v-model="regWebsite" type="text" placeholder="https://yoursite.com" :class="[inputClass, regWebsite ? 'border-emerald-500/50' : '']" />
                </div>
              </div>
            </div>

            <label class="flex items-center gap-3 cursor-pointer">
              <div class="relative">
                <input type="checkbox" v-model="regLookingForTeam" class="sr-only peer" @change="regLookingForTeam && (regWantCreateTeam = false)" />
                <div class="w-9 h-5 bg-border rounded-full peer-checked:bg-emerald-500 transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-bg-card rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
              </div>
              <span class="text-sm text-text-secondary">Looking for a team</span>
            </label>

            <!-- Create team option -->
            <div v-if="!regLookingForTeam">
              <label class="flex items-center gap-3 cursor-pointer">
                <div class="relative">
                  <input type="checkbox" v-model="regWantCreateTeam" class="sr-only peer" />
                  <div class="w-9 h-5 bg-border rounded-full peer-checked:bg-accent-blue transition-colors"></div>
                  <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-bg-card rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                </div>
                <span class="text-sm text-text-secondary">Create a team now</span>
              </label>

              <div v-if="regWantCreateTeam" class="mt-4 space-y-4 pl-4 border-l-2 border-accent-blue/30">
                <div>
                  <label class="block text-sm text-text-secondary mb-1">Team Name <span class="text-accent-red">*</span></label>
                  <input v-model="regTeamName" type="text" required placeholder="e.g. Team Alpha" :class="inputClass" />
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-2">Themes (optional)</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="track in regTrackOptions"
                      :key="track.id"
                      type="button"
                      @click="toggleRegTrack(track.id)"
                      class="px-2.5 py-1 text-xs border transition-colors"
                      :class="regTeamTracks.includes(track.id) ? 'bg-btn-bg text-btn-text border-btn-bg' : 'border-border text-text-secondary hover:border-border-hover'"
                    >
                      {{ track.label }}
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1">GitHub Repo (optional)</label>
                  <input v-model="regTeamGithubRepo" type="text" placeholder="https://github.com/..." :class="inputClass" />
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1">Model (optional)</label>
                  <select v-model="regTeamModel" :class="[inputClass, 'appearance-none']">
                    <option value="">Select a model</option>
                    <option v-for="m in modelChoices" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1">Project Idea (optional)</label>
                  <input v-model="regTeamProjectIdea" type="text" placeholder="One sentence about your idea" :class="inputClass" />
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1">Max Team Size</label>
                  <select v-model="regTeamMaxSize" :class="[inputClass, 'appearance-none']">
                    <option :value="1">1 person (solo)</option>
                    <option :value="2">2 people</option>
                    <option :value="3">3 people</option>
                    <option :value="4">4 people</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <div class="relative">
                      <input type="checkbox" v-model="regTeamLocked" class="sr-only peer" />
                      <div class="w-9 h-5 bg-border rounded-full peer-checked:bg-accent-blue transition-colors"></div>
                      <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-bg-card rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span class="text-sm text-text-secondary">Lock team (no join requests)</span>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="registerNeedsConfirm" class="p-4 bg-green-900/30 border border-green-500/30 text-green-300 text-sm text-center">
              A confirmation email has been sent to <strong>{{ confirmedEmail }}</strong>. Please check your inbox and click the link to activate your account.
            </div>
            <template v-else>
              <p v-if="!regLookingForTeam && !regWantCreateTeam" class="text-xs text-amber-400 text-center -mt-2">
                Please choose at least one: <strong>Looking for a team</strong> or <strong>Create a team now</strong>.
              </p>
              <button type="submit" :disabled="authLoading || (regWantCreateTeam && !regTeamName.trim()) || (!regLookingForTeam && !regWantCreateTeam)" class="w-full py-3 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors disabled:opacity-50">
                {{ authLoading ? 'Registering...' : regWantCreateTeam ? 'Register & Create Team' : 'Register' }}
              </button>
              <p class="text-center text-xs text-text-secondary">
                Already have an account?
                <button type="button" @click="authModalTab = 'login'; authError = ''" class="text-accent hover:underline">Login</button>
              </p>
            </template>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Profile Edit Modal -->
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showProfileModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showProfileModal = false"></div>

        <div class="relative w-full max-w-md glass-card p-8 max-h-[90vh] overflow-y-auto border-accent-blue/20">
          <button @click="showProfileModal = false" class="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <h3 class="text-lg font-bold text-text-primary mb-6">Edit Profile</h3>

          <div v-if="authError" class="mb-4 p-3  bg-badge-danger-bg border border-accent-red/30 text-badge-danger-text text-sm">{{ authError }}</div>

          <form @submit.prevent="saveProfile" class="space-y-4">
            <div>
              <label class="block text-sm text-text-secondary mb-1">Name</label>
              <input v-model="profileName" type="text" required :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-1">GitHub Username</label>
              <input v-model="profileGithubId" type="text" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-1">Role</label>
              <select v-model="profileRole" :class="[inputClass, 'appearance-none']">
                <option value="">Select role</option>
                <option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-1">Bio</label>
              <textarea v-model="profileBio" rows="3" :class="inputClass" placeholder="Tell others about yourself..."></textarea>
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-2">Interested Themes</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="track in trackOptions"
                  :key="track.id"
                  type="button"
                  @click="toggleProfileTheme(track.id)"
                  class="px-3 py-1.5 text-xs rounded-full border transition-colors"
                  :class="profileThemes.includes(track.id) ? 'bg-btn-bg text-btn-text border-btn-bg' : 'border-border text-text-secondary hover:border-border-strong'"
                >
                  {{ track.label }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-2">Preferred Model</label>
              <div class="flex gap-3">
                <button
                  v-for="m in modelChoices"
                  :key="m"
                  type="button"
                  @click="profilePreferredModel = profilePreferredModel === m ? '' : m"
                  class="px-3 py-1.5 text-xs rounded-full border transition-colors"
                  :class="profilePreferredModel === m ? 'bg-btn-bg text-btn-text border-btn-bg' : 'border-border text-text-secondary hover:border-border-strong'"
                >
                  {{ m }}
                </button>
              </div>
            </div>
            <!-- Social links with stronger guidance -->
            <div class="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                <span class="text-sm font-medium text-text-primary">Social links</span>
              </div>
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                      <svg class="w-3.5 h-3.5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                      Discord
                    </label>
                    <input v-model="profileDiscord" type="text" placeholder="username" :class="[inputClass, profileDiscord ? 'border-emerald-500/50' : '']" />
                  </div>
                  <div>
                    <label class="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                      <svg class="w-3.5 h-3.5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      Twitter / X
                    </label>
                    <input v-model="profileTwitter" type="text" placeholder="@handle" :class="[inputClass, profileTwitter ? 'border-emerald-500/50' : '']" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                      <svg class="w-3.5 h-3.5 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                      Telegram
                    </label>
                    <input v-model="profileTelegram" type="text" placeholder="@username" :class="[inputClass, profileTelegram ? 'border-emerald-500/50' : '']" />
                  </div>
                  <div>
                    <label class="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                      <svg class="w-3.5 h-3.5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </label>
                    <input v-model="profileLinkedin" type="text" placeholder="yourname" :class="[inputClass, profileLinkedin ? 'border-emerald-500/50' : '']" />
                  </div>
                </div>
                <div>
                  <label class="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                    <svg class="w-3.5 h-3.5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                    Personal Website
                  </label>
                  <input v-model="profileWebsite" type="text" placeholder="https://yoursite.com" :class="[inputClass, profileWebsite ? 'border-emerald-500/50' : '']" />
                </div>
              </div>
            </div>
            <label class="flex items-center gap-3 cursor-pointer">
              <div class="relative">
                <input type="checkbox" v-model="profileLookingForTeam" class="sr-only peer" />
                <div class="w-9 h-5 bg-border rounded-full peer-checked:bg-emerald-500 transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-bg-card rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
              </div>
              <span class="text-sm text-text-secondary">Looking for a team</span>
            </label>
            <button type="submit" :disabled="profileLoading" class="w-full py-3 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors disabled:opacity-50">
              {{ profileLoading ? 'Saving...' : 'Save Profile' }}
            </button>
            <div v-if="user && profileQr" class="flex flex-col items-center pt-4 mt-4 border-t border-border">
              <p class="text-xs text-text-muted uppercase tracking-wider mb-2">Your Identity QR Code</p>
              <img :src="profileQr" class="w-28 h-28" />
              <p class="text-[10px] text-text-muted mt-1">Show this at entrance for check-in</p>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- My Team Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showMyTeamModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showMyTeamModal = false"></div>
          <div class="relative bg-bg-card border border-border w-full max-w-md max-h-[80vh] overflow-y-auto">
            <button @click="showMyTeamModal = false" class="absolute top-4 right-4 text-text-secondary hover:text-text-primary">✕</button>

            <!-- Leader 视图 -->
            <template v-if="myTeam && myTeam.leaderId === user?.id">
              <div class="p-6">
                <h3 class="text-lg font-bold text-text-primary mb-1">My Team — {{ myTeam.name }}</h3>
                <p class="text-xs text-text-tertiary mb-6">You are the team leader</p>

                <!-- 成员列表 -->
                <div class="mb-6">
                  <p class="text-xs text-text-muted uppercase tracking-wider mb-3 font-semibold">Members ({{ myTeam.members.length }}/{{ myTeam.maxSize }})</p>
                  <div class="space-y-2">
                    <div v-for="m in myTeam.members" :key="m.id" class="flex items-center gap-3 p-2 bg-bg-elevated">
                      <img :src="m.avatar || `https://avatars.githubusercontent.com/${m.githubId}`" class="w-8 h-8 rounded-full object-cover" />
                      <span class="text-sm text-text-primary">{{ m.name }}</span>
                      <span v-if="m.id === myTeam.leaderId" class="text-xs text-amber-500">Lead</span>
                    </div>
                  </div>
                </div>

                <!-- 待审批 -->
                <div v-if="myTeam.pendingUsers?.length">
                  <p class="text-xs text-amber-500 uppercase tracking-wider mb-3 font-semibold">Pending Requests ({{ myTeam.pendingUsers.length }})</p>
                  <div class="space-y-2">
                    <div v-for="pu in myTeam.pendingUsers" :key="pu.id" class="flex items-center justify-between gap-3 p-2 bg-bg-elevated border border-amber-600/20">
                      <div class="flex items-center gap-3">
                        <img :src="pu.avatar || `https://avatars.githubusercontent.com/${pu.githubId}`" class="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p class="text-sm text-text-primary">{{ pu.name }}</p>
                          <p class="text-xs text-text-tertiary">{{ pu.role }}</p>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button @click="handleApprove(myTeam!.id, pu.id)" class="px-3 py-1 text-xs bg-btn-bg text-btn-text hover:bg-btn-hover transition-colors">Approve</button>
                        <button @click="handleReject(myTeam!.id, pu.id)" class="px-3 py-1 text-xs border border-border text-text-secondary hover:text-text-primary transition-colors">Decline</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-text-tertiary">No pending requests.</div>
              </div>
            </template>

            <!-- 成员/Pending 视图 -->
            <template v-else>
              <div class="p-6">
                <h3 class="text-lg font-bold text-text-primary mb-6">My Team</h3>

                <!-- 已加入的团队 -->
                <div v-if="user?.teamId && myTeam" class="mb-6">
                  <div class="flex items-center gap-4 mb-3">
                    <img :src="myTeam.avatar || '/default-team-avatar.svg'" class="w-12 h-12 rounded-[10px] object-cover dark:invert" />
                    <div>
                      <p class="font-bold text-text-primary">{{ myTeam.name }}</p>
                      <p class="text-xs text-emerald-500 mt-0.5">Member</p>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div v-for="m in myTeam.members" :key="m.id" class="flex items-center gap-3 p-2 bg-bg-elevated">
                      <img :src="m.avatar || `https://avatars.githubusercontent.com/${m.githubId}`" class="w-8 h-8 rounded-full object-cover" />
                      <span class="text-sm text-text-primary">{{ m.name }}</span>
                      <span v-if="m.id === myTeam.leaderId" class="text-xs text-amber-500">Lead</span>
                    </div>
                  </div>
                </div>

                <!-- Pending 申请列表 -->
                <div v-if="myPendingTeams.length">
                  <p class="text-xs text-text-muted uppercase tracking-wider mb-3 font-semibold">Pending Applications</p>
                  <div class="space-y-3">
                    <div v-for="t in myPendingTeams" :key="t.id" class="flex items-center justify-between gap-3 p-3 bg-bg-elevated border border-amber-600/20">
                      <div class="flex items-center gap-3">
                        <img :src="t.avatar || '/default-team-avatar.svg'" class="w-10 h-10 rounded-[8px] object-cover dark:invert" />
                        <div>
                          <p class="text-sm font-semibold text-text-primary">{{ t.name }}</p>
                          <p class="text-xs text-amber-500">Pending Approval</p>
                        </div>
                      </div>
                      <button @click="handleCancelJoin(t.id)" class="text-xs text-text-tertiary hover:text-accent-red transition-colors">Cancel</button>
                    </div>
                  </div>
                </div>

                <div v-if="!user?.teamId && !myPendingTeams.length" class="text-sm text-text-tertiary">
                  You haven't joined or applied to any team yet.
                </div>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </Teleport>

  <!-- Change Password Modal -->
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0">
      <div v-if="showChangePasswordModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div class="relative w-full max-w-sm p-8 bg-bg-primary border border-border shadow-2xl">
          <h3 class="text-lg font-bold text-text-primary mb-2">Set a New Password</h3>
          <p class="text-sm text-text-secondary mb-6">Please enter a new password for your account.</p>
          <div v-if="changePwError" class="mb-4 p-3 bg-badge-danger-bg border border-accent-red/30 text-badge-danger-text text-sm">{{ changePwError }}</div>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-text-secondary mb-1">New Password *</label>
              <input v-model="newPassword" type="password" placeholder="At least 6 characters" class="w-full px-4 py-2.5 bg-input-bg border border-input-border text-text-primary placeholder-input-placeholder focus:border-accent/50 focus:outline-none text-sm" />
            </div>
            <div>
              <label class="block text-xs text-text-secondary mb-1">Confirm Password *</label>
              <input v-model="confirmPassword" type="password" placeholder="Repeat new password" class="w-full px-4 py-2.5 bg-input-bg border border-input-border text-text-primary placeholder-input-placeholder focus:border-accent/50 focus:outline-none text-sm" @keyup.enter="handleChangePassword" />
            </div>
            <button @click="handleChangePassword" class="w-full py-3 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors">Change Password</button>
            <button @click="showChangePasswordModal = false" class="w-full py-2 text-xs text-text-tertiary hover:text-text-secondary transition-colors">Skip for now</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Header Toast -->
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2" leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-y-2">
      <div v-if="headerToast" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 text-sm font-medium shadow-lg" :class="headerToast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'">
        {{ headerToast.msg }}
      </div>
    </Transition>
  </Teleport>
</template>
