'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowPathIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { buildAuthHeaders } from '@/lib/authHeaders'

interface Judge {
  id: number
  username: string
  full_name: string
  is_active: boolean
}

interface Program {
  id: number
  name: string
  category_options?: string[]
  is_judgable: boolean
}

interface JudgeAssignment {
  id: number
  program: number
  program_name: string
  judge: number
  judge_username: string
  category_value: string
  status: string
  max_participants: number | null
  participants_scored: number
  completion_percentage: number | null
  notes: string
  assigned_at: string
}

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://kyeza.pythonanywhere.com'
  : 'http://127.0.0.1:8000'

export default function JudgeAssignments() {
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([])
  const [judges, setJudges] = useState<Judge[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    program: '',
    judge: '',
    category_value: '',
    max_participants: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/score/judge-assignments/`, {
        headers: buildAuthHeaders(),
      })
      if (!res.ok) throw new Error('Failed to fetch assignments')
      const data = await res.json()
      setAssignments(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to load assignments')
    }
  }, [])

  const fetchJudges = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/accounts/judges/?is_active=true`, {
        headers: buildAuthHeaders(),
      })
      if (!res.ok) throw new Error('Failed to fetch judges')
      const data = await res.json()
      setJudges(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      console.error('Error fetching judges:', error)
    }
  }, [])

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/register/programs/`, {
        headers: buildAuthHeaders(),
      })
      if (!res.ok) throw new Error('Failed to fetch programs')
      const data = await res.json()
      const programList = Array.isArray(data) ? data : data.results || []
      setPrograms(programList.filter((p: Program) => p.is_judgable))
    } catch (error) {
      console.error('Error fetching programs:', error)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchAssignments(), fetchJudges(), fetchPrograms()])
      setLoading(false)
    }
    loadData()
  }, [fetchAssignments, fetchJudges, fetchPrograms])

  const handleOpenModal = () => {
    setFormData({
      program: '',
      judge: '',
      category_value: '',
      max_participants: '',
      notes: '',
    })
    setSelectedProgram(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({
      program: '',
      judge: '',
      category_value: '',
      max_participants: '',
      notes: '',
    })
    setSelectedProgram(null)
  }

  const handleProgramChange = (programId: string) => {
    setFormData({ ...formData, program: programId, category_value: '' })
    const program = programs.find(p => p.id === parseInt(programId))
    setSelectedProgram(program || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        program: parseInt(formData.program),
        judge: parseInt(formData.judge),
        category_value: formData.category_value || '',
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        notes: formData.notes,
        status: 'ACTIVE',
      }

      const res = await fetch(`${API_BASE}/score/judge-assignments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || JSON.stringify(errorData))
      }

      toast.success('Judge assigned successfully')
      handleCloseModal()
      fetchAssignments()
    } catch (error) {
      console.error('Error creating assignment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (assignment: JudgeAssignment) => {
    if (!confirm(`Remove ${assignment.judge_username} from ${assignment.program_name}?`)) return

    try {
      const res = await fetch(`${API_BASE}/score/judge-assignments/${assignment.id}/`, {
        method: 'DELETE',
        headers: buildAuthHeaders(),
      })

      if (!res.ok) throw new Error('Failed to remove assignment')
      
      toast.success('Assignment removed')
      fetchAssignments()
    } catch (error) {
      console.error('Error removing assignment:', error)
      toast.error('Failed to remove assignment')
    }
  }

  const handleStatusChange = async (assignment: JudgeAssignment, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/score/judge-assignments/${assignment.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')
      
      toast.success('Status updated')
      fetchAssignments()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Judge Assignments</h2>
          <p className="text-sm text-gray-500">Assign judges to programs and categories</p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          disabled={judges.length === 0 || programs.length === 0}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="h-4 w-4" />
          Assign Judge
        </button>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12">
          <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No assignments</h3>
          <p className="mt-1 text-sm text-gray-500">
            {judges.length === 0 
              ? 'Create judges first before assigning them to programs.'
              : programs.length === 0
              ? 'No judgable programs available.'
              : 'Assign judges to programs to get started.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Judge
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Program
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {assignment.judge_username}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {assignment.program_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {assignment.category_value || 'All Categories'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {assignment.participants_scored} scored
                    {assignment.max_participants && (
                      <span> / {assignment.max_participants}</span>
                    )}
                    {assignment.completion_percentage !== null && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({Math.round(assignment.completion_percentage)}%)
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <select
                      value={assignment.status}
                      onChange={(e) => handleStatusChange(assignment, e.target.value)}
                      className={`rounded-full px-2 py-1 text-xs font-medium border-0 ${getStatusBadge(assignment.status)}`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PAUSED">Paused</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => handleDelete(assignment)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30" onClick={handleCloseModal} />
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Assign Judge to Program
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <select
                    value={formData.program}
                    onChange={(e) => handleProgramChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Judge</label>
                  <select
                    value={formData.judge}
                    onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a judge</option>
                    {judges.map((judge) => (
                      <option key={judge.id} value={judge.id}>
                        {judge.full_name} ({judge.username})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedProgram?.category_options && selectedProgram.category_options.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category (optional)</label>
                    <select
                      value={formData.category_value}
                      onChange={(e) => setFormData({ ...formData, category_value: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">All Categories</option>
                      {selectedProgram.category_options.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Participants (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="1"
                    placeholder="Leave blank for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    rows={2}
                    placeholder="Internal notes about this assignment"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {submitting ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
