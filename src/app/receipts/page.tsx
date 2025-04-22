// app/sms/page.tsx
'use client'
import React from 'react'
import DashboardLayout from '@/components/Layouts/Dashboard';
import {ReceiptsProvider} from "@/components/Contexts/ReceiptDataProvider";
import Receipts from "@/components/Tables/Receipts";
import {RegistrationProvider} from "@/components/Contexts/regDataProvider";

export default function Page() {
    return (
            <DashboardLayout>
                <RegistrationProvider>
                    <ReceiptsProvider>
                        <Receipts />
                    </ReceiptsProvider>
                </RegistrationProvider>
            </DashboardLayout>
    )
}