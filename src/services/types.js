/**
 * Data type definitions for CPA Alerts
 * These define the "contract" between UI and data providers
 */

/**
 * @typedef {'critical' | 'warning' | 'info'} Severity
 */

/**
 * @typedef {'normal' | 'slow_payer' | 'payment_arrangement' | 'sensitive' | 'disputed'} ClientStatus
 */

/**
 * @typedef {'pending' | 'approved' | 'sent' | 'cancelled'} ReminderStatus
 */

/**
 * @typedef {'friendly' | 'professional' | 'firm'} ReminderTone
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} number
 * @property {string} date - ISO date string
 * @property {string} dueDate - ISO date string
 * @property {number} amount
 * @property {string} description
 * @property {string} aiywynPaymentUrl - Aiwyn payment portal link
 */

/**
 * @typedef {Object} Contact
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} role - e.g., 'Owner', 'CFO', 'Controller', 'AP Contact'
 * @property {boolean} isPrimary - Primary contact for AR
 */

/**
 * @typedef {Object} ClientContacts
 * @property {Contact} primary - Usually AP contact or main billing contact
 * @property {Contact|null} escalation - CFO/Controller for escalations
 * @property {Contact|null} owner - Owner/Partner for sensitive situations
 */

/**
 * @typedef {Object} ScheduledReminder
 * @property {string} id
 * @property {string} alertId
 * @property {string} clientId
 * @property {ReminderStatus} status
 * @property {string} scheduledDate - ISO date string
 * @property {number} triggerDays - Days overdue that triggered this (60, 90, 120)
 * @property {ReminderTone} tone
 * @property {string} recipientEmail
 * @property {string} recipientName
 * @property {boolean} ccEscalation - Whether to CC CFO/Controller
 * @property {boolean} requiresApproval - Partner must approve before sending
 * @property {string|null} approvedBy - Partner who approved
 * @property {string|null} approvedAt - ISO date string
 * @property {string|null} sentAt - ISO date string
 * @property {string} subject
 * @property {string} body
 */

/**
 * @typedef {Object} ARAlert
 * @property {string} id
 * @property {string} clientId
 * @property {string} clientName
 * @property {Severity} severity
 * @property {number} overdueAmount
 * @property {number} daysOverdue
 * @property {number} agingBucket - 0=current, 30, 60, 90, 120
 * @property {ClientStatus} clientStatus
 * @property {ClientContacts} contacts
 * @property {Contact} contact - Legacy: primary contact for backward compat
 * @property {Invoice[]} invoices
 * @property {string} notes
 * @property {string} createdAt - ISO date string
 * @property {string|null} handledAt - ISO date string or null
 * @property {string|null} snoozedUntil - ISO date string or null
 * @property {string|null} dismissedAt - ISO date string or null
 * @property {string|null} dismissReason
 * @property {ScheduledReminder[]} scheduledReminders
 * @property {ScheduledReminder[]} sentReminders
 * @property {string} partnerName - Responsible partner
 * @property {string} aiywynClientUrl - Aiwyn client portal link
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

// Client status categories that control automation behavior
export const CLIENT_STATUS = {
  NORMAL: 'normal', // Automation runs normally
  SLOW_PAYER: 'slow_payer', // Extended timeline before escalation
  PAYMENT_ARRANGEMENT: 'payment_arrangement', // Manual handling, no automation
  SENSITIVE: 'sensitive', // Partner approval required for all comms
  DISPUTED: 'disputed', // Hold all automation
}

export const CLIENT_STATUS_LABELS = {
  normal: 'Normal',
  slow_payer: 'Slow Payer',
  payment_arrangement: 'Payment Arrangement',
  sensitive: 'Sensitive Relationship',
  disputed: 'Disputed',
}

export const CLIENT_STATUS_COLORS = {
  normal: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  slow_payer: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  payment_arrangement: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  sensitive: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  disputed: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
}

// Reminder status
export const REMINDER_STATUS = {
  PENDING: 'pending', // Scheduled but not sent
  AWAITING_APPROVAL: 'awaiting_approval', // Needs partner approval
  APPROVED: 'approved', // Partner approved, ready to send
  SENT: 'sent', // Successfully sent
  CANCELLED: 'cancelled', // Cancelled by partner
}

// Reminder tone options
export const REMINDER_TONES = {
  FRIENDLY: 'friendly',
  PROFESSIONAL: 'professional',
  FIRM: 'firm',
}

export const REMINDER_TONE_LABELS = {
  friendly: 'Friendly Reminder',
  professional: 'Professional Follow-up',
  firm: 'Firm but Polite',
}

export const REMINDER_TONE_DESCRIPTIONS = {
  friendly: 'Warm, relationship-focused language. Good for long-term clients.',
  professional: 'Standard business tone. Appropriate for most situations.',
  firm: 'Direct with urgency. For significantly overdue accounts.',
}

// AR Aging buckets
export const AGING_BUCKETS = {
  CURRENT: 0,
  THIRTY: 30,
  SIXTY: 60,
  NINETY: 90,
  ONE_TWENTY_PLUS: 120,
}

export const AGING_BUCKET_LABELS = {
  0: 'Current',
  30: '1-30 Days',
  60: '31-60 Days',
  90: '61-90 Days',
  120: '90+ Days',
}

// Reminder trigger points (days overdue)
export const REMINDER_TRIGGERS = {
  INITIAL: 60, // First smart reminder
  ESCALATION: 90, // CC CFO
  PARTNER_ALERT: 120, // Direct partner intervention
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

// Email template options
export const EMAIL_FROM_OPTIONS = [
  { id: 'partner', label: 'From Partner', description: 'Sent from partner\'s email' },
  { id: 'billing', label: 'Billing Committee', description: 'From billing@firm.com with "per firm policy" language' },
]
