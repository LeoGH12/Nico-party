import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { HALLOWEEN_CHARACTERS, Character } from './src/data/characters.ts';
import { checkCharacterGuess } from './src/utils/guessMatcher.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp' : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'party_state.json');

// Ensure data folder exists & seed on Vercel if needed
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (isVercel && !fs.existsSync(DB_FILE)) {
    const bundledSeed = path.resolve(process.cwd(), 'data', 'party_state.json');
    if (fs.existsSync(bundledSeed)) {
      fs.copyFileSync(bundledSeed, DB_FILE);
    }
  }
} catch (e) {
  console.error('Failed to prepare data dir:', e);
}

interface UserRecord {
  code: string;
  name: string;
  characterId: string;
  confirmed: boolean;
  rollsLeft: number;
  photoUrl?: string;
  photoTimestamp?: number;
  registeredAt: number;
}

interface GuessRecord {
  guessText: string;
  isCorrect: boolean;
  timestamp: number;
}

interface PartyState {
  partyDate: string; // "2026-10-31T22:00:00"
  partyLocation: string;
  forceUnlockCatwalk: boolean;
  votingFinalized: boolean;
  users: Record<string, UserRecord>; // keyed by code
  votes: Record<string, Record<string, number>>; // voterCode -> { targetCode: score (1-5) }
  guesses: Record<string, Record<string, GuessRecord>>; // guesserCode -> { targetCode: GuessRecord }
  cutreVotes: Record<string, string>; // voterCode -> targetCode (max 1 vote per voter!)
  customCharacters: Record<string, Character>; // dynamic characters added by users
}

const DEFAULT_STATE: PartyState = {
  partyDate: '2026-10-30T22:00:00',
  partyLocation: 'Casa de Nico',
  forceUnlockCatwalk: false,
  votingFinalized: false,
  users: {},
  votes: {},
  guesses: {},
  cutreVotes: {},
  customCharacters: {}
};

function loadState(): PartyState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      if (raw && raw.trim().length > 0) {
        const parsed = JSON.parse(raw);
        const resolvedDate = parsed.partyDate === '2026-10-31T22:00:00' ? '2026-10-30T22:00:00' : (parsed.partyDate || '2026-10-30T22:00:00');
        const loaded: PartyState = {
          ...DEFAULT_STATE,
          ...parsed,
          partyDate: resolvedDate,
          users: parsed.users || {},
          votes: parsed.votes || {},
          guesses: parsed.guesses || {},
          cutreVotes: parsed.cutreVotes || {},
          customCharacters: parsed.customCharacters || {}
        };
        return loaded;
      }
    }
  } catch (err) {
    console.error('Error loading party state, using default:', err);
  }
  return { ...DEFAULT_STATE };
}

let state: PartyState = loadState();

function getState(): PartyState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      if (raw && raw.trim().length > 0) {
        const parsed = JSON.parse(raw);
        state = {
          ...DEFAULT_STATE,
          ...parsed,
          partyDate: '2026-10-30T22:00:00',
          partyLocation: 'Casa de Nico',
          users: parsed.users || {},
          votes: parsed.votes || {},
          guesses: parsed.guesses || {},
          cutreVotes: parsed.cutreVotes || {},
          customCharacters: parsed.customCharacters || {}
        };
        return state;
      }
    }
  } catch (err) {
    console.error('Error reloading party state:', err);
  }
  return state;
}

function saveState(stateToSave: PartyState) {
  try {
    state = stateToSave;
    const dataStr = JSON.stringify(stateToSave, null, 2);
    fs.writeFileSync(DB_FILE, dataStr, 'utf-8');
  } catch (err) {
    console.error('Error saving party state:', err);
  }
}

// Express middlewares - 50MB limit for high-res mobile camera photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware to reload state on every request
app.use((_req: Request, _res: Response, next) => {
  getState();
  next();
});

// Vercel Path Normalizer: ensure routes match whether request has /api prefix or not
app.use((req: Request, _res: Response, next) => {
  if (req.url.startsWith('/@') || req.url.startsWith('/src') || req.url.startsWith('/dist') || req.url.startsWith('/assets') || req.url.includes('.')) {
    return next();
  }
  const original = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string) || req.originalUrl || req.url;
  if (!req.url.startsWith('/api')) {
    if (original && original.startsWith('/api')) {
      req.url = original;
    } else {
      const isApiRoute = [
        '/status', '/register', '/suggest-character', '/reroll', 
        '/confirm-character', '/get-user', '/upload-photo', '/guess', 
        '/vote', '/vote-cutre', '/catwalk', '/health', '/characters', 
        '/search-image', '/host'
      ].some(r => req.url.startsWith(r));

      if (isApiRoute) {
        req.url = `/api${req.url.startsWith('/') ? req.url : '/' + req.url}`;
      }
    }
  }
  next();
});

