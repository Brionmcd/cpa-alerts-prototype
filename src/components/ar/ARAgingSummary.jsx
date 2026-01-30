import { useState, useEffect } from 'react'
import { arAgingApi } from '../../services/api'
import { formatCurrency } from '../../utils/formatters'

/**
 * AR Aging Summary Component
 *
 * Visual breakdown of AR by aging buckets.
 * Highlights the 90+ day problem to show severity.
 */

export function ARAgingSummary({ onBucketClick }) {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    setIsLoading(true)
    try {
      const data = await arAgingApi.getSummary()
      setSummary(data)
    } catch (err) {
      console.error('Failed to load AR aging summary:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!summary) return null

  const buckets = [
    { key: 'current', label: 'Current', data: summary.current, color: 'emerald' },
    { key: 'thirty', label: '1-30 Days', data: summary.thirty, color: 'blue' },
    { key: 'sixty', label: '31-60 Days', data: summary.sixty, color: 'amber' },
    { key: 'ninety', label: '61-90 Days', data: summary.ninety, color: 'orange' },
    { key: 'oneTwentyPlus', label: '90+ Days', data: summary.oneTwentyPlus, color: 'red' },
  ]

  // Calculate total for percentage bars
  const maxAmount = Math.max(...buckets.map(b => b.data.amount), 1)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AR Aging Summary</h3>
          <p className="text-sm text-gray-500">
            Total Outstanding: {formatCurrency(summary.total.amount)}
          </p>
        </div>
        {/* 90+ Day Alert Badge */}
        {summary.ninetyPlus.amount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-red-700">
                {formatCurrency(summary.ninetyPlus.amount)}
              </p>
              <p className="text-xs text-red-600">90+ Days Overdue</p>
            </div>
          </div>
        )}
      </div>

      {/* Aging Buckets */}
      <div className="grid grid-cols-5 gap-4">
        {buckets.map((bucket) => {
          const percentage = (bucket.data.amount / maxAmount) * 100
          const isHighlight = bucket.key === 'oneTwentyPlus' || bucket.key === 'ninety'

          return (
            <button
              key={bucket.key}
              onClick={() => onBucketClick?.(bucket.key)}
              className={`relative p-4 rounded-lg border transition-all hover:shadow-md ${
                isHighlight
                  ? `bg-${bucket.color}-50 border-${bucket.color}-200 hover:border-${bucket.color}-300`
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {bucket.label}
              </p>
              <p className={`text-lg font-bold ${
                bucket.color === 'red' ? 'text-red-700' :
                bucket.color === 'orange' ? 'text-orange-700' :
                bucket.color === 'amber' ? 'text-amber-700' :
                bucket.color === 'emerald' ? 'text-emerald-700' :
                'text-gray-900'
              }`}>
                {formatCurrency(bucket.data.amount)}
              </p>
              <p className="text-xs text-gray-500">
                {bucket.data.count} invoice{bucket.data.count !== 1 ? 's' : ''}
              </p>

              {/* Visual bar indicator */}
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    bucket.color === 'red' ? 'bg-red-500' :
                    bucket.color === 'orange' ? 'bg-orange-500' :
                    bucket.color === 'amber' ? 'bg-amber-500' :
                    bucket.color === 'emerald' ? 'bg-emerald-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Problem Highlight */}
      {summary.ninetyPlus.amount > 5000000 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">
                Over {formatCurrency(summary.ninetyPlus.amount)} in accounts 90+ days past due
              </p>
              <p className="text-xs text-red-700 mt-1">
                Since ERP implementation, AR follow-up has stalled. Consider enabling automated reminders
                to address these aging accounts before they require partner intervention.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ARAgingSummary
