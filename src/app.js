import express from 'express';
import { createStore } from './store.js';
import { currentUser } from './middleware/currentUser.js';
import { toolsRouter } from './routes/tools.js';

// Crée l'application sans ouvrir de port : les tests l'importent directement.
export function createApp({ store = createStore() } = {}) {
  const app = express();
  app.use(express.json());
  app.use(currentUser(store));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/tools', toolsRouter(store));

  return app;
}
