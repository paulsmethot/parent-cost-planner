import { useState } from 'react'

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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Years: 6 years back to 1 year ahead — covers born and expecting
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear - 6 + i)

function daysInMonth(month, year) {
  if (!month || !year) return 31
  return new Date(year, month, 0).getDate()
}

const SELECT_CLASS = `
  w-full appearance-none bg-white border rounded-[12px] px-3 py-4
  text-base font-semibold focus:outline-none transition-colors duration-150 cursor-pointer
`

export default function ScreenOne({ values, onChange, onNext, onBack }) {
  const { province, babyDOB } = values

  // Parse existing babyDOB into parts for controlled selects
  const [month, setMonth] = useState(() => babyDOB ? parseInt(babyDOB.split('-')[1], 10) : '')
  const [day, setDay] = useState(() => babyDOB ? parseInt(babyDOB.split('-')[2], 10) : '')
  const [year, setYear] = useState(() => babyDOB ? parseInt(babyDOB.split('-')[0], 10) : '')

  const canContinue = province && babyDOB

  function handlePartChange(newMonth, newDay, newYear) {
    if (newMonth && newDay && newYear) {
      const mm = String(newMonth).padStart(2, '0')
      const dd = String(newDay).padStart(2, '0')
      const dateStr = `${newYear}-${mm}-${dd}`
      const today = new Date().toISOString().split('T')[0]
      onChange('babyDOB', dateStr)
      onChange('isExpecting', dateStr > today)
    } else {
      onChange('babyDOB', '')
    }
  }

  function handleMonth(v) {
    const m = v ? parseInt(v, 10) : ''
    setMonth(m)
    // Clamp day if it exceeds days in new month
    const maxDay = daysInMonth(m, year)
    const clampedDay = day > maxDay ? '' : day
    if (day > maxDay) setDay('')
    handlePartChange(m, clampedDay, year)
  }

  function handleDay(v) {
    const d = v ? parseInt(v, 10) : ''
    setDay(d)
    handlePartChange(month, d, year)
  }

  function handleYear(v) {
    const y = v ? parseInt(v, 10) : ''
    setYear(y)
    handlePartChange(month, day, y)
  }

  const maxDays = daysInMonth(month, year)
  const days = Array.from({ length: maxDays }, (_, i) => i + 1)

  const filled = month && day && year

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

      {/* Date selects — fades in after province selected */}
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

          {/* Three-column date picker — reliable on iOS Safari */}
          <div className="grid grid-cols-3 gap-2">
            {/* Month */}
            <div className="relative">
              <select
                value={month}
                onChange={(e) => handleMonth(e.target.value)}
                className={`${SELECT_CLASS} ${month ? 'border-[var(--color-accent)] text-[var(--color-charcoal)]' : 'border-[var(--color-sand)] text-[var(--color-stone)]'}`}
              >
                <option value="">Month</option>
                {MONTHS.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="var(--color-bark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Day */}
            <div className="relative">
              <select
                value={day}
                onChange={(e) => handleDay(e.target.value)}
                className={`${SELECT_CLASS} ${day ? 'border-[var(--color-accent)] text-[var(--color-charcoal)]' : 'border-[var(--color-sand)] text-[var(--color-stone)]'}`}
              >
                <option value="">Day</option>
                {days.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="var(--color-bark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Year */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => handleYear(e.target.value)}
                className={`${SELECT_CLASS} ${year ? 'border-[var(--color-accent)] text-[var(--color-charcoal)]' : 'border-[var(--color-sand)] text-[var(--color-stone)]'}`}
              >
                <option value="">Year</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="var(--color-bark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {filled && (
            <p className="text-xs text-[var(--color-muted)]">
              {babyDOB > new Date().toISOString().split('T')[0]
                ? "We'll treat this as a due date."
                : "We'll treat this as a date of birth."}
            </p>
          )}
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
