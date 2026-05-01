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
export function getBabyAgeMonths(babyDOB) {
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
// 2025-2026 benefit year (July 2025 – June 2026), one child under 6.
// Source: https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit/how-much.html
// Maximum annual benefit: $7,787
// Phase 1: 7.0% of AFNI above $37,487 up to $81,222 (single-child rate — 13.8% is the 2-child rate)
// Phase 2: additional 3.2% of AFNI above $81,222 (single-child rate — 5.7% is the 2-child rate)
// CCB does NOT reach $0 for one child until ~$250,000 AFNI.

const CCB_BASE_ANNUAL = 7787
const CCB_PHASE1_THRESHOLD = 37487
const CCB_PHASE2_THRESHOLD = 81222
const CCB_RATE_1 = 0.07
const CCB_RATE_2 = 0.032

export function calcCCBMonthly(householdIncome) {
  let annual = CCB_BASE_ANNUAL

  if (householdIncome > CCB_PHASE1_THRESHOLD) {
    const phase1Income = Math.min(householdIncome, CCB_PHASE2_THRESHOLD) - CCB_PHASE1_THRESHOLD
    annual -= phase1Income * CCB_RATE_1
  }

  if (householdIncome > CCB_PHASE2_THRESHOLD) {
    const phase2Income = householdIncome - CCB_PHASE2_THRESHOLD
    annual -= phase2Income * CCB_RATE_2
  }

  return Math.max(0, Math.round(annual / 12))
}

// ─── Provincial child benefits ────────────────────────────────────────────────
// Additive layer — does not affect CCB, EI, or childcare logic.
// All formulas: one child, two-parent family, 2025-2026 benefit year.

// BC — BC Family Benefit (BCFB)
// Source: https://www.canada.ca/en/revenue-agency/services/child-family-benefits/provincial-territorial-programs/province-british-columbia.html
// Max annual $1,750 ($146/mo). Floor $694/yr between thresholds.

// ON — Ontario Child Benefit (OCB)
// Source: https://www.canada.ca/en/revenue-agency/services/child-family-benefits/provincial-territorial-programs/province-ontario.html
// Max $143.91/mo ($1,726.92/yr). Phases to $0 at ~$69,564.

// AB — Alberta Child and Family Benefit (ACFB), base component only
// Source: https://www.canada.ca/en/revenue-agency/services/child-family-benefits/provincial-territorial-programs/province-alberta.html
// Max annual $1,499 ($125/mo). Paid quarterly. Base component only.

// QC — Quebec Family Allowance
// Source: https://www.retraitequebec.gouv.qc.ca/en/enfants/allocation-famille/Pages/allocation-famille.aspx
// Max $256/mo, minimum guaranteed $102/mo. Paid quarterly.

export function calcProvincialBenefit(province, householdIncome) {
  const income = householdIncome || 0

  if (province === 'BC') {
    let annual
    if (income <= 29526) {
      annual = 1750
    } else if (income <= 94483) {
      annual = Math.max(694, 1750 - 0.04 * (income - 29526))
    } else {
      annual = Math.max(0, 694 - 0.04 * (income - 94483))
    }
    return Math.max(0, Math.round(annual / 12))
  }

  if (province === 'ON') {
    if (income <= 26364) return Math.round(143.91)
    const annual = Math.max(0, 1726.92 - 0.04 * (income - 26364))
    return Math.max(0, Math.round(annual / 12))
  }

  if (province === 'AB') {
    let annual
    if (income <= 27565) {
      annual = 1499
    } else if (income <= 46191) {
      annual = Math.max(0, 1499 * (1 - (income - 27565) / (46191 - 27565)))
    } else {
      annual = 0
    }
    return Math.max(0, Math.round(annual / 12))
  }

  if (province === 'QC') {
    if (income <= 59369) return 256
    const annual = Math.max(1221, 3068 - 0.04 * (income - 59369))
    return Math.round(annual / 12)
  }

  return 0
}

export function provincialBenefitName(province) {
  const names = {
    BC: 'BC Family Benefit',
    ON: 'Ontario Child Benefit',
    AB: 'Alberta Child and Family Benefit',
    QC: 'Quebec Family Allowance',
  }
  return names[province] ?? null
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
  if (Array.isArray(additionalCosts)) {
    return additionalCosts.reduce((sum, item) => sum + (item.amount || 0), 0)
  }
  // legacy object format
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
// Formula: EI + topUp - (pre-leave monthly salary) + CCB - childcare - additional costs
// This is the net change vs. your normal financial picture.
// Will typically be a negative number (you are worse off during leave).

export function calcNetMonthlyImpact(inputs) {
  const {
    caregiverIncome, partnerIncome = 0, province, leaveType,
    babyDOB, isExpecting, additionalCosts = [], employerTopUp = 0,
  } = inputs

  const householdIncome = (caregiverIncome || 0) + (partnerIncome || 0)
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

  // Back at work: CCB - childcare - additional costs vs. pre-baby
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
  const nowLabel = `Now, ${fmtMY(now)}`
  const anchor = new Date(babyDOB + 'T12:00:00')

  if (isExpecting) {
    return [
      {
        month: nowLabel,
        label: isQC ? 'Apply for QPIP' : 'Apply for EI',
        detail: isQC
          ? 'Submit your QPIP application at Retraite Quebec before your due date'
          : 'Apply for EI maternity/parental up to 4 weeks before your last day of work',
      },
      {
        month: fmtMY(anchor),
        label: 'Due date: leave begins',
        detail: isQC
          ? 'QPIP payments start within days of your first eligible week off'
          : 'EI payments begin roughly 2 weeks after your last day. Apply early to avoid gaps.',
      },
      {
        month: fmtMY(addMo(anchor, 3)),
        label: 'First CCB payment',
        detail: 'Register your newborn for the Canada Child Benefit on CRA My Account. Payments are retroactive to birth.',
      },
      {
        month: `${fmtMY(addMo(anchor, leaveMonths))}, return to work`,
        label: `End of ${leaveMonths}-month leave`,
        detail: `Book ${isQC ? 'CPE' : 'daycare'} tours at least 3 months before this. Waitlists in ${provinceName(province)} often run 12 to 18 months.`,
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
          ? 'Confirm your QPIP payments are arriving via Retraite Quebec'
          : "Confirm EI is active on My Service Canada Account. Set up direct deposit if you haven't already.",
      },
      {
        month: fmtMY(ccbDate),
        label: ageMonths < 4 ? 'First CCB payment' : 'CCB check',
        detail: ageMonths < 4
          ? "Confirm you've registered your child on CRA My Account. Payments deposit on the 20th."
          : 'CCB updates each July based on your prior year income. File early if your income dropped on leave.',
      },
      {
        month: fmtMY(midFuture),
        label: 'Midpoint: reassess budget',
        detail: `Costs tend to shift around ${Math.ceil(leaveMonths / 2)} months. Start researching ${isQC ? 'CPE spots' : 'childcare'} now. Waitlists are long.`,
      },
      {
        month: `${fmtMY(returnDate)}, return to work`,
        label: `End of ${leaveMonths}-month leave`,
        detail: `Lock in your childcare before this date. Regulated spots in ${provinceName(province)} average $${calcChildcareCost(province).toLocaleString('en-CA')}/month.`,
      },
    ]
  }

  // Past leave window
  return [
    {
      month: nowLabel,
      label: 'Back at work',
      detail: `Your ${leaveMonths}-month leave window has passed. CCB continues monthly until your child turns 6.`,
    },
    {
      month: fmtMY(nextJuly(now)),
      label: 'CCB reassessment',
      detail: 'Each July, CRA recalculates your CCB based on your prior-year tax return. File early to capture any leave-year income drop.',
    },
    {
      month: fmtMY(addMo(now, 1)),
      label: 'RESP opportunity',
      detail: 'Every $2,500/year you contribute earns a $500 federal CESG grant. The earlier you start, the more it compounds.',
    },
    {
      month: `${fmtMY(addMo(anchor, 12))}, baby turns 1`,
      label: 'First birthday',
      detail: 'Review your childcare contract for fee changes. Reassess your CCB amount if your household income changed.',
    },
  ]
}

// ─── Action items — returns { text, url } objects ─────────────────────────────

const ACTION_URLS = {
  ei: 'https://www.canada.ca/en/services/benefits/ei/ei-maternity-parental.html',
  ccb: 'https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit-overview.html',
  resp: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-education-savings-plans-resps.html',
  childcare: 'https://www.canada.ca/en/public-health/services/caring-for-kids/child-care.html',
  qpip: 'https://www.rqap.gouv.qc.ca/en/about-the-plan/general-information/quebec-parental-insurance-plan-qpip',
  wills: 'https://www.canada.ca/en/services/life-events/death/estates-wills.html',
}

export function buildActionItems(province, _ageMonths, isExpecting, _householdIncome) {
  const isQC = province === 'QC'
  const items = []

  if (isExpecting) {
    items.push({
      text: 'Apply for EI before your last day of work',
      url: ACTION_URLS.ei,
    })
    items.push({
      text: 'Register for CCB as soon as your baby arrives',
      url: ACTION_URLS.ccb,
    })
    items.push({
      text: 'Get on childcare waitlists now — spaces fill up fast',
      url: ACTION_URLS.childcare,
    })
    items.push({
      text: 'Open an RESP before baby arrives to start earning the $500 annual federal grant',
      url: ACTION_URLS.resp,
    })
  } else {
    items.push({
      text: 'Apply for EI parental benefits on My Service Canada Account',
      url: ACTION_URLS.ei,
    })
    items.push({
      text: 'Register your child for the Canada Child Benefit through CRA My Account',
      url: ACTION_URLS.ccb,
    })
    items.push({
      text: 'Open an RESP at any bank or credit union. Every $2,500/year earns a $500 federal grant.',
      url: ACTION_URLS.resp,
    })
    items.push({
      text: `Start touring daycares now. Regulated spots in ${provinceName(province)} average $${calcChildcareCost(province).toLocaleString('en-CA')}/month.`,
      url: ACTION_URLS.childcare,
    })
  }

  items.push({
    text: 'Make or update your will now that you have a dependent.',
    url: ACTION_URLS.wills,
  })

  if (isQC) {
    items.unshift({
      text: "Apply for QPIP instead of federal EI — Quebec's parental insurance is more generous",
      url: ACTION_URLS.qpip,
    })
  }

  return items
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
  const { province, caregiverIncome, partnerIncome = 0, leaveType, babyDOB, isExpecting, employerTopUp = 0, needsChildcare = false } = inputs
  const householdIncome = (caregiverIncome || 0) + (partnerIncome || 0)
  const isQC = province === 'QC'
  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  const ccbMonthly = calcCCBMonthly(householdIncome)
  const childcare = calcChildcareCost(province)
  const hasTopUp = leaveType === 'topup' && employerTopUp > 0
  const onLeave = isLeaveActive(babyDOB, isExpecting, leaveType)
  const fmt = (n) => '$' + Math.abs(Math.round(n)).toLocaleString('en-CA')

  const provBenefit = calcProvincialBenefit(province, householdIncome)
  const provName = provincialBenefitName(province)
  const totalComingIn = onLeave
    ? (hasTopUp ? eiMonthly + employerTopUp : eiMonthly) + ccbMonthly + provBenefit
    : ccbMonthly + provBenefit

  const eiCcbLabel = provBenefit > 0 && provName
    ? `EI, CCB, and ${provName}`
    : 'EI and CCB'
  const qpipCcbLabel = provBenefit > 0 && provName
    ? `QPIP, CCB, and ${provName}`
    : 'QPIP and CCB'

  if (isQC) {
    if (onLeave && !needsChildcare) {
      return `During leave, you will bring in ${fmt(totalComingIn)}/month between ${qpipCcbLabel}. Since you'll be home with your baby, subsidized childcare costs apply when you return.`
    }
    return `During leave, you will bring in ${fmt(totalComingIn)}/month between ${qpipCcbLabel}. Your biggest monthly cost is subsidized childcare at $430/month. Here is what to prepare for.`
  }
  if (onLeave) {
    if (!needsChildcare) {
      return `During leave, you will bring in ${fmt(totalComingIn)}/month between ${eiCcbLabel}. Since you'll be home with your baby, paid childcare isn't factored in yet.`
    }
    return `During leave, you will bring in ${fmt(totalComingIn)}/month between ${eiCcbLabel}. Your biggest monthly cost is childcare at ${fmt(childcare)}/month. Here is what to prepare for.`
  }
  return `Your CCB is worth ${fmt(ccbMonthly)}/month tax-free, and childcare in ${provinceName(province)} runs about ${fmt(childcare)}/month.`
}
