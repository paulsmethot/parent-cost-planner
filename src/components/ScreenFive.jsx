import { useState } from 'react'

const DEFAULT_COSTS = [
  { id: 'food', label: 'Baby food & formula', desc: 'Typically $100 to $300/month in year one', amount: 0 },
  { id: 'diapers', label: 'Diapers & wipes', desc: 'Typically $80 to $150/month', amount: 0 },
  { id: 'clothing', label: 'Clothing & gear', desc: 'Grows fast, budget $50 to $150/month', amount: 0 },
  { id: 'activities', label: 'Lessons & activities', desc: 'Swimming, music, typically $100 to $200/month', amount: 0 },
  { id: 'extraChildcare', label: 'Additional childcare', desc: 'Drop-in care, occasional sitters, etc.', amount: 0 },
]

function CostCard({ item, onChange, onRemove }) {
  const [amountDisplay, setAmountDisplay] = useState(
    item.amount > 0 ? item.amount.toLocaleString('en-CA') : ''
  )

  function handleAmountInput(raw) {
    const digits = raw.replace(/[^0-9]/g, '')
    if (!digits) {
      setAmountDisplay('')
      onChange(item.id, 'amount', 0)
      return
    }
    const num = parseInt(digits, 10)
    setAmountDisplay(num.toLocaleString('en-CA'))
    onChange(item.id, 'amount', num)
  }

  const hasValue = item.amount > 0

  return (
    <div className={`bg-white rounded-[16px] p-5 border-2 transition-colors duration-150 ${
      hasValue ? 'border-[var(--color-accent)]' : 'border-transparent'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Editable label */}
          <input
            type="text"
            value={item.label}
            placeholder="Expense name"
            onChange={e => onChange(item.id, 'label', e.target.value)}
            className="text-sm font-bold text-[var(--color-charcoal)] bg-transparent w-full focus:outline-none placeholder:text-[var(--color-stone)]"
          />
          {item.desc && (
            <p className="text-xs text-[var(--color-muted)] mt-0.5">{item.desc}</p>
          )}
        </div>

        {/* Amount input */}
        <div className={`flex items-center border rounded-[10px] px-3 py-1.5 shrink-0 transition-colors ${
          hasValue ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]' : 'border-[var(--color-sand)] bg-[var(--color-warm-white)]'
        }`}>
          <span className={`text-sm font-semibold mr-0.5 ${hasValue ? 'text-[var(--color-accent)]' : 'text-[var(--color-stone)]'}`}>$</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amountDisplay}
            onChange={e => handleAmountInput(e.target.value)}
            className={`w-20 text-sm font-bold bg-transparent focus:outline-none ${
              hasValue ? 'text-[var(--color-accent)]' : 'text-[var(--color-charcoal)]'
            }`}
          />
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(item.id)}
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-stone)] hover:text-[var(--color-negative)] hover:bg-[var(--color-negative-light)] transition-all duration-150 mt-0.5"
          aria-label="Remove expense"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function ScreenFive({ values, onCostChange, onBack, onNext }) {
  const [costs, setCosts] = useState(() => {
    const initial = values.additionalCosts
    if (Array.isArray(initial) && initial.length > 0) return initial
    return DEFAULT_COSTS
  })

  const total = costs.reduce((sum, item) => sum + (item.amount || 0), 0)

  function updateItem(id, field, val) {
    setCosts(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item))
  }

  function removeItem(id) {
    setCosts(prev => prev.filter(item => item.id !== id))
  }

  function addItem() {
    setCosts(prev => [...prev, {
      id: `custom-${Date.now()}`,
      label: '',
      desc: '',
      amount: 0,
    }])
  }

  function handleNext() {
    onCostChange(costs)
    onNext()
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--color-charcoal)] leading-tight">
          Any other monthly costs?
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Optional. Add what applies to your situation and we'll factor them into your net impact. Edit the labels to match your actual expenses.
        </p>
      </div>

      {/* Cost cards */}
      <div className="space-y-3">
        {costs.map(item => (
          <CostCard
            key={item.id}
            item={item}
            onChange={updateItem}
            onRemove={removeItem}
          />
        ))}

        {/* Add expense button */}
        <button
          onClick={addItem}
          className="w-full py-4 rounded-[16px] border-2 border-dashed border-[var(--color-sand)] text-sm font-semibold text-[var(--color-muted)] hover:border-[var(--color-bark)] hover:text-[var(--color-charcoal)] transition-all duration-200"
        >
          + Add expense
        </button>
      </div>

      {/* Running total */}
      {total > 0 && (
        <div className="rounded-[16px] px-5 py-4 flex justify-between items-center bg-[var(--color-warm-white)] border border-[var(--color-sand)]">
          <div>
            <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">Total additional costs</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">Added to your net monthly impact</p>
          </div>
          <p className="text-2xl font-black text-[var(--color-charcoal)]">
            ${total.toLocaleString('en-CA')}<span className="text-sm font-semibold">/mo</span>
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-[20px] font-bold text-base bg-white border border-[var(--color-sand)] text-[var(--color-charcoal)] hover:border-[var(--color-bark)] transition-all duration-200"
        >
          ←
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-4 rounded-[20px] font-bold text-lg bg-[var(--color-accent)] text-white hover:opacity-80 active:scale-[0.98] transition-all duration-200"
        >
          {total === 0 ? 'Skip this step →' : 'See my numbers →'}
        </button>
      </div>
    </div>
  )
}
