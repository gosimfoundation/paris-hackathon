<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useAuth } from '../../composables/useAuth'
import { useTheme } from '../../composables/useTheme'
import { useTeams } from '../../composables/useTeams'
import { assetUrl } from '../../composables/api'

const { t, locale, toggleLocale } = useI18n()
const { user, isLoggedIn, login, register, logout, updateProfile, error: authError, showAuthModal, authModalTab } = useAuth()
const { isDark, toggleTheme } = useTheme()
const { createTeam } = useTeams()

const scrolled = ref(false)
const mobileOpen = ref(false)

const navItems = computed(() => [
  { label: t('nav.about'), href: '#about' },
  { label: t('nav.themes'), href: '#themes' },
  { label: t('nav.schedule'), href: '#schedule' },
  { label: t('nav.awards'), href: '#awards' },
  { label: t('nav.judging'), href: '#judging' },
  { label: t('nav.teams'), href: '#teams' },
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

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

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
const regLookingForTeam = ref(false)
const regWantCreateTeam = ref(false)
const regTeamName = ref('')
const regTeamTracks = ref<string[]>([])

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
    regLookingForTeam.value = false
    regWantCreateTeam.value = false
    regTeamName.value = ''
    regTeamTracks.value = []
  }
})

async function submitLogin() {
  authLoading.value = true
  const ok = await login(loginEmail.value, loginPassword.value)
  authLoading.value = false
  if (ok) showAuthModal.value = false
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
    lookingForTeam: regLookingForTeam.value,
  })
  if (ok && regWantCreateTeam.value && regTeamName.value.trim()) {
    await createTeam({
      name: regTeamName.value.trim(),
      avatar: '',
      githubRepo: '',
      themes: regTeamTracks.value,
      model: '',
      projectIdea: '',
      locked: false,
      maxSize: 3,
    })
  }
  authLoading.value = false
  if (ok) {
    showAuthModal.value = false
    setTimeout(() => {
      document.getElementById('teams')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
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

const modelChoices = ['GLM', 'MiniMax', 'Kimi']

function openProfileModal() {
  showUserDropdown.value = false
  if (user.value) {
    profileName.value = user.value.name
    profileGithubId.value = user.value.githubId
    profileRole.value = user.value.role
    profileBio.value = user.value.bio || ''
    profileThemes.value = [...(user.value.themes || [])]
    profilePreferredModel.value = user.value.preferredModel || ''
    profileLookingForTeam.value = user.value.lookingForTeam
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
      <a href="https://gosim.org" target="_blank" class="flex items-center gap-3 group">
        <img :src="isDark ? assetUrl('/gosim-logo-white.svg') : assetUrl('/gosim-logo.svg')" alt="GOSIM" class="h-7 w-auto" />
        <span class="text-xs text-text-tertiary font-light tracking-widest uppercase">Hackathon</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-5">
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
            <button @click="showUserDropdown = !showUserDropdown" class="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
              <img :src="assetUrl(user.avatar) || assetUrl('/default-avatar.svg')" class="w-7 h-7 rounded-full object-cover border border-border" />
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
              <div v-if="showUserDropdown" class="absolute right-0 top-full mt-2 w-40 bg-bg-card border border-border  shadow-lg py-1 z-50">
                <button @click="openProfileModal" class="w-full text-left px-4 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  Edit Profile
                </button>
                <button @click="handleLogout(); showUserDropdown = false" class="w-full text-left px-4 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  Logout
                </button>
              </div>
            </Transition>
          </div>
        </template>
        <a
          href="#teams"
          class="px-5 py-2 bg-btn-bg text-btn-text text-xs font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors"
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
        <button
          @click="toggleLocale"
          class="block py-3 text-text-tertiary hover:text-text-primary transition-colors font-mono text-sm"
        >
          {{ locale === 'en' ? '切换中文' : 'Switch to English' }}
        </button>

        <!-- Mobile user area -->
        <template v-if="isLoggedIn && user">
          <div class="flex items-center gap-2 py-3 border-t border-border-subtle mt-2">
            <img :src="assetUrl(user.avatar) || assetUrl('/default-avatar.svg')" class="w-7 h-7 rounded-full object-cover border border-border" />
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
            <p class="text-center text-xs text-text-secondary">
              Don't have an account?
              <button type="button" @click="authModalTab = 'register'; authError = ''" class="text-accent hover:underline">Register</button>
            </p>
          </form>

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
              </div>
            </div>

            <button type="submit" :disabled="authLoading || (regWantCreateTeam && !regTeamName.trim())" class="w-full py-3 bg-btn-bg text-btn-text text-sm font-semibold tracking-widest uppercase hover:bg-btn-hover transition-colors disabled:opacity-50">
              {{ authLoading ? 'Registering...' : regWantCreateTeam ? 'Register & Create Team' : 'Register' }}
            </button>
            <p class="text-center text-xs text-text-secondary">
              Already have an account?
              <button type="button" @click="authModalTab = 'login'; authError = ''" class="text-accent hover:underline">Login</button>
            </p>
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
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
