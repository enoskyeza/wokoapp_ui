// components/context/ContactsDataProvider.tsx
'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios, { AxiosError } from 'axios'
import { Guardian } from '@/types'

// Base API URL depending on environment
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

export type ContactsContextType = {
  contacts: Guardian[]
  isLoading: boolean
  error: unknown

  selectedContacts: Guardian[]
  setSelectedContacts: (contacts: Guardian[]) => void

  filterQuery: string
  setFilterQuery: (query: string) => void

  refreshContacts: () => Promise<void>
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined)

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Guardian[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)

  const [selectedContacts, setSelectedContacts] = useState<Guardian[]>([])
  const [filterQuery, setFilterQuery] = useState<string>('')

  const fetchContacts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `${API_BASE}/guardians/${filterQuery ? `?search=${encodeURIComponent(filterQuery)}` : ''}`
      const response = await axios.get<Guardian[]>(url)
      setContacts(response.data)
    } catch (err) {
      const axiosErr = err as AxiosError
      setError(axiosErr.response?.data ?? axiosErr.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchContacts()
  }, [filterQuery])

  const refreshContacts = () => fetchContacts()

  return (
    <ContactsContext.Provider value={{
      contacts,
      isLoading,
      error,
      selectedContacts,
      setSelectedContacts,
      filterQuery,
      setFilterQuery,
      refreshContacts,
    }}>
      {children}
    </ContactsContext.Provider>
  )
}

// Custom hook
export function useContacts() {
  const context = useContext(ContactsContext)
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider')
  }
  return context
}


