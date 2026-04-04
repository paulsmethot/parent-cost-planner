// ─── EI Parental Leave ────────────────────────────────────────────────────────

const EI_INSURABLE_CAP = 63200
const EI_STANDARD_RATE = 0.55
const EI_EXTENDED_RATE = 0.33
const EI_STANDARD_WEEKS = 52
const EI_EXTENDED_WEEKS = 76

export function calcEIWeekly(caregiverIncome, leaveType) {
  const insurableAnnual = Math.min(caregiverIncome, EI_INSURABLE_CAP)
  const weeklyInsurable = insurableAnnual / 52
  const rate = leaveType === 'extended' ? EI_EXTENDED_RATE : EI_STANDARD_RATE
  return Math.round(weeklyInsurable * rate)
}

export function calcEIMonthly(caregiverIncome, leaveType) {
  return Math.round(calcEIWeekly(caregiverIncome, leaveType) * (52 / 12))
}

export function calcLeaveMonths(leaveType) {
  return leaveType === 'extended' ? 18 : 12
}

// ─── Canada Child Benefit ─────────────────────────────────────────────────────

const CCB_BASE_ANNUAL = 7787
const CCB_LOW_THRESHOLD = 36502
const CCB_MID_THRESHOLD = 80000
const CCB_RATE_1 = 0.138
const CCB_RATE_2 = 0.0679

export function calcCCBMonthly(householdIncome) {
  let annual = CCB_BASE_ANNUAL

  if (householdIncome > CCB_LOW_THRESHOLD) {
    const tier1Income = Math.min(householdIncome, CCB_MID_THRESHOLD) - CCB_LOW_THRESHOLD
    annual -= tier1Income * CCB_RATE_1
  }

  if (householdIncome > CCB_MID_THRESHOLD) {
    const tier2Income = householdIncome - CCB_MID_THRESHOLD
    annual -= tier2Income * CCB_RATE_2
  }

  annual = Math.max(0, annual)
  return Math.round(annual / 12)
}

// ─── Childcare costs ──────────────────────────────────────────────────────────

export const CHILDCARE_COSTS = {
  BC: 1350,
  AB: 1200,
  SK: 900,
  MB: 780,
  ON: 1500,
  QC: 430,
  NB: 780,
  NS: 890,
  PEI: 650,
  NL: 820,
}

export function calcChildcareCost(province) {
  return CHILDCARE_COSTS[province] ?? 1000
}

// ─── Income drop ─────────────────────────────────────────────────────────────

export function calcIncomeDropMonthly(caregiverIncome, leaveType) {
  const monthlyGross = caregiverIncome / 12
  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  return Math.round(monthlyGross - eiMonthly)
}

// ─── Net monthly impact ───────────────────────────────────────────────────────

