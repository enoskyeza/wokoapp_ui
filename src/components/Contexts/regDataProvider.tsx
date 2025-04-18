'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

  // Fetch schools from API
  const fetchSchools = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // build URL with optional search query
      const url = `${API_BASE}/schools/${schoolQuery ? `?search=${encodeURIComponent(schoolQuery)}` : ''}`
      const response = await axios.get<School[]>(url)
      setSchools(response.data)
    } catch (err) {
      const axiosErr = err as AxiosError
      setError(axiosErr.response?.data ?? axiosErr.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch programs from API
  const fetchPrograms = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `${API_BASE}/programs/`
      const response = await axios.get<Program[]>(url)
      setPrograms(response.data)
    } catch (err) {
      const axiosErr = err as AxiosError
      setError(axiosErr.response?.data ?? axiosErr.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchPrograms()
  }, [])

  useEffect(() => {
    void fetchSchools()
  }, [schoolQuery])

  const refreshSchools = () => fetchSchools()
  const refreshPrograms = () => fetchPrograms()

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
