'use client'

import { use, useEffect, useState } from 'react'
import axios from 'axios'
import { CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/solid'
import { toast } from 'sonner'
import Image from 'next/image'

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

interface TicketData {
  id: number
  registration: {
    id: number
    participant: {
      first_name: string
      last_name: string
      gender: string
    }
    program: string
    age_at_registration: number
    category_value?: string
    status: string
  }
  qr_code: string
  status: string
  created_at: string
}

interface TicketPageProps {
  params: Promise<{ id: string }>
}

export default function TicketPage({ params }: TicketPageProps) {
  const { id } = use(params)
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        // Public endpoint - no auth required
        const response = await axios.get(`${API_BASE}/coupons/${id}/`)
        setTicket(response.data)
      } catch (err) {
        console.error('Error fetching ticket:', err)
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('Ticket not found')
        } else {
          setError('Failed to load ticket')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTicket()
  }, [id])

  const handleDownload = () => {
    const ticketElement = document.getElementById('ticket-content')
    if (!ticketElement) return

    // Create a simple download by printing
    window.print()
  }

  const handleShare = async () => {
    const ticketUrl = window.location.href
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Ticket - ${ticket?.registration.participant.first_name}`,
          text: `Event Ticket for ${ticket?.registration.program}`,
          url: ticketUrl,
        })
        toast.success('Ticket shared successfully')
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(ticketUrl)
        toast.success('Ticket link copied to clipboard')
      }
    } catch (err) {
      console.error('Share error:', err)
      toast.error('Failed to share ticket')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Ticket</h1>
          <p className="text-gray-600 mb-6">{error || 'Ticket not found'}</p>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              This ticket may have been revoked, refunded, or does not exist.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isValid = ticket.status === 'paid' && ticket.registration.status === 'paid'
  const participant = ticket.registration.participant

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ticket-content,
          #ticket-content * {
            visibility: visible;
          }
          #ticket-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* Action Buttons - Hidden in print */}
        <div className="flex justify-end gap-3 mb-4 no-print">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Download
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <ShareIcon className="h-5 w-5" />
            Share
          </button>
        </div>

        {/* Ticket Card */}
        <div id="ticket-content" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Validation Badge */}
          <div className={`p-6 ${isValid ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
            <div className="flex items-center justify-between text-white">
              <div>
                <h1 className="text-3xl font-bold">Event Ticket</h1>
                <p className="text-sm opacity-90 mt-1">Entry Pass</p>
              </div>
              <div className="text-right">
                {isValid ? (
                  <CheckCircleIcon className="h-16 w-16 mb-2 mx-auto" />
                ) : (
                  <XCircleIcon className="h-16 w-16 mb-2 mx-auto" />
                )}
                <span className="inline-block px-4 py-1.5 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                  {isValid ? '✓ VALID' : '✗ INVALID'}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Content */}
          <div className="p-8">
            {/* Participant Information */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Participant
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-900">
                  {participant.first_name} {participant.last_name}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {ticket.registration.age_at_registration} years
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {participant.gender === 'M' ? 'Male' : 'Female'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Information */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Program Details
              </h2>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-xl font-bold text-indigo-900">
                  {ticket.registration.program}
                </p>
                {ticket.registration.category_value && (
                  <p className="text-sm text-indigo-700 mt-1">
                    Category: {ticket.registration.category_value}
                  </p>
                )}
              </div>
            </div>

            {/* QR Code Section */}
            <div className="border-t border-dashed border-gray-300 pt-8">
              <div className="text-center">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Scan to Verify
                </h2>
                <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                  {ticket.qr_code ? (
                    <Image
                      src={ticket.qr_code}
                      alt={`Ticket QR Code for ${participant.first_name}`}
                      width={200}
                      height={200}
                      className="mx-auto"
                      unoptimized
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center rounded-lg">
                      <p className="text-sm text-gray-500">QR Code Unavailable</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Ticket ID: TCK-{String(ticket.id).padStart(4, '0')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Issued on {new Date(ticket.created_at).toLocaleDateString('en-UG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Status Information */}
            {!isValid && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 text-center">
                  ⚠️ This ticket is not valid. Please contact support if you believe this is an error.
                </p>
              </div>
            )}

            {isValid && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 text-center">
                  ✓ This ticket is valid and confirmed. Present this at the event entrance.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              This is an official computer-generated ticket. Keep this safe and present it at the event.
            </p>
          </div>
        </div>

        {/* Additional Info - Hidden in print */}
        <div className="mt-6 text-center text-sm text-gray-600 no-print">
          <p>Save this ticket or bookmark this page for easy access</p>
        </div>
      </div>
    </div>
  )
}
