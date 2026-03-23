const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3457
const DATA_FILE = path.join(__dirname, 'teams.json')
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const STATIC_DIR = path.join(__dirname, 'dist')
const MAX_PARTICIPANTS = 100

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR)

function readTeams() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch {}
  return []
}

function writeTeams(teams) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(teams, null, 2))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function countMembers(teams) {
  return teams.reduce((s, t) => s + t.members.length, 0)
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function jsonError(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: message }))
}

function parseJson(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', c => data += c)
    req.on('end', () => { try { resolve(JSON.parse(data)) } catch(e) { reject(e) } })
    req.on('error', reject)
  })
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => {
      const buf = Buffer.concat(chunks)
      const boundary = req.headers['content-type'].split('boundary=')[1]
      if (!boundary) return reject(new Error('No boundary'))

      const parts = buf.toString('binary').split('--' + boundary).slice(1, -1)
      const result = { fields: {}, file: null }

      for (const part of parts) {
        const [headerStr, ...bodyParts] = part.split('\r\n\r\n')
        const body = bodyParts.join('\r\n\r\n').replace(/\r\n$/, '')
        const nameMatch = headerStr.match(/name="([^"]+)"/)
        const filenameMatch = headerStr.match(/filename="([^"]+)"/)

        if (nameMatch) {
          if (filenameMatch && body.length > 0) {
            const ext = path.extname(filenameMatch[1]) || '.png'
            const id = generateId()
            const filename = id + ext
            const filepath = path.join(UPLOADS_DIR, filename)
            fs.writeFileSync(filepath, body, 'binary')
            result.file = { field: nameMatch[1], filename, path: filepath }
          } else {
            result.fields[nameMatch[1]] = body
          }
        }
      }
      resolve(result)
    })
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  setCors(res)
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  const pathname = req.url.split('?')[0]
  console.log(`[${req.method}] ${pathname}`)

  // SERVE UPLOADED FILES: GET /uploads/:filename
  if (pathname.startsWith('/uploads/') && req.method === 'GET') {
    const filename = path.basename(pathname)
    const filepath = path.join(UPLOADS_DIR, filename)
    if (fs.existsSync(filepath)) {
      const ext = path.extname(filename).toLowerCase()
      const mimeTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' }
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000' })
      fs.createReadStream(filepath).pipe(res)
    } else {
      res.writeHead(404); res.end('Not found')
    }
    return
  }

  // UPLOAD: POST /api/upload (max 2MB)
  if (pathname === '/api/upload' && req.method === 'POST') {
    const MAX_SIZE = 2 * 1024 * 1024 // 2MB
    const contentLength = parseInt(req.headers['content-length'] || '0')
    if (contentLength > MAX_SIZE) return jsonError(res, 413, 'File too large (max 2MB)')
    try {
      const { file } = await parseMultipart(req)
      if (!file) return jsonError(res, 400, 'No file uploaded')
      // Check actual file size
      const stats = fs.statSync(file.path)
      if (stats.size > MAX_SIZE) {
        fs.unlinkSync(file.path)
        return jsonError(res, 413, 'File too large (max 2MB)')
      }
      const publicUrl = `/uploads/${file.filename}`
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ url: publicUrl }))
    } catch (err) {
      console.error('Upload error:', err)
      jsonError(res, 500, 'Upload failed')
    }
    return
  }

  // JOIN: POST /api/teams/:id/join
  const joinMatch = pathname.match(/^\/api\/teams\/([^/]+)\/join$/)
  if (joinMatch && req.method === 'POST') {
    try {
      const body = await parseJson(req)
      const { name, role, email, githubId, avatar } = body

      if (!name?.trim()) return jsonError(res, 400, 'Name is required')
      if (!email?.trim() || !email.includes('@')) return jsonError(res, 400, 'Valid email is required')

      const teams = readTeams()
      const team = teams.find(t => t.id === joinMatch[1])
      if (!team) return jsonError(res, 404, 'Team not found')
      if (team.members.length >= 3) return jsonError(res, 409, 'Team is full (max 3)')

      const total = countMembers(teams)
      if (total >= MAX_PARTICIPANTS) return jsonError(res, 409, 'Registration is full')

      team.members.push({ name: name.trim(), role: role || '', githubId: (githubId || '').trim(), avatar: avatar || '' })
      if (!team.joinEmails) team.joinEmails = []
      team.joinEmails.push(email.trim())

      writeTeams(teams)

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, totalMembers: countMembers(teams), maxParticipants: MAX_PARTICIPANTS }))
    } catch (err) {
      console.error('Join error:', err)
      jsonError(res, 500, 'Internal server error')
    }
    return
  }

  // TEAMS: GET/POST /api/teams
  if (pathname !== '/api/teams') {
    // Serve static files (frontend)
    serveStatic(req, res, pathname)
    return
  }

  try {
    if (req.method === 'GET') {
      const teams = readTeams()
      const publicTeams = teams.map(({ contactEmail, joinEmails, ...rest }) => rest)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ teams: publicTeams, totalMembers: countMembers(teams), maxParticipants: MAX_PARTICIPANTS }))
      return
    }

    if (req.method === 'POST') {
      const body = await parseJson(req)
      const { name, contactEmail, githubRepo, track, members, models, projectIdea, avatar } = body

      if (!name?.trim()) return jsonError(res, 400, 'Team name is required')
      if (!contactEmail?.trim() || !contactEmail.includes('@')) return jsonError(res, 400, 'Valid contact email is required')
      if (!members?.length || members.length > 3) return jsonError(res, 400, '1-3 members required')
      if (members.some(m => !m?.name?.trim())) return jsonError(res, 400, 'All member names are required')
      if (!track?.trim()) return jsonError(res, 400, 'Track selection is required')

      const teams = readTeams()
      const total = countMembers(teams)

      if (total + members.length > MAX_PARTICIPANTS) return jsonError(res, 409, 'Registration is full')

      const newTeam = {
        id: generateId(),
        name: name.trim(),
        contactEmail: contactEmail.trim(),
        githubRepo: (githubRepo || '').trim(),
        track,
        avatar: (avatar || '').trim(),
        members: members.map(m => ({ name: m.name.trim(), role: m.role || '', githubId: (m.githubId || '').trim() })),
        models: models || [],
        projectIdea: (projectIdea || '').trim(),
        createdAt: new Date().toISOString(),
      }

      teams.push(newTeam)
      writeTeams(teams)

      const { contactEmail: _, joinEmails: _j, ...publicTeam } = newTeam
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ team: publicTeam, totalMembers: total + members.length, maxParticipants: MAX_PARTICIPANTS }))
      return
    }

    jsonError(res, 405, 'Method not allowed')
  } catch (err) {
    console.error('Error:', err)
    jsonError(res, 500, 'Internal server error')
  }
})

function serveStatic(req, res, pathname) {
  const mimeTypes = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff': 'font/woff',
    '.woff2': 'font/woff2', '.mp4': 'video/mp4',
  }

  let filePath = path.join(STATIC_DIR, pathname)

  // If directory or no extension, serve index.html (SPA fallback)
  if (!path.extname(filePath) || !fs.existsSync(filePath)) {
    // Try exact file first
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      // serve it
    } else {
      filePath = path.join(STATIC_DIR, 'index.html')
    }
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404); res.end('Not found'); return
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = mimeTypes[ext] || 'application/octet-stream'
  const cacheControl = ext === '.html' ? 'no-cache' : 'public, max-age=31536000'

  res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': cacheControl })
  fs.createReadStream(filePath).pipe(res)
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`GOSIM Hackathon running on http://127.0.0.1:${PORT}`)
})
