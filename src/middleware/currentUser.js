// Pas d'authentification réelle : l'utilisateur courant vient de l'en-tête X-User-Id.

export function currentUser(store) {
  return (req, res, next) => {
    const userId = req.get('X-User-Id');
    req.user = store.users.find((user) => user.id === userId) ?? null;
    next();
  };
}

export function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'En-tête X-User-Id manquant ou inconnu' });
  }
  return next();
}
