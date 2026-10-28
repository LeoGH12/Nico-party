import app from '../server.ts';

export default function handler(req: any, res: any) {
  if (req.query && req.query.slug) {
    const slug = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
    req.url = `/api/${slug}`;
  }
  return app(req, res);
}
