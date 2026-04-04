const LEAVE_TYPES = [
  {
    value: 'standard',
    label: 'Standard',
    desc: '12 months at 55% of insurable earnings — the most common choice',
  },
  {
    value: 'extended',
    label: 'Extended',
    desc: '18 months at 33% of insurable earnings — lower monthly but longer runway',
  },
  {
    value: 'shared',
    label: 'Shared',
    desc: 'Split between both parents — combined up to 12 or 18 months total',
  },
  {
    value: 'topup',
    label: 'Employer top-up',
    desc: 'Your employer supplements EI — common in government and some corporate roles',
  },
]

function formatCAD(n) {
  return '$' + Math.round(n).toLocaleString('en-CA')
}

export default function ScreenFour({ values, onChange, onBack, onNext }) {
  const { leaveType, employerTopUp } = values

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          What kind of leave are you taking?
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Choose the option that best fits your situation.
        </p>
      </div>

      {/* Full leave type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LEAVE_TYPES.map((t) => {
          const selected = leaveType === t.value
          return (
            <button
              key={t.value}
              onClick={() => onChange('leaveType', t.value)}
              className={`
                text-left rounded-[16px] p-5 transition-all duration-150 border-2
                ${selected
                  ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                  : 'bg-white border-[var(--color-sand)] text-[var(--color-charcoal)] hover:border-[var(--color-accent)]'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-base font-bold leading-tight">{t.label}</span>
                {selected && (
                  <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${selected ? 'text-white/80' : 'text-[var(--color-muted)]'}`}>
                {t.desc}
              </p>
            </button>
          )
        })}
      </div>

      {/* Top-up secondary input */}
      {leaveType === 'topup' && (
        <div className="bg-white border border-[var(--color-sand)] rounded-[16px] p-5 space-y-4 screen-enter">
          <div>
            <p className="text-sm font-bold text-[var(--color-charcoal)]">
              Estimated monthly top-up from your employer
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Optional — the amount your employer adds on top of EI each month.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-3xl font-black text-[var(--color-accent)]">{formatCAD(employerTopUp ?? 0)}<span className="text-sm font-semibold text-[var(--color-muted)]">/month</span></p>
            <input
              type="range"
              min={0}
              max={3000}
              step={50}
              value={employerTopUp ?? 0}
              onChange={(e) => onChange('employerTopUp', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[var(--color-stone)]">
              <span>$0</span>
              <span>$3,000</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-[20px] font-bold text-base bg-white border border-[var(--color-sand)] text-[var(--color-charcoal)] hover:border-[var(--color-bark)] transition-all duration-200"
        >
          ←
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 rounded-[20px] font-bold text-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] active:scale-[0.98] transition-all duration-200"
        >
          See my numbers →
        </button>
      </div>
    </div>
  )
}
