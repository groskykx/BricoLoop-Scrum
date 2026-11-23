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

  // US-03 · Voir le détail d'un outil
  router.get('/:id', (req, res) => {
    const tool = store.tools.find((t) => t.id === req.params.id);
    if (!tool) {
      return res.status(404).json({ error: 'Outil introuvable' });
    }

    const owner = store.users.find((user) => user.id === tool.ownerId);
    return res.json({
      id: tool.id,
      name: tool.name,
      category: tool.category,
      description: tool.description ?? '',
      status: tool.status,
      owner: owner ? { firstName: owner.firstName, district: owner.district } : null,
    });
  });

  return router;
}
