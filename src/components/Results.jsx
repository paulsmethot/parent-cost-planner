import { useState, useRef, useEffect } from 'react'
import {
  calcEIMonthly,
  calcCCBMonthly,
  calcProvincialBenefit,
  provincialBenefitName,
  calcChildcareCost,
  calcAdditionalCostsTotal,
  calcLeaveMonths,
  isLeaveActive,
  buildTimeline,
  buildActionItems,
  buildCompactVerdict,
  provinceName,
} from '../lib/calculations'

function fmt(n) {
  return '$' + Math.abs(Math.round(n)).toLocaleString('en-CA')
}

// Tier 1 — line items: /mo at same size as number (inherited 15px)
function Mo() {
  return <span>/mo</span>
}

// Tier 2 — total rows: /mo at 15px, natural alignment
function MoTotal() {
  return <span className="text-[15px]">/mo</span>
}

function Divider() {
  return <div className="border-t border-[var(--color-sand)] print:border-gray-200" />
}

function ItemDivider() {
  return <div className="border-t border-[#F0F0EE]" />
}

// All section headings: 18px / 600 / charcoal
function SectionHeading({ children }) {
  return <h2 className="text-[18px] font-semibold text-[#1A1A1A]">{children}</h2>
}

function LineItem({ label, subtitle, value, valueColor }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[15px] font-medium text-[var(--color-charcoal)] leading-snug">{label}</p>
        {subtitle && <p className="text-[13px] font-normal text-[#6B6B6B] mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
      <p className={`text-[15px] font-medium shrink-0 leading-snug ${valueColor}`}>{value}</p>
    </div>
  )
}

