import { useState, useEffect } from 'react'
import { reminderApi } from '../../services/api'
import { formatCurrency } from '../../utils/formatters'
import {
  REMINDER_TONE_LABELS,
  CLIENT_STATUS_LABELS,
  CLIENT_STATUS_COLORS,
} from '../../services/types'
import { generateSubject, generateBody } from '../../services/emailTemplates'

/**
 * Reminder Approval Queue Component
 *
 * Shows all pending reminders that need partner approval.
 * Partners can preview, edit, approve, or cancel reminders.
 */

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

export function ReminderApprovalQueue({ onRefresh, showToast }) {
  const [pendingReminders, setPendingReminders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReminder, setSelectedReminder] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    loadPendingReminders()
  }, [])

  const loadPendingReminders = async () => {
    setIsLoading(true)
    try {
      const data = await reminderApi.getPendingApprovals()
      setPendingReminders(data)
    } catch (err) {
      console.error('Failed to load pending reminders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (reminder) => {
    setProcessingId(reminder.id)
    try {
      await reminderApi.approve(reminder.id, 'Current Partner')
      showToast?.(`Reminder approved for ${reminder.clientName}`)
      loadPendingReminders()
      onRefresh?.()
    } catch (err) {
      console.error('Failed to approve reminder:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancel = async (reminder) => {
    setProcessingId(reminder.id)
    try {
      await reminderApi.cancel(reminder.id)
      showToast?.(`Reminder cancelled for ${reminder.clientName}`)
      loadPendingReminders()
      onRefresh?.()
    } catch (err) {
      console.error('Failed to cancel reminder:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const handlePreview = (reminder) => {
    setSelectedReminder(reminder)
    setShowPreview(true)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ClockIcon />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
                <p className="text-sm text-gray-500">
                  {pendingReminders.length} reminder{pendingReminders.length !== 1 ? 's' : ''} awaiting your approval
                </p>
              </div>
            </div>
            <button
              onClick={loadPendingReminders}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {pendingReminders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckIcon />
            </div>
            <p className="text-gray-500">No reminders pending approval</p>
            <p className="text-sm text-gray-400 mt-1">
              All automated reminders are up to date
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingReminders.map((reminder) => {
              const statusColors = CLIENT_STATUS_COLORS[reminder.clientStatus] || CLIENT_STATUS_COLORS.normal
              const isProcessing = processingId === reminder.id

              return (
                <div key={reminder.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{reminder.clientName}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors.bg} ${statusColors.text}`}>
                          {CLIENT_STATUS_LABELS[reminder.clientStatus]}
                        </span>
                        {reminder.ccEscalation && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                            + CC Escalation
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>{formatCurrency(reminder.overdueAmount)} overdue</span>
                        <span>{reminder.daysOverdue} days</span>
                        <span className="capitalize">{REMINDER_TONE_LABELS[reminder.tone]}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MailIcon />
                        <span className="text-gray-600">To: {reminder.recipientName}</span>
                        <span className="text-gray-400">({reminder.recipientEmail})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handlePreview(reminder)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <EyeIcon />
                        Preview
                      </button>
                      <button
                        onClick={() => handleCancel(reminder)}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <XIcon />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleApprove(reminder)}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <CheckIcon />
                        )}
                        Approve & Send
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedReminder && (
        <EmailPreviewModal
          reminder={selectedReminder}
          onClose={() => {
            setShowPreview(false)
            setSelectedReminder(null)
          }}
          onApprove={() => {
            handleApprove(selectedReminder)
            setShowPreview(false)
            setSelectedReminder(null)
          }}
          onCancel={() => {
            handleCancel(selectedReminder)
            setShowPreview(false)
            setSelectedReminder(null)
          }}
        />
      )}
    </>
  )
}

/**
 * Email Preview Modal
 */
function EmailPreviewModal({ reminder, onClose, onApprove, onCancel }) {
  const [tone, setTone] = useState(reminder.tone)
  const [fromBillingCommittee, setFromBillingCommittee] = useState(false)

  // Generate preview content
  const previewSubject = generateSubject(
    tone,
    reminder.triggerDays,
    reminder.clientName,
    [] // Would need invoice numbers
  )

  const previewBody = generateBody({
    tone,
    triggerDays: reminder.triggerDays,
    clientName: reminder.clientName,
    contactName: reminder.recipientName,
    overdueAmount: reminder.overdueAmount,
    daysOverdue: reminder.daysOverdue,
    invoices: [],
    aiywynPaymentUrl: 'https://pay.aiwyn.com/demo',
    fromBillingCommittee,
    ccEscalation: reminder.ccEscalation,
    escalationName: reminder.ccEscalation ? 'CFO' : null,
  })

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Email Preview</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XIcon />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tone:</span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="text-sm border border-gray-200 rounded px-2 py-1"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="firm">Firm</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fromBillingCommittee}
                  onChange={(e) => setFromBillingCommittee(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Send from Billing Committee</span>
              </label>
            </div>
          </div>

          {/* Email Preview */}
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">To</label>
              <p className="text-sm text-gray-900">
                {reminder.recipientName} &lt;{reminder.recipientEmail}&gt;
                {reminder.ccEscalation && (
                  <span className="text-gray-500 ml-2">(+ CC to CFO)</span>
                )}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Subject</label>
              <p className="text-sm text-gray-900">{previewSubject}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Message</label>
              <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {previewBody}
                </pre>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Partner approval required before sending
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Cancel Reminder
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg"
              >
                Approve & Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReminderApprovalQueue
