import {
  calcEIMonthly,
  calcCCBMonthly,
  calcChildcareCost,
  calcIncomeDropMonthly,
  calcNetMonthlyImpact,
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

function MetricCard({ label, value, valueColor, note, prefix = '', delay = 0 }) {
  return (
    <div
      className="bg-white rounded-[16px] p-5 space-y-2 animate-fade-slide-up opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">{label}</p>
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
      <div className={`${isLast ? 'pb-0' : 'pb-6'}`}>
        <p className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wide">{month}</p>
        <p className="text-sm font-bold text-[var(--color-charcoal)] mt-0.5">{label}</p>
        <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}

function ActionCard({ text, index }) {
  return (
    <div
      className="flex gap-4 bg-white rounded-[16px] p-5 animate-fade-slide-up opacity-0"
      style={{ animationDelay: `${480 + index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <div className="w-7 h-7 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
        {index + 1}
      </div>
      <p className="text-sm text-[var(--color-charcoal)] leading-relaxed">{text}</p>
    </div>
  )
}

export default function Results({ values, onEdit }) {
  const { province, householdIncome, caregiverIncome, babyStage, leaveType, employerTopUp = 0 } = values
  const isQC = province === 'QC'
  const isLeaveStage = babyStage === 'expecting' || babyStage === 'newborn'
  const hasTopUp = leaveType === 'topup' && employerTopUp > 0

  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  const leaveIncome = hasTopUp ? eiMonthly + employerTopUp : eiMonthly
  const ccbMonthly = calcCCBMonthly(householdIncome)
  const childcareCost = calcChildcareCost(province)
  const netImpact = calcNetMonthlyImpact(caregiverIncome, householdIncome, province, leaveType, babyStage, employerTopUp)
  const netPositive = netImpact >= 0

  const compactVerdict = buildCompactVerdict(values)
  const timeline = buildTimeline(babyStage, leaveType, province)
  const actions = buildActionItems(province, babyStage, householdIncome)

  // ── metric card config ──────────────────────────────────────────────────────
  const metrics = [
    {
      label: isLeaveStage ? (isQC ? 'Monthly income on leave' : 'Monthly income on leave') : 'EI / Leave income',
      value: isLeaveStage ? fmt(leaveIncome) : '—',
      valueColor: 'text-[var(--color-positive)]',
      note: isLeaveStage
        ? isQC ? 'QPIP estimate' : hasTopUp ? 'EI + employer top-up' : `${leaveType === 'extended' ? '33%' : '55%'} of insurable earnings`
        : 'Leave stage has passed',
    },
    {
      label: 'Canada Child Benefit',
      value: fmt(ccbMonthly),
      valueColor: 'text-[var(--color-positive)]',
      note: 'Monthly, tax-free — deposited on the 20th',
    },
    {
      label: 'Estimated childcare',
      value: fmt(childcareCost),
      valueColor: 'text-[var(--color-negative)]',
      note: isQC ? 'Subsidized CPE rate ($13.10/day)' : `${provinceName(province)} average`,
    },
    {
      label: 'Net monthly vs. today',
      value: fmt(netImpact),
      prefix: netPositive ? '+' : '−',
      valueColor: netPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]',
      note: isLeaveStage ? 'EI + CCB minus childcare (when back)' : 'CCB minus childcare',
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
            Your parental leave is administered by Retraite Québec, not Service Canada. Benefits are generally more generous.
          </p>
        </div>
      )}

      {/* Header */}
      <div
        className="animate-fade-slide-up opacity-0"
        style={{ animationFillMode: 'forwards' }}
      >
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2">Your results</p>
        <h1 className="text-3xl font-black text-[var(--color-charcoal)] leading-tight mb-3">
          Here's your picture, {provinceName(province)}.
        </h1>
        <p className="text-base text-[var(--color-muted)] leading-relaxed max-w-[680px]">
          {compactVerdict}
        </p>
      </div>

      {/* Metric cards — 2x2 mobile, 4-across desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <MetricCard key={m.label} {...m} delay={60 + i * 50} />
        ))}
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

      {/* Action items */}
      <div>
        <h2 className="text-xl font-black text-[var(--color-charcoal)] mb-4">Do these first</h2>
        <div className="space-y-2.5">
          {actions.map((action, i) => (
            <ActionCard key={i} index={i} text={action} />
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
