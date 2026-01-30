/**
 * Mock Data Provider
 *
 * Implements the data provider interface with realistic mock data.
 * Includes simulated network delays and localStorage persistence.
 *
 * Updated to reflect real AR workflow:
 * - $7M+ in 90+ day aging to illustrate the problem
 * - Client status categories for automation control
 * - Scheduled reminders with approval workflow
 */

import { storage, STORAGE_KEYS } from '../../../utils/storage'
import { getCurrentPeriod } from '../../../utils/formatters'
import { SEVERITY, CLIENT_STATUS, REMINDER_STATUS } from '../../types'
import {
  CLIENTS,
  PARTNERS,
  EXPENSE_CATEGORIES,
  relativeDateISO,
  getSeverityFromDays,
  getSeverityFromVariance,
  generateInvoices,
  generateARNotes,
  generateExpenseDrivers,
  generateExpenseNotes,
  getAgingBucket,
  generateAiywynUrl,
  generateScheduledReminders,
  generateSentReminders,
} from './generators'

// Simulated network delay (200-500ms)
const simulateDelay = () => new Promise(resolve =>
  setTimeout(resolve, 200 + Math.random() * 300)
)

/**
 * Generate AR alerts data
 * Uses relative dates so data never goes stale
 *
 * Distribution designed to show the $7M problem:
 * - Significant amounts in 90+ day bucket
 * - Mix of client statuses showing different automation behaviors
 */
const generateARAlerts = () => {
  // Realistic distribution showing $7M+ in 90+ days
  // Total AR: ~$9.5M, with $7M+ over 90 days
  const alertConfigs = [
    // 120+ days - Critical (large amounts showing the problem)
    { clientIndex: 0, daysOverdue: 145, amount: 847250 },    // Henderson - normal, big client
    { clientIndex: 6, daysOverdue: 138, amount: 1250000 },   // Metro Construction - normal
    { clientIndex: 8, daysOverdue: 132, amount: 680000 },    // Coastal Hospitality - normal
    { clientIndex: 9, daysOverdue: 128, amount: 425000 },    // Premier Auto - slow payer
    { clientIndex: 11, daysOverdue: 122, amount: 312000 },   // Heritage Properties - sensitive

    // 90-120 days - Critical
    { clientIndex: 1, daysOverdue: 112, amount: 1890000 },   // Westbrook Mfg - slow payer
    { clientIndex: 2, daysOverdue: 98, amount: 567000 },     // Pinnacle RE - normal
    { clientIndex: 10, daysOverdue: 94, amount: 389000 },    // Valley Tech - normal
    { clientIndex: 7, daysOverdue: 91, amount: 156000 },     // Sunrise Medical - disputed

    // 60-90 days - Warning
    { clientIndex: 3, daysOverdue: 78, amount: 124500 },     // Chen Dental - sensitive
    { clientIndex: 5, daysOverdue: 72, amount: 287000 },     // Thompson Legal - normal
    { clientIndex: 4, daysOverdue: 65, amount: 98500 },      // Oakwood - payment arrangement

    // 30-60 days - Info/Warning
    { clientIndex: 0, daysOverdue: 45, amount: 78900 },      // Henderson (second alert)
    { clientIndex: 6, daysOverdue: 38, amount: 156000 },     // Metro Construction (second)

    // Under 30 days - Info (recent, no action needed)
    { clientIndex: 2, daysOverdue: 22, amount: 45600 },      // Pinnacle (second)
    { clientIndex: 5, daysOverdue: 14, amount: 32500 },      // Thompson (second)
  ]

  return alertConfigs.map((config, index) => {
    const client = CLIENTS[config.clientIndex]
    const partner = PARTNERS[client.partnerIndex]
    const severity = getSeverityFromDays(config.daysOverdue)
    const invoices = generateInvoices(config.clientIndex, config.daysOverdue, config.amount)
    const agingBucket = getAgingBucket(config.daysOverdue)

    // Add Aiwyn URLs to invoices
    const invoicesWithUrls = invoices.map(inv => ({
      ...inv,
      aiywynPaymentUrl: generateAiywynUrl(client.id, inv.id),
    }))

    // Get primary contact (for backward compatibility)
    const primaryContact = client.contacts.primary

    // Generate reminders based on status and aging
    const scheduledReminders = generateScheduledReminders(
      `ar-${index + 1}`,
      client.id,
      client.status,
      config.daysOverdue,
      primaryContact,
      client.contacts.escalation
    )

    const sentReminders = generateSentReminders(
      `ar-${index + 1}`,
      client.id,
      config.daysOverdue,
      primaryContact
    )

    return {
      id: `ar-${index + 1}`,
      clientId: client.id,
      clientName: client.name,
      severity,
      overdueAmount: config.amount,
      daysOverdue: config.daysOverdue,
      agingBucket,
      clientStatus: client.status,
      contacts: client.contacts,
      // Legacy contact field for backward compatibility
      contact: {
        name: primaryContact.name,
        email: primaryContact.email,
        phone: primaryContact.phone,
      },
      invoices: invoicesWithUrls,
      notes: generateARNotes(severity, config.daysOverdue, client.status),
      createdAt: relativeDateISO(config.daysOverdue),
      handledAt: null,
      snoozedUntil: null,
      dismissedAt: null,
      dismissReason: null,
      scheduledReminders,
      sentReminders,
      partnerName: partner.name,
      aiywynClientUrl: generateAiywynUrl(client.id, null),
    }
  })
}

