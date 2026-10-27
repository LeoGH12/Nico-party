import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ dist folder does not exist after vite build');
  process.exit(1);
}

// Prepare .vercel/output/static for Vercel Build Output API v3
const vercelOutputDir = path.resolve(process.cwd(), '.vercel', 'output');
const vercelStaticDir = path.resolve(vercelOutputDir, 'static');

try {
  fs.mkdirSync(vercelStaticDir, { recursive: true });
  fs.cpSync(distDir, vercelStaticDir, { recursive: true });

  const vercelConfig = {
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/api/(.*)', dest: '/api' },
      { src: '/(.*)', dest: '/index.html' }
    ]
  };

  fs.writeFileSync(
    path.resolve(vercelOutputDir, 'config.json'),
    JSON.stringify(vercelConfig, null, 2),
    'utf-8'
  );

  console.log('✅ .vercel/output/static and config.json generated successfully.');
} catch (err) {
  console.warn('⚠️ Could not generate .vercel/output (harmless if using standard dist):', err);
}
