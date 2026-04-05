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

function fmt(n) {
  return '$' + Math.abs(Math.round(n)).toLocaleString('en-CA')
}

function Divider() {
  return <div className="border-t border-[var(--color-sand)]" />
}

function LineItem({ label, subtitle, value, valueColor }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[var(--color-charcoal)]">{label}</p>
        {subtitle && <p className="text-xs text-[var(--color-muted)] mt-0.5">{subtitle}</p>}
      </div>
      <p className={`text-sm font-black shrink-0 ${valueColor}`}>{value}</p>
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
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">{month}</p>
        <p className="text-sm font-bold text-[var(--color-charcoal)] mt-0.5">{label}</p>
        <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">{detail}</p>
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

      <p className={`flex-1 text-sm leading-relaxed transition-all duration-150 ${
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

export default function Results({ values, onEdit }) {
  const {
    province, householdIncome, caregiverIncome, leaveType,
    babyDOB, isExpecting, additionalCosts = [], employerTopUp = 0,
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

  const totalComingIn = onLeave ? leaveIncome + ccbMonthly : ccbMonthly
  const totalGoingOut = childcareCost + additionalTotal

  const compactVerdict = buildCompactVerdict(values)
  const timeline = buildTimeline(babyDOB, isExpecting, leaveType, province)
  const actions = buildActionItems(province, null, isExpecting, householdIncome)

  const [checked, setChecked] = useState({})
  function toggleCheck(i) {
    setChecked(prev => ({ ...prev, [i]: !prev[i] }))
  }

  const ccbSubtitle = ccbMonthly < 50
    ? 'Reduced at this income level — file taxes early to increase.'
    : 'Tax-free, deposited on the 20th'

  const eiSubtitle = hasTopUp
    ? 'EI + employer top-up'
    : `${leaveType === 'extended' ? '33%' : '55%'} of insurable earnings`

  return (
    <div className="space-y-10">

      {/* QC flag */}
      {isQC && (
        <div className="bg-[var(--color-positive-light)] border border-[var(--color-positive)] rounded-[12px] px-4 py-3 animate-fade-in">
          <p className="text-sm font-bold text-[var(--color-positive)]">
            Quebec's QPIP applies to you
          </p>
          <p className="text-xs text-[var(--color-positive)] mt-0.5 opacity-80">
            Your leave is administered by Retraite Quebec, not Service Canada. Benefits are generally more generous.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="animate-fade-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2">Your results</p>
        <h1 className="text-3xl font-black text-[var(--color-charcoal)] leading-tight mb-3">
          Your family's monthly picture, {provinceName(province)}, Canada.
        </h1>
        <p className="text-base text-[var(--color-muted)] leading-relaxed max-w-[680px]">
          {compactVerdict}
        </p>
      </div>

      {/* Section 1 — What's coming in */}
      <div
        className="bg-white rounded-[16px] p-5 space-y-4 animate-fade-slide-up opacity-0"
        style={{ animationDelay: '60ms', animationFillMode: 'forwards' }}
      >
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">
          {onLeave ? "What's coming in during leave" : "What's coming in"}
        </p>

        <div className="space-y-3">
          {onLeave && (
            <LineItem
              label={isQC ? 'QPIP parental leave' : 'EI parental leave'}
              subtitle={eiSubtitle}
              value={`+${fmt(leaveIncome)}/mo`}
              valueColor="text-[#2D6A4F]"
            />
          )}
          <LineItem
            label="Canada Child Benefit"
            subtitle={ccbSubtitle}
            value={`+${fmt(ccbMonthly)}/mo`}
            valueColor="text-[#2D6A4F]"
          />
        </div>

        <div className="border-t border-[var(--color-sand)] pt-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[var(--color-charcoal)]">Total coming in</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              {onLeave ? 'Your total monthly income during leave' : 'Your total monthly income'}
            </p>
          </div>
          <p className="text-xl font-black text-[#2D6A4F] shrink-0">+{fmt(totalComingIn)}/mo</p>
        </div>

        <p className="text-xs text-[var(--color-muted)] leading-relaxed border-t border-[var(--color-sand)] pt-3">
          CCB is recalculated each July based on your prior year tax return. A lower income year during parental leave may increase your benefit next cycle.
        </p>
      </div>

      {/* Section 2 — What you'll need to cover */}
      <div
        className="bg-white rounded-[16px] p-5 space-y-4 animate-fade-slide-up opacity-0"
        style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}
      >
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">
          What you'll need to cover
        </p>

        <div className="space-y-3">
          <LineItem
            label="Estimated childcare"
            subtitle={isQC ? 'Subsidized CPE rate ($13.10/day)' : `${provinceName(province)} monthly average`}
            value={`-${fmt(childcareCost)}/mo`}
            valueColor="text-[#92400E]"
          />
          {additionalTotal > 0 && (
            <LineItem
              label="Additional costs"
              subtitle="Based on what you told us"
              value={`-${fmt(additionalTotal)}/mo`}
              valueColor="text-[#92400E]"
            />
          )}
          {onLeave && (
            <LineItem
              label="Your pre-leave monthly salary"
              subtitle="The income parental leave replaces"
              value={`-${fmt(caregiverIncome / 12)}/mo`}
              valueColor="text-[#92400E]"
            />
          )}
        </div>

        <div className="border-t border-[var(--color-sand)] pt-3 flex items-start justify-between gap-4">
          <p className="text-sm font-bold text-[var(--color-charcoal)]">Total going out</p>
          <p className="text-xl font-black text-[#92400E] shrink-0">-{fmt(totalGoingOut + (onLeave ? caregiverIncome / 12 : 0))}/mo</p>
        </div>
      </div>

      {/* Section 3 — Bottom line */}
      <div
        className="bg-[#F7F7F5] rounded-[16px] p-5 space-y-3 animate-fade-slide-up opacity-0"
        style={{ animationDelay: '180ms', animationFillMode: 'forwards' }}
      >
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">
          {onLeave ? 'Your monthly leave gap' : 'Monthly difference'}
        </p>
        {onLeave && (
          <div className="text-xs text-[var(--color-muted)] space-y-0.5">
            <p>{fmt(totalComingIn)}/mo coming in</p>
            <p>{fmt(totalGoingOut + caregiverIncome / 12)}/mo to cover</p>
          </div>
        )}
        <p className={`text-3xl font-black leading-none ${netPositive ? 'text-[#2D6A4F]' : 'text-[#92400E]'}`}>
          {netPositive ? '+' : '-'}{fmt(netImpact)}<span className="text-lg font-semibold opacity-60">/mo</span>
        </p>
        {netPositive ? (
          <p className="text-xs font-semibold text-[#2D6A4F] leading-relaxed">
            You are in a strong position heading into leave.
          </p>
        ) : (
          <p className="text-xs text-[var(--color-muted)] leading-relaxed">
            This gap is normal. Most families bridge it with savings built before leave, or by adjusting spending during the leave period.
          </p>
        )}
      </div>

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

      {/* Do these first */}
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