// Helper: generate 7-character uppercase alphanumeric code e.g. HLW-4K89
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'HLW-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (state.users[result]) return generateCode();
  return result;
}

function getAllCharacters(): Character[] {
  const customList = Object.values(state.customCharacters || {});
  return [...HALLOWEEN_CHARACTERS, ...customList];
}

function getClaimedCharacterIds(excludeCode?: string): Set<string> {
  const claimed = new Set<string>();
  for (const [code, u] of Object.entries(state.users)) {
    if (code !== excludeCode && u.confirmed && u.characterId) {
      claimed.add(u.characterId);
    }
  }
  return claimed;
}

function pickRandomCharacter(excludeCharacterIds: Set<string>): string {
  const all = getAllCharacters();
  const available = all.filter(c => !excludeCharacterIds.has(c.id));
  if (available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex].id;
  }
  return all[Math.floor(Math.random() * all.length)].id;
}

function isCatwalkUnlocked(): boolean {
  if (state.forceUnlockCatwalk) return true;
  const target = new Date(state.partyDate).getTime();
  return Date.now() >= target;
}

// Online search for top character image (DuckDuckGo + Bing fallback)
async function searchOnlineImage(query: string): Promise<string | null> {
  const cleanQ = query.trim();
  if (!cleanQ) return null;

  // 1. Try DuckDuckGo image search
  try {
    const reqUrl = `https://duckduckgo.com/?q=${encodeURIComponent(cleanQ)}`;
    const tokenRes = await fetch(reqUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const tokenHtml = await tokenRes.text();
    const vqdMatch = tokenHtml.match(/vqd=([\"']?)([\d-]+)\1/) || tokenHtml.match(/vqd=([\d-]+)/);
    if (vqdMatch) {
      const vqd = vqdMatch[2] || vqdMatch[1];
      const imgUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(cleanQ)}&vqd=${vqd}&f=,,,`;
      const imgRes = await fetch(imgUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const data = await imgRes.json();
      if (data.results && data.results.length > 0) {
        for (const r of data.results) {
          const u = r.image;
          if (u && !u.includes('alamy.com') && !u.includes('stockfood') && !u.includes('calendarpedia') && !u.includes('shutterstock')) {
            return u;
          }
        }
        return data.results[0].image;
      }
    }
  } catch (e) {
    console.warn('DDG image search failed, falling back to Bing:', e);
  }

  // 2. Bing fallback
  try {
    const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(cleanQ + ' character portrait movie')}&first=1`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const murls = Array.from(html.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g));
      const valid = murls.map(m => m[1]).filter(u => 
        u && !u.includes('alamy.com') && !u.includes('stockfood') && !u.includes('calendarpedia') && !u.includes('shutterstock')
      );
      if (valid.length > 0) {
        return valid[0];
      }
    }
  } catch (e) {
    console.warn('Image search error:', e);
  }
  return null;
}

// ======================== API ROUTES ========================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Dynamic image search for characters
app.get('/api/search-image', async (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q) return res.status(400).json({ error: 'Falta término de búsqueda' });

  const imageUrl = await searchOnlineImage(q);
  res.json({ imageUrl });
});

// Character catalog list (including custom user-suggested characters)
app.get('/api/characters', (_req: Request, res: Response) => {
  const all = getAllCharacters();
  const claimed = getClaimedCharacterIds();
  res.json({
    total: all.length,
    claimedCount: claimed.size,
    availableCount: all.length - claimed.size,
    characters: all.map(c => ({
      ...c,
      isClaimed: claimed.has(c.id)
    }))
  });
});

// Public status
app.get('/api/status', (_req: Request, res: Response) => {
  try {
    const claimedIds = Array.from(getClaimedCharacterIds());
    const usersList = Object.values(state.users);
    const totalUsers = usersList.length;
    const confirmedUsers = usersList.filter(u => u.confirmed).length;
    const photosCount = usersList.filter(u => !!u.photoUrl).length;
    const all = getAllCharacters();

    res.json({
      partyDate: state.partyDate,
      partyLocation: state.partyLocation,
      isUnlocked: isCatwalkUnlocked(),
      forceUnlockCatwalk: state.forceUnlockCatwalk,
      votingFinalized: state.votingFinalized,
      totalUsers,
      confirmedUsers,
      photosCount,
      claimedCharacterIds: claimedIds,
      totalAvailableCharacters: Math.max(0, all.length - claimedIds.length)
    });
  } catch (err) {
    console.error('Error in /api/status:', err);
    res.status(500).json({ error: 'Error al obtener estado' });
  }
});

// Register new user & assign random character
// Enforces: Existing users MUST enter with their code, not re-registering with their name!
app.post('/api/register', (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const cleanName = name.trim().slice(0, 30);

    // Security & Identity rule:
    // If a user with this name already exists, DO NOT allow re-registering!
    // They must use their code to enter.
    const existing = Object.values(state.users).find(
      u => u.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      return res.status(400).json({
        error: `Ya existe un participante registrado como "${cleanName}". Por seguridad de tu personaje secreto, debes ingresar únicamente con tu código alfanumérico.`,
        suggestCodeLogin: true
      });
    }

    const code = generateCode();
    const claimed = getClaimedCharacterIds();
    const assignedId = pickRandomCharacter(claimed);

    const newUser: UserRecord = {
      code,
      name: cleanName,
      characterId: assignedId,
      confirmed: false,
      rollsLeft: 2,
      registeredAt: Date.now()
    };

    state.users[code] = newUser;
    saveState(state);

    const all = getAllCharacters();
    const character = all.find(c => c.id === assignedId);
    res.json({
      user: newUser,
      character,
      claimedCount: claimed.size + 1
    });
  } catch (err) {
    console.error('Error in /api/register:', err);
    res.status(500).json({ error: 'Error interno al registrar participante' });
  }
});

