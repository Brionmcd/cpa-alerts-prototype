import { useState, useEffect } from 'react'

/**
 * Section Callout Component
 *
 * Contextual callouts for each main section of the dashboard.
 * Dismissible and remembers state in localStorage.
 */

const LightbulbIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

export function SectionCallout({ section, id, header, body, aiInsight, onDismiss }) {
  // Support both direct props and section lookup
  const content = section ? CALLOUT_CONTENT[section] : { id, header, body, aiInsight }
  const calloutId = content?.id || id
  const storageKey = `sentinel_callout_${calloutId}_dismissed`
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey)
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [storageKey])

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true')
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible || !content) return null

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-4 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-amber-400 hover:text-amber-600 transition-colors p-1"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-3">
        <div className="text-amber-500 mt-0.5">
          <LightbulbIcon />
        </div>
        <div className="flex-1 pr-6">
          <h4 className="font-semibold text-slate-800 text-sm mb-1">{content.header}</h4>
          <p className="text-slate-600 text-sm leading-relaxed">{content.body}</p>

          {content.aiInsight && (
            <div className="mt-3 flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
              <span className="text-purple-500 mt-0.5">
                <SparklesIcon />
              </span>
              <p className="text-purple-700 text-xs leading-relaxed">
                <span className="font-semibold">AI Insight:</span> {content.aiInsight}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Alert Tooltip Component
 *
 * Info icon with hover/click tooltip for individual alerts.
 */
export function AlertTooltip({ content }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-1 text-slate-400 hover:text-purple-500 transition-colors"
        aria-label="More info"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl">
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5 flex-shrink-0">
              <SparklesIcon />
            </span>
            <p className="leading-relaxed">{content}</p>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      )}
    </div>
  )
}

// Pre-defined callout content
export const CALLOUT_CONTENT = {
  arAging: {
    id: 'ar-aging',
    header: "💡 This Is Where You Catch the $7M Problem Early",
    body: "Three months ago, your 90+ day AR was $2.1M. Without monitoring, it grew 233% to $7M before anyone noticed. Sentinel flags the trajectory at $2.8M—while there's still time to act.",
    aiInsight: "AI identified 12 clients trending from 60→90 days and auto-escalated to CFO contacts, recovering $340K before it hit this dashboard.",
  },
  expenseAnomaly: {
    id: 'expense-anomaly',
    header: "💡 Remember That AR Overspend You Discovered Too Late?",
    body: "By the time you found it, the damage was done. Sentinel monitors spending patterns in real-time and flags anomalies while you can still course-correct.",
    aiInsight: "Current alert: Q4 software spending is 47% above historical average. Flagged 3 weeks before month-end close.",
  },
  timesheetReminder: {
    id: 'timesheet-reminder',
    header: "💡 Unbilled Time Is Invisible Revenue",
    body: "WIP sitting unbilled for 45+ days has a 31% higher chance of being written down or off. Sentinel learns each partner's billing rhythm and nudges accordingly.",
    aiInsight: "Currently tracking $127K in aging WIP. 3 partners notified this week. $89K already converted to invoices.",
  },
}

// Tooltip content for individual alerts
export const TOOLTIP_CONTENT = {
  highPriorityAR: "Why flagged: This client's payment pattern changed. They historically pay at 34 days. Current invoice is at 67 days with no communication. Probability of collection drops 23% if not addressed this week.",
  autoReminderStatus: "AI action: Sent friendly reminder on Day 45. Sent follow-up on Day 60. Recommending CFO escalation based on pattern: AP contact hasn't opened either email.",
  recommendedAction: "Why this recommendation: Historical data shows CFO involvement resolves 73% of stalled AR at this client. Draft email ready for your review.",
  spendingAnomaly: "Why flagged: This expense category is 2.3 standard deviations above your 24-month average for this period. Similar spikes in the past were 60% unplanned/unbudgeted.",
  patternDetection: "AI learning: This vendor's invoices have increased 15% each of the last 4 months. Projected annual impact: +$34K over budget if trend continues.",
  timesheetReminder: "Why now: This partner typically bills project work within 30 days of completion. This project closed 44 days ago. Reminder sent—partner billed within 24 hours.",
  wipAging: "Pattern detected: This client's WIP has been sitting for 52 days. Historical data shows this partner bills this client quarterly. Flagging because current WIP is 3x typical quarterly amount.",
}

export function resetCallouts() {
  Object.values(CALLOUT_CONTENT).forEach(callout => {
    localStorage.removeItem(`sentinel_callout_${callout.id}_dismissed`)
  })
}

export default SectionCallout
