/**
 * Mock AI Responses
 *
 * Used when no API key is available or for testing.
 * Returns realistic pre-generated responses.
 */

// Simulate network delay
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms + Math.random() * 400))

/**
 * Generate mock enrichment for AR alerts
 */
export const mockAREnrichment = async (alert) => {
  await delay()

  const isHighRisk = alert.daysOverdue > 60 || alert.overdueAmount > 30000
  const isMediumRisk = alert.daysOverdue > 30 || alert.overdueAmount > 15000

  return {
    summary: isHighRisk
      ? `Critical attention needed: ${alert.clientName} has $${alert.overdueAmount.toLocaleString()} outstanding for ${alert.daysOverdue} days. This represents significant cash flow impact and potential write-off risk.`
      : `${alert.clientName} has an overdue balance that needs follow-up. Based on the amount and timing, this should be addressed ${isMediumRisk ? 'this week' : 'within standard collection cycle'}.`,

    riskLevel: isHighRisk ? 'high' : isMediumRisk ? 'medium' : 'low',

    riskFactors: [
      alert.daysOverdue > 60 && 'Significantly past standard payment terms',
      alert.overdueAmount > 25000 && 'Large outstanding balance',
      alert.invoices?.length > 2 && 'Multiple invoices outstanding',
      alert.daysOverdue > 45 && 'Approaching 60-day threshold',
    ].filter(Boolean),

    recommendedAction: {
      action: isHighRisk ? 'call' : alert.daysOverdue > 30 ? 'email' : 'wait',
      description: isHighRisk
        ? `Call ${alert.contact?.name || 'the client'} directly to discuss payment timeline`
        : alert.daysOverdue > 30
          ? 'Send a firm but professional follow-up email'
          : 'Send a friendly payment reminder',
      reasoning: isHighRisk
        ? 'Phone calls have 3x higher resolution rate for accounts over 60 days. Direct conversation allows you to understand any issues and negotiate if needed.'
        : 'Email follow-up is appropriate for this stage. It documents the communication and gives the client time to respond.',
      urgency: isHighRisk ? 'immediate' : isMediumRisk ? 'today' : 'this_week'
    },

    patterns: [
      alert.daysOverdue > 45 && {
        type: 'late_payment',
        description: `This account is ${alert.daysOverdue} days overdue, suggesting a pattern of delayed payment or potential cash flow issues at the client.`
      },
      alert.invoices?.length > 2 && {
        type: 'increasing_balance',
        description: `Multiple invoices (${alert.invoices.length}) are outstanding, indicating the balance is accumulating rather than being paid down.`
      }
    ].filter(Boolean),

    clientInsights: {
      paymentBehavior: alert.daysOverdue > 60
        ? 'This client appears to have payment challenges. Consider requiring deposits or shorter payment terms for future work.'
        : 'Payment behavior within normal range for this industry. Most clients pay within 45 days.',
      relationshipContext: 'This is an established client relationship. Balance firmness with maintaining the relationship.',
      communicationTip: isHighRisk
        ? 'Be direct but professional. Acknowledge any difficulties they may be facing and focus on finding a solution.'
        : 'Keep the tone friendly and assume positive intent. A simple reminder often resolves these situations.'
    },

    suggestedFollowUp: isHighRisk
      ? 'If no response within 48 hours, escalate to partner review and consider formal collection procedures.'
      : 'Follow up in one week if no payment received. Consider phone call if email goes unanswered.'
  }
}

/**
 * Generate mock enrichment for expense alerts
 */
export const mockExpenseEnrichment = async (alert) => {
  await delay()

  const isHighRisk = alert.variancePercent > 50
  const isMediumRisk = alert.variancePercent > 30

  const variance = alert.actualAmount - alert.budgetAmount

  return {
    summary: isHighRisk
      ? `Significant budget variance in ${alert.category}: ${alert.variancePercent}% over budget ($${variance.toLocaleString()}). This requires immediate review to understand the cause and prevent future overruns.`
      : `${alert.category} is ${alert.variancePercent}% over budget for ${alert.period}. Review the drivers to determine if this is a one-time occurrence or trend.`,

    riskLevel: isHighRisk ? 'high' : isMediumRisk ? 'medium' : 'low',

    riskFactors: [
      alert.variancePercent > 50 && 'Variance exceeds 50% of budget',
      variance > 3000 && 'Dollar amount is material',
      alert.drivers?.length > 2 && 'Multiple expense drivers contributing',
    ].filter(Boolean),

    recommendedAction: {
      action: isHighRisk ? 'investigate' : 'approve',
      description: isHighRisk
        ? 'Review each expense driver with the responsible team member to understand necessity and explore alternatives'
        : 'Document the variance reason and monitor next month',
      reasoning: isHighRisk
        ? 'A variance of this magnitude needs to be understood before it becomes a recurring pattern. Early investigation prevents future budget surprises.'
        : 'This variance is within acceptable range. Documenting the reason helps with future budgeting.',
      urgency: isHighRisk ? 'today' : 'this_week'
    },

    patterns: [
      {
        type: alert.category.includes('Software') ? 'recurring' : 'one_time',
        description: alert.category.includes('Software')
          ? 'Software costs tend to increase annually. Consider negotiating multi-year contracts for better rates.'
          : 'This appears to be driven by specific one-time factors rather than a systemic issue.'
      }
    ],

    budgetInsights: {
      likelyCause: alert.drivers?.[0]
        ? `Primary driver is ${alert.drivers[0].name} ($${alert.drivers[0].amount.toLocaleString()}). ${alert.drivers[0].note || ''}`
        : 'Unable to determine primary cause without expense details.',
      futureImpact: isHighRisk
        ? 'If this trend continues, annual budget will be exceeded by approximately $' + (variance * 12).toLocaleString()
        : 'Limited future impact expected if this is a one-time occurrence.',
      adjustmentRecommendation: isHighRisk
        ? 'Consider revising budget for this category based on actual spending patterns.'
        : 'Current budget appears adequate. Monitor for the next 2-3 months before adjusting.'
    },

    suggestedFollowUp: 'Review this category again in 30 days to confirm the variance pattern.'
  }
}

