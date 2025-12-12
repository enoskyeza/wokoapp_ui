'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Dashboard from '@/components/Layouts/Dashboard'
import { 
  TrophyIcon, 
  ArrowDownTrayIcon, 
  FunnelIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { buildAuthHeaders } from '@/lib/authHeaders'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://kyeza.pythonanywhere.com'
    : 'http://127.0.0.1:8000')

interface ProgramSummary {
  id: number
  name: string
  category_label: string | null
  category_options: string[]
  has_categories: boolean
  total_registrations: number
  scored_registrations: number
  judges_count: number
  scoring_progress: number
}

interface ParticipantResult {
  rank: number
  registration_id: number
  participant_id: number
  participant_name: string
  category_value: string
  final_score: number
  judges_count: number
  scores_count: number
}

interface LeaderboardData {
  program_id: number
  program_name: string
  category_label: string | null
  category_options: string[]
  selected_category: string | null
  total_participants: number
  top_3: ParticipantResult[]
  results: ParticipantResult[]
}

export default function ScoresPage() {
  const [programs, setPrograms] = useState<ProgramSummary[]>([])
  const [selectedProgram, setSelectedProgram] = useState<ProgramSummary | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch programs summary
  const fetchPrograms = useCallback(async () => {
    setLoadingPrograms(true)
    try {
      const res = await fetch(`${API_BASE}/score/programs-summary/`, {
        headers: buildAuthHeaders(),
      })
      if (!res.ok) throw new Error('Failed to fetch programs')
      const data = await res.json()
      setPrograms(data.programs || [])
      
      // Auto-select first program if available
      if (data.programs?.length > 0 && !selectedProgram) {
        setSelectedProgram(data.programs[0])
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoadingPrograms(false)
    }
  }, [selectedProgram])

  // Fetch leaderboard for selected program
  const fetchLeaderboard = useCallback(async () => {
    if (!selectedProgram) return
    
    setLoadingLeaderboard(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }
      
      const res = await fetch(
        `${API_BASE}/score/leaderboard/${selectedProgram.id}/?${params.toString()}`,
        { headers: buildAuthHeaders() }
      )
      if (!res.ok) throw new Error('Failed to fetch leaderboard')
      const data = await res.json()
      setLeaderboard(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoadingLeaderboard(false)
    }
  }, [selectedProgram, selectedCategory])

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  useEffect(() => {
    if (selectedProgram) {
      fetchLeaderboard()
    }
  }, [selectedProgram, selectedCategory, fetchLeaderboard])

  // Export to CSV
  const exportToCSV = () => {
    if (!leaderboard || leaderboard.results.length === 0) return

    const headers = ['Rank', 'Participant Name', 'Category', 'Final Score', 'Judges Count']
    const rows = leaderboard.results.map(r => [
      r.rank,
      r.participant_name,
      r.category_value || 'N/A',
      r.final_score.toFixed(2),
      r.judges_count
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${leaderboard.program_name}_scores_${selectedCategory || 'all'}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter results by search query
  const filteredResults = leaderboard?.results.filter(r =>
    r.participant_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Get medal styles for top 3
  const getMedalStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 ring-yellow-400'
      case 2:
        return 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800 ring-gray-300'
      case 3:
        return 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900 ring-orange-400'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return ''
    }
  }

  return (
    <Dashboard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scores & Results</h1>
              <p className="text-sm text-gray-500">View participant scores and rankings</p>
            </div>
          </div>
          
          {leaderboard && leaderboard.results.length > 0 && (
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Program Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <select
                value={selectedProgram?.id || ''}
                onChange={(e) => {
                  const prog = programs.find(p => p.id === parseInt(e.target.value))
                  setSelectedProgram(prog || null)
                  setSelectedCategory('')
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={loadingPrograms}
              >
                <option value="">Select a program</option>
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name} ({prog.scored_registrations}/{prog.total_registrations} scored)
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select (if program has categories) */}
            {selectedProgram?.has_categories && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedProgram.category_label || 'Category'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">All Categories</option>
                  {selectedProgram.category_options.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Participant</label>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-9 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(loadingPrograms || loadingLeaderboard) && (
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* No Program Selected */}
        {!loadingPrograms && !selectedProgram && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No program selected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select a program from the dropdown to view scores
            </p>
          </div>
        )}

        {/* Leaderboard Content */}
        {!loadingLeaderboard && leaderboard && (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserGroupIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{leaderboard.total_participants}</p>
                    <p className="text-xs text-gray-500">Participants</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ChartBarIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {leaderboard.results.length > 0 
                        ? leaderboard.results[0].final_score.toFixed(1)
                        : '-'}
                    </p>
                    <p className="text-xs text-gray-500">Highest Score</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrophyIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {leaderboard.results.filter(r => r.scores_count > 0).length}
                    </p>
                    <p className="text-xs text-gray-500">Scored</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ChartBarIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {leaderboard.results.length > 0 
                        ? (leaderboard.results.reduce((acc, r) => acc + r.final_score, 0) / leaderboard.results.length).toFixed(1)
                        : '-'}
                    </p>
                    <p className="text-xs text-gray-500">Avg Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top 3 Podium */}
            {leaderboard.top_3.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrophyIcon className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Top {leaderboard.top_3.length} {selectedCategory ? `(${selectedCategory})` : ''}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {leaderboard.top_3.map((participant) => (
                    <div
                      key={participant.registration_id}
                      className={`relative rounded-xl p-6 ring-2 ${getMedalStyle(participant.rank)} transform transition-transform hover:scale-105`}
                    >
                      <div className="absolute -top-3 -left-3 text-3xl">
                        {getMedalIcon(participant.rank)}
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">
                          #{participant.rank}
                        </div>
                        <h3 className="text-lg font-semibold truncate">
                          {participant.participant_name}
                        </h3>
                        {participant.category_value && (
                          <p className="text-sm opacity-75">{participant.category_value}</p>
                        )}
                        <div className="mt-3 text-3xl font-bold">
                          {participant.final_score.toFixed(2)}
                        </div>
                        <p className="text-xs opacity-75 mt-1">
                          {participant.judges_count} judge{participant.judges_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Table */}
            {filteredResults.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">All Participants</h2>
                  <p className="text-sm text-gray-500">
                    Showing {filteredResults.length} of {leaderboard.results.length} participants
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Participant
                        </th>
                        {leaderboard.category_options.length > 0 && (
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            {leaderboard.category_label || 'Category'}
                          </th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Final Score
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Judges
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredResults.map((participant) => (
                        <tr 
                          key={participant.registration_id}
                          className={participant.rank <= 3 ? 'bg-yellow-50' : ''}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                              participant.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                              participant.rank === 2 ? 'bg-gray-100 text-gray-800' :
                              participant.rank === 3 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {participant.rank}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                            {participant.participant_name}
                          </td>
                          {leaderboard.category_options.length > 0 && (
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                              {participant.category_value || '-'}
                            </td>
                          )}
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <span className={`font-semibold ${
                              participant.final_score >= 80 ? 'text-green-600' :
                              participant.final_score >= 60 ? 'text-blue-600' :
                              participant.final_score >= 40 ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}>
                              {participant.final_score.toFixed(2)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                            {participant.judges_count}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            {participant.scores_count > 0 ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Scored
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : leaderboard.results.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No scores yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No participants have been scored for this program yet
                </p>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No participants match your search query
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Dashboard>
  )
}
