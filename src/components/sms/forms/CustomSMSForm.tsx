'use client'
import React, { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { Guardian } from '@/types'
import {useContacts} from "@/components/Contexts/contactDataProvider";

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://yourapi.com/register'
  : 'http://127.0.0.1:8000/register'

export default function CustomSMSForm() {
  const { contacts, filterQuery, setFilterQuery, selectedContacts, setSelectedContacts } = useContacts()
  const [template, setTemplate] = useState('Hi {first_name}, ')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Preview uses first selected contact
  const previewContact: Guardian | undefined = selectedContacts[0]
  const renderTemplate = (contact: Guardian) => {
    return template
      .replace(/\{first_name\}/g, contact.first_name)
      .replace(/\{last_name\}/g, contact.last_name)
  }

  const handleSelect = (contact: Guardian) => {
    setSelectedContacts([contact])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!previewContact) {
      setError('Please select a contact')
      return
    }
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const body = renderTemplate(previewContact)
      await axios.post(`${API_BASE}/sms/send/`, {
        to: previewContact.phone_number,
        body,
      })
      setSuccess('SMS sent successfully!')
      // reset
      setTemplate('Hi {first_name}, ')
      setSelectedContacts([])
    } catch (err) {
      const axiosErr = err as AxiosError
      setError(axiosErr.response?.data?.toString() ?? axiosErr.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {/* Contact search & select */}
      <div>
        <input
          type="text"
          value={filterQuery}
          onChange={e => setFilterQuery(e.target.value)}
          placeholder="Search contacts..."
          className="mb-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        <ul className="max-h-32 overflow-auto border rounded-md p-2">
          {contacts.map(c => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => handleSelect(c)}
                className={`w-full text-left p-1 rounded ${
                  selectedContacts[0]?.id === c.id ? 'bg-blue-100' : ''
                } hover:bg-gray-100`}>
                {c.first_name} {c.last_name} - {c.phone_number}
              </button>
            </li>
          ))}
          {contacts.length === 0 && <li className="text-gray-500">No contacts found.</li>}
        </ul>
      </div>

      {/* Template editor */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Template</span>
          <textarea
            value={template}
            onChange={e => setTemplate(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </label>

        {/* Live Preview */}
        {previewContact && (
          <div className="p-2 bg-gray-50 rounded border">
            <p className="text-sm text-gray-600">Preview:</p>
            <p className="mt-1 text-gray-800">{renderTemplate(previewContact)}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send Custom SMS'}
        </button>
      </form>
    </div>
  )
}
