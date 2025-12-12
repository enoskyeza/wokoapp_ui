'use client'

import React, { useState } from 'react'
import Dashboard from '@/components/Layouts/Dashboard'
import { Cog6ToothIcon, UserGroupIcon, ScaleIcon } from '@heroicons/react/24/outline'
import JudgeManagement from '@/components/Settings/JudgeManagement'
import JudgeAssignments from '@/components/Settings/JudgeAssignments'

type Tab = 'accounts' | 'judge-panel'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('judge-panel')

  const tabs = [
    { id: 'accounts' as Tab, name: 'Accounts', icon: UserGroupIcon, comingSoon: true },
    { id: 'judge-panel' as Tab, name: 'Judge Panel', icon: ScaleIcon, comingSoon: false },
  ]

  return (
    <Dashboard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Cog6ToothIcon className="h-8 w-8 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage your application settings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => !tab.comingSoon && setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                  ${tab.comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
                {tab.comingSoon && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    Coming Soon
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'accounts' && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Account Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                This feature is coming soon. You&apos;ll be able to manage user accounts here.
              </p>
            </div>
          )}

          {activeTab === 'judge-panel' && (
            <div className="space-y-8">
              {/* Judge Management Section */}
              <JudgeManagement />
              
              {/* Divider */}
              <div className="border-t border-gray-200" />
              
              {/* Judge Assignments Section */}
              <JudgeAssignments />
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  )
}
