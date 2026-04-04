import { calcAdditionalCostsTotal } from '../lib/calculations'

const CATEGORIES = [
  {
    key: 'food',
    label: 'Baby food & formula',
    desc: 'Typically $100–$300/month in year one',
    max: 500,
  },
  {
    key: 'diapers',
    label: 'Diapers & wipes',
    desc: 'Typically $80–$150/month',
    max: 300,
  },
  {
    key: 'clothing',
    label: 'Clothing & gear',
    desc: 'Grows fast — budget $50–$150/month',
    max: 300,
  },
  {
    key: 'activities',
    label: 'Lessons & activities',
    desc: 'Swimming, music — typically $100–$200/month',
    max: 500,
  },
  {
    key: 'extraChildcare',
    label: 'Additional childcare',
    desc: 'Drop-in care, occasional sitters, etc.',
    max: 1000,
  },
]

function fmtCAD(n) {
  return '$' + Math.round(n).toLocaleString('en-CA')
}

function CostRow({ label, desc, value, max, onChange }) {
  const hasValue = value > 0
  return (
    <div className={`bg-white rounded-[16px] p-5 space-y-3 border-2 transition-colors duration-150 ${hasValue ? 'border-[var(--color-accent)]' : 'border-transparent'}`}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-sm font-bold text-[var(--color-charcoal)]">{label}</p>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">{desc}</p>
        </div>
        <span className={`text-lg font-black shrink-0 ${hasValue ? 'text-[var(--color-accent)]' : 'text-[var(--color-stone)]'}`}>
          {fmtCAD(value)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-[var(--color-stone)]">
        <span>$0</span>
        <span>{fmtCAD(max)}</span>
      </div>
    </div>
  )
}

export default function ScreenFive({ values, onCostChange, onBack, onNext }) {
  const { additionalCosts = {} } = values
  const {
    food = 0, diapers = 0, clothing = 0, activities = 0,
    extraChildcare = 0, otherAmount = 0, otherLabel = '',
  } = additionalCosts

  const total = calcAdditionalCostsTotal(additionalCosts)

  function set(key, val) {
    onCostChange(key, val)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          Any other monthly costs?
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          These are optional — add what applies to your situation and we'll factor them into your net impact. Leave anything at $0 to skip it.
        </p>
      </div>

      {/* Category sliders */}
      <div className="space-y-3">
        {CATEGORIES.map(({ key, label, desc, max }) => (
          <CostRow
            key={key}
            label={label}
            desc={desc}
            value={additionalCosts[key] ?? 0}
            max={max}
            onChange={(v) => set(key, v)}
          />
        ))}

        {/* Other — free text + amount */}
        <div className={`bg-white rounded-[16px] p-5 space-y-3 border-2 transition-colors duration-150 ${otherAmount > 0 ? 'border-[var(--color-accent)]' : 'border-transparent'}`}>
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Other (describe…)"
                value={otherLabel}
                onChange={(e) => set('otherLabel', e.target.value)}
                className="text-sm font-bold text-[var(--color-charcoal)] bg-transparent w-full focus:outline-none placeholder:text-[var(--color-stone)]"
              />
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Add any cost not covered above</p>
            </div>
            <span className={`text-lg font-black shrink-0 ${otherAmount > 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-stone)]'}`}>
              {fmtCAD(otherAmount)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={otherAmount}
            onChange={(e) => set('otherAmount', Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[var(--color-stone)]">
            <span>$0</span>
            <span>$1,000</span>
          </div>
        </div>
      </div>

      {/* Running total */}
      <div className={`rounded-[16px] px-5 py-4 flex justify-between items-center transition-all duration-200 ${total > 0 ? 'bg-[var(--color-accent-light)]' : 'bg-white border border-[var(--color-sand)]'}`}>
        <div>
          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">Total additional costs</p>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">Added to your net monthly impact</p>
        </div>
        <p className={`text-2xl font-black ${total > 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-stone)]'}`}>
          {fmtCAD(total)}<span className="text-sm font-semibold">/mo</span>
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
          className="flex-1 py-4 rounded-[20px] font-bold text-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] active:scale-[0.98] transition-all duration-200"
        >
          {total === 0 ? 'Skip — see my numbers →' : 'See my numbers →'}
        </button>
      </div>
    </div>
  )
}
