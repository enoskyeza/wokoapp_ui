'use client'

import { useState, useEffect, useCallback } from 'react'

import {
  DashboardService,
  ProgramDashboardData,
} from '@/services/dashboardService'

export type ProgramDashboardParams = Record<string, string | number | (string | number)[]>

interface UseProgramDashboardResult {
  data: ProgramDashboardData | null
  isLoading: boolean
  error: string | null
  params: ProgramDashboardParams
  setFilters: (updater: (current: ProgramDashboardParams) => ProgramDashboardParams) => void
  replaceFilters: (next: ProgramDashboardParams) => void
  refresh: () => Promise<void>
}

export function useProgramDashboard(
  programId: string | number | null,
  initialParams: ProgramDashboardParams = {}
): UseProgramDashboardResult {
  const [data, setData] = useState<ProgramDashboardData | null>(null)
  const [params, setParams] = useState<ProgramDashboardParams>(initialParams)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!programId) {
      setData(null)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await DashboardService.getProgramDashboard(programId, params)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load program dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [programId, params])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const setFilters = useCallback((updater: (current: ProgramDashboardParams) => ProgramDashboardParams) => {
    setParams(prev => updater(prev))
  }, [])

  const replaceFilters = useCallback((next: ProgramDashboardParams) => {
    setParams(next)
  }, [])

  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    params,
    setFilters,
    replaceFilters,
    refresh,
  }
}
