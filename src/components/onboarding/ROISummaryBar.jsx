/**
 * ROI Summary Bar
 *
 * Persistent summary bar showing Sentinel's impact metrics.
 * Can be placed at the bottom of the dashboard or in the sidebar.
 */

export function ROISummaryBar({ onSeeFullReport }) {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-t border-slate-600 px-6 py-3">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm font-medium">Sentinel Impact This Month</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <span className="text-emerald-400 font-semibold">$892K</span>
            <span className="text-slate-400 text-xs">collected automatically</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg">⏱️</span>
            <span className="text-emerald-400 font-semibold">34</span>
            <span className="text-slate-400 text-xs">partner hours saved</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="text-emerald-400 font-semibold">8</span>
            <span className="text-slate-400 text-xs">issues caught early</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <span className="text-emerald-400 font-semibold">18.7x</span>
            <span className="text-slate-400 text-xs">ROI</span>
          </div>

          <button
            onClick={onSeeFullReport}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            See full impact report
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact ROI Summary - For sidebar or smaller spaces
 */
export function ROISummaryCompact({ onSeeFullReport }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="text-slate-300 text-xs font-medium">This Month's Impact</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Collected</span>
          <span className="text-emerald-400 text-sm font-semibold">$892K</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Hours Saved</span>
          <span className="text-emerald-400 text-sm font-semibold">34</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Issues Caught</span>
          <span className="text-emerald-400 text-sm font-semibold">8</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">ROI</span>
          <span className="text-emerald-400 text-sm font-semibold">18.7x</span>
        </div>
      </div>

      <button
        onClick={onSeeFullReport}
        className="mt-3 w-full text-emerald-400 hover:text-emerald-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
      >
        Full report
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

export default ROISummaryBar
