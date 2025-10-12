'use client'

import { useEffect, useMemo, useState } from 'react'

import DashboardLayout from '@/components/Layouts/Dashboard'
import CategoryDistributionChart from '@/components/ProgramDashboard/CategoryDistributionChart'
import RegistrationActionMenu from '@/components/ProgramDashboard/RegistrationActionMenu'
import ParticipantDetailsModal from '@/components/DetailViews/ParticipantDetailsModal'
import StatusBadge from '@/components/ui/StatusBadge'
import { useProgramDashboard } from '@/hooks/useProgramDashboard'
import type { FetchedRegistration } from '@/types'

interface ProgramDashboardScreenProps {
  programId: string
}

const formatCurrency = (value: string | number) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return String(value)
  return numeric.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const ProgramDashboardScreen: React.FC<ProgramDashboardScreenProps> = ({ programId }) => {
  const {
    data,
    isLoading,
    error,
    params,
    setFilters,
    refresh,
  } = useProgramDashboard(programId, { page: 1 })

  const [search, setSearch] = useState<string>('')
  const [selectedRegistration, setSelectedRegistration] = useState<FetchedRegistration | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const currentSearch = typeof params.search === 'string' ? params.search : ''
    setSearch(currentSearch)
  }, [params.search])

  const handleParticipantClick = (registration: FetchedRegistration) => {
    setSelectedRegistration(registration)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRegistration(null)
  }

  const programName = useMemo(() => data?.program.name ?? 'Program Dashboard', [data?.program.name])
  const statusValue = useMemo(() => {
    if (!params.status) return ''
    return Array.isArray(params.status) ? String(params.status[0]) : String(params.status)
  }, [params.status])

  const categoryValue = useMemo(() => {
    if (!params.category_value) return ''
    return Array.isArray(params.category_value) ? String(params.category_value[0]) : String(params.category_value)
  }, [params.category_value])

  const dateFrom = useMemo(() => {
    if (!params.date_from) return ''
    return Array.isArray(params.date_from) ? String(params.date_from[0]) : String(params.date_from)
  }, [params.date_from])

  const dateTo = useMemo(() => {
    if (!params.date_to) return ''
    return Array.isArray(params.date_to) ? String(params.date_to[0]) : String(params.date_to)
  }, [params.date_to])

  const pagination = data?.registrations.pagination
  const currentPage = pagination?.current_page ?? 1
  const totalPages = pagination?.total_pages ?? 1

  const updateFilter = (key: string, value: string | number | null) => {
    setFilters(prev => {
      const next = { ...prev }
      if (key !== 'page') {
        next.page = 1
      }
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete next[key]
      } else {
        next[key] = value
      }
      return next
    })
  }

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    updateFilter('search', search)
  }

  const handlePageChange = (page: number) => {
    updateFilter('page', page)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{programName}</h1>
            {data?.program.category_label && (
              <p className="text-sm text-gray-500">Category label: {data.program.category_label}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>


        {isLoading && (
          <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Loading dashboard data…
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && data && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-blue-50 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total registrations</p>
                <p className="mt-1 text-2xl font-semibold text-blue-900">{data.stats.total_registrations}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-green-50 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Paid registrations</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-600">{data.stats.paid_registrations}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-amber-50 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Pending registrations</p>
                <p className="mt-1 text-2xl font-semibold text-amber-600">{data.stats.pending_registrations}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-red-50 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Outstanding revenue</p>
                <p className="mt-1 text-2xl font-semibold text-red-600">{formatCurrency(data.stats.outstanding_revenue)}</p>
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <CategoryDistributionChart data={data.category_breakdown} />
              </div>
              {/* <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900">Revenue</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Expected</dt>
                    <dd className="font-semibold text-gray-900">{formatCurrency(data.stats.expected_revenue)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Collected</dt>
                    <dd className="font-semibold text-emerald-600">{formatCurrency(data.stats.collected_revenue)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Outstanding</dt>
                    <dd className="font-semibold text-blue-600">{formatCurrency(data.stats.outstanding_revenue)}</dd>
                  </div>
                </dl>
              </div> */}
            </div>


        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="grid gap-4 md:grid-cols-6 md:items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Search participants</label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by participant name"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusValue}
                onChange={(event) => updateFilter('status', event.target.value || null)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                {data?.filters.available.statuses.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={categoryValue}
                onChange={(event) => updateFilter('category_value', event.target.value || null)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All categories</option>
                {data?.filters.available.categories.map((category) => (
                  <option key={category ?? 'uncategorised'} value={category ?? ''}>
                    {category ?? 'Uncategorised'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date from</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => updateFilter('date_from', event.target.value || null)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date to</label>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => updateFilter('date_to', event.target.value || null)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-6 flex items-center gap-2">
              <button
                type="submit"
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Apply Filters
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setSearch('')
                  setFilters(() => ({ page: 1 }))
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </section>

            <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center rounded-t-lg justify-between bg-blue-700 text-white p-4">
                <h2 className="text-lg font-semibold ">Registrations</h2>
                <p className="text-sm text-gray-200">
                  Showing page {currentPage} of {totalPages}
                </p>
              </div>

              {data.registrations.results.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500 p-4">No registrations found for the selected filters.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm p-4">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Participant</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          {data.program.category_label ?? 'Category'}
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Guardian</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-600">Amount due</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data.registrations.results.map((registration) => (
                        <tr key={registration.id}>
                          <td className="px-4 py-2">
                            <div 
                              className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => handleParticipantClick(registration)}
                            >
                              {registration.participant.first_name} {registration.participant.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(registration.created_at).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-2">{registration.category_value ?? '—'}</td>
                          <td className="px-4 py-2">
                            {registration.guardian_at_registration
                              ? `${registration.guardian_at_registration.first_name} ${registration.guardian_at_registration.last_name}`
                              : '—'}
                          </td>
                          <td className="px-4 py-2">
                            <StatusBadge status={registration.status} />
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-900">
                            {formatCurrency(registration.amount_due)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <RegistrationActionMenu
                              registration={registration}
                              onCompleted={() => void refresh()}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm p-4 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-300 px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-500">
                    Page {currentPage} of {totalPages} — {pagination?.total_records ?? data.registrations.results.length} records
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-gray-300 px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Participant Details Modal */}
        {selectedRegistration && (
          <ParticipantDetailsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            registration={selectedRegistration}
            onUpdate={() => void refresh()}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProgramDashboardScreen
