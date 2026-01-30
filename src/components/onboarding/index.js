/**
 * Onboarding Components
 *
 * Product context, guided experience, and ROI demonstration components
 * for the Sentinel CPA Alerts prototype.
 */

export { WelcomeScreen, resetWelcomeScreen } from './WelcomeScreen'
export { DemoContextBanner, resetDemoBanner } from './DemoContextBanner'
export {
  SectionCallout,
  AlertTooltip,
  CALLOUT_CONTENT,
  TOOLTIP_CONTENT,
  resetCallouts
} from './SectionCallout'
export { ImpactComparisonPanel, ImpactButton } from './ImpactComparisonPanel'
export { ROISummaryBar, ROISummaryCompact } from './ROISummaryBar'

/**
 * Reset all onboarding state
 * Useful for demo resets
 */
export function resetAllOnboarding() {
  localStorage.removeItem('sentinel_welcome_dismissed')
  localStorage.removeItem('sentinel_demo_banner_dismissed')

  // Reset all callout dismissals
  const calloutKeys = ['arAging', 'expenseAnomaly', 'timesheetReminder']
  calloutKeys.forEach(key => {
    localStorage.removeItem(`sentinel_callout_${key}_dismissed`)
  })

  // Reset tooltip dismissals
  const tooltipTypes = ['arReminder', 'expenseAnomaly', 'timesheetGap']
  tooltipTypes.forEach(type => {
    localStorage.removeItem(`sentinel_tooltip_${type}_dismissed`)
  })
}
