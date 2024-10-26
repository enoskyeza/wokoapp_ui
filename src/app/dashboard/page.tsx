'use client'
import DashboardLayout from '@/components/Layouts/Dashboard';
import DashboardStats from '@/components/Dashboard/Stats';
import Contestants from "@/components/Tables/Contestants";
import dynamic from "next/dynamic";

const AgeCategoryChart = dynamic(() => import("@/components/Dashboard/CategoryPieChart"), {
  ssr: false,
});

const DashboardPage = () => {
    return (

        <DashboardLayout>
            {/*<h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>*/}

            {/* Statistics Cards */}
            <DashboardStats/>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <AgeCategoryChart />
                {/*<GenderChart/>*/}
                {/*<PaymentStatusChart/>*/}
            </div>

            {/* Participants Table */}
            <Contestants/>
        </DashboardLayout>
    );
};

export default DashboardPage;