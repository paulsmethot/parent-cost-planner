import { useState } from 'react'
import {
  calcEIMonthly,
  calcCCBMonthly,
  calcChildcareCost,
  calcAdditionalCostsTotal,
  calcNetMonthlyImpact,
  isLeaveActive,
  buildTimeline,
  buildActionItems,
  buildCompactVerdict,
  provinceName,
} from '../lib/calculations'

function fmtAbs(n) {
  return '$' + Math.abs(Math.round(n)).toLocaleString('en-CA')
}

function Divider() {
  return <div className="border-t border-[var(--color-sand)]" />
}

function MetricCard({ label, value, valueColor, note, prefix = '', delay = 0 }) {
  return (
    <div
      className="bg-white rounded-[16px] p-5 space-y-2 animate-fade-slide-up opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide leading-tight">{label}</p>
      <p className={`text-2xl font-black leading-none ${valueColor}`}>
        {prefix}{value}
      </p>
      {note && <p className="text-xs text-[var(--color-muted)] leading-relaxed">{note}</p>}
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
        <p className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wide">{month}</p>
        <p className="text-sm font-bold text-[var(--color-charcoal)] mt-0.5">{label}</p>
        <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}

// Interactive action item with checkbox + external link
function ActionItem({ item, index, checked, onToggle }) {
  return (
    <div
      className="flex gap-3 bg-white rounded-[16px] p-5 animate-fade-slide-up opacity-0"
      style={{ animationDelay: `${480 + index * 60}ms`, animationFillMode: 'forwards' }}
    >
      {/* Checkbox */}
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

      {/* Text */}
      <p className={`flex-1 text-sm leading-relaxed transition-all duration-150 ${
        checked ? 'line-through text-[var(--color-stone)]' : 'text-[var(--color-charcoal)]'
      }`}>
        {item.text}
      </p>

      {/* External link */}
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

export default function Results({ values, onEdit }) {
  const {
    province, householdIncome, caregiverIncome, leaveType,
    babyDOB, isExpecting, additionalCosts = {}, employerTopUp = 0,
  } = values

  const isQC = province === 'QC'
  const hasTopUp = leaveType === 'topup' && employerTopUp > 0
  const onLeave = isLeaveActive(babyDOB, isExpecting, leaveType)

  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  const leaveIncome = hasTopUp ? eiMonthly + employerTopUp : eiMonthly
  const ccbMonthly = calcCCBMonthly(householdIncome)
  const childcareCost = calcChildcareCost(province)
  const additionalTotal = calcAdditionalCostsTotal(additionalCosts)
  const netImpact = calcNetMonthlyImpact(values)
  const netPositive = netImpact >= 0

  const compactVerdict = buildCompactVerdict(values)
  const timeline = buildTimeline(babyDOB, isExpecting, leaveType, province)
  const actions = buildActionItems(province, null, isExpecting, householdIncome)

  // Checkbox state — in-session only
  const [checked, setChecked] = useState({})
  function toggleCheck(i) {
    setChecked(prev => ({ ...prev, [i]: !prev[i] }))
  }

  // ── CCB note ────────────────────────────────────────────────────────────────
  const ccbNote = ccbMonthly === 0
    ? 'Your household income exceeds the phase-out threshold (~$106K). CCB is $0 at this income.'
    : 'Monthly, tax-free — deposited on the 20th of each month'

  // ── Net note ────────────────────────────────────────────────────────────────
  const netNoteBase = onLeave
    ? 'EI − your salary + CCB − childcare − other costs'
    : 'CCB − childcare − other costs vs. pre-baby'
  const netNote = additionalTotal > 0
    ? `${netNoteBase} (incl. $${additionalTotal.toLocaleString('en-CA')}/mo added costs)`
    : netNoteBase

  // ── Metric cards ────────────────────────────────────────────────────────────
  const metrics = [
    {
      label: isQC ? 'Monthly income on leave (QPIP)' : 'Monthly income on leave',
      value: onLeave ? fmtAbs(leaveIncome) : '—',
      valueColor: onLeave ? 'text-[var(--color-positive)]' : 'text-[var(--color-stone)]',
      note: onLeave
        ? isQC ? 'QPIP estimate via Retraite Québec'
          : hasTopUp ? 'EI + employer top-up'
          : `${leaveType === 'extended' ? '33%' : '55%'} of insurable earnings`
        : 'Leave window has passed for this baby',
    },
    {
      label: 'Canada Child Benefit',
      value: fmtAbs(ccbMonthly),
      valueColor: ccbMonthly > 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-stone)]',
      note: ccbNote,
    },
    {
      label: 'Estimated childcare',
      value: fmtAbs(childcareCost),
      valueColor: 'text-[var(--color-negative)]',
      note: isQC ? 'Subsidized CPE rate ($13.10/day)' : `${provinceName(province)} monthly average`,
    },
    {
      label: 'Net monthly vs. today',
      value: fmtAbs(netImpact),
      prefix: netPositive ? '+' : '−',
      valueColor: netPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]',
      note: netNote,
    },
  ]

  return (
    <div className="space-y-10">

      {/* QC flag */}
      {isQC && (
        <div className="bg-[var(--color-positive-light)] border border-[var(--color-positive)] rounded-[12px] px-4 py-3 animate-fade-in">
          <p className="text-sm font-bold text-[var(--color-positive)]">
            🍁 Quebec's QPIP applies to you
          </p>
          <p className="text-xs text-[var(--color-positive)] mt-0.5 opacity-80">
            Your leave is administered by Retraite Québec, not Service Canada. Benefits are generally more generous.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="animate-fade-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2">Your results</p>
        <h1 className="text-3xl font-black text-[var(--color-charcoal)] leading-tight mb-3">
          Here's your picture, {provinceName(province)}.
        </h1>
        <p className="text-base text-[var(--color-muted)] leading-relaxed max-w-[680px]">
          {compactVerdict}
        </p>
      </div>

      {/* Metric cards — 2×2 mobile, 4-across desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <MetricCard key={m.label} {...m} delay={60 + i * 50} />
        ))}
      </div>

      {additionalTotal > 0 && (
        <div className="bg-[var(--color-warning-light)] border border-[var(--color-warning)] rounded-[12px] px-4 py-3 animate-fade-in">
          <p className="text-xs font-bold text-[var(--color-warning)] uppercase tracking-wide mb-0.5">Additional costs factored in</p>
          <p className="text-sm text-[var(--color-charcoal)]">
            Your {fmtAbs(additionalTotal)}/month in additional costs is included in the net monthly figure above.
          </p>
        </div>
      )}

      <Divider />

      {/* Timeline */}
      <div>
        <h2 className="text-xl font-black text-[var(--color-charcoal)] mb-6">The next 18 months</h2>
        <div>
          {timeline.map((step, i) => (
            <TimelineStep key={i} index={i} isLast={i === timeline.length - 1} {...step} />
          ))}
        </div>
      </div>

      <Divider />

      {/* Do these first — interactive checklist */}
      <div>
        <h2 className="text-xl font-black text-[var(--color-charcoal)] mb-1">Do these first</h2>
        <p className="text-sm text-[var(--color-muted)] mb-4">
          Check each off as you go. Tap the link icon to open the official resource.
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

      {/* Ghost edit button */}
      <div className="pt-2 pb-8">
        <button
          onClick={onEdit}
          className="w-full py-3.5 rounded-[20px] font-semibold text-sm border border-[var(--color-sand)] text-[var(--color-muted)] bg-transparent hover:border-[var(--color-bark)] hover:text-[var(--color-charcoal)] transition-all duration-200"
        >
          Edit my details
        </button>
      </div>
    </div>
  )
}
