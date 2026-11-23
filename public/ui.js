// Fonctions d'affichage sans DOM : testées par Vitest, utilisées par app.js dans le navigateur.

const TOOL_STATUS_LABELS = {
  available: 'Disponible',
  lent: 'Prêté',
  unavailable: 'Indisponible',
};

const LOAN_STATUS_LABELS = {
  pending: 'En attente',
  accepted: 'Acceptée',
  refused: 'Refusée',
  returned: 'Rendue',
};

const FIELD_LABELS = {
  name: 'nom',
  category: 'catégorie',
  description: 'description',
  toolId: 'outil',
  startDate: 'date de début',
  endDate: 'date de fin',
};

const FALLBACK_ERRORS = {
  400: 'Une information est manquante ou invalide.',
  401: 'Choisissez un profil en haut de la page.',
  403: 'Cette action est réservée au propriétaire de l’outil. Changez de profil en haut de la page.',
  404: 'Cet élément n’existe pas ou plus.',
  409: 'Action impossible dans l’état actuel.',
};

const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export function statusLabel(status) {
  return TOOL_STATUS_LABELS[status] ?? status;
}

export function loanStatusLabel(status) {
  return LOAN_STATUS_LABELS[status] ?? status;
}

// 2099-03-10 → « 10 mars 2099 »
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

// Calcul en UTC : le résultat ne dépend pas du fuseau horaire du navigateur.
export function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Message montré à l'utilisateur : celui de l'API s'il existe, sinon une explication selon le code HTTP.
export function describeError(status, body = {}) {
  const message = body.error ?? FALLBACK_ERRORS[status] ?? 'Le serveur a rencontré un problème. Réessayez.';
  const field = body.field ? FIELD_LABELS[body.field] ?? body.field : null;
  return field ? `${message} (champ : ${field})` : message;
}
