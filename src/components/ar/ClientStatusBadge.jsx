import { useState } from 'react'
import { clientApi } from '../../services/api'
import {
  CLIENT_STATUS,
  CLIENT_STATUS_LABELS,
  CLIENT_STATUS_COLORS,
} from '../../services/types'

/**
 * Client Status Badge Component
 *
 * Shows and allows editing of client status.
 * Status affects how automation behaves for this client.
 */

const statusDescriptions = {
  [CLIENT_STATUS.NORMAL]: 'Standard automation runs. Reminders sent automatically at 60/90/120 days.',
  [CLIENT_STATUS.SLOW_PAYER]: 'Extended timeline. First reminder at 90 days instead of 60.',
  [CLIENT_STATUS.PAYMENT_ARRANGEMENT]: 'Manual handling only. All automation paused.',
  [CLIENT_STATUS.SENSITIVE]: 'Partner approval required for ALL communications.',
  [CLIENT_STATUS.DISPUTED]: 'Account disputed. All automation on hold.',
}

export function ClientStatusBadge({ clientId, currentStatus, onStatusChange, compact = false }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const colors = CLIENT_STATUS_COLORS[currentStatus] || CLIENT_STATUS_COLORS.normal
  const label = CLIENT_STATUS_LABELS[currentStatus] || 'Unknown'

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    try {
      await clientApi.updateStatus(clientId, newStatus)
      onStatusChange?.(newStatus)
    } catch (err) {
      console.error('Failed to update client status:', err)
    } finally {
      setIsUpdating(false)
      setIsEditing(false)
    }
  }

  if (compact) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full cursor-pointer ${colors.bg} ${colors.text}`}
        onClick={() => setIsEditing(true)}
        title={`Client Status: ${label}`}
      >
        {label}
        {isEditing && (
          <StatusDropdown
            currentStatus={currentStatus}
            onSelect={handleStatusChange}
            onClose={() => setIsEditing(false)}
            isUpdating={isUpdating}
          />
        )}
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsEditing(!isEditing)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${colors.bg} ${colors.border} ${colors.text} hover:opacity-80`}
      >
        <StatusIcon status={currentStatus} />
        <span className="text-sm font-medium">{label}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isEditing && (
        <StatusDropdown
          currentStatus={currentStatus}
          onSelect={handleStatusChange}
          onClose={() => setIsEditing(false)}
          isUpdating={isUpdating}
        />
      )}
    </div>
  )
}

function StatusIcon({ status }) {
  switch (status) {
    case CLIENT_STATUS.NORMAL:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    case CLIENT_STATUS.SLOW_PAYER:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case CLIENT_STATUS.PAYMENT_ARRANGEMENT:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    case CLIENT_STATUS.SENSITIVE:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case CLIENT_STATUS.DISPUTED:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    default:
      return null
  }
}

function StatusDropdown({ currentStatus, onSelect, onClose, isUpdating }) {
  const statuses = Object.values(CLIENT_STATUS)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Client Status</p>
          <p className="text-xs text-gray-400">Controls automation behavior</p>
        </div>

        <div className="py-1">
          {statuses.map((status) => {
            const colors = CLIENT_STATUS_COLORS[status]
            const isSelected = status === currentStatus

            return (
              <button
                key={status}
                onClick={() => onSelect(status)}
                disabled={isUpdating}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 disabled:opacity-50 ${
                  isSelected ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded ${colors.bg}`}>
                    <StatusIcon status={status} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {CLIENT_STATUS_LABELS[status]}
                    </p>
                    <p className="text-xs text-gray-500">
                      {statusDescriptions[status]}
                    </p>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default ClientStatusBadge
