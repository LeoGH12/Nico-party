/**
 * Normalization & matching utility for Game 1: "Adivina el Disfraz".
 * Matches user input against target character without caring about
 * uppercase/lowercase, accents/tildes, or minor punctuation differences.
 */

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove tildes and accents
    .replace(/[^a-z0-9\s]/g, '')     // remove punctuation
    .replace(/\s+/g, ' ')            // collapse multiple spaces
    .trim();
}

// Common aliases and alternative names for the 50 Halloween characters
export const CHARACTER_ALIASES: Record<string, string[]> = {
  'ghostface': ['ghostface', 'ghost face', 'scream', 'el asesino de scream', 'cara de fantasma'],
  'beetlejuice': ['beetlejuice', 'bitelchus', 'beetle juice', 'betelgeuse'],
  'wednesday-addams': ['miercoles', 'miercoles addams', 'wednesday', 'wednesday addams', 'merlina', 'merlina addams'],
  'chucky': ['chucky', 'el muneco diabolico', 'chucky el muneco diabolico', 'charles lee ray', 'good guy'],
  'michael-myers': ['michael myers', 'myers', 'halloween', 'maicol mayers', 'the shape'],
  'freddy-krueger': ['freddy', 'freddy krueger', 'krueger', 'pesadilla en elm street'],
  'pennywise': ['pennywise', 'it', 'el payaso de it', 'payaso it', 'eso', 'peniwise'],
  'jack-skellington': ['jack', 'jack skellington', 'skellington', 'pesadilla antes de navidad', 'rey calabaza'],
  'sally': ['sally', 'muneca de trapo', 'sally pesadilla antes de navidad'],
  'coraline-jones': ['coraline', 'coraline jones', 'los mundos de coraline'],
  'la-otra-madre': ['la otra madre', 'otra madre', 'beldam', 'madre de coraline', 'mama botones'],
  'jason-voorhees': ['jason', 'jason voorhees', 'voorhees', 'viernes 13', 'mascara de hockey'],
  'samara-morgan': ['samara', 'samara morgan', 'the ring', 'la llamada', 'la senal', 'la nina del pozo', 'el aro'],
  'edward-scissorhands': ['eduardo manostijeras', 'manostijeras', 'edward scissorhands', 'edward', 'tijeras'],
  'art-the-clown': ['art', 'art the clown', 'art el payaso', 'terrifier', 'payaso terrifier'],
  'vecna': ['vecna', 'henry creel', 'stranger things', 'uno', '001'],
  'dracula': ['dracula', 'conde dracula', 'vampiro', 'bram stoker dracula'],
  'frankenstein-monster': ['frankenstein', 'el monstruo de frankenstein', 'monstruo frankenstein'],
  'novia-de-frankenstein': ['la novia de frankenstein', 'novia frankenstein', 'bride of frankenstein'],
  'el-hombre-lobo': ['hombre lobo', 'el hombre lobo', 'licantropo', 'wolfman', 'lobo'],
  'la-monja-valak': ['la monja', 'monja', 'valak', 'el conjuro monja'],
  'billy-the-puppet': ['billy', 'billy el muneco', 'saw', 'jigsaw', 'el muneco de saw', 'juegos macabros'],
  'annabelle': ['annabelle', 'anabel', 'la muneca annabelle', 'muneca annabelle'],
  'carrie-white': ['carrie', 'carrie white', 'reina de graduacion sangre'],
  'leatherface': ['leatherface', 'cara de cuero', 'la matanza de texas', 'motosierra'],
  'the-joker': ['joker', 'el joker', 'guason', 'el guason'],
  'harley-quinn': ['harley quinn', 'harley', 'arlequin', 'harley quin'],
  'pyramid-head': ['pyramid head', 'cabeza de piramide', 'silent hill', 'cabeza piramidal', 'piramide'],
  'slender-man': ['slender man', 'slenderman', 'el hombre sin rostro'],
  'freddy-fazbear': ['freddy fazbear', 'fnaf', 'freddy oso', 'five nights at freddys'],
  'sans-undertale': ['sans', 'sans undertale', 'sans el esqueleto', 'undertale'],
  'ash-williams': ['ash', 'ash williams', 'evil dead', 'posesion infernal'],
  'el-exorcista-regan': ['el exorcista', 'regan', 'regan macneil', 'la nina del exorcista', 'nina exorcista'],
  'jack-torrance': ['jack torrance', 'el resplandor', 'the shining', 'aqui esta jacky'],
  'morticia-addams': ['morticia', 'morticia addams', 'mama addams'],
  'gomez-addams': ['gomez', 'gomez addams', 'homero addams'],
  'heisenberg': ['heisenberg', 'walter white', 'breaking bad', 'walter'],
  'jugador-456': ['jugador 456', 'el juego del calamar', 'squid game', '456', 'seong gi hun'],
  'demogorgon': ['demogorgon', 'stranger things monstruo'],
  'cruella-de-vil': ['cruella', 'cruella de vil', 'cruela', '101 dalmatas'],
  'malefica': ['malefica', 'hada oscura', 'maleficent'],
  'ursula': ['ursula', 'bruja del mar', 'ursula la sirenita'],
  'hades-disney': ['hades', 'hades dios del inframundo', 'hades hercules'],
  'puro-hueso': ['puro hueso', 'grim', 'la muerte billy y mandy', 'billy y mandy'],
  'pinhead': ['pinhead', 'hellraiser', 'cenobita', 'cabeza de alfileres', 'clavos'],
  'el-hombre-invisible': ['el hombre invisible', 'hombre invisible', 'invisible man'],
  'sweeney-todd': ['sweeney todd', 'barbero diabolico', 'sweeney'],
  'hannibal-lecter': ['hannibal', 'hannibal lecter', 'el silencio de los corderos', 'canibal'],
  'la-llorona': ['la llorona', 'llorona'],
  'el-babadook': ['babadook', 'the babadook', 'el babadook']
};

export function checkCharacterGuess(guess: string, characterId: string, characterName: string): boolean {
  if (!guess || !characterId) return false;
  const normGuess = normalizeText(guess);
  if (!normGuess || normGuess.length < 2) return false;

  const normCharName = normalizeText(characterName);
  const normCharId = normalizeText(characterId.replace(/-/g, ' '));

  // Exact or containment matches
  if (normGuess === normCharName || normGuess === normCharId) return true;
  if (normCharName.includes(normGuess) && normGuess.length >= 4) return true;
  if (normGuess.includes(normCharName) && normCharName.length >= 3) return true;

  // Check aliases dictionary
  const aliases = CHARACTER_ALIASES[characterId];
  if (aliases && aliases.length > 0) {
    for (const alias of aliases) {
      const normAlias = normalizeText(alias);
      if (normGuess === normAlias) return true;
      if (normAlias.includes(normGuess) && normGuess.length >= 4) return true;
      if (normGuess.includes(normAlias) && normAlias.length >= 4) return true;
    }
  }

  // Token word match (e.g. user typed "Krueger" or "Beetlejuice" or "Pennywise" or "Ghostface")
  const guessWords = normGuess.split(' ').filter(w => w.length >= 4);
  const charWords = normCharName.split(' ').filter(w => w.length >= 4);

  for (const gw of guessWords) {
    if (charWords.includes(gw)) return true;
    if (aliases) {
      for (const a of aliases) {
        const aWords = normalizeText(a).split(' ').filter(w => w.length >= 4);
        if (aWords.includes(gw)) return true;
      }
    }
  }

  return false;
}
