import axios, { AxiosError } from 'axios'
import { buildAuthHeaders } from '@/lib/authHeaders'

enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

// Types for registration form structure
export interface FormField {
  name: string
  label: string
  type: string
  required: boolean
  help_text?: string
  placeholder?: string
  options?: string[]
  max_length?: number
  min_value?: number
  max_value?: number
  allowed_file_types?: string[]
  max_file_size?: number
  conditional_logic?: Record<string, unknown>
  per_participant?: boolean
  column_span?: number | null
  columnSpan?: number | null
}

export interface FormStep {
  step: number
  title: string
  description: string
  editable: boolean
  per_participant?: boolean
  fields: FormField[]
  layout?: {
    columns?: number
    [key: string]: unknown
  }
  layout_columns?: number | null
}

export interface RegistrationFormStructure {
  program: {
    id: number
    name: string
    description: string
    registration_fee: number
    age_min?: number
    age_max?: number
    category_label?: string
    category_options?: string[]
  }
  form_structure: {
    static_steps: FormStep[]
    dynamic_steps: FormStep[]
    total_steps: number
  }
}

// Types for school management
export interface School {
  id: number
  name: string
  address?: string
  phone_number?: string
}

export interface CreateSchoolPayload {
  name: string
  address?: string
  phone_number?: string
  email?: string
}

// Types for API error responses
interface ApiErrorResponse {
  detail?: string;
  guardian?: Record<string, string[]>;
  participants?: Record<string, string[]>;
  program?: Record<string, string[]>;
  [key: string]: unknown;
}

// Types for registration submission
export interface GuardianData {
  first_name: string
  last_name: string
  email?: string
  phone_number: string
  profession?: string
  address?: string
}

export interface ParticipantData {
  first_name: string
  last_name: string
  email?: string
  gender: 'M' | 'F'
  age_at_registration: number
  school_at_registration: {
    id?: number
    name?: string
    address?: string
    phone_number?: string
  }
  category_value?: string
}

export interface ParticipantCustomFieldPayload {
  participant_index: number
  values: Record<string, unknown>
}

export interface CustomFieldPayload {
  global?: Record<string, unknown>
  per_participant?: ParticipantCustomFieldPayload[]
}

export interface HybridRegistrationPayload {
  program: number
  guardian: GuardianData
  participants: ParticipantData[]
  custom_fields?: CustomFieldPayload
}

export interface RegistrationResult {
  guardian: string
  participants: Array<{
    reg_no: number
    first_name: string
    last_name: string
  }>
  report: Array<{
    name: string
    reason: string
  }>
}

export const registrationService = {
  // Get registration form structure for a program
  async getRegistrationForm(programId: number): Promise<RegistrationFormStructure> {
    const headers = buildAuthHeaders()
    try {
      const res = await axios.get(`${API_BASE}/programs/${programId}/registration-form/`, {
        withCredentials: true,
        headers: Object.keys(headers).length ? headers : undefined,
      })
      return res.data
    } catch (err) {
      const axiosErr = err as AxiosError
      const errorData = axiosErr.response?.data as ApiErrorResponse
      throw new Error(errorData?.detail ?? axiosErr.message)
    }
  },

  // Submit hybrid registration
  async submitRegistration(payload: HybridRegistrationPayload): Promise<RegistrationResult> {
    const headers = buildAuthHeaders()
    
    // Clean up payload - handle null vs empty string requirements per backend serializer
    const cleanedCustomFields = payload.custom_fields
      ? {
          ...(payload.custom_fields.global ? { global: payload.custom_fields.global } : {}),
          ...(payload.custom_fields.per_participant && payload.custom_fields.per_participant.length > 0
            ? {
                per_participant: payload.custom_fields.per_participant.map(entry => ({
                  participant_index: entry.participant_index,
                  values: entry.values || {},
                })),
              }
            : {}),
        }
      : undefined

    const cleanedPayload = {
      ...payload,
      guardian: {
        ...payload.guardian,
        email: payload.guardian.email?.trim() || null, // allow_null=True
        profession: payload.guardian.profession?.trim() || null, // allow_null=True  
        address: payload.guardian.address?.trim() || null, // allow_null=True
      },
      participants: payload.participants.map(p => ({
        ...p,
        email: p.email?.trim() || '', // allow_blank=True but NOT allow_null=True
        category_value: p.category_value?.trim() || null, // allow_null=True
        school_at_registration: {
          ...p.school_at_registration,
          name: p.school_at_registration.name?.trim() || null, // allow_null=True
          address: p.school_at_registration.address?.trim() || '', // allow_blank=True but NOT allow_null=True
          phone_number: p.school_at_registration.phone_number?.trim() || null, // allow_null=True
        }
      })),
      custom_fields: cleanedCustomFields,
    }
    
    try {
      console.log('Submitting registration payload:', cleanedPayload)
      const res = await axios.post(`${API_BASE}/programs/${payload.program}/register/`, cleanedPayload, {
        withCredentials: true,
        headers: Object.keys(headers).length ? headers : undefined,
      })
      return res.data
    } catch (err) {
      const axiosErr = err as AxiosError
      console.error('Registration submission error:', {
        status: axiosErr.response?.status,
        data: axiosErr.response?.data,
        message: axiosErr.message
      })
      
      // Try to extract more detailed error information
      const errorData = axiosErr.response?.data as ApiErrorResponse
      if (errorData && typeof errorData === 'object') {
        // Handle validation errors
        if (errorData.guardian || errorData.participants || errorData.program) {
          const errorMessages: string[] = []
          if (errorData.guardian) errorMessages.push(`Guardian: ${JSON.stringify(errorData.guardian)}`)
          if (errorData.participants) errorMessages.push(`Participants: ${JSON.stringify(errorData.participants)}`)
          if (errorData.program) errorMessages.push(`Program: ${JSON.stringify(errorData.program)}`)
          throw new Error(errorMessages.join(', '))
        }
        
        // Handle general validation errors
        if (errorData.detail) {
          throw new Error(errorData.detail)
        }
        
        // Handle field-specific errors
        const fieldErrors = Object.entries(errorData).map(([field, errors]) => 
          `${field}: ${Array.isArray(errors) ? errors.join(', ') : String(errors)}`
        ).join('; ')
        
        if (fieldErrors) {
          throw new Error(fieldErrors)
        }
      }
      
      throw new Error(String(axiosErr.response?.data) ?? axiosErr.message)
    }
  },

  // Search schools
  async searchSchools(query: string): Promise<School[]> {
    if (!query.trim()) return []
    
    try {
      const res = await axios.get(`${API_BASE}/schools/search/`, {
        params: { q: query },
        withCredentials: true,
      })
      return res.data
    } catch (err) {
      const axiosErr = err as AxiosError
      const errorData = axiosErr.response?.data as ApiErrorResponse
      throw new Error(errorData?.detail ?? axiosErr.message)
    }
  },

  // Create new school
  async createSchool(payload: CreateSchoolPayload): Promise<School> {
    const headers = buildAuthHeaders()
    try {
      const res = await axios.post(`${API_BASE}/schools/create/`, payload, {
        withCredentials: true,
        headers: Object.keys(headers).length ? headers : undefined,
      })
      return res.data
    } catch (err) {
      const axiosErr = err as AxiosError
      const errorData = axiosErr.response?.data as ApiErrorResponse
      throw new Error(errorData?.detail ?? axiosErr.message)
    }
  },
}
