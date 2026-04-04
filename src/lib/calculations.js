// ─── EI Parental Leave ────────────────────────────────────────────────────────

const EI_INSURABLE_CAP = 63200
const EI_STANDARD_RATE = 0.55
const EI_EXTENDED_RATE = 0.33

export function calcEIWeekly(caregiverIncome, leaveType) {
  const insurableAnnual = Math.min(caregiverIncome, EI_INSURABLE_CAP)
  const weeklyInsurable = insurableAnnual / 52
  // topup uses standard EI rate — employer top-up is layered on separately
  const rate = leaveType === 'extended' ? EI_EXTENDED_RATE : EI_STANDARD_RATE
  return Math.round(weeklyInsurable * rate)
}

export function calcEIMonthly(caregiverIncome, leaveType) {
  return Math.round(calcEIWeekly(caregiverIncome, leaveType) * (52 / 12))
}

export function calcLeaveMonths(leaveType) {
  return leaveType === 'extended' ? 18 : 12
}

// ─── Age and leave window helpers ─────────────────────────────────────────────

// Returns baby's age in months (negative = weeks until due date)
export function getBabyAgeMonths(babyDOB, isExpecting) {
  if (!babyDOB) return null
  const anchor = new Date(babyDOB + 'T12:00:00') // noon to avoid timezone drift
  const now = new Date()
  const diffMs = now - anchor
  return diffMs / (1000 * 60 * 60 * 24 * 30.4375)
}

// True if the user is likely still in the leave window
export function isLeaveActive(babyDOB, isExpecting, leaveType) {
  if (!babyDOB) return false
  if (isExpecting) return true // leave hasn't started yet
  const ageMonths = getBabyAgeMonths(babyDOB, false)
  if (ageMonths === null) return false
  return ageMonths <= calcLeaveMonths(leaveType)
}

// ─── Canada Child Benefit ─────────────────────────────────────────────────────
// Based on 2024-25 CRA rates for one child under 6.
// Note: CCB phases out to $0 at approximately $106,000 household income.

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

  return Math.max(0, Math.round(annual / 12))
}

// ─── Childcare costs ──────────────────────────────────────────────────────────

export const CHILDCARE_COSTS = {
  BC: 1350, AB: 1200, SK: 900, MB: 780, ON: 1500,
  QC: 430, NB: 780, NS: 890, PEI: 650, NL: 820,
}

export function calcChildcareCost(province) {
  return CHILDCARE_COSTS[province] ?? 1000
}

// ─── Additional costs ─────────────────────────────────────────────────────────

export function calcAdditionalCostsTotal(additionalCosts) {
  if (!additionalCosts) return 0
  const { food = 0, diapers = 0, clothing = 0, activities = 0, extraChildcare = 0, otherAmount = 0 } = additionalCosts
  return food + diapers + clothing + activities + extraChildcare + otherAmount
}

// ─── Income drop ──────────────────────────────────────────────────────────────

export function calcIncomeDropMonthly(caregiverIncome, leaveType) {
  const monthlyGross = caregiverIncome / 12
  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  return Math.round(monthlyGross - eiMonthly)
}

// ─── Net monthly impact ───────────────────────────────────────────────────────
// Formula: EI + topUp − (pre-leave monthly salary) + CCB − childcare − additional costs
// This is the net change vs. your normal financial picture.
// Will typically be a negative number (you are worse off during leave).

export function calcNetMonthlyImpact(inputs) {
  const {
    caregiverIncome, householdIncome, province, leaveType,
    babyDOB, isExpecting, additionalCosts = {}, employerTopUp = 0,
  } = inputs

  const ccbMonthly = calcCCBMonthly(householdIncome)
  const childcare = calcChildcareCost(province)
  const additionalTotal = calcAdditionalCostsTotal(additionalCosts)
  const onLeave = isLeaveActive(babyDOB, isExpecting, leaveType)

  if (onLeave) {
    const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
    const topUp = leaveType === 'topup' ? (employerTopUp ?? 0) : 0
    const monthlyIncome = caregiverIncome / 12
    return Math.round((eiMonthly + topUp) - monthlyIncome + ccbMonthly - childcare - additionalTotal)
  }

  // Back at work: CCB − childcare − additional costs vs. pre-baby
  return Math.round(ccbMonthly - childcare - additionalTotal)
}

