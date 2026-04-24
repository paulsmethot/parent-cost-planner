# Parent Cost Planner — Project Brief

## What this is
A Canadian financial planning tool for new and expecting 
parents. Users input their province, baby's date of birth 
or expected due date, household income, leave type, and 
optional additional costs. They receive a personalized 
breakdown of parental leave income, Canada Child Benefit, 
provincial child benefits, childcare costs by province, 
and a prioritized action checklist. The goal is a clear, 
empowering output — not a spreadsheet, but a verdict 
with context and next steps.

Live at: parent-cost-planner.vercel.app
GitHub: github.com/paulsmethot/parent-cost-planner

## Tech stack
- React (Vite)
- Tailwind CSS
- shadcn/ui for components
- No backend, no database, no authentication
- All calculations are client-side using hardcoded 
  government data tables
- Deployed on Vercel, auto-deploys on push to main
- Vitest for automated tests — 25 passing

## Layout
- Mobile-first, single column, full-screen step flow
- Desktop (768px+): full screen centered, max-width 
  640px for intake steps, max-width 1100px for results
- No side panels or split views during intake
- Results screen is a dedicated payoff screen after 
  all steps are complete

## Visual direction
- Wealthsimple-inspired: warm, minimal, trustworthy
- White background (#FFFFFF), warm grey surfaces (#F7F7F5)
- Typography: Playfair Display for intro headline only, 
  DM Sans for all body text, labels, and UI elements
- Colour system:
  · Primary text: #1A1A1A
  · Secondary text: #6B6B6B
  · Border: #E5E5E3
  · Positive amounts: #2D6A4F (dark green)
  · Negative/cost amounts: #92400E (dark amber)
  · CTA buttons: #1A1A1A background, white text
  · Surface/card: #F7F7F5
- Border-radius: 12px for cards and buttons, 
  20px for pills and chips
- No gradients, no drop shadows, no decorative noise
- All text must pass WCAG AA contrast minimums
- Subtle fade + upward slide transition between 
  screens (200ms)

## Global footer bar
Appears on every screen — intro, all 4 steps, results:
- Full width, border-top: 1px solid #E5E5E3
- Background: #FAFAFA
- Padding: 16px 24px
- Single line, centered, font-size 12px, 
  colour #6B6B6B:
  "Made for Canadian parents, by Leon's dad, 
  Paul Methot."
- "Paul Methot" links to 
  https://www.linkedin.com/in/paulsmethot/
  subtle underline, same muted colour, no icon
- Footer sits at bottom of viewport on short screens,
  flows naturally below content on long screens

## Core data model
- province (string, e.g. "BC", "ON", "QC")
- babyDOB (date string — past date = already born, 
  future date = expecting)
- isExpecting (boolean, derived: babyDOB > today)
- caregiverIncome (number, annual CAD — primary 
  caregiver taking leave, gross pre-tax)
- partnerIncome (number, annual CAD — optional, 
  defaults to 0, gross pre-tax)
- householdIncome (derived: caregiverIncome + 
  partnerIncome)
- leaveType (enum: "standard" | "extended" | 
  "shared" | "topup")
- employerTopUp (number, monthly CAD — only if 
  leaveType is "topup", no upper cap)
- additionalMonthlyCosts (object):
  · babyFood: number (default 0)
  · diapers: number (default 0)
  · clothing: number (default 0)
  · lessons: number (default 0)
  · additionalChildcare: number (default 0)
  · other: number (default 0)
  · otherLabel: string (custom label)
  · User can rename, remove, and add custom 
    expense categories

## Step structure (4 steps + intro screen)

### Screen 0 — Intro
- No eyebrow line
- Headline (Playfair Display): 
  "Know exactly what parenthood costs."
- Subheadline: personalized breakdown description
- Three trust signals with Lucide icons 
  (size 16, strokeWidth 1.5, color #6B6B6B)
  Icon containers: rounded squares, 
  border-radius 8px, background #F1F1F1
  · Landmark — "Built on real Canadian 
    government figures"
  · EyeOff — "Free. No account needed and 
    nothing is saved."
  · Clock — "Takes about 2 minutes to complete"
- CTA: "Start planning" — black button, white text
- Global footer bar at bottom

### Screen 1 — Province + baby date (Step 1 of 4)
- Province picker (select dropdown, full width)
- Single date input: "Baby's date of birth or 
  expected due date"
- Sublabel: "Enter a past date if your baby is born, 
  or a future date if you're expecting."
- System derives isExpecting by comparing date to today
- No toggle needed — date comparison handles logic
- Continue disabled until both province and date filled
- Global footer bar at bottom

### Screen 2 — Household income (Step 2 of 4)
- Heading: "What's your household income?"
- Sublabel: "Enter your gross annual income before 
  taxes. We use these to calculate your EI payments 
  and Canada Child Benefit."

Field 1 — Required:
- Label: "PRIMARY CAREGIVER INCOME (PRE-TAX)"
- Sublabel: "The person taking parental leave, 
  before any deductions"
- CAD $ text input with placeholder: 
  "Enter your annual income"
- Pills (3-column grid, fully toggleable):
  $50K, $75K, $100K, $125K, $150K, Custom
- Pills are toggleable — click to select, click 
  again to deselect
- Custom pill: dashed border, focuses input, 
  does not set value to $0
- Live EI estimate card updates as user inputs value

Field 2 — Optional:
- Label: "CO-PARENT OR PARTNER INCOME (PRE-TAX)"
- Optional badge inline with label
- No placeholder text — leave empty
- Same pill layout as Field 1, identical behaviour
- Default value: 0 for all calculations
- Does not affect Continue button state

- Note below fields: "Your EI is calculated from 
  the primary income. Your Canada Child Benefit 
  is based on the combined household total."
- Continue enables when primary field > 0
- Global footer bar at bottom

### Screen 3 — Leave type (Step 3 of 4)
- Heading: "What kind of leave are you taking?"
- Four selectable cards:
  · Standard: "12 months at 55% of insurable 
    earnings. The most common choice."
  · Extended: "18 months at 33% of insurable 
    earnings. Lower monthly but a longer runway."
  · Shared: "Split between both parents, combined 
    up to 12 or 18 months total."
  · Employer top-up: "Your employer supplements EI. 
    Common in government and some corporate roles."
- If top-up selected: reveal CAD $ text input 
  for monthly top-up amount, no upper cap, 
  placeholder "e.g. 2,500"
- CTA: "Continue"
- No em dashes in card copy anywhere
- Global footer bar at bottom

### Screen 4 — Additional monthly costs (Step 4 of 4)
- Heading: "Any other monthly costs?"
- Sublabel: "These are optional. Add what applies 
  and we'll factor them into your net impact."
- Expense cards — each card has:
  · Editable title (click to rename inline)
  · Monthly CAD $ amount input
  · Remove button (X) in top right
- Default categories:
  · Baby food and formula — "Typically $100 to 
    $300/month in year one"
  · Diapers and wipes — "Typically $80 to 
    $150/month"
  · Clothing and gear — "Typically $50 to 
    $150/month"
  · Lessons and activities — "Typically $100 to 
    $200/month"
  · Additional childcare — "Drop-in care, 
    occasional sitters, etc."
  · Other — free text label + amount
- "+ Add expense" button at bottom of list
- Running total shown at bottom
- CTA: "See my numbers" if any costs entered, 
  "Skip this step" if all $0
- All fields optional
- Global footer bar at bottom

### Screen 5 — Results dashboard
Max-width 1100px, single column on mobile, 
full width on desktop.

Layout order (strict — do not reorder):
1. "YOUR RESULTS" eyebrow label
2. Headline: "Your family's monthly picture, 
   [Province], Canada."
3. Verdict paragraph — one sentence only, 
   states totalComingIn figure confidently. 
   Reads "between EI, CCB, and [provBenefitName]" 
   when provincial benefit > $0, otherwise 
   "between EI and CCB."
4. QPIP banner (Quebec only) — sits here, 
   above "Monthly income during leave" heading
5. "Monthly income during leave" section
6. "Monthly costs during leave" section
7. "Estimated monthly income gap" card
8. Estimates disclaimer info box
9. Divider
10. "Your next 18 months" timeline
11. Divider
12. "Your first moves" checklist
13. Divider
14. "Export results" dropdown button
15. "Edit my details" ghost button
16. Global footer bar

## Results screen details

### Section headings
All section headings match exactly:
- Font-size: 18px, font-weight: 600
- Colour: #1A1A1A, sentence case, no letter-spacing
- Applies to: "Monthly income during leave", 
  "Monthly costs during leave", 
  "Estimated monthly income gap",
  "Your next 18 months", "Your first moves"

### Monthly income during leave
Line items:
- EI parental leave: +$[amount]/mo (green)
- Canada Child Benefit: +$[amount]/mo (green)
- Provincial benefit (conditional): +$[amount]/mo (green)
  Only shown when province is BC, ON, AB, or QC 
  and calculated amount > $0
  Labelled with correct program name:
  · BC: "BC Family Benefit"
  · ON: "Ontario Child Benefit"
  · AB: "Alberta Child and Family Benefit"
  · QC: "Quebec Family Allowance"
  Sublabel: "Provincial supplement, tax-free" 
  (or quarterly note for AB and QC)
- Dividers between rows: 1px solid #F0F0EE
- Total coming in: +$[amount]/mo (green, larger)
  No sublabel. Includes EI + CCB + provincialBenefit 
  + employerTopUp
- CCB footnote after total row:
  Background #F7F7F5, border-radius 8px, 
  padding 10px 14px, info icon left, 
  13px text, colour #6B6B6B
  Copy: "CCB updates each July from your prior 
  year tax return. A lower-income leave year 
  may increase your benefit next cycle."

### Monthly costs during leave
Line items:
- Estimated childcare (if leave ongoing):
  Shown as future awareness item at 50% opacity,
  "From [Month Year]" pill badge on right,
  "Not included in your current gap calculation" 
  note below at 50% opacity,
  do NOT include in gap calculation
- Your pre-leave monthly income: -$[amount]/mo (amber)
- Additional costs (if any): -$[amount]/mo (amber)
- Total going out: -$[amount]/mo (amber, larger)
  No sublabel.

### Estimated monthly income gap card
- Background: #F7F7F5, border: 1px solid #E5E5E3, 
  border-radius: 12px
- Heading: "Estimated monthly income gap"
- Hero number: large, amber (#92400E)
- Unit: "/month" at 100% opacity
- Reassurance copy: "Most families cover this gap 
  with savings built before leave starts. The 
  checklist below shows where to begin."
- No summary lines above the hero number

### Estimates disclaimer info box
Sits directly below the gap card, above the divider:
- Same style as CCB footnote
- Background: #F7F7F5, border-radius: 8px, 
  padding: 10px 14px, info icon left, 
  13px text, colour #6B6B6B
- Copy: "All figures are estimates based on gross 
  pre-tax income. Actual take-home amounts will 
  vary based on your tax situation."

### Amount formatting
- Line item amounts: "/mo" at 100% opacity
- Gap card hero number: "/month" at 100% opacity
- All positive amounts: green (#2D6A4F)
- All negative/cost amounts: amber (#92400E)
- No red anywhere on results screen

### Timeline — Your next 18 months
- Real calendar dates derived from babyDOB
- Format: "MONTH YEAR" for period labels
- "Baby turns 1" and "18 month milestone" 
  noted where applicable
- Never use abstract "Month 2", "Month 6" labels

### Checklist — Your first moves
- Subtitle: "Tap any item to open the official 
  government resource."
- Checkboxes on left, external link icon on right
- Checking strikes through and dims the item
- In-session state only, no persistence needed
- Items are CONTEXTUAL based on isExpecting:

If expecting (isExpecting = true):
1. "Apply for EI before your last day of work"
   → canada.ca/en/services/benefits/ei/
     ei-maternity-parental.html
2. "Register for CCB as soon as your baby arrives"
   → canada.ca/en/revenue-agency/services/
     child-family-benefits/
     canada-child-benefit-overview.html
3. "Get on childcare waitlists now. Spaces fill fast."
   → canada.ca/en/public-health/services/
     caring-for-kids/child-care.html
4. "Open an RESP before baby arrives to start 
   earning the $500 annual federal grant."
   → canada.ca/en/revenue-agency/services/tax/
     individuals/topics/
     registered-education-savings-plans-resps.html

If already born (isExpecting = false):
1. "Apply for EI parental benefits on My Service 
   Canada Account."
   → canada.ca/en/services/benefits/ei/
     ei-maternity-parental.html
2. "Register your child for CCB through CRA 
   My Account."
   → canada.ca/en/revenue-agency/services/
     child-family-benefits/
     canada-child-benefit-overview.html
3. "Open an RESP at any bank or credit union. 
   Every $2,500/year earns a $500 federal grant."
   → canada.ca/en/revenue-agency/services/tax/
     individuals/topics/
     registered-education-savings-plans-resps.html
4. "Start touring daycares now. Regulated spots 
   in [Province] average $[amount]/month."
   → canada.ca/en/public-health/services/
     caring-for-kids/child-care.html

If province is QC, add in both scenarios:
"Apply for QPIP instead of federal EI. 
Quebec's parental insurance is more generous."
→ rqap.gouv.qc.ca/en/about-the-plan/
  general-information/
  quebec-parental-insurance-plan-qpip

### Export results
- Single ghost button with chevron
- Two options: Save as PDF, Download CSV
  (Google Sheets removed — broken)
- PDF: window.print() with print stylesheet
- CSV: client-side generation, no backend
- Button height: 48px, border-radius: 12px, 
  border: 1px solid #E5E5E3

### Footer buttons
Both "Export results" and "Edit my details":
- Identical styling: height 48px, min-height 48px, 
  border-radius 12px, border 1px solid #E5E5E3,
  background white, text #1A1A1A, font-size 15px,
  font-weight 500
- Desktop: side by side, equal width, 12px gap
- Mobile: stacked vertically, full width, 8px gap

## Calculation logic

### EI Parental Leave
- Insurable earnings cap: $63,200/year
- Standard leave (12 months): 55% of weekly 
  insurable earnings × 4.33
- Extended leave (18 months): 33% of weekly 
  insurable earnings × 4.33
- Employer top-up: add flat monthly amount 
  on top of EI, no upper cap
- Quebec uses QPIP — always flag with a note
- Leave window logic based on babyDOB:
  · Baby under 12 months: standard leave open
  · Baby under 18 months: extended leave may apply
  · isExpecting true: leave hasn't started yet

### Canada Child Benefit (2025-2026)
Source: canada.ca/en/revenue-agency/services/
child-family-benefits/canada-child-benefit/
how-much.html

- Maximum annual: $7,787 per child under 6
- No reduction below $37,487 AFNI
- First reduction: 7.0% of income above $37,487 
  up to $81,222 (single child rate)
- Second reduction: 3.2% of income above $81,222 
  (single child rate)
- Display as monthly (annual ÷ 12)
- Never show $0 unless mathematically correct.
  CCB for one child under 6 does not reach $0 
  until approximately $229K AFNI. At $200K 
  income CCB is still approximately $77/month.
- CCB near-zero copy (< $10/mo): "At your 
  household income, CCB is nearly fully phased 
  out. Filing taxes early in a lower-income 
  leave year may still generate a small payment."

### Provincial child benefits
Implemented via calcProvincialBenefit(province, 
householdIncome) and provincialBenefitName(province) 
in calculations.js. Source URLs in comments above 
each formula.

Show as a line item only when province is BC, ON, 
AB, or QC and calculated amount > $0. Included in 
totalComingIn and gap calculation.

BC Family Benefit:
- Max $1,750/year ($146/mo) for one child
- No reduction below $29,526
- Reduces 4% above $29,526
- Phases out above $94,483

Ontario Child Benefit:
- Max $143.91/month per child
- No reduction below $26,364
- Reduces 4% above $26,364

Alberta Child and Family Benefit:
- Base component max $1,499/year ($125/mo)
- Reduces above $27,565
- Zero above $46,191
- Paid quarterly (Aug, Nov, Feb, May) — 
  show as monthly equivalent

Quebec Family Allowance:
- Max $3,068/year ($256/mo) per child
- Minimum guaranteed $1,221/year ($102/mo)
- Reduces above $59,369
- Paid quarterly (Jan, Apr, Jul, Oct) — 
  show as monthly equivalent

### Childcare costs by province (monthly)
- BC: $1,350
- AB: $1,200
- SK: $900
- MB: $780
- ON: $1,500
- QC: $430 (subsidized CPE, $13.10/day)
- NB: $780
- NS: $890
- PEI: $650
- NL: $820

### Net monthly gap calculation
Gap = caregiverMonthly - totalComingIn

Full net = EI + CCB + provincialBenefit 
           + employerTopUp 
           - childcare (if applicable) 
           - sum of additionalMonthlyCosts 
           - caregiverMonthly

### Childcare future line item logic
If baby age in months < leave duration in months:
- Show childcare as awareness item only
- Date shown = babyDOB + leave duration
- Do NOT include in gap calculation

## Quebec special handling
- QPIP replaces federal EI — always show note
- QPIP banner sits above "Monthly income during 
  leave" section heading, not above page heading
- Childcare: $430/mo subsidized CPE
- Quebec Family Allowance shown as provincial 
  benefit line item when amount > $0
- Both are better than other provinces — 
  call this out in verdict copy

## Copy rules
- No em dashes or en dashes in UI copy
- Use periods and natural sentence breaks instead
- All copy reads as humanly written
- Verdict paragraph: one confident sentence only
- Section headings: sentence case throughout
- Use "income" not "salary" throughout
- All income inputs are gross pre-tax

## What to avoid
- Do not use Inter, Roboto, Arial, or system fonts
- Do not use blue or purple as primary accent
- Do not add authentication, user accounts, 
  or any backend
- Do not store any user data anywhere
- Do not use abstract month counters in timeline
- Do not show red anywhere on results screen
- Do not add loading states — calculations instant
- Do not over-engineer

## Workflow notes
- Use Cursor chat for targeted polish and 
  iterative changes to existing components
- Use Claude Code for multi-file structural 
  changes and new feature builds
- Use Cursor Agents for end-to-end feature 
  builds with clear scope and success criteria
- Start each new Claude Code session fresh 
  rather than extending long sessions
- Test at 390px mobile width before every push
- Run npm test before every push — 25 tests 
  must pass

## Deployment
- GitHub: github.com/paulsmethot/parent-cost-planner
- Live: parent-cost-planner.vercel.app
- Auto-deploys on push to main
- No environment variables — fully client-side
- Deploy command: git add . && git commit -m 
  "description" && git push

## Completed features
- 4-step intake flow with intro screen
- Province picker + single date input 
  (isExpecting derived from date)
- Combined household income step with 
  toggleable pills
- Leave type selection with employer top-up
- Optional additional costs with editable, 
  removable, custom expense cards
- Results dashboard with income/costs breakdown
- Provincial child benefits — BC, ON, AB, QC 
  (conditional display, correct formulas, 
  25 Vitest tests passing)
- Estimated monthly income gap card 
  (hero number only, no summary lines)
- Dynamic results subtitle reflecting 
  totalComingIn and provincial program name
- Real calendar timeline (Your next 18 months)
- Contextual action checklist (Your first moves)
- Export results — PDF and CSV
- Global footer bar on all screens
- CCB footnote grounded in income section
- Estimates disclaimer info box near gap card
- QPIP banner repositioned above income section
- Intro screen polished: no eyebrow, Lucide icons 
  (Landmark, EyeOff, Clock), rounded square 
  containers at #F1F1F1
- Total row sublabels removed for cleaner layout

## Pre-launch checklist (for all future launches)
- Enable Vercel Analytics before launch day
- Set up branch-based development for all 
  new features — merge to main only when stable
- Test full flow across multiple provinces, 
  income levels, and isExpecting scenarios
- Verify export functions (PDF, CSV) working
- Update LinkedIn About and headline before 
  posting
- Prepare 1200x1200 visual asset with mobile 
  screenshots on #F7F7F5 background
- Draft and schedule LinkedIn post in advance
- Have URL with https:// ready for post

## V1 priority list (post-launch)
1. Leave type comparison (12mo vs 18mo)
2. Annual view toggle on results screen
3. Child Disability Benefit (CDB) — checkbox 
   for already-born babies
4. US version scoping — research state by 
   state regulatory complexity
5. Google Analytics 4 — custom event tracking 
   for step completions, results viewed, and 
   export actions
6. Willful partnership — replace government 
   will link with Willful referral link. 
   Requires GA4 engagement data first before 
   approaching Alyssa.

## V2 priority list (scope expansion)
7. Tax calculation layer (federal + provincial)
8. Auth + child profiles + multiples support
9. Option B split layout for intro screen

## V3 / exploratory
10. CCB rates live API integration (canada.ca)
    — only if a clean data source exists
11. Cursor Agents experiment — use for first 
    major multi-file build as test case
12. US version build — pending scoping from V1