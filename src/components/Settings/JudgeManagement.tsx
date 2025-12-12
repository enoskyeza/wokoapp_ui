'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { buildAuthHeaders } from '@/lib/authHeaders'

interface Judge {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  is_active: boolean
  assignments_count: number
}

interface JudgeFormData {
  username: string
  email: string
  first_name: string
  last_name: string
  password?: string
}

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://kyeza.pythonanywhere.com'
  : 'http://127.0.0.1:8000'

export default function JudgeManagement() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null)
  const [formData, setFormData] = useState<JudgeFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchJudges = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (!showInactive) {
        params.append('is_active', 'true')
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
      const res = await fetch(`${API_BASE}/accounts/judges/?${params.toString()}`, {
        headers: buildAuthHeaders(),
      })
      if (!res.ok) throw new Error('Failed to fetch judges')
      const data = await res.json()
      setJudges(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      console.error('Error fetching judges:', error)
      toast.error('Failed to load judges')
    } finally {
      setLoading(false)
    }
  }, [showInactive, searchQuery])

  useEffect(() => {
    fetchJudges()
  }, [fetchJudges])

  const handleOpenModal = (judge?: Judge) => {
    if (judge) {
      setEditingJudge(judge)
      setFormData({
        username: judge.username,
        email: judge.email,
        first_name: judge.first_name,
        last_name: judge.last_name,
        password: '',
      })
    } else {
      setEditingJudge(null)
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingJudge(null)
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: Partial<JudgeFormData> = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
      }
      
      if (formData.password) {
        payload.password = formData.password
      }

      const url = editingJudge 
        ? `${API_BASE}/accounts/judges/${editingJudge.id}/`
        : `${API_BASE}/accounts/judges/`
      
      const res = await fetch(url, {
        method: editingJudge ? 'PATCH' : 'POST',
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

      toast.success(editingJudge ? 'Judge updated successfully' : 'Judge created successfully')
      handleCloseModal()
      fetchJudges()
    } catch (error) {
      console.error('Error saving judge:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save judge')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (judge: Judge) => {
    if (!confirm(`Are you sure you want to deactivate "${judge.full_name}"?`)) return

    try {
      const res = await fetch(`${API_BASE}/accounts/judges/${judge.id}/`, {
        method: 'DELETE',
        headers: buildAuthHeaders(),
      })

      if (!res.ok) throw new Error('Failed to deactivate judge')
      
      toast.success('Judge deactivated successfully')
      fetchJudges()
    } catch (error) {
      console.error('Error deactivating judge:', error)
      toast.error('Failed to deactivate judge')
    }
  }

  const handleRestore = async (judge: Judge) => {
    try {
      const res = await fetch(`${API_BASE}/accounts/judges/${judge.id}/restore/`, {
        method: 'POST',
        headers: buildAuthHeaders(),
      })

      if (!res.ok) throw new Error('Failed to restore judge')
      
      toast.success('Judge restored successfully')
      fetchJudges()
    } catch (error) {
      console.error('Error restoring judge:', error)
      toast.error('Failed to restore judge')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Manage Judges</h2>
          <p className="text-sm text-gray-500">Create and manage judge accounts</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <PlusIcon className="h-4 w-4" />
          Add Judge
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search judges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          Show inactive
        </label>
      </div>

      {/* Judges List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : judges.length === 0 ? (
        <div className="text-center py-12">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No judges found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new judge.</p>
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
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Assignments
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
              {judges.map((judge) => (
                <tr key={judge.id} className={!judge.is_active ? 'bg-gray-50 opacity-60' : ''}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {judge.full_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {judge.username}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {judge.email || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {judge.assignments_count}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      judge.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {judge.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(judge)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {judge.is_active ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(judge)}
                          className="text-red-600 hover:text-red-800"
                          title="Deactivate"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestore(judge)}
                          className="text-green-600 hover:text-green-800"
                          title="Restore"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
                {editingJudge ? 'Edit Judge' : 'Add New Judge'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    disabled={!!editingJudge}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {editingJudge ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={editingJudge ? '••••••••' : ''}
                    minLength={6}
                  />
                  {!editingJudge && (
                    <p className="mt-1 text-xs text-gray-500">
                      Leave blank to use default: username + &quot;123&quot;
                    </p>
                  )}
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
                    {submitting ? 'Saving...' : editingJudge ? 'Update' : 'Create'}
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
