'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReceiptView from '@/components/DetailViews/ReceiptView'
import { Receipt, FetchedRegistration } from '@/types'
import axios from 'axios'
import { buildAuthHeaders } from '@/lib/authHeaders'

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

interface ReceiptPageProps {
  params: Promise<{ id: string }>
}

export default function ReceiptPage({ params }: ReceiptPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [receipt, setReceipt] = useState<Receipt & { 
    registration_details?: FetchedRegistration; 
    program_name?: string; 
    participant_name?: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const headers = buildAuthHeaders()
        const response = await axios.get(`${API_BASE}/receipts/${id}/`, {
          withCredentials: true,
          headers: Object.keys(headers).length ? headers : undefined,
        })
        
        // The API now returns registration_details, program_name, and participant_name
        // No need for additional API calls
        setReceipt(response.data)
      } catch (err) {
        console.error('Error fetching receipt:', err)
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('Receipt not found')
        } else {
          setError('Failed to load receipt')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchReceipt()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Receipt not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Back
        </button>
        <ReceiptView receipt={receipt} />
      </div>
    </div>
  )
}
