import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store.js';
import { seed } from '../src/seed.js';

// t1 (perceuse) appartient à u1. Deux voisins l'ont demandée : l1 (u2) et l2 (u3).
// Les demandes sont posées directement dans le store : US-05 ne dépend pas de la route de US-04.
function appAvecDemandes(loans) {
  const store = createStore({
    ...seed,
    loans: loans ?? [
      { id: 'l1', toolId: 't1', borrowerId: 'u2', startDate: '2099-03-10', endDate: '2099-03-15', status: 'pending' },
      { id: 'l2', toolId: 't1', borrowerId: 'u3', startDate: '2099-04-01', endDate: '2099-04-05', status: 'pending' },
    ],
  });
  return { app: createApp({ store }), store };
}

function repondre(app, loanId, decision, userId = 'u1') {
  return request(app).post(`/api/loans/${loanId}/${decision}`).set('X-User-Id', userId);
}

describe('US-05 · POST /api/loans/:id/accept et /refuse', () => {
  it.each(['accept', 'refuse'])('seul le propriétaire de l’outil peut répondre, sinon 403 (%s)', async (decision) => {
    const { app } = appAvecDemandes();

    const res = await repondre(app, 'l1', decision, 'u3');

    expect(res.status).toBe(403);
  });

  it('une demande acceptée passe « acceptée » et l’outil passe « prêté »', async () => {
    const { app, store } = appAvecDemandes();

    const res = await repondre(app, 'l1', 'accept');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');
    expect(store.tools.find((tool) => tool.id === 't1').status).toBe('lent');
    const fiche = await request(app).get('/api/tools/t1');
    expect(fiche.body.status).toBe('lent');
  });

  it('une demande refusée passe « refusée » et l’outil ne change pas', async () => {
    const { app, store } = appAvecDemandes();

    const res = await repondre(app, 'l1', 'refuse');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('refused');
    expect(store.tools.find((tool) => tool.id === 't1').status).toBe('available');
  });

  it.each([
    ['acceptée', 'accepted'],
    ['refusée', 'refused'],
    ['rendue', 'returned'],
  ])('on ne peut répondre qu’à une demande « en attente », sinon 409 (déjà %s)', async (_libelle, status) => {
    const { app } = appAvecDemandes([
      { id: 'l1', toolId: 't1', borrowerId: 'u2', startDate: '2099-03-10', endDate: '2099-03-15', status },
    ]);

    const accept = await repondre(app, 'l1', 'accept');
    const refuse = await repondre(app, 'l1', 'refuse');

    expect(accept.status).toBe(409);
    expect(refuse.status).toBe(409);
  });

  describe('règles décidées par le PO (Sprint 2)', () => {
    it('renvoie 404 pour une demande inconnue', async () => {
      const { app } = appAvecDemandes();

      const res = await repondre(app, 'inconnue', 'accept');

      expect(res.status).toBe(404);
    });

    it('à l’acceptation, les autres demandes en attente sur le même outil restent en attente', async () => {
      const { app, store } = appAvecDemandes();

      await repondre(app, 'l1', 'accept');

      expect(store.loans.find((loan) => loan.id === 'l2').status).toBe('pending');
    });

    it('renvoie 401 sans utilisateur courant', async () => {
      const { app } = appAvecDemandes();

      const res = await request(app).post('/api/loans/l1/accept');

      expect(res.status).toBe(401);
    });
  });

  it('enchaîne avec US-04 : une demande créée par l’API peut être acceptée', async () => {
    const app = createApp();
    const demande = await request(app)
      .post('/api/loans')
      .set('X-User-Id', 'u2')
      .send({ toolId: 't1', startDate: '2099-03-10', endDate: '2099-03-15' });

    const res = await repondre(app, demande.body.id, 'accept');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');
  });
});
