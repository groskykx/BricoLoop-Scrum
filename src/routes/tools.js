import { Router } from 'express';
import { TOOL_STATUS } from '../domain.js';

// Ordre d'affichage du catalogue : les outils disponibles d'abord.
const STATUS_ORDER = {
  [TOOL_STATUS.AVAILABLE]: 0,
  [TOOL_STATUS.LENT]: 1,
  [TOOL_STATUS.UNAVAILABLE]: 2,
};

export function toolsRouter(store) {
  const router = Router();

  // US-01 · Consulter le catalogue des outils
  router.get('/', (req, res) => {
    const catalogue = [...store.tools]
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
      .map(({ id, name, category, status }) => ({ id, name, category, status }));
    res.json(catalogue);
  });

  return router;
}
