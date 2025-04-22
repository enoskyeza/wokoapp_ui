// app/sms/page.tsx
'use client'
import React from 'react'
import DashboardLayout from '@/components/Layouts/Dashboard';
import {RegistrationProvider} from "@/components/Contexts/regDataProvider";
import {EnrollmentProvider} from "@/components/Contexts/enrollmentDataProvider";
import Registrations from "@/components/Tables/Registrations";

export default function Page() {
    return (
            <DashboardLayout>
                <RegistrationProvider>
                    <EnrollmentProvider>
                        <Registrations />
                    </EnrollmentProvider>
                </RegistrationProvider>
            </DashboardLayout>
    )
}