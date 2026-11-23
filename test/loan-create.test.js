import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store.js';
import { seed } from '../src/seed.js';

// Dates lointaines : les tests ne dépendent pas du jour où ils tournent.
const demande = { toolId: 't1', startDate: '2099-03-10', endDate: '2099-03-15' };

function demander(app, body, userId = 'u2') {
  return request(app).post('/api/loans').set('X-User-Id', userId).send(body);
}

describe('US-04 · POST /api/loans', () => {
  it('crée une demande « en attente » pour un outil disponible, avec dates de début et de fin', async () => {
    const res = await demander(createApp(), demande);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...demande, borrowerId: 'u2', status: 'pending' });
    expect(res.body.id).toEqual(expect.any(String));
  });

  it('refuse une date de fin antérieure à la date de début (400)', async () => {
    const res = await demander(createApp(), { ...demande, startDate: '2099-03-15', endDate: '2099-03-10' });

    expect(res.status).toBe(400);
    expect(res.body.field).toBe('endDate');
  });

  it('refuse que je demande mon propre outil (400)', async () => {
    const res = await demander(createApp(), demande, 'u1');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('accepte plusieurs demandes en attente pour le même outil', async () => {
    const app = createApp();

    const premiere = await demander(app, demande, 'u2');
    const seconde = await demander(app, demande, 'u3');

    expect(premiere.status).toBe(201);
    expect(seconde.status).toBe(201);
    expect(seconde.body.id).not.toBe(premiere.body.id);
  });

  describe('règles décidées par le PO (Sprint 2)', () => {
    it('renvoie 404 pour un outil inconnu', async () => {
      const res = await demander(createApp(), { ...demande, toolId: 'inconnu' });

      expect(res.status).toBe(404);
    });

    it('renvoie 409 pour un outil indisponible', async () => {
      // t2 (taille-haie, indisponible) appartient à u2 : la demande vient de u3.
      const res = await demander(createApp(), { ...demande, toolId: 't2' }, 'u3');

      expect(res.status).toBe(409);
    });

    it('autorise une demande sur un outil déjà prêté, pour des dates futures', async () => {
      const store = createStore({
        ...seed,
        tools: seed.tools.map((tool) => (tool.id === 't1' ? { ...tool, status: 'lent' } : tool)),
      });

      const res = await demander(createApp({ store }), demande);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
    });

    it('refuse une date de début dans le passé (400)', async () => {
      const res = await demander(createApp(), { ...demande, startDate: '2000-01-01', endDate: '2000-01-05' });

      expect(res.status).toBe(400);
      expect(res.body.field).toBe('startDate');
    });

    it.each([
      ['format jour/mois/année', { startDate: '10/03/2099' }, 'startDate'],
      ['date qui n’existe pas', { endDate: '2099-02-30' }, 'endDate'],
      ['date absente', { startDate: undefined }, 'startDate'],
    ])('refuse un format de date invalide (400) : %s', async (_cas, dates, field) => {
      const res = await demander(createApp(), { ...demande, ...dates });

      expect(res.status).toBe(400);
      expect(res.body.field).toBe(field);
    });

    it('renvoie 401 sans utilisateur courant', async () => {
      const res = await request(createApp()).post('/api/loans').send(demande);

      expect(res.status).toBe(401);
    });
  });
});
