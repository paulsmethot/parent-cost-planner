import { useRef, useState } from 'react'

// quickSelects: array of {label, value} where value=null triggers manual entry mode
export default function CurrencyInput({ value, onChange, quickSelects, label, sublabel, hint, optional }) {
  const noMatch = value > 0 && !quickSelects.some(q => q.value === value)
  const [isOver, setIsOver] = useState(() => noMatch)
  const [displayValue, setDisplayValue] = useState(value > 0 ? value.toLocaleString('en-CA') : '')
  const inputRef = useRef(null)

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
    const isManual = q.value === null
    if (isManual) {
      setIsOver(true)
      setDisplayValue('')
      onChange(0)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    } else {
      setIsOver(false)
      setDisplayValue(q.value.toLocaleString('en-CA'))
      onChange(q.value)
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">
              {label}
            </p>
            {optional && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-[var(--color-muted)] bg-[var(--color-warm-white)] border border-[var(--color-sand)]">
                Optional
              </span>
            )}
          </div>
          {sublabel && (
            <p className="text-xs text-[var(--color-muted)] mt-0.5">{sublabel}</p>
          )}
        </div>
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
          ref={inputRef}
          className="flex-1 text-base font-semibold text-[var(--color-charcoal)] bg-transparent focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {quickSelects.map(q => {
          const isManual = q.value === null
          const active = isManual
            ? isOver
            : (value === q.value && !isOver)
          return (
            <button
              key={q.label}
              type="button"
              onClick={() => handleChip(q)}
              className={`flex-[0_0_calc(33.333%-6px)] sm:flex-none px-3.5 py-1.5 rounded-full text-sm font-semibold text-center transition-all duration-150 ${
                isManual
                  ? active
                    ? 'bg-[var(--color-accent)] text-white border-2 border-[var(--color-accent)]'
                    : 'bg-white text-[var(--color-charcoal)] border-2 border-dashed border-[var(--color-sand)] hover:border-[var(--color-bark)]'
                  : active
                    ? 'bg-[var(--color-accent)] text-white border border-[var(--color-accent)]'
                    : 'bg-white text-[var(--color-charcoal)] border border-[var(--color-sand)] hover:border-[var(--color-bark)]'
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