// SUGGEST / PICK SPECIFIC CHARACTER (Non-random flow)
app.post('/api/suggest-character', async (req: Request, res: Response) => {
  try {
    const { name, characterName, source, customImageUrl } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del participante es obligatorio' });
    }
    if (!characterName || typeof characterName !== 'string' || !characterName.trim()) {
      return res.status(400).json({ error: 'Debes indicar el nombre del personaje que sugieres' });
    }

    const cleanName = name.trim().slice(0, 30);
    const cleanCharName = characterName.trim().slice(0, 40);
    const cleanSource = source ? String(source).trim().slice(0, 40) : 'Sugerencia Personal';

    // Prevent re-registering existing user by name
    const existing = Object.values(state.users).find(
      u => u.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      return res.status(400).json({
        error: `Ya existe un participante registrado como "${cleanName}". Ingresa con tu código alfanumérico.`,
        suggestCodeLogin: true
      });
    }

    // Check if character already claimed by another user
    const claimedIds = getClaimedCharacterIds();
    const all = getAllCharacters();
    const existingChar = all.find(
      c => c.name.toLowerCase() === cleanCharName.toLowerCase() ||
           c.id.toLowerCase() === cleanCharName.toLowerCase().replace(/\s+/g, '-')
    );

    if (existingChar && claimedIds.has(existingChar.id)) {
      return res.status(400).json({
        error: `El personaje "${existingChar.name}" ya ha sido elegido y bloqueado por otro amigo. ¡Elige otro distinto!`
      });
    }

    let finalChar: Character;

    if (existingChar) {
      // Pick existing unclaimed character directly
      finalChar = existingChar;
    } else {
      // Create new custom character and add to pool!
      const newCharId = 'custom-' + cleanCharName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) + '-' + Math.floor(Math.random() * 1000);
      
      // Look up real image online
      let fetchedImage = customImageUrl;
      if (!fetchedImage) {
        fetchedImage = await searchOnlineImage(cleanCharName + ' ' + cleanSource);
      }
      if (!fetchedImage) {
        fetchedImage = 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=800&q=80';
      }

      finalChar = {
        id: newCharId,
        name: cleanCharName,
        category: 'Cine de Terror',
        source: cleanSource,
        quote: '¡Esta noche de Halloween es mía!',
        description: `Personaje sugerido especialmente para la fiesta en Casa de Nico.`,
        imageUrl: fetchedImage,
        difficulty: 'Creativo Low-Cost',
        estimatedCost: '0€ - 3€',
        costumeBreakdown: {
          faceAndHair: 'Caracterízate con peinado o maquillaje icónico del personaje.',
          clothing: 'Prendas clave en tu armario que simulen el atuendo representativo.',
          signatureProp: 'El accesorio u objeto inconfundible del personaje.',
          zeroEuroHack: 'Usa cartón, tijeras y ropa reciclada de casa.'
        },
        diyTips: [
          { material: 'Ropa base', instructions: 'Revisa tu armario buscando los colores y cortes más parecidos a la vestimenta del personaje.' },
          { material: 'Atrezzo con cartón', instructions: 'Recorta en cartón los accesorios clave y fórralos con papel de aluminio o pintura.' },
          { material: 'Maquillaje casero', instructions: 'Usa lápiz de ojos y sombras para marcar los rasgos distintivos.' }
        ],
        secretMission: `Actúa como ${cleanCharName} durante al menos un momento de la noche delante de Nico.`
      };

      state.customCharacters[newCharId] = finalChar;
    }

    const code = generateCode();
    const newUser: UserRecord = {
      code,
      name: cleanName,
      characterId: finalChar.id,
      confirmed: true, // directly confirmed since they chose it!
      rollsLeft: 0,
      registeredAt: Date.now()
    };

    state.users[code] = newUser;
    saveState(state);

    res.json({
      user: newUser,
      character: finalChar,
      claimedCount: getClaimedCharacterIds().size
    });
  } catch (err) {
    console.error('Error in /api/suggest-character:', err);
    res.status(500).json({ error: 'Error al registrar personaje sugerido' });
  }
});

