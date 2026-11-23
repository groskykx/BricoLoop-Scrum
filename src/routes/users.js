import { Router } from 'express';

// US-09 · Liste des voisins, pour choisir son profil dans l'interface.
export function usersRouter(store) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(store.users.map(({ id, firstName, district }) => ({ id, firstName, district })));
  });

  return router;
}
