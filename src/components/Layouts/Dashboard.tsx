"use client"

import React, { ReactNode, useState } from 'react'
import SideNav from './SideNav';
import TopNav from './TopNav';

const userNavigation = [
  { name: "My profile", href: "/settings/profile" },
];

const Dashboard = ({children}: {children: ReactNode}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div>
      <SideNav sideBar={sidebarOpen} setSideBar={setSidebarOpen} />

      <div className="lg:pl-72">
        <TopNav userNavigation={userNavigation} setSideBar={setSidebarOpen} />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard
