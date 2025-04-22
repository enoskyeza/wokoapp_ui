'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios, { AxiosError } from 'axios'
import { FetchedRegistration, Pagination } from '@/types'

// Base API URL depending on environment
enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}
const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

// Shape of filter object
type EnrollmentFilters = {
  search?: string
  status?: 'pending' | 'paid' | 'cancelled' | 'refunded'
  program?: number
  programType?: number
  participant?: number
  ordering?: string
  page?: number
}

const initialFilters: EnrollmentFilters = {
  ordering: '-created_at',
  page: 1,
}

// Context type for enrollments
export type EnrollmentDataContextType = {
  enrollments: FetchedRegistration[]
  pagination: Pagination | null
  isLoading: boolean
  error: unknown

  filters: EnrollmentFilters
  setFilters: (f: EnrollmentFilters) => void

    /**
   * Reset filters to defaults, optionally preserving certain keys.
   * @param preserveKeys keys in filters to keep from current state
   */
  clearFilters: (preserveKeys?: (keyof EnrollmentFilters)[]) => void


  // Actions
  refreshEnrollments: () => Promise<void>
}

// Create context
const EnrollmentDataContext = createContext<EnrollmentDataContextType | undefined>(undefined)

// Provider
export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrollments, setEnrollments] = useState<FetchedRegistration[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [filters, setFilters] = useState<EnrollmentFilters>(initialFilters)

  // const clearFilters = () => setFilters(initialFilters)

  const clearFilters = (preserveKeys: (keyof EnrollmentFilters)[] = []) => {
    setFilters(prev => {
      const next: EnrollmentFilters = { ...initialFilters }
      for (const key of preserveKeys) {
        if (key in prev) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          next[key] = prev[key]
        }
      }
      return next
    })
  }

  // Build query string from filter object
  const buildQuery = (f: EnrollmentFilters) => {
    const params = new URLSearchParams()
    if (f.page !== undefined) params.append('page', String(f.page))
    if (f.search) params.append('search', f.search)
    if (f.status) params.append('status', f.status)
    if (f.program !== undefined) params.append('program', String(f.program))
    if (f.programType !== undefined) params.append('program__type', String(f.programType))
    if (f.participant !== undefined) params.append('participant', String(f.participant))
    if (f.ordering) params.append('ordering', f.ordering)
    return params.toString() ? `?${params.toString()}` : ''
  }

  // Fetch enrollments
  const fetchEnrollments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const qs = buildQuery(filters)
      const url = `${API_BASE}/registrations/${qs}`
      const response = await axios.get<{ pagination: Pagination; results: FetchedRegistration[] }>(url)
      setEnrollments(response.data.results)
      setPagination(response.data.pagination)
    } catch (err) {
      const axiosErr = err as AxiosError
      setError(axiosErr.response?.data ?? axiosErr.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fetch on filters change
  useEffect(() => {
    void fetchEnrollments()
  }, [filters])

  const refreshEnrollments = () => fetchEnrollments()

  return (
    <EnrollmentDataContext.Provider value={{
      enrollments,
      pagination,
      isLoading,
      error,
      filters,
      setFilters,
      clearFilters,
      refreshEnrollments,
    }}>
      {children}
    </EnrollmentDataContext.Provider>
  )
}

// Custom hook
export function useEnrollmentData() {
  const context = useContext(EnrollmentDataContext)
  if (!context) throw new Error('useEnrollmentData must be used within an EnrollmentProvider')
  return context
}

// 'use client'
// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// import axios, { AxiosError } from 'axios'
// import { FetchedRegistration, Pagination } from '@/types'
//
// // Base API URL depending on environment
// enum Env {
//   DEVELOPMENT = 'development',
//   PRODUCTION = 'production',
// }
// const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
//   ? 'https://kyeza.pythonanywhere.com/register'
//   : 'http://127.0.0.1:8000/register'
//
// // Context type for enrollments
// export type EnrollmentDataContextType = {
//   enrollments: FetchedRegistration[]
//   pagination: Pagination | null
//   isLoading: boolean
//   error: unknown
//
//   // Filters & controls
//   searchQuery: string
//   setSearchQuery: (q: string) => void
//   statusFilter: string | null
//   setStatusFilter: (status: string | null) => void
//   programFilter: number | null
//   setProgramFilter: (programId: number | null) => void
//   programTypeFilter: number | null
//   setProgramTypeFilter: (typeId: number | null) => void
//   participantFilter: number | null
//   setParticipantFilter: (participantId: number | null) => void
//   ordering: string
//   setOrdering: (order: string) => void
//   currentPage: number
//   setCurrentPage: (page: number) => void
//
//   // Actions
//   refreshEnrollments: () => Promise<void>
// }
//
// // Create context
// const EnrollmentDataContext = createContext<EnrollmentDataContextType | undefined>(undefined)
//
// // Provider
// export function EnrollmentProvider({ children }: { children: ReactNode }) {
//   const [enrollments, setEnrollments] = useState<FetchedRegistration[]>([])
//   const [pagination, setPagination] = useState<Pagination | null>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<unknown>(null)
//
//   // Filters
//   const [searchQuery, setSearchQuery] = useState<string>('')
//   const [statusFilter, setStatusFilter] = useState<string | null>(null)
//   const [programFilter, setProgramFilter] = useState<number | null>(null)
//   const [programTypeFilter, setProgramTypeFilter] = useState<number | null>(null)
//   const [participantFilter, setParticipantFilter] = useState<number | null>(null)
//   const [ordering, setOrdering] = useState<string>('-created_at')
//   const [currentPage, setCurrentPage] = useState<number>(1)
//
//   // Fetch enrollments
//   const fetchEnrollments = async () => {
//     setIsLoading(true)
//     setError(null)
//     try {
//       const params = new URLSearchParams()
//       params.append('page', String(currentPage))
//       if (searchQuery) params.append('search', searchQuery)
//       if (statusFilter) params.append('status', statusFilter)
//       if (programFilter !== null) params.append('program', String(programFilter))
//       if (programTypeFilter !== null) params.append('program__type', String(programTypeFilter))
//       if (participantFilter !== null) params.append('participant', String(participantFilter))
//       if (ordering) params.append('ordering', ordering)
//
//       const queryString = params.toString() ? `?${params.toString()}` : ''
//       const url = `${API_BASE}/registrations/${queryString}`
//       const response = await axios.get<{ pagination: Pagination; results: FetchedRegistration[] }>(url)
//       setEnrollments(response.data.results)
//       setPagination(response.data.pagination)
//     } catch (err) {
//       const axiosErr = err as AxiosError
//       setError(axiosErr.response?.data ?? axiosErr.message)
//     } finally {
//       setIsLoading(false)
//     }
//   }
//
//   // Auto-fetch whenever filters, ordering or page change
//   useEffect(() => {
//     void fetchEnrollments()
//   }, [searchQuery, statusFilter, programFilter, programTypeFilter, participantFilter, ordering, currentPage])
//
//   const refreshEnrollments = () => fetchEnrollments()
//
//   return (
//     <EnrollmentDataContext.Provider value={{
//       enrollments,
//       pagination,
//       isLoading,
//       error,
//       searchQuery,
//       setSearchQuery,
//       statusFilter,
//       setStatusFilter,
//       programFilter,
//       setProgramFilter,
//       programTypeFilter,
//       setProgramTypeFilter,
//       participantFilter,
//       setParticipantFilter,
//       ordering,
//       setOrdering,
//       currentPage,
//       setCurrentPage,
//       refreshEnrollments,
//     }}>
//       {children}
//     </EnrollmentDataContext.Provider>
//   )
// }
//
// // Custom hook
// export function useEnrollmentData() {
//   const context = useContext(EnrollmentDataContext)
//   if (!context) throw new Error('useEnrollmentData must be used within an EnrollmentProvider')
//   return context
// }
