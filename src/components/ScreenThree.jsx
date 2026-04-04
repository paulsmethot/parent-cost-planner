import { calcEIMonthly } from '../lib/calculations'

function formatCAD(n) {
  return '$' + Math.round(n).toLocaleString('en-CA')
}

export default function ScreenThree({ values, onChange, onBack, onNext }) {
  const { caregiverIncome } = values
  // Preview uses standard rate — refined once leave type is chosen in step 4
  const estimatedEI = calcEIMonthly(caregiverIncome, 'standard')

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          What do you earn before leave?
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Enter your current annual salary — the one you earn today, before parental leave begins. We'll calculate your estimated EI payments from this. You don't need to know that number.
        </p>
      </div>

      {/* Slider */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide mb-1">
            Your current annual salary
          </p>
          <p className="text-4xl font-black text-[var(--color-accent)]">{formatCAD(caregiverIncome)}</p>
        </div>
        <input
          type="range"
          min={0}
          max={150000}
          step={1000}
          value={caregiverIncome}
          onChange={(e) => onChange('caregiverIncome', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-[var(--color-stone)]">
          <span>$0</span>
          <span>$150,000</span>
        </div>
      </div>

      {/* Live EI preview */}
      {caregiverIncome > 0 && (
        <div className="bg-white border border-[var(--color-sand)] rounded-[12px] px-5 py-4">
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
          className="flex-1 py-4 rounded-[20px] font-bold text-base bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] active:scale-[0.98] transition-all duration-200"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
