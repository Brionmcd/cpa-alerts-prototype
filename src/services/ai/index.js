/**
 * AI Service - Main Entry Point
 *
 * Provides all AI functionality with automatic fallback to mock responses
 * when no API key is available.
 */

import { hasApiKey, callClaudeJSON } from './claude'
import {
  ENRICHMENT_SYSTEM_PROMPT,
  ROUTING_SYSTEM_PROMPT,
  COMMAND_SYSTEM_PROMPT,
  DRAFT_EMAIL_SYSTEM_PROMPT,
  buildAREnrichmentPrompt,
  buildExpenseEnrichmentPrompt,
  buildRoutingPrompt,
  buildCommandPrompt,
  buildDraftEmailPrompt,
} from './prompts'
import {
  mockAREnrichment,
  mockExpenseEnrichment,
  mockRouting,
  mockCommandParse,
  mockDraftEmail,
} from './mockAI'
import {
  TEAM_MEMBERS,
  getTeamMemberById,
  getClientHistory,
  formatClientHistoryForPrompt,
} from './teamData'

/**
 * Check if live AI is available
 */
export const isAIAvailable = () => hasApiKey()

/**
 * Get enrichment insights for an AR alert
 */
export const enrichARAlert = async (alert) => {
  if (!hasApiKey()) {
    console.log('No API key - using mock AI for AR enrichment')
    return mockAREnrichment(alert)
  }

  try {
    const clientHistory = formatClientHistoryForPrompt(alert.clientName)
    const userMessage = buildAREnrichmentPrompt(alert, TEAM_MEMBERS, clientHistory)

    const result = await callClaudeJSON({
      systemPrompt: ENRICHMENT_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 1500,
    })

    return result
  } catch (error) {
    console.error('AI enrichment failed, falling back to mock:', error)
    return mockAREnrichment(alert)
  }
}

/**
 * Get enrichment insights for an expense alert
 */
export const enrichExpenseAlert = async (alert) => {
  if (!hasApiKey()) {
    console.log('No API key - using mock AI for expense enrichment')
    return mockExpenseEnrichment(alert)
  }

  try {
    const budgetHistory = `Previous month variance: 15% over. Year-to-date: 8% over budget.`
    const userMessage = buildExpenseEnrichmentPrompt(alert, TEAM_MEMBERS, budgetHistory)

    const result = await callClaudeJSON({
      systemPrompt: ENRICHMENT_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 1500,
    })

    return result
  } catch (error) {
    console.error('AI enrichment failed, falling back to mock:', error)
    return mockExpenseEnrichment(alert)
  }
}

/**
 * Get smart routing recommendation for an alert
 */
export const routeAlert = async (alert, alertType) => {
  if (!hasApiKey()) {
    console.log('No API key - using mock AI for routing')
    return mockRouting(alert, alertType, TEAM_MEMBERS)
  }

  try {
    const userMessage = buildRoutingPrompt(alert, alertType, TEAM_MEMBERS)

    const result = await callClaudeJSON({
      systemPrompt: ROUTING_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 800,
    })

    return result
  } catch (error) {
    console.error('AI routing failed, falling back to mock:', error)
    return mockRouting(alert, alertType, TEAM_MEMBERS)
  }
}

/**
 * Parse a natural language command
 */
export const parseCommand = async (command, currentAlert = null) => {
  if (!hasApiKey()) {
    console.log('No API key - using mock AI for command parsing')
    return mockCommandParse(command, currentAlert, TEAM_MEMBERS)
  }

  try {
    const userMessage = buildCommandPrompt(command, currentAlert, TEAM_MEMBERS)

    const result = await callClaudeJSON({
      systemPrompt: COMMAND_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 500,
    })

    return result
  } catch (error) {
    console.error('AI command parsing failed, falling back to mock:', error)
    return mockCommandParse(command, currentAlert, TEAM_MEMBERS)
  }
}

/**
 * Generate an email or message draft
 */
export const generateDraft = async (alert, alertType, tone = 'friendly', senderName = 'Your CPA Team') => {
  if (!hasApiKey()) {
    console.log('No API key - using mock AI for draft generation')
    return mockDraftEmail(alert, alertType, tone, senderName)
  }

  try {
    const userMessage = buildDraftEmailPrompt(alert, alertType, tone, senderName)

    const result = await callClaudeJSON({
      systemPrompt: DRAFT_EMAIL_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 1000,
    })

    return result
  } catch (error) {
    console.error('AI draft generation failed, falling back to mock:', error)
    return mockDraftEmail(alert, alertType, tone, senderName)
  }
}

/**
 * Get client history summary
 */
export const getClientHistorySummary = (clientName) => {
  const history = getClientHistory(clientName)
  if (!history) return null

  return {
    relationshipStart: history.relationshipStart,
    totalBillings: history.totalBillings,
    averagePaymentDays: history.averagePaymentDays,
    lastPayment: history.lastPayment,
    lastPaymentAmount: history.lastPaymentAmount,
    recentPayments: history.paymentHistory.slice(0, 5),
    notes: history.notes,
    preferredContact: history.preferredContact,
    escalationContact: history.escalationContact,
  }
}

// Export team data for UI
export { TEAM_MEMBERS, getTeamMemberById }

export default {
  isAIAvailable,
  enrichARAlert,
  enrichExpenseAlert,
  routeAlert,
  parseCommand,
  generateDraft,
  getClientHistorySummary,
  TEAM_MEMBERS,
  getTeamMemberById,
}
