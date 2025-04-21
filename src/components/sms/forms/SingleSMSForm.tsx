'use client'
import React, { useState } from 'react'
import axios, { AxiosError } from 'axios'

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://yourapi.com/register'
  : 'http://127.0.0.1:8000/register'

export default function SingleSMSForm() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await axios.post(`${API_BASE}/sms/send/`, {
        to: phone,
        body: message,
      })
      setSuccess('SMS sent successfully!')
      setPhone('')
      setMessage('')
    } catch (err) {
      const axiosErr = err as AxiosError
      setError(axiosErr.response?.data?.toString() ?? axiosErr.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Phone Number</span>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="e.g. +256712345678"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Message</span>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
      >
        {isLoading ? 'Sending...' : 'Send SMS'}
      </button>
    </form>
  )}