// ─── Timeline — real calendar dates ──────────────────────────────────────────

function fmtMY(date) {
  return date.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })
}

function addMo(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

function nextJuly(from) {
  const d = new Date(from.getFullYear(), 6, 1)
  if (d <= from) d.setFullYear(d.getFullYear() + 1)
  return d
}

export function buildTimeline(babyDOB, isExpecting, leaveType, province) {
  if (!babyDOB) return []

  const isQC = province === 'QC'
  const leaveMonths = calcLeaveMonths(leaveType)
  const now = new Date()
  const nowLabel = `Now — ${fmtMY(now)}`
  const anchor = new Date(babyDOB + 'T12:00:00')

  if (isExpecting) {
    return [
      {
        month: nowLabel,
        label: isQC ? 'Apply for QPIP' : 'Apply for EI',
        detail: isQC
          ? 'Submit your QPIP application at Retraite Québec before your due date'
          : 'Apply for EI maternity/parental up to 4 weeks before your last day of work',
      },
      {
        month: fmtMY(anchor),
        label: 'Due date — leave begins',
        detail: isQC
          ? 'QPIP payments start within days of your first eligible week off'
          : 'EI payments begin roughly 2 weeks after your last day — apply early to avoid gaps',
      },
      {
        month: fmtMY(addMo(anchor, 3)),
        label: 'First CCB payment',
        detail: 'Register your newborn for the Canada Child Benefit on CRA My Account — payments are retroactive to birth',
      },
      {
        month: `${fmtMY(addMo(anchor, leaveMonths))} — return to work`,
        label: `End of ${leaveMonths}-month leave`,
        detail: `Book ${isQC ? 'CPE' : 'daycare'} tours at least 3 months before this — waitlists in ${provinceName(province)} often run 12–18 months`,
      },
    ]
  }

  const ageMonths = getBabyAgeMonths(babyDOB, false)
  const onLeave = ageMonths <= leaveMonths
  const returnDate = addMo(anchor, leaveMonths)
  const midDate = addMo(anchor, Math.ceil(leaveMonths / 2))

  if (onLeave) {
    const ccbDate = ageMonths < 4 ? addMo(anchor, 3) : addMo(now, 1)
    const midFuture = midDate > now ? midDate : addMo(now, 2)

    return [
      {
        month: nowLabel,
        label: isQC ? 'On QPIP leave' : 'On parental leave',
        detail: isQC
          ? 'Confirm your QPIP payments are arriving via Retraite Québec'
          : "Confirm EI is active on My Service Canada Account — set up direct deposit if you haven't",
      },
      {
        month: fmtMY(ccbDate),
        label: ageMonths < 4 ? 'First CCB payment' : 'CCB check',
        detail: ageMonths < 4
          ? 'Confirm you\'ve registered your child on CRA My Account — payments deposit on the 20th'
          : 'CCB updates each July based on your prior year income. File early if your income dropped on leave',
      },
      {
        month: fmtMY(midFuture),
        label: 'Midpoint — reassess budget',
        detail: `Costs tend to shift around ${Math.ceil(leaveMonths / 2)} months. Start researching ${isQC ? 'CPE spots' : 'childcare'} now — waitlists are long`,
      },
      {
        month: `${fmtMY(returnDate)} — return to work`,
        label: `End of ${leaveMonths}-month leave`,
        detail: `Lock in your childcare before this date — regulated spots in ${provinceName(province)} average $${calcChildcareCost(province).toLocaleString('en-CA')}/month`,
      },
    ]
  }

  // Past leave window
  return [
    {
      month: nowLabel,
      label: 'Back at work',
      detail: `Your ${leaveMonths}-month leave window has passed. CCB continues monthly until your child turns 6`,
    },
    {
      month: fmtMY(nextJuly(now)),
      label: 'CCB reassessment',
      detail: 'Each July, CRA recalculates your CCB based on your prior-year tax return. File early to capture any leave-year income drop',
    },
    {
      month: fmtMY(addMo(now, 1)),
      label: 'RESP opportunity',
      detail: 'Every $2,500/year you contribute earns a $500 federal CESG grant. The earlier you start, the more it compounds',
    },
    {
      month: `${fmtMY(addMo(anchor, 12))} — baby turns 1`,
      label: 'First birthday',
      detail: 'Review your childcare contract for fee changes. Reassess your CCB amount if your household income changed',
    },
  ]
}

// ─── Action items — returns { text, url } objects ─────────────────────────────

const ACTION_URLS = {
  ei: 'https://www.canada.ca/en/services/benefits/ei/ei-maternity-parental.html',
  ccb: 'https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit-overview.html',
  resp: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-education-savings-plans-resps.html',
  childcare: 'https://www.canada.ca/en/public-health/services/caring-for-kids/child-care.html',
}

export function buildActionItems(province, ageMonths, isExpecting, householdIncome) {
  const isQC = province === 'QC'
  const needsCLB = householdIncome < 45000

  return [
    {
      text: isQC
        ? 'Apply for QPIP on the Retraite Québec website before your leave starts'
        : 'Apply for EI parental benefits on My Service Canada Account',
      url: ACTION_URLS.ei,
    },
    {
      text: 'Register your child for the Canada Child Benefit through CRA My Account',
      url: ACTION_URLS.ccb,
    },
    {
      text: needsCLB
        ? 'Open an RESP now — lower-income families also qualify for the Canada Learning Bond (up to $2,000 extra, no contribution required)'
        : 'Open an RESP at any bank or credit union — $2,500/year earns a $500 federal grant',
      url: ACTION_URLS.resp,
    },
    {
      text: isQC
        ? 'Add yourself to a CPE waitlist immediately — the subsidized rate is $13.10/day'
        : `Start touring daycares now — regulated spots in ${provinceName(province)} average $${calcChildcareCost(province).toLocaleString('en-CA')}/month`,
      url: ACTION_URLS.childcare,
    },
  ]
}

export function provinceName(code) {
  const names = {
    BC: 'British Columbia', AB: 'Alberta', SK: 'Saskatchewan', MB: 'Manitoba',
    ON: 'Ontario', QC: 'Quebec', NB: 'New Brunswick', NS: 'Nova Scotia',
    PEI: 'Prince Edward Island', NL: 'Newfoundland',
  }
  return names[code] ?? code
}

// ─── Compact verdict (results header subtitle) ────────────────────────────────

export function buildCompactVerdict(inputs) {
  const { province, householdIncome, caregiverIncome, leaveType, babyDOB, isExpecting, employerTopUp = 0 } = inputs
  const isQC = province === 'QC'
  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  const ccbMonthly = calcCCBMonthly(householdIncome)
  const childcare = calcChildcareCost(province)
  const leaveMonths = calcLeaveMonths(leaveType)
  const hasTopUp = leaveType === 'topup' && employerTopUp > 0
  const onLeave = isLeaveActive(babyDOB, isExpecting, leaveType)
  const fmt = (n) => '$' + Math.abs(Math.round(n)).toLocaleString('en-CA')

  if (isQC) {
    return `QPIP pays you ${fmt(eiMonthly)}/month and your subsidized childcare runs just $430/month — Quebec's setup is the strongest in Canada.`
  }
  if (onLeave) {
    if (hasTopUp) {
      return `EI plus your employer top-up brings in ${fmt(eiMonthly + employerTopUp)}/month for ${leaveMonths} months, with ${fmt(ccbMonthly)}/month in CCB on top.`
    }
    return `EI pays you roughly ${fmt(eiMonthly)}/month for ${leaveMonths} months, with ${fmt(ccbMonthly)}/month in Canada Child Benefit on top.`
  }
  return `Your CCB is worth ${fmt(ccbMonthly)}/month tax-free, and childcare in ${provinceName(province)} runs about ${fmt(childcare)}/month.`
}
