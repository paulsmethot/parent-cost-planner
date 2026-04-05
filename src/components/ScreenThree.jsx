import { calcEIMonthly } from '../lib/calculations'
import CurrencyInput from './CurrencyInput'

const QUICK_SELECTS = [
  { label: '$40K', value: 40000 },
  { label: '$55K', value: 55000 },
  { label: '$70K', value: 70000 },
  { label: '$85K', value: 85000 },
  { label: '$100K', value: 100000 },
  { label: '$120K+', value: null },
]

function formatCAD(n) {
  return '$' + Math.round(n).toLocaleString('en-CA')
}

export default function ScreenThree({ values, onChange, onBack, onNext }) {
  const { caregiverIncome } = values
  const estimatedEI = calcEIMonthly(caregiverIncome, 'standard')
  const canContinue = caregiverIncome > 0

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          What does the primary caregiver earn before leave?
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Enter the annual salary of whoever is taking parental leave. We'll calculate estimated EI payments from this.
        </p>
      </div>

      <CurrencyInput
        value={caregiverIncome}
        onChange={(v) => onChange('caregiverIncome', v)}
        quickSelects={QUICK_SELECTS}
        label="Caregiver's current annual salary *"
        hint="Use the salary before any leave begins. We'll calculate the EI amount for you."
      />

      {/* Live EI preview */}
      {caregiverIncome > 0 && (
        <div className="bg-white border border-[var(--color-sand)] rounded-[12px] px-5 py-4 screen-enter">
          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide mb-1">
            Estimated EI benefit (standard leave)
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-[var(--color-positive)]">{formatCAD(estimatedEI)}</span>
            <span className="text-sm font-semibold text-[var(--color-muted)]">/month</span>
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-1.5">
            55% of insurable earnings, capped at $63,200/year. Adjusted once you choose your leave type.
          </p>
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