// Reroll character (up to 2 rerolls)
app.post('/api/reroll', (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Código de usuario requerido' });
    }

    const formattedCode = code.trim().toUpperCase();
    const user = state.users[formattedCode];
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (user.confirmed) {
      return res.status(400).json({ error: 'Tu personaje ya ha sido confirmado de forma definitiva' });
    }

    const rollsRemaining = typeof user.rollsLeft === 'number' ? user.rollsLeft : 2;
    if (rollsRemaining <= 0) {
      return res.status(400).json({ error: 'Ya no te quedan cambios de personaje disponibles' });
    }

    const claimed = getClaimedCharacterIds(formattedCode);
    claimed.add(user.characterId);
    const nextCharacterId = pickRandomCharacter(claimed);

    user.characterId = nextCharacterId;
    user.rollsLeft = rollsRemaining - 1;
    saveState(state);

    const all = getAllCharacters();
    const character = all.find(c => c.id === nextCharacterId);
    res.json({
      user,
      character,
      rollsLeft: user.rollsLeft
    });
  } catch (err) {
    console.error('Error in /api/reroll:', err);
    res.status(500).json({ error: 'Error interno al cambiar personaje' });
  }
});

// Confirm character permanently
app.post('/api/confirm-character', (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Código requerido' });
    }

    const formattedCode = code.trim().toUpperCase();
    const user = state.users[formattedCode];
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.confirmed = true;
    saveState(state);

    const all = getAllCharacters();
    const character = all.find(c => c.id === user.characterId);
    res.json({
      user,
      character
    });
  } catch (err) {
    console.error('Error in /api/confirm-character:', err);
    res.status(500).json({ error: 'Error interno al confirmar personaje' });
  }
});

// Restore / login by code ONLY
app.post('/api/get-user', (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Código requerido' });
    }

    const raw = code.trim().toUpperCase();
    const cleaned = raw.replace(/[^A-Z0-9]/g, '');

    const suffixClean = cleaned.replace(/^HLW/, '');

    // Search by exact key, cleaned alphanumeric match, or suffix match (e.g. "BBSD" or "HLW-BBSD")
    let foundCode = Object.keys(state.users).find(k => {
      const kRaw = k.toUpperCase();
      const kClean = kRaw.replace(/[^A-Z0-9]/g, '');
      const kSuffix = kClean.replace(/^HLW/, '');
      return kRaw === raw || kClean === cleaned || (suffixClean.length >= 4 && kSuffix === suffixClean);
    });

    if (!foundCode) {
      // Check if user accidentally typed their name instead of their code
      const nameMatch = Object.values(state.users).find(
        u => u.name.toLowerCase() === code.trim().toLowerCase()
      );
      if (nameMatch) {
        return res.status(400).json({
          error: `Has escrito tu nombre («${nameMatch.name}»). Por seguridad del secreto, el acceso es exclusivamente con tu código de 4 letras/números (ej. ${nameMatch.code}).`
        });
      }
      return res.status(404).json({ error: `Código «${code.trim()}» no encontrado en el servidor. Verifica que lo hayas copiado exactamente.` });
    }

    const user = state.users[foundCode];
    const all = getAllCharacters();
    let character = all.find(c => c.id === user.characterId);
    if (!character) {
      character = state.customCharacters[user.characterId] || HALLOWEEN_CHARACTERS[0];
    }

    res.json({
      user,
      character
    });
  } catch (err) {
    console.error('Error in /api/get-user:', err);
    res.status(500).json({ error: 'Error al recuperar usuario del servidor' });
  }
});

