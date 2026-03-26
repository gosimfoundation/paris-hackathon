// When running on GH Pages or other static hosts, point to macmini backend.
// On macmini itself (paris.mofa.ai), use relative paths.
const isLocalBackend = typeof window !== 'undefined' && window.location.hostname === 'paris.mofa.ai'

export const API_BASE = isLocalBackend ? '' : 'https://paris.mofa.ai'
