import { useState, useEffect } from 'react'
import { useARAlerts, useExpenseAlerts, useAlertRules } from './hooks'
import { formatCurrency, formatPhoneNumber } from './utils/formatters'
import {
  DISMISS_REASONS,
  SNOOZE_OPTIONS,
  CLIENT_STATUS_LABELS,
  CLIENT_STATUS_COLORS,
} from './services/types'
import { utilityApi } from './services/api'
import { AIProvider, useAI } from './context/AIContext'
import {
  AIInsightsPanel,
  AIRoutingBadge,
  CommandBar,
  DraftPanel,
  AIActivityLog,
  MessageViewer,
} from './components/ai'
import {
  ARAgingSummary,
  ReminderApprovalQueue,
  ClientStatusBadge,
} from './components/ar'
import {
  WelcomeScreen,
  DemoContextBanner,
  SectionCallout,
  ImpactComparisonPanel,
  ImpactButton,
  ROISummaryBar,
  ROISummaryCompact,
  resetAllOnboarding,
} from './components/onboarding'

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

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

// About Icon
const AboutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// Sidebar Component
function Sidebar({ activeView, setActiveView, onResetData, onOpenAIActivity, onShowImpact, onShowWelcome }) {
  const { activityLog } = useAI()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'ar-alerts', label: 'AR Alerts', icon: <ARIcon /> },
    { id: 'expense-alerts', label: 'Expense Alerts', icon: <ExpenseIcon /> },
    { id: 'alert-rules', label: 'Alert Rules', icon: <RulesIcon /> },
  ]

  return (
    <div className="w-64 bg-[#0f172a] h-screen flex flex-col sticky top-0">
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Sentinel</h1>
        </div>
        <p className="text-slate-400 text-sm mt-2">Intelligent Practice Monitoring</p>
      </div>
      <nav className="flex-1 px-4 overflow-y-auto">
        {/* About Sentinel - Primary nav item */}
        <button
          onClick={onShowWelcome}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-emerald-300 hover:bg-emerald-900/30 hover:text-emerald-200 transition-colors border border-emerald-500/30"
        >
          <AboutIcon />
          <span>About Sentinel</span>
        </button>

        <div className="border-t border-slate-700 my-3"></div>

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

        {/* AI Activity Button */}
        <button
          onClick={onOpenAIActivity}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mt-4 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200 transition-colors border border-purple-500/30"
        >
          <SparklesIcon />
          <span>AI Activity</span>
          {activityLog.length > 0 && (
            <span className="ml-auto px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
              {activityLog.length}
            </span>
          )}
        </button>
      </nav>

      {/* Bottom Section - Always Visible */}
      <div className="flex-shrink-0">
        {/* ROI Summary in Sidebar */}
        <div className="px-4 mb-4">
          <ROISummaryCompact onSeeFullReport={onShowImpact} />
        </div>

        <div className="p-4 border-t border-slate-700">
          <div className="mb-3 px-3 py-2 bg-purple-900/20 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-300 text-xs">
              <SparklesIcon />
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-purple-800/50 rounded text-purple-200">⌘K</kbd>
              <span>for AI commands</span>
            </div>
          </div>
          <button
            onClick={onResetData}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
            title="Reset all demo data"
          >
            <RefreshIcon />
            Reset Demo Data
          </button>
          <p className="text-slate-500 text-xs mt-3 text-center">Version 1.0.0</p>
        </div>
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
function DashboardView({ arAlerts, expenseAlerts, isLoading, onAlertClick, showToast, onBucketClick, onShowImpact }) {
  const criticalCount = arAlerts.filter(a => a.severity === 'critical').length +
                        expenseAlerts.filter(a => a.severity === 'critical').length
  const warningCount = arAlerts.filter(a => a.severity === 'warning').length +
                       expenseAlerts.filter(a => a.severity === 'warning').length
  const totalAR = arAlerts.reduce((sum, a) => sum + a.overdueAmount, 0)
  const totalExpenseVariance = expenseAlerts.reduce((sum, a) => sum + (a.actualAmount - a.budgetAmount), 0)

  // Count 90+ day AR
  const ninetyPlusCount = arAlerts.filter(a => a.daysOverdue >= 90).length
  const ninetyPlusAmount = arAlerts
    .filter(a => a.daysOverdue >= 90)
    .reduce((sum, a) => sum + a.overdueAmount, 0)

  const priorityAlerts = [
    ...arAlerts.filter(a => a.severity === 'critical').map(a => ({ ...a, type: 'ar' })),
    ...expenseAlerts.filter(a => a.severity === 'critical').map(a => ({ ...a, type: 'expense' })),
    ...arAlerts.filter(a => a.severity === 'warning').map(a => ({ ...a, type: 'ar' })),
    ...expenseAlerts.filter(a => a.severity === 'warning').map(a => ({ ...a, type: 'expense' })),
  ].slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Demo Context Banner */}
      <DemoContextBanner />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <ImpactButton onClick={onShowImpact} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <SummaryCard
          title="Critical Alerts"
          value={criticalCount}
          subtitle="Require immediate attention"
          color="text-red-600"
          isLoading={isLoading}
        />
        <SummaryCard
          title="90+ Day AR"
          value={formatCurrency(ninetyPlusAmount)}
          subtitle={`${ninetyPlusCount} accounts overdue`}
          color="text-red-600"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total AR Outstanding"
          value={formatCurrency(totalAR)}
          subtitle={`${arAlerts.length} overdue accounts`}
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

      {/* AR Aging Section with Callout */}
      <SectionCallout section="arAging" />
      <ARAgingSummary onBucketClick={onBucketClick} />

      {/* Reminder Approval Queue */}
      <ReminderApprovalQueue showToast={showToast} />

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
  const statusColors = CLIENT_STATUS_COLORS[alert.clientStatus] || CLIENT_STATUS_COLORS.normal

  return (
    <button
      onClick={() => onClick(alert, 'ar')}
      className="w-full text-left bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900">{alert.clientName}</h4>
            {alert.clientStatus && alert.clientStatus !== 'normal' && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors.bg} ${statusColors.text}`}>
                {CLIENT_STATUS_LABELS[alert.clientStatus]}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{alert.contact?.name || 'No contact'}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium text-white rounded ${colors.badge} capitalize ml-2`}>
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
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">{alert.invoices?.length || 0} invoice(s)</p>
          {alert.scheduledReminders?.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
              {alert.scheduledReminders.length} pending reminder
            </span>
          )}
        </div>
        <AIRoutingBadge alert={alert} alertType="ar" compact />
      </div>
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
        <div className="flex items-center gap-2">
          <AIRoutingBadge alert={alert} alertType="expense" compact />
          <span className={`px-2 py-1 text-xs font-medium text-white rounded ${colors.badge} capitalize`}>
            {alert.severity}
          </span>
        </div>
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
function AlertDetailPanel({ alert, type, onClose, onMarkHandled, onSnooze, onDismiss, onOpenDraft }) {
  const [actionNote, setActionNote] = useState('')
  const [snoozeDuration, setSnoozeDuration] = useState(SNOOZE_OPTIONS[0].days)
  const [dismissReason, setDismissReason] = useState('')
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false)
  const [showDismissOptions, setShowDismissOptions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAIInsights, setShowAIInsights] = useState(true)

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
          {/* AI Insights Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                AI Insights
              </span>
              <svg className={`w-4 h-4 transition-transform ${showAIInsights ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAIInsights && (
              <AIInsightsPanel
                alert={alert}
                alertType={type}
                onDraftEmail={() => onOpenDraft?.(alert, type)}
              />
            )}
          </div>

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

// Main App Component - Inner (wrapped by AIProvider)
function AppContent() {
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [selectedAlertType, setSelectedAlertType] = useState(null)
  const [toast, setToast] = useState(null)

  // Onboarding state
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem('sentinel_welcome_dismissed') !== 'true'
  })
  const [showImpactPanel, setShowImpactPanel] = useState(false)

  // AI-related state
  const [showCommandBar, setShowCommandBar] = useState(false)
  const [showDraftPanel, setShowDraftPanel] = useState(false)
  const [showAIActivityLog, setShowAIActivityLog] = useState(false)
  const [showMessageViewer, setShowMessageViewer] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [draftAlert, setDraftAlert] = useState(null)
  const [draftAlertType, setDraftAlertType] = useState(null)

  // Keyboard shortcut for command bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandBar(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Listen for viewSentMessage events
  useEffect(() => {
    const handleViewMessage = (e) => {
      // Find the message by ID from the AI context
      // For now, just open the activity log
      setShowAIActivityLog(true)
    }

    window.addEventListener('viewSentMessage', handleViewMessage)
    return () => window.removeEventListener('viewSentMessage', handleViewMessage)
  }, [])

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
    resetAllOnboarding()
    refetchAR()
    refetchExpense()
    refetchRules()
    setShowWelcome(true)
    showToast('Demo data has been reset')
  }

  // AI Handlers
  const handleOpenDraft = (alert, alertType) => {
    setDraftAlert(alert)
    setDraftAlertType(alertType)
    setShowDraftPanel(true)
  }

  const handleDraftSent = (message) => {
    showToast(`Message sent to ${message.recipient}`)
  }

  const handleCommandAction = (result) => {
    // Handle command actions
    if (!selectedAlert) {
      showToast('Please select an alert first')
      return
    }

    switch (result.action) {
      case 'snooze':
        handleSnooze(selectedAlert.id, result.parameters?.days || 1)
        break
      case 'mark_handled':
        handleMarkHandled(selectedAlert.id, result.parameters?.note)
        break
      case 'assign':
        showToast(`Assigned to ${result.parameters?.assignee}`)
        break
      case 'draft_email':
        handleOpenDraft(selectedAlert, selectedAlertType)
        break
      default:
        showToast(`Action: ${result.action}`)
    }
  }

  const handleViewMessage = (message) => {
    setSelectedMessage(message)
    setShowMessageViewer(true)
    setShowAIActivityLog(false)
  }

  const handleBucketClick = (bucket) => {
    // Navigate to AR alerts filtered by bucket
    setActiveView('ar-alerts')
    // Could add bucket filter state here if needed
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
            showToast={showToast}
            onBucketClick={handleBucketClick}
            onShowImpact={() => setShowImpactPanel(true)}
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

  // Show welcome screen if not dismissed
  if (showWelcome) {
    return (
      <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onResetData={handleResetData}
          onOpenAIActivity={() => setShowAIActivityLog(true)}
          onShowImpact={() => setShowImpactPanel(true)}
          onShowWelcome={() => setShowWelcome(true)}
        />
        <main className="flex-1 bg-[#f1f5f9] p-8 overflow-y-auto pb-20">
          {renderView()}
        </main>
      </div>

      {/* ROI Summary Bar at bottom */}
      <ROISummaryBar onSeeFullReport={() => setShowImpactPanel(true)} />

      {selectedAlert && (
        <AlertDetailPanel
          alert={selectedAlert}
          type={selectedAlertType}
          onClose={handleClosePanel}
          onMarkHandled={handleMarkHandled}
          onSnooze={handleSnooze}
          onDismiss={handleDismiss}
          onOpenDraft={handleOpenDraft}
        />
      )}

      {/* AI Modals */}
      <CommandBar
        isOpen={showCommandBar}
        onClose={() => setShowCommandBar(false)}
        currentAlert={selectedAlert}
        alertType={selectedAlertType}
        onAction={handleCommandAction}
      />

      <DraftPanel
        isOpen={showDraftPanel}
        onClose={() => setShowDraftPanel(false)}
        alert={draftAlert}
        alertType={draftAlertType}
        onSend={handleDraftSent}
      />

      <AIActivityLog
        isOpen={showAIActivityLog}
        onClose={() => setShowAIActivityLog(false)}
        onViewMessage={handleViewMessage}
      />

      <MessageViewer
        isOpen={showMessageViewer}
        onClose={() => setShowMessageViewer(false)}
        message={selectedMessage}
      />

      {/* Impact Comparison Panel */}
      <ImpactComparisonPanel
        isOpen={showImpactPanel}
        onClose={() => setShowImpactPanel(false)}
      />

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

// Main App Component - Wrapper with AIProvider
function App() {
  return (
    <AIProvider>
      <AppContent />
    </AIProvider>
  )
}

export default App
