/**
 * AI Prompt Templates
 *
 * Centralized location for all Claude prompts.
 * Keeping prompts here makes them easy to iterate on.
 */

/**
 * System prompt for alert enrichment
 */
export const ENRICHMENT_SYSTEM_PROMPT = `You are an AI assistant for a CPA firm's financial alert system. Your role is to analyze accounts receivable and expense alerts to provide actionable insights for the accounting team.

You have deep knowledge of:
- CPA firm client relationships and typical payment patterns
- Accounts receivable best practices
- Business context clues that indicate urgency or risk
- Communication strategies for collections

Be specific, reference actual data points, and provide reasoning for your recommendations. Your tone should be professional but practical - you're helping accountants do their jobs better.

Always respond with valid JSON matching the requested schema.`

/**
 * Build user message for AR alert enrichment
 */
export const buildAREnrichmentPrompt = (alert, teamMembers, clientHistory) => {
  return `Analyze this accounts receivable alert and provide actionable insights.

## ALERT DATA
- Client: ${alert.clientName}
- Total Overdue: $${alert.overdueAmount.toLocaleString()}
- Days Overdue: ${alert.daysOverdue}
- Current Severity: ${alert.severity}
- Number of Invoices: ${alert.invoices?.length || 0}
- Contact: ${alert.contact?.name || 'Unknown'} (${alert.contact?.email || 'No email'})

## INVOICES
${alert.invoices?.map(inv => `- ${inv.number}: $${inv.amount.toLocaleString()} - ${inv.description} (Due: ${inv.dueDate})`).join('\n') || 'No invoice details'}

## EXISTING NOTES
${alert.notes || 'No notes'}

## CLIENT HISTORY
${clientHistory || 'No previous history available'}

## TEAM CONTEXT
Available team members:
${teamMembers.map(tm => `- ${tm.name} (${tm.role}): ${tm.expertise.join(', ')}`).join('\n')}

## RESPOND WITH JSON
{
  "summary": "1-2 sentence explanation of why this alert matters and what's at stake",
  "riskLevel": "high" | "medium" | "low",
  "riskFactors": ["list", "of", "specific", "risk", "factors"],
  "recommendedAction": {
    "action": "call" | "email" | "escalate" | "wait" | "payment_plan",
    "description": "Specific action to take",
    "reasoning": "Why this action is recommended",
    "urgency": "immediate" | "today" | "this_week" | "next_week"
  },
  "patterns": [
    {
      "type": "late_payment" | "increasing_balance" | "communication_gap" | "seasonal" | "dispute",
      "description": "Description of the pattern observed"
    }
  ],
  "clientInsights": {
    "paymentBehavior": "What we know about how this client typically pays",
    "relationshipContext": "Relevant context about the client relationship",
    "communicationTip": "Best way to communicate with this client"
  },
  "suggestedFollowUp": "Specific follow-up action if the recommended action doesn't resolve it"
}`
}

/**
 * Build user message for expense alert enrichment
 */
export const buildExpenseEnrichmentPrompt = (alert, teamMembers, budgetHistory) => {
  return `Analyze this expense variance alert and provide actionable insights.

## ALERT DATA
- Category: ${alert.category}
- Period: ${alert.period}
- Budget: $${alert.budgetAmount.toLocaleString()}
- Actual: $${alert.actualAmount.toLocaleString()}
- Variance: ${alert.variancePercent}% over budget ($${(alert.actualAmount - alert.budgetAmount).toLocaleString()})
- Current Severity: ${alert.severity}

## TOP EXPENSE DRIVERS
${alert.drivers?.map(d => `- ${d.name}: $${d.amount.toLocaleString()} (${d.vendor || 'Unknown vendor'}) - ${d.note || 'No note'}`).join('\n') || 'No driver details'}

## EXISTING NOTES
${alert.notes || 'No notes'}

## BUDGET HISTORY
${budgetHistory || 'No previous budget history available'}

## TEAM CONTEXT
Available team members:
${teamMembers.map(tm => `- ${tm.name} (${tm.role}): ${tm.expertise.join(', ')}`).join('\n')}

## RESPOND WITH JSON
{
  "summary": "1-2 sentence explanation of why this variance matters",
  "riskLevel": "high" | "medium" | "low",
  "riskFactors": ["list", "of", "specific", "risk", "factors"],
  "recommendedAction": {
    "action": "investigate" | "approve" | "adjust_budget" | "reduce_spending" | "defer",
    "description": "Specific action to take",
    "reasoning": "Why this action is recommended",
    "urgency": "immediate" | "today" | "this_week" | "next_week"
  },
  "patterns": [
    {
      "type": "seasonal" | "one_time" | "recurring" | "trend" | "vendor_issue",
      "description": "Description of the pattern observed"
    }
  ],
  "budgetInsights": {
    "likelyCause": "Most likely cause of the variance",
    "futureImpact": "Expected impact on future months",
    "adjustmentRecommendation": "Whether budget should be adjusted"
  },
  "suggestedFollowUp": "Specific follow-up action to monitor this category"
}`
}

/**
 * System prompt for alert routing
 */
export const ROUTING_SYSTEM_PROMPT = `You are an AI assistant that routes financial alerts to the most appropriate team member at a CPA firm.

Consider:
- Client relationships (who has worked with this client before)
- Expertise match (who has relevant skills for this type of issue)
- Current workload (don't overload one person)
- Urgency and amount (senior staff for high-stakes situations)

Be decisive and explain your reasoning clearly. Always respond with valid JSON.`

