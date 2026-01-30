/**
 * Data generators for realistic mock data
 * Generates dates relative to "today" so data never goes stale
 *
 * Updated to reflect real AR workflow:
 * - Partners deal with owners/CFOs, not AP staff
 * - Multiple contact levels for escalation
 * - Client status categories for automation control
 * - Realistic $7M+ in 90+ day aging
 */

import { SEVERITY, CLIENT_STATUS, REMINDER_STATUS, REMINDER_TONES, REMINDER_TRIGGERS } from '../../types'
import { getCurrentPeriod, getMonthName } from '../../../utils/formatters'

// Partners at the firm
export const PARTNERS = [
  { id: 'partner-001', name: 'Robert Johnson', email: 'rjohnson@firmcpa.com' },
  { id: 'partner-002', name: 'Lisa Martinez', email: 'lmartinez@firmcpa.com' },
  { id: 'partner-003', name: 'James Wilson', email: 'jwilson@firmcpa.com' },
]

// Realistic CPA firm client data with expanded contact hierarchy
// Note: Partners typically deal with owners/CFOs, not AP staff
export const CLIENTS = [
  {
    id: 'client-001',
    name: 'Henderson & Associates LLC',
    industry: 'Professional Services',
    partnerIndex: 0,
    status: CLIENT_STATUS.NORMAL,
    contacts: {
      primary: {
        name: 'Karen Williams',
        email: 'kwilliams@hendersonllc.com',
        phone: '5552345678',
        role: 'AP Coordinator',
        isPrimary: true,
      },
      escalation: {
        name: 'Robert Chen',
        email: 'rchen@hendersonllc.com',
        phone: '5552345600',
        role: 'Controller',
        isPrimary: false,
      },
      owner: {
        name: 'Margaret Henderson',
        email: 'mhenderson@hendersonllc.com',
        phone: '5552345601',
        role: 'Managing Partner',
        isPrimary: false,
      },
    },
  },
  {
    id: 'client-002',
    name: 'Westbrook Manufacturing Inc.',
    industry: 'Manufacturing',
    partnerIndex: 0,
    status: CLIENT_STATUS.SLOW_PAYER, // Known slow payer
    contacts: {
      primary: {
        name: 'Janet Moore',
        email: 'jmoore@westbrookmfg.com',
        phone: '5553456789',
        role: 'Accounts Payable',
        isPrimary: true,
      },
      escalation: {
        name: 'Thomas Burke',
        email: 'tburke@westbrookmfg.com',
        phone: '5553456700',
        role: 'CFO',
        isPrimary: false,
      },
      owner: {
        name: 'David Westbrook',
        email: 'dwestbrook@westbrookmfg.com',
        phone: '5553456701',
        role: 'CEO',
        isPrimary: false,
      },
    },
  },
  {
    id: 'client-003',
    name: 'Pinnacle Real Estate Group',
    industry: 'Real Estate',
    partnerIndex: 1,
    status: CLIENT_STATUS.NORMAL,
    contacts: {
      primary: {
        name: 'Amanda Foster',
        email: 'afoster@pinnaclere.com',
        phone: '5554567890',
        role: 'Office Manager',
        isPrimary: true,
      },
      escalation: {
        name: 'Michael Torres',
        email: 'mtorres@pinnaclere.com',
        phone: '5554567800',
        role: 'CFO',
        isPrimary: false,
      },
      owner: {
        name: 'Sarah Mitchell',
        email: 'smitchell@pinnaclere.com',
        phone: '5554567801',
        role: 'Managing Partner',
        isPrimary: false,
      },
    },
  },
  {
    id: 'client-004',
    name: 'Chen Family Dental Practice',
    industry: 'Healthcare',
    partnerIndex: 1,
    status: CLIENT_STATUS.SENSITIVE, // Long-term relationship, handle carefully
    contacts: {
      primary: {
        name: 'Linda Park',
        email: 'lpark@chenfamilydental.com',
        phone: '5555678901',
        role: 'Practice Manager',
        isPrimary: true,
      },
      escalation: null,
      owner: {
        name: 'Dr. Michael Chen',
        email: 'mchen@chenfamilydental.com',
        phone: '5555678902',
        role: 'Owner',
        isPrimary: false,
      },
    },
  },
  {
    id: 'client-005',
    name: 'Oakwood Senior Living',
    industry: 'Healthcare',
    partnerIndex: 2,
    status: CLIENT_STATUS.PAYMENT_ARRANGEMENT, // On payment plan
    contacts: {
      primary: {
        name: 'Nancy Reynolds',
        email: 'nreynolds@oakwoodliving.com',
        phone: '5556789012',
        role: 'Bookkeeper',
        isPrimary: true,
      },
      escalation: {
        name: 'Patricia Oakes',
        email: 'poakes@oakwoodliving.com',
        phone: '5556789000',
        role: 'Executive Director',
        isPrimary: false,
      },
      owner: null,
    },
  },
  {
    id: 'client-006',
    name: 'Thompson Legal Partners',
    industry: 'Legal Services',
    partnerIndex: 2,
    status: CLIENT_STATUS.NORMAL,
    contacts: {
      primary: {
        name: 'Rebecca Stone',
        email: 'rstone@thompsonlegal.com',
        phone: '5557890123',
        role: 'Office Administrator',
        isPrimary: true,
      },
      escalation: {
        name: 'Mark Davidson',
        email: 'mdavidson@thompsonlegal.com',
        phone: '5557890100',
        role: 'Controller',
        isPrimary: false,
      },
      owner: {
        name: 'Jennifer Thompson',
        email: 'jthompson@thompsonlegal.com',
        phone: '5557890101',
        role: 'Managing Partner',
        isPrimary: false,
      },
    },
  },
  // Additional clients to show the $7M problem
  {
    id: 'client-007',
    name: 'Metro Construction Group',
    industry: 'Construction',
    partnerIndex: 0,
    status: CLIENT_STATUS.NORMAL,
    contacts: {
      primary: {
        name: 'Steve Martinez',
        email: 'smartinez@metroconstruction.com',
        phone: '5558901234',
        role: 'Accounts Payable',
        isPrimary: true,
      },
      escalation: {
        name: 'Angela Wright',
        email: 'awright@metroconstruction.com',
        phone: '5558901200',
        role: 'Controller',
        isPrimary: false,
      },
      owner: {
        name: 'Frank Delgado',
        email: 'fdelgado@metroconstruction.com',
        phone: '5558901201',
        role: 'President',
        isPrimary: false,
      },
    },
  },
  {
    id: 'client-008',
    name: 'Sunrise Medical Associates',
    industry: 'Healthcare',
    partnerIndex: 1,
    status: CLIENT_STATUS.DISPUTED, // Invoice dispute
    contacts: {
      primary: {
        name: 'Carol Patterson',
        email: 'cpatterson@sunrisemedical.com',
        phone: '5559012345',
        role: 'Billing Manager',
        isPrimary: true,
      },
      escalation: {
        name: 'Dr. James Morton',
        email: 'jmorton@sunrisemedical.com',
        phone: '5559012300',
        role: 'Medical Director',
        isPrimary: false,
      },
      owner: null,
    },
  },
  {
    id: 'client-009',
    name: 'Coastal Hospitality Inc.',
    industry: 'Hospitality',
    partnerIndex: 2,
    status: CLIENT_STATUS.NORMAL,
    contacts: {
      primary: {
        name: 'Diana Reyes',
        email: 'dreyes@coastalhospitality.com',
        phone: '5550123456',
        role: 'AP Manager',
        isPrimary: true,
      },
      escalation: {
        name: 'William Chang',
        email: 'wchang@coastalhospitality.com',
        phone: '5550123400',
        role: 'CFO',
        isPrimary: false,
      },
      owner: {
        name: 'Richard Coastal',
        email: 'rcoastal@coastalhospitality.com',
        phone: '5550123401',
        role: 'Owner',
        isPrimary: false,
      },
    },
  },
  {
    id: 'client-010',
    name: 'Premier Auto Group',
    industry: 'Automotive',
    partnerIndex: 0,
    status: CLIENT_STATUS.SLOW_PAYER,
    contacts: {
      primary: {
        name: 'Tony Vega',
        email: 'tvega@premierauto.com',
        phone: '5551234567',
        role: 'Controller',
        isPrimary: true,
      },
      escalation: null,
      owner: {
        name: 'Marcus Premier',
        email: 'mpremier@premierauto.com',
        phone: '5551234500',
        role: 'Owner',
        isPrimary: false,
      },
    },
  },
  {
    id: 'client-011',
    name: 'Valley Tech Solutions',
    industry: 'Technology',
    partnerIndex: 1,
    status: CLIENT_STATUS.NORMAL,
    contacts: {
      primary: {
        name: 'Kevin Walsh',
        email: 'kwalsh@valleytech.com',
        phone: '5552345670',
        role: 'Finance Manager',
        isPrimary: true,
      },
      escalation: {
        name: 'Sandra Kim',
        email: 'skim@valleytech.com',
        phone: '5552345600',
        role: 'VP Finance',
        isPrimary: false,
      },
      owner: null,
    },
  },
  {
    id: 'client-012',
    name: 'Heritage Properties LLC',
    industry: 'Real Estate',
    partnerIndex: 2,
    status: CLIENT_STATUS.SENSITIVE,
    contacts: {
      primary: {
        name: 'Beth Crawford',
        email: 'bcrawford@heritageproperties.com',
        phone: '5553456780',
        role: 'Property Manager',
        isPrimary: true,
      },
      escalation: null,
      owner: {
        name: 'Charles Heritage III',
        email: 'cheritage@heritageproperties.com',
        phone: '5553456700',
        role: 'Owner',
        isPrimary: false,
      },
    },
  },
]

