import { useState } from 'react'
import { useARAlerts, useExpenseAlerts, useAlertRules } from './hooks'
import { formatCurrency, formatPhoneNumber } from './utils/formatters'
import { DISMISS_REASONS, SNOOZE_OPTIONS } from './services/types'
import { utilityApi } from './services/api'

// Icons as components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const ARIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ExpenseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const RulesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

// Utility function for severity colors
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-500' }
    case 'warning': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-500' }
    case 'info': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-500' }
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-500' }
  }
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  )
}

// Toast Component
function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50">
      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:text-gray-300">
        <CloseIcon />
      </button>
    </div>
  )
}

// Sidebar Component
function Sidebar({ activeView, setActiveView, onResetData }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'ar-alerts', label: 'AR Alerts', icon: <ARIcon /> },
    { id: 'expense-alerts', label: 'Expense Alerts', icon: <ExpenseIcon /> },
    { id: 'alert-rules', label: 'Alert Rules', icon: <RulesIcon /> },
  ]

  return (
    <div className="w-64 bg-[#0f172a] min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">CPA Alerts</h1>
        <p className="text-slate-400 text-sm mt-1">Financial Monitoring</p>
      </div>
      <nav className="flex-1 px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              activeView === item.id
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onResetData}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
        >
          <RefreshIcon />
          Reset Demo Data
        </button>
        <p className="text-slate-500 text-xs mt-3 text-center">Version 1.0.0</p>
      </div>
    </div>
  )
}

