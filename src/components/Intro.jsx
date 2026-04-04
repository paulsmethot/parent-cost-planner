function TrustRow({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-sm text-[var(--color-muted)]">{text}</span>
    </div>
  )
}

export default function Intro({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[540px] mx-auto space-y-8">

        {/* Eyebrow */}
        <p className="text-xs font-bold text-[var(--color-stone)] uppercase tracking-widest">
          Free · Canada-wide · Takes 2 minutes
        </p>

        {/* Headline block */}
        <div className="space-y-4">
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-black text-[var(--color-charcoal)] leading-[1.05] tracking-tight">
            Know exactly what parenthood costs.
          </h1>
          <p className="text-lg text-[var(--color-muted)] leading-relaxed max-w-[460px]">
            Get a personalized breakdown of your parental leave income, Canada Child Benefit, childcare costs, and what to do first — based on your province and income.
          </p>
        </div>

        {/* Trust signals */}
        <div className="space-y-3 py-2">
          <TrustRow
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10.163 5.382L15 6.111L11.5 9.524L12.326 14.344L8 12.073L3.674 14.344L4.5 9.524L1 6.111L5.837 5.382L8 1Z" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            }
            text="Built on real Canadian government figures"
          />
          <TrustRow
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="var(--color-accent)" strokeWidth="1.5"/>
                <path d="M5 7V5a3 3 0 016 0v2" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
            text="No account needed. Nothing is saved."
          />
          <TrustRow
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.25" stroke="var(--color-accent)" strokeWidth="1.5"/>
                <path d="M8 5v3.5l2 1.5" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            text="Takes about 2 minutes to complete"
          />
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-[20px] bg-[var(--color-accent)] text-white font-bold text-lg hover:bg-[var(--color-accent-dark)] active:scale-[0.98] transition-all duration-200"
        >
          Start planning →
        </button>

        {/* Footer note */}
        <p className="text-xs text-[var(--color-stone)] text-center">
          Made for Canadian parents, by a Canadian parent.
        </p>
      </div>
    </div>
  )
}