// Service descriptions for invoices
const SERVICES = [
  'Tax Preparation Services',
  'Business Advisory Services',
  'Payroll Processing',
  'Annual Audit Services',
  'Financial Statement Preparation',
  'Bookkeeping & Tax Planning',
  'Monthly Accounting Services',
  'Year-End Tax Estimates',
  'Trust Accounting Services',
  'Quarterly Review Services',
  'Cash Flow Analysis',
  'Budget Preparation',
]

// Expense categories matching typical chart of accounts
export const EXPENSE_CATEGORIES = [
  {
    id: 'exp-cat-001',
    name: 'Software & Subscriptions',
    budgetAmount: 4500,
  },
  {
    id: 'exp-cat-002',
    name: 'Contractor & Temp Staff',
    budgetAmount: 12000,
  },
  {
    id: 'exp-cat-003',
    name: 'Professional Development',
    budgetAmount: 3000,
  },
]

// Expense drivers by category
const EXPENSE_DRIVERS = {
  'exp-cat-001': [
    { name: 'CRM Software License', vendor: 'Salesforce', baseAmount: 1200 },
    { name: 'Tax Research Database', vendor: 'Thomson Reuters', baseAmount: 800 },
    { name: 'Cloud Storage', vendor: 'Dropbox Business', baseAmount: 300 },
    { name: 'Practice Management Software', vendor: 'CCH Axcess', baseAmount: 950 },
    { name: 'Document Management', vendor: 'SmartVault', baseAmount: 200 },
  ],
  'exp-cat-002': [
    { name: 'Tax Season Temp Staff', vendor: 'Robert Half', baseAmount: 2800 },
    { name: 'IT Consultant', vendor: 'TechServe Inc', baseAmount: 1600 },
    { name: 'Bookkeeping Support', vendor: 'Accounting Temps', baseAmount: 1200 },
  ],
  'exp-cat-003': [
    { name: 'CPE Conference Registration', vendor: 'AICPA', baseAmount: 650 },
    { name: 'Online Training Subscriptions', vendor: 'Becker', baseAmount: 400 },
    { name: 'Industry Certifications', vendor: 'Various', baseAmount: 500 },
    { name: 'Staff Training Materials', vendor: 'Wiley', baseAmount: 250 },
  ],
}

