import axios, { AxiosError } from 'axios'
import { buildAuthHeaders } from '@/lib/authHeaders'

enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

export interface FormFieldPayload {
  field_name: string
  label: string
  field_type: 'text' | 'textarea' | 'email' | 'number' | 'date' | 'url' | 'phone' | 'file' | 'dropdown' | 'radio' | 'checkbox'
  is_required: boolean
  help_text?: string
  order?: number
  options?: Array<string | { label: string; value: string }>
  max_length?: number | null
  min_value?: number | null
  max_value?: number | null
  allowed_file_types?: string[] | null
  max_file_size?: number | null
  conditional_logic?: any
}

export interface CreateProgramFormPayload {
  program: number
  title: string
  description?: string
  is_default?: boolean
  age_min?: number | null
  age_max?: number | null
  fields: FormFieldPayload[]
}

export interface ProgramFormStructure {
  id: number
  title: string
  description: string
  slug: string
  is_default: boolean
  age_min: number | null
  age_max: number | null
  fields: Array<{
    id: number
    field_name: string
    label: string
    field_type: string
    is_required: boolean
    help_text?: string
    order: number
    options?: any
    max_length?: number | null
    min_value?: number | null
    max_value?: number | null
    allowed_file_types?: string[] | null
    max_file_size?: number | null
    conditional_logic?: any
  }>
}

export const formsService = {
  async createProgramForm(payload: CreateProgramFormPayload): Promise<ProgramFormStructure> {
    const headers = buildAuthHeaders()
    try {
      const res = await axios.post(`${API_BASE}/program_forms/`, payload, {
        withCredentials: true,
        headers: Object.keys(headers).length ? headers : undefined,
      })
      return res.data
    } catch (err) {
      const axiosErr = err as AxiosError
      throw new Error((axiosErr.response?.data as any)?.detail ?? axiosErr.message)
    }
  },

  async getFormStructureBySlug(slug: string): Promise<ProgramFormStructure> {
    try {
      const res = await axios.get(`${API_BASE}/program_forms/${slug}/structure/`)
      return res.data
    } catch (err) {
      const axiosErr = err as AxiosError
      throw new Error((axiosErr.response?.data as any)?.detail ?? axiosErr.message)
    }
  },
}
