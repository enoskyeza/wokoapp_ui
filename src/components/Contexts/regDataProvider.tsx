'use client'
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react'
import axios, { AxiosError } from 'axios'
import { Program, School } from '@/types'

// Base API URL depending on environment
enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

export type RegistrationDataContextType = {
  schools: School[]
  programs: Program[]
  isLoading: boolean
  error: unknown

  selectedSchool: School | null
  setSelectedSchool: (school: School | null) => void
  schoolQuery: string
  setSchoolQuery: (query: string) => void

  selectedProgram: Program | null
  setSelectedProgram: (program: Program | null) => void
  programTypeFilter: number | null
  setProgramTypeFilter: (typeId: number | null) => void
  activeFilter: boolean | null
  setActiveFilter: (active: boolean | null) => void


  refreshSchools: () => Promise<void>
  refreshPrograms: () => Promise<void>

  started:boolean
  setStarted: (string:boolean) => void
}

const RegistrationDataContext = createContext<RegistrationDataContextType | undefined>(undefined)

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)

  // local state to “started” flow
  const [started, setStarted] = React.useState(false)


  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [schoolQuery, setSchoolQuery] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

    // New filter state for programs
  const [programTypeFilter, setProgramTypeFilter] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState<boolean | null>(true)

  // Fetch schools from API
  const schoolFetchSignatureRef = useRef<string | null>(null)
  const programFetchSignatureRef = useRef<string | null>(null)

  const fetchSchools = useCallback(async (options?: { force?: boolean }) => {
    const signature = schoolQuery.trim().toLowerCase()
    if (!options?.force && schoolFetchSignatureRef.current === signature) {
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      schoolFetchSignatureRef.current = signature
      // build URL with optional search query
      const baseUrl = `${API_BASE}/schools/`
      const url = schoolQuery
        ? `${baseUrl}?search=${encodeURIComponent(schoolQuery)}`
        : baseUrl
      const response = await axios.get<School[]>(url)
      setSchools(response.data)
    } catch (err) {
      const axiosErr = err as AxiosError
      setError(axiosErr.response?.data ?? axiosErr.message)
      schoolFetchSignatureRef.current = null
    } finally {
      setIsLoading(false)
    }
  }, [schoolQuery])

  // Fetch programs from API
  const fetchPrograms = useCallback(async (options?: { force?: boolean }) => {
    const signature = JSON.stringify({ programTypeFilter, activeFilter })
    if (!options?.force && programFetchSignatureRef.current === signature) {
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      programFetchSignatureRef.current = signature
            // Build query params based on filters
      const params = new URLSearchParams()
      if (programTypeFilter !== null) params.append('type', String(programTypeFilter))
      if (activeFilter !== null) params.append('active', String(activeFilter))


      const baseUrl = `${API_BASE}/programs/`
      const queryString = params.toString()
      const url = queryString ? `${baseUrl}?${params.toString()}` : baseUrl

      const response = await axios.get<Program[]>(url)
      setPrograms(response.data)
    } catch (err) {
      const axiosErr = err as AxiosError
      setError(axiosErr.response?.data ?? axiosErr.message)
      programFetchSignatureRef.current = null
    } finally {
      setIsLoading(false)
    }
  }, [programTypeFilter, activeFilter])

  useEffect(() => {
    void fetchPrograms()
  }, [fetchPrograms])

  useEffect(() => {
    void fetchSchools()
  }, [fetchSchools])

  const refreshSchools = useCallback(() => fetchSchools({ force: true }), [fetchSchools])
  const refreshPrograms = useCallback(() => fetchPrograms({ force: true }), [fetchPrograms])

  return (
    <RegistrationDataContext.Provider value={{
      schools,
      programs,
      isLoading,
      error,
      selectedSchool,
      setSelectedSchool,
      schoolQuery,
      setSchoolQuery,
      selectedProgram,
      setSelectedProgram,
      programTypeFilter,
      setProgramTypeFilter,
      activeFilter,
      setActiveFilter,
      refreshSchools,
      refreshPrograms,
      started,
      setStarted,
    }}>
      {children}
    </RegistrationDataContext.Provider>
  )
}

// Custom hook
export function useRegistrationData() {
  const context = useContext(RegistrationDataContext)
  if (!context) {
    throw new Error('useRegistrationData must be used within a RegistrationProvider')
  }
  return context
}