/**
 * Generate a date relative to today
 * @param {number} daysAgo - Number of days in the past (negative for future)
 * @returns {string} ISO date string
 */
export const relativeDateISO = (daysAgo) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

/**
 * Generate an invoice number
 * @param {number} sequence - Sequence number
 * @returns {string} Invoice number like "INV-2025-0123"
 */
export const generateInvoiceNumber = (sequence) => {
  const year = new Date().getFullYear()
  return `INV-${year}-${String(sequence).padStart(4, '0')}`
}

/**
 * Determine severity based on days overdue
 */
export const getSeverityFromDays = (daysOverdue) => {
  if (daysOverdue >= 60) return SEVERITY.CRITICAL
  if (daysOverdue >= 30) return SEVERITY.WARNING
  return SEVERITY.INFO
}

/**
 * Determine severity based on variance percent
 */
export const getSeverityFromVariance = (variancePercent) => {
  if (variancePercent >= 50) return SEVERITY.CRITICAL
  if (variancePercent >= 25) return SEVERITY.WARNING
  return SEVERITY.INFO
}

/**
 * Generate invoices for a client
 */
export const generateInvoices = (clientIndex, daysOverdue, totalAmount) => {
  const invoices = []
  const numInvoices = Math.min(3, Math.ceil(totalAmount / 15000))
  let remainingAmount = totalAmount
  const baseSequence = 800 + (clientIndex * 20)

  for (let i = 0; i < numInvoices; i++) {
    const isLast = i === numInvoices - 1
    const amount = isLast ? remainingAmount : Math.round(remainingAmount * 0.5)
    remainingAmount -= amount

    const invoiceDate = relativeDateISO(daysOverdue + 30 + (i * 15))
    const dueDate = relativeDateISO(daysOverdue - (i * 5))

    invoices.push({
      id: `inv-${clientIndex}-${i}`,
      number: generateInvoiceNumber(baseSequence + i),
      date: invoiceDate,
      dueDate: dueDate,
      amount: amount,
      description: SERVICES[i % SERVICES.length],
    })
  }

  return invoices
}

