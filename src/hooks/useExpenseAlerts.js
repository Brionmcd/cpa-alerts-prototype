import { useState, useEffect, useCallback } from 'react'
import { expenseAlertsApi } from '../services/api'

/**
 * Custom hook for managing expense alerts
 *
 * Provides:
 * - alerts: Array of expense alerts
 * - isLoading: Loading state
 * - error: Error message if any
 * - refetch: Function to reload data
 * - markHandled: Function to mark alert as handled
 * - snooze: Function to snooze an alert
 * - dismiss: Function to dismiss an alert
 */
export function useExpenseAlerts() {
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await expenseAlertsApi.getAll()
      setAlerts(data)
    } catch (err) {
      setError(err.message || 'Failed to load expense alerts')
      console.error('Error fetching expense alerts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const markHandled = useCallback(async (id, note = null) => {
    try {
      await expenseAlertsApi.markHandled(id, note)
      // Optimistically remove from local state
      setAlerts(prev => prev.filter(a => a.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message || 'Failed to mark alert as handled')
      return { success: false, error: err.message }
    }
  }, [])

  const snooze = useCallback(async (id, days) => {
    try {
      await expenseAlertsApi.snooze(id, days)
      // Optimistically remove from local state (snoozed alerts are hidden)
      setAlerts(prev => prev.filter(a => a.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message || 'Failed to snooze alert')
      return { success: false, error: err.message }
    }
  }, [])

  const dismiss = useCallback(async (id, reason) => {
    try {
      await expenseAlertsApi.dismiss(id, reason)
      // Optimistically remove from local state
      setAlerts(prev => prev.filter(a => a.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message || 'Failed to dismiss alert')
      return { success: false, error: err.message }
    }
  }, [])

  return {
    alerts,
    isLoading,
    error,
    refetch: fetchAlerts,
    markHandled,
    snooze,
    dismiss,
  }
}

/**
 * Hook for getting a single expense alert by ID
 */
export function useExpenseAlertDetail(id) {
  const [alert, setAlert] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setAlert(null)
      setIsLoading(false)
      return
    }

    const fetchAlert = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await expenseAlertsApi.getById(id)
        setAlert(data)
      } catch (err) {
        setError(err.message || 'Failed to load alert details')
        console.error('Error fetching expense alert detail:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlert()
  }, [id])

  return { alert, isLoading, error }
}

export default useExpenseAlerts
