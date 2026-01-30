/**
 * Mock Data Provider
 *
 * Implements the data provider interface with realistic mock data.
 * Includes simulated network delays and localStorage persistence.
 */

import { storage, STORAGE_KEYS } from '../../../utils/storage'
import { getCurrentPeriod } from '../../../utils/formatters'
import { SEVERITY } from '../../types'
import {
  CLIENTS,
  EXPENSE_CATEGORIES,
  relativeDateISO,
  getSeverityFromDays,
  getSeverityFromVariance,
  generateInvoices,
  generateARNotes,
  generateExpenseDrivers,
  generateExpenseNotes,
} from './generators'

// Simulated network delay (200-500ms)
const simulateDelay = () => new Promise(resolve =>
  setTimeout(resolve, 200 + Math.random() * 300)
)

/**
 * Generate AR alerts data
 * Uses relative dates so data never goes stale
 */
const generateARAlerts = () => {
  const alertConfigs = [
    { clientIndex: 0, daysOverdue: 94, amount: 47250 },
    { clientIndex: 1, daysOverdue: 67, amount: 38900 },
    { clientIndex: 2, daysOverdue: 45, amount: 24800 },
    { clientIndex: 3, daysOverdue: 38, amount: 12650 },
    { clientIndex: 4, daysOverdue: 21, amount: 8200 },
    { clientIndex: 5, daysOverdue: 14, amount: 5200 },
  ]

  return alertConfigs.map((config, index) => {
    const client = CLIENTS[config.clientIndex]
    const severity = getSeverityFromDays(config.daysOverdue)
    const invoices = generateInvoices(config.clientIndex, config.daysOverdue, config.amount)

    return {
      id: `ar-${index + 1}`,
      clientId: client.id,
      clientName: client.name,
      severity,
      overdueAmount: config.amount,
      daysOverdue: config.daysOverdue,
      contact: {
        name: client.contact.name,
        email: client.contact.email,
        phone: client.contact.phone,
      },
      invoices,
      notes: generateARNotes(severity, config.daysOverdue),
      createdAt: relativeDateISO(config.daysOverdue),
      handledAt: null,
      snoozedUntil: null,
      dismissedAt: null,
      dismissReason: null,
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

  // ============ Utility ============

  async resetAllData() {
    storage.clear()
    return { success: true }
  },
}

export default mockProvider
