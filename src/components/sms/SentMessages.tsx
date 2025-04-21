'use client'
import React, { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { SentMessage } from '@/types'
import {dummySentMessages} from "@/components/sms/dummySentMessages";
// import {useContacts} from "@/components/Contexts/contactDataProvider";

// const API_BASE = process.env.NODE_ENV === 'production'
//   ? 'https://yourapi.com/register'
//   : 'http://127.0.0.1:8000/register'

// type SentMessagesProps = {
//   onSendClick: () => void
// }

type SentMessagesProps = {
  onSendClickAction: () => void
}


export default function SentMessages({ onSendClickAction }: SentMessagesProps) {
  const [messages, setMessages] = useState<SentMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const { refreshContacts } = useContacts()

  const fetchMessages = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // const res = await axios.get<SentMessage[]>(`${API_BASE}/sms/sent/`)
      // setMessages(res.data)
      console.log('Dummy fetch, axios lib:', axios)
      setMessages(dummySentMessages)
    } catch (err) {
      const axiosErr = err as AxiosError
      setError(axiosErr.response?.data?.toString() ?? axiosErr.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchMessages()
  }, [])

  return (
    <div className="flex flex-col space-y-4">
      <button
        onClick={onSendClickAction}
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Send SMS
      </button>

      {isLoading && <p className="text-center text-gray-500">Loading messages...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <ul className="space-y-2">
          {messages.map(msg => (
            <li key={msg.id} className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">To: {msg.to}</span>
                <span className="text-xs text-gray-500">{new Date(msg.dateSent).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-gray-700">{msg.body}</p>
            </li>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-gray-500">No messages sent yet.</p>
          )}
        </ul>
      )}
    </div>
  )
}
