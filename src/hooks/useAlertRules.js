import { useState, useEffect, useCallback } from 'react'
import { alertRulesApi } from '../services/api'

/**
 * Custom hook for managing alert rules
 *
 * Provides:
 * - rules: Array of alert rules
 * - isLoading: Loading state
 * - error: Error message if any
 * - refetch: Function to reload data
 * - toggleRule: Function to enable/disable a rule
 * - createRule: Function to create a new rule
 * - deleteRule: Function to delete a custom rule
 */
export function useAlertRules() {
  const [rules, setRules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRules = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await alertRulesApi.getAll()
      setRules(data)
    } catch (err) {
      setError(err.message || 'Failed to load alert rules')
      console.error('Error fetching alert rules:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const toggleRule = useCallback(async (id) => {
    // Find current state
    const rule = rules.find(r => r.id === id)
    if (!rule) return { success: false, error: 'Rule not found' }

    const newEnabled = !rule.enabled

    // Optimistic update
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, enabled: newEnabled } : r
    ))

    try {
      await alertRulesApi.toggle(id, newEnabled)
      return { success: true }
    } catch (err) {
      // Revert on error
      setRules(prev => prev.map(r =>
        r.id === id ? { ...r, enabled: !newEnabled } : r
      ))
      setError(err.message || 'Failed to toggle rule')
      return { success: false, error: err.message }
    }
  }, [rules])

  const createRule = useCallback(async (ruleData) => {
    try {
      const newRule = await alertRulesApi.create(ruleData)
      setRules(prev => [...prev, newRule])
      return { success: true, rule: newRule }
    } catch (err) {
      setError(err.message || 'Failed to create rule')
      return { success: false, error: err.message }
    }
  }, [])

  const deleteRule = useCallback(async (id) => {
    // Check if it's a custom rule (only custom rules can be deleted)
    const rule = rules.find(r => r.id === id)
    if (!rule || !rule.id.startsWith('rule-custom-')) {
      return { success: false, error: 'Cannot delete built-in rules' }
    }

    // Optimistic update
    setRules(prev => prev.filter(r => r.id !== id))

    try {
      await alertRulesApi.delete(id)
      return { success: true }
    } catch (err) {
      // Revert on error
      setRules(prev => [...prev, rule])
      setError(err.message || 'Failed to delete rule')
      return { success: false, error: err.message }
    }
  }, [rules])

  return {
    rules,
    isLoading,
    error,
    refetch: fetchRules,
    toggleRule,
    createRule,
    deleteRule,
  }
}

export default useAlertRules