/**
 * Generate expense alerts data
 */
const generateExpenseAlerts = () => {
  const alertConfigs = [
    { categoryIndex: 0, variancePercent: 70 },
    { categoryIndex: 1, variancePercent: 40 },
    { categoryIndex: 2, variancePercent: 45 },
  ]

  return alertConfigs.map((config, index) => {
    const category = EXPENSE_CATEGORIES[config.categoryIndex]
    const severity = getSeverityFromVariance(config.variancePercent)
    const actualAmount = Math.round(category.budgetAmount * (1 + config.variancePercent / 100))
    const varianceAmount = actualAmount - category.budgetAmount

    return {
      id: `exp-${index + 1}`,
      categoryId: category.id,
      category: category.name,
      severity,
      budgetAmount: category.budgetAmount,
      actualAmount,
      variancePercent: config.variancePercent,
      period: getCurrentPeriod(),
      drivers: generateExpenseDrivers(category.id, varianceAmount),
      notes: generateExpenseNotes(category.id, config.variancePercent),
      createdAt: relativeDateISO(Math.floor(Math.random() * 7)),
      handledAt: null,
      snoozedUntil: null,
      dismissedAt: null,
      dismissReason: null,
    }
  })
}

/**
 * Default alert rules
 */
const DEFAULT_RULES = [
  {
    id: 'rule-1',
    name: 'Critical AR Alert',
    description: 'Invoice overdue by more than 60 days',
    alertType: 'ar',
    severity: SEVERITY.CRITICAL,
    conditions: { field: 'daysOverdue', operator: 'greaterThan', value: 60 },
    enabled: true,
    createdAt: relativeDateISO(90),
  },
  {
    id: 'rule-2',
    name: 'Warning AR Alert',
    description: 'Invoice overdue by more than 30 days',
    alertType: 'ar',
    severity: SEVERITY.WARNING,
    conditions: { field: 'daysOverdue', operator: 'greaterThan', value: 30 },
    enabled: true,
    createdAt: relativeDateISO(90),
  },
  {
    id: 'rule-3',
    name: 'Info AR Alert',
    description: 'Invoice overdue by more than 14 days',
    alertType: 'ar',
    severity: SEVERITY.INFO,
    conditions: { field: 'daysOverdue', operator: 'greaterThan', value: 14 },
    enabled: true,
    createdAt: relativeDateISO(90),
  },
  {
    id: 'rule-4',
    name: 'Critical Expense Alert',
    description: 'Category budget exceeded by more than 50%',
    alertType: 'expense',
    severity: SEVERITY.CRITICAL,
    conditions: { field: 'variancePercent', operator: 'greaterThan', value: 50 },
    enabled: true,
    createdAt: relativeDateISO(90),
  },
  {
    id: 'rule-5',
    name: 'Warning Expense Alert',
    description: 'Category budget exceeded by more than 25%',
    alertType: 'expense',
    severity: SEVERITY.WARNING,
    conditions: { field: 'variancePercent', operator: 'greaterThan', value: 25 },
    enabled: true,
    createdAt: relativeDateISO(90),
  },
  {
    id: 'rule-6',
    name: 'Large Invoice Reminder',
    description: 'Invoices over $10,000 unpaid after 7 days',
    alertType: 'ar',
    severity: SEVERITY.INFO,
    conditions: { field: 'amount', operator: 'greaterThan', value: 10000 },
    enabled: false,
    createdAt: relativeDateISO(60),
  },
]

/**
 * Apply stored actions to alerts (handled, snoozed, dismissed)
 */
const applyStoredActions = (alerts, alertType) => {
  const actions = storage.get(STORAGE_KEYS.ALERT_ACTIONS, [])
  const now = new Date()

  return alerts.map(alert => {
    const alertActions = actions.filter(
      a => a.alertId === alert.id && a.alertType === alertType
    )

    if (alertActions.length === 0) return alert

    // Get the most recent action
    const latestAction = alertActions.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )[0]

    switch (latestAction.action) {
      case 'handled':
        return { ...alert, handledAt: latestAction.timestamp }
      case 'dismissed':
        return {
          ...alert,
          dismissedAt: latestAction.timestamp,
          dismissReason: latestAction.dismissReason,
        }
      case 'snoozed': {
        const snoozeEnd = new Date(latestAction.timestamp)
        snoozeEnd.setDate(snoozeEnd.getDate() + latestAction.snoozeDays)

        // If snooze has expired, alert is active again
        if (snoozeEnd <= now) {
          return alert
        }
        return { ...alert, snoozedUntil: snoozeEnd.toISOString() }
      }
      default:
        return alert
    }
  })
}

