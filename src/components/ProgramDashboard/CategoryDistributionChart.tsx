'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

import type { CategoryBreakdownItem } from '@/services/dashboardService'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface CategoryDistributionChartProps {
  data: CategoryBreakdownItem[]
}

const palette = ['#2563EB', '#7C3AED', '#F97316', '#10B981', '#EF4444', '#F59E0B']

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ data }) => {
  const labels = useMemo(() => data.map(item => item.label ?? 'Uncategorised'), [data])
  const series = useMemo(() => data.map(item => item.count), [data])

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        <p className="mt-2 text-sm text-gray-500">No category data available yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
      <div className="mt-6">
        <ReactApexChart
          type="donut"
          height={320}
          options={{
            chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
            labels,
            colors: palette,
            legend: { position: 'bottom' },
            dataLabels: { enabled: true },
          }}
          series={series}
        />
      </div>
    </div>
  )
}

export default CategoryDistributionChart
