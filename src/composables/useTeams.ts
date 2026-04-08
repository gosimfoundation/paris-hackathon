import { ref, computed, onMounted } from 'vue'
import type { User } from './useAuth'
import { supabase } from '../lib/supabase'

export interface Team {
  id: string
  name: string
  leaderId: string
  avatar: string
  githubRepo: string
  themes: string[]
  model: string
  projectIdea: string
  locked: boolean
  maxSize: number
  likes: number
  members: User[]
  pendingJoins?: string[]
  pendingUsers?: User[]
  createdAt: string
}

const teams = ref<Team[]>([])
const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const lastUpdated = ref<Date | null>(null)

let realtimeSetup = false

function profileRowToUser(row: Record<string, any>): User {
  return {
    id: row.id,
    name: row.name,
    email: '',
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

function teamRowToTeam(row: Record<string, any>, allUsers: User[]): Team {
  const members = allUsers.filter(u => u.teamId === row.id)
  const pendingUsers = allUsers.filter(u => (row.pending_joins ?? []).includes(u.id))
  return {
    id: row.id,
    name: row.name,
    leaderId: row.leader_id,
    avatar: row.avatar ?? '',
    githubRepo: row.github_repo ?? '',
    themes: row.themes ?? [],
    model: row.model ?? '',
    projectIdea: row.project_idea ?? '',
    locked: row.locked ?? false,
    maxSize: row.max_size ?? 3,
    likes: row.likes ?? 0,
    members,
    pendingJoins: row.pending_joins ?? [],
    pendingUsers,
    createdAt: row.created_at ?? '',
  }
}

export function useTeams() {
  const totalMembers = computed(() => users.value.filter(u => u.teamId).length)
  const totalRegistered = computed(() => users.value.length)
  const maxParticipants = ref(100)
  const spotsLeft = computed(() => maxParticipants.value - totalMembers.value)
  const isFull = computed(() => spotsLeft.value <= 0)
  const progress = computed(() => (totalMembers.value / maxParticipants.value) * 100)

  const modelStats = computed(() => {
    const stats: Record<string, number> = { MiniMax: 0, Kimi: 0, GLM: 0 }
    teams.value.forEach((t) => {
      if (t.model && t.model in stats) stats[t.model]++
    })
    return stats
  })

  async function fetchTeams() {
    const [{ data: profileRows }, { data: teamRows }] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('teams').select('*'),
    ])
    const allUsers = (profileRows ?? []).map(profileRowToUser)
    users.value = allUsers
    teams.value = (teamRows ?? []).map(r => teamRowToTeam(r, allUsers))
    lastUpdated.value = new Date()
  }

  async function createTeam(payload: {
    name: string
    avatar: string
    githubRepo: string
    themes: string[]
    model: string
    projectIdea: string
    locked: boolean
    maxSize: number
  }) {
    loading.value = true
    error.value = ''
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { error.value = 'Not logged in'; loading.value = false; return false }
    try {
      const { data: team, error: insertError } = await supabase.from('teams').insert({
        name: payload.name,
        leader_id: session.user.id,
        avatar: payload.avatar,
        github_repo: payload.githubRepo,
        themes: payload.themes,
        model: payload.model,
        project_idea: payload.projectIdea,
        locked: payload.locked,
        max_size: payload.maxSize,
      }).select().single()
      if (insertError) { error.value = insertError.message; return false }
      // 把自己加入团队
      await supabase.from('profiles').update({ team_id: team.id }).eq('id', session.user.id)
      await fetchTeams()
      return true
    } catch { error.value = 'Network error'; return false }
    finally { loading.value = false }
  }

  async function editTeam(teamId: string, payload: Record<string, any>) {
    loading.value = true
    error.value = ''
    try {
      const update: Record<string, any> = {}
      if (payload.name !== undefined) update.name = payload.name
      if (payload.avatar !== undefined) update.avatar = payload.avatar
      if (payload.githubRepo !== undefined) update.github_repo = payload.githubRepo
      if (payload.themes !== undefined) update.themes = payload.themes
      if (payload.model !== undefined) update.model = payload.model
      if (payload.projectIdea !== undefined) update.project_idea = payload.projectIdea
      if (payload.locked !== undefined) update.locked = payload.locked
      if (payload.maxSize !== undefined) update.max_size = payload.maxSize

      const { error: updateError } = await supabase.from('teams').update(update).eq('id', teamId)
      if (updateError) { error.value = updateError.message; return false }
      await fetchTeams()
      return true
    } catch { error.value = 'Network error'; return false }
    finally { loading.value = false }
  }

  async function cancelJoin(teamId: string) {
    loading.value = true
    error.value = ''
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { error.value = 'Not logged in'; loading.value = false; return false }
    try {
      const team = teams.value.find(t => t.id === teamId)
      if (!team) { error.value = 'Team not found'; return false }
      const pendingJoins = (team.pendingJoins ?? []).filter(id => id !== session.user.id)
      const { data: updated, error: updateError } = await supabase.from('teams').update({ pending_joins: pendingJoins }).eq('id', teamId).select('id')
      if (updateError) { error.value = updateError.message; console.error('[cancelJoin] error:', updateError); return false }
      if (!updated || updated.length === 0) { error.value = 'Permission denied (RLS)'; console.error('[cancelJoin] 0 rows updated — RLS blocked?', { teamId, userId: session.user.id }); return false }
      await fetchTeams()
      return true
    } catch (e) { error.value = 'Network error'; console.error('[cancelJoin] exception:', e); return false }
    finally { loading.value = false }
  }

  async function deleteTeam(teamId: string) {
    loading.value = true
    error.value = ''
    try {
      const { error: deleteError } = await supabase.from('teams').delete().eq('id', teamId)
      if (deleteError) { error.value = deleteError.message; return false }
      await fetchTeams()
      return true
    } catch { error.value = 'Network error'; return false }
    finally { loading.value = false }
  }

  async function joinTeam(teamId: string) {
    loading.value = true
    error.value = ''
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { error.value = 'Not logged in'; loading.value = false; return false }
    try {
      const team = teams.value.find(t => t.id === teamId)
      if (!team) { error.value = 'Team not found'; return false }
      if (team.members.length >= team.maxSize) { error.value = 'Team is full'; return false }
      if (team.locked) { error.value = 'Team is locked'; return false }
      const pendingJoins = [...(team.pendingJoins ?? []), session.user.id]
      const { data: updated, error: updateError } = await supabase.from('teams').update({ pending_joins: pendingJoins }).eq('id', teamId).select('id')
      if (updateError) { error.value = updateError.message; console.error('[joinTeam] error:', updateError); return false }
      if (!updated || updated.length === 0) { error.value = 'Permission denied (RLS)'; console.error('[joinTeam] 0 rows updated — RLS blocked?', { teamId, userId: session.user.id }); return false }
      await fetchTeams()
      return true
    } catch (e) { error.value = 'Network error'; console.error('[joinTeam] exception:', e); return false }
    finally { loading.value = false }
  }

  async function leaveTeam(_teamId: string) {
    loading.value = true
    error.value = ''
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { error.value = 'Not logged in'; loading.value = false; return false }
    try {
      await supabase.from('profiles').update({ team_id: null }).eq('id', session.user.id)
      await fetchTeams()
      return true
    } catch { error.value = 'Network error'; return false }
    finally { loading.value = false }
  }

  async function approveJoin(teamId: string, userId: string) {
    loading.value = true
    error.value = ''
    try {
      const team = teams.value.find(t => t.id === teamId)
      if (!team) { error.value = 'Team not found'; return false }
      if (team.members.length >= team.maxSize) { error.value = 'Team is full'; return false }
      // 用 security definer 函数绕过 RLS（可跨用户写 profiles.team_id）
      const { error: fnError } = await supabase.rpc('approve_team_member', {
        p_team_id: teamId,
        p_user_id: userId,
      })
      if (fnError) { error.value = fnError.message; return false }
      await fetchTeams()
      return true
    } catch { error.value = 'Network error'; return false }
    finally { loading.value = false }
  }

  async function rejectJoin(teamId: string, userId: string) {
    loading.value = true
    error.value = ''
    try {
      const team = teams.value.find(t => t.id === teamId)
      if (!team) { error.value = 'Team not found'; return false }
      const pendingJoins = (team.pendingJoins ?? []).filter(id => id !== userId)
      const { data: updated, error: updateError } = await supabase.from('teams').update({ pending_joins: pendingJoins }).eq('id', teamId).select('id')
      if (updateError) { error.value = updateError.message; return false }
      if (!updated || updated.length === 0) { error.value = 'Permission denied (RLS)'; return false }
      await fetchTeams()
      return true
    } catch { error.value = 'Network error'; return false }
    finally { loading.value = false }
  }

  async function kickMember(teamId: string, userId: string) {
    loading.value = true
    error.value = ''
    try {
      const { error: fnError } = await supabase.rpc('kick_team_member', {
        p_team_id: teamId,
        p_user_id: userId,
      })
      if (fnError) { error.value = fnError.message; return false }
      await fetchTeams()
      return true
    } catch { error.value = 'Network error'; return false }
    finally { loading.value = false }
  }

  async function likeTeam(teamId: string) {
    const team = teams.value.find(t => t.id === teamId)
    if (!team) return false
    const { error: updateError } = await supabase.from('teams').update({ likes: team.likes + 1 }).eq('id', teamId)
    if (updateError) return false
    team.likes++
    return true
  }

  onMounted(() => {
    fetchTeams()
    if (!realtimeSetup) {
      realtimeSetup = true
      supabase
        .channel('teams-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, fetchTeams)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchTeams)
        .subscribe()
    }
  })

  return {
    teams, users, totalMembers, totalRegistered, maxParticipants, spotsLeft, isFull, progress,
    modelStats, loading, error, lastUpdated,
    fetchTeams, createTeam, editTeam, deleteTeam, joinTeam, cancelJoin, leaveTeam, likeTeam, approveJoin, rejectJoin, kickMember,
  }
}
