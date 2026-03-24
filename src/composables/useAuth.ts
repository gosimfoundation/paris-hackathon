import { ref, provide, inject, type InjectionKey, type Ref, onMounted } from 'vue'

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
  teamId: string | null
  lookingForTeam: boolean
  createdAt: string
}

const AUTH_KEY: InjectionKey<{
  user: Ref<User | null>
  token: Ref<string | null>
  isLoggedIn: Ref<boolean>
  register: (data: RegisterData) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  fetchMe: () => Promise<void>
  error: Ref<string>
}> = Symbol('auth')

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
  lookingForTeam: boolean
}

const user = ref<User | null>(null)
const token = ref<string | null>(localStorage.getItem('auth_token'))
const isLoggedIn = ref(false)
const error = ref('')

function authHeaders(): Record<string, string> {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}

export function provideAuth() {
  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await fetch('/api/me', { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        user.value = data.user
        isLoggedIn.value = true
      } else {
        logout()
      }
    } catch {
      // silent
    }
  }

  async function register(data: RegisterData): Promise<boolean> {
    error.value = ''
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        error.value = result.error || 'Registration failed'
        return false
      }
      token.value = result.token
      user.value = result.user
      isLoggedIn.value = true
      localStorage.setItem('auth_token', result.token)
      return true
    } catch {
      error.value = 'Network error'
      return false
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    error.value = ''
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const result = await res.json()
      if (!res.ok) {
        error.value = result.error || 'Login failed'
        return false
      }
      token.value = result.token
      user.value = result.user
      isLoggedIn.value = true
      localStorage.setItem('auth_token', result.token)
      return true
    } catch {
      error.value = 'Network error'
      return false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('auth_token')
  }

  async function updateProfile(data: Partial<User>): Promise<boolean> {
    if (!user.value || !token.value) return false
    error.value = ''
    try {
      const res = await fetch(`/api/users/${user.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        error.value = result.error || 'Update failed'
        return false
      }
      user.value = result.user
      return true
    } catch {
      error.value = 'Network error'
      return false
    }
  }

  onMounted(() => fetchMe())

  const ctx = { user, token, isLoggedIn, register, login, logout, updateProfile, fetchMe, error }
  provide(AUTH_KEY, ctx)
  return ctx
}

export function useAuth() {
  const auth = inject(AUTH_KEY)
  if (!auth) throw new Error('useAuth() called without provideAuth()')
  return auth
}

export function authHeaders_standalone() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}
