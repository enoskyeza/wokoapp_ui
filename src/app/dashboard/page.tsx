'use client'
import {ParticipantProvider} from "@/context/ParticipantContext";

import DashboardLayout from '@/components/Layouts/Dashboard';
import DashboardStats from '@/components/Dashboard/Stats';
import Contestants from "@/components/Tables/Contestants";

import dynamic from "next/dynamic";

const AgeCategoryChart = dynamic(() => import("@/components/Dashboard/CategoryPieChart"), {
    ssr: false,
});

const DashboardPage = () => {

    return (
        <ParticipantProvider>
            <DashboardLayout>
                {/* Statistics Cards */}
                <DashboardStats/>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <AgeCategoryChart/>
                </div>

                {/* Participants Table */}
                <Contestants/>
            </DashboardLayout>
        </ParticipantProvider>
    )
};

export default DashboardPage;