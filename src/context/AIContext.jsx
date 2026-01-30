import { createContext, useContext, useState, useCallback } from 'react'
import { isAIAvailable } from '../services/ai'

/**
 * AI Context
 *
 * Provides global AI state including:
 * - Whether AI is enabled/available
 * - Activity log of AI decisions
 * - Sent messages history
 */

const AIContext = createContext(null)

export function AIProvider({ children }) {
  // Track if AI features are enabled (user can toggle off even if API key exists)
  const [aiEnabled, setAiEnabled] = useState(true)

  // Activity log - stores all AI decisions and actions
  const [activityLog, setActivityLog] = useState([])

  // Sent messages - stores emails/messages that were "sent"
  const [sentMessages, setSentMessages] = useState([])

  // Cache for AI enrichments to avoid redundant API calls
  const [enrichmentCache, setEnrichmentCache] = useState({})

  /**
   * Check if AI is actually available and enabled
   */
  const isAIReady = useCallback(() => {
    return aiEnabled && isAIAvailable()
  }, [aiEnabled])

  /**
   * Log an AI activity
   */
  const logActivity = useCallback((activity) => {
    const entry = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...activity,
    }
    setActivityLog(prev => [entry, ...prev].slice(0, 100)) // Keep last 100 entries
    return entry
  }, [])

  /**
   * Log an enrichment activity
   */
  const logEnrichment = useCallback((alertId, alertType, alertName, enrichment) => {
    return logActivity({
      type: 'enrichment',
      alertId,
      alertType,
      alertName,
      summary: enrichment.summary,
      recommendedAction: enrichment.recommendedAction?.description,
      riskLevel: enrichment.riskLevel,
    })
  }, [logActivity])

  /**
   * Log a routing activity
   */
  const logRouting = useCallback((alertId, alertType, alertName, routing) => {
    return logActivity({
      type: 'routing',
      alertId,
      alertType,
      alertName,
      assignedTo: routing.assignedTo?.name,
      reasoning: routing.reasoning,
      confidence: routing.confidence,
    })
  }, [logActivity])

  /**
   * Log a command activity
   */
  const logCommand = useCallback((command, parsedResult, alertName = null) => {
    return logActivity({
      type: 'command',
      command,
      action: parsedResult.action,
      parsedIntent: parsedResult.parsedIntent,
      alertName,
    })
  }, [logActivity])

  /**
   * Log a sent message
   */
  const logSentMessage = useCallback((alertId, alertType, alertName, message) => {
    const entry = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      alertId,
      alertType,
      alertName,
      ...message,
    }
    setSentMessages(prev => [entry, ...prev].slice(0, 50)) // Keep last 50 messages

    // Also log as activity
    logActivity({
      type: 'message_sent',
      alertId,
      alertType,
      alertName,
      to: message.toName,
      subject: message.subject,
      summary: message.summary,
    })

    return entry
  }, [logActivity])

  /**
   * Get cached enrichment for an alert
   */
  const getCachedEnrichment = useCallback((alertId) => {
    return enrichmentCache[alertId] || null
  }, [enrichmentCache])

  /**
   * Cache an enrichment result
   */
  const cacheEnrichment = useCallback((alertId, enrichment) => {
    setEnrichmentCache(prev => ({
      ...prev,
      [alertId]: {
        data: enrichment,
        timestamp: Date.now(),
      }
    }))
  }, [])

  /**
   * Clear enrichment cache for an alert (e.g., after action taken)
   */
  const clearEnrichmentCache = useCallback((alertId) => {
    setEnrichmentCache(prev => {
      const next = { ...prev }
      delete next[alertId]
      return next
    })
  }, [])

  /**
   * Get a sent message by ID
   */
  const getSentMessage = useCallback((messageId) => {
    return sentMessages.find(m => m.id === messageId) || null
  }, [sentMessages])

  /**
   * Clear all activity (for demo reset)
   */
  const clearAllActivity = useCallback(() => {
    setActivityLog([])
    setSentMessages([])
    setEnrichmentCache({})
  }, [])

  const value = {
    // State
    aiEnabled,
    setAiEnabled,
    activityLog,
    sentMessages,

    // Checks
    isAIReady,
    hasApiKey: isAIAvailable,

    // Logging
    logActivity,
    logEnrichment,
    logRouting,
    logCommand,
    logSentMessage,

    // Cache
    getCachedEnrichment,
    cacheEnrichment,
    clearEnrichmentCache,

    // Retrieval
    getSentMessage,

    // Reset
    clearAllActivity,
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

export default AIContext
