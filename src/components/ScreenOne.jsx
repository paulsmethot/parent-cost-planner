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

export default function ScreenOne({ values, onChange, onNext, onBack }) {
  const { province, babyDOB } = values

  const canContinue = province && babyDOB

  function handleDateChange(dateStr) {
    onChange('babyDOB', dateStr)
    if (dateStr) {
      const today = new Date().toISOString().split('T')[0]
      onChange('isExpecting', dateStr > today)
    } else {
      onChange('isExpecting', false)
    }
  }

  return (
    <div className="space-y-10">

      {/* Province */}
      <div className="space-y-3">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          Where in Canada are you raising your family?
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

      {/* Date input — fades in after province selected */}
      {province && (
        <div className="space-y-3 screen-enter">
          <div>
            <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
              Baby's date of birth or expected due date
            </h2>
            <p className="text-sm text-[var(--color-muted)] mt-1.5 leading-relaxed">
              Enter a past date if your baby is born, or a future date if you're expecting.
            </p>
          </div>

          {/* Wrapper forces full width on iOS Safari */}
          <div style={{ width: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
            <input
              type="date"
              value={babyDOB}
              onChange={(e) => handleDateChange(e.target.value)}
              style={{
                width: '100%',
                minWidth: '0',
                maxWidth: '100%',
                boxSizing: 'border-box',
                display: 'block',
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
              className={`
                bg-white border rounded-[12px] px-4 py-4 text-base font-semibold
                focus:outline-none transition-colors duration-150 cursor-pointer
                ${babyDOB
                  ? 'border-[var(--color-accent)] text-[var(--color-charcoal)]'
                  : 'border-[var(--color-sand)] text-[var(--color-stone)]'
                }
              `}
            />
          </div>
        </div>
      )}

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
              ? 'bg-[var(--color-accent)] text-white hover:opacity-80 active:scale-[0.98]'
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
