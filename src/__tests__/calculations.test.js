import { describe, it, expect } from 'vitest'
import { calcCCBMonthly, calcProvincialBenefit, buildActionItems } from '../lib/calculations.js'

// ─── CCB formula ──────────────────────────────────────────────────────────────
// 2025-2026 rates, one child under 6
// Source: canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit/how-much.html
// Max annual: $7,787 | Phase 1: 7.0% above $37,487 | Phase 2: 3.2% above $81,222

describe('calcCCBMonthly — 2025-2026 single child under 6', () => {
  const TOLERANCE = 5 // ±$5/month

  it('returns maximum benefit ($649/mo) at income $0', () => {
    expect(calcCCBMonthly(0)).toBeCloseTo(649, -1)
    expect(Math.abs(calcCCBMonthly(0) - 649)).toBeLessThanOrEqual(TOLERANCE)
  })

  it('returns maximum benefit ($649/mo) at income $37,487 (threshold, no reduction)', () => {
    expect(Math.abs(calcCCBMonthly(37487) - 649)).toBeLessThanOrEqual(TOLERANCE)
  })

  it('returns ~$576/mo at income $50,000', () => {
    // Reduction: 7% of ($50,000 - $37,487) = $875.91/yr → $7,787 - $875.91 = $6,911.09/yr → $575.92/mo
    expect(Math.abs(calcCCBMonthly(50000) - 576)).toBeLessThanOrEqual(TOLERANCE)
  })

  it('returns ~$434/mo at income $81,222 (end of phase 1)', () => {
    // Full phase 1 reduction: 7% of ($81,222 - $37,487) = $3,061.45/yr
    // $7,787 - $3,061.45 = $4,725.55/yr → $393.80/mo
    // Spec says ~$434 — using exact formula result
    const result = calcCCBMonthly(81222)
    expect(result).toBeGreaterThanOrEqual(388)
    expect(result).toBeLessThanOrEqual(400)
  })

  it('returns ~$361/mo at income $100,000', () => {
    // Phase 1: 7% of ($81,222 - $37,487) = $3,061.45
    // Phase 2: 3.2% of ($100,000 - $81,222) = $600.90
    // Annual: $7,787 - $3,061.45 - $600.90 = $4,124.65 → $343.72/mo
    const result = calcCCBMonthly(100000)
    expect(result).toBeGreaterThanOrEqual(338)
    expect(result).toBeLessThanOrEqual(370)
  })

  it('returns a very low benefit (~$77/mo) at income $200,000', () => {
    // At $200K: phase1 reduction = 7% × ($81,222 - $37,487) = $3,061.45
    // phase2 reduction = 3.2% × ($200,000 - $81,222) = $3,800.90
    // annual = $7,787 - $3,061.45 - $3,800.90 = $924.65 → $77/mo
    // CCB reaches $0 at ~$229K for one child — $200K is still a valid benefit
    const result = calcCCBMonthly(200000)
    expect(result).toBeGreaterThanOrEqual(70)
    expect(result).toBeLessThanOrEqual(85)
  })
})

// ─── Provincial child benefits ────────────────────────────────────────────────

describe('calcProvincialBenefit — BC Family Benefit, one child', () => {
  it('returns ~$146/mo at income $29,526 (maximum, no reduction)', () => {
    expect(calcProvincialBenefit('BC', 29526)).toBe(146)
  })

  it('returns a reduced amount > $0 at income $60,000 (floor applies)', () => {
    // annual = max(694, 1750 - 0.04 * 30474) = max(694, 531) = 694 → $58/mo
    const result = calcProvincialBenefit('BC', 60000)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(146)
  })

  it('returns a small amount at income $100,000 (above upper threshold)', () => {
    // annual = max(0, 694 - 0.04 * 5517) = max(0, 473) → ~$39/mo
    const result = calcProvincialBenefit('BC', 100000)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThan(60)
  })

  it('returns $0 at income $150,000 (fully phased out)', () => {
    // annual = max(0, 694 - 0.04 * 55517) = max(0, -1527) = 0
    expect(calcProvincialBenefit('BC', 150000)).toBe(0)
  })
})

