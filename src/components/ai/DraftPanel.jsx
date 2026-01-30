import { useState, useEffect } from 'react'
import { useAI } from '../../context/AIContext'
import { generateDraft } from '../../services/ai'

/**
 * Draft Panel Component
 *
 * Shows AI-generated email/message draft with editing capability.
 * Simulates sending and provides "View Message" link.
 */

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const TONE_OPTIONS = [
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'firm', label: 'Firm', description: 'Direct with urgency' },
]

export function DraftPanel({ isOpen, onClose, alert, alertType, onSend }) {
  const { logDraft, addSentMessage } = useAI()

  const [draft, setDraft] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)
  const [tone, setTone] = useState('friendly')
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody] = useState('')
  const [sendSuccess, setSendSuccess] = useState(false)
  const [sentMessageId, setSentMessageId] = useState(null)

  // Load draft when opened or tone changes
  useEffect(() => {
    if (isOpen && alert) {
      loadDraft()
    }
  }, [isOpen, alert?.id, tone])

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setDraft(null)
      setError(null)
      setSendSuccess(false)
      setSentMessageId(null)
    }
  }, [isOpen])

  const loadDraft = async () => {
    if (!alert) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await generateDraft(alert, alertType, tone, 'Johnson & Associates CPA')
      setDraft(result)
      setEditedSubject(result.subject)
      setEditedBody(result.body)

      // Log the draft generation
      logDraft(alert.id, alertType, tone)
    } catch (err) {
      setError('Failed to generate draft. Please try again.')
      console.error('Draft generation failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!draft) return

    setIsSending(true)

    // Simulate sending (500ms delay)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Store the sent message
    const sentMessage = {
      id: `msg-${Date.now()}`,
      alertId: alert.id,
      alertType,
      recipient: alertType === 'ar' ? alert.clientName : alert.category,
      recipientEmail: alertType === 'ar'
        ? alert.contact?.email || 'contact@example.com'
        : 'team@example.com',
      subject: editedSubject,
      body: editedBody,
      tone,
      sentAt: new Date().toISOString(),
    }

    addSentMessage(sentMessage)
    setSentMessageId(sentMessage.id)
    setSendSuccess(true)
    setIsSending(false)

    // Notify parent
    onSend?.(sentMessage)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-purple-600">
                <SparklesIcon />
                <span className="font-semibold">AI Draft</span>
              </div>
              {alert && (
                <span className="text-sm text-gray-500">
                  for {alertType === 'ar' ? alert.clientName : alert.category}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Send Success State */}
          {sendSuccess && (
            <div className="p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Your message has been sent to {alertType === 'ar' ? alert.clientName : alert.category}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      // Open the message viewer
                      window.dispatchEvent(new CustomEvent('viewSentMessage', { detail: { messageId: sentMessageId } }))
                      onClose()
                    }}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Message
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !sendSuccess && (
            <div className="p-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4" />
                  <p className="text-sm text-gray-500">Generating draft...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !sendSuccess && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={loadDraft}
                  className="mt-2 text-sm text-red-700 font-medium hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Draft Editor */}
          {draft && !isLoading && !sendSuccess && (
            <>
              {/* Tone Selector */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-500 uppercase">Tone:</span>
                  <div className="flex gap-2">
                    {TONE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTone(option.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          tone === option.value
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                        }`}
                        title={option.description}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={loadDraft}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    title="Regenerate draft"
                  >
                    <RefreshIcon />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {/* Email Form */}
              <div className="p-6 space-y-4">
                {/* To Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">To</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {alertType === 'ar'
                      ? `${alert.contact?.name || alert.clientName} <${alert.contact?.email || 'contact@example.com'}>`
                      : `Team <team@example.com>`
                    }
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Body Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Message</label>
                  <textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Suggestions */}
                {draft.suggestions && draft.suggestions.length > 0 && (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                    <p className="text-xs font-medium text-purple-700 mb-2">AI Suggestions:</p>
                    <ul className="space-y-1">
                      {draft.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-xs text-purple-600 flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  <SparklesIcon className="inline w-3 h-3 mr-1" />
                  AI-generated draft • Review before sending
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isSending || !editedSubject || !editedBody}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <SendIcon />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DraftPanel
