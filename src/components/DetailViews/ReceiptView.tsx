'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { ArrowDownTrayIcon, PrinterIcon, ShareIcon } from '@heroicons/react/24/outline'
import { generateReceiptPdf, generateReceiptPdfBlob, printReceipt } from '@/lib/printReceipt'
import { Receipt, FetchedRegistration } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge'

interface ReceiptViewProps {
  receipt: Receipt & {
    registration_details?: FetchedRegistration;
    program_name?: string;
    participant_name?: string;
    program_logo_url?: string | null;
    program_fee?: string;
    amount_paid_total?: string;
    outstanding_balance?: string;
  }
}

const ReceiptView: React.FC<ReceiptViewProps> = ({ receipt }) => {
  const [loading, setLoading] = useState<string | null>(null)

  const toTitleCase = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  const parseMoney = (value?: string | number | null) => {
    if (value === null || value === undefined) return 0
    const n = typeof value === 'number' ? value : parseFloat(String(value))
    return Number.isFinite(n) ? n : 0
  }

  const handleDownload = async () => {
    setLoading('download')
    try {
      await generateReceiptPdf(receipt, true)
      toast.success('Receipt downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download receipt')
    } finally {
      setLoading(null)
    }
  }

  const handlePrint = async () => {
    setLoading('print')
    try {
      await printReceipt(receipt)
      toast.success('Opening print dialog...')
    } catch (error) {
      console.error('Print error:', error)
      toast.error('Failed to print receipt')
    } finally {
      setLoading(null)
    }
  }

  const handleShare = async () => {
    setLoading('share')
    try {
      const pdfBlob = await generateReceiptPdfBlob(receipt)
      const file = new File([pdfBlob], `receipt_${receipt.id}.pdf`, { type: 'application/pdf' })

      // Check if sharing is supported
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Receipt ${receipt.id}`,
          text: `Receipt for ${receipt.participant_name || 'participant'}`,
          files: [file],
        })
        toast.success('Receipt shared successfully')
      } else {
        // Fallback: Share via WhatsApp Web with phone number if available
        const guardian = receipt.registration_details?.guardian_at_registration
        if (guardian?.phone_number) {
          // Create a data URL for the PDF
          const dataUrl = URL.createObjectURL(pdfBlob)
          const amountPaid = parseMoney(receipt.amount_paid_total ?? receipt.amount)
          const message = encodeURIComponent(
            `Receipt for ${receipt.participant_name || 'participant'}\nAmount Paid: UGX ${amountPaid.toLocaleString()}\nView receipt: ${window.location.origin}/receipts/${receipt.id}`
          )
          const whatsappUrl = `https://wa.me/${guardian.phone_number.replace(/[^0-9]/g, '')}?text=${message}`
          window.open(whatsappUrl, '_blank')
          toast.success('Opening WhatsApp...')
          // Clean up the URL after a delay
          setTimeout(() => URL.revokeObjectURL(dataUrl), 1000)
        } else {
          toast.error('No guardian phone number available for sharing')
        }
      }
    } catch (error) {
      console.error('Share error:', error)
      toast.error('Failed to share receipt')
    } finally {
      setLoading(null)
    }
  }

  const participant = receipt.registration_details?.participant
  const guardian = receipt.registration_details?.guardian_at_registration

  const programFee = parseMoney(receipt.program_fee)
  const amountPaidTotal = parseMoney(receipt.amount_paid_total)
  const outstandingBalance = parseMoney(receipt.outstanding_balance ?? receipt.registration_details?.amount_due)

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Program Logo */}
      {receipt.program_logo_url && (
        <div className="flex justify-center pb-2">
          <img
            src={receipt.program_logo_url}
            alt={receipt.program_name || 'Program Logo'}
            className="h-16 max-w-[200px] object-contain"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Receipt</h2>
          <p className="text-sm text-gray-500 mt-1">
            RCT-{String(receipt.id).padStart(4, '0')}
          </p>
        </div>
        <StatusBadge status={receipt.status === 'paid' ? 'paid' : 'cancelled'} />
      </div>

      {/* Receipt Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Participant Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Participant Information
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm font-medium text-gray-900">
                {participant 
                  ? toTitleCase(`${participant.first_name} ${participant.last_name}`)
                  : receipt.participant_name ? toTitleCase(receipt.participant_name) : 'N/A'}
              </p>
            </div>
            {participant && (
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-sm font-medium text-gray-900">
                  {participant.gender === 'M' ? 'Male' : 'Female'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Guardian Info */}
        {guardian && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Guardian Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {toTitleCase(`${guardian.first_name} ${guardian.last_name}`)}
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
            </div>
          </div>
        )}
      </div>

      {/* Payment Details */}
      <div className="border-t border-b py-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Payment Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Program</p>
            <p className="text-sm font-medium text-gray-900">
              {receipt.program_name || receipt.registration_details?.program || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Program Fee</p>
            <p className="text-sm font-semibold text-gray-900">
              UGX {programFee.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(receipt.created_at).toLocaleDateString('en-UG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Amount Paid</p>
            <p className="text-lg font-bold text-green-600">
              UGX {amountPaidTotal.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Outstanding Balance</p>
            <p className={`text-lg font-bold ${
              outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {outstandingBalance > 0
                ? `UGX ${outstandingBalance.toLocaleString()}`
                : 'Fully Paid ✓'}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">Issued By</p>
          <p className="text-sm font-medium text-gray-900">{receipt.issued_by_name || 'Staff'}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={loading !== null}
          className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          {loading === 'download' ? 'Downloading...' : 'Download PDF'}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          disabled={loading !== null}
          className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PrinterIcon className="h-5 w-5" />
          {loading === 'print' ? 'Printing...' : 'Print'}
        </button>

        <button
          type="button"
          onClick={handleShare}
          disabled={loading !== null}
          className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShareIcon className="h-5 w-5" />
          {loading === 'share' ? 'Sharing...' : 'Share to WhatsApp'}
        </button>
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 text-center">
        This is an official computer-generated receipt. For any queries, please contact the administrator.
      </p>
    </div>
  )
}

export default ReceiptView
