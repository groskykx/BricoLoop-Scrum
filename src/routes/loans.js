import { Router } from 'express';
import { LOAN_STATUS, TOOL_STATUS, isValidDate, today } from '../domain.js';
import { requireUser } from '../middleware/currentUser.js';

function badRequest(res, field, message) {
  return res.status(400).json({ error: message, field });
}

export function loansRouter(store) {
  const router = Router();

  // US-04 · Demander l'emprunt d'un outil
  router.post('/', requireUser, (req, res) => {
    const { toolId, startDate, endDate } = req.body ?? {};

    if (typeof toolId !== 'string' || toolId === '') {
      return badRequest(res, 'toolId', "L'identifiant de l'outil est obligatoire");
    }
    if (!isValidDate(startDate)) {
      return badRequest(res, 'startDate', 'La date de début doit être une date valide au format AAAA-MM-JJ');
    }
    if (!isValidDate(endDate)) {
      return badRequest(res, 'endDate', 'La date de fin doit être une date valide au format AAAA-MM-JJ');
    }
    if (startDate < today()) {
      return badRequest(res, 'startDate', 'La date de début ne peut pas être dans le passé');
    }
    if (endDate < startDate) {
      return badRequest(res, 'endDate', 'La date de fin doit être postérieure ou égale à la date de début');
    }

    const tool = store.tools.find((t) => t.id === toolId);
    if (!tool) {
      return res.status(404).json({ error: 'Outil introuvable' });
    }
    if (tool.ownerId === req.user.id) {
      return badRequest(res, 'toolId', 'Vous ne pouvez pas emprunter votre propre outil');
    }
    if (tool.status === TOOL_STATUS.UNAVAILABLE) {
      return res.status(409).json({ error: 'Cet outil est indisponible pour le moment' });
    }

    // Un outil « prêté » peut être demandé pour des dates futures (décision PO, Sprint 2).
    const loan = {
      id: store.nextId('l'),
      toolId,
      borrowerId: req.user.id,
      startDate,
      endDate,
      status: LOAN_STATUS.PENDING,
    };
    store.loans.push(loan);
    return res.status(201).json(loan);
  });

  return router;
}
