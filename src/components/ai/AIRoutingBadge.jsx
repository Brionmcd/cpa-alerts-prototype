import { useState, useEffect } from 'react'
import { useAI } from '../../context/AIContext'
import { routeAlert, getTeamMemberById } from '../../services/ai'

/**
 * AI Routing Badge
 *
 * Shows who an alert is routed to and why.
 * Includes tooltip with reasoning and ability to override.
 */

const SparklesIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

export function AIRoutingBadge({ alert, alertType, compact = false }) {
  const { logRouting } = useAI()

  const [routing, setRouting] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    loadRouting()
  }, [alert?.id])

  const loadRouting = async () => {
    if (!alert) return

    setIsLoading(true)
    try {
      const result = await routeAlert(alert, alertType)
      setRouting(result)

      // Log the routing decision
      logRouting(
        alert.id,
        alertType,
        alertType === 'ar' ? alert.clientName : alert.category,
        result
      )
    } catch (err) {
      console.error('Failed to get routing:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs">
        <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-600"></div>
        <span>Routing...</span>
      </div>
    )
  }

  if (!routing || !routing.assignedTo) {
    return null
  }

  const assignee = getTeamMemberById(routing.assignedTo.id)

  if (compact) {
    return (
      <div
        className="relative inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SparklesIcon />
        <span className="font-medium">{routing.assignedTo.name.split(' ')[0]}</span>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon />
              <span className="font-semibold">AI Routing</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                routing.confidence === 'high' ? 'bg-green-500' :
                  routing.confidence === 'medium' ? 'bg-amber-500' : 'bg-gray-500'
              }`}>
                {routing.confidence}
              </span>
            </div>
            <p className="text-slate-200">{routing.reasoning}</p>

            {/* Arrow */}
            <div className="absolute bottom-[-6px] left-4 w-3 h-3 bg-slate-800 transform rotate-45"></div>
          </div>
        )}
      </div>
    )
  }

  // Full version
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <SparklesIcon />
        <span className="text-xs font-semibold text-purple-700 uppercase">AI Routed</span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
          routing.confidence === 'high' ? 'bg-green-100 text-green-700' :
            routing.confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {routing.confidence} confidence
        </span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full ${assignee?.color || 'bg-purple-500'} flex items-center justify-center text-white font-medium`}>
          {assignee?.avatar || routing.assignedTo.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-medium text-gray-900">{routing.assignedTo.name}</p>
          <p className="text-xs text-gray-500">{assignee?.role || 'Team Member'}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600">{routing.reasoning}</p>

      {/* Alternatives */}
      {routing.alternatives && routing.alternatives.length > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-100">
          <p className="text-xs text-gray-500 mb-1">Also qualified:</p>
          <div className="flex flex-wrap gap-1">
            {routing.alternatives.map((alt) => (
              <span key={alt.id} className="px-2 py-0.5 bg-white border border-purple-200 rounded text-xs text-gray-600">
                {alt.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIRoutingBadge
