'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'

const SentMessages = dynamic(() => import('@/components/sms/SentMessages'), { ssr: false })
const SingleSMSForm = dynamic(() => import('@/components/sms/forms/SingleSMSForm'), { ssr: false })
const CustomSMSForm = dynamic(() => import('@/components/sms/forms/CustomSMSForm'), { ssr: false })
const BulkSMSForm = dynamic(() => import('@/components/sms/forms/BulkSMSForm'), { ssr: false })
// const WhatsAppForm = dynamic(() => import('@/components/WhatsAppForm'), { ssr: false })
// const EmailForm = dynamic(() => import('@/components/EmailForm'), { ssr: false })

export default function MessagePage() {
  const [mainTab, setMainTab] = useState<'messages' | 'sms' | 'whatsapp' | 'email'>('messages')
  const [smsTab, setSmsTab] = useState<'single' | 'custom' | 'bulk'>('single')

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      {/* Main Tabs */}
      <div className="flex justify-around bg-gray-100">
        {(['messages', 'sms', 'whatsapp', 'email'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`flex-1 py-3 text-center text-sm font-medium hover:bg-gray-200 focus:outline-none ${
              mainTab === tab
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600'
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {mainTab === 'messages' && (
          <SentMessages onSendClickAction={() => setMainTab('sms')} />
        )}

        {mainTab === 'sms' && (
          <>
            {/* SMS Sub-tabs */}
            <div className="flex space-x-2 border-b mb-4">
              {(['single', 'custom', 'bulk'] as const).map(sub => (
                <button
                  key={sub}
                  onClick={() => setSmsTab(sub)}
                  className={`flex-1 py-2 text-sm font-medium hover:bg-gray-100 focus:outline-none ${
                    smsTab === sub
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-600'
                  }`}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </button>
              ))}
            </div>
            {/* SMS Forms */}
            <div>
              {smsTab === 'single' && <SingleSMSForm />}
              {smsTab === 'custom' && <CustomSMSForm />}
              {smsTab === 'bulk' && <BulkSMSForm />}
            </div>
          </>
        )}

        {mainTab === 'whatsapp' && (
          <div className="text-center text-gray-500">WhatsApp view coming soon</div>
        )}

        {mainTab === 'email' && (
          <div className="text-center text-gray-500">Email view coming soon</div>
        )}
      </div>
    </div>
  )
}