/**
 * Build user message for alert routing
 */
export const buildRoutingPrompt = (alert, alertType, teamMembers) => {
  const alertSummary = alertType === 'ar'
    ? `AR Alert: ${alert.clientName} - $${alert.overdueAmount.toLocaleString()} overdue (${alert.daysOverdue} days)`
    : `Expense Alert: ${alert.category} - ${alert.variancePercent}% over budget ($${(alert.actualAmount - alert.budgetAmount).toLocaleString()})`

  return `Route this alert to the most appropriate team member.

## ALERT
${alertSummary}
Severity: ${alert.severity}

## TEAM MEMBERS
${teamMembers.map(tm => `
### ${tm.name}
- Role: ${tm.role}
- Expertise: ${tm.expertise.join(', ')}
- Current Workload: ${tm.workload} active alerts
- Client Relationships: ${tm.clientRelationships?.join(', ') || 'None specified'}
`).join('\n')}

## RESPOND WITH JSON
{
  "assignedTo": {
    "id": "team member ID",
    "name": "team member name"
  },
  "reasoning": "2-3 sentences explaining why this person was chosen",
  "confidence": "high" | "medium" | "low",
  "alternatives": [
    {
      "id": "alternative team member ID",
      "name": "alternative name",
      "reason": "Why they would also be a good fit"
    }
  ]
}`
}

/**
 * System prompt for natural language command parsing
 */
export const COMMAND_SYSTEM_PROMPT = `You are an AI assistant that interprets natural language commands for a CPA firm's alert management system.

Available actions:
- snooze: Delay an alert (requires duration)
- dismiss: Mark alert as resolved (requires reason)
- assign: Route to a team member
- draft_email: Generate a follow-up email
- mark_handled: Mark as addressed
- get_history: Show client history
- prioritize: Change alert priority

Parse the user's intent and extract parameters. If the command is unclear, set needsClarification to true.

Always respond with valid JSON.`

/**
 * Build user message for command parsing
 */
export const buildCommandPrompt = (command, currentAlert, teamMembers) => {
  const alertContext = currentAlert
    ? `Current alert: ${currentAlert.clientName || currentAlert.category} - ${currentAlert.severity} severity`
    : 'No alert currently selected'

  return `Parse this command: "${command}"

## CONTEXT
${alertContext}

## AVAILABLE TEAM MEMBERS
${teamMembers.map(tm => `- ${tm.name} (${tm.id})`).join('\n')}

## RESPOND WITH JSON
{
  "action": "snooze" | "dismiss" | "assign" | "draft_email" | "mark_handled" | "get_history" | "prioritize" | "unknown",
  "parameters": {
    "duration": "number of days (for snooze)",
    "reason": "string (for dismiss)",
    "assigneeId": "team member ID (for assign)",
    "emailTone": "friendly" | "firm" | "urgent" (for draft_email)",
    "priority": "high" | "medium" | "low" (for prioritize)"
  },
  "needsClarification": false,
  "clarificationQuestion": "Question to ask if unclear",
  "parsedIntent": "Human-readable description of what will happen"
}`
}

/**
 * System prompt for email drafting
 */
export const DRAFT_EMAIL_SYSTEM_PROMPT = `You are an AI assistant that drafts professional collection and follow-up emails for a CPA firm.

Your emails should be:
- Professional but warm
- Clear about the ask
- Include specific details (invoice numbers, amounts, dates)
- Appropriate to the relationship and situation
- Action-oriented with clear next steps

Match the tone to the situation:
- "friendly": Gentle reminder, assume good intent
- "firm": Clear expectations, deadline-focused
- "urgent": Serious tone, escalation implied

Always respond with valid JSON.`

/**
 * Build user message for email drafting
 */
export const buildDraftEmailPrompt = (alert, alertType, tone, senderName) => {
  if (alertType === 'ar') {
    return `Draft a ${tone} collection email for this overdue account.

## ALERT DETAILS
- Client: ${alert.clientName}
- Contact: ${alert.contact?.name || 'Accounts Payable'}
- Email: ${alert.contact?.email || 'Unknown'}
- Total Overdue: $${alert.overdueAmount.toLocaleString()}
- Days Overdue: ${alert.daysOverdue}

## INVOICES
${alert.invoices?.map(inv => `- ${inv.number}: $${inv.amount.toLocaleString()} - ${inv.description}`).join('\n') || 'Invoice details not available'}

## CONTEXT
${alert.notes || 'No additional context'}

## SENDER
${senderName}

## RESPOND WITH JSON
{
  "subject": "Email subject line",
  "body": "Full email body with proper formatting",
  "to": "Recipient email",
  "toName": "Recipient name",
  "summary": "One sentence summary of the email"
}`
  } else {
    return `Draft a ${tone} internal memo about this expense variance.

## ALERT DETAILS
- Category: ${alert.category}
- Period: ${alert.period}
- Variance: ${alert.variancePercent}% over budget
- Amount Over: $${(alert.actualAmount - alert.budgetAmount).toLocaleString()}

## TOP DRIVERS
${alert.drivers?.map(d => `- ${d.name}: $${d.amount.toLocaleString()}`).join('\n') || 'No driver details'}

## CONTEXT
${alert.notes || 'No additional context'}

## SENDER
${senderName}

## RESPOND WITH JSON
{
  "subject": "Memo subject line",
  "body": "Full memo body with proper formatting",
  "to": "management@firm.com",
  "toName": "Management Team",
  "summary": "One sentence summary of the memo"
}`
  }
}
