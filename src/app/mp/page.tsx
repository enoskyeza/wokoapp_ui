'use client'
import {ParticipantProvider} from "@/context/ParticipantContext";
import JudgeDashboard from "@/components/Dashboard/Judge"
import DashboardLayout from '@/components/Layouts/Dashboard';

// import dynamic from "next/dynamic";


const JudgePage = () => {

    return (
        <ParticipantProvider>
            <DashboardLayout>
                <JudgeDashboard />
            </DashboardLayout>
        </ParticipantProvider>
    )
};

export default JudgePage;

