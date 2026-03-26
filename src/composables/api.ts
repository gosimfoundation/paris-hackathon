// When running on GH Pages or other static hosts, point to macmini backend.
// On macmini itself (paris.mofa.ai), use relative paths.
const isLocalBackend = typeof window !== 'undefined' && window.location.hostname === 'paris.mofa.ai'

export const API_BASE = isLocalBackend ? '' : 'https://paris.mofa.ai'

// Prefix dynamic image URLs (uploads, avatars) with API_BASE
export function assetUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/uploads/')) return `${API_BASE}${path}`
  return path
}
