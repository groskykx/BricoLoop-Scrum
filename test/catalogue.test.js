import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store.js';

describe('US-01 · GET /api/tools', () => {
  it('affiche pour chaque outil son nom, sa catégorie et son statut', async () => {
    const res = await request(createApp()).get('/api/tools');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
    for (const tool of res.body) {
      expect(tool).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        category: expect.any(String),
        status: expect.stringMatching(/^(available|lent|unavailable)$/),
      });
    }
  });

  it('affiche les outils disponibles en premier', async () => {
    const store = createStore({
      users: [{ id: 'u1', firstName: 'Camille', district: 'Centre' }],
      tools: [
        { id: 'a', ownerId: 'u1', name: 'Scie', category: 'Autre', status: 'unavailable' },
        { id: 'b', ownerId: 'u1', name: 'Perceuse', category: 'Perçage', status: 'lent' },
        { id: 'c', ownerId: 'u1', name: 'Tondeuse', category: 'Jardinage', status: 'available' },
      ],
    });

    const res = await request(createApp({ store })).get('/api/tools');

    expect(res.body.map((tool) => tool.status)).toEqual(['available', 'lent', 'unavailable']);
  });

  it('renvoie une liste vide quand aucun outil n’existe', async () => {
    const store = createStore({ users: [], tools: [] });

    const res = await request(createApp({ store })).get('/api/tools');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