function TimelineStep({ month, label, detail, index, isLast }) {
  return (
    <div
      className="flex gap-4 animate-fade-slide-up opacity-0"
      style={{ animationDelay: `${280 + index * 70}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex flex-col items-center pt-1">
        <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] shrink-0" />
        {!isLast && <div className="w-px bg-[var(--color-sand)] flex-1 mt-1.5" />}
      </div>
      <div className={isLast ? 'pb-0' : 'pb-6'}>
        <p className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-[0.06em]">{month}</p>
        <p className="text-[15px] font-semibold text-[var(--color-charcoal)] mt-0.5 leading-snug">{label}</p>
        <p className="text-[13px] font-normal text-[var(--color-muted)] mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}

function ActionItem({ item, index, checked, onToggle }) {
  return (
    <div
      className="flex gap-3 bg-white rounded-[16px] p-5 animate-fade-slide-up opacity-0"
      style={{ animationDelay: `${480 + index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 ${
          checked
            ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
            : 'border-[var(--color-sand)] hover:border-[var(--color-accent)]'
        }`}
        aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <p className={`flex-1 text-[14px] font-normal leading-relaxed transition-all duration-150 ${
        checked ? 'line-through text-[var(--color-stone)]' : 'text-[var(--color-charcoal)]'
      }`}>
        {item.text}
      </p>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 mt-0.5 text-[var(--color-stone)] hover:text-[var(--color-accent)] transition-colors duration-150"
        aria-label="Open government resource"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M6 2H2a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M9 1h4v4M13 1L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
    </div>
  )
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function triggerCSVDownload(csvString, filename) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function buildCSVString({ province, leaveType, eiMonthly, ccbMonthly, provincialBenefit = 0,
  provincialBenefitLabel = null, childcareCost,
  caregiverIncome, additionalTotal, adjustedNet, needsChildcare, onLeave,
  leaveIncome, returnMonthYear }) {
  const totalComingIn = onLeave ? leaveIncome + ccbMonthly + provincialBenefit : ccbMonthly + provincialBenefit
  const salaryMonthly = Math.round(caregiverIncome / 12)
  const activeChildcare = needsChildcare ? Math.round(childcareCost) : 0
  const totalGoingOut = activeChildcare + Math.round(additionalTotal) + (onLeave ? salaryMonthly : 0)
  const leaveLabel = leaveType === 'extended' ? 'Extended 18-month'
    : leaveType === 'shared' ? 'Shared'
    : leaveType === 'topup' ? 'Employer Top-up'
    : 'Standard 12-month'
  const today = new Date().toISOString().split('T')[0]
  const childcareEntry = needsChildcare
    ? Math.round(childcareCost)
    : returnMonthYear ? `Starting ${returnMonthYear}` : 'TBD'

  const rows = [
    ['"Monthly Income During Leave"'],
    ['"Category"', '"Amount (CAD/mo)"'],
  ]
  if (onLeave) rows.push(['"EI Parental Leave"', `"${Math.round(eiMonthly)}"`])
  rows.push(['"Canada Child Benefit"', `"${Math.round(ccbMonthly)}"`])
  if (provincialBenefit > 0 && provincialBenefitLabel) rows.push([`"${provincialBenefitLabel}"`, `"${Math.round(provincialBenefit)}"`])
  rows.push(['"Total Coming In"', `"${Math.round(totalComingIn)}"`])
  rows.push([''])
  rows.push(['"Monthly Costs During Leave"'])
  rows.push(['"Category"', '"Amount (CAD/mo)"'])
  rows.push(['"Estimated Childcare"', `"${childcareEntry}"`])
  if (onLeave) rows.push(['"Pre-leave Monthly Salary"', `"${salaryMonthly}"`])
  rows.push(['"Additional Monthly Costs"', `"${Math.round(additionalTotal)}"`])
  rows.push(['"Total Going Out"', `"${totalGoingOut}"`])
  rows.push([''])
  rows.push(['"Summary"'])
  rows.push(['"Monthly Income Gap"', `"${adjustedNet}"`])
  rows.push(['"Leave Type"', `"${leaveLabel}"`])
  rows.push(['"Province"', `"${provinceName(province)}"`])
  rows.push(['"Generated On"', `"${today}"`])

  return rows.map(r => r.join(',')).join('\n')
}

// ─── Export dropdown ──────────────────────────────────────────────────────────

function ExportDropdown({ csvParams, province }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const now = new Date()
  const yyyymm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const filename = `parent-cost-planner-${province.toLowerCase()}-${yyyymm}.csv`

  function handlePDF() { setOpen(false); window.print() }
  function handleCSV() { setOpen(false); triggerCSVDownload(buildCSVString(csvParams), filename) }

  return (
    <div ref={wrapperRef} className="relative flex-1 print:hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full min-h-[48px] h-12 flex items-center justify-center gap-2 rounded-[12px] font-medium text-[15px] border border-[#E5E5E3] text-[#1A1A1A] bg-white hover:bg-[#F7F7F5] transition-all duration-200"
      >
        Export results
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-[#E5E5E3] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] overflow-hidden z-10">
          <button onClick={handlePDF} className="w-full h-11 px-4 flex items-center gap-3 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F7F7F5] transition-colors duration-150 text-left">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save as PDF
          </button>
          <div className="border-t border-[#E5E5E3]" />
          <button onClick={handleCSV} className="w-full h-11 px-4 flex items-center gap-3 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F7F7F5] transition-colors duration-150 text-left">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M1 5h12M1 9h12M5 5v7M9 5v7" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Download CSV
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Results screen ───────────────────────────────────────────────────────────

export default function Results({ values, onEdit }) {
  const {
    province, caregiverIncome, partnerIncome = 0, leaveType,
    babyDOB, isExpecting, additionalCosts = [], employerTopUp = 0,
    needsChildcare = false,
  } = values

  const householdIncome = (caregiverIncome || 0) + (partnerIncome || 0)

  const isQC = province === 'QC'
  const hasTopUp = leaveType === 'topup' && employerTopUp > 0
  const onLeave = isLeaveActive(babyDOB, isExpecting, leaveType)

  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  const leaveIncome = hasTopUp ? eiMonthly + employerTopUp : eiMonthly
  const ccbMonthly = calcCCBMonthly(householdIncome)
  const provincialBenefit = calcProvincialBenefit(province, householdIncome)
  const provBenefitName = provincialBenefitName(province)
  const childcareCost = calcChildcareCost(province)
  const additionalTotal = calcAdditionalCostsTotal(additionalCosts)

  const activeChildcare = needsChildcare ? childcareCost : 0
  const adjustedNet = onLeave
    ? Math.round(leaveIncome - (caregiverIncome / 12) + ccbMonthly + provincialBenefit - activeChildcare - additionalTotal)
    : Math.round(ccbMonthly + provincialBenefit - activeChildcare - additionalTotal)
  const netPositive = adjustedNet >= 0

  const totalComingIn = onLeave ? leaveIncome + ccbMonthly + provincialBenefit : ccbMonthly + provincialBenefit
  const totalGoingOut = activeChildcare + additionalTotal

  const returnMonthYear = babyDOB ? (() => {
    const d = new Date(babyDOB + 'T12:00:00')
    d.setMonth(d.getMonth() + calcLeaveMonths(leaveType))
    return d.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })
  })() : null

  const compactVerdict = buildCompactVerdict(values)
  // Show only the first sentence — one confident statement
  const firstSentence = compactVerdict.includes('. ')
    ? compactVerdict.split('. ')[0] + '.'
    : compactVerdict

  const timeline = buildTimeline(babyDOB, isExpecting, leaveType, province)
  const actions = buildActionItems(province, null, isExpecting, householdIncome)

  const [checked, setChecked] = useState({})
  function toggleCheck(i) {
    setChecked(prev => ({ ...prev, [i]: !prev[i] }))
  }

  const ccbSubtitle = ccbMonthly < 10
    ? 'Nearly fully phased out — filing taxes early in a lower-income leave year may still generate a small payment.'
    : 'Tax-free, deposited on the 20th'

  const eiSubtitle = hasTopUp
    ? 'EI + employer top-up'
    : `${leaveType === 'extended' ? '33%' : '55%'} of insurable earnings`

  const csvParams = {
    province, leaveType, eiMonthly, ccbMonthly,
    provincialBenefit, provincialBenefitLabel: provBenefitName,
    childcareCost, caregiverIncome, additionalTotal, adjustedNet, needsChildcare,
    onLeave, leaveIncome, returnMonthYear,
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="animate-fade-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2">Your results</p>
        <h1 className="text-3xl font-black text-[var(--color-charcoal)] leading-tight mb-3">
          Your family's monthly picture, {provinceName(province)}, Canada.
        </h1>
        <p className="text-base text-[var(--color-muted)] leading-relaxed">
          {firstSentence}
        </p>
      </div>

      {/* ── Financial statement — three cards grouped at 16px ── */}
      <div className="space-y-4">

        {/* QC flag */}
        {isQC && (
          <div className="bg-[var(--color-positive-light)] border border-[var(--color-positive)] rounded-[12px] px-4 py-3 animate-fade-in">
            <p className="text-[15px] font-semibold text-[var(--color-positive)]">Quebec's QPIP applies to you</p>
            <p className="text-[13px] text-[var(--color-positive)] mt-0.5 opacity-80 leading-relaxed">
              Your leave is administered by Retraite Quebec, not Service Canada. Benefits are generally more generous.
            </p>
          </div>
        )}

        {/* Monthly income during leave */}
        <div
          className="bg-white rounded-[16px] p-5 space-y-4 animate-fade-slide-up opacity-0"
          style={{ animationDelay: '60ms', animationFillMode: 'forwards' }}
        >
          <SectionHeading>
            {onLeave ? 'Monthly income during leave' : 'Monthly income'}
          </SectionHeading>

          {/* Line items with thin dividers between them */}
          <div className="space-y-3">
            {onLeave && (
              <>
                <LineItem
                  label={isQC ? 'QPIP parental leave' : 'EI parental leave'}
                  subtitle={eiSubtitle}
                  value={<>+{fmt(leaveIncome)}<Mo /></>}
                  valueColor="text-[#1A1A1A]"
                />
                <ItemDivider />
              </>
            )}
            <LineItem
              label="Canada Child Benefit"
              subtitle={ccbSubtitle}
              value={<>+{fmt(ccbMonthly)}<Mo /></>}
              valueColor="text-[#1A1A1A]"
            />
            {provincialBenefit > 0 && provBenefitName && (
              <>
                <ItemDivider />
                <LineItem
                  label={provBenefitName}
                  subtitle={
                    province === 'AB'
                      ? 'Paid quarterly (Aug, Nov, Feb, May). Base component only.'
                      : province === 'QC'
                      ? 'Paid quarterly (Jan, Apr, Jul, Oct).'
                      : 'Provincial supplement, tax-free'
                  }
                  value={<>+{fmt(provincialBenefit)}<Mo /></>}
                  valueColor="text-[#1A1A1A]"
                />
              </>
            )}
          </div>

          {/* CCB footnote — grounded inside the section */}
          <div className="flex gap-2.5 bg-[#F7F7F5] rounded-[8px] px-[14px] py-[10px]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
              <circle cx="7" cy="7" r="6" stroke="#6B6B6B" strokeWidth="1.5"/>
              <path d="M7 6.5v3.5" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="7" cy="4.5" r="0.75" fill="#6B6B6B"/>
            </svg>
            <p className="text-[13px] font-normal text-[#6B6B6B] leading-relaxed">
              CCB updates each July from your prior year tax return. A lower-income leave year may increase your benefit next cycle.
            </p>
          </div>

          {/* Section total */}
          <div className="border-t border-[var(--color-sand)] pt-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium text-[var(--color-charcoal)] leading-snug">Total coming in</p>
              <p className="text-[13px] text-[#6B6B6B] mt-0.5">
                {onLeave ? 'Your total monthly income during leave' : 'Your total monthly income'}
              </p>
            </div>
            <p className="text-[18px] font-semibold text-[#2D6A4F] shrink-0">+{fmt(totalComingIn)}<MoTotal /></p>
          </div>
        </div>

        {/* Monthly costs during leave */}
        <div
          className="bg-white rounded-[16px] p-5 space-y-4 animate-fade-slide-up opacity-0"
          style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}
        >
          <SectionHeading>Monthly costs during leave</SectionHeading>

          {/* Line items with thin dividers between them */}
          <div className="space-y-3">
            {/* Childcare — active or future */}
            {needsChildcare ? (
              <LineItem
                label="Estimated childcare"
                subtitle={isQC ? 'Subsidized CPE rate ($13.10/day)' : `${provinceName(province)} monthly average`}
                value={<>-{fmt(childcareCost)}<Mo /></>}
                valueColor="text-[#1A1A1A]"
              />
            ) : (
              <div className="opacity-50 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[15px] font-medium text-[var(--color-charcoal)] leading-snug">Estimated childcare</p>
                  <p className="text-[13px] text-[#6B6B6B] mt-0.5 leading-relaxed">Not included in your current gap calculation</p>
                </div>
                <span className="shrink-0 text-[12px] font-medium text-[#6B6B6B] bg-[#F0F0EE] rounded-[20px] px-[10px] py-1 whitespace-nowrap">
                  {returnMonthYear ? `From ${returnMonthYear}` : 'Future cost'}
                </span>
              </div>
            )}

            {additionalTotal > 0 && (
              <>
                <ItemDivider />
                <LineItem
                  label="Additional costs"
                  subtitle="Based on what you told us"
                  value={<>-{fmt(additionalTotal)}<Mo /></>}
                  valueColor="text-[#1A1A1A]"
                />
              </>
            )}

            {onLeave && (
              <>
                <ItemDivider />
                <LineItem
                  label="Your pre-leave monthly income"
                  subtitle="The income parental leave replaces"
                  value={<>-{fmt(caregiverIncome / 12)}<Mo /></>}
                  valueColor="text-[#1A1A1A]"
                />
              </>
            )}
          </div>

          {/* Section total */}
          <div className="border-t border-[var(--color-sand)] pt-3 flex items-start justify-between gap-4">
            <p className="text-[15px] font-medium text-[var(--color-charcoal)] leading-snug">Total going out</p>
            <p className="text-[18px] font-semibold text-[#92400E] shrink-0">
              -{fmt(totalGoingOut + (onLeave ? caregiverIncome / 12 : 0))}<MoTotal />
            </p>
          </div>
        </div>

        {/* Monthly income gap */}
        <div
          className="bg-[#F7F7F5] border border-[#E5E5E3] rounded-[12px] p-5 space-y-3 animate-fade-slide-up opacity-0"
          style={{ animationDelay: '180ms', animationFillMode: 'forwards' }}
        >
          <SectionHeading>Estimated monthly income gap</SectionHeading>
          {onLeave && (
            <div className="text-[14px] font-normal text-[var(--color-muted)] space-y-0.5">
              <p>{fmt(totalComingIn)}/mo coming in</p>
              <p>{fmt(totalGoingOut + caregiverIncome / 12)}/mo to cover</p>
            </div>
          )}
          <p className={`text-[36px] font-bold leading-none ${netPositive ? 'text-[#2D6A4F]' : 'text-[#92400E]'}`}>
            {netPositive ? '+' : '-'}{fmt(adjustedNet)}<span className="text-[20px] font-semibold">/month</span>
          </p>
          {netPositive ? (
            <p className="text-[13px] font-semibold text-[#2D6A4F] leading-relaxed">
              You are in a strong position heading into leave.
            </p>
          ) : (
            <p className="text-[13px] font-normal text-[var(--color-muted)] leading-relaxed">
              Most families cover this gap with savings built before leave starts. The checklist below shows where to begin.
            </p>
          )}
        </div>

      </div>
      {/* ── End financial statement ── */}

      {/* Disclaimer — contextual to the gap figures above */}
      <div className="flex gap-2.5 bg-[#F7F7F5] rounded-[8px] px-[14px] py-[10px]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
          <circle cx="7" cy="7" r="6" stroke="#6B6B6B" strokeWidth="1.5"/>
          <path d="M7 6.5v3.5" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="7" cy="4.5" r="0.75" fill="#6B6B6B"/>
        </svg>
        <p className="text-[13px] font-normal text-[#6B6B6B] leading-relaxed">
          All figures are estimates based on gross pre-tax income. Actual take-home amounts will vary based on your tax situation.
        </p>
      </div>

      <Divider />

      {/* Your next 18 months */}
      <div>
        <SectionHeading>Your next 18 months</SectionHeading>
        <div className="mt-6">
          {timeline.map((step, i) => (
            <TimelineStep key={i} index={i} isLast={i === timeline.length - 1} {...step} />
          ))}
        </div>
      </div>

      <Divider />

      {/* Start with these */}
      <div>
        <SectionHeading>Your first moves</SectionHeading>
        <p className="text-[13px] font-normal text-[var(--color-muted)] mt-1 mb-4 leading-relaxed">
          Tap any item to open the official government resource.
        </p>
        <div className="space-y-2.5">
          {actions.map((item, i) => (
            <ActionItem
              key={i}
              item={item}
              index={i}
              checked={!!checked[i]}
              onToggle={() => toggleCheck(i)}
            />
          ))}
        </div>
      </div>

      <Divider />

      {/* Footer — Export + Edit, identical button style, side by side on desktop */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
        <ExportDropdown csvParams={csvParams} province={province} />
        <button
          onClick={onEdit}
          className="flex-1 min-h-[48px] h-12 flex items-center justify-center rounded-[12px] font-medium text-[15px] border border-[#E5E5E3] text-[#1A1A1A] bg-white hover:bg-[#F7F7F5] transition-all duration-200"
        >
          Edit my details
        </button>
      </div>

      <div className="pb-8" />

    </div>
  )
}
