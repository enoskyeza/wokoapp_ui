import axios, { AxiosError } from 'axios'

import { FetchedRegistration, Pagination, Program as ProgramModel } from '@/types'

// Base API URL depending on environment
enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

export interface DashboardStats {
  total_programs: number
  active_programs: number
  total_enrollments: number
  total_form_submissions: number
}

export interface Program {
  id: string
  title: string
  category: string
  status: 'active' | 'draft' | 'archived' | 'inactive'
  enrollments: number
  createdAt: string
}

export interface FormTemplate {
  id: string
  name: string
  programId: string
  programTitle: string
  fields: number
  submissions: number
  createdAt: string
}

export interface DashboardData {
  stats: DashboardStats
  programs: Program[]
  forms: FormTemplate[]
}

export interface ProgramDashboardStats {
  total_registrations: number
  paid_registrations: number
  pending_registrations: number
  cancelled_registrations: number
  refunded_registrations: number
  expected_revenue: string | number
  collected_revenue: string | number
  outstanding_revenue: string | number
}

export interface ProgramDashboardFilters {
  applied: Record<string, string | string[]>
  available: {
    statuses: { value: string; label: string }[]
    categories: (string | null)[]
  }
}

export interface CategoryBreakdownItem {
  label: string | null
  value: string | null
  count: number
}

export interface ProgramDashboardRegistrations {
  pagination: Pagination | null
  results: FetchedRegistration[]
}

export interface ProgramDashboardData {
  program: ProgramModel
  stats: ProgramDashboardStats
  filters: ProgramDashboardFilters
  category_breakdown: CategoryBreakdownItem[]
  registrations: ProgramDashboardRegistrations
}

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardData> {
    try {
      const response = await axios.get<DashboardData>(`${API_BASE}/programs/dashboard-stats/`)
      return response.data
    } catch (err) {
      const axiosErr = err as AxiosError
      throw new Error(axiosErr.response?.data as string ?? axiosErr.message)
    }
  }

  static async getProgramDashboard(
    programId: string | number,
    params?: Record<string, string | number | (string | number)[]>
  ): Promise<ProgramDashboardData> {
    try {
      const response = await axios.get<ProgramDashboardData>(
        `${API_BASE}/programs/${programId}/dashboard/`,
        { params }
      )
      return response.data
    } catch (err) {
      const axiosErr = err as AxiosError
      throw new Error(axiosErr.response?.data as string ?? axiosErr.message)
    }
  }
}
