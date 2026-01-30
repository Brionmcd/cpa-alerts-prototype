import { useState } from 'react'
import { useAI } from '../../context/AIContext'

/**
 * AI Activity Log Component
 *
 * Shows a log of all AI activity in the current session.
 * Includes routing decisions, enrichments, commands, and drafts.
 */

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const RouteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const LightbulbIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const CommandIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const getActivityIcon = (type) => {
  switch (type) {
    case 'routing':
      return <RouteIcon />
    case 'enrichment':
      return <LightbulbIcon />
    case 'command':
      return <CommandIcon />
    case 'draft':
      return <MailIcon />
    default:
      return <SparklesIcon />
  }
}

const getActivityColor = (type) => {
  switch (type) {
    case 'routing':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'enrichment':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'command':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'draft':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const formatActivityDetails = (activity) => {
  switch (activity.type) {
    case 'routing':
      return (
        <>
          <span className="font-medium">{activity.alertName}</span>
          {' → '}
          <span className="text-emerald-600 font-medium">{activity.result?.assignedTo?.name || 'Unknown'}</span>
          {activity.result?.confidence && (
            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${
              activity.result.confidence === 'high' ? 'bg-green-100 text-green-700' :
              activity.result.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {activity.result.confidence}
            </span>
          )}
        </>
      )
    case 'enrichment':
      return (
        <>
          Enriched <span className="font-medium">{activity.alertName}</span>
          {activity.result?.riskLevel && (
            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${
              activity.result.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
              activity.result.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-green-100 text-green-700'
            }`}>
              {activity.result.riskLevel} risk
            </span>
          )}
        </>
      )
    case 'command':
      return (
        <>
          <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
            "{activity.command}"
          </span>
          {' → '}
          <span className="font-medium">{activity.action?.replace('_', ' ')}</span>
        </>
      )
    case 'draft':
      return (
        <>
          Draft for <span className="font-medium">{activity.alertName}</span>
          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
            {activity.tone}
          </span>
        </>
      )
    default:
      return activity.message || 'AI Activity'
  }
}

export function AIActivityLog({ isOpen, onClose, onViewMessage }) {
  const { activityLog, sentMessages, clearActivityLog } = useAI()
  const [activeTab, setActiveTab] = useState('activity')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-2 text-purple-600">
            <SparklesIcon />
            <span className="font-semibold">AI Activity</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
              {activityLog.length} events
            </span>
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

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity Log
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'messages'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sent Messages ({sentMessages.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'activity' && (
            <>
              {activityLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                    <SparklesIcon />
                  </div>
                  <p className="text-gray-500 text-sm">No AI activity yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    AI insights, routing, and commands will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activityLog.slice().reverse().map((activity) => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              {activity.type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTime(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {formatActivityDetails(activity)}
                          </p>
                          {activity.result?.reasoning && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                              {activity.result.reasoning}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'messages' && (
            <>
              {sentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <MailIcon />
                  </div>
                  <p className="text-gray-500 text-sm">No messages sent yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Messages sent via AI drafts will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sentMessages.slice().reverse().map((message) => (
                    <div
                      key={message.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onViewMessage?.(message)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                          <MailIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {message.recipient}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTime(message.sentAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 truncate">
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {message.body.substring(0, 100)}...
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'activity' && activityLog.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <button
              onClick={clearActivityLog}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear activity log
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Message Viewer Modal
 *
 * Shows full details of a sent message
 */
export function MessageViewer({ message, isOpen, onClose }) {
  if (!isOpen || !message) return null

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex items-center gap-2 text-emerald-600">
              <MailIcon />
              <span className="font-semibold">Sent Message</span>
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

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Meta */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">Sent:</span>
              <span className="text-gray-900">
                {new Date(message.sentAt).toLocaleString()}
              </span>
            </div>

            {/* To */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">To</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                {message.recipient} &lt;{message.recipientEmail}&gt;
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Subject</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900 font-medium">
                {message.subject}
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Message</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-80 overflow-y-auto">
                {message.body}
              </div>
            </div>

            {/* Meta badge */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full flex items-center gap-1">
                <SparklesIcon />
                AI-generated
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {message.tone} tone
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIActivityLog
