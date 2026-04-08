import { useState } from 'react'
import Intro from './components/Intro'
import ScreenOne from './components/ScreenOne'
import ScreenTwo from './components/ScreenTwo'
import ScreenFour from './components/ScreenFour'
import ScreenFive from './components/ScreenFive'
import Results from './components/Results'

const TOTAL_STEPS = 4

const INITIAL_VALUES = {
  province: '',
  isExpecting: false,
  babyDOB: '',
  caregiverIncome: 0,
  partnerIncome: 0,
  leaveType: 'standard',
  employerTopUp: 0,
  needsChildcare: false,
  additionalCosts: [
    { id: 'food', label: 'Baby food & formula', desc: 'Typically $100 to $300/month in year one', amount: 0 },
    { id: 'diapers', label: 'Diapers & wipes', desc: 'Typically $80 to $150/month', amount: 0 },
    { id: 'clothing', label: 'Clothing & gear', desc: 'Grows fast, budget $50 to $150/month', amount: 0 },
    { id: 'activities', label: 'Lessons & activities', desc: 'Swimming, music, typically $100 to $200/month', amount: 0 },
    { id: 'extraChildcare', label: 'Additional childcare', desc: 'Drop-in care, occasional sitters, etc.', amount: 0 },
  ],
}

function StepIndicator({ step }) {
  return (
    <div className="mb-10">
      <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
        Step {step} of {TOTAL_STEPS}
      </p>
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-sand)]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(INITIAL_VALUES)

  function handleChange(key, val) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  function handleCostChange(newCosts) {
    setValues((prev) => ({ ...prev, additionalCosts: newCosts }))
  }

  const nav = {
    onNext: () => setStep((s) => s + 1),
    onBack: () => setStep((s) => s - 1),
  }

  const isIntake = step >= 1 && step <= TOTAL_STEPS
  const isResults = step === TOTAL_STEPS + 1

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <div key={step} className="screen-enter">

        {/* Screen 0 — Intro */}
        {step === 0 && <Intro onStart={() => setStep(1)} />}

        {/* Screens 1–4 — Intake */}
        {isIntake && (
          <div className="min-h-screen flex flex-col">
            <div className="w-full max-w-[640px] mx-auto px-4 sm:px-6 py-12 flex-1">
              <StepIndicator step={step} />

              {/* Step 1 — Province + baby date */}
              {step === 1 && (
                <ScreenOne
                  values={values}
                  onChange={handleChange}
                  onBack={() => setStep(0)}
                  onNext={nav.onNext}
                />
              )}

              {/* Step 2 — Combined income */}
              {step === 2 && (
                <ScreenTwo
                  values={values}
                  onChange={handleChange}
                  onBack={nav.onBack}
                  onNext={nav.onNext}
                />
              )}

              {/* Step 3 — Leave type */}
              {step === 3 && (
                <ScreenFour
                  values={values}
                  onChange={handleChange}
                  onBack={nav.onBack}
                  onNext={nav.onNext}
                />
              )}

              {/* Step 4 — Additional costs */}
              {step === 4 && (
                <ScreenFive
                  values={values}
                  onCostChange={handleCostChange}
                  onBack={nav.onBack}
                  onNext={() => setStep(TOTAL_STEPS + 1)}
                />
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {isResults && (
          <div className="w-full max-w-[1100px] mx-auto px-6 py-12">
            <Results values={values} onEdit={() => setStep(1)} />
          </div>
        )}

      </div>
    </div>
  )
}
