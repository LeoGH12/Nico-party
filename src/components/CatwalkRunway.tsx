import React, { useState, useRef, useMemo } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Star, 
  Trophy, 
  Award, 
  Medal, 
  Sparkles, 
  Check, 
  Search, 
  HeartHandshake, 
  CheckCircle2, 
  XCircle, 
  Crown,
  Scroll,
  Film,
  ImageIcon,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { halloweenAudio } from '../utils/audio.ts';

interface Contestant {
  code: string;
  name: string;
  characterName: string;
  characterSource: string;
  characterImage: string;
  photoUrl: string;
  photoTimestamp?: number;
  totalVotes: number;
  avgScore: number;
  hasMyVote: number | null;
  hasMyGuess: { guessText: string; isCorrect: boolean } | null;
  totalCutreVotes: number;
  isCutreVoteFromMe: boolean;
}

interface DetectiveScore {
  code: string;
  name: string;
  score: number;
}

interface CutreWinner {
  code: string;
  name: string;
  votes: number;
}

interface CatwalkRunwayProps {
  myCode?: string;
  myName?: string;
  myCharacterName?: string;
  myCurrentPhotoUrl?: string;
  contestants: Contestant[];
  allSubmitted: boolean;
  totalRegistered: number;
  submittedCount: number;
  votingFinalized: boolean;
  myScore?: number;
  detectiveScores?: DetectiveScore[];
  cutreWinner?: CutreWinner | null;
  onUploadPhoto?: (photoBase64: string) => Promise<void>;
  onVote: (targetCode: string, score: number) => Promise<void>;
  onGuess: (targetCode: string, guessText: string) => Promise<void>;
  onVoteCutre: (targetCode: string) => Promise<void>;
  onRefresh: () => void;
  onOpenCeremony?: () => void;
  onGoToLogin?: () => void;
  onSwitchUser?: (code: string) => void;
}

