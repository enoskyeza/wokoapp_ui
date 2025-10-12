'use client'

import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, TicketIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { FetchedRegistration } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge'
import RegistrationActionMenu from '@/components/ProgramDashboard/RegistrationActionMenu'

interface ParticipantDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  registration: FetchedRegistration
  onUpdate?: () => void
}

const ParticipantDetailsModal: React.FC<ParticipantDetailsModalProps> = ({
  isOpen,
  onClose,
  registration,
  onUpdate,
}) => {
  const participant = registration.participant
  const guardian = registration.guardian_at_registration
  const isFullyPaid = registration.status === 'paid'
  const hasTicket = isFullyPaid && registration.coupon?.qr_code

  const handleViewTicket = () => {
    if (registration.coupon?.qr_code) {
      window.open(registration.coupon.qr_code, '_blank')
    }
  }

  const handleDownloadTicket = () => {
    if (registration.coupon?.qr_code) {
      // Open in new tab to allow download
      const link = document.createElement('a')
      link.href = registration.coupon.qr_code
      link.download = `ticket_${registration.id}.png`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleShareTicket = () => {
    if (registration.coupon?.qr_code && guardian?.phone_number) {
      const message = encodeURIComponent(
        `🎉 ${participant.first_name}'s Ticket\n\nView your ticket: ${registration.coupon.qr_code}\n\nProgram: ${registration.program}\nParticipant: ${participant.first_name} ${participant.last_name}`
      )
      const whatsappUrl = `https://wa.me/${guardian.phone_number.replace(/[^0-9]/g, '')}?text=${message}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                        {participant.first_name} {participant.last_name}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        Registration #{registration.id}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="mt-6 space-y-6">
                  {/* Status and Program */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                      <div className="mt-1">
                        <StatusBadge status={registration.status} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Program</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{registration.program}</p>
                    </div>
                  </div>

                  {/* Participant Details */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Participant Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="text-sm font-medium text-gray-900">
                          {participant.gender === 'M' ? 'Male' : 'Female'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Age at Registration</p>
                        <p className="text-sm font-medium text-gray-900">
                          {registration.age_at_registration} years
                        </p>
                      </div>
                      {registration.school_at_registration && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">School</p>
                          <p className="text-sm font-medium text-gray-900">
                            {registration.school_at_registration}
                          </p>
                        </div>
                      )}
                      {registration.category_value && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="text-sm font-medium text-gray-900">
                            {registration.category_value}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Guardian Details */}
                  {guardian && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                        Guardian Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Name</p>
                          <p className="text-sm font-medium text-gray-900">
                            {guardian.first_name} {guardian.last_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{guardian.phone_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">{guardian.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Profession</p>
                          <p className="text-sm font-medium text-gray-900">{guardian.profession || 'N/A'}</p>
                        </div>
                        {guardian.address && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm font-medium text-gray-900">{guardian.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Payment Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Amount Due</p>
                        <p className={`text-lg font-bold ${
                          registration.amount_due > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {registration.amount_due > 0 
                            ? `UGX ${registration.amount_due.toLocaleString()}`
                            : 'Fully Paid ✓'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Registered On</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(registration.created_at).toLocaleDateString('en-UG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Receipts */}
                    {registration.receipts && registration.receipts.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Receipts ({registration.receipts.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {registration.receipts.map((receipt) => (
                            <button
                              key={receipt.id}
                              onClick={() => window.open(`/receipts/${receipt.id}`, '_blank')}
                              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              RCT-{String(receipt.id).padStart(4, '0')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ticket Section */}
                  {hasTicket && (
                    <div className="border-t pt-4 bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <TicketIcon className="h-6 w-6 text-green-600" />
                        <div>
                          <h4 className="text-sm font-semibold text-green-900">Ticket Available</h4>
                          <p className="text-xs text-green-700">This participant has been issued a ticket</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleViewTicket}
                          className="flex-1 min-w-[120px] px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          View Ticket
                        </button>
                        <button
                          onClick={handleDownloadTicket}
                          className="flex-1 min-w-[120px] px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          Download
                        </button>
                        {guardian?.phone_number && (
                          <button
                            onClick={handleShareTicket}
                            className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Share
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  
                  {!isFullyPaid && (
                    <RegistrationActionMenu
                      registration={registration}
                      onCompleted={() => {
                        onUpdate?.()
                        onClose()
                      }}
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ParticipantDetailsModal
