import { useState, useEffect } from 'react'

/**
 * Welcome Screen Component
 *
 * Introduces Sentinel to prospective CPA firm partners.
 * Creates an "ah-ha" moment by speaking to their pain points.
 */

const STORAGE_KEY = 'sentinel_welcome_dismissed'

// Icons
const BrainIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const EscalationIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const VoiceIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

export function WelcomeScreen({ onGetStarted }) {
  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    onGetStarted?.()
  }

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    onGetStarted?.()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>

          <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
            {/* Header with Logo & CTA */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <ShieldIcon />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Sentinel</h1>
                  <p className="text-emerald-400 text-sm font-medium">Your AI-Powered Financial Watchdog</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                See It In Action
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Hero Content */}
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Stop Letting Revenue Slip Through the Cracks
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Intelligent monitoring that catches the problems your team is too busy to track—before they become write-offs.
              </p>
              <button
                onClick={handleDismiss}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 md:hidden"
              >
                See It In Action
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="bg-slate-800 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-4">Sound Familiar?</h3>

            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 mb-12">
              <p className="text-lg text-slate-200 leading-relaxed">
                "Your AR clerks used to follow up on aging receivables. Then you implemented a new ERP system, and that process broke. Now you've got <span className="text-red-400 font-semibold">$7 million</span> sitting in 90+ day AR, and partners are running their own aging reports.
              </p>
              <p className="text-lg text-slate-300 mt-4 leading-relaxed">
                That's <span className="text-amber-400 font-semibold">$500/hour partner time</span> doing $30/hour admin work—while revenue silently ages into write-offs."
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-white mb-2">42%</p>
                <p className="text-slate-400 text-sm">of CPA firms turned away work last year due to staffing shortages</p>
              </div>
              <div className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-white mb-2">$340K</p>
                <p className="text-slate-400 text-sm">average annual write-offs at mid-size firms from uncollected AR</p>
              </div>
              <div className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-white mb-2">67 days</p>
                <p className="text-slate-400 text-sm">average time to collect—23 days longer than five years ago</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Difference Section */}
        <section className="bg-slate-900 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-4">Why AI Changes Everything</h3>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl">
              Traditional alerts are noise. They spam you until you ignore them. AI-powered monitoring is different—it learns your business, prioritizes what matters, and takes action on your behalf.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="text-emerald-400 mb-4">
                  <BrainIcon />
                </div>
                <h4 className="text-white font-semibold mb-2">Learns Your Patterns</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Distinguishes slow-paying clients from actual problems. Knows that Client A always pays on day 58, but Client B at day 45 is a red flag.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="text-emerald-400 mb-4">
                  <EscalationIcon />
                </div>
                <h4 className="text-white font-semibold mb-2">Smart Escalation</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Automatically escalates to the CFO after the AP contact ignores two reminders. Knows when to cc the partner vs. handle it quietly.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="text-emerald-400 mb-4">
                  <VoiceIcon />
                </div>
                <h4 className="text-white font-semibold mb-2">Your Voice, Not a Robot</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Drafts follow-up emails that match your firm's tone—professional but not aggressive. No more "billing committee" excuses needed.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="text-emerald-400 mb-4">
                  <ChartIcon />
                </div>
                <h4 className="text-white font-semibold mb-2">Gets Smarter Over Time</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Every approval, edit, and override teaches the system. After 90 days, it handles 80% of follow-ups without partner involvement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="bg-slate-800 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-4">What Firms Like Yours Are Seeing</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-700/30 rounded-xl p-6">
                <p className="text-4xl font-bold text-emerald-400 mb-1">52%</p>
                <p className="text-white font-medium mb-2">reduction in 90+ day receivables</p>
                <p className="text-slate-400 text-xs">Average across firms in first 6 months</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-700/30 rounded-xl p-6">
                <p className="text-4xl font-bold text-emerald-400 mb-1">4.2 hrs</p>
                <p className="text-white font-medium mb-2">partner time saved per week</p>
                <p className="text-slate-400 text-xs">Previously spent on AR monitoring & follow-up</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-700/30 rounded-xl p-6">
                <p className="text-4xl font-bold text-emerald-400 mb-1">26 days</p>
                <p className="text-white font-medium mb-2">faster average collection</p>
                <p className="text-slate-400 text-xs">From 67 days down to 41 days</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-700/30 rounded-xl p-6">
                <p className="text-4xl font-bold text-emerald-400 mb-1">15-20x</p>
                <p className="text-white font-medium mb-2">typical ROI</p>
                <p className="text-slate-400 text-xs">In recovered revenue and time savings</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-slate-900 py-16 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to See It In Action?</h3>
              <p className="text-slate-400 mb-8">
                You're about to see a working demo with sample data from a firm like yours. Everything you see—the alerts, the AI recommendations, the automated actions—is exactly how it works in production.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleDismiss}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  See It In Action
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Skip intro, show me the dashboard
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export function resetWelcomeScreen() {
  localStorage.removeItem(STORAGE_KEY)
}

export default WelcomeScreen
