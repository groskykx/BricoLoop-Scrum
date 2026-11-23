import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store.js';
import { seed } from '../src/seed.js';

// t1 (perceuse) appartient à u1 et est prêtée à u2 (prêt l1, accepté).
function appAvecPret(status = 'accepted') {
  const store = createStore({
    ...seed,
    tools: seed.tools.map((tool) => (tool.id === 't1' ? { ...tool, status: 'lent' } : tool)),
    loans: [{ id: 'l1', toolId: 't1', borrowerId: 'u2', startDate: '2099-03-10', endDate: '2099-03-15', status }],
  });
  return { app: createApp({ store }), store };
}

function declarerRetour(app, loanId, userId = 'u1') {
  return request(app).post(`/api/loans/${loanId}/return`).set('X-User-Id', userId);
}

describe('US-07 · POST /api/loans/:id/return', () => {
  it('seul le propriétaire peut déclarer le retour, sinon 403', async () => {
    const { app } = appAvecPret();

    const parEmprunteur = await declarerRetour(app, 'l1', 'u2');
    const parVoisin = await declarerRetour(app, 'l1', 'u3');

    expect(parEmprunteur.status).toBe(403);
    expect(parVoisin.status).toBe(403);
  });

  it('le prêt passe « rendu » et l’outil redevient « disponible »', async () => {
    const { app, store } = appAvecPret();

    const res = await declarerRetour(app, 'l1');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('returned');
    expect(store.tools.find((tool) => tool.id === 't1').status).toBe('available');
    const catalogue = await request(app).get('/api/tools');
    expect(catalogue.body.find((tool) => tool.id === 't1').status).toBe('available');
    const fiche = await request(app).get('/api/tools/t1');
    expect(fiche.body.status).toBe('available');
  });

  describe('règles proposées au PO (Sprint 3)', () => {
    it('renvoie 404 pour un prêt inconnu', async () => {
      const { app } = appAvecPret();

      const res = await declarerRetour(app, 'inconnu');

      expect(res.status).toBe(404);
    });

    it.each(['pending', 'refused', 'returned'])(
      'renvoie 409 pour un prêt qui n’est pas « accepté » (%s)',
      async (status) => {
        const { app } = appAvecPret(status);

        const res = await declarerRetour(app, 'l1');

        expect(res.status).toBe(409);
      },
    );

    it('renvoie 401 sans utilisateur courant', async () => {
      const { app } = appAvecPret();

      const res = await request(app).post('/api/loans/l1/return');

      expect(res.status).toBe(401);
    });
  });

  it('enchaîne le parcours complet : demande → acceptation → retour → outil de nouveau empruntable', async () => {
    const app = createApp();
    const dates = { toolId: 't1', startDate: '2099-06-01', endDate: '2099-06-05' };
    const demande = await request(app).post('/api/loans').set('X-User-Id', 'u2').send(dates);
    await request(app).post(`/api/loans/${demande.body.id}/accept`).set('X-User-Id', 'u1');

    const retour = await declarerRetour(app, demande.body.id);
    const nouvelleDemande = await request(app).post('/api/loans').set('X-User-Id', 'u3').send(dates);

    expect(retour.status).toBe(200);
    expect(nouvelleDemande.status).toBe(201);
  });
});
