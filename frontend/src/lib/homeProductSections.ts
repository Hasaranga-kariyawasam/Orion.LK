export const DEFAULT_BEST_SELLER_BANNER_IMAGE = '/best-sellers-campaign.png';

export function normalizeCategoryName(category: string): string {
  const normalized = category.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  if (/(ches|shes|xes|zes|sses)$/.test(normalized)) return normalized.slice(0, -2);
  return normalized.replace(/s$/, '');
}

export function matchesCategoryName(first: string, second: string): boolean {
  const normalizedFirst = normalizeCategoryName(first);
  const normalizedSecond = normalizeCategoryName(second);
  return normalizedFirst === normalizedSecond
    || normalizedFirst.endsWith(` ${normalizedSecond}`)
    || normalizedSecond.endsWith(` ${normalizedFirst}`);
}
