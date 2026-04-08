import { useState } from 'react'

const LEAVE_TYPES = [
  {
    value: 'standard',
    label: 'Standard',
    desc: '12 months at 55% of insurable earnings. The most common choice.',
  },
  {
    value: 'extended',
    label: 'Extended',
    desc: '18 months at 33% of insurable earnings. Lower monthly but longer runway.',
  },
  {
    value: 'shared',
    label: 'Shared',
    desc: 'Split between both parents, up to 12 or 18 months combined.',
  },
  {
    value: 'topup',
    label: 'Employer top-up',
    desc: 'Your employer supplements EI. Common in government and some corporate roles.',
  },
]

export default function ScreenFour({ values, onChange, onBack, onNext }) {
  const { leaveType, employerTopUp, needsChildcare } = values
  const [topUpDisplay, setTopUpDisplay] = useState(
    employerTopUp > 0 ? employerTopUp.toLocaleString('en-CA') : ''
  )

  function handleTopUpInput(raw) {
    const digits = raw.replace(/[^0-9]/g, '')
    if (!digits) {
      setTopUpDisplay('')
      onChange('employerTopUp', 0)
      return
    }
    const num = parseInt(digits, 10)
    setTopUpDisplay(num.toLocaleString('en-CA'))
    onChange('employerTopUp', num)
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          What kind of leave are you taking?
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Choose the option that best fits your situation.
        </p>
      </div>

      {/* Leave type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LEAVE_TYPES.map((t) => {
          const selected = leaveType === t.value
          return (
            <button
              key={t.value}
              onClick={() => onChange('leaveType', t.value)}
              className={`
                text-left rounded-[16px] p-5 transition-all duration-150 border-2
                ${selected
                  ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                  : 'bg-white border-[var(--color-sand)] text-[var(--color-charcoal)] hover:border-[var(--color-bark)]'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-base font-bold leading-tight">{t.label}</span>
                {selected && (
                  <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${selected ? 'text-white/80' : 'text-[var(--color-muted)]'}`}>
                {t.desc}
              </p>
            </button>
          )
        })}
      </div>

      {/* Top-up secondary input */}
      {leaveType === 'topup' && (
        <div className="bg-white border border-[var(--color-sand)] rounded-[16px] p-5 space-y-4 screen-enter">
          <div>
            <p className="text-sm font-bold text-[var(--color-charcoal)]">
              Estimated monthly top-up from your employer
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Optional. The amount your employer adds on top of EI each month.
            </p>
          </div>
          <div className={`flex items-center bg-[var(--color-warm-white)] border-2 rounded-[12px] px-4 py-3.5 transition-colors focus-within:border-[var(--color-accent)] ${
            topUpDisplay ? 'border-[var(--color-accent)]' : 'border-[var(--color-sand)]'
          }`}>
            <span className="text-base font-semibold text-[var(--color-muted)] mr-1 shrink-0">$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 2,500"
              value={topUpDisplay}
              onChange={e => handleTopUpInput(e.target.value)}
              className="flex-1 text-base font-semibold text-[var(--color-charcoal)] bg-transparent focus:outline-none"
            />
            <span className="text-sm text-[var(--color-muted)] ml-1 shrink-0">/month</span>
          </div>
        </div>
      )}

      {/* Childcare during leave toggle */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-[var(--color-charcoal)]">
            Will you need paid childcare during your leave?
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">
            Many parents on full leave care for their child at home and don't need paid childcare yet.
          </p>
        </div>
        <div className="flex bg-white border border-[var(--color-sand)] rounded-[12px] p-1 gap-1">
          <button
            onClick={() => onChange('needsChildcare', false)}
            className={`flex-1 py-2.5 rounded-[10px] text-sm font-bold transition-all duration-150 ${
              !needsChildcare
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-charcoal)]'
            }`}
          >
            No, I'll be home
          </button>
          <button
            onClick={() => onChange('needsChildcare', true)}
            className={`flex-1 py-2.5 rounded-[10px] text-sm font-bold transition-all duration-150 ${
              needsChildcare
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-charcoal)]'
            }`}
          >
            Yes, we need it
          </button>
        </div>
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
          className="flex-1 py-4 rounded-[20px] font-bold text-lg bg-[var(--color-accent)] text-white hover:opacity-80 active:scale-[0.98] transition-all duration-200"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
