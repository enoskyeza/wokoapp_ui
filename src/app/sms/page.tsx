// app/sms/page.tsx
'use client'
import React from 'react'
import DashboardLayout from '@/components/Layouts/Dashboard';
import MessagePage from './MessagePage'
import {ContactsProvider} from "@/components/Contexts/contactDataProvider";

export default function Page() {
    return (
            <DashboardLayout>
                <ContactsProvider>
                  <MessagePage />
                </ContactsProvider>
            </DashboardLayout>
    )
}