// Summary Card Component
function SummaryCard({ title, value, subtitle, color, isLoading }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {isLoading ? (
        <div className="h-9 mt-2 bg-gray-200 rounded animate-pulse"></div>
      ) : (
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      )}
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

// Priority Alert Item Component
function PriorityAlertItem({ alert, type, onClick }) {
  const colors = getSeverityColor(alert.severity)

  return (
    <button
      onClick={() => onClick(alert, type)}
      className={`w-full text-left p-4 rounded-lg border ${colors.border} ${colors.bg} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">
            {type === 'ar' ? alert.clientName : alert.category}
          </p>
          <p className={`text-sm ${colors.text} mt-1`}>
            {type === 'ar'
              ? `${formatCurrency(alert.overdueAmount)} overdue - ${alert.daysOverdue} days`
              : `${alert.variancePercent}% over budget - ${formatCurrency(alert.actualAmount - alert.budgetAmount)}`
            }
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium text-white rounded ${colors.badge} capitalize`}>
          {alert.severity}
        </span>
      </div>
    </button>
  )
}

// Dashboard View
function DashboardView({ arAlerts, expenseAlerts, isLoading, onAlertClick }) {
  const criticalCount = arAlerts.filter(a => a.severity === 'critical').length +
                        expenseAlerts.filter(a => a.severity === 'critical').length
  const warningCount = arAlerts.filter(a => a.severity === 'warning').length +
                       expenseAlerts.filter(a => a.severity === 'warning').length
  const totalAR = arAlerts.reduce((sum, a) => sum + a.overdueAmount, 0)
  const totalExpenseVariance = expenseAlerts.reduce((sum, a) => sum + (a.actualAmount - a.budgetAmount), 0)

  const priorityAlerts = [
    ...arAlerts.filter(a => a.severity === 'critical').map(a => ({ ...a, type: 'ar' })),
    ...expenseAlerts.filter(a => a.severity === 'critical').map(a => ({ ...a, type: 'expense' })),
    ...arAlerts.filter(a => a.severity === 'warning').map(a => ({ ...a, type: 'ar' })),
    ...expenseAlerts.filter(a => a.severity === 'warning').map(a => ({ ...a, type: 'expense' })),
  ].slice(0, 5)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Critical Alerts"
          value={criticalCount}
          subtitle="Require immediate attention"
          color="text-red-600"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Warnings"
          value={warningCount}
          subtitle="Review within 48 hours"
          color="text-amber-600"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total AR Outstanding"
          value={formatCurrency(totalAR)}
          subtitle={`${arAlerts.length} overdue invoices`}
          color="text-gray-900"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Expense Variance"
          value={formatCurrency(totalExpenseVariance)}
          subtitle="Over budget this month"
          color="text-gray-900"
          isLoading={isLoading}
        />
      </div>

      {/* Priority Alerts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Alerts</h3>
        {isLoading ? (
          <LoadingSpinner />
        ) : priorityAlerts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No priority alerts. Great job!</p>
        ) : (
          <div className="space-y-3">
            {priorityAlerts.map((alert) => (
              <PriorityAlertItem
                key={alert.id}
                alert={alert}
                type={alert.type}
                onClick={onAlertClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Filter Tabs Component
function FilterTabs({ activeFilter, setActiveFilter }) {
  const filters = ['all', 'critical', 'warning', 'info']

  return (
    <div className="flex gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
            activeFilter === filter
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}

// AR Alert Card Component
function ARAlertCard({ alert, onClick }) {
  const colors = getSeverityColor(alert.severity)

  return (
    <button
      onClick={() => onClick(alert, 'ar')}
      className="w-full text-left bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{alert.clientName}</h4>
          <p className="text-sm text-gray-500">{alert.contact?.name || 'No contact'}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium text-white rounded ${colors.badge} capitalize`}>
          {alert.severity}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Overdue Amount</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(alert.overdueAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Days Overdue</p>
          <p className={`text-lg font-semibold ${colors.text}`}>{alert.daysOverdue} days</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-3">{alert.invoices?.length || 0} invoice(s)</p>
    </button>
  )
}

// AR Alerts View
function ARAlertsView({ alerts, isLoading, onAlertClick }) {
  const [filter, setFilter] = useState('all')

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(a => a.severity === filter)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">AR Alerts</h2>
      <FilterTabs activeFilter={filter} setActiveFilter={setFilter} />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {filteredAlerts.map((alert) => (
              <ARAlertCard key={alert.id} alert={alert} onClick={onAlertClick} />
            ))}
          </div>
          {filteredAlerts.length === 0 && (
            <p className="text-gray-500 text-center py-8">No alerts match the selected filter.</p>
          )}
        </>
      )}
    </div>
  )
}

// Expense Alert Card Component
function ExpenseAlertCard({ alert, onClick }) {
  const colors = getSeverityColor(alert.severity)

  return (
    <button
      onClick={() => onClick(alert, 'expense')}
      className="w-full text-left bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{alert.category}</h4>
          <p className="text-sm text-gray-500">{alert.period}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium text-white rounded ${colors.badge} capitalize`}>
          {alert.severity}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Budget</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(alert.budgetAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Actual</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(alert.actualAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Variance</p>
          <p className={`text-lg font-semibold ${colors.text}`}>+{alert.variancePercent}%</p>
        </div>
      </div>
    </button>
  )
}

// Expense Alerts View
function ExpenseAlertsView({ alerts, isLoading, onAlertClick }) {
  const [filter, setFilter] = useState('all')

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(a => a.severity === filter)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Expense Alerts</h2>
      <FilterTabs activeFilter={filter} setActiveFilter={setFilter} />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {filteredAlerts.map((alert) => (
              <ExpenseAlertCard key={alert.id} alert={alert} onClick={onAlertClick} />
            ))}
          </div>
          {filteredAlerts.length === 0 && (
            <p className="text-gray-500 text-center py-8">No alerts match the selected filter.</p>
          )}
        </>
      )}
    </div>
  )
}

// Alert Detail Panel Component
function AlertDetailPanel({ alert, type, onClose, onMarkHandled, onSnooze, onDismiss }) {
  const [actionNote, setActionNote] = useState('')
  const [snoozeDuration, setSnoozeDuration] = useState(SNOOZE_OPTIONS[0].days)
  const [dismissReason, setDismissReason] = useState('')
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false)
  const [showDismissOptions, setShowDismissOptions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const colors = getSeverityColor(alert.severity)

  const handleMarkHandled = async () => {
    setIsSubmitting(true)
    await onMarkHandled(alert.id, actionNote || null)
    setIsSubmitting(false)
  }

  const handleSnooze = async () => {
    setIsSubmitting(true)
    await onSnooze(alert.id, snoozeDuration)
    setIsSubmitting(false)
    setShowSnoozeOptions(false)
  }

  const handleDismiss = async () => {
    if (!dismissReason) return
    setIsSubmitting(true)
    await onDismiss(alert.id, dismissReason)
    setIsSubmitting(false)
    setShowDismissOptions(false)
  }

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-[500px] bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className={`p-6 ${colors.bg} border-b ${colors.border}`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={`px-2 py-1 text-xs font-medium text-white rounded ${colors.badge} capitalize`}>
                {alert.severity}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-2">
                {type === 'ar' ? alert.clientName : alert.category}
              </h3>
              <p className="text-gray-600">
                {type === 'ar'
                  ? `${formatCurrency(alert.overdueAmount)} overdue`
                  : `${alert.variancePercent}% over budget`
                }
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {type === 'ar' ? (
            <>
              {/* Contact Info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{alert.contact?.name || 'No contact'}</p>
                  <p className="text-gray-600">{alert.contact?.email || 'No email'}</p>
                  <p className="text-gray-600">{alert.contact?.phone ? formatPhoneNumber(alert.contact.phone) : 'No phone'}</p>
                </div>
              </div>

              {/* Invoice Breakdown */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Invoice Breakdown</h4>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase">
                      <th className="pb-2">Invoice</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {(alert.invoices || []).map((inv, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="py-3">
                          <p className="font-medium text-gray-900">{inv.number}</p>
                          <p className="text-gray-500 text-xs">{inv.description}</p>
                        </td>
                        <td className="py-3 text-gray-600">{inv.date}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(inv.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td colSpan={2} className="py-3 font-semibold">Total</td>
                      <td className="py-3 text-right font-semibold">{formatCurrency(alert.overdueAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Notes</h4>
                <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{alert.notes || 'No notes'}</p>
              </div>
            </>
          ) : (
            <>
              {/* Budget Summary */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Budget Summary</h4>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="text-lg font-semibold">{formatCurrency(alert.budgetAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Actual</p>
                    <p className="text-lg font-semibold">{formatCurrency(alert.actualAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Variance</p>
                    <p className={`text-lg font-semibold ${colors.text}`}>+{formatCurrency(alert.actualAmount - alert.budgetAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Top Expense Drivers */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Top Expense Drivers</h4>
                <div className="space-y-3">
                  {(alert.drivers || []).map((driver, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{driver.name}</p>
                          <p className="text-sm text-gray-500">{driver.vendor && `${driver.vendor} - `}{driver.note}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(driver.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Notes</h4>
                <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{alert.notes || 'No notes'}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Actions</h4>

            {/* Mark as Handled */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add a note (optional)</label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={2}
                placeholder="Add any relevant notes..."
                disabled={isSubmitting}
              />
              <button
                onClick={handleMarkHandled}
                disabled={isSubmitting}
                className="mt-2 w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Mark as Handled'}
              </button>
            </div>

            {/* Snooze */}
            <div className="mb-4">
              {!showSnoozeOptions ? (
                <button
                  onClick={() => setShowSnoozeOptions(true)}
                  disabled={isSubmitting}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Snooze Alert
                </button>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Snooze Duration</label>
                  <select
                    value={snoozeDuration}
                    onChange={(e) => setSnoozeDuration(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-3"
                    disabled={isSubmitting}
                  >
                    {SNOOZE_OPTIONS.map((option) => (
                      <option key={option.days} value={option.days}>{option.label}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSnooze}
                      disabled={isSubmitting}
                      className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Snooze'}
                    </button>
                    <button
                      onClick={() => setShowSnoozeOptions(false)}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dismiss */}
            <div>
              {!showDismissOptions ? (
                <button
                  onClick={() => setShowDismissOptions(true)}
                  disabled={isSubmitting}
                  className="w-full bg-white border border-red-300 text-red-600 py-2 px-4 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Dismiss Alert
                </button>
              ) : (
                <div className="bg-red-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Dismissal (required)</label>
                  <select
                    value={dismissReason}
                    onChange={(e) => setDismissReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-3"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a reason...</option>
                    {DISMISS_REASONS.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDismiss}
                      disabled={!dismissReason || isSubmitting}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Dismiss'}
                    </button>
                    <button
                      onClick={() => setShowDismissOptions(false)}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Rule Builder Component
function RuleBuilder({ onSave, isLoading }) {
  const [alertType, setAlertType] = useState('ar')
  const [condition, setCondition] = useState('overdue_days')
  const [operator, setOperator] = useState('greaterThan')
  const [value, setValue] = useState('')
  const [severity, setSeverity] = useState('warning')
  const [ruleName, setRuleName] = useState('')

  const handleSave = async () => {
    if (!ruleName || !value) return

    const conditionText = alertType === 'ar'
      ? condition === 'overdue_days'
        ? `Invoice overdue by ${operator === 'greaterThan' ? 'more than' : 'less than'} ${value} days`
        : `Amount ${operator === 'greaterThan' ? 'greater than' : 'less than'} ${formatCurrency(Number(value))}`
      : condition === 'variance_percent'
        ? `Budget exceeded by ${operator === 'greaterThan' ? 'more than' : 'less than'} ${value}%`
        : `Amount over budget ${operator === 'greaterThan' ? 'greater than' : 'less than'} ${formatCurrency(Number(value))}`

    await onSave({
      name: ruleName,
      description: conditionText,
      alertType,
      severity,
      conditions: { field: condition, operator, value: Number(value) },
    })

    // Reset form
    setRuleName('')
    setValue('')
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Rule</h3>
      <p className="text-gray-500 text-sm mb-6">Build a rule using plain English conditions</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
          <input
            type="text"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g., High Value Overdue Alert"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
            <select
              value={alertType}
              onChange={(e) => {
                setAlertType(e.target.value)
                setCondition(e.target.value === 'ar' ? 'overdue_days' : 'variance_percent')
              }}
              className="w-full border border-gray-300 rounded-lg p-3"
              disabled={isLoading}
            >
              <option value="ar">Accounts Receivable</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
              disabled={isLoading}
            >
              <option value="critical">Critical (Red)</option>
              <option value="warning">Warning (Amber)</option>
              <option value="info">Info (Blue)</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">When...</p>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
              disabled={isLoading}
            >
              {alertType === 'ar' ? (
                <>
                  <option value="overdue_days">days overdue</option>
                  <option value="amount">overdue amount</option>
                </>
              ) : (
                <>
                  <option value="variance_percent">budget variance (%)</option>
                  <option value="variance_amount">variance amount</option>
                </>
              )}
            </select>
            <span className="text-gray-600">is</span>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
              disabled={isLoading}
            >
              <option value="greaterThan">greater than</option>
              <option value="lessThan">less than</option>
            </select>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-24"
              placeholder={condition.includes('amount') ? '$' : '#'}
              disabled={isLoading}
            />
            {condition.includes('percent') && <span className="text-gray-600">%</span>}
            {condition.includes('days') && <span className="text-gray-600">days</span>}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!ruleName || !value || isLoading}
          className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Rule
        </button>
      </div>
    </div>
  )
}

// Alert Rules View
function AlertRulesView({ rules, isLoading, onToggleRule, onCreateRule, showToast }) {
  const handleAddRule = async (newRule) => {
    const result = await onCreateRule(newRule)
    if (result.success) {
      showToast(`Rule "${newRule.name}" created successfully`)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Alert Rules</h2>

      <RuleBuilder onSave={handleAddRule} isLoading={isLoading} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Existing Rules</h3>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="divide-y divide-gray-100">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{rule.name}</p>
                  <p className="text-sm text-gray-500">{rule.description}</p>
                </div>
                <button
                  onClick={() => onToggleRule(rule.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    rule.enabled ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      rule.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [selectedAlertType, setSelectedAlertType] = useState(null)
  const [toast, setToast] = useState(null)

  // Use custom hooks for data
  const {
    alerts: arAlerts,
    isLoading: arLoading,
    refetch: refetchAR,
    markHandled: markARHandled,
    snooze: snoozeAR,
    dismiss: dismissAR,
  } = useARAlerts()

  const {
    alerts: expenseAlerts,
    isLoading: expenseLoading,
    refetch: refetchExpense,
    markHandled: markExpenseHandled,
    snooze: snoozeExpense,
    dismiss: dismissExpense,
  } = useExpenseAlerts()

  const {
    rules,
    isLoading: rulesLoading,
    refetch: refetchRules,
    toggleRule,
    createRule,
  } = useAlertRules()

  const isLoading = arLoading || expenseLoading

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleAlertClick = (alert, type) => {
    setSelectedAlert(alert)
    setSelectedAlertType(type)
  }

  const handleClosePanel = () => {
    setSelectedAlert(null)
    setSelectedAlertType(null)
  }

  const handleMarkHandled = async (id, note) => {
    const alertName = selectedAlertType === 'ar'
      ? selectedAlert.clientName
      : selectedAlert.category

    if (selectedAlertType === 'ar') {
      await markARHandled(id, note)
    } else {
      await markExpenseHandled(id, note)
    }

    handleClosePanel()
    showToast(`${alertName} marked as handled${note ? ` - Note: ${note}` : ''}`)
  }

  const handleSnooze = async (id, days) => {
    const alertName = selectedAlertType === 'ar'
      ? selectedAlert.clientName
      : selectedAlert.category

    if (selectedAlertType === 'ar') {
      await snoozeAR(id, days)
    } else {
      await snoozeExpense(id, days)
    }

    handleClosePanel()
    showToast(`${alertName} snoozed for ${days} day(s)`)
  }

  const handleDismiss = async (id, reason) => {
    const alertName = selectedAlertType === 'ar'
      ? selectedAlert.clientName
      : selectedAlert.category

    if (selectedAlertType === 'ar') {
      await dismissAR(id, reason)
    } else {
      await dismissExpense(id, reason)
    }

    handleClosePanel()
    showToast(`${alertName} dismissed - ${reason}`)
  }

  const handleResetData = async () => {
    await utilityApi.resetAll()
    refetchAR()
    refetchExpense()
    refetchRules()
    showToast('Demo data has been reset')
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            arAlerts={arAlerts}
            expenseAlerts={expenseAlerts}
            isLoading={isLoading}
            onAlertClick={handleAlertClick}
          />
        )
      case 'ar-alerts':
        return (
          <ARAlertsView
            alerts={arAlerts}
            isLoading={arLoading}
            onAlertClick={handleAlertClick}
          />
        )
      case 'expense-alerts':
        return (
          <ExpenseAlertsView
            alerts={expenseAlerts}
            isLoading={expenseLoading}
            onAlertClick={handleAlertClick}
          />
        )
      case 'alert-rules':
        return (
          <AlertRulesView
            rules={rules}
            isLoading={rulesLoading}
            onToggleRule={toggleRule}
            onCreateRule={createRule}
            showToast={showToast}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onResetData={handleResetData}
      />
      <main className="flex-1 bg-[#f1f5f9] p-8 overflow-y-auto">
        {renderView()}
      </main>

      {selectedAlert && (
        <AlertDetailPanel
          alert={selectedAlert}
          type={selectedAlertType}
          onClose={handleClosePanel}
          onMarkHandled={handleMarkHandled}
          onSnooze={handleSnooze}
          onDismiss={handleDismiss}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default App
