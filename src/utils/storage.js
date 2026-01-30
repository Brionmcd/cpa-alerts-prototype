/**
 * LocalStorage wrapper with JSON serialization and error handling
 */

const STORAGE_PREFIX = 'cpa_alerts_'

export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error)
      return defaultValue
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error)
      return false
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error)
      return false
    }
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .forEach(key => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.error('Error clearing localStorage', error)
      return false
    }
  },
}

// Storage keys
export const STORAGE_KEYS = {
  ALERT_ACTIONS: 'alert_actions',
  CUSTOM_RULES: 'custom_rules',
  RULE_TOGGLES: 'rule_toggles',
  // New keys for reminder system
  REMINDER_APPROVALS: 'reminder_approvals',
  REMINDER_CANCELLATIONS: 'reminder_cancellations',
  SENT_REMINDERS: 'sent_reminders',
  CLIENT_STATUSES: 'client_statuses',
  EMAIL_TEMPLATES: 'email_templates',
}
