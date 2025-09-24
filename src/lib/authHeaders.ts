// Centralized helper to build Authorization and CSRF headers for API requests
// Works in browser environments only; on server it returns an empty object.

export function getBearerToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const possibleKeys = ['auth-token', 'access_token', 'token']
  for (const key of possibleKeys) {
    const v = window.localStorage.getItem(key)
    if (v) return `Bearer ${v}`
  }
  return undefined
}

export function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

export function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const csrf = getCsrfToken()
  const bearer = getBearerToken()
  if (csrf) headers['X-CSRFToken'] = csrf
  if (bearer) headers['Authorization'] = bearer
  return headers
}