/**
 * Generate mock routing decision
 */
export const mockRouting = async (alert, alertType, teamMembers) => {
  await delay(600)

  // Simple routing logic for mock
  const isHighValue = alertType === 'ar'
    ? alert.overdueAmount > 30000
    : alert.variancePercent > 50

  // Pick team member based on simple rules
  let assigned = teamMembers[0]
  let reasoning = ''

  if (alertType === 'ar') {
    // Check for client relationship
    const hasRelationship = teamMembers.find(tm =>
      tm.clientRelationships?.some(c =>
        alert.clientName.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(alert.clientName.split(' ')[0].toLowerCase())
      )
    )

    if (hasRelationship) {
      assigned = hasRelationship
      reasoning = `${assigned.name} has an existing relationship with ${alert.clientName} and has handled their accounts before. Continuity in client communication improves resolution rates.`
    } else if (isHighValue) {
      assigned = teamMembers.find(tm => tm.role.includes('Senior') || tm.role.includes('Manager')) || teamMembers[0]
      reasoning = `High-value receivable ($${alert.overdueAmount.toLocaleString()}) routed to ${assigned.name} due to their seniority and experience with complex collection situations.`
    } else {
      assigned = teamMembers.find(tm => tm.expertise?.includes('Collections')) || teamMembers[0]
      reasoning = `Standard AR alert routed to ${assigned.name} based on their collections expertise and current workload capacity.`
    }
  } else {
    // Expense alerts
    if (alert.category.includes('Software')) {
      assigned = teamMembers.find(tm => tm.expertise?.includes('Technology')) || teamMembers[0]
      reasoning = `Software expense variance routed to ${assigned.name} due to their technology and vendor management expertise.`
    } else {
      assigned = teamMembers.find(tm => tm.expertise?.includes('Budgeting')) || teamMembers[0]
      reasoning = `Budget variance routed to ${assigned.name} who handles expense analysis and budget reviews.`
    }
  }

  const alternatives = teamMembers
    .filter(tm => tm.id !== assigned.id)
    .slice(0, 2)
    .map(tm => ({
      id: tm.id,
      name: tm.name,
      reason: `Also qualified based on ${tm.expertise?.[0] || 'general'} expertise`
    }))

  return {
    assignedTo: {
      id: assigned.id,
      name: assigned.name
    },
    reasoning,
    confidence: isHighValue || alertType === 'ar' ? 'high' : 'medium',
    alternatives
  }
}

/**
 * Generate mock command parsing
 */
