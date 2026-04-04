import { useState } from 'react'
import ScreenOne from './components/ScreenOne'
import ScreenTwo from './components/ScreenTwo'
import Results from './components/Results'
import {
  calcEIMonthly,
  calcCCBMonthly,
  calcChildcareCost,
  calcIncomeDropMonthly,
  buildVerdict,
  provinceName,
} from './lib/calculations'

const INITIAL_VALUES = {
  province: '',
  babyStage: '',
  householdIncome: 85000,
  caregiverIncome: 65000,
  leaveType: 'standard',
}

function ProgressBar({ step }) {
  return (
    <div className="flex gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            s <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-sand)]'
          }`}
        />
      ))}
    </div>
  )
}

// Desktop live-results panel (simplified preview updating on step 2)
function LiveResultsPanel({ values }) {
  const { province, householdIncome, caregiverIncome, leaveType, babyStage } = values
  const hasInputs = province && babyStage

  if (!hasInputs) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-16 h-16 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center mb-4 text-3xl">
          📋
        </div>
        <h3 className="text-xl font-bold text-[var(--color-charcoal)] mb-2">Your results will appear here</h3>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Complete the form on the left and your personalized numbers will update in real time.
        </p>
      </div>
    )
  }

  const eiMonthly = calcEIMonthly(caregiverIncome, leaveType)
  const ccbMonthly = calcCCBMonthly(householdIncome)
  const childcare = calcChildcareCost(province)
  const drop = calcIncomeDropMonthly(caregiverIncome, leaveType)
  const isLeave = babyStage === 'expecting' || babyStage === 'newborn'
  const isQC = province === 'QC'
  const net = eiMonthly + ccbMonthly - childcare

  const fmt = (n) => '$' + Math.abs(Math.round(n)).toLocaleString('en-CA')

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">Live preview — {provinceName(province)}</div>

      {isQC && (
        <div className="bg-[var(--color-positive-light)] rounded-[12px] px-4 py-3">
          <div className="text-xs font-bold text-[var(--color-positive)]">🍁 QPIP applies to you</div>
        </div>
      )}

      <div className="bg-[var(--color-accent-light)] rounded-[12px] p-4">
        <p className="text-sm leading-relaxed text-[var(--color-charcoal)]">{buildVerdict(values)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {isLeave && (
          <div className="bg-white rounded-[12px] p-4">
            <div className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wide">EI monthly</div>
            <div className="text-xl font-bold text-[var(--color-positive)] mt-1">{fmt(eiMonthly)}</div>
          </div>
        )}
        {isLeave && (
          <div className="bg-white rounded-[12px] p-4">
            <div className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wide">Income drop</div>
            <div className="text-xl font-bold text-[var(--color-negative)] mt-1">{fmt(drop)}/mo</div>
          </div>
        )}
        <div className="bg-white rounded-[12px] p-4">
          <div className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wide">CCB monthly</div>
          <div className="text-xl font-bold text-[var(--color-positive)] mt-1">{fmt(ccbMonthly)}</div>
        </div>
        <div className="bg-white rounded-[12px] p-4">
          <div className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wide">Childcare</div>
          <div className="text-xl font-bold text-[var(--color-negative)] mt-1">{fmt(childcare)}/mo</div>
        </div>
        <div className={`bg-white rounded-[12px] p-4 col-span-2 border-2 ${net >= 0 ? 'border-[var(--color-positive)]' : 'border-[var(--color-negative)]'}`}>
          <div className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wide">Net monthly (post-leave)</div>
          <div className={`text-2xl font-bold mt-1 ${net >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`}>
            {net >= 0 ? '+' : '−'}{fmt(net)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(1)
  const [values, setValues] = useState(INITIAL_VALUES)

  function handleChange(key, val) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  const screenProps = {
    values,
    onChange: handleChange,
    onNext: () => setStep((s) => s + 1),
    onBack: () => setStep((s) => s - 1),
  }

  // Mobile: step-by-step
  // Desktop (md+): two-column layout
  const showResults = step === 3

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Mobile layout */}
      <div className="md:hidden max-w-[390px] mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest mb-1">Parent Cost Planner</div>
          <h1 className="text-3xl font-black text-[var(--color-charcoal)] leading-tight">
            Know your<br />numbers.
          </h1>
        </div>

        {!showResults && <ProgressBar step={step} />}

        {step === 1 && <ScreenOne {...screenProps} />}
        {step === 2 && <ScreenTwo {...screenProps} />}
        {step === 3 && <Results values={values} onBack={() => setStep(2)} />}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left panel — intake */}
        <div className="w-[420px] shrink-0 bg-[var(--color-warm-white)] border-r border-[var(--color-sand)] px-10 py-12 overflow-y-auto">
          <div className="mb-10">
            <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest mb-1">Parent Cost Planner</div>
            <h1 className="text-3xl font-black text-[var(--color-charcoal)] leading-tight">
              Know your numbers.
            </h1>
          </div>

          {!showResults && <ProgressBar step={step} />}

          {step === 1 && <ScreenOne {...screenProps} />}
          {step === 2 && <ScreenTwo {...screenProps} />}
          {step === 3 && (
            <div>
              <p className="text-sm text-[var(--color-muted)] mb-6">
                Your full results are shown on the right. Adjust anything below to update them.
              </p>
              <ScreenTwo
                values={values}
                onChange={handleChange}
                onBack={() => setStep(1)}
                onNext={() => {}}
              />
            </div>
          )}
        </div>

        {/* Right panel — results */}
        <div className="flex-1 bg-[var(--color-cream)] px-12 py-12 overflow-y-auto">
          {showResults
            ? <Results values={values} onBack={() => setStep(2)} />
            : <LiveResultsPanel values={values} />
          }
        </div>
      </div>
    </div>
  )
}
