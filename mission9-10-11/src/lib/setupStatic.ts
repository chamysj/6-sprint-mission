import express from 'express';
import path from 'path';
import { PUBLIC_PATH, STATIC_PATH } from './constants';

export function setupStatic(app: express.Express) {
  if (process.env.UPLOAD_PROVIDER === 's3') return;
  app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));
}
