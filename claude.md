# Parent Cost Planner — Project Brief

## What this is
A Canadian financial planning tool for new and expecting parents. 
Users input their province, date of birth or due date, household 
income, caregiver income, leave type, and optional additional costs. 
They receive a personalized breakdown of parental leave income, 
Canada Child Benefit, childcare costs by province, and a prioritized 
action list. The goal is a clear, opinionated output — not a 
spreadsheet, but a verdict with context and next steps.

## Tech stack
- React (Vite)
- Tailwind CSS
- shadcn/ui for components
- No backend, no database, no authentication for V0
- All calculations are client-side using hardcoded government data tables

## Layout
- Mobile-first, single column, full-screen step flow
- Desktop (768px+): full screen centered, max-width 640px for intake 
  steps, max-width 1100px for results dashboard
- No side panels or split views during intake — results are a 
  dedicated payoff screen after all steps are complete
- Default to 390px mobile viewport when building and previewing

## Visual direction
- Warm, approachable, trustworthy — this is for stressed new parents, 
  not finance bros
- Rounded corners throughout (border-radius: 12px for cards, 
  20px for chips/pills)
- Generous whitespace and padding
- Typography: a distinctive, warm sans-serif — not Inter, not system 
  font (Nunito is currently in use)
- Colour palette: soft warm neutrals as base, accent orange 
  (currently #E8825A or similar warm orange)
- No gradients, no drop shadows, no decorative noise
- Subtle fade + upward slide transition between screens (200ms)

## Core data model
These inputs drive all calculations:

- province (string, e.g. "BC", "ON", "QC")
- isExpecting (boolean) — true if baby not yet born
- babyDOB (date string) — actual date of birth, or due date if expecting
- householdIncome (number, annual CAD, combined both parents)
- caregiverIncome (number, annual CAD, the person taking leave)
- leaveType (enum: "standard" | "extended" | "shared" | "topup")
- employerTopUp (number, monthly CAD, only if leaveType is "topup")
- additionalMonthlyCosts (object, keyed by category):
  - babyFood: number (default 0)
  - diapers: number (default 0)
  - clothing: number (default 0)
  - lessons: number (default 0)
  - additionalChildcare: number (default 0)
  - other: number (default 0)
  - otherLabel: string (custom label for other category)

## Step structure (5 steps + intro screen)

### Screen 0 — Intro
- Eyebrow: "Free · Canada-wide · Takes 2 minutes"
- Headline: "Know exactly what parenthood costs."
- Subheadline: personalized breakdown of leave income, CCB, 
  childcare, and what to do first
- Three trust signals:
  · Built on real Canadian government figures
  · No account needed. Nothing is saved.
  · Takes about 2 minutes to complete
- CTA: "Start planning"
- Footer: "Made for Canadian parents, by a Canadian parent."

### Screen 1 — Province + baby date (Step 1 of 5)
- Province picker (select dropdown)
- Toggle: "My baby is already born" / "I'm expecting"
  · If born: date of birth picker
  · If expecting: due date picker
- Use babyDOB to derive exact age in months throughout the app

### Screen 2 — Household income (Step 2 of 5)
- Label: "Total household income before baby arrives"
- Sublabel: "Combined salary of both parents or guardians, 
  based on what you each earn today — before any leave begins"
- Slider: $0 – $250,000

### Screen 3 — Caregiver income (Step 3 of 5)
- Label: "Your income before leave"
- Sublabel: "Enter your current annual salary — we'll calculate 
  your estimated EI payments from this"
- Slider: $0 – $150,000

### Screen 4 — Leave type (Step 4 of 5)
- Four selectable cards:
  · Standard: "12 months at 55% of insurable earnings"
  · Extended: "18 months at 33% of insurable earnings"
  · Shared: "Split between both parents, up to 12 or 18 months"
  · Employer top-up: "Your employer supplements EI — common in 
    government and corporate roles"
- If top-up selected: reveal slider for monthly top-up amount ($0–$3,000)

### Screen 5 — Additional monthly costs (Step 5 of 5)
- Heading: "Any other monthly costs?"
- Optional line items, all default to $0:
  · Baby food & formula — "Typically $100–$300/month in year one"
  · Diapers & wipes — "Typically $80–$150/month"
  · Clothing & gear — "Typically $50–$150/month"
  · Lessons & activities — "Typically $100–$200/month"
  · Additional childcare — "Date nights, backup care, etc."
  · Other — free text label + amount input
- Running total shown at bottom as user inputs values
- All fields optional — user can skip entirely
- CTA: "See my numbers"

### Screen 6 — Results dashboard
- Max-width 1100px
- Personalized header: "Here's your picture, [Province]."
- One-sentence plain-English verdict below header
- Four metric cards (2x2 on mobile, 4-across on desktop):
  · EI / Leave income (monthly)
  · Canada Child Benefit (monthly, tax-free)
  · Estimated childcare cost (monthly)
  · Net monthly impact vs. today
- Divider
- "The next 18 months" — vertical timeline using real calendar dates
- Divider
- "Do these first" — interactive checklist with checkboxes and 
  external government links
- "Edit my details" ghost button at bottom

## Calculation logic

### EI Parental Leave
- Insurable earnings cap: $63,200/year
- Standard leave (12 months): 55% of weekly insurable earnings × 4.33
- Extended leave (18 months): 33% of weekly insurable earnings × 4.33
- Employer top-up: add flat monthly amount on top of EI
- Quebec uses QPIP — flag this with a note, rates differ
- Leave window logic based on babyDOB:
  · If baby is under 12 months → standard leave window open
  · If baby is under 18 months → extended leave may still apply
  · If expecting → leave hasn't started yet
  · Never show "leave stage has passed" unless baby is clearly 
    beyond the leave window (18+ months old)

### Canada Child Benefit (CCB)
- 2025-2026 benefit year (July 2025 – June 2026), one child under 6
- Always calculate and display for babies under 6 years old
- Never show $0 unless income genuinely reduces it to zero
- Base annual: $7,787 per child under 6
- No reduction below $37,487 AFNI (adjusted family net income)
- Phase 1 reduction: 7.0% of AFNI above $37,487 up to $81,222
- Phase 2 reduction: additional 3.2% of AFNI above $81,222
- Note: 13.8%/5.7% are the 2-child rates — single-child rates are 7.0%/3.2%
- CCB does NOT reach $0 for one child until ~$250,000 AFNI
- Display as monthly (annual ÷ 12)

### Childcare costs by province (monthly estimates)
- BC: $1,350
- AB: $1,200
- SK: $900
- MB: $780
- ON: $1,500
- QC: $430 (subsidized CPE — always note this is $13.10/day)
- NB: $780
- NS: $890
- PEI: $650
- NL: $820

### Net monthly impact
Net = EI monthly income − pre-leave monthly income + CCB monthly 
      − childcare monthly − sum of all additionalMonthlyCosts

This should almost always be a negative number during leave. 
Display in red if negative, green if positive.

## Timeline — use real calendar dates
Derive all timeline labels from babyDOB. Never use abstract 
"Month 2", "Month 6" labels. Use real month + year references:

- "Now — [current month year]"
- "[Month Year] — [event description]"
- "[Month Year] — Baby turns 1" when appropriate
- "[Month Year] — 18 month milestone" when appropriate

If expecting, anchor dates to due date.

## Action items — interactive checklist
Each item:
- Checkbox on the left (in-session state only, no persistence needed)
- Checking strikes through and dims the item
- External link icon on the right opens government resource in new tab

Links:
1. Apply for EI parental benefits →
   https://www.canada.ca/en/services/benefits/ei/ei-maternity-parental.html
2. Register for Canada Child Benefit →
   https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit-overview.html
3. Open an RESP →
   https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-education-savings-plans-resps.html
4. Start touring daycares →
   https://www.canada.ca/en/public-health/services/caring-for-kids/child-care.html

## Progress indicator
- Segmented progress bar on screens 1–5 (5 discrete segments)
- Text label: "Step X of 5" above each question
- Smooth fill animation as steps complete

## Quebec special handling
- QPIP replaces federal EI — always flag with a callout note
- Childcare is $430/month (subsidized CPE at $13.10/day)
- Both are meaningfully better than other provinces — 
  call this out clearly in the verdict

## What to avoid
- Do not use Inter, Roboto, Arial, or system fonts
- Do not use blue or purple as the primary accent
- Do not add authentication, user accounts, or any backend
- Do not store any user data anywhere
- Do not add unnecessary loading states — all calculations are instant
- Do not over-engineer — this is a V0, keep it clean and shippable
- Do not use abstract month counters in the timeline
- Do not show $0 for CCB unless mathematically correct
- Do not show "leave stage has passed" incorrectly

## Deployment
- GitHub repo: github.com/paulsmethot/parent-cost-planner
- Hosted on Vercel: parent-cost-planner.vercel.app
- Auto-deploys on every push to main
- No environment variables required — fully client-side