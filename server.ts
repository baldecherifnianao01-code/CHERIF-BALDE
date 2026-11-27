import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import { createApiApp } from './server/app.ts';

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = createApiApp();

  // Intégration Vite (dev) ou fichiers statiques buildés (prod)
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur Cherif Balde prêt sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Échec démarrage serveur:', err);
  process.exit(1);
});