export const mockCommandParse = async (command, currentAlert, teamMembers) => {
  await delay(400)

  const lowerCommand = command.toLowerCase()

  // Simple keyword matching
  if (lowerCommand.includes('snooze')) {
    const daysMatch = lowerCommand.match(/(\d+)\s*(day|week|month)/i)
    let days = 7
    if (daysMatch) {
      const num = parseInt(daysMatch[1])
      const unit = daysMatch[2].toLowerCase()
      days = unit === 'week' ? num * 7 : unit === 'month' ? num * 30 : num
    }
    return {
      action: 'snooze',
      parameters: { duration: days },
      needsClarification: false,
      parsedIntent: `Snooze this alert for ${days} days`
    }
  }

  if (lowerCommand.includes('dismiss') || lowerCommand.includes('resolve')) {
    return {
      action: 'dismiss',
      parameters: { reason: 'Resolved per user request' },
      needsClarification: false,
      parsedIntent: 'Dismiss this alert as resolved'
    }
  }

  if (lowerCommand.includes('assign') || lowerCommand.includes('route')) {
    const memberMatch = teamMembers.find(tm =>
      lowerCommand.includes(tm.name.toLowerCase().split(' ')[0])
    )
    if (memberMatch) {
      return {
        action: 'assign',
        parameters: { assigneeId: memberMatch.id },
        needsClarification: false,
        parsedIntent: `Assign this alert to ${memberMatch.name}`
      }
    }
    return {
      action: 'assign',
      parameters: {},
      needsClarification: true,
      clarificationQuestion: 'Who would you like to assign this to? Available: ' + teamMembers.map(tm => tm.name).join(', ')
    }
  }

  if (lowerCommand.includes('email') || lowerCommand.includes('draft') || lowerCommand.includes('send')) {
    const tone = lowerCommand.includes('urgent') ? 'urgent'
      : lowerCommand.includes('firm') ? 'firm'
        : 'friendly'
    return {
      action: 'draft_email',
      parameters: { emailTone: tone },
      needsClarification: false,
      parsedIntent: `Draft a ${tone} follow-up email`
    }
  }

  if (lowerCommand.includes('history') || lowerCommand.includes('background')) {
    return {
      action: 'get_history',
      parameters: {},
      needsClarification: false,
      parsedIntent: 'Show client history and background'
    }
  }

  if (lowerCommand.includes('handled') || lowerCommand.includes('done') || lowerCommand.includes('complete')) {
    return {
      action: 'mark_handled',
      parameters: {},
      needsClarification: false,
      parsedIntent: 'Mark this alert as handled'
    }
  }

  return {
    action: 'unknown',
    parameters: {},
    needsClarification: true,
    clarificationQuestion: "I didn't understand that command. Try: snooze, dismiss, assign, draft email, or mark handled."
  }
}

/**
 * Generate mock email draft
 */
export const mockDraftEmail = async (alert, alertType, tone, senderName) => {
  await delay(1000)

  if (alertType === 'ar') {
    const invoiceList = alert.invoices?.map(inv =>
      `  • Invoice ${inv.number}: $${inv.amount.toLocaleString()}`
    ).join('\n') || '  • Invoice details attached'

    const toneOpening = {
      friendly: `I hope this message finds you well. I'm reaching out regarding your account with us.`,
      firm: `I'm writing to follow up on outstanding invoices that require your attention.`,
      urgent: `This is an urgent matter regarding your account that requires immediate attention.`
    }

    const toneClosing = {
      friendly: `Please let me know if you have any questions or if there's anything I can help with. We value your business and want to ensure everything is in order.`,
      firm: `Please arrange payment within the next 5 business days. If there are any issues preventing timely payment, please contact me immediately so we can discuss options.`,
      urgent: `This matter requires resolution within 48 hours. Please call me directly at your earliest convenience to discuss. If we don't hear from you, we may need to escalate this matter.`
    }

    return {
      subject: tone === 'urgent'
        ? `URGENT: Outstanding Balance - $${alert.overdueAmount.toLocaleString()} Past Due`
        : `Payment Reminder - Invoice${alert.invoices?.length > 1 ? 's' : ''} Past Due`,
      body: `Dear ${alert.contact?.name || 'Accounts Payable Team'},

${toneOpening[tone]}

Our records show the following invoice${alert.invoices?.length > 1 ? 's are' : ' is'} currently outstanding:

${invoiceList}

Total Amount Due: $${alert.overdueAmount.toLocaleString()}
Days Past Due: ${alert.daysOverdue}

${toneClosing[tone]}

Best regards,
${senderName}`,
      to: alert.contact?.email || 'accounts@client.com',
      toName: alert.contact?.name || 'Accounts Payable',
      summary: `${tone.charAt(0).toUpperCase() + tone.slice(1)} payment reminder for $${alert.overdueAmount.toLocaleString()} overdue`
    }
  } else {
    // Expense alert - internal memo
    return {
      subject: `Budget Variance Report: ${alert.category} - ${alert.period}`,
      body: `Team,

I wanted to flag a budget variance in ${alert.category} for ${alert.period}.

Summary:
  • Budget: $${alert.budgetAmount.toLocaleString()}
  • Actual: $${alert.actualAmount.toLocaleString()}
  • Variance: +${alert.variancePercent}% ($${(alert.actualAmount - alert.budgetAmount).toLocaleString()} over)

Key Drivers:
${alert.drivers?.map(d => `  • ${d.name}: $${d.amount.toLocaleString()}`).join('\n') || '  • Details pending review'}

${alert.notes || 'Please review and let me know if you need additional information.'}

Best,
${senderName}`,
      to: 'management@firm.com',
      toName: 'Management Team',
      summary: `Internal memo regarding ${alert.variancePercent}% budget variance in ${alert.category}`
    }
  }
}

export default {
  mockAREnrichment,
  mockExpenseEnrichment,
  mockRouting,
  mockCommandParse,
  mockDraftEmail,
}