// Upload costume photo for the catwalk
app.post('/api/upload-photo', (req: Request, res: Response) => {
  try {
    if (!isCatwalkUnlocked()) {
      return res.status(403).json({ 
        error: 'La pasarela y los juegos están estrictamente bloqueados hasta el Viernes 30 de Octubre a las 22:00.' 
      });
    }

    const { code, photo } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Código de usuario requerido' });
    }

    const formattedCode = code.trim().toUpperCase();
    const user = state.users[formattedCode];
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (!photo || typeof photo !== 'string' || (!photo.startsWith('data:image/') && !photo.startsWith('http'))) {
      return res.status(400).json({ error: 'Formato de foto inválido' });
    }

    user.photoUrl = photo;
    user.photoTimestamp = Date.now();
    saveState(state);

    res.json({
      success: true,
      photoUrl: user.photoUrl,
      photoTimestamp: user.photoTimestamp
    });
  } catch (err) {
    console.error('Error in /api/upload-photo:', err);
    res.status(500).json({ error: 'Error al subir la fotografía' });
  }
});

// JUEGO 1: Submit a guess for a friend's costume
app.post('/api/guess', (req: Request, res: Response) => {
  try {
    if (!isCatwalkUnlocked()) {
      return res.status(403).json({ 
        error: 'El juego de adivinanzas está estrictamente bloqueado hasta el Viernes 30 de Octubre a las 22:00.' 
      });
    }

    const { guesserCode, targetCode, guessText } = req.body;
    if (!guesserCode || !targetCode || typeof guessText !== 'string') {
      return res.status(400).json({ error: 'Faltan datos de la adivinanza' });
    }

    const gCode = String(guesserCode).trim().toUpperCase();
    const tCode = String(targetCode).trim().toUpperCase();
    const cleanGuess = guessText.trim();

    if (gCode === tCode) {
      return res.status(400).json({ error: '¡No puedes adivinar tu propio disfraz!' });
    }
    if (!state.users[gCode] && gCode !== 'ADMIN') {
      return res.status(404).json({ error: 'Usuario adivinador no encontrado' });
    }
    const targetUser = state.users[tCode];
    if (!targetUser || !targetUser.photoUrl) {
      return res.status(404).json({ error: 'Participante objetivo no encontrado o sin foto' });
    }

    if (state.guesses[gCode] && state.guesses[gCode][tCode]) {
      return res.status(400).json({ 
        error: 'Ya has utilizado tu único intento para este disfraz. No se permiten más intentos.' 
      });
    }

    const all = getAllCharacters();
    const targetChar = all.find(c => c.id === targetUser.characterId);
    const targetCharName = targetChar ? targetChar.name : '';

    const isCorrect = checkCharacterGuess(cleanGuess, targetUser.characterId, targetCharName);

    if (!state.guesses[gCode]) {
      state.guesses[gCode] = {};
    }
    state.guesses[gCode][tCode] = {
      guessText: cleanGuess,
      isCorrect,
      timestamp: Date.now()
    };
    saveState(state);

    res.json({
      success: true,
      targetCode: tCode,
      guessText: cleanGuess,
      isCorrect
    });
  } catch (err) {
    console.error('Error in /api/guess:', err);
    res.status(500).json({ error: 'Error al procesar adivinanza' });
  }
});

// Submit a star vote (1-5 stars)
app.post('/api/vote', (req: Request, res: Response) => {
  try {
    if (!isCatwalkUnlocked()) {
      return res.status(403).json({ 
        error: 'Las votaciones están estrictamente bloqueadas hasta el Viernes 30 de Octubre a las 22:00.' 
      });
    }

    const { voterCode, targetCode, score } = req.body;

    if (!voterCode || !targetCode || score === undefined || score === null) {
      return res.status(400).json({ error: 'Faltan datos de votación' });
    }

    const vCode = String(voterCode).trim().toUpperCase();
    const tCode = String(targetCode).trim().toUpperCase();
    const numScore = parseInt(String(score), 10);

    if (vCode === tCode) {
      return res.status(400).json({ error: '¡No puedes votar por tu propio disfraz! Deja que tus amigos opinen.' });
    }
    if (!state.users[vCode] && vCode !== 'ADMIN') {
      return res.status(404).json({ error: 'Votante no reconocido' });
    }
    if (!state.users[tCode] || !state.users[tCode].photoUrl) {
      return res.status(404).json({ error: 'Participante a votar no encontrado o sin foto' });
    }
    if (isNaN(numScore) || numScore < 1 || numScore > 5) {
      return res.status(400).json({ error: 'La puntuación debe ser de 1 a 5 estrellas' });
    }

    // STRICT: Once confirmed, you CANNOT vote again for this participant!
    if (state.votes[vCode] && state.votes[vCode][tCode] !== undefined) {
      return res.status(400).json({ 
        error: 'Ya has emitido y confirmado tu puntuación de estrellas para este disfraz. No se permite volver a votar.' 
      });
    }

    if (!state.votes[vCode]) {
      state.votes[vCode] = {};
    }
    state.votes[vCode][tCode] = numScore;
    saveState(state);

    res.json({
      success: true,
      targetCode: tCode,
      score: numScore
    });
  } catch (err) {
    console.error('Error in /api/vote:', err);
    res.status(500).json({ error: 'Error al procesar el voto' });
  }
});

