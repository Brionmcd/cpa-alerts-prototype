/**
 * Email Templates for AR Reminders
 *
 * Templates designed to address partner concerns:
 * - Multiple tone options (friendly, professional, firm)
 * - "Billing Committee" mode for less personal outreach
 * - Aiwyn payment portal integration
 * - Escalation-appropriate language
 */

import { REMINDER_TONES } from './types'

/**
 * Generate subject line based on tone and trigger level
 */
export const generateSubject = (tone, triggerDays, clientName, invoiceNumbers) => {
  const invoiceRef = invoiceNumbers?.length > 1
    ? `Invoices ${invoiceNumbers.slice(0, 2).join(', ')}${invoiceNumbers.length > 2 ? '...' : ''}`
    : `Invoice ${invoiceNumbers?.[0] || ''}`

  const subjects = {
    [REMINDER_TONES.FRIENDLY]: {
      60: `Friendly Reminder: ${invoiceRef} - ${clientName}`,
      90: `Following Up: Outstanding Balance - ${clientName}`,
      120: `Important: Account Status Review Needed - ${clientName}`,
    },
    [REMINDER_TONES.PROFESSIONAL]: {
      60: `Payment Reminder: ${invoiceRef} - ${clientName}`,
      90: `Second Notice: Outstanding Balance - ${clientName}`,
      120: `Urgent: Past Due Account Requires Attention - ${clientName}`,
    },
    [REMINDER_TONES.FIRM]: {
      60: `Action Required: ${invoiceRef} Past Due`,
      90: `Immediate Attention Required: Outstanding Balance`,
      120: `Final Notice: Account Seriously Past Due`,
    },
  }

  const toneSubjects = subjects[tone] || subjects[REMINDER_TONES.PROFESSIONAL]
  if (triggerDays >= 120) return toneSubjects[120]
  if (triggerDays >= 90) return toneSubjects[90]
  return toneSubjects[60]
}

/**
 * Generate email body based on tone, trigger level, and options
 */
export const generateBody = ({
  tone,
  triggerDays,
  clientName,
  contactName,
  overdueAmount,
  daysOverdue,
  invoices,
  aiywynPaymentUrl,
  firmName = 'Johnson & Associates CPA',
  fromBillingCommittee = false,
  ccEscalation = false,
  escalationName = null,
}) => {
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)

  const invoiceList = invoices?.map(inv =>
    `  • ${inv.number}: ${formatCurrency(inv.amount)} (Due: ${inv.dueDate})`
  ).join('\n') || ''

  // Opening salutation
  const greeting = `Dear ${contactName},`

  // Friendly tone templates
  if (tone === REMINDER_TONES.FRIENDLY) {
    if (triggerDays < 90) {
      return `${greeting}

I hope this message finds you well. I wanted to reach out as a friendly reminder regarding your account with ${firmName}.

Our records show the following invoice(s) are currently outstanding:

${invoiceList}

Total Outstanding: ${formatCurrency(overdueAmount)}

We understand that invoices can sometimes slip through the cracks, and we're here to help if you have any questions about these charges or need to discuss payment arrangements.

For your convenience, you can view your invoices and make a payment through our secure client portal:
${aiywynPaymentUrl}

Please don't hesitate to reach out if there's anything we can assist with.

Warm regards,
${fromBillingCommittee ? `${firmName} Billing Department` : firmName}`
    } else {
      return `${greeting}

I hope you're doing well. I'm following up on our previous correspondence regarding the outstanding balance on your account.

${invoiceList}

Total Outstanding: ${formatCurrency(overdueAmount)} (${daysOverdue} days past due)

We value our relationship with ${clientName} and want to ensure there are no issues preventing payment. If there's been an oversight, a question about the services, or if you'd like to discuss a payment arrangement, please let us know.

You can access your account and make a payment here:
${aiywynPaymentUrl}

Thank you for your attention to this matter.

Best regards,
${fromBillingCommittee ? `${firmName} Billing Department` : firmName}`
    }
  }

  // Professional tone templates
  if (tone === REMINDER_TONES.PROFESSIONAL) {
    if (triggerDays < 90) {
      return `${greeting}

${fromBillingCommittee
  ? `Per our firm's accounts receivable policy, we are contacting you regarding an outstanding balance on your account.`
  : `This is a reminder regarding the following outstanding invoice(s) on your account with ${firmName}.`}

${invoiceList}

Total Outstanding: ${formatCurrency(overdueAmount)}
Days Past Due: ${daysOverdue}

Please remit payment at your earliest convenience. You can view invoice details and submit payment through our secure client portal:

${aiywynPaymentUrl}

If payment has already been sent, please disregard this notice. Should you have any questions or wish to discuss payment terms, please contact our office.

${fromBillingCommittee
  ? `Sincerely,\n${firmName} Billing Committee`
  : `Sincerely,\n${firmName}`}`
    } else {
      return `${greeting}

${fromBillingCommittee
  ? `Per firm policy, this is our second notice regarding a significantly past-due balance on your account.`
  : `We are following up on our previous communication regarding the past-due balance on your account.`}

${invoiceList}

Total Outstanding: ${formatCurrency(overdueAmount)}
Days Past Due: ${daysOverdue}

This balance is now significantly overdue. We kindly request that you arrange for payment or contact us immediately to discuss this matter.

Payment Portal: ${aiywynPaymentUrl}

${ccEscalation && escalationName
  ? `We have also copied ${escalationName} on this correspondence for visibility.`
  : ''}

If there are circumstances affecting your ability to pay, we are open to discussing alternative arrangements. However, prompt action is required.

${fromBillingCommittee
  ? `Respectfully,\n${firmName} Billing Committee`
  : `Respectfully,\n${firmName}`}`
    }
  }

  // Firm tone templates
  if (tone === REMINDER_TONES.FIRM) {
    if (triggerDays < 90) {
      return `${greeting}

This notice is to inform you that your account has an outstanding balance that requires immediate attention.

${invoiceList}

Total Outstanding: ${formatCurrency(overdueAmount)}
Days Past Due: ${daysOverdue}

Payment is due immediately. Please submit payment through our secure portal:
${aiywynPaymentUrl}

If you have questions about these invoices or need to arrange a payment plan, contact our office right away.

${fromBillingCommittee
  ? `${firmName} Billing Department`
  : firmName}`
    } else {
      return `${greeting}

IMPORTANT: Your account with ${firmName} is now seriously past due and requires your immediate attention.

${invoiceList}

Total Outstanding: ${formatCurrency(overdueAmount)}
Days Past Due: ${daysOverdue}

Despite our previous notices, this balance remains unpaid. We must receive payment or hear from you within the next 10 business days regarding payment arrangements.

Payment Portal: ${aiywynPaymentUrl}

${ccEscalation && escalationName
  ? `${escalationName} has been copied on this notice.`
  : ''}

Failure to respond may necessitate further action, which we would prefer to avoid. Please contact us immediately to resolve this matter.

${fromBillingCommittee
  ? `${firmName} Billing Committee`
  : firmName}`
    }
  }

  // Default fallback
  return `${greeting}

This is a reminder regarding your outstanding balance of ${formatCurrency(overdueAmount)}.

${invoiceList}

Please submit payment through our portal: ${aiywynPaymentUrl}

Thank you,
${firmName}`
}

/**
 * Get template preview data
 */
export const getTemplatePreview = (options) => {
  return {
    subject: generateSubject(
      options.tone,
      options.triggerDays,
      options.clientName,
      options.invoices?.map(i => i.number)
    ),
    body: generateBody(options),
  }
}

export default {
  generateSubject,
  generateBody,
  getTemplatePreview,
}
