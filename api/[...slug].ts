import app from '../server.ts';

export default function handler(req: any, res: any) {
  const queryPath = req.query && typeof req.query.__path === 'string' ? req.query.__path : null;
  const headerPath = (req.headers && req.headers['x-matched-path']) as string | undefined;
  const forwardedUri = (req.headers && req.headers['x-forwarded-uri']) as string | undefined;

  let target = queryPath || headerPath || forwardedUri;

  if (!target && req.query && req.query.slug) {
    const slugParts = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
    target = `/api/${slugParts}`;
  }

  if (!target) {
    target = req.url;
  }

  if (target) {
    const clean = target.split('?')[0];
    req.url = clean.startsWith('/api') ? clean : `/api${clean.startsWith('/') ? clean : '/' + clean}`;
  }

  return app(req, res);
}
