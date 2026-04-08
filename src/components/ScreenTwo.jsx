import { calcEIMonthly } from '../lib/calculations'
import CurrencyInput from './CurrencyInput'

const QUICK_SELECTS = [
  { label: '$50K', value: 50000 },
  { label: '$75K', value: 75000 },
  { label: '$100K', value: 100000 },
  { label: '$125K', value: 125000 },
  { label: '$150K', value: 150000 },
  { label: 'Custom', value: null },
]

function fmt(n) {
  return '$' + Math.round(n).toLocaleString('en-CA')
}

export default function ScreenTwo({ values, onChange, onBack, onNext }) {
  const { caregiverIncome, partnerIncome } = values
  const canContinue = caregiverIncome > 0
  const estimatedEI = calcEIMonthly(caregiverIncome, 'standard')

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          What does your household earn today?
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          We use these to calculate your EI payments and Canada Child Benefit.
        </p>
      </div>

      {/* Field 1 — Primary caregiver */}
      <CurrencyInput
        value={caregiverIncome}
        onChange={(v) => onChange('caregiverIncome', v)}
        quickSelects={QUICK_SELECTS}
        label="PRIMARY CAREGIVER SALARY (PRE-LEAVE)"
        sublabel="The person taking parental leave"
        placeholder="Enter your annual salary"
      />

      {/* Live EI preview */}
      {caregiverIncome > 0 && (
        <div className="bg-white border border-[var(--color-sand)] rounded-[12px] px-5 py-4 screen-enter -mt-4">
          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide mb-1">
            Estimated EI benefit (standard leave)
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[var(--color-positive)]">{fmt(estimatedEI)}</span>
            <span className="text-sm font-semibold text-[var(--color-muted)]">/month</span>
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            55% of insurable earnings, capped at $63,200/year.
          </p>
        </div>
      )}

      {/* Field 2 — Partner */}
      <CurrencyInput
        value={partnerIncome}
        onChange={(v) => onChange('partnerIncome', v)}
        quickSelects={QUICK_SELECTS}
        label="CO-PARENT OR PARTNER SALARY"
        optional
      />

      {/* Explanatory note */}
      <p className="text-xs text-[var(--color-muted)] leading-relaxed -mt-4 px-1">
        Your EI is calculated from the primary salary. Your Canada Child Benefit is based on the combined household total.
      </p>

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
