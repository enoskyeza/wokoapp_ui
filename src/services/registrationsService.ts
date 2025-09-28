import axios, { AxiosError } from 'axios'
import { buildAuthHeaders } from '@/lib/authHeaders'

enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

export type ApprovalStatus = 'paid' | 'cancelled' | 'refunded'

export async function submitApproval(payload: {
  registration: number
  status: ApprovalStatus
  amount?: number
}): Promise<void> {
  try {
    const headers = buildAuthHeaders()

    await axios.post(`${API_BASE}/approvals/`, payload, {
      withCredentials: true,
      headers: Object.keys(headers).length ? headers : undefined,
    })
  } catch (err) {
    const axiosErr = err as AxiosError<{ detail?: string }>
    const status = axiosErr.response?.status
    if (status === 401 || status === 403) {
      throw new Error('You need to sign in to perform this action.')
    }
    const message = axiosErr.response?.data?.detail ?? axiosErr.message
    throw new Error(message)
  }
}
