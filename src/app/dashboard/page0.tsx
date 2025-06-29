'use client'
import {ParticipantProvider} from "@/context/ParticipantContext";

import DashboardLayout from '@/components/Layouts/Dashboard';


const DashboardPage = () => {

    return (
        <ParticipantProvider>
            <DashboardLayout>
                <p>Dashboard view coming soon...</p>
            </DashboardLayout>
        </ParticipantProvider>
    )
};

export default DashboardPage;