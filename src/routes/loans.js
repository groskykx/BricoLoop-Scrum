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

  // US-05 · Accepter ou refuser une demande
  // Les autres demandes en attente sur le même outil restent en attente (décision PO, Sprint 2).
  // Le contrôle de chevauchement des dates relève de US-06.
  const decide = (newStatus) => (req, res) => {
    const loan = store.loans.find((l) => l.id === req.params.id);
    if (!loan) {
      return res.status(404).json({ error: 'Demande introuvable' });
    }
    const tool = store.tools.find((t) => t.id === loan.toolId);
    if (!tool || tool.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Seul le propriétaire de l'outil peut répondre à cette demande" });
    }
    if (loan.status !== LOAN_STATUS.PENDING) {
      return res.status(409).json({ error: 'Cette demande a déjà reçu une réponse' });
    }

    loan.status = newStatus;
    if (newStatus === LOAN_STATUS.ACCEPTED) {
      tool.status = TOOL_STATUS.LENT;
    }
    return res.json(loan);
  };

  router.post('/:id/accept', requireUser, decide(LOAN_STATUS.ACCEPTED));
  router.post('/:id/refuse', requireUser, decide(LOAN_STATUS.REFUSED));

  // US-07 · Déclarer le retour d'un outil
  router.post('/:id/return', requireUser, (req, res) => {
    const loan = store.loans.find((l) => l.id === req.params.id);
    if (!loan) {
      return res.status(404).json({ error: 'Prêt introuvable' });
    }
    const tool = store.tools.find((t) => t.id === loan.toolId);
    if (!tool || tool.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Seul le propriétaire de l'outil peut déclarer son retour" });
    }
    if (loan.status !== LOAN_STATUS.ACCEPTED) {
      return res.status(409).json({ error: 'Seul un prêt accepté peut être déclaré rendu' });
    }

    loan.status = LOAN_STATUS.RETURNED;
    tool.status = TOOL_STATUS.AVAILABLE;
    return res.json(loan);
  });

  return router;
}
