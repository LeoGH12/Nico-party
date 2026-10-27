import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Trophy, 
  Crown, 
  Search, 
  Scroll, 
  Award, 
  Medal, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Maximize2,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { halloweenAudio } from '../utils/audio.ts';

interface Contestant {
  code: string;
  name: string;
  characterName: string;
  characterSource: string;
  photoUrl: string;
  avgScore: number;
  totalVotes: number;
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

interface WinnersCeremonyModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestants: Contestant[];
  detectiveScores?: DetectiveScore[];
  cutreWinner?: CutreWinner | null;
}

type CeremonyStep = 
  | 'intro'           // 0: Countdown & Title screen
  | 'cutre'           // 1: Premio especial del público
  | 'detective'       // 2: Ganador Juego 1 (más aciertos)
  | 'third'           // 3: 3er Puesto (Bronce)
  | 'second'          // 4: 2º Puesto (Plata)
  | 'first'           // 5: 1er Puesto (Gran Campeón)
  | 'recap';          // 6: Resumen final y felicitaciones

export const WinnersCeremonyModal: React.FC<WinnersCeremonyModalProps> = ({
  isOpen,
  onClose,
  contestants,
  detectiveScores = [],
  cutreWinner = null
}) => {
  const [currentStep, setCurrentStep] = useState<CeremonyStep>('intro');
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const stepTimerRef = useRef<number | null>(null);

  // Sort contestants by score
  const sortedPodium = useMemo(() => {
    return [...contestants].sort((a, b) => {
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
      return b.totalVotes - a.totalVotes;
    });
  }, [contestants]);

  const firstPlace = sortedPodium[0] || null;
  const secondPlace = sortedPodium[1] || null;
  const thirdPlace = sortedPodium[2] || null;
  const topDetective = detectiveScores.length > 0 && detectiveScores[0].score > 0 ? detectiveScores[0] : null;

  // Find photos for special awards
  const detectiveContestant = topDetective ? contestants.find(c => c.code === topDetective.code) : null;
  const cutreContestant = cutreWinner ? contestants.find(c => c.code === cutreWinner.code) : null;

  const stepsList: CeremonyStep[] = ['intro', 'cutre', 'detective', 'third', 'second', 'first', 'recap'];
  const stepIndex = stepsList.indexOf(currentStep);

  // Trigger reveal animation and audio
  const revealWinner = (step: CeremonyStep) => {
    setIsRevealed(true);
    if (!isMuted) {
      halloweenAudio.playFanfareHit();
    }

    if (step === 'first') {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#ffffff', '#ef4444']
      });
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f97316', '#a855f7']
        });
      }, 400);
    } else {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f97316', '#a855f7', '#ffffff']
      });
    }
  };

  // Manage automated playback transition between steps
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('intro');
      setIsRevealed(false);
      return;
    }

    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
    }

    if (!isPlaying) return;

    if (currentStep === 'intro') {
      setIsRevealed(false);
      stepTimerRef.current = window.setTimeout(() => {
        goToStep('cutre');
      }, 3500);
      return;
    }

    if (currentStep === 'recap') {
      setIsRevealed(true);
      return;
    }

    // Winner reveal step:
    // Phase 1: Drumroll (3 seconds) with silhouette
    setIsRevealed(false);
    if (!isMuted) {
      halloweenAudio.playDrumRoll(2.8);
    }

    stepTimerRef.current = window.setTimeout(() => {
      revealWinner(currentStep);

      // Phase 2: Stay visible for 5.5 seconds, then auto-advance if still playing
      stepTimerRef.current = window.setTimeout(() => {
        if (isPlaying) {
          const nextIdx = stepIndex + 1;
          if (nextIdx < stepsList.length) {
            goToStep(stepsList[nextIdx]);
          }
        }
      }, 5500);
    }, 2800);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [currentStep, isPlaying, isOpen, isMuted]);

  // Video timer ticker
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  const goToStep = (step: CeremonyStep) => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    setCurrentStep(step);
  };

  const handleNext = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < stepsList.length) {
      goToStep(stepsList[nextIdx]);
    }
  };

  const handlePrev = () => {
    const prevIdx = stepIndex - 1;
    if (prevIdx >= 0) {
      goToStep(stepsList[prevIdx]);
    }
  };

  const handleRestart = () => {
    setTimerSeconds(0);
    goToStep('intro');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!isOpen) return null;

  const formatVideoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[120] bg-black text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* CINEMATIC LETTERBOX BARS (Top & Bottom Video Effect) */}
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.95)]">
        {/* Subtle scanline / film grain effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      </div>

      {/* TOP VIDEO OVERLAY BAR (REC badge, title, fullscreen, close) */}
      <div className="relative z-20 flex items-center justify-between p-3 sm:p-5 pt-safe bg-gradient-to-b from-black via-black/90 to-transparent">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-red-600/90 text-white font-mono font-bold text-xs px-2.5 py-1 rounded shadow-lg animate-pulse">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white" />
            <span>REC</span>
          </div>
          <span className="font-mono text-xs text-orange-400 font-bold hidden sm:inline">
            {formatVideoTime(timerSeconds)} / 02:45
          </span>
          <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold uppercase tracking-wider pl-2 border-l border-white/20">
            <Film className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="font-creepster tracking-wider text-base text-orange-400 truncate max-w-[120px] sm:max-w-none">GALA DE PREMIOS</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer active:scale-95"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer active:scale-95 hidden xs:flex"
            title="Pantalla completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Close Video */}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-950/80 hover:bg-red-700 text-white border border-red-500/40 transition-colors cursor-pointer active:scale-95"
            title="Cerrar gala"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CENTER VIDEO CANVAS: CINEMATIC REVEAL SCENES */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-4 max-w-4xl w-full mx-auto">
        
        {/* ==================== SCENE 0: INTRO SLATE ==================== */}
        {currentStep === 'intro' && (
          <div className="text-center space-y-6 animate-fadeIn max-w-xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/50 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Fiesta de Halloween Casa de Nico</span>
            </div>

            <h1 className="font-creepster text-5xl sm:text-7xl text-orange-400 text-glow-orange leading-tight tracking-wider animate-bounce">
              GRAN GALA DE PREMIOS
            </h1>

            <p className="text-sm sm:text-base text-purple-200 max-w-md mx-auto font-medium">
              El jurado popular ha dictado sentencia. Con redoble de tambores, descubrimos a los grandes campeones de la noche.
            </p>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => goToStep('cutre')}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:scale-105 text-white font-black text-sm sm:text-base py-3.5 px-8 rounded-full shadow-2xl shadow-orange-600/50 cursor-pointer transition-all"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Iniciar Revelación de Ganadores</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== SCENE 1: PREMIO ESPECIAL DEL PÚBLICO ==================== */}
        {currentStep === 'cutre' && (
          <div className="text-center space-y-4 max-w-lg w-full animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              <Scroll className="w-4 h-4" />
              <span>Premio Especial del Público</span>
            </div>

            <h2 className="font-creepster text-3xl sm:text-5xl text-amber-400 tracking-wider">
              PREMIO ESPECIAL DE VOTACIÓN
            </h2>

            {!isRevealed ? (
              /* Suspense / Drumroll State */
              <div className="py-8 space-y-4">
                <div className="w-36 h-36 mx-auto rounded-3xl bg-purple-950/60 border-2 border-dashed border-amber-500/50 flex items-center justify-center animate-pulse shadow-2xl">
                  <span className="text-5xl animate-bounce">🥁</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-amber-300 font-mono tracking-widest animate-pulse">
                    REDOBLE DE TAMBORES...
                  </p>
                  <p className="text-xs text-purple-300">Descubriendo al favorito en los votos especiales...</p>
                </div>
              </div>
            ) : (
              /* Revealed State */
              <div className="space-y-4 animate-scaleUp">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl shadow-amber-500/40 glow-box-orange">
                  {cutreContestant?.photoUrl ? (
                    <img src={cutreContestant.photoUrl} alt="Ganador premio especial" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-950 flex items-center justify-center text-4xl">👑</div>
                  )}
                  <div className="absolute top-2 right-2 bg-amber-500 text-black font-black text-xs px-2.5 py-1 rounded-full shadow">
                    🗳️ {cutreWinner?.votes || 1} votos
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-creepster text-3xl sm:text-4xl text-white text-glow-orange">
                    {cutreWinner ? cutreWinner.name : (cutreContestant?.name || 'Mención Especial')}
                  </h3>
                  <p className="text-sm font-bold text-orange-400">
                    {cutreContestant?.characterName ? `Disfrazado de: ${cutreContestant.characterName}` : '¡Gran ovación del público!'}
                  </p>
                  <p className="text-xs text-purple-200 max-w-sm mx-auto">
                    🎃 ¡Reconocimiento unánime por conseguir el mayor apoyo en la votación popular de la fiesta!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SCENE 2: EL DETECTIVE SUPREMO (JUEGO 1) ==================== */}
        {currentStep === 'detective' && (
          <div className="text-center space-y-4 max-w-lg w-full animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              <Search className="w-4 h-4" />
              <span>Ganador Juego 1: Adivinanzas</span>
            </div>

            <h2 className="font-creepster text-3xl sm:text-5xl text-indigo-300 tracking-wider">
              EL DETECTIVE DE ULTRATUMBA
            </h2>

            {!isRevealed ? (
              /* Suspense / Drumroll State */
              <div className="py-8 space-y-4">
                <div className="w-36 h-36 mx-auto rounded-3xl bg-purple-950/60 border-2 border-dashed border-indigo-500/50 flex items-center justify-center animate-pulse shadow-2xl">
                  <span className="text-5xl animate-bounce">🔍</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-indigo-300 font-mono tracking-widest animate-pulse">
                    BUSCANDO AL OJO MÁS AVIPADO...
                  </p>
                  <p className="text-xs text-purple-300">¿Quién descubrió más personajes ocultos?</p>
                </div>
              </div>
            ) : (
              /* Revealed State */
              <div className="space-y-4 animate-scaleUp">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-3xl overflow-hidden border-4 border-indigo-400 shadow-2xl shadow-indigo-500/40 glow-box-purple">
                  {detectiveContestant?.photoUrl ? (
                    <img src={detectiveContestant.photoUrl} alt="Detective" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-950 flex items-center justify-center text-4xl">🕵️‍♂️</div>
                  )}
                  <div className="absolute top-2 right-2 bg-indigo-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow">
                    🎯 {topDetective?.score || 0} aciertos
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-creepster text-3xl sm:text-4xl text-white">
                    {topDetective ? topDetective.name : 'Premio Desierto'}
                  </h3>
                  <p className="text-sm font-bold text-indigo-300">
                    {topDetective ? `¡${topDetective.score} aciertos en la pasarela!` : 'Nadie logró acertar todavía'}
                  </p>
                  <p className="text-xs text-purple-200 max-w-sm mx-auto">
                    🦇 ¡Una mirada de lince! Descubrió las identidades secretas de sus amigos sin titubear.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SCENE 3: TERCER PUESTO (BRONCE) ==================== */}
        {currentStep === 'third' && (
          <div className="text-center space-y-4 max-w-lg w-full animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-amber-800/30 text-amber-500 border border-amber-700/50 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Podio de La Pasarela • 3er Puesto</span>
            </div>

            <h2 className="font-creepster text-3xl sm:text-5xl text-amber-600 tracking-wider">
              BRONCE ESPECTRAL (#3)
            </h2>

            {!isRevealed ? (
              <div className="py-8 space-y-4">
                <div className="w-36 h-36 mx-auto rounded-3xl bg-purple-950/60 border-2 border-dashed border-amber-700/50 flex items-center justify-center animate-pulse shadow-2xl">
                  <span className="text-5xl">🥉</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-amber-500 font-mono tracking-widest animate-pulse">
                    REDOBLE PARA EL 3º PUESTO...
                  </p>
                  <p className="text-xs text-purple-300">Subiendo al podio de honor...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-scaleUp">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-3xl overflow-hidden border-4 border-amber-700 shadow-2xl shadow-amber-700/30">
                  {thirdPlace?.photoUrl ? (
                    <img src={thirdPlace.photoUrl} alt="3er Puesto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-950 flex items-center justify-center text-4xl">🥉</div>
                  )}
                  <div className="absolute top-2 right-2 bg-amber-700 text-white font-black text-xs px-2.5 py-1 rounded-full shadow">
                    ⭐ {thirdPlace ? thirdPlace.avgScore.toFixed(1) : '-'} / 5
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-creepster text-3xl sm:text-4xl text-white">
                    {thirdPlace ? thirdPlace.name : 'Por definir'}
                  </h3>
                  <p className="text-sm font-bold text-amber-500">
                    {thirdPlace ? thirdPlace.characterName : ''}
                  </p>
                  <p className="text-xs text-purple-200 max-w-sm mx-auto">
                    🥉 ¡Medalla de bronce para un disfraz espectacular y muy celebrado por la pandilla!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SCENE 4: SEGUNDO PUESTO (PLATA) ==================== */}
        {currentStep === 'second' && (
          <div className="text-center space-y-4 max-w-lg w-full animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-slate-300/20 text-slate-300 border border-slate-300/40 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              <Medal className="w-4 h-4 text-slate-300" />
              <span>Podio de La Pasarela • 2º Puesto</span>
            </div>

            <h2 className="font-creepster text-3xl sm:text-5xl text-slate-200 tracking-wider">
              SUBCAMPEÓN DE HALLOWEEN (#2)
            </h2>

            {!isRevealed ? (
              <div className="py-8 space-y-4">
                <div className="w-36 h-36 mx-auto rounded-3xl bg-purple-950/60 border-2 border-dashed border-slate-400/50 flex items-center justify-center animate-pulse shadow-2xl">
                  <span className="text-5xl">🥈</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-slate-300 font-mono tracking-widest animate-pulse">
                    REDOBLE DE TAMBORES...
                  </p>
                  <p className="text-xs text-purple-300">¡A las puertas de la gloria!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-scaleUp">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-3xl overflow-hidden border-4 border-slate-300 shadow-2xl shadow-slate-300/30">
                  {secondPlace?.photoUrl ? (
                    <img src={secondPlace.photoUrl} alt="2º Puesto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-950 flex items-center justify-center text-4xl">🥈</div>
                  )}
                  <div className="absolute top-2 right-2 bg-slate-200 text-black font-black text-xs px-2.5 py-1 rounded-full shadow">
                    ⭐ {secondPlace ? secondPlace.avgScore.toFixed(1) : '-'} / 5
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-creepster text-3xl sm:text-4xl text-white">
                    {secondPlace ? secondPlace.name : 'Por definir'}
                  </h3>
                  <p className="text-sm font-bold text-slate-300">
                    {secondPlace ? secondPlace.characterName : ''}
                  </p>
                  <p className="text-xs text-purple-200 max-w-sm mx-auto">
                    🥈 ¡Medalla de plata y subcampeonato indiscutible con un trabajo de caracterización increíble!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SCENE 5: PRIMER PUESTO (GRAN CAMPEÓN) ==================== */}
        {currentStep === 'first' && (
          <div className="text-center space-y-4 max-w-xl w-full animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black border-2 border-white px-5 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-xl animate-bounce">
              <Crown className="w-4 h-4" />
              <span>¡EL GRAN CAMPEÓN ABSOLUTO!</span>
            </div>

            <h2 className="font-creepster text-4xl sm:text-6xl text-amber-300 text-glow-orange tracking-wider">
              1ER PUESTO: ORO Y GLORIA
            </h2>

            {!isRevealed ? (
              <div className="py-8 space-y-4">
                <div className="w-40 h-40 mx-auto rounded-3xl bg-gradient-to-b from-orange-950 to-purple-950 border-4 border-dashed border-amber-400 flex items-center justify-center animate-pulse shadow-2xl">
                  <span className="text-6xl animate-spin">👑</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black text-amber-400 font-mono tracking-widest animate-pulse">
                    ¡¡GRAN REDOBLE FINAL DE TAMBORES!!
                  </p>
                  <p className="text-xs text-purple-300">Silencio absoluto en la sala... el ganador es...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-scaleUp">
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 mx-auto rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl shadow-amber-400/50 glow-box-orange">
                  {firstPlace?.photoUrl ? (
                    <img src={firstPlace.photoUrl} alt="1er Puesto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-orange-950 flex items-center justify-center text-5xl">👑</div>
                  )}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-xs px-3 py-1 rounded-full shadow-lg">
                    👑 1ER PUESTO
                  </div>
                  <div className="absolute top-2 right-2 bg-black/80 border border-amber-400 text-amber-300 font-black text-xs px-2.5 py-1 rounded-full shadow">
                    ⭐ {firstPlace ? firstPlace.avgScore.toFixed(1) : '-'} / 5 ({firstPlace?.totalVotes || 0} votos)
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-creepster text-4xl sm:text-5xl text-orange-400 text-glow-orange">
                    {firstPlace ? firstPlace.name : 'Por definir'}
                  </h3>
                  <p className="text-base font-extrabold text-amber-300">
                    {firstPlace ? `Disfrazado de: ${firstPlace.characterName}` : ''}
                  </p>
                  <p className="text-xs sm:text-sm text-purple-200 max-w-md mx-auto pt-1 font-medium">
                    🎃 ¡Muchas felicidades por el disfraz más votado y espectacular de la noche!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SCENE 6: PODIO RECAP ==================== */}
        {currentStep === 'recap' && (
          <div className="text-center space-y-6 max-w-2xl w-full animate-fadeIn py-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs text-orange-400 font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                <span>Ceremonia Concluida</span>
              </div>
              <h2 className="font-creepster text-3xl sm:text-5xl text-amber-400 text-glow-orange">
                ¡ENHORABUENA A TODOS LOS PARTICIPANTES!
              </h2>
            </div>

            {/* Quick 3 podium highlights */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
              {/* 2nd */}
              <div className="bg-purple-950/70 border border-slate-300/40 rounded-2xl p-2.5 sm:p-3 text-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-xl overflow-hidden border-2 border-slate-300 mb-1.5">
                  {secondPlace?.photoUrl ? (
                    <img src={secondPlace.photoUrl} alt="2" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full bg-slate-800" />}
                </div>
                <div className="text-[10px] text-slate-300 font-bold uppercase">🥈 2º Puesto</div>
                <div className="text-xs font-bold text-white truncate">{secondPlace?.name || '-'}</div>
                <div className="text-[10px] text-orange-400 truncate">{secondPlace?.characterName || ''}</div>
              </div>

              {/* 1st */}
              <div className="bg-gradient-to-t from-orange-950 to-purple-950 border-2 border-amber-400 rounded-2xl p-3 sm:p-4 text-center transform -translate-y-2 glow-box-orange">
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-xl overflow-hidden border-2 border-amber-400 mb-1.5">
                  {firstPlace?.photoUrl ? (
                    <img src={firstPlace.photoUrl} alt="1" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full bg-amber-900" />}
                </div>
                <div className="text-xs text-amber-300 font-black uppercase">👑 1er Campeón</div>
                <div className="text-sm font-creepster text-orange-300 truncate">{firstPlace?.name || '-'}</div>
                <div className="text-[11px] text-amber-300 font-bold truncate">{firstPlace?.characterName || ''}</div>
              </div>

              {/* 3rd */}
              <div className="bg-purple-950/70 border border-amber-700/50 rounded-2xl p-2.5 sm:p-3 text-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-xl overflow-hidden border-2 border-amber-700 mb-1.5">
                  {thirdPlace?.photoUrl ? (
                    <img src={thirdPlace.photoUrl} alt="3" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full bg-amber-950" />}
                </div>
                <div className="text-[10px] text-amber-500 font-bold uppercase">🥉 3er Puesto</div>
                <div className="text-xs font-bold text-white truncate">{thirdPlace?.name || '-'}</div>
                <div className="text-[10px] text-orange-400 truncate">{thirdPlace?.characterName || ''}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 bg-purple-900 hover:bg-purple-800 text-purple-200 text-xs font-bold py-2.5 px-5 rounded-full border border-purple-500/40 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-orange-400" />
                <span>Volver a Proyectar Gala</span>
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black py-2.5 px-6 rounded-full shadow-lg cursor-pointer transition-all"
              >
                <span>Volver a La Pasarela</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM VIDEO CONTROLLER (Timeline Scrubber, Scenes Indicator, Play/Pause, Next/Prev) */}
      <div className="relative z-20 p-4 sm:p-6 pb-safe bg-gradient-to-t from-black via-black/95 to-transparent space-y-3">
        {/* Progress Bar with 6 Chapter Marks */}
        <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden flex">
          {stepsList.map((st, idx) => (
            <div
              key={st}
              onClick={() => goToStep(st)}
              className={`flex-1 h-full cursor-pointer transition-all border-r border-black/40 ${
                idx < stepIndex
                  ? 'bg-orange-500'
                  : idx === stepIndex
                  ? isRevealed ? 'bg-amber-400' : 'bg-orange-500/50 animate-pulse'
                  : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Video Controls Bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Current Award Label */}
          <div className="text-xs sm:text-sm text-purple-200 font-bold flex items-center gap-2 min-w-0">
            <span className="text-orange-400 font-mono shrink-0">Paso {stepIndex + 1}/{stepsList.length}:</span>
            <span className="truncate text-white font-medium">
              {currentStep === 'intro' && 'Introducción de la Gala'}
              {currentStep === 'cutre' && 'Premio Especial de Votación'}
              {currentStep === 'detective' && 'El Detective de Ultratumba'}
              {currentStep === 'third' && '3er Puesto (Bronce)'}
              {currentStep === 'second' && '2º Puesto (Plata)'}
              {currentStep === 'first' && '1er Puesto (Gran Campeón)'}
              {currentStep === 'recap' && 'Podio de Honor Completo'}
            </span>
          </div>

          {/* Center: Play / Pause / Skip */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrev}
              disabled={stepIndex === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all"
              title="Anterior escena"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-xl cursor-pointer active:scale-95 transition-all"
              title={isPlaying ? 'Pausar vídeo' : 'Reanudar vídeo'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            <button
              onClick={handleNext}
              disabled={stepIndex === stepsList.length - 1}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all"
              title="Siguiente escena"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