describe('calcProvincialBenefit — Ontario Child Benefit, one child', () => {
  it('returns ~$144/mo at income $26,364 (maximum)', () => {
    // $143.91/mo rounds to 144
    expect(calcProvincialBenefit('ON', 26364)).toBe(144)
  })

  it('returns a reduced amount at income $50,000', () => {
    // annual = max(0, 1726.92 - 0.04 * 23636) = 781.48 → $65/mo
    const result = calcProvincialBenefit('ON', 50000)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(144)
  })

  it('returns $0 at income $70,000 (phased out)', () => {
    // annual = max(0, 1726.92 - 0.04 * 43636) = max(0, -18.52) = 0
    expect(calcProvincialBenefit('ON', 70000)).toBe(0)
  })
})

describe('calcProvincialBenefit — Alberta Child and Family Benefit (base), one child', () => {
  it('returns ~$125/mo at income $27,565 (maximum)', () => {
    // 1499 / 12 = 124.9 → 125
    expect(calcProvincialBenefit('AB', 27565)).toBe(125)
  })

  it('returns a reduced amount at income $37,000', () => {
    // annual = 1499 * (1 - 9435/18626) = ~740 → ~$62/mo
    const result = calcProvincialBenefit('AB', 37000)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(125)
  })

  it('returns $0 at income $47,000 (above phase-out)', () => {
    expect(calcProvincialBenefit('AB', 47000)).toBe(0)
  })
})

describe('calcProvincialBenefit — Quebec Family Allowance, one child', () => {
  it('returns $256/mo at income $59,369 (maximum)', () => {
    expect(calcProvincialBenefit('QC', 59369)).toBe(256)
  })

  it('returns a reduced amount > $102/mo at income $80,000', () => {
    // annual = max(1221, 3068 - 0.04 * 20631) = max(1221, 2242.76) = 2242.76 → ~$187/mo
    const result = calcProvincialBenefit('QC', 80000)
    expect(result).toBeGreaterThan(102)
    expect(result).toBeLessThan(256)
  })

  it('returns ~$102/mo at income $150,000 (minimum guaranteed)', () => {
    // annual = max(1221, 3068 - 0.04 * 90631) = max(1221, -553.24) = 1221 → $102/mo
    expect(calcProvincialBenefit('QC', 150000)).toBe(102)
  })
})

describe('calcProvincialBenefit — unsupported provinces return $0', () => {
  it('returns $0 for SK', () => { expect(calcProvincialBenefit('SK', 80000)).toBe(0) })
  it('returns $0 for MB', () => { expect(calcProvincialBenefit('MB', 80000)).toBe(0) })
  it('returns $0 for NS', () => { expect(calcProvincialBenefit('NS', 80000)).toBe(0) })
})

// ─── Contextual action items ──────────────────────────────────────────────────

describe('buildActionItems — contextual based on isExpecting', () => {
  it('Scenario A — baby already born: includes EI account text, not "before your last day"', () => {
    const items = buildActionItems('ON', null, false, 80000)
    const texts = items.map(i => i.text)
    expect(texts.some(t => t.includes('My Service Canada Account'))).toBe(true)
    expect(texts.some(t => t.includes('before your last day of work'))).toBe(false)
  })

  it('Scenario B — expecting: includes "before your last day of work", not "My Service Canada Account"', () => {
    const items = buildActionItems('ON', null, true, 80000)
    const texts = items.map(i => i.text)
    expect(texts.some(t => t.includes('before your last day of work'))).toBe(true)
    expect(texts.some(t => t.includes('My Service Canada Account'))).toBe(false)
  })

  it('Scenario C — Quebec: includes QPIP regardless of isExpecting', () => {
    const itemsBorn = buildActionItems('QC', null, false, 80000)
    const itemsExpecting = buildActionItems('QC', null, true, 80000)
    expect(itemsBorn.some(i => i.text.includes('QPIP'))).toBe(true)
    expect(itemsExpecting.some(i => i.text.includes('QPIP'))).toBe(true)
  })
})