// SPECIAL VOTE: "El Disfraz Más Cutre" (1 solo voto definitivo en toda la noche)
app.post('/api/vote-cutre', (req: Request, res: Response) => {
  try {
    if (!isCatwalkUnlocked()) {
      return res.status(403).json({ 
        error: 'La votación especial está estrictamente bloqueada hasta el Viernes 30 de Octubre a las 22:00.' 
      });
    }

    const { voterCode, targetCode } = req.body;
    if (!voterCode || !targetCode) {
      return res.status(400).json({ error: 'Faltan datos de votación' });
    }

    const vCode = String(voterCode).trim().toUpperCase();
    const tCode = String(targetCode).trim().toUpperCase();

    if (vCode === tCode) {
      return res.status(400).json({ error: '¡No puedes autovotarte como el más cutre!' });
    }
    if (!state.users[vCode] && vCode !== 'ADMIN') {
      return res.status(404).json({ error: 'Votante no reconocido' });
    }
    if (!state.users[tCode] || !state.users[tCode].photoUrl) {
      return res.status(404).json({ error: 'Participante no encontrado o sin foto' });
    }

    // STRICT: Only 1 special vote per participant for the whole night! No changing or retracting!
    if (state.cutreVotes[vCode]) {
      return res.status(400).json({ 
        error: 'Ya has utilizado tu único voto especial de la noche. No se permite cambiarlo ni votar a nadie más.' 
      });
    }

    state.cutreVotes[vCode] = tCode;
    saveState(state);

    res.json({
      success: true,
      currentCutreVote: state.cutreVotes[vCode]
    });
  } catch (err) {
    console.error('Error in /api/vote-cutre:', err);
    res.status(500).json({ error: 'Error al procesar voto cutre' });
  }
});