export function calcNetMonthlyImpact(caregiverIncome, householdIncome, province, leaveType, babyStage) {
  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  const ccbMonthly = calcCCBMonthly(householdIncome)
  const childcare = babyStage === 'expecting' || babyStage === 'newborn'
    ? 0
    : calcChildcareCost(province)

  const inflow = eiMonthly + ccbMonthly
  const outflow = childcare
  return inflow - outflow
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export function buildTimeline(babyStage, leaveType, province) {
  const leaveMonths = calcLeaveMonths(leaveType)
  const isQC = province === 'QC'

  const stages = {
    expecting: [
      { month: 'Now', label: 'Apply for EI', detail: isQC ? 'Submit your QPIP application before your due date' : 'Apply for EI up to 4 weeks before your due date' },
      { month: 'Month 1', label: 'Leave begins', detail: isQC ? 'QPIP payments start within days of your first week off' : 'EI payments start roughly 2 weeks after your last day of work' },
      { month: `Month ${Math.round(leaveMonths / 2)}`, label: 'CCB increases', detail: 'Child Benefit is reassessed based on your prior year income' },
      { month: `Month ${leaveMonths}`, label: 'Return to work', detail: 'Review childcare options 2–3 months before your return date' },
    ],
    newborn: [
      { month: 'Now', label: isQC ? 'Confirm QPIP' : 'Confirm EI approval', detail: isQC ? 'Verify your QPIP application has been processed' : 'Check your My Service Canada Account for payment status' },
      { month: 'Month 3', label: 'CCB first payment', detail: 'First Canada Child Benefit should arrive if you applied at birth' },
      { month: `Month ${Math.round(leaveMonths / 2)}`, label: 'Midpoint check', detail: 'Reassess your budget — costs tend to shift after the 6-month mark' },
      { month: `Month ${leaveMonths}`, label: 'Return to work', detail: 'Begin childcare search now — waitlists can be 12+ months' },
    ],
    infant: [
      { month: 'Now', label: 'CCB review', detail: 'Your 2025 CCB amount will update based on your filed tax return' },
      { month: 'Month 2', label: 'Childcare options', detail: province === 'QC' ? 'Apply to a CPE if you haven\'t — priority spots go fast' : 'Tour daycares — regulated spots in your province average ' + '$' + calcChildcareCost(province) + '/mo' },
      { month: 'Month 6', label: 'RESP window', detail: 'Open an RESP now to capture the $500 CESG grant this year' },
      { month: 'Month 12', label: 'Second year', detail: 'Annual CCB reassessment — file your taxes early if your income dropped' },
    ],
    toddler: [
      { month: 'Now', label: 'RESP opportunity', detail: 'Each year you contribute $2,500 earns a $500 grant from the government' },
      { month: 'Month 2', label: 'CCB review', detail: 'CCB is updated each July based on your previous year\'s return' },
      { month: 'Month 6', label: 'Childcare changes', detail: province === 'QC' ? 'Check your CPE fee structure — rates update annually' : 'Review your childcare contract — fee increases often happen mid-year' },
      { month: 'Month 12', label: 'Year-end planning', detail: 'Max your RRSP before March to reduce income used for CCB calculation' },
    ],
  }

  return stages[babyStage] ?? stages.newborn
}

// ─── Action items ─────────────────────────────────────────────────────────────

export function buildActionItems(province, babyStage, householdIncome) {
  const isQC = province === 'QC'
  const needsResp = householdIncome < 45000

  const base = [
    isQC
      ? 'Apply for QPIP on the Retraite Québec website before your leave starts'
      : 'Apply for EI parental benefits on My Service Canada Account',
    'Register your child for the Canada Child Benefit through CRA My Account',
    'Open an RESP at any bank or credit union — it takes 20 minutes and unlocks the $500 CESG grant',
    isQC
      ? 'Add yourself to a CPE waitlist immediately — the subsidized rate is $13.10/day'
      : `Start touring daycares now — regulated spots in ${provinceName(province)} average $${calcChildcareCost(province)}/month`,
  ]

  if (needsResp) {
    base[2] = 'Open an RESP now — lower-income families also qualify for the Canada Learning Bond (up to $2,000 extra)'
  }

  return base
}

export function provinceName(code) {
  const names = {
    BC: 'British Columbia', AB: 'Alberta', SK: 'Saskatchewan', MB: 'Manitoba',
    ON: 'Ontario', QC: 'Quebec', NB: 'New Brunswick', NS: 'Nova Scotia',
    PEI: 'Prince Edward Island', NL: 'Newfoundland',
  }
  return names[code] ?? code
}

// ─── Verdict paragraph ────────────────────────────────────────────────────────

export function buildVerdict(inputs) {
  const { province, householdIncome, caregiverIncome, babyStage, leaveType } = inputs
  const isQC = province === 'QC'
  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  const ccbMonthly = calcCCBMonthly(householdIncome)
  const childcare = calcChildcareCost(province)
  const drop = calcIncomeDropMonthly(caregiverIncome, leaveType)
  const leaveMonths = calcLeaveMonths(leaveType)

  const fmt = (n) => n.toLocaleString('en-CA')

  if (isQC) {
    return `Quebec's QPIP gives you stronger parental leave than anywhere else in Canada — your household will receive roughly $${fmt(eiMonthly)}/month during leave, plus $${fmt(ccbMonthly)}/month in CCB. Your subsidized childcare rate of $13.10/day ($430/month) dramatically reduces the financial hit of returning to work. The main task now is getting on a CPE waitlist early.`
  }

  if (babyStage === 'expecting' || babyStage === 'newborn') {
    return `During your ${leaveMonths}-month leave, EI will replace roughly $${fmt(eiMonthly)}/month of income — a drop of $${fmt(drop)}/month from your regular take-home. The Canada Child Benefit adds $${fmt(ccbMonthly)}/month to partially offset that. Your biggest financial decision in year one isn't the leave itself — it's childcare at $${fmt(childcare)}/month when you return.`
  }

  return `Your CCB is currently worth $${fmt(ccbMonthly)}/month based on your household income. With childcare running $${fmt(childcare)}/month in ${provinceName(province)}, your net childcare cost after CCB is roughly $${fmt(Math.max(0, childcare - ccbMonthly))}/month. The RESP grant window is open — every year you delay costs you $500 in free government money.`
}
