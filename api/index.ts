import app from '../server.ts';

export default function handler(req: any, res: any) {
  const original = req.headers?.['x-forwarded-uri'] || req.headers?.['x-matched-path'] || req.url || '';
  if (original && original.startsWith('/api')) {
    req.url = original;
  }
  return app(req, res);
}

