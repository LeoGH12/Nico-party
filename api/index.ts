import app from '../server.ts';

export default function handler(req: any, res: any) {
  // Ensure req.url retains the /api path for Express
  if (!req.url || req.url === '/' || req.url === '/api') {
    const original = req.headers?.['x-forwarded-uri'] || req.headers?.['x-matched-path'];
    if (original) {
      req.url = original.split('?')[0];
    }
  }
  return app(req, res);
}
