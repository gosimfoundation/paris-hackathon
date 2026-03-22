// In-memory store for demo. On Vercel serverless each cold start resets.
// For production, connect Upstash Redis or Supabase.
// Set env vars KV_REST_API_URL + KV_REST_API_TOKEN to enable persistent storage.

interface TeamMember {
  name: string
  role: string
}

interface Team {
  id: string
  name: string
  contactEmail: string
  track: string
  members: TeamMember[]
  models: string[]
  projectIdea: string
  createdAt: string
}

const MAX_PARTICIPANTS = 100

// Try Upstash Redis if configured, otherwise in-memory
let memoryStore: Team[] = []

async function getTeams(): Promise<Team[]> {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (url && token) {
    try {
      const res = await fetch(`${url}/get/hackathon:teams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.result) return JSON.parse(data.result)
    } catch {}
  }
  return memoryStore
}

async function setTeams(teams: Team[]): Promise<void> {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (url && token) {
    try {
      await fetch(`${url}/set/hackathon:teams`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(teams)),
      })
    } catch {}
  }
  memoryStore = teams
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  try {
    if (req.method === 'GET') {
      const teams = await getTeams()
      const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0)

      // Strip contactEmail from public response
      const publicTeams = teams.map(({ contactEmail, ...rest }) => rest)

      return Response.json(
        { teams: publicTeams, totalMembers, maxParticipants: MAX_PARTICIPANTS },
        { headers: corsHeaders() }
      )
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { name, contactEmail, track, members, models, projectIdea } = body as {
        name: string
        contactEmail: string
        track: string
        members: TeamMember[]
        models: string[]
        projectIdea: string
      }

      if (!name?.trim()) {
        return Response.json({ error: 'Team name is required' }, { status: 400, headers: corsHeaders() })
      }
      if (!contactEmail?.trim() || !contactEmail.includes('@')) {
        return Response.json({ error: 'Valid contact email is required' }, { status: 400, headers: corsHeaders() })
      }
      if (!members?.length || members.length > 3) {
        return Response.json({ error: '1-3 members required' }, { status: 400, headers: corsHeaders() })
      }
      if (members.some((m) => !m?.name?.trim())) {
        return Response.json({ error: 'All member names are required' }, { status: 400, headers: corsHeaders() })
      }
      if (!track?.trim()) {
        return Response.json({ error: 'Track selection is required' }, { status: 400, headers: corsHeaders() })
      }

      const teams = await getTeams()
      const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0)

      if (totalMembers + members.length > MAX_PARTICIPANTS) {
        return Response.json({ error: 'Registration is full' }, { status: 409, headers: corsHeaders() })
      }

      const newTeam: Team = {
        id: generateId(),
        name: name.trim(),
        contactEmail: contactEmail.trim(),
        track,
        members: members.map((m) => ({ name: m.name.trim(), role: m.role || '' })),
        models: models || [],
        projectIdea: (projectIdea || '').trim(),
        createdAt: new Date().toISOString(),
      }

      teams.push(newTeam)
      await setTeams(teams)

      const { contactEmail: _, ...publicTeam } = newTeam
      return Response.json(
        { team: publicTeam, totalMembers: totalMembers + members.length, maxParticipants: MAX_PARTICIPANTS },
        { status: 201, headers: corsHeaders() }
      )
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders() })
  } catch (err: any) {
    console.error('API error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders() })
  }
}
