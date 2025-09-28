import axios, { AxiosError } from 'axios'
import { buildAuthHeaders } from '@/lib/authHeaders'

enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

type ConditionalLogicConfig = Record<string, unknown> | null

type LayoutConfig = Record<string, unknown>

interface ErrorResponse {
  detail?: string
  message?: string
}

interface FormFieldOption {
  label?: string
  value?: string
  [key: string]: unknown
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
  options?: Array<string | FormFieldOption>
  max_length?: number | null
  min_value?: number | null
  max_value?: number | null
  allowed_file_types?: string[] | null
  max_file_size?: number | null
  conditional_logic?: ConditionalLogicConfig
  step_key?: string
  column_span?: number | null
}

export interface CreateProgramFormPayload {
  program: number
  title: string
  description?: string
  is_default?: boolean
  age_min?: number | null
  age_max?: number | null
  fields: FormFieldPayload[]
  steps?: Array<Record<string, unknown>>
  layout_config?: LayoutConfig
}

export interface ProgramFormFieldStructure {
  id: number
  field_name: string
  label: string
  field_type: string
  is_required: boolean
  help_text?: string
  order: number
  options?: Array<string | FormFieldOption>
  max_length?: number | null
  min_value?: number | null
  max_value?: number | null
  allowed_file_types?: string[] | null
  max_file_size?: number | null
  conditional_logic?: ConditionalLogicConfig
  step_key?: string
  column_span?: number | null
}

export interface ProgramFormStructure {
  id: number
  title: string
  description: string
  slug: string
  is_default: boolean
  age_min: number | null
  age_max: number | null
  fields: ProgramFormFieldStructure[]
}

const buildError = (error: AxiosError<ErrorResponse>) => {
  const detail = error.response?.data?.detail || error.response?.data?.message
  return new Error(detail ?? error.message)
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
      const axiosErr = err as AxiosError<ErrorResponse>
      throw buildError(axiosErr)
    }
  },

  async getFormStructureBySlug(slug: string): Promise<ProgramFormStructure> {
    try {
      const res = await axios.get(`${API_BASE}/program_forms/${slug}/structure/`, {
        withCredentials: true,
        headers: buildAuthHeaders(),
      })
      return res.data
    } catch (err) {
      const axiosErr = err as AxiosError<ErrorResponse>
      throw buildError(axiosErr)
    }
  },
}
