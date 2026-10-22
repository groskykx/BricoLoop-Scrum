import express from 'express';

// Crée l'application sans ouvrir de port : les tests l'importent directement.
export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  return app;
}
