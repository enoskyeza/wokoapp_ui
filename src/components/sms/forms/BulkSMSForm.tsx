'use client'
import React, { useState} from 'react'
// import axios, { AxiosError } from 'axios'
import { Guardian } from '@/types'
import {useContacts} from "@/components/Contexts/contactDataProvider";

const mockSend = () => new Promise<void>((_, reject) =>
  setTimeout(() => reject(new Error("Please subscribe to our SMS service")), 2000)
)

// const API_BASE = process.env.NODE_ENV === 'production'
//   ? 'https://yourapi.com/register'
//   : 'http://127.0.0.1:8000/register'

export default function BulkSMSForm() {
  const { contacts, filterQuery, setFilterQuery, selectedContacts, setSelectedContacts } = useContacts()
  const [mode, setMode] = useState<'general' | 'custom'>('general')
  const [message, setMessage] = useState('')
  const [template, setTemplate] = useState('Hi {first_name}, ')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)


const handleSelectAll = () => {
  if (selectedContacts.length === contacts.length) {
    setSelectedContacts([])
  } else {
    setSelectedContacts([...contacts])
  }
}


  // Toggle contact selection
  const toggleContact = (c: Guardian) => {
    if (selectedContacts.find(x => x.id === c.id)) {
      setSelectedContacts(selectedContacts.filter(x => x.id !== c.id))
    } else {
      setSelectedContacts([...selectedContacts, c])
    }
  }

  const renderTemplate = (contact: Guardian) => {
    return template
      .replace(/\{first_name\}/g, contact.first_name)
      .replace(/\{last_name\}/g, contact.last_name)
  }

  const handleBulkSend = async () => {
    if (selectedContacts.length === 0) {
      setError('Please select at least one contact')
      return
    }
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // const promises = selectedContacts.map(c => {
      //   const body = mode === 'general' ? message : renderTemplate(c)
      //   return axios.post(`${API_BASE}/sms/send/`, {
      //     to: c.phone_number,
      //     body,
      //   })
      // })
      // await Promise.all(promises)
      const promises = selectedContacts.map(() => mockSend())
      await Promise.all(promises)
      setSuccess(`Sent to ${selectedContacts.length} contacts!`)
      // reset
      setSelectedContacts([])
      setMessage('')
      setTemplate('Hi {first_name}, ')
    } catch (err) {
      // const axiosErr = err as AxiosError
      // setError(axiosErr.response?.data?.toString() ?? axiosErr.message)
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Contact filter & list */}
      <div>
        <input
          type="text"
          value={filterQuery}
          onChange={e => setFilterQuery(e.target.value)}
          placeholder="Search contacts..."
          className="mb-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />

        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-700">
            Selected: {selectedContacts.length}
          </span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm font-medium text-blue-500 hover:underline focus:outline-none"
          >
            {selectedContacts.length === contacts.length
              ? 'Deselect All'
              : 'Select All'}
          </button>
        </div>


        <ul className="max-h-32 overflow-auto border rounded-md p-2">
          {contacts.map(c => (
            <li key={c.id} className="flex items-center">
              <input
                type="checkbox"
                checked={!!selectedContacts.find(x => x.id === c.id)}
                onChange={() => toggleContact(c)}
                className="mr-2"
              />
              <span>{c.first_name} {c.last_name} - {c.phone_number}</span>
            </li>
          ))}
          {contacts.length === 0 && <li className="text-gray-500">No contacts found.</li>}
        </ul>
      </div>

      {/* Mode toggle */}
      <div className="flex space-x-2">
        {(['general', 'custom'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg focus:outline-none hover:bg-gray-100 ${
              mode === m ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Message or Template */}
      {mode === 'general' ? (
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Message</span>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </label>
      ) : (
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Template</span>
          <textarea
            value={template}
            onChange={e => setTemplate(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </label>
      )}

      {/* Preview for custom */}
      {mode === 'custom' && selectedContacts[0] && (
        <div className="p-2 bg-gray-50 rounded border">
          <p className="text-sm text-gray-600">Preview:</p>
          <p className="mt-1 text-gray-800">{renderTemplate(selectedContacts[0]!)}</p>
        </div>
      )}

      {/* Feedback & Send */}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <button
        onClick={handleBulkSend}
        disabled={isLoading}
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
      >
        {isLoading ? 'Sending...' : 'Send Bulk SMS'}
      </button>
    </div>

  )}
