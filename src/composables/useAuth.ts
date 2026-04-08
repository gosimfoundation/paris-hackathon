import { ref, provide, inject, type InjectionKey, type Ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

export interface User {
  id: string
  name: string
  email?: string
  githubId: string
  role: string
  avatar: string
  themes: string[]
  preferredModel: string
  bio: string
  discord: string
  twitter: string
  telegram: string
  linkedin: string
  website: string
  teamId: string | null
  lookingForTeam: boolean
  passwordChanged: boolean
  createdAt: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  githubId: string
  role: string
  avatar: string
  themes: string[]
  preferredModel: string
  bio: string
  discord: string
  twitter: string
  telegram: string
  linkedin: string
  website: string
  lookingForTeam: boolean
}

const AUTH_KEY: InjectionKey<{
  user: Ref<User | null>
  isLoggedIn: Ref<boolean>
  register: (data: RegisterData) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  changePassword: (newPassword: string) => Promise<boolean>
  fetchMe: () => Promise<void>
  error: Ref<string>
  showAuthModal: Ref<boolean>
  authModalTab: Ref<'login' | 'register'>
  showChangePasswordModal: Ref<boolean>
  promptAuth: (tab?: 'login' | 'register') => void
}> = Symbol('auth')

const user = ref<User | null>(null)
const isLoggedIn = ref(false)
const error = ref('')
const showAuthModal = ref(false)
const authModalTab = ref<'login' | 'register'>('register')
const showChangePasswordModal = ref(false)

function promptAuth(tab: 'login' | 'register' = 'register') {
  authModalTab.value = tab
  error.value = ''
  showAuthModal.value = true
}

function profileRowToUser(row: Record<string, any>, email?: string): User {
  return {
    id: row.id,
    name: row.name,
    email: email ?? '',
    githubId: row.github_id ?? '',
    role: row.role ?? '',
    avatar: row.avatar ?? '',
    themes: row.themes ?? [],
    preferredModel: row.preferred_model ?? '',
    bio: row.bio ?? '',
    discord: row.discord ?? '',
    twitter: row.twitter ?? '',
    telegram: row.telegram ?? '',
    linkedin: row.linkedin ?? '',
    website: row.website ?? '',
    teamId: row.team_id ?? null,
    lookingForTeam: row.looking_for_team ?? false,
    passwordChanged: row.password_changed ?? false,
    createdAt: row.created_at ?? '',
  }
}

export function provideAuth() {
  async function fetchMe() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (profile) {
      user.value = profileRowToUser(profile, session.user.email)
    } else {
      // profile 还未创建（触发器延迟），用 session 构建基础对象
      user.value = {
        id: session.user.id,
        name: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? '',
        email: session.user.email,
        githubId: '', role: '', avatar: '', themes: [], preferredModel: '',
        bio: '', discord: '', twitter: '', telegram: '', linkedin: '', website: '',
        teamId: null, lookingForTeam: false, passwordChanged: true, createdAt: session.user.created_at,
      }
    }
    isLoggedIn.value = true
  }

  async function register(data: RegisterData): Promise<boolean> {
    error.value = ''
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    })
    if (signUpError) { error.value = signUpError.message; return false }
    if (!authData.user) { error.value = 'Registration failed'; return false }

    // 确保 session 已设置，RLS 才能识别 auth.uid()
    if (authData.session) {
      await supabase.auth.setSession(authData.session)
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      email: data.email,
      name: data.name,
      github_id: data.githubId,
      role: data.role,
      avatar: data.avatar,
      themes: data.themes,
      preferred_model: data.preferredModel,
      bio: data.bio,
      discord: data.discord,
      twitter: data.twitter,
      telegram: data.telegram,
      linkedin: data.linkedin,
      website: data.website,
      looking_for_team: data.lookingForTeam,
    })
    if (profileError) { error.value = profileError.message; return false }
    await fetchMe()
    return true
  }

  async function login(email: string, password: string): Promise<boolean> {
    error.value = ''
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { error.value = signInError.message; return false }
    await fetchMe()
    if (user.value && !user.value.passwordChanged) {
      showChangePasswordModal.value = true
    }
    return true
  }

  async function changePassword(newPassword: string): Promise<boolean> {
    error.value = ''
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
    if (updateErr) { error.value = updateErr.message; return false }
    if (user.value) {
      await supabase.from('profiles').update({ password_changed: true }).eq('id', user.value.id)
      user.value.passwordChanged = true
    }
    showChangePasswordModal.value = false
    return true
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    isLoggedIn.value = false
  }

  async function updateProfile(data: Partial<User>): Promise<boolean> {
    if (!user.value) return false
    error.value = ''
    const { error: updateError } = await supabase.from('profiles').update({
      name: data.name,
      github_id: data.githubId,
      role: data.role,
      avatar: data.avatar,
      themes: data.themes,
      preferred_model: data.preferredModel,
      bio: data.bio,
      discord: data.discord,
      twitter: data.twitter,
      telegram: data.telegram,
      linkedin: data.linkedin,
      website: data.website,
      looking_for_team: data.lookingForTeam,
      team_id: data.teamId,
    }).eq('id', user.value.id)
    if (updateError) { error.value = updateError.message; return false }
    await fetchMe()
    return true
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      user.value = null
      isLoggedIn.value = false
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      fetchMe()
    }
  })

  onMounted(() => fetchMe())

  const ctx = { user, isLoggedIn, register, login, logout, updateProfile, changePassword, fetchMe, error, showAuthModal, authModalTab, showChangePasswordModal, promptAuth }
  provide(AUTH_KEY, ctx)
  return ctx
}

export function useAuth() {
  const auth = inject(AUTH_KEY)
  if (!auth) throw new Error('useAuth() called without provideAuth()')
  return auth
}
