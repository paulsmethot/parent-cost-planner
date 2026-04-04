const LEAVE_TYPES = [
  {
    value: 'standard',
    label: 'Standard',
    desc: '12 months at 55%',
  },
  {
    value: 'extended',
    label: 'Extended',
    desc: '18 months at 33%',
  },
  {
    value: 'shared',
    label: 'Shared',
    desc: 'Split between parents',
  },
]

function formatCAD(n) {
  return '$' + Math.round(n).toLocaleString('en-CA')
}

function IncomeSlider({ label, hint, value, onChange, min = 0, max = 200000, step = 1000 }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-bold text-[var(--color-charcoal)]">{label}</label>
        <span className="text-lg font-bold text-[var(--color-accent)]">{formatCAD(value)}</span>
      </div>
      {hint && <p className="text-xs text-[var(--color-muted)]">{hint}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-[var(--color-stone)]">
        <span>{formatCAD(min)}</span>
        <span>{formatCAD(max)}</span>
      </div>
    </div>
  )
}

export default function ScreenTwo({ values, onChange, onBack, onNext }) {
  const { householdIncome, caregiverIncome, leaveType } = values

  return (
    <div className="animate-fade-slide-up space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-charcoal)] mb-1">
          Your household income
        </h2>
        <p className="text-[var(--color-muted)] text-sm">
          Used to calculate your Canada Child Benefit.
        </p>
      </div>

      <div className="space-y-6">
        <IncomeSlider
          label="Combined household income"
          hint="Include all adults in your household"
          value={householdIncome}
          onChange={(v) => onChange('householdIncome', v)}
          min={0}
          max={250000}
          step={1000}
        />

        <IncomeSlider
          label="Caregiver income (taking leave)"
          hint="The person going on parental leave"
          value={caregiverIncome}
          onChange={(v) => onChange('caregiverIncome', v)}
          min={0}
          max={150000}
          step={1000}
        />
      </div>

      {/* Leave type */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-charcoal)] mb-1">
          Leave type
        </h2>
        <p className="text-[var(--color-muted)] text-sm mb-4">
          Longer leave = lower weekly benefit. Choose what fits your family.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {LEAVE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => onChange('leaveType', t.value)}
              className={`
                py-3 px-3 rounded-[12px] text-center transition-all duration-150
                ${leaveType === t.value
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-white text-[var(--color-charcoal)] border border-[var(--color-sand)] hover:border-[var(--color-accent)]'
                }
              `}
            >
              <div className="text-sm font-bold">{t.label}</div>
              <div className={`text-xs mt-0.5 ${leaveType === t.value ? 'text-white/80' : 'text-[var(--color-muted)]'}`}>
                {t.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-[20px] font-bold text-base bg-white border border-[var(--color-sand)] text-[var(--color-charcoal)] hover:border-[var(--color-bark)] transition-all duration-200"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-4 rounded-[20px] font-bold text-base bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] active:scale-[0.98] transition-all duration-200"
        >
          See results →
        </button>
      </div>
    </div>
  )
}
