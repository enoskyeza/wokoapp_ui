'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { generateTicketPdf } from '@/lib/printTicket'
import type { FetchedRegistration } from '@/types'
import { submitApproval } from '@/services/registrationsService'

interface RegistrationActionMenuProps {
  registration: FetchedRegistration
  onCompleted: () => void
}

const RegistrationActionMenu: React.FC<RegistrationActionMenuProps> = ({ registration, onCompleted }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<'partial' | 'cancel' | null>(null)
  const [partialAmount, setPartialAmount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const closeDialogs = () => {
    setDialog(null)
    setPartialAmount(0)
    setError(null)
  }

  const toggleMenu = () => setMenuOpen(prev => !prev)

  const handleFullPayment = async () => {
    setLoading(true)
    setError(null)
    try {
      await submitApproval({ registration: registration.id, status: 'paid' })
      toast.success('Payment approved')
      onCompleted()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve payment'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
      setDialog(null)
      setMenuOpen(false)
    }
  }

  const handlePartialPayment = async () => {
    if (!partialAmount || partialAmount <= 0) {
      setError('Enter a valid amount')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await submitApproval({ registration: registration.id, status: 'paid', amount: partialAmount })
      toast.success('Partial payment recorded')
      onCompleted()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record payment'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
      closeDialogs()
      setMenuOpen(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    try {
      await submitApproval({ registration: registration.id, status: 'cancelled' })
      toast.success('Registration cancelled')
      onCompleted()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel registration'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
      closeDialogs()
      setMenuOpen(false)
    }
  }

  const isFullyPaid = registration.status === 'paid'
  const isPartiallyPaid = registration.status === 'partially_paid'
  const hasCancelled = registration.status === 'cancelled'
  const canMakePayment = !isFullyPaid && !hasCancelled

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleMenu}
        className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50"
      >
        Actions
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-20 bottom-full mb-2 w-48 origin-bottom-right rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="py-1 text-sm text-gray-700">
            {canMakePayment && (
              <>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={handleFullPayment}
                  disabled={loading}
                >
                  {isPartiallyPaid ? 'Pay Remaining Balance' : 'Approve Full Payment'}
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => { setDialog('partial'); setMenuOpen(false) }}
                >
                  Record Partial Payment
                </button>
                {!isPartiallyPaid && (
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                    onClick={() => { setDialog('cancel'); setMenuOpen(false) }}
                  >
                    Cancel Registration
                  </button>
                )}
              </>
            )}
            {isFullyPaid && registration.coupon?.qr_code && (
              <button
                type="button"
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={async () => {
                  try {
                    await generateTicketPdf(registration, true)
                    toast.success('Ticket downloaded')
                  } catch (e) {
                    console.error('Ticket download error:', e)
                    toast.error('Failed to download ticket')
                  }
                }}
              >
                Download Ticket
              </button>
            )}
            {registration.receipts && registration.receipts.length > 0 && (
              <button
                type="button"
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => window.open(`${window.location.origin}/receipts/${registration.receipts?.[0].id}/`, '_blank')}
              >
                View Receipt{registration.receipts.length > 1 ? 's' : ''}
              </button>
            )}
            {isPartiallyPaid && registration.amount_due > 0 && (
              <div className="px-4 py-2 text-xs text-gray-500 border-t">
                Balance: UGX {registration.amount_due.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {dialog === 'partial' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Record partial payment</h3>
            <p className="mt-2 text-sm text-gray-500">Enter the amount received.</p>
            <input
              type="number"
              min={0}
              value={partialAmount || ''}
              onChange={event => setPartialAmount(Number(event.target.value))}
              className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2 text-sm">
              <button type="button" onClick={closeDialogs} className="rounded-md px-4 py-2 hover:bg-gray-100">Cancel</button>
              <button
                type="button"
                onClick={handlePartialPayment}
                className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {dialog === 'cancel' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Cancel registration</h3>
            <p className="mt-2 text-sm text-gray-500">This action cannot be undone.</p>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2 text-sm">
              <button type="button" onClick={closeDialogs} className="rounded-md px-4 py-2 hover:bg-gray-100">No</button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Cancelling…' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegistrationActionMenu
