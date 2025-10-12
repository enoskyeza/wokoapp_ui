// Centralized helper to build Authorization and CSRF headers for API requests
// Works in browser environments only; on server it returns an empty object.

/**
 * Get authentication token from localStorage or cookies
 * Supports both Token and Bearer authentication formats
 */
export function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  
  // 1. Check localStorage first (for client-side stored tokens)
  const localStorageKeys = ['auth-token', 'authToken', 'access_token', 'token']
  for (const key of localStorageKeys) {
    const v = window.localStorage.getItem(key)
    if (v) return v
  }
  
  // 2. Check cookies (fallback for cookie-based auth)
  if (typeof document !== 'undefined') {
    const cookieKeys = ['authToken', 'auth-token', 'token']
    for (const key of cookieKeys) {
      const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]+)`))
      if (match) return decodeURIComponent(match[1])
    }
  }
  
  return undefined
}

export function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

/**
 * Build authentication headers for API requests
 * Uses Token authentication (DRF standard) instead of Bearer
 */
export function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const csrf = getCsrfToken()
  const token = getAuthToken()
  
  // Use "Token" prefix for DRF TokenAuthentication
  if (token) headers['Authorization'] = `Token ${token}`
  if (csrf) headers['X-CSRFToken'] = csrf
  
  return headers
}
