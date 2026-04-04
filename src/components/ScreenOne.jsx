const PROVINCES = [
  { code: 'BC', name: 'British Columbia' },
  { code: 'AB', name: 'Alberta' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'ON', name: 'Ontario' },
  { code: 'QC', name: 'Québec' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'PEI', name: 'PEI' },
  { code: 'NL', name: 'Newfoundland' },
]

const BABY_STAGES = [
  { value: 'expecting', label: '🤰 Expecting', desc: 'Due within the year' },
  { value: 'newborn', label: '🍼 Newborn', desc: 'Under 6 months' },
  { value: 'infant', label: '🧸 Infant', desc: '6–18 months' },
  { value: 'toddler', label: '🧒 Toddler', desc: '18 months +' },
]

export default function ScreenOne({ values, onChange, onNext }) {
  const { province, babyStage } = values
  const canContinue = province && babyStage

  return (
    <div className="animate-fade-slide-up space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-charcoal)] mb-1">
          Where are you located?
        </h2>
        <p className="text-[var(--color-muted)] text-sm">
          Childcare costs and leave rules vary significantly by province.
        </p>
      </div>

      {/* Province grid */}
      <div className="grid grid-cols-2 gap-2">
        {PROVINCES.map((p) => (
          <button
            key={p.code}
            onClick={() => onChange('province', p.code)}
            className={`
              py-3 px-4 rounded-[12px] text-left text-sm font-semibold transition-all duration-150
              ${province === p.code
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-white text-[var(--color-charcoal)] border border-[var(--color-sand)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
              }
            `}
          >
            <span className="font-bold">{p.code}</span>
            <span className={`block text-xs mt-0.5 font-normal ${province === p.code ? 'text-white/80' : 'text-[var(--color-muted)]'}`}>
              {p.name}
            </span>
          </button>
        ))}
      </div>

      {/* Baby stage */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-charcoal)] mb-1">
          What stage are you at?
        </h2>
        <p className="text-[var(--color-muted)] text-sm mb-4">
          This shapes your timeline and what we focus on.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {BABY_STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => onChange('babyStage', s.value)}
              className={`
                py-3 px-4 rounded-[12px] text-left transition-all duration-150
                ${babyStage === s.value
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-white text-[var(--color-charcoal)] border border-[var(--color-sand)] hover:border-[var(--color-accent)]'
                }
              `}
            >
              <div className="text-base">{s.label}</div>
              <div className={`text-xs mt-0.5 ${babyStage === s.value ? 'text-white/80' : 'text-[var(--color-muted)]'}`}>
                {s.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className={`
          w-full py-4 rounded-[20px] font-bold text-base transition-all duration-200
          ${canContinue
            ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] active:scale-[0.98]'
            : 'bg-[var(--color-sand)] text-[var(--color-stone)] cursor-not-allowed'
          }
        `}
      >
        Continue →
      </button>
    </div>
  )
}
