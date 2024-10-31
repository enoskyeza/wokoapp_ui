// components/Dashboard/Stats.tsx
import React from 'react';

const DashboardStats = ({stats}:{stats:{total:number; paid:number; unpaid:number}}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold">Total Participants</h3>
        <p className="text-2xl font-bold">{stats.total}</p>
      </div>
      <div className="bg-green-500 text-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold">Paid Participants</h3>
        <p className="text-2xl font-bold">{stats.paid}</p>
      </div>
      <div className="bg-red-500 text-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold">Unpaid Participants</h3>
        <p className="text-2xl font-bold">{stats.unpaid}</p>
      </div>
    </div>
  );
};

export default DashboardStats;
