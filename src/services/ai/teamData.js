/**
 * Mock Team Member Data
 *
 * Realistic CPA firm team structure with expertise areas,
 * client relationships, and workload tracking.
 */

export const TEAM_MEMBERS = [
  {
    id: 'tm-001',
    name: 'Sarah Chen',
    email: 'schen@firm.com',
    role: 'Senior Accountant',
    expertise: ['Collections', 'Large Accounts', 'Client Relations'],
    clientRelationships: ['Henderson', 'Westbrook', 'Pinnacle'],
    workload: 3,
    avatar: 'SC',
    color: 'bg-blue-500',
  },
  {
    id: 'tm-002',
    name: 'Michael Torres',
    email: 'mtorres@firm.com',
    role: 'Staff Accountant',
    expertise: ['Budgeting', 'Expense Analysis', 'Technology'],
    clientRelationships: ['Chen Family', 'Oakwood'],
    workload: 5,
    avatar: 'MT',
    color: 'bg-green-500',
  },
  {
    id: 'tm-003',
    name: 'Jennifer Walsh',
    email: 'jwalsh@firm.com',
    role: 'Accounting Manager',
    expertise: ['Complex Collections', 'Escalations', 'Payment Plans', 'Client Relations'],
    clientRelationships: ['Henderson', 'Thompson Legal'],
    workload: 2,
    avatar: 'JW',
    color: 'bg-purple-500',
  },
  {
    id: 'tm-004',
    name: 'David Kim',
    email: 'dkim@firm.com',
    role: 'Staff Accountant',
    expertise: ['Collections', 'New Accounts', 'Documentation'],
    clientRelationships: ['Oakwood', 'Thompson Legal'],
    workload: 4,
    avatar: 'DK',
    color: 'bg-orange-500',
  },
]

/**
 * Get team member by ID
 */
export const getTeamMemberById = (id) => {
  return TEAM_MEMBERS.find(tm => tm.id === id) || null
}

/**
 * Get team members with specific expertise
 */
export const getTeamMembersByExpertise = (expertise) => {
  return TEAM_MEMBERS.filter(tm =>
    tm.expertise.some(e => e.toLowerCase().includes(expertise.toLowerCase()))
  )
}

/**
 * Get team member with lowest workload
 */
export const getLowestWorkloadMember = () => {
  return TEAM_MEMBERS.reduce((lowest, current) =>
    current.workload < lowest.workload ? current : lowest
  )
}

/**
 * Mock client history data
 * In a real system, this would come from a CRM or practice management system
 */
