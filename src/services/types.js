/**
 * Data type definitions for CPA Alerts
 * These define the "contract" between UI and data providers
 */

/**
 * @typedef {'critical' | 'warning' | 'info'} Severity
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} number
 * @property {string} date - ISO date string
 * @property {string} dueDate - ISO date string
 * @property {number} amount
 * @property {string} description
 */

/**
 * @typedef {Object} Contact
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 */

/**
 * @typedef {Object} ARAlert
 * @property {string} id
 * @property {string} clientId
 * @property {string} clientName
 * @property {Severity} severity
 * @property {number} overdueAmount
 * @property {number} daysOverdue
 * @property {Contact} contact
 * @property {Invoice[]} invoices
 * @property {string} notes
 * @property {string} createdAt - ISO date string
 * @property {string|null} handledAt - ISO date string or null
 * @property {string|null} snoozedUntil - ISO date string or null
 * @property {string|null} dismissedAt - ISO date string or null
 * @property {string|null} dismissReason
 */

/**
 * @typedef {Object} ExpenseDriver
 * @property {string} name
 * @property {number} amount
 * @property {string} note
 * @property {string} vendor
 */

/**
 * @typedef {Object} ExpenseAlert
 * @property {string} id
 * @property {string} category
 * @property {string} categoryId
 * @property {Severity} severity
 * @property {number} budgetAmount
 * @property {number} actualAmount
 * @property {number} variancePercent
 * @property {string} period - e.g., "January 2025"
 * @property {ExpenseDriver[]} drivers
 * @property {string} notes
 * @property {string} createdAt - ISO date string
 * @property {string|null} handledAt - ISO date string or null
 * @property {string|null} snoozedUntil - ISO date string or null
 * @property {string|null} dismissedAt - ISO date string or null
 * @property {string|null} dismissReason
 */

/**
 * @typedef {Object} AlertRule
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {'ar' | 'expense'} alertType
 * @property {Severity} severity
 * @property {Object} conditions
 * @property {boolean} enabled
 * @property {string} createdAt - ISO date string
 */

/**
 * @typedef {Object} AlertAction
 * @property {string} alertId
 * @property {'ar' | 'expense'} alertType
 * @property {'handled' | 'snoozed' | 'dismissed'} action
 * @property {string|null} note
 * @property {number|null} snoozeDays
 * @property {string|null} dismissReason
 * @property {string} timestamp - ISO date string
 */

// Status constants
export const SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
}

export const ALERT_STATUS = {
  ACTIVE: 'active',
  HANDLED: 'handled',
  SNOOZED: 'snoozed',
  DISMISSED: 'dismissed',
}

export const DISMISS_REASONS = [
  'Payment received',
  'Payment plan established',
  'Dispute resolved',
  'Budget adjustment approved',
  'False positive',
  'Client relationship ended',
  'Other',
]

export const SNOOZE_OPTIONS = [
  { days: 1, label: '1 day' },
  { days: 3, label: '3 days' },
  { days: 7, label: '1 week' },
  { days: 14, label: '2 weeks' },
  { days: 30, label: '1 month' },
]
