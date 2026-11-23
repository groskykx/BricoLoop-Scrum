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

// US-06 · Deux périodes se chevauchent si chacune commence avant (ou le jour où) l'autre finit.
// Bornes incluses : un prêt du 10 au 15 bloque une demande qui commence le 15.
export function overlaps(a, b) {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

// Date du jour au format AAAA-MM-JJ. Les dates de ce format se comparent comme des chaînes.
export function today() {
  return new Date().toISOString().slice(0, 10);
}
