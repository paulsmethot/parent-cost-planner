import ReactGA from 'react-ga4'

export function initGA() {
  ReactGA.initialize('G-0KX0T2CY6C')
}

export function bucketIncome(annual) {
  if (annual < 50000) return 'under_50k'
  if (annual < 75000) return '50k_75k'
  if (annual < 100000) return '75k_100k'
  if (annual < 125000) return '100k_125k'
  if (annual < 150000) return '125k_150k'
  return 'over_150k'
}

export function bucketGap(monthlyGap) {
  const abs = Math.abs(monthlyGap)
  if (abs < 500) return 'under_500'
  if (abs < 1000) return '500_1000'
  if (abs < 2000) return '1000_2000'
  if (abs < 3000) return '2000_3000'
  return 'over_3000'
}

export function trackEvent(name, params = {}) {
  ReactGA.event(name, params)
}
