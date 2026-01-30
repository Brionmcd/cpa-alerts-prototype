/**
 * Data generators for realistic mock data
 * Generates dates relative to "today" so data never goes stale
 */

import { SEVERITY } from '../../types'
import { getCurrentPeriod, getMonthName } from '../../../utils/formatters'

// Realistic CPA firm client names
export const CLIENTS = [
  {
    id: 'client-001',
    name: 'Henderson & Associates LLC',
    contact: {
      name: 'Margaret Henderson',
      email: 'mhenderson@hendersonllc.com',
      phone: '5552345678',
    },
    industry: 'Professional Services',
  },
  {
    id: 'client-002',
    name: 'Westbrook Manufacturing Inc.',
    contact: {
      name: 'David Westbrook',
      email: 'dwestbrook@westbrookmfg.com',
      phone: '5553456789',
    },
    industry: 'Manufacturing',
  },
  {
    id: 'client-003',
    name: 'Pinnacle Real Estate Group',
    contact: {
      name: 'Sarah Mitchell',
      email: 'smitchell@pinnaclere.com',
      phone: '5554567890',
    },
    industry: 'Real Estate',
  },
  {
    id: 'client-004',
    name: 'Chen Family Dental Practice',
    contact: {
      name: 'Dr. Michael Chen',
      email: 'mchen@chenfamilydental.com',
      phone: '5555678901',
    },
    industry: 'Healthcare',
  },
  {
    id: 'client-005',
    name: 'Oakwood Senior Living',
    contact: {
      name: 'Patricia Oakes',
      email: 'poakes@oakwoodliving.com',
      phone: '5556789012',
    },
    industry: 'Healthcare',
  },
  {
    id: 'client-006',
    name: 'Thompson Legal Partners',
    contact: {
      name: 'Jennifer Thompson',
      email: 'jthompson@thompsonlegal.com',
      phone: '5557890123',
    },
    industry: 'Legal Services',
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
 * Generate notes based on severity and days overdue
 */
export const generateARNotes = (severity, daysOverdue) => {
  const notes = {
    critical: [
      'Multiple follow-up attempts made. Client mentioned cash flow issues due to delayed contract payments.',
      'Second notice sent. No response yet. Consider escalation.',
      'Collections process initiated. Final notice sent last week.',
    ],
    warning: [
      'Usually pays within 30 days. May need reminder call.',
      'Payment typically processed end of month. Monitor.',
      'First reminder sent. Awaiting response.',
    ],
    info: [
      'New client - first invoice. Standard payment terms.',
      'Standard payment terms - 30 days. No action needed yet.',
      'Recently sent. Within normal payment window.',
    ],
  }

  const options = notes[severity] || notes.info
  return options[Math.floor(daysOverdue / 30) % options.length]
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
