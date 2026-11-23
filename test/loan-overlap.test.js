import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store.js';
import { seed } from '../src/seed.js';
import { overlaps } from '../src/domain.js';

describe('US-06 · overlaps(a, b), règle pure', () => {
  const pret = { startDate: '2099-03-10', endDate: '2099-03-15' };

  it.each([
    ['inclus dans le prêt', '2099-03-12', '2099-03-14', true],
    ['qui déborde avant', '2099-03-05', '2099-03-10', true],
    ['qui déborde après', '2099-03-15', '2099-03-20', true],
    ['qui englobe le prêt', '2099-03-01', '2099-03-31', true],
    ['qui commence le lendemain de la fin', '2099-03-16', '2099-03-20', false],
    ['qui finit la veille du début', '2099-03-01', '2099-03-09', false],
  ])('un intervalle %s → %s', (_cas, startDate, endDate, attendu) => {
    expect(overlaps(pret, { startDate, endDate })).toBe(attendu);
    expect(overlaps({ startDate, endDate }, pret)).toBe(attendu);
  });
});

// t1 (perceuse) appartient à u1. l1 : prêt accepté à u2 du 10 au 15 mars 2099.
function appAvecPretAccepte(autresDemandes = []) {
  const store = createStore({
    ...seed,
    tools: seed.tools.map((tool) => (tool.id === 't1' ? { ...tool, status: 'lent' } : tool)),
    loans: [
      { id: 'l1', toolId: 't1', borrowerId: 'u2', startDate: '2099-03-10', endDate: '2099-03-15', status: 'accepted' },
      ...autresDemandes,
    ],
  });
  return { app: createApp({ store }), store };
}

function demander(app, startDate, endDate, userId = 'u3') {
  return request(app).post('/api/loans').set('X-User-Id', userId).send({ toolId: 't1', startDate, endDate });
}

describe('US-06 · pas de prêts acceptés qui se chevauchent', () => {
  it('étant donné un prêt accepté du 10 au 15, une demande du 12 au 14 est refusée en 409', async () => {
    const { app } = appAvecPretAccepte();

    const res = await demander(app, '2099-03-12', '2099-03-14');

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });

  it('une demande qui commence le lendemain de la fin du prêt est acceptable', async () => {
    const { app } = appAvecPretAccepte();

    const res = await demander(app, '2099-03-16', '2099-03-20');

    expect(res.status).toBe(201);
  });

  describe('règles proposées au PO (Sprint 3)', () => {
    it('les bornes sont incluses : une demande qui commence le jour de la fin est refusée', async () => {
      const { app } = appAvecPretAccepte();

      const res = await demander(app, '2099-03-15', '2099-03-18');

      expect(res.status).toBe(409);
    });

    it('des demandes en attente peuvent se chevaucher entre elles', async () => {
      const app = createApp();

      const premiere = await demander(app, '2099-05-10', '2099-05-15', 'u2');
      const seconde = await demander(app, '2099-05-12', '2099-05-14', 'u3');

      expect(premiere.status).toBe(201);
      expect(seconde.status).toBe(201);
    });

    it('à l’acceptation, une demande qui chevauche un prêt déjà accepté est refusée en 409', async () => {
      const { app, store } = appAvecPretAccepte([
        { id: 'l2', toolId: 't1', borrowerId: 'u3', startDate: '2099-03-14', endDate: '2099-03-18', status: 'pending' },
      ]);

      const res = await request(app).post('/api/loans/l2/accept').set('X-User-Id', 'u1');

      expect(res.status).toBe(409);
      expect(store.loans.find((loan) => loan.id === 'l2').status).toBe('pending');
    });

    it('à l’acceptation, une demande sans chevauchement est acceptée', async () => {
      const { app } = appAvecPretAccepte([
        { id: 'l2', toolId: 't1', borrowerId: 'u3', startDate: '2099-04-01', endDate: '2099-04-05', status: 'pending' },
      ]);

      const res = await request(app).post('/api/loans/l2/accept').set('X-User-Id', 'u1');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('accepted');
    });

    it('un prêt rendu ne bloque plus les dates', async () => {
      const store = createStore({
        ...seed,
        loans: [
          { id: 'l1', toolId: 't1', borrowerId: 'u2', startDate: '2099-03-10', endDate: '2099-03-15', status: 'returned' },
        ],
      });

      const res = await demander(createApp({ store }), '2099-03-12', '2099-03-14');

      expect(res.status).toBe(201);
    });
  });
});
