import app from '../server.ts';

export default function handler(req: any, res: any) {
  // Extract path from Vercel rewrite param (__path) or matched headers or req.url
  const queryPath = req.query && typeof req.query.__path === 'string' ? req.query.__path : null;
  const headerPath = (req.headers && req.headers['x-matched-path']) as string | undefined;
  const forwardedUri = (req.headers && req.headers['x-forwarded-uri']) as string | undefined;

  let target = queryPath || headerPath || forwardedUri || req.url;

  if (target) {
    const clean = target.split('?')[0];
    if (clean === '/api/index' || clean === '/api' || clean === '/') {
      req.url = '/api/status';
    } else {
      req.url = clean.startsWith('/api') ? clean : `/api${clean.startsWith('/') ? clean : '/' + clean}`;
    }
  }

  return app(req, res);
}
