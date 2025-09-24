import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingProgramDashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0,1,2,3].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-20 mt-2" />
          </div>
        ))}
      </div>

      {/* Chart + side panel */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-3">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-6 md:items-end">
          <div className="md:col-span-2 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
          {[0,1,2,3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <div className="md:col-span-6 flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center rounded-t-lg justify-between bg-gray-100 p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="p-4 space-y-3">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="col-span-2 h-4 w-24" />
              <Skeleton className="col-span-3 h-4 w-36" />
              <Skeleton className="col-span-2 h-4 w-20" />
              <div className="col-span-2 flex justify-end gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-4 flex items-center justify-between text-sm">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}
