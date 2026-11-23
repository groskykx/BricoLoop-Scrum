import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';
import { describeError, formatDate, statusLabel, loanStatusLabel, addDays } from '../public/ui.js';

describe('US-09 · interface web servie par l’API', () => {
  it('la page d’accueil est une page HTML qui charge l’interface', async () => {
    const res = await request(createApp()).get('/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('BricoLoop');
    expect(res.text).toContain('app.js');
  });

  it('le script et la feuille de style sont servis', async () => {
    const app = createApp();

    const script = await request(app).get('/app.js');
    const style = await request(app).get('/style.css');

    expect(script.status).toBe(200);
    expect(script.headers['content-type']).toMatch(/javascript/);
    expect(style.status).toBe(200);
  });

  it('GET /api/users liste les profils à choisir (prénom et quartier)', async () => {
    const res = await request(createApp()).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
    expect(res.body[0]).toEqual({ id: 'u1', firstName: 'Camille', district: 'Centre' });
  });
});

describe('US-09 · libellés affichés à l’utilisateur', () => {
  it.each([
    ['available', 'Disponible'],
    ['lent', 'Prêté'],
    ['unavailable', 'Indisponible'],
  ])('statut d’outil %s → %s', (status, label) => {
    expect(statusLabel(status)).toBe(label);
  });

  it.each([
    ['pending', 'En attente'],
    ['accepted', 'Acceptée'],
    ['refused', 'Refusée'],
    ['returned', 'Rendue'],
  ])('statut de demande %s → %s', (status, label) => {
    expect(loanStatusLabel(status)).toBe(label);
  });

  it('formate une date AAAA-MM-JJ en français', () => {
    expect(formatDate('2099-03-10')).toBe('10 mars 2099');
  });

  it('ajoute des jours à une date sans dépendre du fuseau horaire', () => {
    expect(addDays('2099-02-27', 3)).toBe('2099-03-02');
  });
});

describe('US-09 · les erreurs de l’API sont affichées en clair', () => {
  it('reprend le message de l’API et nomme le champ en cause', () => {
    const message = describeError(400, { error: 'La date de fin doit être postérieure', field: 'endDate' });

    expect(message).toBe('La date de fin doit être postérieure (champ : date de fin)');
  });

  it.each([
    [403, 'Cette action est réservée au propriétaire de l’outil. Changez de profil en haut de la page.'],
    [409, 'Action impossible dans l’état actuel.'],
    [500, 'Le serveur a rencontré un problème. Réessayez.'],
  ])('donne une explication utile sans message de l’API (%i)', (status, attendu) => {
    expect(describeError(status, {})).toBe(attendu);
  });
});
