import {
  calcEIMonthly,
  calcCCBMonthly,
  calcChildcareCost,
  calcIncomeDropMonthly,
  calcNetMonthlyImpact,
  buildTimeline,
  buildActionItems,
  buildVerdict,
  provinceName,
} from '../lib/calculations'

function fmt(n) {
  return '$' + Math.abs(Math.round(n)).toLocaleString('en-CA')
}

function MetricCard({ label, value, valueColor, note, className = '', delay = 0 }) {
  return (
    <div
      className={`bg-white rounded-[12px] p-4 space-y-1 animate-fade-slide-up opacity-0 ${className}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      {note && <div className="text-xs text-[var(--color-muted)]">{note}</div>}
    </div>
  )
}

function TimelineStep({ month, label, detail, index }) {
  return (
    <div
      className="flex gap-4 animate-fade-slide-up opacity-0"
      style={{ animationDelay: `${300 + index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] mt-1 shrink-0" />
        {index < 3 && <div className="w-0.5 bg-[var(--color-sand)] flex-1 mt-1" />}
      </div>
      <div className="pb-5">
        <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wide">{month}</div>
        <div className="text-sm font-bold text-[var(--color-charcoal)] mt-0.5">{label}</div>
        <div className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">{detail}</div>
      </div>
    </div>
  )
}

export default function Results({ values, onBack }) {
  const { province, householdIncome, caregiverIncome, babyStage, leaveType } = values
  const isQC = province === 'QC'
  const isLeaveStage = babyStage === 'expecting' || babyStage === 'newborn'

  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  const ccbMonthly = calcCCBMonthly(householdIncome)
  const childcareCost = calcChildcareCost(province)
  const incomeDrop = calcIncomeDropMonthly(caregiverIncome, leaveType)
  const netImpact = calcNetMonthlyImpact(caregiverIncome, householdIncome, province, leaveType, babyStage)
  const verdict = buildVerdict(values)
  const timeline = buildTimeline(babyStage, leaveType, province)
  const actions = buildActionItems(province, babyStage, householdIncome)

  const netPositive = netImpact >= 0

  return (
    <div className="space-y-6">
      {/* QC banner */}
      {isQC && (
        <div className="bg-[var(--color-positive-light)] border border-[var(--color-positive)] rounded-[12px] px-4 py-3 animate-fade-in">
          <div className="text-sm font-bold text-[var(--color-positive)]">
            🍁 Quebec's QPIP applies to you
          </div>
          <div className="text-xs text-[var(--color-positive)] mt-0.5 opacity-80">
            Your parental leave is through Retraite Québec, not Service Canada. Benefits are generally more generous.
          </div>
        </div>
      )}

      {/* Verdict */}
      <div
        className="bg-[var(--color-accent-light)] rounded-[12px] p-5 animate-scale-in opacity-0"
        style={{ animationFillMode: 'forwards' }}
      >
        <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wide mb-2">Your situation</div>
        <p className="text-sm leading-relaxed text-[var(--color-charcoal)]">{verdict}</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        {isLeaveStage && (
          <MetricCard
            label="EI monthly"
            value={fmt(eiMonthly)}
            valueColor="text-[var(--color-positive)]"
            note={isQC ? 'QPIP estimate' : `${leaveType === 'extended' ? '33%' : '55%'} of insurable earnings`}
            delay={80}
          />
        )}
        {isLeaveStage && (
          <MetricCard
            label="Income drop"
            value={fmt(incomeDrop)}
            valueColor="text-[var(--color-negative)]"
            note="Per month vs your regular pay"
            delay={130}
          />
        )}
        <MetricCard
          label="CCB monthly"
          value={fmt(ccbMonthly)}
          valueColor="text-[var(--color-positive)]"
          note="Tax-free, deposits 20th of month"
          delay={180}
        />
        <MetricCard
          label="Childcare cost"
          value={fmt(childcareCost)}
          valueColor="text-[var(--color-negative)]"
          note={isQC ? 'CPE subsidized rate' : `${provinceName(province)} average`}
          delay={230}
        />
        <MetricCard
          label="Net monthly"
          value={(netPositive ? '+' : '−') + fmt(netImpact)}
          valueColor={netPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}
          note={isLeaveStage ? 'EI + CCB − childcare (post-leave)' : 'CCB − childcare'}
          className="col-span-2"
          delay={280}
        />
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-bold text-[var(--color-charcoal)] mb-4">Your 18-month timeline</h3>
        <div>
          {timeline.map((step, i) => (
            <TimelineStep key={i} index={i} {...step} />
          ))}
        </div>
      </div>

      {/* Action items */}
      <div>
        <h3 className="text-lg font-bold text-[var(--color-charcoal)] mb-3">4 things to do now</h3>
        <div className="space-y-2">
          {actions.map((action, i) => (
            <div
              key={i}
              className="flex gap-3 bg-white rounded-[12px] p-4 animate-fade-slide-up opacity-0"
              style={{ animationDelay: `${420 + i * 60}ms`, animationFillMode: 'forwards' }}
            >
              <div className="w-6 h-6 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-[var(--color-charcoal)] leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full py-4 rounded-[20px] font-bold text-sm bg-white border border-[var(--color-sand)] text-[var(--color-charcoal)] hover:border-[var(--color-bark)] transition-all duration-200"
      >
        ← Adjust inputs
      </button>
    </div>
  )
}