/**
 * Determine aging bucket from days overdue
 */
export const getAgingBucket = (daysOverdue) => {
  if (daysOverdue <= 0) return 0
  if (daysOverdue <= 30) return 30
  if (daysOverdue <= 60) return 60
  if (daysOverdue <= 90) return 90
  return 120
}

/**
 * Generate notes based on severity, days overdue, and client status
 */
export const generateARNotes = (severity, daysOverdue, clientStatus) => {
  // Status-specific notes
  if (clientStatus === CLIENT_STATUS.PAYMENT_ARRANGEMENT) {
    return 'Payment arrangement in place. Manual follow-up per agreement terms.'
  }
  if (clientStatus === CLIENT_STATUS.DISPUTED) {
    return 'Invoice disputed by client. Automation on hold pending resolution.'
  }
  if (clientStatus === CLIENT_STATUS.SENSITIVE) {
    return 'Sensitive client relationship. All communications require partner approval.'
  }

  const notes = {
    critical: [
      'Multiple statements sent via Aiwyn. No response. May be AP contact issue - consider reaching out to CFO.',
      'Long-standing client - unusual delay. Likely administrative issue (missed invoice, AP turnover).',
      'Extended overdue period. Partner intervention recommended.',
      'Significant aging. Check if client has cash flow issues or if invoice was lost.',
    ],
    warning: [
      'Approaching escalation threshold. Auto-reminder scheduled.',
      'First follow-up sent. Awaiting response.',
      'Payment typically comes end of quarter. Monitor.',
      '60-day reminder pending partner approval.',
    ],
    info: [
      'Within normal payment window. Aiwyn statement sent.',
      'Standard payment terms - 30 days. Auto-reminder will trigger at 60 days.',
      'Recently invoiced. No action needed yet.',
      'New engagement. First invoice in cycle.',
    ],
  }

  const options = notes[severity] || notes.info
  return options[Math.floor(daysOverdue / 30) % options.length]
}

/**
 * Generate Aiwyn payment URL (simulated)
 */
export const generateAiywynUrl = (clientId, invoiceId) => {
  return `https://pay.aiwyn.com/firm-demo/${clientId}/${invoiceId || 'dashboard'}`
}

/**
 * Generate scheduled reminders based on days overdue and client status
 */
