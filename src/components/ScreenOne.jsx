const PROVINCES = [
  { code: 'BC', name: 'British Columbia' },
  { code: 'AB', name: 'Alberta' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'ON', name: 'Ontario' },
  { code: 'QC', name: 'Québec' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'PEI', name: 'Prince Edward Island' },
  { code: 'NL', name: 'Newfoundland & Labrador' },
]

const BABY_STAGES = [
  { value: 'expecting', label: 'Expecting', desc: 'Due within the year' },
  { value: 'newborn', label: 'Newborn', desc: '0–6 months' },
  { value: 'infant', label: 'Infant', desc: '6–18 months' },
  { value: 'toddler', label: 'Toddler', desc: '18 months – 3 years' },
]

export default function ScreenOne({ values, onChange, onNext, onBack }) {
  const { province, babyStage } = values
  const canContinue = province && babyStage

  return (
    <div className="space-y-10">
      {/* Province */}
      <div className="space-y-3">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          Where are you raising your family?
        </h2>
        <div className="relative">
          <select
            value={province}
            onChange={(e) => onChange('province', e.target.value)}
            className={`
              w-full appearance-none bg-white border rounded-[12px] px-4 py-4
              text-base font-semibold focus:outline-none transition-colors duration-150 cursor-pointer
              ${province
                ? 'border-[var(--color-accent)] text-[var(--color-charcoal)]'
                : 'border-[var(--color-sand)] text-[var(--color-stone)]'
              }
            `}
          >
            <option value="">Select your province or territory…</option>
            {PROVINCES.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="var(--color-bark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Baby stage */}
      <div className="space-y-3">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          What stage are you at?
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          This shapes your timeline and what we focus on.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {BABY_STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => onChange('babyStage', s.value)}
              className={`
                py-4 px-4 rounded-[12px] text-left transition-all duration-150
                ${babyStage === s.value
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-white text-[var(--color-charcoal)] border border-[var(--color-sand)] hover:border-[var(--color-accent)]'
                }
              `}
            >
              <div className="text-sm font-bold">{s.label}</div>
              <div className={`text-xs mt-0.5 ${babyStage === s.value ? 'text-white/75' : 'text-[var(--color-muted)]'}`}>
                {s.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
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
          className={`
            flex-1 py-4 rounded-[20px] font-bold text-base transition-all duration-200
            ${canContinue
              ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] active:scale-[0.98]'
              : 'bg-[var(--color-sand)] text-[var(--color-stone)] cursor-not-allowed'
            }
          `}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
