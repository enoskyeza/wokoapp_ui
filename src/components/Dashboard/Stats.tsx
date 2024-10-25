import React from 'react';

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Registered Participants */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-lg font-semibold text-gray-700">Total Participants</div>
        <div className="mt-4 text-3xl font-bold text-blue-600">32</div>
      </div>

      {/* Male Participants */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-lg font-semibold text-gray-700">Male Participants</div>
        <div className="mt-4 text-3xl font-bold text-blue-600">18</div>
      </div>

      {/* Female Participants */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-lg font-semibold text-gray-700">Female Participants</div>
        <div className="mt-4 text-3xl font-bold text-blue-600">14</div>
      </div>

      {/* Age Category Breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-lg font-semibold text-gray-700">Age Category Breakdown</div>
        <ul className="mt-4 space-y-2">
          <li className="flex justify-between">
            <span className="text-gray-500">Young (3-7)</span>
            <span className="font-semibold text-blue-600">12</span>
          </li>
          <li className="flex justify-between">
            <span className="text-gray-500">Middle (8-12)</span>
            <span className="font-semibold text-blue-600">10</span>
          </li>
          <li className="flex justify-between">
            <span className="text-gray-500">Old (13-17)</span>
            <span className="font-semibold text-blue-600">10</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardStats;