export const generateScheduledReminders = (alertId, clientId, clientStatus, daysOverdue, contact, escalationContact) => {
  const reminders = []

  // No automation for certain statuses
  if (clientStatus === CLIENT_STATUS.PAYMENT_ARRANGEMENT ||
      clientStatus === CLIENT_STATUS.DISPUTED) {
    return reminders
  }

  const requiresApproval = clientStatus === CLIENT_STATUS.SENSITIVE
  const isSlowPayer = clientStatus === CLIENT_STATUS.SLOW_PAYER

  // 60-day reminder (or 90 for slow payers)
  const initialTrigger = isSlowPayer ? 90 : 60
  if (daysOverdue >= initialTrigger && daysOverdue < (isSlowPayer ? 120 : 90)) {
    reminders.push({
      id: `reminder-${alertId}-60`,
      alertId,
      clientId,
      status: requiresApproval ? REMINDER_STATUS.AWAITING_APPROVAL : REMINDER_STATUS.PENDING,
      scheduledDate: relativeDateISO(-1), // Yesterday (ready to send)
      triggerDays: initialTrigger,
      tone: REMINDER_TONES.FRIENDLY,
      recipientEmail: contact.email,
      recipientName: contact.name,
      ccEscalation: false,
      requiresApproval,
      approvedBy: null,
      approvedAt: null,
      sentAt: null,
      subject: '',
      body: '',
    })
  }

  // 90-day escalation (or 120 for slow payers)
  const escalationTrigger = isSlowPayer ? 120 : 90
  if (daysOverdue >= escalationTrigger && daysOverdue < 120) {
    reminders.push({
      id: `reminder-${alertId}-90`,
      alertId,
      clientId,
      status: REMINDER_STATUS.AWAITING_APPROVAL, // Always requires approval for escalation
      scheduledDate: relativeDateISO(0),
      triggerDays: escalationTrigger,
      tone: REMINDER_TONES.PROFESSIONAL,
      recipientEmail: contact.email,
      recipientName: contact.name,
      ccEscalation: !!escalationContact,
      requiresApproval: true,
      approvedBy: null,
      approvedAt: null,
      sentAt: null,
      subject: '',
      body: '',
    })
  }

  // 120+ day partner alert
  if (daysOverdue >= 120) {
    reminders.push({
      id: `reminder-${alertId}-120`,
      alertId,
      clientId,
      status: REMINDER_STATUS.AWAITING_APPROVAL,
      scheduledDate: relativeDateISO(0),
      triggerDays: 120,
      tone: REMINDER_TONES.FIRM,
      recipientEmail: escalationContact?.email || contact.email,
      recipientName: escalationContact?.name || contact.name,
      ccEscalation: true,
      requiresApproval: true,
      approvedBy: null,
      approvedAt: null,
      sentAt: null,
      subject: '',
      body: '',
    })
  }

  return reminders
}

/**
 * Generate sent reminder history
 */
export const generateSentReminders = (alertId, clientId, daysOverdue, contact) => {
  const sent = []

  // If 60+ days, show a sent 30-day statement
  if (daysOverdue >= 60) {
    sent.push({
      id: `reminder-${alertId}-30-sent`,
      alertId,
      clientId,
      status: REMINDER_STATUS.SENT,
      scheduledDate: relativeDateISO(daysOverdue - 30),
      triggerDays: 30,
      tone: REMINDER_TONES.FRIENDLY,
      recipientEmail: contact.email,
      recipientName: contact.name,
      ccEscalation: false,
      requiresApproval: false,
      approvedBy: null,
      approvedAt: null,
      sentAt: relativeDateISO(daysOverdue - 30),
      subject: 'Friendly Reminder: Outstanding Invoice',
      body: 'Auto-sent via Aiwyn monthly statement.',
    })
  }

  return sent
}

/**
 * Generate expense drivers with variance explanations
 */
export const generateExpenseDrivers = (categoryId, varianceAmount) => {
  const categoryDrivers = EXPENSE_DRIVERS[categoryId] || []
  const drivers = []
  let remainingVariance = varianceAmount

  // Pick 2-3 drivers that explain the variance
  const numDrivers = Math.min(3, categoryDrivers.length)

  for (let i = 0; i < numDrivers && remainingVariance > 0; i++) {
    const driver = categoryDrivers[i]
    const isLast = i === numDrivers - 1
    const varianceContribution = isLast
      ? remainingVariance
      : Math.round(remainingVariance * (0.4 + Math.random() * 0.2))

    remainingVariance -= varianceContribution

    const notes = [
      'Price increase from vendor',
      'Added new users/licenses',
      'Upgraded to premium tier',
      'Extended engagement',
      'Unplanned but necessary',
      'Annual renewal (front-loaded)',
    ]

    drivers.push({
      name: driver.name,
      vendor: driver.vendor,
      amount: driver.baseAmount + varianceContribution,
      note: notes[i % notes.length],
    })
  }

  return drivers
}

/**
 * Generate expense notes based on category
 */
export const generateExpenseNotes = (categoryId, variancePercent) => {
  const notes = {
    'exp-cat-001': 'Review software utilization and consider consolidating vendors.',
    'exp-cat-002': 'Seasonal variance expected during tax season. Monitor through April.',
    'exp-cat-003': 'Front-loaded CPE costs for the year. Should normalize by Q2.',
  }

  if (variancePercent >= 50) {
    return notes[categoryId] + ' Requires immediate review.'
  }

  return notes[categoryId] || 'Review spending and adjust budget if necessary.'
}
