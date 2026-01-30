import { useState, useEffect, useRef } from 'react'
import { useAI } from '../../context/AIContext'
import { parseCommand } from '../../services/ai'

/**
 * Command Bar Component
 *
 * A natural language command input that appears with Cmd+K.
 * Parses user intent and executes actions on alerts.
 */

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const CommandIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

export function CommandBar({ isOpen, onClose, currentAlert, alertType, onAction }) {
  const { logCommand } = useAI()
  const [command, setCommand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setCommand('')
      setResult(null)
      setError(null)
    }
  }, [isOpen])

  // Handle keyboard shortcut globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isOpen) {
          // Parent component should handle opening
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!command.trim() || isProcessing) return

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const parsed = await parseCommand(command, currentAlert)
      setResult(parsed)

      // Log the command
      logCommand(command, parsed.action, parsed.confidence)

      // If high confidence, we can auto-execute or prompt
      // For now, show the result and let user confirm
    } catch (err) {
      setError('Failed to understand command. Please try again.')
      console.error('Command parsing failed:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const executeAction = () => {
    if (!result) return

    // Call the parent's action handler with the parsed action
    onAction?.(result)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Command Bar */}
      <div className="relative min-h-screen flex items-start justify-center pt-[20vh] px-4">
        <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex items-center gap-2 text-purple-600">
              <SparklesIcon />
              <span className="text-sm font-medium">AI Command</span>
            </div>
            <div className="flex-1" />
            <kbd className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">ESC</kbd>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 px-4 py-3">
              <CommandIcon />
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={currentAlert
                  ? `What would you like to do with ${currentAlert.clientName || currentAlert.category}?`
                  : "Type a command... (e.g., 'snooze for 3 days', 'assign to Sarah')"
                }
                className="flex-1 text-sm outline-none placeholder-gray-400"
                disabled={isProcessing}
              />
              {isProcessing && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent" />
              )}
            </div>
          </form>

          {/* Context indicator */}
          {currentAlert && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Acting on:</span>
                <span className="font-medium text-gray-700">
                  {currentAlert.clientName || currentAlert.category}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  currentAlert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                  currentAlert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {currentAlert.severity}
                </span>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="px-4 py-3 border-t border-gray-100 bg-purple-50">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {result.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      result.confidence === 'high' ? 'bg-green-100 text-green-700' :
                      result.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {result.confidence} confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{result.explanation}</p>

                  {/* Parameters */}
                  {result.parameters && Object.keys(result.parameters).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(result.parameters).map(([key, value]) => (
                        value && (
                          <span key={key} className="px-2 py-1 bg-white rounded border border-purple-200 text-xs">
                            <span className="text-gray-500">{key}:</span>{' '}
                            <span className="text-gray-700">{String(value)}</span>
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={executeAction}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Execute
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-3 border-t border-gray-100 bg-red-50">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Help text */}
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Try: "snooze for a week", "assign to Michael", "mark as handled", "draft a follow-up email"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandBar
