const isLocalBackend = typeof window !== 'undefined' && window.location.hostname === 'paris.mofa.ai'

export const API_BASE = isLocalBackend ? '' : 'https://paris.mofa.ai'
const BASE_URL = import.meta.env.BASE_URL // '/' or '/paris2026/'

// Resolve image paths: uploads go to backend, static assets use base path
export function assetUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/uploads/')) return `${API_BASE}${path}`
  // Static assets (sponsors, icons, default-avatar) — use vite base path
  if (path.startsWith('/')) return `${BASE_URL}${path.slice(1)}`
  return path
}
