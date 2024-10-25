// components/Dashboard/Stats.tsx
import React from 'react';

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold">Total Participants</h3>
        <p className="text-2xl font-bold">12</p>
      </div>
      <div className="bg-green-500 text-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold">Paid Participants</h3>
        <p className="text-2xl font-bold">8</p>
      </div>
      <div className="bg-red-500 text-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold">Unpaid Participants</h3>
        <p className="text-2xl font-bold">4</p>
      </div>
    </div>
  );
};

export default DashboardStats;
