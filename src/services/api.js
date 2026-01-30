/**
 * API Service Layer
 *
 * This is the main entry point for all data operations.
 * It abstracts the underlying data provider (mock, QuickBooks, etc.)
 * so the UI doesn't need to know where data comes from.
 *
 * To switch providers, just change the import below.
 */

import mockProvider from './providers/mock'

// Current active provider
// In the future, this could be dynamically selected based on user settings
const provider = mockProvider

/**
 * AR Alerts API
 */
export const arAlertsApi = {
  /**
   * Get all active AR alerts
   * @returns {Promise<ARAlert[]>}
   */
  getAll: () => provider.getARAlerts(),

  /**
   * Get a single AR alert by ID
   * @param {string} id
   * @returns {Promise<ARAlert|null>}
   */
  getById: (id) => provider.getARAlertDetail(id),

  /**
   * Mark an AR alert as handled
   * @param {string} id
   * @param {string|null} note - Optional note
   */
  markHandled: (id, note = null) => provider.markAlertHandled(id, 'ar', note),

  /**
   * Snooze an AR alert
   * @param {string} id
   * @param {number} days - Number of days to snooze
   */
  snooze: (id, days) => provider.snoozeAlert(id, 'ar', days),

  /**
   * Dismiss an AR alert
   * @param {string} id
   * @param {string} reason - Reason for dismissal
   */
  dismiss: (id, reason) => provider.dismissAlert(id, 'ar', reason),
}

/**
 * Expense Alerts API
 */
export const expenseAlertsApi = {
  /**
   * Get all active expense alerts
   * @returns {Promise<ExpenseAlert[]>}
   */
  getAll: () => provider.getExpenseAlerts(),

  /**
   * Get a single expense alert by ID
   * @param {string} id
   * @returns {Promise<ExpenseAlert|null>}
   */
  getById: (id) => provider.getExpenseAlertDetail(id),

  /**
   * Mark an expense alert as handled
   * @param {string} id
   * @param {string|null} note - Optional note
   */
  markHandled: (id, note = null) => provider.markAlertHandled(id, 'expense', note),

  /**
   * Snooze an expense alert
   * @param {string} id
   * @param {number} days - Number of days to snooze
   */
  snooze: (id, days) => provider.snoozeAlert(id, 'expense', days),

  /**
   * Dismiss an expense alert
   * @param {string} id
   * @param {string} reason - Reason for dismissal
   */
  dismiss: (id, reason) => provider.dismissAlert(id, 'expense', reason),
}

/**
 * Alert Rules API
 */
export const alertRulesApi = {
  /**
   * Get all alert rules
   * @returns {Promise<AlertRule[]>}
   */
  getAll: () => provider.getAlertRules(),

  /**
   * Update an alert rule
   * @param {string} id
   * @param {Partial<AlertRule>} changes
   */
  update: (id, changes) => provider.updateAlertRule(id, changes),

  /**
   * Create a new alert rule
   * @param {Omit<AlertRule, 'id' | 'createdAt'>} rule
   * @returns {Promise<AlertRule>}
   */
  create: (rule) => provider.createAlertRule(rule),

  /**
   * Delete an alert rule (custom rules only)
   * @param {string} id
   */
  delete: (id) => provider.deleteAlertRule(id),

  /**
   * Toggle a rule's enabled state
   * @param {string} id
   * @param {boolean} enabled
   */
  toggle: (id, enabled) => provider.updateAlertRule(id, { enabled }),
}

/**
 * Utility API
 */
export const utilityApi = {
  /**
   * Reset all data (for demo purposes)
   */
  resetAll: () => provider.resetAllData(),
}

// Export everything as a single object too
export default {
  arAlerts: arAlertsApi,
  expenseAlerts: expenseAlertsApi,
  alertRules: alertRulesApi,
  utility: utilityApi,
}
