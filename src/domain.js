// Règles métier partagées par toutes les routes.

export const CATEGORIES = ['Perçage', 'Jardinage', 'Peinture', 'Nettoyage', 'Mesure', 'Autre'];

export const TOOL_STATUS = {
  AVAILABLE: 'available',
  LENT: 'lent',
  UNAVAILABLE: 'unavailable',
};

export const LOAN_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REFUSED: 'refused',
  RETURNED: 'returned',
};

// Une date valide est au format AAAA-MM-JJ et existe dans le calendrier (pas de 30 février).
export function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Date du jour au format AAAA-MM-JJ. Les dates de ce format se comparent comme des chaînes.
export function today() {
  return new Date().toISOString().slice(0, 10);
}
