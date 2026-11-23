import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';

const validTool = { name: 'Scie sauteuse', category: 'Perçage', description: 'Lames bois et métal.' };

describe('US-02 · POST /api/tools', () => {
  it('crée un outil appartenant à l’utilisateur courant, au statut « disponible »', async () => {
    const app = createApp();

    const res = await request(app).post('/api/tools').set('X-User-Id', 'u2').send(validTool);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...validTool, ownerId: 'u2', status: 'available' });
    const catalogue = await request(app).get('/api/tools');
    expect(catalogue.body.map((tool) => tool.id)).toContain(res.body.id);
  });

  it('accepte un outil sans description', async () => {
    const res = await request(createApp())
      .post('/api/tools')
      .set('X-User-Id', 'u2')
      .send({ name: 'Pelle', category: 'Jardinage' });

    expect(res.status).toBe(201);
    expect(res.body.description).toBe('');
  });

  it.each([
    ['nom absent', { category: 'Perçage' }, 'name'],
    ['nom trop court', { name: 'S', category: 'Perçage' }, 'name'],
    ['nom trop long', { name: 'x'.repeat(61), category: 'Perçage' }, 'name'],
    ['catégorie hors liste', { name: 'Scie', category: 'Cuisine' }, 'category'],
    ['description trop longue', { name: 'Scie', category: 'Perçage', description: 'x'.repeat(301) }, 'description'],
  ])('renvoie 400 en indiquant le champ en cause : %s', async (_cas, body, field) => {
    const res = await request(createApp()).post('/api/tools').set('X-User-Id', 'u2').send(body);

    expect(res.status).toBe(400);
    expect(res.body.field).toBe(field);
    expect(res.body.error).toBeDefined();
  });

  it('renvoie 401 sans utilisateur courant (décision PO à confirmer)', async () => {
    const res = await request(createApp()).post('/api/tools').send(validTool);

    expect(res.status).toBe(401);
  });
});
