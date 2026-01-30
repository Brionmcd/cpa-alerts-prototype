import { useState, useEffect } from 'react'
import { useAI } from '../../context/AIContext'
import { enrichARAlert, enrichExpenseAlert } from '../../services/ai'

/**
 * AI Insights Panel
 *
 * Displays AI-generated insights for an alert including:
 * - Summary and risk assessment
 * - Recommended action with reasoning
 * - Patterns detected
 * - Client/budget insights
 */

// Icons
const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const ChevronUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

// Risk level badge colors
const getRiskColors = (level) => {
  switch (level) {
    case 'high': return 'bg-red-100 text-red-700 border-red-200'
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'low': return 'bg-green-100 text-green-700 border-green-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// Urgency badge colors
const getUrgencyColors = (urgency) => {
  switch (urgency) {
    case 'immediate': return 'bg-red-500 text-white'
    case 'today': return 'bg-amber-500 text-white'
    case 'this_week': return 'bg-blue-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

// Action icon based on type
const getActionIcon = (action) => {
  switch (action) {
    case 'call':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    case 'email':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    case 'escalate':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )
  }
}

export function AIInsightsPanel({ alert, alertType, onDraftEmail }) {
  const { getCachedEnrichment, cacheEnrichment, logEnrichment } = useAI()

  const [insights, setInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFullReasoning, setShowFullReasoning] = useState(false)
  const [showPatterns, setShowPatterns] = useState(false)

  // Load insights on mount or when alert changes
  useEffect(() => {
    loadInsights()
  }, [alert?.id])

  const loadInsights = async (forceRefresh = false) => {
    if (!alert) return

    // Check cache first
    if (!forceRefresh) {
      const cached = getCachedEnrichment(alert.id)
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 min cache
        setInsights(cached.data)
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const enrichment = alertType === 'ar'
        ? await enrichARAlert(alert)
        : await enrichExpenseAlert(alert)

      setInsights(enrichment)
      cacheEnrichment(alert.id, enrichment)

      // Log the enrichment activity
      logEnrichment(
        alert.id,
        alertType,
        alertType === 'ar' ? alert.clientName : alert.category,
        enrichment
      )
    } catch (err) {
      console.error('Failed to load AI insights:', err)
      setError('Failed to load AI insights')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-purple-700 mb-3">
          <SparklesIcon />
          <span className="font-semibold">AI Insights</span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-purple-600">Analyzing alert...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <SparklesIcon />
          <span className="font-semibold">AI Insights</span>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => loadInsights(true)}
          className="mt-2 text-red-700 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!insights) {
    return null
  }

  return (
    <div className="border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-purple-700">
          <SparklesIcon />
          <span className="font-semibold">AI Insights</span>
          <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full border ${getRiskColors(insights.riskLevel)}`}>
            {insights.riskLevel?.toUpperCase()} RISK
          </span>
        </div>
        <button
          onClick={() => loadInsights(true)}
          className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
          title="Refresh insights"
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Summary */}
      <p className="text-gray-700 text-sm mb-4">{insights.summary}</p>

      {/* Recommended Action */}
      {insights.recommendedAction && (
        <div className="bg-white rounded-lg p-3 mb-4 border border-purple-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              {getActionIcon(insights.recommendedAction.action)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">
                  {insights.recommendedAction.description}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getUrgencyColors(insights.recommendedAction.urgency)}`}>
                  {insights.recommendedAction.urgency?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-600">{insights.recommendedAction.reasoning}</p>
            </div>
          </div>

          {/* Draft Email button if action is email */}
          {(insights.recommendedAction.action === 'email' || insights.recommendedAction.action === 'call') && onDraftEmail && (
            <button
              onClick={onDraftEmail}
              className="mt-3 w-full py-2 px-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Draft Follow-up Message
            </button>
          )}
        </div>
      )}

      {/* Risk Factors */}
      {insights.riskFactors && insights.riskFactors.length > 0 && (
        <div className="mb-4">
          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Risk Factors</h5>
          <ul className="space-y-1">
            {insights.riskFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-500 mt-0.5">•</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Patterns */}
      {insights.patterns && insights.patterns.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowPatterns(!showPatterns)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 hover:text-gray-700"
          >
            Patterns Detected ({insights.patterns.length})
            {showPatterns ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
          {showPatterns && (
            <div className="space-y-2">
              {insights.patterns.map((pattern, idx) => (
                <div key={idx} className="bg-amber-50 border border-amber-200 rounded p-2">
                  <span className="text-xs font-medium text-amber-700 uppercase">
                    {pattern.type?.replace('_', ' ')}
                  </span>
                  <p className="text-sm text-gray-700 mt-1">{pattern.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Client/Budget Insights */}
      {(insights.clientInsights || insights.budgetInsights) && (
        <div className="mb-4">
          <button
            onClick={() => setShowFullReasoning(!showFullReasoning)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 hover:text-gray-700"
          >
            {alertType === 'ar' ? 'Client Insights' : 'Budget Insights'}
            {showFullReasoning ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
          {showFullReasoning && (
            <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2 text-sm">
              {alertType === 'ar' && insights.clientInsights && (
                <>
                  {insights.clientInsights.paymentBehavior && (
                    <div>
                      <span className="font-medium text-gray-700">Payment Behavior: </span>
                      <span className="text-gray-600">{insights.clientInsights.paymentBehavior}</span>
                    </div>
                  )}
                  {insights.clientInsights.relationshipContext && (
                    <div>
                      <span className="font-medium text-gray-700">Relationship: </span>
                      <span className="text-gray-600">{insights.clientInsights.relationshipContext}</span>
                    </div>
                  )}
                  {insights.clientInsights.communicationTip && (
                    <div>
                      <span className="font-medium text-gray-700">Tip: </span>
                      <span className="text-gray-600">{insights.clientInsights.communicationTip}</span>
                    </div>
                  )}
                </>
              )}
              {alertType === 'expense' && insights.budgetInsights && (
                <>
                  {insights.budgetInsights.likelyCause && (
                    <div>
                      <span className="font-medium text-gray-700">Likely Cause: </span>
                      <span className="text-gray-600">{insights.budgetInsights.likelyCause}</span>
                    </div>
                  )}
                  {insights.budgetInsights.futureImpact && (
                    <div>
                      <span className="font-medium text-gray-700">Future Impact: </span>
                      <span className="text-gray-600">{insights.budgetInsights.futureImpact}</span>
                    </div>
                  )}
                  {insights.budgetInsights.adjustmentRecommendation && (
                    <div>
                      <span className="font-medium text-gray-700">Recommendation: </span>
                      <span className="text-gray-600">{insights.budgetInsights.adjustmentRecommendation}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Follow-up suggestion */}
      {insights.suggestedFollowUp && (
        <div className="text-xs text-gray-500 italic border-t border-purple-100 pt-3">
          <strong>Next steps:</strong> {insights.suggestedFollowUp}
        </div>
      )}
    </div>
  )
}

export default AIInsightsPanel
