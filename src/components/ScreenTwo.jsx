function formatCAD(n) {
  return '$' + Math.round(n).toLocaleString('en-CA')
}

export default function ScreenTwo({ values, onChange, onBack, onNext }) {
  const { householdIncome } = values

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          What does your household earn today?
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Include the combined salary of both parents or guardians, based on what you each earn today — before any leave begins.
        </p>
      </div>

      {/* Slider */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide mb-1">
            Total household income before baby arrives
          </p>
          <p className="text-4xl font-black text-[var(--color-accent)]">{formatCAD(householdIncome)}</p>
        </div>
        <input
          type="range"
          min={0}
          max={300000}
          step={1000}
          value={householdIncome}
          onChange={(e) => onChange('householdIncome', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-[var(--color-stone)]">
          <span>$0</span>
          <span>$300,000</span>
        </div>
      </div>

      {/* Context callout */}
      <div className="bg-[var(--color-accent-light)] rounded-[12px] px-4 py-3.5">
        <p className="text-xs text-[var(--color-accent)] font-semibold leading-relaxed">
          This figure determines your Canada Child Benefit (CCB) — the higher your household income, the lower the monthly payment.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-[20px] font-bold text-base bg-white border border-[var(--color-sand)] text-[var(--color-charcoal)] hover:border-[var(--color-bark)] transition-all duration-200"
        >
          ←
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 rounded-[20px] font-bold text-base bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] active:scale-[0.98] transition-all duration-200"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
