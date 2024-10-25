// pages/dashboard/index.tsx
'use client';
import DashboardLayout from '@/components/Layouts/Dashboard';
import DashboardStats from '@/components/Dashboard/Stats';
import Contestants from "@/components/Tables/Contestants";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      {/*<h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>*/}

      {/* Statistics Cards */}
      <DashboardStats />

      {/* Participants Table */}
      <Contestants />
    </DashboardLayout>
  );
};

export default DashboardPage;