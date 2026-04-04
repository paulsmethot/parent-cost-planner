# Parent Cost Planner — Project Brief

## What this is
A Canadian financial planning tool for new and expecting parents. Users input their province, household income, and baby's age or due date, and receive a personalized breakdown of parental leave income, Canada Child Benefit payments, childcare costs by province, and RESP basics. The goal is a clear, opinionated output — not a spreadsheet, but a verdict with context and next steps.

## Tech stack
- React (Vite)
- Tailwind CSS
- shadcn/ui for components
- No backend, no database, no authentication for V0
- All calculations are client-side using hardcoded government data tables

## Layout
- Mobile-first, single column, three-screen guided flow
- Desktop (768px+): two-column layout — intake form on the left, results panel live-updating on the right
- Default to 390px mobile viewport when building and previewing

## Visual direction
- Warm, approachable, trustworthy — this is for stressed new parents, not finance bros
- Rounded corners throughout (border-radius: 12px for cards, 20px for chips/pills)
- Generous whitespace and padding
- Typography: a distinctive, warm sans-serif — not Inter, not system font
- Colour palette: soft warm neutrals as base, one confident accent colour (not blue, not purple)
- No gradients, no drop shadows, no decorative noise
- Subtle animations on screen transitions and results reveal

## Core data model
Three inputs drive everything:
- province (string, e.g. "BC", "ON", "QC")
- householdIncome (number, annual CAD)
- caregiverIncome (number, annual CAD — the person taking leave)
- babyStage (enum: "expecting" | "newborn" | "infant" | "toddler")
- leaveType (enum: "standard" | "extended" | "shared")

## Calculation logic
Use these real Canadian figures — do not invent numbers:

**EI Parental Leave**
- Insurable earnings cap: $63,200/year
- Standard leave (12 months): 55% of weekly insurable earnings
- Extended leave (18 months): 33% of weekly insurable earnings
- Quebec uses QPIP — flag this differently in results

**Canada Child Benefit (CCB)**
- Base annual amount: $7,787 per child under 6
- No reduction below $36,502 household income
- Reduction rate: 13.8% of income above $36,502 up to $80,000
- Reduction rate: 6.79% of income above $80,000
- Display as monthly amount (divide annual by 12)

**Childcare costs by province (monthly estimates)**
- BC: $1,350
- AB: $1,200
- SK: $900
- MB: $780
- ON: $1,500
- QC: $430 (subsidized CPE at $13.10/day)
- NB: $780
- NS: $890
- PEI: $650
- NL: $820

## Screens
1. **Intake screen 1** — Province picker, baby stage chips
2. **Intake screen 2** — Household income slider, caregiver income slider, leave type chips
3. **Results screen** — Verdict paragraph, metric cards, 18-month timeline, action items list

## Results output
- Always lead with a plain-English verdict paragraph (2–3 sentences, specific to their inputs)
- Metric cards: income drop during leave, CCB monthly, childcare cost, net monthly impact
- Timeline: 4 key moments from now through return to work
- Action items: 4 prioritised things to do, province-aware where relevant
- Quebec always gets special treatment — QPIP note, subsidized childcare callout

## Responsive behaviour
- Mobile: screen-by-screen flow with progress bar
- Desktop: left panel shows current intake step, right panel shows live results updating as inputs change (no need to reach the results screen — it's always visible)

## What to avoid
- Do not use Inter, Roboto, Arial, or system fonts
- Do not use blue or purple as the primary accent
- Do not add authentication, user accounts, or any backend
- Do not store any user data anywhere
- Do not add unnecessary loading states — all calculations are instant
- Do not over-engineer — this is a V0, keep it clean and shippable

## First task
When I say "start the build", scaffold the full project: initialise a Vite + React app, install and configure Tailwind CSS and shadcn/ui, create the three-screen component structure, implement the calculation logic, and apply the visual direction above. Then connect it to GitHub and confirm the Vercel deploy is live.