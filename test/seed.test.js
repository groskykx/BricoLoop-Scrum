import { describe, it, expect } from 'vitest';
import { createStore } from '../src/store.js';
import { CATEGORIES } from '../src/domain.js';

describe('Données de démo (T-03)', () => {
  it('chargent 4 voisins et 8 outils dans au moins 3 catégories', () => {
    const store = createStore();
    expect(store.users).toHaveLength(4);
    expect(store.tools).toHaveLength(8);
    const categories = new Set(store.tools.map((tool) => tool.category));
    expect(categories.size).toBeGreaterThanOrEqual(3);
    for (const category of categories) expect(CATEGORIES).toContain(category);
  });

  it('donnent un store neuf à chaque appel', () => {
    const a = createStore();
    a.tools.pop();
    expect(createStore().tools).toHaveLength(8);
  });
});
