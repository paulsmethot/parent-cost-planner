import { useRef, useState } from 'react'

// quickSelects: array of {label, value} where value=null triggers manual entry mode
export default function CurrencyInput({ value, onChange, quickSelects, label, sublabel, hint, optional, placeholder }) {
  // Determine initial state
  const hasValueMatch = value > 0 && quickSelects.some(q => q.value === value)
  const [isCustom, setIsCustom] = useState(() => value > 0 && !hasValueMatch)
  const [displayValue, setDisplayValue] = useState(() => value > 0 ? value.toLocaleString('en-CA') : '')
  const inputRef = useRef(null)

  function handleInput(raw) {
    const digits = raw.replace(/[^0-9]/g, '')
    if (!digits) {
      setDisplayValue('')
      setIsCustom(false)
      onChange(0)
      return
    }
    const num = parseInt(digits, 10)
    setDisplayValue(num.toLocaleString('en-CA'))
    setIsCustom(true)
    onChange(num)
  }

  function handleChip(q) {
    const isManual = q.value === null

    if (isManual) {
      // Custom pill: always activates custom mode, focus input, do NOT change value
      setIsCustom(true)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    } else {
      // Value pill: toggle if already selected, otherwise select
      if (!isCustom && value === q.value) {
        // Deselect — clear to empty
        setIsCustom(false)
        setDisplayValue('')
        onChange(0)
      } else {
        // Select
        setIsCustom(false)
        setDisplayValue(q.value.toLocaleString('en-CA'))
        onChange(q.value)
      }
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
          placeholder={placeholder || '0'}
          value={displayValue}
          onChange={e => handleInput(e.target.value)}
          ref={inputRef}
          className="flex-1 min-w-0 text-base font-semibold text-[var(--color-charcoal)] bg-transparent focus:outline-none placeholder:text-[var(--color-stone)] placeholder:font-normal"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {quickSelects.map(q => {
          const isManual = q.value === null
          const active = isManual
            ? isCustom
            : (!isCustom && value === q.value)
          return (
            <button
              key={q.label}
              type="button"
              onClick={() => handleChip(q)}
              className={`w-full px-3.5 py-1.5 rounded-full text-sm font-semibold text-center transition-all duration-150 ${
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
