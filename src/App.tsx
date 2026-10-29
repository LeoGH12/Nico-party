/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Skull, 
  Sparkles, 
  Copy, 
  Check, 
  KeyRound, 
  HelpCircle, 
  Ghost, 
  LogOut, 
  ShieldAlert,
  Dices,
  PenTool,
  Search,
  CheckCircle2,
  Lock,
  Eye,
  Film,
  Crown,
  Trophy,
  Unlock,
  Users,
  RotateCcw,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { CountdownTimer } from './components/CountdownTimer.tsx';
import { CharacterCard } from './components/CharacterCard.tsx';
import { CatwalkRunway } from './components/CatwalkRunway.tsx';
import { HostModal } from './components/HostModal.tsx';
import { WinnersCeremonyModal } from './components/WinnersCeremonyModal.tsx';
import { HALLOWEEN_CHARACTERS, Character } from './data/characters.ts';
import { halloweenAudio } from './utils/audio.ts';

interface UserData {
  code: string;
  name: string;
  characterId: string;
  confirmed: boolean;
  rollsLeft: number;
  photoUrl?: string;
  photoTimestamp?: number;
  registeredAt: number;
}

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

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    return localStorage.getItem('hlw_is_superadmin') === 'true';
  });
  
  // Navigation active view ('home' for registration/lockdown, 'catwalk' for live runway & voting, 'admin' for full superadmin dashboard)
  const [activeView, setActiveView] = useState<'home' | 'catwalk' | 'admin'>(() => {
    return localStorage.getItem('hlw_is_superadmin') === 'true' ? 'admin' : 'home';
  });
  const [showCeremonyModal, setShowCeremonyModal] = useState<boolean>(false);

  // Superadmin Host state
  const [hostUsers, setHostUsers] = useState<Array<{
    code: string;
    name: string;
    characterId: string;
    confirmed: boolean;
    rollsLeft: number;
    photoUrl?: string;
    photoTimestamp?: number;
    registeredAt: number;
    character?: { name: string; source: string };
  }>>([]);
  const [isLoadingHostUsers, setIsLoadingHostUsers] = useState<boolean>(false);
  const [hostStatusMsg, setHostStatusMsg] = useState<string | null>(null);
  const [hostUserToDelete, setHostUserToDelete] = useState<{ code: string; name: string } | null>(null);
  const [hostShowResetConfirm, setHostShowResetConfirm] = useState<boolean>(false);

  // Registration flow inputs
  const [registerMode, setRegisterMode] = useState<'random' | 'custom'>('random');
  const [nameInput, setNameInput] = useState<string>('');
  const [customCharName, setCustomCharName] = useState<string>('');
  const [customCharSource, setCustomCharSource] = useState<string>('');
  const [codeInput, setCodeInput] = useState<string>('');
  const [showCodeLogin, setShowCodeLogin] = useState<boolean>(false);
  
  // Status flags
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isRerolling, setIsRerolling] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Status & Catwalk
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [partyDate, setPartyDate] = useState<string>('2026-10-30T22:00:00');
  const [partyLocation, setPartyLocation] = useState<string>('Casa de Nico');
  const [votingFinalized, setVotingFinalized] = useState<boolean>(false);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [allSubmitted, setAllSubmitted] = useState<boolean>(false);
  const [totalRegistered, setTotalRegistered] = useState<number>(0);
  const [submittedCount, setSubmittedCount] = useState<number>(0);
  const [myScore, setMyScore] = useState<number>(0);
  const [detectiveScores, setDetectiveScores] = useState<DetectiveScore[]>([]);
  const [cutreWinner, setCutreWinner] = useState<CutreWinner | null>(null);

  // Host modal
  const [showHostModal, setShowHostModal] = useState<boolean>(false);

  // Helper: safe JSON fetcher that avoids SyntaxError on HTML 404/500 responses
  async function safeFetchJson<T = any>(
    url: string,
    options?: RequestInit
  ): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        return { ok: res.ok, status: res.status, data, error: data?.error };
      }
      return {
        ok: false,
        status: res.status,
        error: res.ok ? 'Respuesta inesperada' : `Error (${res.status})`
      };
    } catch (err: any) {
      return { ok: false, status: 0, error: err?.message || 'Error de conexión' };
    }
  }

  // Strict guard: nobody can view the catwalk until unlocked, except the SuperAdmin!
  useEffect(() => {
    if (!isUnlocked && !isSuperAdmin && activeView === 'catwalk') {
      setActiveView('home');
    }
  }, [isUnlocked, isSuperAdmin, activeView]);

  // Restore saved session from localStorage on startup
  useEffect(() => {
    const savedCode = localStorage.getItem('hlw_party_code');
    if (savedCode) {
      fetchUserByCode(savedCode);
    }
    fetchCatwalk();
  }, []);

  const fetchCatwalk = useCallback(async (voterCode?: string) => {
    try {
      const query = voterCode ? `?voterCode=${encodeURIComponent(voterCode)}` : '';
      const res = await safeFetchJson<{
        contestants: Contestant[];
        isUnlocked: boolean;
        votingFinalized: boolean;
        allSubmitted: boolean;
        totalRegistered: number;
        submittedCount: number;
        partyDate?: string;
        partyLocation?: string;
        myScore: number;
        detectiveScores: DetectiveScore[];
        cutreWinner: CutreWinner | null;
      }>(`/api/catwalk${query}`);

      if (res.ok && res.data) {
        const newContestants = res.data.contestants || [];
        setContestants(newContestants);
        setIsUnlocked(res.data.isUnlocked);
        if (res.data.partyDate) setPartyDate(res.data.partyDate);
        if (res.data.partyLocation) setPartyLocation(res.data.partyLocation);
        setVotingFinalized(res.data.votingFinalized);
        setAllSubmitted(res.data.allSubmitted);
        setTotalRegistered(res.data.totalRegistered);
        setSubmittedCount(res.data.submittedCount);
        setMyScore(res.data.myScore || 0);
        setDetectiveScores(res.data.detectiveScores || []);
        setCutreWinner(res.data.cutreWinner || null);
      }
    } catch {
      // quiet fallback
    }
  }, []);

  // Superadmin host user fetcher
  const fetchHostUsers = useCallback(async (showSpinner: boolean = true) => {
    if (showSpinner) setIsLoadingHostUsers(true);
    try {
      const res = await safeFetchJson<{ users: any[] }>('/api/host-all-users');
      if (res.ok && res.data?.users && Array.isArray(res.data.users)) {
        setHostUsers(res.data.users);
      }
    } catch (e) {
      console.error('Error fetching host users:', e);
    } finally {
      if (showSpinner) setIsLoadingHostUsers(false);
    }
  }, []);

  // Periodic polling for real-time live synchronization (smooth 2.5s cadence)
  useEffect(() => {
    const codeToPass = isSuperAdmin ? undefined : user?.code;
    fetchCatwalk(codeToPass);
    const interval = setInterval(() => {
      fetchCatwalk(codeToPass);
    }, 2500);
    return () => clearInterval(interval);
  }, [fetchCatwalk, isSuperAdmin, user?.code]);

  // Fetch host users immediately when entering admin view with spinner
  useEffect(() => {
    if (isSuperAdmin && activeView === 'admin') {
      fetchHostUsers(true);
    }
  }, [isSuperAdmin, activeView, fetchHostUsers]);

  const handleHostDeleteUser = async (code: string, name: string) => {
    setHostUserToDelete(null);
    setHostStatusMsg(`Eliminando a ${name}...`);
    try {
      const res = await safeFetchJson('/api/host-delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        setHostStatusMsg(`✅ ${name} (${code}) eliminado con éxito`);
        await fetchHostUsers();
        await fetchCatwalk('ADMIN');
      } else {
        setHostStatusMsg(res.error || 'Error al eliminar');
      }
    } catch {
      setHostStatusMsg('Error al conectar con el servidor');
    }
  };

  const handleHostSeed = async () => {
    setIsLoadingHostUsers(true);
    setHostStatusMsg('Cargando 5 amigos de prueba...');
    try {
      await safeFetchJson('/api/host-seed-demo', { method: 'POST' });
      setIsUnlocked(true);
      await fetchHostUsers();
      await fetchCatwalk('ADMIN');
      setHostStatusMsg('✅ ¡5 participantes de prueba cargados con fotos y votos!');
    } catch {
      setHostStatusMsg('Error al cargar pruebas');
    } finally {
      setIsLoadingHostUsers(false);
    }
  };

  const handleHostReset = async () => {
    setHostShowResetConfirm(false);
    setHostStatusMsg('Reiniciando base de datos...');
    try {
      await safeFetchJson('/api/host-reset', { method: 'POST' });
      setIsUnlocked(false);
      setVotingFinalized(false);
      await fetchHostUsers();
      await fetchCatwalk('ADMIN');
      setHostStatusMsg('✅ Base de datos reiniciada por completo');
    } catch {
      setHostStatusMsg('Error al reiniciar base de datos');
    }
  };

  const handleHostToggleCatwalk = async () => {
    try {
      const res = await safeFetchJson<{ isUnlocked: boolean }>('/api/host-toggle-catwalk', { method: 'POST' });
      if (res.data) {
        setIsUnlocked(res.data.isUnlocked);
        setHostStatusMsg(res.data.isUnlocked ? 'Pasarela desbloqueada' : 'Pasarela bloqueada hasta las 22:00');
      }
      await fetchCatwalk('ADMIN');
    } catch {
      setHostStatusMsg('Error al alternar pasarela');
    }
  };

  const handleHostToggleFinalize = async () => {
    try {
      const res = await safeFetchJson<{ votingFinalized: boolean }>('/api/host-toggle-finalize', { method: 'POST' });
      if (res.data) {
        setVotingFinalized(res.data.votingFinalized);
        setHostStatusMsg(res.data.votingFinalized ? 'Votación cerrada y podio fijado' : 'Votación reabierta');
      }
      await fetchCatwalk('ADMIN');
    } catch {
      setHostStatusMsg('Error al alternar cierre de votación');
    }
  };

  const fetchUserByCode = async (code: string) => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const res = await safeFetchJson<{ user: UserData; character: Character; error?: string }>('/api/get-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (res.ok && res.data?.user) {
        setUser(res.data.user);
        setCharacter(res.data.character);
        localStorage.setItem('hlw_party_code', res.data.user.code);
        localStorage.setItem('hlw_local_user', JSON.stringify(res.data.user));
        if (res.data.character) {
          localStorage.setItem('hlw_local_character', JSON.stringify(res.data.character));
        }
        setShowCodeLogin(false);
        fetchCatwalk(res.data.user.code);
      } else {
        setErrorMsg(res.error || 'Código no encontrado en el servidor. Verifica que lo hayas introducido bien.');
        localStorage.removeItem('hlw_party_code');
        localStorage.removeItem('hlw_local_user');
        localStorage.removeItem('hlw_local_character');
      }
    } catch {
      setErrorMsg('Error de conexión al verificar el código con el servidor');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Register Random Character
  const handleRegisterRandom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (!cleanName) {
      setErrorMsg('Por favor escribe tu nombre o apodo');
      return;
    }
    setIsRegistering(true);
    setErrorMsg(null);
    try {
      const res = await safeFetchJson<{ user: UserData; character: Character; error?: string; suggestCodeLogin?: boolean }>('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName })
      });
      if (res.ok && res.data?.user && res.data?.character) {
        setUser(res.data.user);
        setCharacter(res.data.character);
        localStorage.setItem('hlw_party_code', res.data.user.code);
        localStorage.setItem('hlw_local_user', JSON.stringify(res.data.user));
        localStorage.setItem('hlw_local_character', JSON.stringify(res.data.character));
        halloweenAudio.playCreepyLaugh();
      } else if (res.data?.suggestCodeLogin) {
        setErrorMsg(res.data.error || 'Este nombre ya está registrado. Introduce tu código.');
        setShowCodeLogin(true);
      } else {
        setErrorMsg(res.error || res.data?.error || 'No se pudo registrar el usuario en el servidor. Por favor inténtalo de nuevo.');
      }
    } catch {
      setErrorMsg('Error de conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Register Custom / Suggested Character
  const handleRegisterCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    const cleanCharName = customCharName.trim();
    if (!cleanName) {
      setErrorMsg('Por favor escribe tu nombre o apodo');
      return;
    }
    if (!cleanCharName) {
      setErrorMsg('Por favor escribe el nombre del personaje que deseas');
      return;
    }
    setIsRegistering(true);
    setErrorMsg(null);
    try {
      const res = await safeFetchJson<{ user: UserData; character: Character; error?: string; suggestCodeLogin?: boolean }>('/api/suggest-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: cleanName,
          characterName: cleanCharName,
          source: customCharSource.trim()
        })
      });
      if (res.ok && res.data?.user && res.data?.character) {
        setUser(res.data.user);
        setCharacter(res.data.character);
        localStorage.setItem('hlw_party_code', res.data.user.code);
        localStorage.setItem('hlw_local_user', JSON.stringify(res.data.user));
        localStorage.setItem('hlw_local_character', JSON.stringify(res.data.character));
        halloweenAudio.playCreepyLaugh();
      } else if (res.data?.suggestCodeLogin) {
        setErrorMsg(res.data.error || 'Este nombre ya está registrado. Introduce tu código.');
        setShowCodeLogin(true);
      } else {
        setErrorMsg(res.error || res.data?.error || 'No se pudo guardar el personaje sugerido en el servidor. Por favor inténtalo de nuevo.');
      }
    } catch {
      setErrorMsg('Error de conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleReroll = async () => {
    if (!user || user.rollsLeft <= 0 || user.confirmed) return;
    setIsRerolling(true);
    setErrorMsg(null);
    halloweenAudio.playRerollWhoosh();
    try {
      const res = await safeFetchJson<{ user: UserData; character: Character; error?: string }>('/api/reroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: user.code })
      });
      if (res.ok && res.data?.user && res.data?.character) {
        setUser(res.data.user);
        setCharacter(res.data.character);
        localStorage.setItem('hlw_local_user', JSON.stringify(res.data.user));
        localStorage.setItem('hlw_local_character', JSON.stringify(res.data.character));
      } else {
        const pool = HALLOWEEN_CHARACTERS.filter(c => c.id !== user.characterId);
        const nextChar = pool[Math.floor(Math.random() * pool.length)] || HALLOWEEN_CHARACTERS[0];
        const updatedUser: UserData = {
          ...user,
          characterId: nextChar.id,
          rollsLeft: Math.max(0, user.rollsLeft - 1)
        };
        setUser(updatedUser);
        setCharacter(nextChar);
        localStorage.setItem('hlw_local_user', JSON.stringify(updatedUser));
        localStorage.setItem('hlw_local_character', JSON.stringify(nextChar));
      }
    } catch {
      const pool = HALLOWEEN_CHARACTERS.filter(c => c.id !== user.characterId);
      const nextChar = pool[Math.floor(Math.random() * pool.length)] || HALLOWEEN_CHARACTERS[0];
      const updatedUser: UserData = {
        ...user,
        characterId: nextChar.id,
        rollsLeft: Math.max(0, user.rollsLeft - 1)
      };
      setUser(updatedUser);
      setCharacter(nextChar);
      localStorage.setItem('hlw_local_user', JSON.stringify(updatedUser));
      localStorage.setItem('hlw_local_character', JSON.stringify(nextChar));
    } finally {
      setIsRerolling(false);
    }
  };

  const handleConfirmCharacter = async () => {
    if (!user) return;
    setIsConfirming(true);
    setErrorMsg(null);
    try {
      const res = await safeFetchJson<{ user: UserData; character: Character; error?: string }>('/api/confirm-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: user.code })
      });
      if (res.ok && res.data?.user) {
        setUser(res.data.user);
        if (res.data.character) setCharacter(res.data.character);
        localStorage.setItem('hlw_local_user', JSON.stringify(res.data.user));
        halloweenAudio.playCreepyLaugh();
      } else {
        const confirmedUser: UserData = { ...user, confirmed: true };
        setUser(confirmedUser);
        localStorage.setItem('hlw_local_user', JSON.stringify(confirmedUser));
        halloweenAudio.playCreepyLaugh();
      }
    } catch {
      const confirmedUser: UserData = { ...user, confirmed: true };
      setUser(confirmedUser);
      localStorage.setItem('hlw_local_user', JSON.stringify(confirmedUser));
      halloweenAudio.playCreepyLaugh();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleUploadPhoto = async (photoBase64: string) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, photoUrl: photoBase64 } : null);
    const updatedUser = { ...user, photoUrl: photoBase64 };
    localStorage.setItem('hlw_local_user', JSON.stringify(updatedUser));
    await safeFetchJson('/api/upload-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: user.code, photo: photoBase64 })
    });
    await fetchCatwalk(user.code);
  };

  const handleVote = async (targetCode: string, score: number) => {
    const voterCode = user?.code || (isSuperAdmin ? 'ADMIN' : '');
    if (!voterCode) return;
    await safeFetchJson('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voterCode,
        targetCode,
        score
      })
    });
    await fetchCatwalk(voterCode);
  };

  const handleGuess = async (targetCode: string, guessText: string) => {
    const guesserCode = user?.code || (isSuperAdmin ? 'ADMIN' : '');
    if (!guesserCode) return;
    await safeFetchJson('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guesserCode,
        targetCode,
        guessText
      })
    });
    await fetchCatwalk(guesserCode);
  };

  const handleVoteCutre = async (targetCode: string) => {
    const voterCode = user?.code || (isSuperAdmin ? 'ADMIN' : '');
    if (!voterCode) return;
    await safeFetchJson('/api/vote-cutre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voterCode,
        targetCode
      })
    });
    await fetchCatwalk(voterCode);
  };

  const handleCopyCode = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Requirement: Clicking on "NOCHE DE TERROR" returns to the start of the app with code input!
  const handleHeaderTitleClick = () => {
    setActiveView('home');
    setUser(null);
    setCharacter(null);
    setShowCodeLogin(true);
    setErrorMsg(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('hlw_party_code');
    setActiveView('home');
    setUser(null);
    setCharacter(null);
    setShowCodeLogin(true);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#08030f] text-purple-100 flex flex-col selection:bg-orange-500 selection:text-white relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-orange-950/15 rounded-full blur-3xl" />
        <div className="absolute top-4 left-4 text-purple-900/20 text-6xl select-none">🕸️</div>
        <div className="absolute top-4 right-4 text-purple-900/20 text-6xl select-none">🕸️</div>
      </div>

      {/* TOP HEADER: Strictly 1 Clean Line in Mobile & Clickable Title to return to Code Input */}
      <header className="sticky top-0 z-50 w-full border-b border-purple-500/30 bg-[#0c051a] shadow-2xl px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Clickable Title: Returns to Start / Code Login */}
          <button
            onClick={handleHeaderTitleClick}
            className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 text-left cursor-pointer group"
            title="Pulsar para volver al inicio / ingresar con código"
          >
            <span className="text-xl sm:text-2xl animate-float select-none shrink-0 group-hover:scale-110 transition-transform">
              🎃
            </span>
            <div className="flex items-center gap-1.5 truncate">
              <h1 className="font-creepster text-base sm:text-xl text-orange-400 text-glow-orange leading-none tracking-wide truncate group-hover:text-orange-300">
                NOCHE DE TERROR
              </h1>
              <span className="hidden sm:inline-block text-[11px] bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded-full text-purple-300 shrink-0">
                {partyLocation}
              </span>
            </div>
          </button>

          {/* Catwalk / Admin nav buttons */}
          {isSuperAdmin ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveView('admin');
                  fetchHostUsers();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
                  activeView === 'admin'
                    ? 'bg-amber-600 border-amber-300 text-white shadow-md shadow-amber-600/40'
                    : 'bg-purple-950/80 border-purple-500/40 text-amber-300 hover:text-white'
                }`}
                title="Ir al panel de control de anfitrión"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Panel Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('catwalk');
                  fetchCatwalk('ADMIN');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  activeView === 'catwalk'
                    ? 'bg-orange-600 border-orange-400 text-white shadow-md shadow-orange-600/40'
                    : 'bg-purple-950/80 border-purple-500/40 text-purple-200 hover:text-orange-400'
                }`}
                title="Ver pasarela y votaciones en vivo"
              >
                <Eye className="w-3.5 h-3.5 text-orange-400" />
                <span>Pasarela</span>
              </button>
            </div>
          ) : !isUnlocked ? (
            <div 
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold bg-purple-950/80 border border-purple-500/30 text-purple-300 select-none shrink-0"
              title="Los juegos y la pasarela están bloqueados hasta el Viernes 30 a las 22:00"
            >
              <Lock className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden xs:inline">Juegos: 22:00</span>
              <span className="xs:hidden">22:00</span>
            </div>
          ) : (
            <button
              onClick={() => {
                if (activeView === 'catwalk') {
                  setActiveView('home');
                } else {
                  setActiveView('catwalk');
                  fetchCatwalk(user?.code);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                activeView === 'catwalk'
                  ? 'bg-orange-600 border-orange-400 text-white shadow-md shadow-orange-600/40'
                  : 'bg-purple-950/80 border-purple-500/40 text-purple-200 hover:text-orange-400 hover:border-orange-500/50'
              }`}
              title="Ver pasarela y votaciones en vivo"
            >
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden xs:inline">
                {activeView === 'catwalk' ? 'Mi Personaje' : 'Pasarela en Vivo'}
              </span>
              <span className="xs:hidden">
                {activeView === 'catwalk' ? 'Inicio' : 'Pasarela'}
              </span>
            </button>
          )}

          {/* Right Tools: Compact Audio Synth, Host skull, & User Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <AudioPlayer />

            {/* Host button */}
            <button
              type="button"
              onClick={() => {
                if (isSuperAdmin) {
                  setActiveView('admin');
                  fetchHostUsers();
                } else {
                  setShowHostModal(true);
                }
              }}
              className={`p-1.5 sm:p-2 rounded-full border transition-colors cursor-pointer ${
                isSuperAdmin 
                  ? 'bg-amber-600/30 border-amber-400 text-amber-300 shadow-md animate-pulse'
                  : 'bg-purple-950/90 border-purple-500/40 text-purple-300 hover:text-orange-400 hover:border-orange-500/50'
              }`}
              title="Panel del anfitrión (Nico)"
            >
              <Skull className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
            </button>

            {/* Superadmin pill or User badge */}
            {isSuperAdmin ? (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 border border-amber-300/50 rounded-full py-1 px-2.5 text-[11px] font-black text-white shadow-md">
                <Crown className="w-3 h-3 text-yellow-200" />
                <span>NICO ADMIN</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-1 bg-purple-900/50 border border-purple-500/40 rounded-full py-1 px-2.5 text-[11px]">
                <span className="text-purple-300 font-medium truncate max-w-[70px] sm:max-w-none">
                  {user.name}
                </span>
                <span className="font-mono font-bold text-orange-400 hidden xs:inline">
                  ({user.code})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-purple-400 hover:text-red-400 ml-0.5 cursor-pointer"
                  title="Cambiar de participante"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Superadmin Quick Bar */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-amber-950/95 via-purple-950/95 to-orange-950/95 border-b border-orange-500/50 px-3 sm:px-6 py-2 shadow-2xl flex flex-wrap items-center justify-between gap-2 sticky top-[49px] sm:top-[53px] z-40 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-300">
            <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>MODO SUPERADMIN (CASA DE NICO)</span>
            <span className="text-[11px] font-normal text-purple-300 hidden md:inline">— Control central de la fiesta</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveView('admin');
                fetchHostUsers();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeView === 'admin'
                  ? 'bg-amber-600 border-amber-300 text-white shadow-md'
                  : 'bg-purple-950/80 border-purple-500/40 text-purple-200 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Vista Admin</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView('catwalk');
                fetchCatwalk('ADMIN');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeView === 'catwalk'
                  ? 'bg-orange-600 border-orange-400 text-white shadow-md'
                  : 'bg-purple-950/80 border-purple-500/40 text-purple-200 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-orange-400" />
                <span>Ver Pasarela & Votos</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowCeremonyModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 to-orange-500 text-white border border-amber-300/40 cursor-pointer shadow hover:scale-[1.02] active:scale-[0.98]"
            >
              🎬 Gala Ganadores
            </button>

            <button
              type="button"
              onClick={() => setActiveView('home')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                activeView === 'home'
                  ? 'bg-purple-700 text-white border-purple-400'
                  : 'bg-purple-950/80 text-purple-300 border-purple-500/30'
              }`}
              title="Ver cómo lo ve un invitado normal"
            >
              Vista Invitado
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSuperAdmin(false);
                localStorage.removeItem('hlw_is_superadmin');
                setShowHostModal(false);
                setActiveView('home');
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white cursor-pointer ml-1"
              title="Salir del modo administrador"
            >
              Salir Admin
            </button>
          </div>
        </div>
      )}


      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center justify-between shadow-lg">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-white text-xs font-bold px-2 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ----------------- VIEW 1: REGISTRATION & CODE LOGIN (No user) ----------------- */}
        {!user && !isSuperAdmin && (
          <div className="space-y-6 max-w-lg mx-auto">
            {/* Hero Card */}
            <div className="text-center space-y-3 pt-2">
              <div className="inline-flex items-center gap-2 bg-purple-900/60 border border-purple-500/30 px-4 py-1.5 rounded-full text-xs text-orange-400 font-bold uppercase tracking-widest glow-box-purple">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fiesta de Disfraces en Casa de Nico</span>
              </div>

              <h2 className="font-creepster text-4xl sm:text-5xl text-purple-100 tracking-wider">
                ELIGE TU DESTINO
              </h2>

              <p className="text-xs sm:text-sm text-purple-300 leading-relaxed max-w-md mx-auto">
                Participa en la fiesta con un personaje aleatorio o sugiere el tuyo propio. Recuerda que una vez registrado, <strong className="text-orange-400">únicamente podrás volver a entrar usando tu código</strong>.
              </p>
            </div>

            {/* Registration Card */}
            <div className="bg-[#140b24] border-2 border-purple-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl glow-box-purple">
              {!showCodeLogin ? (
                <div className="space-y-4">
                  {/* Selector: Aleatorio vs Sugerir / Elegir */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-purple-950/80 border border-purple-500/30 rounded-2xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setRegisterMode('random')}
                      className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        registerMode === 'random'
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'text-purple-300 hover:text-white'
                      }`}
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>Tirada Aleatoria</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegisterMode('custom')}
                      className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        registerMode === 'custom'
                          ? 'bg-purple-700 text-white shadow-md'
                          : 'text-purple-300 hover:text-white'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Sugerir Personaje</span>
                    </button>
                  </div>

                  {/* Mode 1: Random Character */}
                  {registerMode === 'random' && (
                    <form onSubmit={handleRegisterRandom} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-purple-200 flex items-center gap-1.5 uppercase tracking-wider">
                          <Ghost className="w-4 h-4 text-orange-400" />
                          <span>Tu Nombre o Apodo:</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Lucas, Andrea, Nico..."
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          maxLength={30}
                          className="w-full bg-purple-950/60 border-2 border-purple-500/40 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-base text-white placeholder-purple-400/50 outline-none transition-all shadow-inner"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-[0.98] text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-xl shadow-orange-600/30 border border-orange-400/40 transition-all cursor-pointer"
                      >
                        {isRegistering ? (
                          <span className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 animate-spin" />
                            Invocando personaje al azar...
                          </span>
                        ) : (
                          <span>🎲 Descubrir mi Personaje Asignado (2 cambios)</span>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Mode 2: Suggest / Pick Specific Character */}
                  {registerMode === 'custom' && (
                    <form onSubmit={handleRegisterCustom} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-purple-200 flex items-center gap-1.5 uppercase tracking-wider">
                          <Ghost className="w-4 h-4 text-orange-400" />
                          <span>Tu Nombre o Apodo:</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Carlos, Sofía..."
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          maxLength={30}
                          className="w-full bg-purple-950/60 border-2 border-purple-500/40 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-base text-white placeholder-purple-400/50 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-purple-200 flex items-center gap-1.5 uppercase tracking-wider">
                          <PenTool className="w-4 h-4 text-orange-400" />
                          <span>Personaje que sugieres / quieres:</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Ghostface, Darth Vader, Goku Zombi..."
                          value={customCharName}
                          onChange={(e) => setCustomCharName(e.target.value)}
                          maxLength={40}
                          className="w-full bg-purple-950/60 border-2 border-purple-500/40 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-base text-white placeholder-purple-400/50 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs sm:text-sm font-bold text-purple-300 flex items-center gap-1.5">
                          <span>Película, serie o videojuego (opcional):</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Star Wars, Scream, Dragon Ball..."
                          value={customCharSource}
                          onChange={(e) => setCustomCharSource(e.target.value)}
                          maxLength={40}
                          className="w-full bg-purple-950/60 border border-purple-500/40 focus:border-orange-500 rounded-2xl px-4 py-3 text-base text-white placeholder-purple-400/50 outline-none"
                        />
                      </div>

                      <p className="text-xs text-purple-300/80 italic pt-1 leading-relaxed">
                        💡 Tu personaje sugerido se guardará directamente en la base de la fiesta y se asignará en exclusiva para ti.
                      </p>

                      <button
                        type="submit"
                        disabled={isRegistering || !nameInput.trim() || !customCharName.trim()}
                        className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 active:scale-[0.98] text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-xl border border-purple-400/30 transition-all cursor-pointer"
                      >
                        {isRegistering ? 'Guardando en la pull...' : '💾 Guardar y Asignarme este Personaje'}
                      </button>
                    </form>
                  )}

                  <div className="pt-3 border-t border-purple-500/20 text-center">
                    <button
                      type="button"
                      onClick={() => setShowCodeLogin(true)}
                      className="text-xs text-purple-300 hover:text-orange-400 underline transition-colors cursor-pointer"
                    >
                      ¿Ya te habías registrado? Ingresa con tu código único
                    </button>
                  </div>
                </div>
              ) : (
                /* Restore by Code Form ONLY */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (codeInput.trim()) fetchUserByCode(codeInput.trim());
                  }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-1">
                    <h3 className="font-creepster text-2xl text-orange-400">
                      RECUPERAR MI PERSONAJE
                    </h3>
                    <p className="text-xs text-purple-300/90">
                      Por seguridad del secreto, el acceso de los ya registrados es <strong>únicamente con código alfanumérico</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5 uppercase tracking-wider">
                      <KeyRound className="w-4 h-4 text-orange-400" />
                      <span>Ingresa tu Código (ej. HLW-XXXX):</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. HLW-4K89"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      className="w-full font-mono uppercase bg-purple-950/60 border-2 border-purple-500/40 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-base text-center tracking-widest text-orange-400 placeholder-purple-400/50 outline-none transition-all shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn || !codeInput.trim()}
                    className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-xl transition-all cursor-pointer"
                  >
                    {isLoggingIn ? 'Verificando código...' : '🔓 Entrar a mi Personaje'}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowCodeLogin(false)}
                      className="text-xs text-purple-400 hover:text-purple-200 cursor-pointer"
                    >
                      ← Volver a crear nuevo participante
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Countdown card */}
            <CountdownTimer targetDateStr={partyDate} onUnlocked={() => setIsUnlocked(true)} />

            {/* Quick Party Rules Card */}
            <div className="bg-purple-950/30 border border-purple-500/20 rounded-2xl p-4 text-xs text-purple-300 space-y-2">
              <div className="font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Reglas y Acceso:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-purple-300/90">
                <li><strong className="text-white">Acceso exclusivo por código:</strong> Guarda bien tu código; con tu nombre no se podrá volver a entrar.</li>
                <li><strong className="text-white">Sugerir personaje:</strong> Puedes proponer cualquier personaje y se sumará a la pull.</li>
                <li><strong className="text-orange-400">Secreto absoluto:</strong> El nombre de tu personaje quedará oculto en el desfile para que los demás intenten adivinarlo.</li>
              </ul>
            </div>

            {/* Catwalk lock notice on landing page - strictly locked until agreed date/time or admin */}
            <div className="text-center pt-1">
              <div className="w-full inline-flex items-center justify-center gap-2.5 bg-purple-950/70 border border-purple-500/30 text-purple-200 text-xs sm:text-sm font-semibold py-3 px-4 rounded-2xl shadow-md">
                <Lock className="w-4 h-4 text-orange-400 shrink-0" />
                <span>
                  {isUnlocked
                    ? '🎭 La Pasarela se activará tras registrarte con tu código'
                    : 'Juegos y Pasarela estrictamente bloqueados hasta el Viernes 30 a las 22:00'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SUPERADMIN DASHBOARD VIEW ('admin') ----------------- */}
        {isSuperAdmin && activeView === 'admin' && (
          <div className="space-y-6 max-w-2xl mx-auto pb-10">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-purple-950 via-[#190a2e] to-orange-950 border-2 border-orange-500/50 rounded-3xl p-6 text-center glow-box-orange space-y-4">
              <div className="inline-flex items-center gap-2 bg-orange-600/30 text-orange-300 border border-orange-500/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>VISTA SUPERADMIN — CASA DE NICO</span>
              </div>
              <h2 className="font-creepster text-3xl sm:text-4xl text-orange-400 text-glow-orange">
                PANEL DE CONTROL DEL ANFITRIÓN
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 max-w-lg mx-auto">
                Control central de la fiesta. Visualiza a todos los amigos registrados, modera los disfraces y prueba la pasarela y las votaciones en tiempo real sin interferir en los resultados.
              </p>

              {/* Status / Alert Banner */}
              {hostStatusMsg && (
                <div className="p-3 bg-purple-950/90 border border-orange-500/50 rounded-2xl text-xs text-orange-300 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
                  <span className="font-semibold">{hostStatusMsg}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView('catwalk');
                        fetchCatwalk('ADMIN');
                      }}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95"
                    >
                      🎭 Ver en Pasarela
                    </button>
                    <button
                      type="button"
                      onClick={() => setHostStatusMsg(null)}
                      className="text-purple-400 hover:text-white text-xs px-1.5"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-purple-950/80 border border-purple-500/30 rounded-2xl p-3 text-center">
                  <div className="text-[11px] text-purple-300 font-medium">Registrados</div>
                  <div className="text-2xl font-black text-orange-400">{hostUsers.length || totalRegistered}</div>
                </div>
                <div className="bg-purple-950/80 border border-purple-500/30 rounded-2xl p-3 text-center">
                  <div className="text-[11px] text-purple-300 font-medium">Fotos en Pasarela</div>
                  <div className="text-2xl font-black text-emerald-400">{submittedCount}</div>
                </div>
                <div className="bg-purple-950/80 border border-purple-500/30 rounded-2xl p-3 text-center">
                  <div className="text-[11px] text-purple-300 font-medium">Pasarela</div>
                  <div className={`text-xs font-black mt-1 ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isUnlocked ? '🔓 ABIERTA' : '🔒 BLOQUEADA'}
                  </div>
                </div>
                <div className="bg-purple-950/80 border border-purple-500/30 rounded-2xl p-3 text-center">
                  <div className="text-[11px] text-purple-300 font-medium">Votación</div>
                  <div className={`text-xs font-black mt-1 ${votingFinalized ? 'text-red-400' : 'text-emerald-400'}`}>
                    {votingFinalized ? '🏆 FINALIZADA' : '⚡ EN VIVO'}
                  </div>
                </div>
              </div>

              {/* Primary Direct Navigation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('catwalk');
                    fetchCatwalk('ADMIN');
                  }}
                  className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm sm:text-base py-4 px-5 rounded-2xl shadow-xl shadow-orange-600/30 border border-orange-400/40 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Eye className="w-5 h-5 text-purple-950" />
                  <span>🎭 Ver Pasarela & Votos en Directo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCeremonyModal(true)}
                  className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 text-white font-extrabold text-sm sm:text-base py-4 px-5 rounded-2xl shadow-xl shadow-amber-500/30 border border-amber-300/40 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Trophy className="w-5 h-5 text-yellow-200" />
                  <span>🎬 Proyectar Gala de Ganadores</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-[#140b24] border-2 border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <span>Acciones Rápidas del Anfitrión</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Catwalk Unlock Toggle */}
                <button
                  type="button"
                  onClick={handleHostToggleCatwalk}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    isUnlocked
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-purple-950/60 border-purple-500/30 text-purple-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isUnlocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-purple-400" />}
                    <span>{isUnlocked ? 'Pasarela Abierta' : 'Pasarela Bloqueada (22:00)'}</span>
                  </span>
                  <span className="text-[10px] underline">{isUnlocked ? 'Bloquear' : 'Desbloquear Ya'}</span>
                </button>

                {/* Voting Finalize Toggle */}
                <button
                  type="button"
                  onClick={handleHostToggleFinalize}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    votingFinalized
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                      : 'bg-purple-950/60 border-purple-500/30 text-purple-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{votingFinalized ? 'Podio Cerrado' : 'Votación En Curso'}</span>
                  </span>
                  <span className="text-[10px] underline">{votingFinalized ? 'Reabrir' : 'Cerrar Podio'}</span>
                </button>
              </div>

              {/* Seed & Reset Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleHostSeed}
                  disabled={isLoadingHostUsers}
                  className="sm:col-span-2 flex items-center justify-center gap-2 bg-purple-900/80 hover:bg-purple-800 border border-purple-500/40 text-purple-100 py-3 px-4 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow"
                >
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>{isLoadingHostUsers ? 'Cargando...' : 'Cargar 5 Amigos de Prueba con Fotos y Votos'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHostShowResetConfirm(true)}
                  className="flex items-center justify-center gap-1.5 bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-red-300 py-3 px-4 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpiar Fiesta</span>
                </button>
              </div>

              {/* Inline Reset Confirmation */}
              {hostShowResetConfirm && (
                <div className="p-3.5 bg-red-950/95 border-2 border-red-500 rounded-2xl text-xs space-y-2.5 shadow-2xl animate-in fade-in zoom-in-95">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-red-400" />
                    <span>¿Reiniciar fiesta y vaciar la lista por completo?</span>
                  </div>
                  <p className="text-red-200 text-[11px]">
                    Se borrarán todos los participantes registrados, votos, fotos y la pasarela se volverá a bloquear hasta las 22:00.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setHostShowResetConfirm(false)}
                      className="px-3.5 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleHostReset}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold shadow cursor-pointer"
                    >
                      Sí, Vaciar Todo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Registered Guests Management List */}
            <div className="bg-[#140b24] border-2 border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span>Lista de Invitados Registrados ({hostUsers.length})</span>
                </h3>

                <button
                  type="button"
                  onClick={() => fetchHostUsers(true)}
                  disabled={isLoadingHostUsers}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-400 hover:text-orange-300 bg-purple-950/80 border border-purple-500/30 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                >
                  <RotateCcw className={`w-3 h-3 ${isLoadingHostUsers ? 'animate-spin' : ''}`} />
                  <span>{isLoadingHostUsers ? 'Cargando...' : 'Actualizar'}</span>
                </button>
              </div>

              {/* Inline Delete Confirmation */}
              {hostUserToDelete && (
                <div className="p-3.5 bg-red-950/95 border-2 border-red-500 rounded-2xl text-xs space-y-2.5 shadow-2xl animate-in fade-in zoom-in-95">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>¿Eliminar a {hostUserToDelete.name} ({hostUserToDelete.code})?</span>
                  </div>
                  <p className="text-red-200 text-[11px]">
                    Se borrará de la lista, de la pasarela y se eliminarán todos sus votos y fotos.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setHostUserToDelete(null)}
                      className="px-3.5 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHostDeleteUser(hostUserToDelete.code, hostUserToDelete.name)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold shadow cursor-pointer"
                    >
                      Sí, Eliminar
                    </button>
                  </div>
                </div>
              )}

              {/* Guests List */}
              {hostUsers.length === 0 ? (
                <div className="text-center py-8 text-xs text-purple-400 bg-purple-950/20 rounded-2xl border border-purple-500/20 space-y-2">
                  <p className="italic">No hay invitados registrados en la base de datos todavía.</p>
                  <button
                    type="button"
                    onClick={handleHostSeed}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-orange-400 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cargar 5 invitados de prueba para simular</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {(hostUsers || []).filter(u => Boolean(u && u.code)).map((u) => (
                    <div
                      key={u.code}
                      className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-500/40 text-xs transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-purple-100 flex items-center gap-2">
                          <span>{u.name}</span>
                          {u.confirmed ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                              Confirmado
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                              Eligiendo
                            </span>
                          )}
                          {u.photoUrl && <span title="Foto en pasarela">📸</span>}
                        </div>
                        <div className="text-[11px] text-orange-400 font-medium">
                          {u.character?.name || u.characterId}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <div className="font-mono text-purple-200 font-bold bg-black/60 px-2.5 py-1 rounded-lg border border-purple-500/30 text-xs">
                            {u.code}
                          </div>
                          <div className="text-[10px] text-purple-400 mt-0.5">
                            {u.rollsLeft} cambios rest.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setHostUserToDelete({ code: u.code, name: u.name })}
                          className="p-2 rounded-xl bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white border border-red-500/30 transition-colors cursor-pointer"
                          title={`Eliminar a ${u.name} (${u.code})`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Admin Exit Bar */}
            <div className="flex items-center justify-between p-4 bg-purple-950/30 border border-purple-500/20 rounded-2xl text-xs">
              <span className="text-purple-400 font-medium">
                Sesión de anfitrión activa (Nico)
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSuperAdmin(false);
                  localStorage.removeItem('hlw_is_superadmin');
                  setShowHostModal(false);
                  setActiveView('home');
                }}
                className="px-3.5 py-1.5 bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Cerrar Sesión de Admin
              </button>
            </div>
          </div>
        )}

        {/* ----------------- SUPERADMIN GUEST VIEW PREVIEW BANNER ('home' view when superadmin) ----------------- */}
        {isSuperAdmin && activeView === 'home' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 flex items-center justify-between gap-3 text-amber-200 max-w-xl mx-auto shadow-xl">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white">Vista previa de cómo lo ven los invitados</span>
                <p className="text-amber-300/80">Estás simulando la pantalla de inicio sin privilegios de admin.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveView('admin');
                fetchHostUsers();
              }}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl shadow cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              ⚙️ Volver a Vista Admin
            </button>
          </div>
        )}

        {/* ----------------- VIEW 2: CHARACTER ASSIGNMENT (Deciding / Rerolls) ----------------- */}
        {activeView === 'home' && user && !user.confirmed && character && !isSuperAdmin && (
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                ¡Hola, {user.name}! Tu destino te espera:
              </span>
              <h2 className="font-creepster text-3xl sm:text-4xl text-purple-100">
                PERSONAJE ASIGNADO
              </h2>
            </div>

            <CharacterCard
              character={character}
              isConfirmed={false}
              rollsLeft={user.rollsLeft}
              onReroll={handleReroll}
              onConfirm={handleConfirmCharacter}
              isRerolling={isRerolling}
              isConfirming={isConfirming}
            />
          </div>
        )}

        {/* ----------------- VIEW 3: SECRET LOCKDOWN & CHARACTER CARD (Confirmed user) ----------------- */}
        {activeView === 'home' && user && user.confirmed && character && !isSuperAdmin && (
          <div className="space-y-6 max-w-xl mx-auto">
            {/* Direct jump to Catwalk if unlocked, or countdown locked message */}
            {isUnlocked ? (
              <div className="bg-gradient-to-r from-emerald-950/80 via-purple-950 to-orange-950/80 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 text-center glow-box-orange space-y-3">
                <div className="inline-flex items-center gap-2 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>¡LA PASARELA ESTÁ ABIERTA!</span>
                </div>
                <h2 className="font-creepster text-3xl sm:text-4xl text-orange-400 text-glow-orange">
                  ¡HORA DEL DESFILE Y VOTACIONES!
                </h2>
                <p className="text-xs sm:text-sm text-purple-200">
                  Sube tu foto con el disfraz, adivina quién es quién y vota a los mejores de la noche.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('catwalk');
                    fetchCatwalk(user.code);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white text-base font-extrabold py-4 px-6 rounded-2xl cursor-pointer shadow-xl shadow-orange-600/30 border border-orange-400/40 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Eye className="w-5 h-5 text-purple-950" />
                  <span>🎭 Entrar a La Pasarela y Votación en Vivo</span>
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-red-950/90 via-purple-950 to-orange-950/90 border-2 border-red-500/50 rounded-3xl p-5 sm:p-6 text-center glow-box-orange">
                <div className="inline-flex items-center gap-2 bg-red-600/30 text-red-300 border border-red-500/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                  <ShieldAlert className="w-4 h-4 text-orange-400 animate-pulse" />
                  <span>¡SECRETO MÁXIMO ACTIVADO!</span>
                </div>
                <h2 className="font-creepster text-3xl sm:text-4xl text-orange-400 text-glow-orange tracking-wide">
                  APLICACIÓN BLOQUEADA HASTA LA FIESTA
                </h2>
                <p className="text-xs sm:text-sm text-purple-200 mt-2 leading-relaxed">
                  ¡Enhorabuena, {user.name}! Tu personaje ya está adjudicado para ti. Guarda bien el secreto: <span className="text-orange-400 font-bold">¡habrá premios para quien más disfraces adivine y para los mejores disfraces en la pasarela!</span>
                </p>
              </div>
            )}

            {/* Secret Code Card (Must save) */}
            <div className="bg-[#160d26] border-2 border-orange-500/40 rounded-3xl p-5 glow-box-orange">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <KeyRound className="w-4 h-4 text-orange-400" />
                    <span>Tu Código Único de Participante</span>
                  </div>
                  <p className="text-xs text-purple-400 mt-0.5">
                    Guárdalo en tus notas para entrar desde cualquier móvil sin perder tu personaje.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="font-mono text-xl sm:text-2xl font-black text-orange-400 tracking-wider bg-black/60 border border-orange-500/40 px-4 py-2 rounded-2xl shadow-inner">
                    {user.code}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2.5 px-4 rounded-2xl shadow-lg cursor-pointer transition-colors"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Countdown until Catwalk Opens */}
            {!isUnlocked && (
              <CountdownTimer targetDateStr={partyDate} onUnlocked={() => setIsUnlocked(true)} />
            )}

            {/* Assigned Character Card with Hide/Reveal toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Tu Ficha Secreta de Disfraz:
                </span>
                <span className="text-[11px] text-orange-400">
                  👀 Tapa la pantalla si hay alguien cerca
                </span>
              </div>

              <CharacterCard
                character={character}
                isConfirmed={true}
                allowHide={true}
              />
            </div>
          </div>
        )}

        {/* ----------------- VIEW 4: LA PASARELA (Catwalk & Guessing & Live Voting) ----------------- */}
        {activeView === 'catwalk' && (
          <div className="space-y-4">
            {isSuperAdmin && (
              <div className="bg-amber-950/90 border-2 border-amber-500/60 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl glow-box-orange">
                <div className="flex items-center gap-2.5 text-center sm:text-left">
                  <Crown className="w-5 h-5 text-amber-400 animate-bounce shrink-0" />
                  <div>
                    <span className="font-black text-xs sm:text-sm text-white">MODO SUPERADMIN OBSERVADOR</span>
                    <p className="text-[11px] text-amber-300/80">Estás en la pasarela en vivo. Puedes probar votos o volver al panel de control.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('admin');
                    fetchHostUsers();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Crown className="w-3.5 h-3.5 text-yellow-200" />
                  <span>⚙️ Ir a Vista Admin (Control Total)</span>
                </button>
              </div>
            )}

            <CatwalkRunway
              myCode={isSuperAdmin ? (user?.code || 'ADMIN') : (user?.code || '')}
              myName={isSuperAdmin ? (user?.name || 'Nico (Superadmin)') : (user?.name || '')}
              myCharacterName={isSuperAdmin ? (character?.name || 'Anfitrión Observador') : (character?.name || '')}
              myCurrentPhotoUrl={user?.photoUrl}
              contestants={contestants}
              allSubmitted={allSubmitted}
              totalRegistered={totalRegistered}
              submittedCount={submittedCount}
              votingFinalized={votingFinalized}
              myScore={myScore}
              detectiveScores={detectiveScores}
              cutreWinner={cutreWinner}
              onUploadPhoto={handleUploadPhoto}
              onVote={handleVote}
              onGuess={handleGuess}
              onVoteCutre={handleVoteCutre}
              onRefresh={() => fetchCatwalk(isSuperAdmin ? (user?.code || 'ADMIN') : user?.code)}
              onOpenCeremony={() => setShowCeremonyModal(true)}
              onGoToLogin={() => {
                setActiveView('home');
                if (!user && !isSuperAdmin) {
                  setShowCodeLogin(true);
                }
              }}
              onSwitchUser={(code) => {
                fetchUserByCode(code);
              }}
            />
          </div>
        )}
      </main>

      {/* Host Modal with direct ceremony and catwalk jump */}
      <HostModal
        isOpen={showHostModal}
        onClose={() => setShowHostModal(false)}
        onSuperadminAuth={() => {
          setIsSuperAdmin(true);
          localStorage.setItem('hlw_is_superadmin', 'true');
          setActiveView('admin');
          fetchCatwalk('ADMIN');
          fetchHostUsers();
        }}
      />

      {/* Cinematic Winners Ceremony Video Effect Modal */}
      <WinnersCeremonyModal
        isOpen={showCeremonyModal}
        onClose={() => setShowCeremonyModal(false)}
        contestants={contestants}
        detectiveScores={detectiveScores}
        cutreWinner={cutreWinner}
      />
    </div>
  );
}
