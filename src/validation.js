import { CATEGORIES } from './domain.js';

// US-02 · Renvoie { field, message } pour la première donnée invalide, ou null si tout est bon.
export function validateNewTool(body = {}) {
  const { name, category, description } = body;

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
    return { field: 'name', message: 'Le nom est obligatoire et doit faire entre 2 et 60 caractères' };
  }
  if (!CATEGORIES.includes(category)) {
    return { field: 'category', message: `La catégorie doit être l'une de : ${CATEGORIES.join(', ')}` };
  }
  if (description !== undefined && (typeof description !== 'string' || description.length > 300)) {
    return { field: 'description', message: 'La description doit être un texte de 300 caractères maximum' };
  }
  return null;
}