// Catwalk runway: get all contestants, their photos, votes, guesses & rankings
app.get('/api/catwalk', (req: Request, res: Response) => {
  try {
    if (!isCatwalkUnlocked()) {
      return res.json({
        isUnlocked: false,
        votingFinalized: false,
        partyDate: state.partyDate,
        totalRegistered: Object.values(state.users).filter(u => u && u.confirmed).length,
        submittedCount: 0,
        allSubmitted: false,
        contestants: [],
        myVotes: {},
        myGuesses: {},
        myCutreVote: null,
        myScore: 0,
        detectiveScores: [],
        cutreWinner: null
      });
    }

    const voterCode = typeof req.query.voterCode === 'string' ? req.query.voterCode.toUpperCase().trim() : '';
    const myVotes = voterCode && state.votes[voterCode] ? state.votes[voterCode] : {};
    const myGuesses = voterCode && state.guesses[voterCode] ? state.guesses[voterCode] : {};
    const myCutreVote = voterCode && state.cutreVotes[voterCode] ? state.cutreVotes[voterCode] : null;

    const cutreCounts: Record<string, number> = {};
    for (const target of Object.values(state.cutreVotes)) {
      cutreCounts[target] = (cutreCounts[target] || 0) + 1;
    }

    const all = getAllCharacters();

    const contestants = Object.values(state.users)
      .filter(u => u && u.confirmed && !!u.photoUrl)
      .map(u => {
        const char = all.find(c => c.id === u.characterId);
        
        const ratings: number[] = [];
        for (const [vCode, targets] of Object.entries(state.votes)) {
          if (vCode !== u.code && targets && typeof targets[u.code] === 'number') {
            const score = targets[u.code];
            if (score >= 1 && score <= 5) {
              ratings.push(score);
            }
          }
        }

        const totalVotes = ratings.length;
        const avgScore = totalVotes > 0 
          ? parseFloat((ratings.reduce((a, b) => a + b, 0) / totalVotes).toFixed(1))
          : 0;

        const isMe = u.code === voterCode;
        const revealCharacter = state.votingFinalized || isMe;

        return {
          code: u.code,
          name: u.name,
          characterName: revealCharacter ? (char?.name || 'Personaje Misterioso') : '??? (¡Adivínalo!)',
          characterSource: revealCharacter ? (char?.source || '') : 'Oculto hasta el final',
          characterImage: revealCharacter ? (char?.imageUrl || '') : '',
          actualCharacterId: revealCharacter ? u.characterId : '',
          photoUrl: u.photoUrl,
          photoTimestamp: u.photoTimestamp,
          totalVotes,
          avgScore,
          hasMyVote: myVotes[u.code] || null,
          hasMyGuess: myGuesses[u.code] || null,
          totalCutreVotes: cutreCounts[u.code] || 0,
          isCutreVoteFromMe: myCutreVote === u.code
        };
      });

    contestants.sort((a, b) => {
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
      return b.totalVotes - a.totalVotes;
    });

    // Detective Ranking (Juego 1)
    const detectiveScores: Array<{ code: string; name: string; score: number }> = Object.values(state.users).map(u => {
      const userGuesses = state.guesses[u.code] || {};
      const correctCount = Object.values(userGuesses).filter(g => g.isCorrect).length;
      return {
        code: u.code,
        name: u.name,
        score: correctCount
      };
    });
    detectiveScores.sort((a, b) => b.score - a.score);

    // Cutre winner
    let cutreWinner: { code: string; name: string; votes: number } | null = null;
    let maxCutreVotes = 0;
    for (const [code, count] of Object.entries(cutreCounts)) {
      if (count > maxCutreVotes) {
        maxCutreVotes = count;
        const targetUser = state.users[code];
        if (targetUser) {
          cutreWinner = {
            code,
            name: targetUser.name,
            votes: count
          };
        }
      }
    }

    const allUsersList = Object.values(state.users);
    const totalRegistered = allUsersList.length;
    const confirmedCount = allUsersList.filter(u => u && u.confirmed).length;
    const allSubmitted = confirmedCount > 0 && contestants.length >= confirmedCount;
    const myScore = Object.values(myGuesses).filter(g => g.isCorrect).length;

    res.json({
      isUnlocked: isCatwalkUnlocked(),
      votingFinalized: state.votingFinalized,
      totalRegistered,
      submittedCount: contestants.length,
      allSubmitted,
      contestants,
      myVotes,
      myGuesses,
      myCutreVote,
      myScore,
      detectiveScores,
      cutreWinner
    });
  } catch (err) {
    console.error('Error in /api/catwalk:', err);
    res.status(500).json({ error: 'Error al obtener la pasarela' });
  }
});