export const CLIENT_HISTORY = {
  'Henderson & Associates LLC': {
    relationshipStart: '2019-03-15',
    totalBillings: 285000,
    averagePaymentDays: 38,
    lastPayment: '2024-09-22',
    lastPaymentAmount: 15750,
    paymentHistory: [
      { date: '2024-09-22', amount: 15750, daysToPayment: 35 },
      { date: '2024-06-15', amount: 22500, daysToPayment: 42 },
      { date: '2024-03-10', amount: 18000, daysToPayment: 28 },
    ],
    notes: 'Long-term client. Typically pays after a phone call. CFO prefers email communication initially.',
    preferredContact: 'Margaret Henderson - CFO',
    escalationContact: 'Robert Henderson - Managing Partner',
  },
  'Westbrook Manufacturing Inc.': {
    relationshipStart: '2021-06-01',
    totalBillings: 156000,
    averagePaymentDays: 52,
    lastPayment: '2024-08-30',
    lastPaymentAmount: 28400,
    paymentHistory: [
      { date: '2024-08-30', amount: 28400, daysToPayment: 48 },
      { date: '2024-05-15', amount: 12000, daysToPayment: 55 },
      { date: '2024-02-28', amount: 18500, daysToPayment: 60 },
    ],
    notes: 'Manufacturing industry - seasonal cash flow. Best to follow up mid-month after their payroll cycle.',
    preferredContact: 'David Westbrook - Owner',
    escalationContact: null,
  },
  'Pinnacle Real Estate Group': {
    relationshipStart: '2020-09-01',
    totalBillings: 198000,
    averagePaymentDays: 28,
    lastPayment: '2024-11-15',
    lastPaymentAmount: 24800,
    paymentHistory: [
      { date: '2024-11-15', amount: 24800, daysToPayment: 25 },
      { date: '2024-08-10', amount: 18500, daysToPayment: 30 },
      { date: '2024-05-05', amount: 22000, daysToPayment: 28 },
    ],
    notes: 'Excellent payment history. Occasional delays during closing season (March, June, September).',
    preferredContact: 'Sarah Mitchell - Controller',
    escalationContact: 'James Pinnacle - CEO',
  },
  'Chen Family Dental Practice': {
    relationshipStart: '2022-01-15',
    totalBillings: 72000,
    averagePaymentDays: 35,
    lastPayment: '2024-11-28',
    lastPaymentAmount: 8150,
    paymentHistory: [
      { date: '2024-11-28', amount: 8150, daysToPayment: 32 },
      { date: '2024-08-25', amount: 6500, daysToPayment: 38 },
      { date: '2024-05-30', amount: 7200, daysToPayment: 35 },
    ],
    notes: 'Small practice, consistent payer. Dr. Chen handles finances directly.',
    preferredContact: 'Dr. Michael Chen',
    escalationContact: null,
  },
  'Oakwood Senior Living': {
    relationshipStart: '2024-11-01',
    totalBillings: 8200,
    averagePaymentDays: null,
    lastPayment: null,
    lastPaymentAmount: null,
    paymentHistory: [],
    notes: 'New client as of November 2024. First invoice sent January 2025.',
    preferredContact: 'Patricia Oakes - Administrator',
    escalationContact: 'Board of Directors',
  },
  'Thompson Legal Partners': {
    relationshipStart: '2018-07-01',
    totalBillings: 420000,
    averagePaymentDays: 22,
    lastPayment: '2024-12-20',
    lastPaymentAmount: 12500,
    paymentHistory: [
      { date: '2024-12-20', amount: 12500, daysToPayment: 18 },
      { date: '2024-09-15', amount: 15000, daysToPayment: 22 },
      { date: '2024-06-10', amount: 18000, daysToPayment: 25 },
    ],
    notes: 'Excellent long-term client. Very responsive. Usually pays early if cash flow allows.',
    preferredContact: 'Jennifer Thompson - Managing Partner',
    escalationContact: null,
  },
}

/**
 * Get client history by name (fuzzy match)
 */
export const getClientHistory = (clientName) => {
  // Exact match first
  if (CLIENT_HISTORY[clientName]) {
    return CLIENT_HISTORY[clientName]
  }

  // Fuzzy match on first word
  const firstWord = clientName.split(' ')[0]
  const match = Object.keys(CLIENT_HISTORY).find(name =>
    name.toLowerCase().includes(firstWord.toLowerCase())
  )

  return match ? CLIENT_HISTORY[match] : null
}

/**
 * Format client history for AI prompt
 */
export const formatClientHistoryForPrompt = (clientName) => {
  const history = getClientHistory(clientName)

  if (!history) {
    return 'No previous history available for this client.'
  }

  const avgDays = history.averagePaymentDays
    ? `${history.averagePaymentDays} days`
    : 'Not established yet'

  const recentPayments = history.paymentHistory.length > 0
    ? history.paymentHistory
      .slice(0, 3)
      .map(p => `  - ${p.date}: $${p.amount.toLocaleString()} (${p.daysToPayment} days to payment)`)
      .join('\n')
    : '  No payment history yet'

  return `Client: ${clientName}
Relationship since: ${history.relationshipStart}
Total billings: $${history.totalBillings.toLocaleString()}
Average payment time: ${avgDays}

Recent payments:
${recentPayments}

Notes: ${history.notes}
Preferred contact: ${history.preferredContact}
${history.escalationContact ? `Escalation contact: ${history.escalationContact}` : ''}`
}

export default {
  TEAM_MEMBERS,
  getTeamMemberById,
  getTeamMembersByExpertise,
  getLowestWorkloadMember,
  CLIENT_HISTORY,
  getClientHistory,
  formatClientHistoryForPrompt,
}
