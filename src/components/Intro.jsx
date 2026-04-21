function TrustRow({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-[8px] bg-[#F1F1F1] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-sm text-[var(--color-muted)]">{text}</span>
    </div>
  )
}

export default function Intro({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-4 pb-12">
        <div className="w-full max-w-[540px] mx-auto space-y-8">
          {/* Image card */}
          <div className="w-full rounded-2xl overflow-hidden aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80"
              alt=""
              className="w-full h-full object-cover object-[top_center]"
            />
          </div>

          {/* Headline block */}
          <div className="space-y-6">
            <h1 className="font-playfair text-[clamp(2.4rem,6vw,3.8rem)] font-normal text-[var(--color-charcoal)] leading-[1.1]">
              Know exactly what parenthood costs.
            </h1>
            <p className="text-lg text-[#1A1A1A] leading-relaxed max-w-[460px]">
              Get a personalized breakdown of your parental leave income, Canada Child Benefit, childcare costs, and what to do first. Based on your province and income.
            </p>
          </div>

          {/* Trust signals */}
          <div className="space-y-3 py-1">
            <TrustRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="22" x2="21" y2="22"/>
                  <line x1="6" y1="18" x2="6" y2="11"/>
                  <line x1="10" y1="18" x2="10" y2="11"/>
                  <line x1="14" y1="18" x2="14" y2="11"/>
                  <line x1="18" y1="18" x2="18" y2="11"/>
                  <polygon points="12 2 20 7 4 7 12 2"/>
                </svg>
              }
              text="Built on real Canadian government figures"
            />
            <TrustRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              }
              text="Free. No account needed and nothing is saved."
            />
            <TrustRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              }
              text="Takes about 2 minutes to complete"
            />
          </div>

          {/* CTA */}
          <button
            onClick={onStart}
            className="w-full py-4 rounded-[20px] bg-[var(--color-accent)] text-white font-bold text-lg hover:opacity-80 active:scale-[0.98] transition-all duration-200"
          >
            Start planning →
          </button>

          {/* Footer note */}
          <div className="text-xs text-[var(--color-stone)] text-center">
            <p>
              Made for Canadian parents by{' '}
              <a
                href="https://www.linkedin.com/in/paulsmethot/"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-[var(--color-stone)] underline-offset-2"
              >
                Leon&apos;s dad
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
