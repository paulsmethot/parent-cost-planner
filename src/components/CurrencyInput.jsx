import { useState } from 'react'

// quickSelects: array of {label, value} where value=null means "$200K+"
export default function CurrencyInput({ value, onChange, quickSelects, label, hint }) {
  const noMatch = value > 0 && !quickSelects.some(q => q.value === value)
  const [isOver, setIsOver] = useState(() => noMatch)
  const [displayValue, setDisplayValue] = useState(value > 0 ? value.toLocaleString('en-CA') : '')

  function handleInput(raw) {
    const digits = raw.replace(/[^0-9]/g, '')
    if (!digits) {
      setDisplayValue('')
      onChange(0)
      return
    }
    const num = parseInt(digits, 10)
    setDisplayValue(num.toLocaleString('en-CA'))
    onChange(num)
  }

  function handleChip(q) {
    if (q.value === null) {
      setIsOver(true)
      setDisplayValue('')
      onChange(0)
    } else {
      setIsOver(false)
      setDisplayValue(q.value.toLocaleString('en-CA'))
      onChange(q.value)
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">
          {label}
        </p>
      )}

      {isOver && (
        <p className="text-xs font-semibold text-[var(--color-charcoal)] mb-1">
          Enter your actual amount
        </p>
      )}

      <div className={`flex items-center bg-white border-2 rounded-[12px] px-4 py-4 transition-colors duration-150 focus-within:border-[var(--color-accent)] ${
        displayValue ? 'border-[var(--color-accent)]' : 'border-[var(--color-sand)]'
      }`}>
        <span className="text-base font-semibold text-[var(--color-muted)] mr-1 shrink-0">CAD $</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={displayValue}
          onChange={e => handleInput(e.target.value)}
          className="flex-1 text-base font-semibold text-[var(--color-charcoal)] bg-transparent focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {quickSelects.map(q => {
          const active = q.value === null
            ? isOver
            : (value === q.value && !isOver)
          return (
            <button
              key={q.label}
              type="button"
              onClick={() => handleChip(q)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 ${
                active
                  ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                  : 'bg-white text-[var(--color-charcoal)] border-[var(--color-sand)] hover:border-[var(--color-bark)]'
              }`}
            >
              {q.label}
            </button>
          )
        })}
      </div>

      {hint && <p className="text-xs text-[var(--color-muted)] leading-relaxed">{hint}</p>}
    </div>
  )
}
