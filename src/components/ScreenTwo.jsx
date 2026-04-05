import CurrencyInput from './CurrencyInput'

const QUICK_SELECTS = [
  { label: '$60K', value: 60000 },
  { label: '$80K', value: 80000 },
  { label: '$100K', value: 100000 },
  { label: '$120K', value: 120000 },
  { label: '$150K', value: 150000 },
  { label: '$200K+', value: null },
]

export default function ScreenTwo({ values, onChange, onBack, onNext }) {
  const { householdIncome } = values
  const canContinue = householdIncome > 0

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          What does your household earn today?
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Include the combined salary of both parents or guardians, before any leave begins.
        </p>
      </div>

      <CurrencyInput
        value={householdIncome}
        onChange={(v) => onChange('householdIncome', v)}
        quickSelects={QUICK_SELECTS}
        label="Total household income before baby arrives *"
        hint="This determines your Canada Child Benefit. The higher your household income, the lower the monthly payment."
      />

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-[20px] font-bold text-base bg-white border border-[var(--color-sand)] text-[var(--color-charcoal)] hover:border-[var(--color-bark)] transition-all duration-200"
        >
          ←
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`flex-1 py-4 rounded-[20px] font-bold text-base transition-all duration-200 ${
            canContinue
              ? 'bg-[var(--color-accent)] text-white hover:opacity-80 active:scale-[0.98]'
              : 'bg-[var(--color-sand)] text-[var(--color-stone)] cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
