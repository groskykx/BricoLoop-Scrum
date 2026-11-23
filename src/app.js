import { fileURLToPath } from 'node:url';
import express from 'express';
import { createStore } from './store.js';
import { currentUser } from './middleware/currentUser.js';
import { toolsRouter } from './routes/tools.js';
import { loansRouter } from './routes/loans.js';
import { usersRouter } from './routes/users.js';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));

// Crée l'application sans ouvrir de port : les tests l'importent directement.
export function createApp({ store = createStore() } = {}) {
  const app = express();
  app.use(express.json());
  app.use(currentUser(store));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/tools', toolsRouter(store));
  app.use('/api/loans', loansRouter(store));
  app.use('/api/users', usersRouter(store));

  // US-09 · Interface web : http://localhost:3000/
  app.use(express.static(publicDir));

  return app;
}
