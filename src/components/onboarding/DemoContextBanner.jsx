import { useState, useEffect } from 'react'

/**
 * Demo Context Banner
 *
 * Sets the scenario for the demo at the top of the dashboard.
 * Dismissible and remembers state in localStorage.
 */

const STORAGE_KEY = 'sentinel_demo_banner_dismissed'

export function DemoContextBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-5 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-4">
        <div className="text-2xl">📊</div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">Demo Scenario: Redpath & Company</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            It's <span className="text-emerald-400 font-medium">January 15th, 2025</span>. Your firm implemented a new ERP system on October 1st. During the transition, AR follow-up fell through the cracks. Sentinel has been running for 6 weeks, and here's what it's found—and fixed.
          </p>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">47</span>
              <span className="text-slate-400">auto-reminders sent this month</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">$892K</span>
              <span className="text-slate-400">collected without partner involvement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">8</span>
              <span className="text-slate-400">issues caught before they escalated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function resetDemoBanner() {
  localStorage.removeItem(STORAGE_KEY)
}

export default DemoContextBanner