export const CatwalkRunway: React.FC<CatwalkRunwayProps> = ({
  myCode = '',
  myName = '',
  myCurrentPhotoUrl,
  contestants,
  allSubmitted,
  totalRegistered,
  submittedCount,
  votingFinalized,
  myScore = 0,
  detectiveScores = [],
  cutreWinner = null,
  onUploadPhoto,
  onVote,
  onGuess,
  onVoteCutre,
  onRefresh,
  onOpenCeremony,
  onGoToLogin,
  onSwitchUser
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [votingTarget, setVotingTarget] = useState<string | null>(null);
  // ALWAYS default to runway so users can see the cards and vote immediately!
  const [activeTab, setActiveTab] = useState<'runway' | 'podium'>('runway');
  const [showEnlargedPhoto, setShowEnlargedPhoto] = useState<string | null>(null);
  const [guessInputs, setGuessInputs] = useState<Record<string, string>>({});
  const [submittingGuess, setSubmittingGuess] = useState<string | null>(null);

  // Staged star rating before user clicks "Confirmar voto"
  const [stagedStars, setStagedStars] = useState<Record<string, number>>({});
  // Staged special vote before confirmation
  const [stagedSpecialVote, setStagedSpecialVote] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // STABLE RUNWAY ORDER: Cards MUST remain in the exact position they loaded and NEVER move when votes change!
  const runwayContestants = useMemo(() => {
    return [...contestants].sort((a, b) => {
      const timeA = a.photoTimestamp || 0;
      const timeB = b.photoTimestamp || 0;
      if (timeA !== timeB) return timeA - timeB;
      return a.code.localeCompare(b.code);
    });
  }, [contestants]);

  // PODIUM RANKING ORDER: Sorted by highest average score, then total votes
  const podiumContestants = useMemo(() => {
    return [...contestants].sort((a, b) => {
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
      return b.totalVotes - a.totalVotes;
    });
  }, [contestants]);

  // Check if voter has already committed their 1 and only special vote
  const hasAnySpecialVoteCast = useMemo(() => {
    return contestants.some(c => c.isCutreVoteFromMe);
  }, [contestants]);

  // Compress & resize image to max 1000px for fast mobile uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    halloweenAudio.playCameraShutter();

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoPreview(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPhoto = async () => {
    if (!photoPreview || !onUploadPhoto) return;
    setIsUploading(true);
    try {
      await onUploadPhoto(photoPreview);
      setPhotoPreview(null);
      halloweenAudio.playCameraShutter();
    } catch (err) {
      console.error('Error uploading photo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetakeCamera = () => {
    setPhotoPreview(null);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  const handleRetakeGallery = () => {
    setPhotoPreview(null);
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
      galleryInputRef.current.click();
    }
  };

  // Confirm and submit star vote with explicit button
  const handleConfirmVote = async (targetCode: string) => {
    if (!myCode) {
      const fallback = contestants.find(c => c.code !== targetCode);
      if (fallback && onSwitchUser) {
        onSwitchUser(fallback.code);
      } else if (onGoToLogin) {
        onGoToLogin();
        return;
      }
    }
    const score = stagedStars[targetCode];
    if (!score) return;

    halloweenAudio.playVoteStar();
    setVotingTarget(targetCode);
    try {
      await onVote(targetCode, score);
      setStagedStars(prev => {
        const next = { ...prev };
        delete next[targetCode];
        return next;
      });
    } finally {
      setVotingTarget(null);
    }
  };

  // Submit guess for Game 1 - STRICTLY 1 ATTEMPT!
  const handleGuessSubmit = async (targetCode: string) => {
    if (!myCode) {
      const fallback = contestants.find(c => c.code !== targetCode);
      if (fallback && onSwitchUser) {
        onSwitchUser(fallback.code);
      } else if (onGoToLogin) {
        onGoToLogin();
        return;
      }
    }
    const text = guessInputs[targetCode]?.trim();
    if (!text) return;

    const contestant = contestants.find(c => c.code === targetCode);
    if (contestant?.hasMyGuess) return; // Disallow further attempts

    setSubmittingGuess(targetCode);
    try {
      await onGuess(targetCode, text);
      halloweenAudio.playVoteStar();
    } finally {
      setSubmittingGuess(null);
    }
  };

  // Special vote (Premio Especial) with confirmation - Strictly 1 permanent vote
  const handleSpecialVoteClick = async (targetCode: string) => {
    // If any special vote was already cast by this voter, it is locked!
    const alreadyVotedCode = contestants.find(c => c.isCutreVoteFromMe)?.code;
    if (alreadyVotedCode) return;

    if (!myCode) {
      const fallback = contestants.find(c => c.code !== targetCode);
      if (fallback && onSwitchUser) {
        onSwitchUser(fallback.code);
      } else if (onGoToLogin) {
        onGoToLogin();
        return;
      }
    }

    if (stagedSpecialVote === targetCode) {
      // Confirmed by user click
      halloweenAudio.playVoteStar();
      await onVoteCutre(targetCode);
      setStagedSpecialVote(null);
    } else {
      // Stage for confirmation
      setStagedSpecialVote(targetCode);
    }
  };

  const triggerPodiumConfetti = () => {
    halloweenAudio.playCreepyLaugh();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#f97316', '#a855f7', '#ffffff', '#eab308']
    });
  };

  const getConsolationTitle = (index: number) => {
    const titles = [
      '🏅 Mención al Cartón Más Rentabilizado',
      '👻 Diploma al Sustazo de la Noche',
      '🩸 Premio a la Sangre Artificial Más Realista',
      '⚡ Premio al Esfuerzo Paranormal Low-Cost',
      '🎭 Premio a la Mejor Puesta en Escena',
      '🦇 Mención Honorífica de Ultratumba',
      '🕷️ Premio a la Creatividad Inquietante'
    ];
    return titles[(index - 3) % titles.length];
  };

  return (
    <div className="space-y-6">
      {/* Input de cámara nativa (hardware móvil directo) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Input de galería / explorador de fotos del dispositivo */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Quick Navigation and Refresh bar */}
      <div className="flex items-center justify-between gap-2">
        {onGoToLogin && (
          <button
            onClick={onGoToLogin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-xs font-bold border border-purple-500/30 cursor-pointer transition-all shadow-md active:scale-95"
          >
            <span>← Volver a Mi Ficha / Inicio</span>
          </button>
        )}
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 text-xs font-bold border border-orange-500/40 cursor-pointer transition-all shadow-md active:scale-95 ml-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-[#180a2c] to-orange-950/80 border-2 border-orange-500/40 rounded-3xl p-5 sm:p-6 text-center glow-box-orange">
        <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>¡Juegos 1 y 2 en Vivo!</span>
        </div>
        <h2 className="font-creepster text-3xl sm:text-5xl text-orange-400 text-glow-orange tracking-wider">
          ADIVINANZA & LA PASARELA
        </h2>
        <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-lg mx-auto">
          <strong>Juego 1:</strong> Adivina el personaje escribiendo su nombre (1 solo intento, +1 pt por acierto). <br className="hidden sm:inline" />
          <strong>Juego 2:</strong> Puntúa cada disfraz de 1 a 5 ⭐ y emite tus votos.
        </p>

        {/* Tab switch between Runway, Podium & Ceremony Video */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-4">
          <button
            onClick={() => setActiveTab('runway')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'runway'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-600/40'
                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Pasarela & Adivinar</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('podium');
              triggerPodiumConfetti();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'podium'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40'
                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Ganadores & Revelación</span>
          </button>

          {onOpenCeremony && (
            <button
              onClick={onOpenCeremony}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black shadow-lg shadow-amber-500/30 hover:scale-105 transition-all cursor-pointer border border-white/60 animate-pulse"
              title="Ver revelación secuencial 1 a 1 de los ganadores con redoble de tambores"
            >
              <Film className="w-4 h-4 fill-black" />
              <span>🎬 Gala en Efecto Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Voting Identity & Simulation Switcher Bar */}
      {contestants.length > 0 && onSwitchUser && (
        <div className="bg-[#160c29] border border-orange-500/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl glow-box-orange">
          <div className="flex items-center gap-2.5">
            <span className="text-xl select-none">🎭</span>
            <div>
              <div className="text-[11px] text-purple-300">
                Tu perfil activo para votar y adivinar en vivo:
              </div>
              <div className="text-sm font-extrabold text-orange-400">
                {myName ? `${myName}` : 'Modo Espectador (Elige un amigo para votar)'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label className="text-[11px] text-purple-300 font-medium whitespace-nowrap">
              Votar como:
            </label>
            <select
              value={myCode}
              onChange={(e) => {
                if (e.target.value) {
                  onSwitchUser(e.target.value);
                }
              }}
              className="bg-purple-950/90 border border-orange-500/50 text-orange-300 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="" disabled={!!myCode}>
                {myCode ? '-- Cambiar de participante --' : '-- Seleccionar participante --'}
              </option>
              {contestants.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Spectator Mode Banner if not logged in with user code */}
      {!myCode && (
        <div className="bg-purple-950/70 border border-purple-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="text-3xl animate-bounce">👀</span>
            <div>
              <h4 className="text-sm font-bold text-orange-400">
                MODO ESPECTADOR / VOTACIÓN EN VIVO
              </h4>
              <p className="text-xs text-purple-200 mt-0.5">
                Estás viendo el desfile en directo. Para votar y jugar selecciona arriba tu participante o introduce tu código.
              </p>
            </div>
          </div>
          {onGoToLogin && (
            <button
              onClick={onGoToLogin}
              className="bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-500 hover:to-purple-500 text-white text-xs font-black py-2.5 px-5 rounded-2xl shadow-lg cursor-pointer transition-all shrink-0"
            >
              🔑 Ingresar con mi Código
            </button>
          )}
        </div>
      )}

      {/* PHOTO BOOTH SECTION (Take photo / retake / confirm - only if registered participant) */}
      {myCode && myCode !== 'ADMIN' && (
      <div className="bg-[#150c26] border border-purple-500/40 rounded-3xl p-5 sm:p-6 glow-box-purple">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-purple-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-orange-400" />
              <span>Tu Fotografía para el Desfile</span>
            </h3>
            <p className="text-xs text-purple-300/80 mt-0.5">
              Hazte una foto mostrando tu disfraz. Recuerda que tu personaje se mantendrá en secreto hasta que terminen las votaciones.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {!photoPreview && (
              <>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-500 hover:to-orange-500 text-white text-xs font-bold py-3 px-4 rounded-2xl shadow-lg transition-all cursor-pointer active:scale-95"
                  title="Abrir la cámara de tu móvil para hacer la foto en vivo"
                >
                  <Camera className="w-4 h-4 text-orange-200" />
                  <span>{myCurrentPhotoUrl ? '📸 Repetir con Cámara' : '📸 Hacer Foto con Cámara'}</span>
                </button>

                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold py-3 px-4 rounded-2xl border border-purple-500/40 shadow-md transition-all cursor-pointer active:scale-95"
                  title="Seleccionar una fotografía guardada en tu galería o carrete"
                >
                  <ImageIcon className="w-4 h-4 text-purple-300" />
                  <span>🖼️ Subir desde Galería</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Temporary Preview before confirmation */}
        {photoPreview && (
          <div className="mt-5 p-4 rounded-2xl bg-purple-950/60 border border-orange-500/40 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-xl overflow-hidden bg-black shadow-xl border border-purple-500/40">
              <img src={photoPreview} alt="Vista previa de tu disfraz" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-orange-400 font-bold">
                Vista previa
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="text-sm font-bold text-orange-400 flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4" />
                <span>¿Te convence la foto?</span>
              </div>
              <p className="text-xs text-purple-200">
                Puedes repetirla cuantas veces quieras hasta conseguir la pose perfecta.
              </p>

              <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start pt-1">
                <button
                  onClick={handleRetakeCamera}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-purple-500/40 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Cámara</span>
                </button>

                <button
                  onClick={handleRetakeGallery}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-purple-500/40 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Galería</span>
                </button>

                <button
                  onClick={handleConfirmPhoto}
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-xs font-extrabold py-2.5 px-5 rounded-xl shadow-lg shadow-orange-500/30 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Subiendo a la pasarela...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Confirmar y Subir!</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing uploaded photo indicator */}
        {!photoPreview && myCurrentPhotoUrl && (
          <div className="mt-4 p-3 bg-purple-900/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-14 rounded-lg overflow-hidden border border-emerald-500/40 bg-black">
                <img src={myCurrentPhotoUrl} alt="Mi disfraz" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  ¡Tu disfraz ya está en la pasarela!
                </span>
                <p className="text-[11px] text-purple-300">
                  Los demás amigos ya pueden intentar adivinar quién eres y puntuar tu traje.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEnlargedPhoto(myCurrentPhotoUrl)}
              className="text-xs text-purple-400 hover:text-purple-200 underline cursor-pointer pr-2"
            >
              Ver foto
            </button>
          </div>
        )}
      </div>
      )}

      {/* SUPERADMIN OBSERVER BANNER */}
      {myCode === 'ADMIN' && (
        <div className="bg-gradient-to-r from-purple-950/90 via-[#180a2c] to-orange-950/90 border border-orange-500/50 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 glow-box-orange">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none">👑</span>
            <div>
              <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                VISTA SUPERADMIN (MODO OBSERVADOR TOTAL)
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Estás visualizando la pasarela en tiempo real con privilegios de anfitrión. No necesitas subir foto para disfrutar del desfile ni para probar las votaciones.
              </p>
            </div>
          </div>
          {onOpenCeremony && (
            <button
              onClick={onOpenCeremony}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black py-2.5 px-4 rounded-xl shadow-lg cursor-pointer transition-transform shrink-0"
            >
              <Film className="w-4 h-4 fill-black" />
              <span>Gala de Ganadores</span>
            </button>
          )}
        </div>
      )}

      {/* DETECTIVE SCORE BADGE & SUBMISSION COUNTER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* My Detective Score */}
        <div className="bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-900/80 border border-purple-500/40 flex items-center justify-center text-orange-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                Juego 1: Detective de Disfraces
              </div>
              <div className="text-[11px] text-purple-300">
                1 acierto = 1 punto (sin importar mayúsculas/tildes)
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-creepster text-2xl text-orange-400 text-glow-orange">
              {myScore} {myScore === 1 ? 'punto' : 'puntos'}
            </div>
          </div>
        </div>

        {/* Submissions counter */}
        <div className="bg-purple-950/60 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
            <div className="text-xs sm:text-sm text-purple-200">
              <span className="font-bold text-orange-400">{submittedCount}</span> de{' '}
              <span className="font-bold text-purple-100">{totalRegistered || submittedCount}</span> amigos han subido foto
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-orange-400 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RUNWAY & GUESSING FEED */}
      {activeTab === 'runway' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-creepster text-2xl text-purple-200 tracking-wide">
              Desfile de Concursantes ({contestants.length})
            </h3>
            <p className="text-xs text-purple-400">
              Adivina quién es y vota sus estrellas ⭐
            </p>
          </div>

          {contestants.length === 0 ? (
            <div className="text-center p-12 bg-purple-950/30 border border-dashed border-purple-500/30 rounded-3xl">
              <Camera className="w-12 h-12 text-purple-500 mx-auto mb-3 animate-bounce" />
              <p className="text-base font-bold text-purple-200">Aún no hay fotos en la pasarela</p>
              <p className="text-xs text-purple-400 max-w-sm mx-auto mt-1">
                ¡Sé el primero en tomarte la foto con el botón de arriba y abrir el desfile!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* STABLE RUNWAY LIST: Order NEVER changes while voting */}
              {runwayContestants.map((contestant) => {
                const isMe = contestant.code === myCode;
                const myVote = contestant.hasMyVote;
                const myGuess = contestant.hasMyGuess;
                const currentInputValue = guessInputs[contestant.code] ?? (myGuess?.guessText || '');
                const currentStagedStar = stagedStars[contestant.code];
                const activeStarDisplay = currentStagedStar !== undefined ? currentStagedStar : (myVote || 0);

                return (
                  <div
                    key={contestant.code}
                    className={`relative bg-[#140b24] rounded-2xl border overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between ${
                      isMe ? 'border-orange-500/60 glow-box-orange' : 'border-purple-500/30 hover:border-purple-400/50'
                    }`}
                  >
                    <div>
                      {/* Contestant Costume Photo */}
                      <div
                        className="relative h-72 w-full bg-black cursor-pointer group"
                        onClick={() => setShowEnlargedPhoto(contestant.photoUrl)}
                      >
                        <img
                          src={contestant.photoUrl}
                          alt={`Disfraz de ${contestant.name}`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#140b24] via-transparent to-black/40" />

                        {/* Masked / Revealed character badge */}
                        <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/40 text-xs font-bold text-orange-400 flex items-center gap-1.5">
                          <span>🎭</span>
                          <span>{contestant.characterName}</span>
                        </div>

                        {isMe && (
                          <div className="absolute top-3 right-3 bg-orange-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                            ¡Eres tú!
                          </div>
                        )}

                        <div className="absolute bottom-2 right-3 text-[10px] text-purple-300/80 bg-black/60 px-2 py-0.5 rounded">
                          Toca para ampliar 🔍
                        </div>
                      </div>

                      {/* Friend Info & Score */}
                      <div className="p-4 pb-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-base text-purple-100 flex items-center gap-2">
                              <span>{contestant.name}</span>
                            </h4>
                            <p className="text-xs text-purple-400/90">{contestant.characterSource}</p>
                          </div>

                          {/* Live Average Score */}
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-amber-400 font-extrabold text-sm justify-end">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span>{contestant.avgScore > 0 ? contestant.avgScore.toFixed(1) : '-'}</span>
                            </div>
                            <span className="text-[10px] text-purple-400">
                              {contestant.totalVotes} {contestant.totalVotes === 1 ? 'voto' : 'votos'}
                            </span>
                          </div>
                        </div>

                        {/* JUEGO 1: GUESSING INPUT SECTION (UN SOLO INTENTO ESTRICTO) */}
                        {!isMe && (
                          <div className="bg-purple-950/60 border border-purple-500/30 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-purple-200 flex items-center gap-1">
                                <Search className="w-3.5 h-3.5 text-orange-400" />
                                <span>Juego 1: ¿De qué va disfrazado?</span>
                              </span>
                              {myGuess && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  myGuess.isCorrect 
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' 
                                    : 'bg-red-950 text-red-400 border border-red-500/40'
                                }`}>
                                  {myGuess.isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                  {myGuess.isCorrect ? '+1 Punto Acertado' : 'Intento fallado'}
                                </span>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={myGuess ? 'Intento ya consumido' : 'Escribe el personaje (1 intento)...'}
                                value={currentInputValue}
                                disabled={!!myGuess || submittingGuess === contestant.code}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGuessInputs(prev => ({ ...prev, [contestant.code]: val }));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !myGuess) handleGuessSubmit(contestant.code);
                                }}
                                className={`flex-1 border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-purple-500/60 focus:outline-none transition-all ${
                                  myGuess 
                                    ? 'bg-black/30 border-purple-500/20 opacity-70 cursor-not-allowed' 
                                    : 'bg-black/60 border-purple-500/40 focus:border-orange-500'
                                }`}
                              />
                              <button
                                onClick={() => handleGuessSubmit(contestant.code)}
                                disabled={!!myGuess || submittingGuess === contestant.code || !currentInputValue.trim()}
                                className={`text-white text-xs sm:text-sm font-extrabold px-3.5 py-2.5 rounded-xl transition-all active:scale-[0.98] ${
                                  myGuess
                                    ? 'bg-purple-950 text-purple-500 border border-purple-500/20 cursor-not-allowed'
                                    : 'bg-purple-800 hover:bg-orange-600 disabled:opacity-50 cursor-pointer shadow-md'
                                }`}
                              >
                                {submittingGuess === contestant.code ? '...' : myGuess ? 'Listo' : 'Adivinar'}
                              </button>
                            </div>

                            {myGuess?.isCorrect && (
                              <p className="text-xs text-emerald-400 font-medium">
                                🎯 ¡Enhorabuena! Has acertado que es este personaje.
                              </p>
                            )}

                            {myGuess && !myGuess.isCorrect && (
                              <p className="text-xs text-red-400/90 font-medium">
                                ❌ Intento gastado («{myGuess.guessText}»). No se permiten más intentos.
                              </p>
                            )}
                          </div>
                        )}

                        {/* JUEGO 2: STAR RATING (1 to 5 Stars) CON CONFIRMACIÓN OBLIGATORIA */}
                        <div className="pt-1">
                          {isMe ? (
                            <div className="py-2.5 text-center text-xs text-purple-400 italic">
                              🔒 No puedes votarte a ti mismo. Los demás invitados adivinan y puntúan tu disfraz.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-purple-200 font-bold">
                                  Juego 2: Puntúa este disfraz:
                                </span>
                                {myVote && (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
                                    <Lock className="w-3 h-3 text-emerald-400" /> Voto: {myVote} ⭐ (Fijado)
                                  </span>
                                )}
                              </div>

                              {myVote !== null && myVote !== undefined ? (
                                /* VOTO DE ESTRELLAS YA CONFIRMADO: BLOQUEADO Y EN MODO LECTURA */
                                <div className="bg-purple-950/70 p-3 rounded-2xl border border-emerald-500/30 space-y-2">
                                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                                    <span className="flex items-center gap-1.5">
                                      <Lock className="w-3.5 h-3.5" /> Puntuación confirmada: {myVote} ⭐
                                    </span>
                                    <span className="text-purple-400/80 italic font-normal">
                                      Voto definitivo (fijado)
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-1.5">
                                    {[1, 2, 3, 4, 5].map((starVal) => {
                                      const isPassed = (myVote as number) >= starVal;
                                      return (
                                        <div
                                          key={starVal}
                                          className="flex-1 min-h-[40px] py-1.5 flex items-center justify-center rounded-xl bg-purple-900/30 border border-purple-500/20 cursor-not-allowed"
                                          title={`Puntuación asignada: ${myVote} estrellas`}
                                        >
                                          <Star
                                            className={`w-6 h-6 sm:w-7 sm:h-7 ${
                                              isPassed
                                                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                                                : 'text-purple-800'
                                            }`}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                /* SELECCIÓN Y CONFIRMACIÓN DE ESTRELLAS */
                                <div className="bg-purple-950/70 p-3 rounded-2xl border border-purple-500/30 space-y-2.5">
                                  <div className="flex items-center justify-between gap-1.5">
                                    {[1, 2, 3, 4, 5].map((starVal) => {
                                      const isSelected = activeStarDisplay === starVal;
                                      const isPassed = activeStarDisplay >= starVal;

                                      return (
                                        <button
                                          key={starVal}
                                          type="button"
                                          onClick={() => setStagedStars(prev => ({ ...prev, [contestant.code]: starVal }))}
                                          disabled={votingTarget === contestant.code}
                                          className={`flex-1 min-h-[44px] py-2 flex items-center justify-center rounded-xl transition-all cursor-pointer active:scale-95 ${
                                            isSelected
                                              ? 'bg-orange-500/30 border border-orange-500/50'
                                              : 'hover:bg-purple-900/50 border border-transparent'
                                          }`}
                                          title={`Seleccionar ${starVal} estrellas`}
                                        >
                                          <Star
                                            className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                                              isPassed
                                                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                                                : 'text-purple-600 hover:text-amber-300'
                                            }`}
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Botón de Confirmar Voto (para evitar pulsar sin querer) */}
                                  {currentStagedStar !== undefined && currentStagedStar !== myVote && (
                                    <div className="flex items-center gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => handleConfirmVote(contestant.code)}
                                        disabled={votingTarget === contestant.code}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-[0.98] text-white text-sm font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/30 cursor-pointer animate-pulse"
                                      >
                                        <Check className="w-4 h-4" />
                                        <span>
                                          {votingTarget === contestant.code
                                            ? 'Guardando voto...'
                                            : `Confirmar voto (${currentStagedStar} ⭐)`}
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setStagedStars(prev => {
                                          const next = { ...prev };
                                          delete next[contestant.code];
                                          return next;
                                        })}
                                        className="text-xs text-purple-300 hover:text-white px-3 py-3 rounded-xl border border-purple-500/30 bg-purple-900/40 cursor-pointer"
                                      >
                                        Deshacer
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* VOTO ESPECIAL (1 solo voto definitivo en toda la noche) */}
                    {!isMe && (
                      <div className="p-3 pt-0 border-t border-purple-500/20">
                        {contestant.isCutreVoteFromMe ? (
                          /* Este participante tiene el voto especial emitido por mí */
                          <div className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold bg-amber-600/30 text-amber-300 border border-amber-500 shadow-lg shadow-amber-500/20 cursor-default">
                            <Crown className="w-4 h-4 text-amber-400" />
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>👑 Tu Voto Especial Asignado (Fijado)</span>
                          </div>
                        ) : hasAnySpecialVoteCast ? (
                          /* Ya votaste a otro participante: el botón queda bloqueado con candado */
                          <div className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-purple-950/40 text-purple-400 border border-purple-500/20 opacity-60 cursor-not-allowed">
                            <Lock className="w-3.5 h-3.5 text-purple-500" />
                            <span>Voto especial ya utilizado en otro amigo</span>
                          </div>
                        ) : stagedSpecialVote === contestant.code ? (
                          /* Confirmación previa antes de gastar el único voto especial */
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSpecialVoteClick(contestant.code)}
                              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs sm:text-sm font-extrabold py-3 px-3 rounded-xl shadow-lg cursor-pointer animate-pulse active:scale-[0.98]"
                            >
                              <Check className="w-4 h-4" />
                              <span>Confirmar mi único voto especial</span>
                            </button>
                            <button
                              onClick={() => setStagedSpecialVote(null)}
                              className="text-xs text-purple-300 hover:text-white px-3 py-3 rounded-xl border border-purple-500/30 bg-purple-900/40 cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          /* Botón inicial para elegir este candidato */
                          <button
                            onClick={() => setStagedSpecialVote(contestant.code)}
                            className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold bg-purple-950/60 text-purple-300 hover:text-amber-300 hover:bg-purple-900/60 border border-purple-500/30 cursor-pointer transition-all active:scale-[0.98]"
                          >
                            <Scroll className="w-4 h-4 text-amber-400" />
                            <span>Votar (1 voto único)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PODIUM RANKING & CELEBRATION */}
      {activeTab === 'podium' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-creepster text-3xl sm:text-4xl text-amber-400 text-glow-orange tracking-wider">
              🏆 GANADORES, RANKINGS Y REVELACIÓN
            </h3>
            <p className="text-xs sm:text-sm text-purple-300 max-w-md mx-auto">
              {votingFinalized
                ? '¡Votaciones cerradas oficialmente! Aquí están los grandes campeones de la noche.'
                : 'Clasificación en tiempo real. Los nombres reales se destaparán para todos al cerrar la votación.'}
            </p>
          </div>

          {contestants.length === 0 ? (
            <div className="text-center p-12 bg-purple-950/20 rounded-3xl border border-purple-500/20">
              <p className="text-sm text-purple-300">Aún no hay concursantes en la pasarela para calcular el ranking.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* PODIUM 1: LA PASARELA (1-5 Star Ratings) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-orange-400 uppercase tracking-wider">
                  <Trophy className="w-4 h-4" />
                  <span>Podio de La Pasarela (Mejor Disfraz Currado)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
                  {/* 2nd Place (Silver) */}
                  {podiumContestants.length >= 2 && (
                    <div className="order-2 md:order-1 bg-gradient-to-t from-purple-950/90 to-[#1e1333] border-2 border-slate-400/50 rounded-3xl p-4 text-center shadow-xl relative transform hover:-translate-y-1 transition-transform">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-300 text-black font-extrabold flex items-center justify-center shadow-lg border-2 border-white">
                        2
                      </div>
                      <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-slate-300 my-3 shadow-lg">
                        <img src={podiumContestants[1].photoUrl} alt={podiumContestants[1].name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-center gap-1 text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
                        <Medal className="w-4 h-4 text-slate-300" />
                        <span>Subcampeón Siniestro</span>
                      </div>
                      <h4 className="font-bold text-lg text-white">{podiumContestants[1].name}</h4>
                      <p className="text-xs text-orange-400 font-medium">{podiumContestants[1].characterName}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>{podiumContestants[1].avgScore.toFixed(1)} / 5</span>
                        <span className="text-[10px] text-purple-300">({podiumContestants[1].totalVotes} votos)</span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place (Gold Winner) */}
                  {podiumContestants.length >= 1 && (
                    <div className="order-1 md:order-2 bg-gradient-to-t from-orange-950 via-[#26120b] to-purple-950 border-2 border-amber-400 rounded-3xl p-5 text-center shadow-2xl relative glow-box-orange transform md:-translate-y-4 hover:scale-[1.02] transition-transform">
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-black font-black text-lg flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
                        👑 1
                      </div>
                      <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-4 border-amber-400 my-3 shadow-2xl">
                        <img src={podiumContestants[0].photoUrl} alt={podiumContestants[0].name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-black uppercase tracking-widest mb-1 animate-pulse">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>¡GRAN CAMPEÓN DE HALLOWEEN!</span>
                      </div>
                      <h4 className="font-creepster text-2xl sm:text-3xl text-orange-300 text-glow-orange">
                        {podiumContestants[0].name}
                      </h4>
                      <p className="text-sm font-bold text-amber-300">{podiumContestants[0].characterName}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-black/60 border border-amber-500/40 px-4 py-1.5 rounded-full text-sm font-extrabold text-amber-300">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{podiumContestants[0].avgScore.toFixed(1)} / 5</span>
                        <span className="text-xs text-purple-300">({podiumContestants[0].totalVotes} votos)</span>
                      </div>
                      <p className="text-xs text-orange-200 mt-2 font-medium">
                        🎃 ¡Muchas felicidades por el disfraz más votado y espectacular de la noche!
                      </p>
                    </div>
                  )}

                  {/* 3rd Place (Bronze) */}
                  {podiumContestants.length >= 3 && (
                    <div className="order-3 bg-gradient-to-t from-purple-950/90 to-[#1e1333] border-2 border-amber-700/60 rounded-3xl p-4 text-center shadow-xl relative transform hover:-translate-y-1 transition-transform">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-700 text-white font-extrabold flex items-center justify-center shadow-lg border-2 border-amber-300">
                        3
                      </div>
                      <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-amber-700 my-3 shadow-lg">
                        <img src={podiumContestants[2].photoUrl} alt={podiumContestants[2].name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-center gap-1 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>Bronce Espectral</span>
                      </div>
                      <h4 className="font-bold text-lg text-white">{podiumContestants[2].name}</h4>
                      <p className="text-xs text-orange-400 font-medium">{podiumContestants[2].characterName}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>{podiumContestants[2].avgScore.toFixed(1)} / 5</span>
                        <span className="text-[10px] text-purple-300">({podiumContestants[2].totalVotes} votos)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SPECIAL AWARDS: PREMIO ESPECIAL DE VOTACIÓN & EL DETECTIVE SUPREMO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Special Award: Votos */}
                <div className="bg-gradient-to-br from-amber-950/80 via-[#221307] to-purple-950 border-2 border-amber-500/50 rounded-3xl p-5 text-center shadow-xl glow-box-orange">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-2">
                    <Scroll className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    Premio Especial del Público
                  </div>
                  <h4 className="font-creepster text-2xl text-amber-300 mt-1">
                    PREMIO ESPECIAL DE VOTACIÓN
                  </h4>
                  {cutreWinner ? (
                    <div className="mt-3 space-y-1">
                      <div className="text-lg font-extrabold text-white">{cutreWinner.name}</div>
                      <div className="inline-block bg-black/60 border border-amber-500/40 px-3 py-1 rounded-full text-xs text-amber-300 font-bold">
                        🗳️ {cutreWinner.votes} {cutreWinner.votes === 1 ? 'voto' : 'votos'}
                      </div>
                      <p className="text-xs text-purple-300 pt-1">
                        ¡Ganador del premio especial del público por votación popular!
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-purple-300 mt-2">
                      Votación en curso. ¡Vota a tu amigo favorito para este premio en las tarjetas!
                    </p>
                  )}
                </div>

                {/* Game 1 Winner: El Detective Supremo */}
                <div className="bg-gradient-to-br from-indigo-950/80 via-[#130b28] to-purple-950 border-2 border-indigo-500/50 rounded-3xl p-5 text-center shadow-xl glow-box-purple">
                  <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 mb-2">
                    <Search className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    Ganador Juego 1: Adivinanzas
                  </div>
                  <h4 className="font-creepster text-2xl text-indigo-200 mt-1">
                    EL DETECTIVE DE ULTRATUMBA
                  </h4>
                  {detectiveScores.length > 0 && detectiveScores[0].score > 0 ? (
                    <div className="mt-3 space-y-1">
                      <div className="text-lg font-extrabold text-white flex items-center justify-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>{detectiveScores[0].name}</span>
                      </div>
                      <div className="inline-block bg-black/60 border border-indigo-500/40 px-3 py-1 rounded-full text-xs text-indigo-300 font-bold">
                        🎯 {detectiveScores[0].score} {detectiveScores[0].score === 1 ? 'acierto' : 'aciertos'}
                      </div>
                      <p className="text-xs text-purple-300 pt-1">
                        ¡Nadie pudo engañar su mirada! Descubrió la mayor cantidad de personajes.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-purple-300 mt-2">
                      ¡Comienza a escribir tus adivinanzas en el desfile para ganar puntos!
                    </p>
                  )}
                </div>
              </div>

              {/* Humorous Consolation Awards for rest of participants */}
              {podiumContestants.length > 3 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm uppercase tracking-wider border-b border-purple-500/20 pb-2">
                    <HeartHandshake className="w-4 h-4 text-orange-400" />
                    <span>Menciones Honoríficas y de Consuelo</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {podiumContestants.slice(3).map((contestant, index) => {
                      const rank = index + 4;
                      const title = getConsolationTitle(index);

                      return (
                        <div
                          key={contestant.code}
                          className="flex items-center gap-3 bg-purple-950/40 border border-purple-500/20 p-3 rounded-2xl"
                        >
                          <div className="w-10 h-10 rounded-full bg-purple-900/60 font-bold text-xs text-purple-300 flex items-center justify-center shrink-0">
                            #{rank}
                          </div>
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-purple-500/30 bg-black">
                            <img src={contestant.photoUrl} alt={contestant.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs text-white truncate">{contestant.name}</div>
                            <div className="text-[11px] text-orange-400 truncate">{contestant.characterName}</div>
                            <div className="text-[10px] text-purple-300 italic truncate">{title}</div>
                          </div>
                          <div className="text-right text-xs font-bold text-amber-400 shrink-0">
                            ⭐ {contestant.avgScore.toFixed(1)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {showEnlargedPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowEnlargedPhoto(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={showEnlargedPhoto}
              alt="Foto ampliada del disfraz"
              className="max-w-full max-h-[82vh] object-contain rounded-2xl border-2 border-orange-500/50 shadow-2xl"
            />
            <button
              onClick={() => setShowEnlargedPhoto(null)}
              className="mt-3 bg-purple-900/80 text-purple-200 text-xs font-bold py-2 px-5 rounded-full border border-purple-500/40"
            >
              Cerrar visor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
