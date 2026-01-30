import { useState } from 'react'

/**
 * Impact Comparison Panel
 *
 * Shows "What If" comparison between with and without Sentinel.
 * Modal/drawer component accessible from dashboard.
 */

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XMarkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export function ImpactComparisonPanel({ isOpen, onClose }) {
  if (!isOpen) return null

  const comparisonData = [
    {
      metric: 'AR over 90 days',
      without: '$7.0M (discovered January)',
      with: '$2.4M (caught and addressed in November)',
      improvement: true,
    },
    {
      metric: 'Time to detect AR problem',
      without: '97 days',
      with: '12 days',
      improvement: true,
    },
    {
      metric: 'Partner hours on AR/week',
      without: '11.5 hours',
      with: '2.3 hours (approvals only)',
      improvement: true,
    },
    {
      metric: 'Average days to collect',
      without: '67 days',
      with: '41 days',
      improvement: true,
    },
    {
      metric: 'Auto-handled follow-ups',
      without: '0',
      with: '47 this month',
      improvement: true,
    },
    {
      metric: 'Projected annual write-offs',
      without: '$340K',
      with: '$89K',
      improvement: true,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">What Three Months of Monitoring Changes</h2>
                <p className="text-slate-300 text-sm mt-1">Side-by-side comparison of your firm's metrics</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-600"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="p-8">
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Metric</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-600">
                      <div className="flex items-center gap-2">
                        <XMarkIcon />
                        Without Sentinel
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-600">
                      <div className="flex items-center gap-2">
                        <CheckIcon />
                        With Sentinel
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{row.metric}</td>
                      <td className="px-6 py-4 text-sm text-red-600">{row.without}</td>
                      <td className="px-6 py-4 text-sm text-emerald-600 font-medium">{row.with}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Line Box */}
            <div className="mt-8 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-emerald-500">📈</span>
                Net Impact: First 6 Weeks
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-slate-800">Revenue accelerated:</span>
                    <span className="text-emerald-600 ml-2">$892K collected via automated follow-up</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-slate-800">Partner time saved:</span>
                    <span className="text-emerald-600 ml-2">138 hours (valued at $27,600)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-slate-800">Write-offs prevented:</span>
                    <span className="text-emerald-600 ml-2">$251K (projected annual)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-slate-800">ROI to date:</span>
                    <span className="text-emerald-600 ml-2 font-bold">14.2x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Impact Button - Trigger for opening the panel
 */
export function ImpactButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      See the Impact
    </button>
  )
}

export default ImpactComparisonPanel
