// Shared by the current-action panel and the scenario matrix.
export function classifyRegime({ price, ma200, target, low, high, ready = true }) {
  if (!ready || ![price, ma200, target, low, high].every(v => Number.isFinite(v) && v > 0)) return 'unavailable';
  if (price < ma200) return 'risk';
  if (price >= target) return 'target';
  if (price >= low && price <= high) return 'retest';
  return 'wait';
}
export function parseScenario(value) {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}