// Host management routes (Supports both nested /api/host/* and flat /api/host-* for Vercel)
app.post(['/api/host/toggle-catwalk', '/api/host-toggle-catwalk'], (_req: Request, res: Response) => {
  try {
    state.forceUnlockCatwalk = !state.forceUnlockCatwalk;
    saveState(state);
    res.json({
      forceUnlockCatwalk: state.forceUnlockCatwalk,
      isUnlocked: isCatwalkUnlocked()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al alternar pasarela' });
  }
});

app.post(['/api/host/toggle-finalize', '/api/host-toggle-finalize'], (_req: Request, res: Response) => {
  try {
    state.votingFinalized = !state.votingFinalized;
    saveState(state);
    res.json({
      votingFinalized: state.votingFinalized
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al alternar cierre de votación' });
  }
});

app.get(['/api/host/all-users', '/api/host-all-users'], (_req: Request, res: Response) => {
  try {
    const all = getAllCharacters();
    const list = Object.values(state.users).map(u => ({
      ...u,
      character: all.find(c => c.id === u.characterId)
    }));
    res.json({
      users: list,
      votesCount: Object.keys(state.votes).length,
      guessesCount: Object.keys(state.guesses).length,
      cutreVotesCount: Object.keys(state.cutreVotes).length,
      forceUnlockCatwalk: state.forceUnlockCatwalk,
      votingFinalized: state.votingFinalized
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios para anfitrión' });
  }
});

// Seed demo participants
app.post(['/api/host/seed-demo', '/api/host-seed-demo'], (_req: Request, res: Response) => {
  try {
    const demoUsers: Array<{ name: string; characterId: string; photoUrl: string }> = [
      {
        name: 'Nico (Anfitrión)',
        characterId: 'ghostface',
        photoUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Sofía',
        characterId: 'wednesday-addams',
        photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Carlos',
        characterId: 'beetlejuice',
        photoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Laura',
        characterId: 'coraline-jones',
        photoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Marcos',
        characterId: 'pennywise',
        photoUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80'
      }
    ];

    // Clean up any previously seeded demo users to ensure a clean 5-person roster
    const demoNames = new Set(demoUsers.map(d => d.name));
    for (const c of Object.keys(state.users)) {
      if (demoNames.has(state.users[c].name)) {
        delete state.users[c];
        delete state.votes[c];
        delete state.guesses[c];
        delete state.cutreVotes[c];
      }
    }

    const createdCodes: string[] = [];
    for (const d of demoUsers) {
      const code = generateCode();
      createdCodes.push(code);
      state.users[code] = {
        code,
        name: d.name,
        characterId: d.characterId,
        confirmed: true,
        rollsLeft: 0,
        photoUrl: d.photoUrl,
        photoTimestamp: Date.now() - Math.floor(Math.random() * 100000),
        registeredAt: Date.now() - 3600000
      };
    }

    const userCodes = Object.keys(state.users);
    for (let i = 0; i < userCodes.length; i++) {
      const voter = userCodes[i];
      if (!state.votes[voter]) state.votes[voter] = {};
      if (!state.guesses[voter]) state.guesses[voter] = {};

      for (let j = 0; j < userCodes.length; j++) {
        if (i !== j) {
          const target = userCodes[j];
          state.votes[voter][target] = Math.floor(Math.random() * 3) + 3;
          
          const targetUser = state.users[target];
          const char = getAllCharacters().find(c => c.id === targetUser.characterId);
          if (char) {
            const isCorrectGuess = (i + j) % 2 === 0;
            state.guesses[voter][target] = {
              guessText: isCorrectGuess ? char.name : 'Vampiro cualquiera',
              isCorrect: isCorrectGuess,
              timestamp: Date.now()
            };
          }
        }
      }
    }

    if (userCodes.length >= 3) {
      state.cutreVotes[userCodes[0]] = userCodes[2];
      state.cutreVotes[userCodes[1]] = userCodes[2];
      state.cutreVotes[userCodes[3]] = userCodes[2];
    }

    state.forceUnlockCatwalk = true;
    saveState(state);

    const firstCode = userCodes[0];
    const primaryUser = state.users[firstCode];
    const primaryChar = getAllCharacters().find(c => c.id === primaryUser?.characterId);

    res.json({
      success: true,
      message: 'Participantes de prueba creados con votos, adivinanzas y pasarela desbloqueada',
      totalUsers: Object.keys(state.users).length,
      primaryUser,
      primaryCharacter: primaryChar
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al sembrar datos de prueba' });
  }
});

// Delete single participant by Host
app.post(['/api/host/delete-user', '/api/host-delete-user'], (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Código de participante requerido' });
    }
    const formatted = code.trim().toUpperCase();

    if (!state.users[formatted]) {
      return res.status(404).json({ error: 'Participante no encontrado' });
    }

    const removedName = state.users[formatted].name;

    // 1. Remove user record
    delete state.users[formatted];

    // 2. Remove votes cast by this user and votes received by this user
    delete state.votes[formatted];
    for (const vCode of Object.keys(state.votes)) {
      if (state.votes[vCode] && state.votes[vCode][formatted] !== undefined) {
        delete state.votes[vCode][formatted];
      }
    }

    // 3. Remove guesses made by this user and guesses aimed at this user
    delete state.guesses[formatted];
    for (const gCode of Object.keys(state.guesses)) {
      if (state.guesses[gCode] && state.guesses[gCode][formatted]) {
        delete state.guesses[gCode][formatted];
      }
    }

    // 4. Remove special votes from or for this user
    delete state.cutreVotes[formatted];
    for (const [vCode, tCode] of Object.entries(state.cutreVotes)) {
      if (tCode === formatted) {
        delete state.cutreVotes[vCode];
      }
    }

    saveState(state);
    res.json({
      success: true,
      message: `Participante ${removedName} (${formatted}) eliminado con éxito`,
      remainingUsers: Object.keys(state.users).length
    });
  } catch (err) {
    console.error('Error in /api/host/delete-user:', err);
    res.status(500).json({ error: 'Error al eliminar participante' });
  }
});

// Reset database completely
app.post(['/api/host/reset', '/api/host-reset'], (_req: Request, res: Response) => {
  try {
    state = {
      partyDate: '2026-10-30T22:00:00',
      partyLocation: 'Casa de Nico',
      forceUnlockCatwalk: false,
      votingFinalized: false,
      users: {},
      votes: {},
      guesses: {},
      cutreVotes: {},
      customCharacters: {}
    };
    saveState(state);
    res.json({ success: true, message: 'Base de datos reiniciada por completo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reiniciar datos' });
  }
});

// ======================== VITE INTEGRATION ========================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎃 Servidor de Halloween activo en http://0.0.0.0:${PORT}`);
  });
}

if (!isVercel) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export { app };
export default app;
