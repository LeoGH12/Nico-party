import app from '../server.ts';

export default function handler(req: any, res: any) {
  // Extract original URL from Vercel headers, matched path or request URL
  const original = req.headers?.['x-forwarded-uri'] || req.headers?.['x-matched-path'] || req.url || '';
  if (original && original.startsWith('/api')) {
    req.url = original;
  } else if (req.query && req.query.slug) {
    const slug = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
    const queryIdx = (req.url || '').indexOf('?');
    const queryString = queryIdx >= 0 ? req.url.slice(queryIdx) : '';
    req.url = `/api/${slug}${queryString}`;
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
