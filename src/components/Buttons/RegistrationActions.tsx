// RegistrationActions.tsx
'use client'
import React, { useState } from 'react'
import { FetchedRegistration } from '@/types'
import {useEnrollmentData} from "@/components/Contexts/enrollmentDataProvider";
import { generateTicketPdf } from '@/lib/printTicket'

interface RegistrationActionsProps {
  registration: FetchedRegistration
}

const RegistrationActions: React.FC<RegistrationActionsProps> = ({ registration }) => {
  const { processPayment, paymentLoading, paymentError} = useEnrollmentData()
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [partialStep, setPartialStep] = useState(false)
  const [partialAmount, setPartialAmount] = useState<number>(0)
  const [cancelConfirm, setCancelConfirm] = useState(false)

  const toggleMenu = () => setMenuOpen(prev => !prev)
  const closeAll = () => {
    setMenuOpen(false)
    setModalOpen(false)
    setPartialStep(false)
    setCancelConfirm(false)
  }

  const handleFullPayment = async () => {
    await processPayment({ regId: registration.id, status: 'paid' })
    closeAll()
  }

  const handlePartialPayment = async () => {
    if (partialAmount <= 0) return
    await processPayment({ regId: registration.id, status: 'paid', amount: partialAmount })
    closeAll()
  }

  const handleCancel = async () => {
    await processPayment({ regId: registration.id, status: 'cancelled' })
    closeAll()
  }

  const hasPaid = registration.status === 'paid'
  const hasCancelled = registration.status === 'cancelled'

  return (
    <div className="relative inline-block text-left">
      {/* Status and Amount Due */}
      {/*<div className="mb-2 flex items-center space-x-4">*/}
      {/*  /!*<span className={*!/*/}
      {/*  /!*  `px-2 py-1 rounded-full text-xs font-semibold \$*!/*/}
      {/*  /!*  {registration.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : ''}*!/*/}
      {/*  /!*  {registration.status === 'paid' ? 'bg-green-200 text-green-800' : ''}*!/*/}
      {/*  /!*  {registration.status === 'cancelled' ? 'bg-red-200 text-red-800' : ''}*!/*/}
      {/*  /!*  {registration.status === 'refunded' ? 'bg-gray-200 text-gray-800' : ''}`*!/*/}
      {/*  /!*}>*!/*/}
      {/*  /!*  {registration.status.toUpperCase()}*!/*/}
      {/*  /!*</span>*!/*/}
      {/*  <span className="text-sm text-gray-600">*/}
      {/*    Amount Due: {Number(registration.amount_due).toFixed(2)}*/}
      {/*  </span>*/}
      {/*</div>*/}

      {/* Actions Button */}
      <button
        onClick={toggleMenu}
        className="inline-flex justify-center w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700"
      >
        Actions
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Menu */}
      {menuOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {!hasPaid && !hasCancelled && (
              <>
                <button
                  onClick={() => { setModalOpen(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                >Approve Payment</button>
                <button
                  onClick={() => { setCancelConfirm(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >Cancel Registration</button>
              </>
            )}
            {hasPaid && (
              <>
                <button
                  onClick={() => {/* implement receipt download */}}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >Download Receipt</button>
                {registration.coupon?.qr_code && (
                  <button
                    onClick={async () => {
                      try {
                        await generateTicketPdf(registration, true)
                      } catch (e) {
                        console.error('Ticket download error:', e)
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >Download Ticket</button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg">
            {!partialStep ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Select Payment Type</h2>
                <div className="flex justify-between space-x-4">
                  <button
                    onClick={handleFullPayment}
                    disabled={paymentLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >{paymentLoading ? 'Processing...' : 'Full Payment'}</button>
                  <button
                    onClick={() => setPartialStep(true)}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >Partial Payment</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Enter Amount</h2>
                <input
                  type="number"
                  step="0.01"
                  value={partialAmount}
                  onChange={e => setPartialAmount(parseFloat(e.target.value))}
                  className="w-full mb-4 px-3 py-2 border rounded"
                  placeholder="Amount"
                />
                {paymentError && <p className="text-red-500 text-sm mb-2">{String(paymentError)}</p>}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => { setPartialStep(false); setPartialAmount(0); }}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >Back</button>
                  <button
                    onClick={handlePartialPayment}
                    disabled={paymentLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >{paymentLoading ? 'Processing...' : 'Submit'}</button>
                </div>
              </>
            )}
            <button
              onClick={closeAll}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >✕</button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Cancellation</h2>
            <p className="mb-4">Are you sure you want to cancel this registration?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeAll}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >No</button>
              <button
                onClick={handleCancel}
                disabled={paymentLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >{paymentLoading ? 'Processing...' : 'Yes, Cancel'}</button>
            </div>
            <button
              onClick={closeAll}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >✕</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegistrationActions;
