'use client'
import { useState, useEffect } from 'react'
import { DashboardService, DashboardData } from '@/services/dashboardService'

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const dashboardData = await DashboardService.getDashboardStats()
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const refresh = () => {
    fetchDashboardData()
  }

  return {
    data,
    isLoading,
    error,
    refresh
  }
}
