export function formatPrice(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDistance(distanceKm) {
  if (distanceKm === undefined || distanceKm === null) return 'Nearby';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m from IPS`;
  }
  return `${distanceKm.toFixed(1)} km from IPS`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatRelativeDays(daysAgo) {
  if (daysAgo === undefined || daysAgo === null) return 'Updated recently';
  if (daysAgo === 0) return 'Updated today';
  if (daysAgo === 1) return 'Updated yesterday';
  return `Updated ${daysAgo} days ago`;
}

