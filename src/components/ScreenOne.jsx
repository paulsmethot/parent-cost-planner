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
  const { province, isExpecting, babyDOB } = values

  const today = new Date().toISOString().split('T')[0]
  const minDOB = new Date(new Date().setFullYear(new Date().getFullYear() - 6)).toISOString().split('T')[0]
  const maxDue = new Date(new Date().setMonth(new Date().getMonth() + 10)).toISOString().split('T')[0]

  const canContinue = province && babyDOB

  function handleToggle(expecting) {
    onChange('isExpecting', expecting)
    onChange('babyDOB', '')
  }

  return (
    <div className="space-y-10">

      {/* Province */}
      <div className="space-y-3">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          Where in Canada are you raising your family? <span className="text-[var(--color-negative)]">*</span>
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

      {/* Baby status — fades in after province selected */}
      {province && (
        <div className="space-y-4 screen-enter">
          <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
            {isExpecting ? 'When is your baby due?' : 'When was your baby born?'} <span className="text-[var(--color-negative)]">*</span>
          </h2>

          {/* Toggle */}
          <div className="flex bg-white border border-[var(--color-sand)] rounded-[12px] p-1 gap-1">
            <button
              onClick={() => handleToggle(false)}
              className={`flex-1 py-2.5 rounded-[10px] text-sm font-bold transition-all duration-150 ${
                !isExpecting
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-charcoal)]'
              }`}
            >
              My baby is already born
            </button>
            <button
              onClick={() => handleToggle(true)}
              className={`flex-1 py-2.5 rounded-[10px] text-sm font-bold transition-all duration-150 ${
                isExpecting
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-charcoal)]'
              }`}
            >
              I'm expecting
            </button>
          </div>

          {/* Date input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">
              {isExpecting ? 'Due date' : 'Date of birth'}
            </label>
            <input
              type="date"
              value={babyDOB}
              min={isExpecting ? today : minDOB}
              max={isExpecting ? maxDue : today}
              onChange={(e) => onChange('babyDOB', e.target.value)}
              className={`
                w-full bg-white border rounded-[12px] px-4 py-4 text-base font-semibold
                focus:outline-none transition-colors duration-150 cursor-pointer
                ${babyDOB
                  ? 'border-[var(--color-accent)] text-[var(--color-charcoal)]'
                  : 'border-[var(--color-sand)] text-[var(--color-stone)]'
                }
              `}
            />
            {isExpecting && (
              <p className="text-xs text-[var(--color-muted)]">
                We'll anchor your timeline and leave window to this date.
              </p>
            )}
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
