import app from '../server.ts';

export default function handler(req: any, res: any) {
  // If Vercel passed req.url without /api prefix, normalize it:
  if (req.url && !req.url.startsWith('/api')) {
    if (req.query && req.query.slug) {
      const slugPath = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
      req.url = `/api/${slugPath}`;
    } else {
      req.url = `/api${req.url.startsWith('/') ? req.url : '/' + req.url}`;
    }
  }
  return app(req, res);
}
