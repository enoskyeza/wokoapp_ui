'use client'
import DashboardLayout from '@/components/Layouts/Dashboard';
import ContestantDetails from "@/components/DetailViews/ContestantDetails";
// import ContestantDetails from "@/components/DetailViews/Contestant";
// import dynamic from "next/dynamic";
//
// const AgeCategoryChart = dynamic(() => import("@/components/Dashboard/CategoryPieChart"), {
//     ssr: false,
// });

const DashboardPage = () => {

    return (
        <DashboardLayout>
            <ContestantDetails />
        </DashboardLayout>
    )
};

export default DashboardPage;