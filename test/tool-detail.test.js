import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';

describe('US-03 · GET /api/tools/:id', () => {
  it('affiche nom, catégorie, description, statut, prénom et quartier du propriétaire', async () => {
    const res = await request(createApp()).get('/api/tools/t1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 't1',
      name: 'Perceuse à percussion',
      category: 'Perçage',
      description: 'Bosch 750 W, coffret de forets inclus.',
      status: 'available',
      owner: { firstName: 'Camille', district: 'Centre' },
    });
  });

  it('renvoie 404 pour un identifiant inconnu', async () => {
    const res = await request(createApp()).get('/api/tools/inconnu');

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