/**
 * Filter out handled/dismissed alerts, but include snoozed for visibility
 */
const filterActiveAlerts = (alerts) => {
  return alerts.filter(alert => !alert.handledAt && !alert.dismissedAt)
}

/**
 * Mock Data Provider Implementation
 */
export const mockProvider = {
  // ============ AR Alerts ============

  async getARAlerts() {
    await simulateDelay()
    let alerts = generateARAlerts()
    alerts = applyStoredActions(alerts, 'ar')
    return filterActiveAlerts(alerts)
  },

  async getARAlertDetail(id) {
    await simulateDelay()
    let alerts = generateARAlerts()
    alerts = applyStoredActions(alerts, 'ar')
    return alerts.find(a => a.id === id) || null
  },

  // ============ Expense Alerts ============

  async getExpenseAlerts() {
    await simulateDelay()
    let alerts = generateExpenseAlerts()
    alerts = applyStoredActions(alerts, 'expense')
    return filterActiveAlerts(alerts)
  },

  async getExpenseAlertDetail(id) {
    await simulateDelay()
    let alerts = generateExpenseAlerts()
    alerts = applyStoredActions(alerts, 'expense')
    return alerts.find(a => a.id === id) || null
  },

  // ============ Alert Actions ============

  async markAlertHandled(id, alertType, note = null) {
    await simulateDelay()
    const actions = storage.get(STORAGE_KEYS.ALERT_ACTIONS, [])
    actions.push({
      alertId: id,
      alertType,
      action: 'handled',
      note,
      snoozeDays: null,
      dismissReason: null,
      timestamp: new Date().toISOString(),
    })
    storage.set(STORAGE_KEYS.ALERT_ACTIONS, actions)
    return { success: true }
  },

  async snoozeAlert(id, alertType, days) {
    await simulateDelay()
    const actions = storage.get(STORAGE_KEYS.ALERT_ACTIONS, [])
    actions.push({
      alertId: id,
      alertType,
      action: 'snoozed',
      note: null,
      snoozeDays: days,
      dismissReason: null,
      timestamp: new Date().toISOString(),
    })
    storage.set(STORAGE_KEYS.ALERT_ACTIONS, actions)
    return { success: true }
  },

  async dismissAlert(id, alertType, reason) {
    await simulateDelay()
    const actions = storage.get(STORAGE_KEYS.ALERT_ACTIONS, [])
    actions.push({
      alertId: id,
      alertType,
      action: 'dismissed',
      note: null,
      snoozeDays: null,
      dismissReason: reason,
      timestamp: new Date().toISOString(),
    })
    storage.set(STORAGE_KEYS.ALERT_ACTIONS, actions)
    return { success: true }
  },

  // ============ Alert Rules ============

  async getAlertRules() {
    await simulateDelay()

    // Get custom rules from storage
    const customRules = storage.get(STORAGE_KEYS.CUSTOM_RULES, [])

    // Get rule toggle states from storage
    const toggles = storage.get(STORAGE_KEYS.RULE_TOGGLES, {})

    // Merge default rules with stored toggle states
    const rules = [...DEFAULT_RULES, ...customRules].map(rule => ({
      ...rule,
      enabled: toggles[rule.id] !== undefined ? toggles[rule.id] : rule.enabled,
    }))

    return rules
  },

  async updateAlertRule(id, changes) {
    await simulateDelay()

    // If toggling enabled state, store it
    if ('enabled' in changes) {
      const toggles = storage.get(STORAGE_KEYS.RULE_TOGGLES, {})
      toggles[id] = changes.enabled
      storage.set(STORAGE_KEYS.RULE_TOGGLES, toggles)
    }

    // If updating a custom rule, update in storage
    const customRules = storage.get(STORAGE_KEYS.CUSTOM_RULES, [])
    const ruleIndex = customRules.findIndex(r => r.id === id)
    if (ruleIndex >= 0) {
      customRules[ruleIndex] = { ...customRules[ruleIndex], ...changes }
      storage.set(STORAGE_KEYS.CUSTOM_RULES, customRules)
    }

    return { success: true }
  },

  async createAlertRule(rule) {
    await simulateDelay()

    const newRule = {
      ...rule,
      id: `rule-custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      enabled: true,
    }

    const customRules = storage.get(STORAGE_KEYS.CUSTOM_RULES, [])
    customRules.push(newRule)
    storage.set(STORAGE_KEYS.CUSTOM_RULES, customRules)

    return newRule
  },

  async deleteAlertRule(id) {
    await simulateDelay()

    // Only custom rules can be deleted
    const customRules = storage.get(STORAGE_KEYS.CUSTOM_RULES, [])
    const filtered = customRules.filter(r => r.id !== id)
    storage.set(STORAGE_KEYS.CUSTOM_RULES, filtered)

    return { success: true }
  },

  // ============ Reminder Management ============

  async approveReminder(reminderId, partnerName) {
    await simulateDelay()
    const approvals = storage.get(STORAGE_KEYS.REMINDER_APPROVALS, {})
    approvals[reminderId] = {
      approvedBy: partnerName,
      approvedAt: new Date().toISOString(),
    }
    storage.set(STORAGE_KEYS.REMINDER_APPROVALS, approvals)
    return { success: true }
  },

  async cancelReminder(reminderId) {
    await simulateDelay()
    const cancellations = storage.get(STORAGE_KEYS.REMINDER_CANCELLATIONS, [])
    cancellations.push(reminderId)
    storage.set(STORAGE_KEYS.REMINDER_CANCELLATIONS, cancellations)
    return { success: true }
  },

  async sendReminder(reminderId) {
    await simulateDelay()
    const sent = storage.get(STORAGE_KEYS.SENT_REMINDERS, {})
    sent[reminderId] = {
      sentAt: new Date().toISOString(),
    }
    storage.set(STORAGE_KEYS.SENT_REMINDERS, sent)
    return { success: true }
  },

  async updateClientStatus(clientId, newStatus) {
    await simulateDelay()
    const statuses = storage.get(STORAGE_KEYS.CLIENT_STATUSES, {})
    statuses[clientId] = newStatus
    storage.set(STORAGE_KEYS.CLIENT_STATUSES, statuses)
    return { success: true }
  },

  async getClientStatuses() {
    await simulateDelay()
    return storage.get(STORAGE_KEYS.CLIENT_STATUSES, {})
  },

  async getPendingApprovals() {
    await simulateDelay()
    const alerts = generateARAlerts()
    const approvals = storage.get(STORAGE_KEYS.REMINDER_APPROVALS, {})
    const cancellations = storage.get(STORAGE_KEYS.REMINDER_CANCELLATIONS, [])
    const sent = storage.get(STORAGE_KEYS.SENT_REMINDERS, {})

    // Collect all reminders needing approval
    const pending = []
    alerts.forEach(alert => {
      alert.scheduledReminders.forEach(reminder => {
        if (reminder.requiresApproval &&
            !approvals[reminder.id] &&
            !cancellations.includes(reminder.id) &&
            !sent[reminder.id]) {
          pending.push({
            ...reminder,
            clientName: alert.clientName,
            overdueAmount: alert.overdueAmount,
            daysOverdue: alert.daysOverdue,
            clientStatus: alert.clientStatus,
            partnerName: alert.partnerName,
          })
        }
      })
    })

    return pending
  },

  async getARAgingSummary() {
    await simulateDelay()
    let alerts = generateARAlerts()
    alerts = applyStoredActions(alerts, 'ar')
    alerts = filterActiveAlerts(alerts)

    const summary = {
      current: { count: 0, amount: 0 },
      thirty: { count: 0, amount: 0 },
      sixty: { count: 0, amount: 0 },
      ninety: { count: 0, amount: 0 },
      oneTwentyPlus: { count: 0, amount: 0 },
      total: { count: 0, amount: 0 },
    }

    alerts.forEach(alert => {
      summary.total.count++
      summary.total.amount += alert.overdueAmount

      if (alert.agingBucket === 0) {
        summary.current.count++
        summary.current.amount += alert.overdueAmount
      } else if (alert.agingBucket === 30) {
        summary.thirty.count++
        summary.thirty.amount += alert.overdueAmount
      } else if (alert.agingBucket === 60) {
        summary.sixty.count++
        summary.sixty.amount += alert.overdueAmount
      } else if (alert.agingBucket === 90) {
        summary.ninety.count++
        summary.ninety.amount += alert.overdueAmount
      } else {
        summary.oneTwentyPlus.count++
        summary.oneTwentyPlus.amount += alert.overdueAmount
      }
    })

    // Calculate 90+ total for the $7M highlight
    summary.ninetyPlus = {
      count: summary.ninety.count + summary.oneTwentyPlus.count,
      amount: summary.ninety.amount + summary.oneTwentyPlus.amount,
    }

    return summary
  },

  // ============ Utility ============

  async resetAllData() {
    storage.clear()
    return { success: true }
  },
}

export default mockProvider
