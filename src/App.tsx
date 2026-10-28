/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Film
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
  
  // Navigation active view ('home' for registration/lockdown, 'catwalk' for live runway & voting)
  const [activeView, setActiveView] = useState<'home' | 'catwalk'>('home');
  const [showCeremonyModal, setShowCeremonyModal] = useState<boolean>(false);

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

function generateLocalCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = 'HLW-';
  for (let i = 0; i < 4; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

  // Restore saved session from localStorage on startup
  useEffect(() => {
    const savedCode = localStorage.getItem('hlw_party_code');
    if (savedCode) {
      fetchUserByCode(savedCode);
    }
    fetchPartyStatus();
    fetchCatwalk();
  }, []);

  const fetchPartyStatus = async () => {
    try {
      const res = await safeFetchJson<{
        isUnlocked: boolean;
        partyDate: string;
        partyLocation: string;
        votingFinalized: boolean;
      }>('/api/status');
      if (res.ok && res.data) {
        setIsUnlocked(res.data.isUnlocked);
        setPartyDate(res.data.partyDate || '2026-10-30T22:00:00');
        setPartyLocation(res.data.partyLocation);
        setVotingFinalized(res.data.votingFinalized);
      }
    } catch {
      // quiet fallback
    }
  };

  // Strictly enforce that users cannot be on catwalk view if catwalk is locked
  useEffect(() => {
    if (!isUnlocked && activeView === 'catwalk') {
      setActiveView('home');
    }
  }, [isUnlocked, activeView]);

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
        myScore: number;
        detectiveScores: DetectiveScore[];
        cutreWinner: CutreWinner | null;
      }>(`/api/catwalk${query}`);
      if (res.ok && res.data) {
        setContestants(res.data.contestants || []);
        setIsUnlocked(res.data.isUnlocked);
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

  // Periodic polling for real-time live synchronization (every 1.5 seconds)
  useEffect(() => {
    fetchCatwalk(user?.code);
    const interval = setInterval(() => {
      fetchCatwalk(user?.code);
      fetchPartyStatus();
    }, 1500);
    return () => clearInterval(interval);
  }, [user?.code, fetchCatwalk]);

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
        // Fallback to local storage if API returned error
        const savedCode = localStorage.getItem('hlw_party_code');
        const savedUserStr = localStorage.getItem('hlw_local_user');
        const savedCharStr = localStorage.getItem('hlw_local_character');
        if (savedCode === code.trim() && savedUserStr) {
          try {
            const parsedUser = JSON.parse(savedUserStr);
            const parsedChar = savedCharStr
              ? JSON.parse(savedCharStr)
              : (HALLOWEEN_CHARACTERS.find(c => c.id === parsedUser.characterId) || null);
            setUser(parsedUser);
            setCharacter(parsedChar);
            setShowCodeLogin(false);
            return;
          } catch {
            // ignore
          }
        }
        setErrorMsg(res.error || 'Código incorrecto o no encontrado');
        localStorage.removeItem('hlw_party_code');
      }
    } catch {
      const savedCode = localStorage.getItem('hlw_party_code');
      const savedUserStr = localStorage.getItem('hlw_local_user');
      const savedCharStr = localStorage.getItem('hlw_local_character');
      if (savedCode === code.trim() && savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          const parsedChar = savedCharStr
            ? JSON.parse(savedCharStr)
            : (HALLOWEEN_CHARACTERS.find(c => c.id === parsedUser.characterId) || null);
          setUser(parsedUser);
          setCharacter(parsedChar);
          setShowCodeLogin(false);
          return;
        } catch {
          // ignore
        }
      }
      setErrorMsg('Error al conectar con el servidor');
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
        // Fallback: If server is unavailable, assign immediately from catalog
        const randomChar = HALLOWEEN_CHARACTERS[Math.floor(Math.random() * HALLOWEEN_CHARACTERS.length)];
        const localCode = generateLocalCode();
        const fallbackUser: UserData = {
          code: localCode,
          name: cleanName,
          characterId: randomChar.id,
          confirmed: false,
          rollsLeft: 2,
          registeredAt: Date.now()
        };
        setUser(fallbackUser);
        setCharacter(randomChar);
        localStorage.setItem('hlw_party_code', localCode);
        localStorage.setItem('hlw_local_user', JSON.stringify(fallbackUser));
        localStorage.setItem('hlw_local_character', JSON.stringify(randomChar));
        halloweenAudio.playCreepyLaugh();
      }
    } catch {
      const randomChar = HALLOWEEN_CHARACTERS[Math.floor(Math.random() * HALLOWEEN_CHARACTERS.length)];
      const localCode = generateLocalCode();
      const fallbackUser: UserData = {
        code: localCode,
        name: cleanName,
        characterId: randomChar.id,
        confirmed: false,
        rollsLeft: 2,
        registeredAt: Date.now()
      };
      setUser(fallbackUser);
      setCharacter(randomChar);
      localStorage.setItem('hlw_party_code', localCode);
      localStorage.setItem('hlw_local_user', JSON.stringify(fallbackUser));
      localStorage.setItem('hlw_local_character', JSON.stringify(randomChar));
      halloweenAudio.playCreepyLaugh();
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
        setErrorMsg(res.data.error || 'Este nombre ya está registrado.');
        setShowCodeLogin(true);
      } else {
        const customChar: Character = {
          id: `custom_${Date.now()}`,
          name: cleanCharName,
          category: 'Cine de Terror',
          source: customCharSource.trim() || 'Sugerencia libre',
          quote: '¡Esta noche de Halloween es mía!',
          description: `Personaje sugerido especialmente para la fiesta en Casa de Nico.`,
          imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=800&q=80',
          difficulty: 'Creativo Low-Cost',
          estimatedCost: '0€ - 3€',
          costumeBreakdown: {
            faceAndHair: 'Caracterízate con peinado o maquillaje icónico.',
            clothing: 'Prendas clave en tu armario que simulen el atuendo representativo.',
            signatureProp: 'El accesorio u objeto inconfundible del personaje.',
            zeroEuroHack: 'Usa cartón, tijeras y ropa reciclada de casa.'
          },
          diyTips: [
            { material: 'Ropa base', instructions: 'Revisa tu armario buscando los colores y cortes más parecidos.' },
            { material: 'Atrezzo con cartón', instructions: 'Recorta en cartón los accesorios clave.' }
          ],
          secretMission: `Actúa como ${cleanCharName} en algún momento de la fiesta.`
        };
        const localCode = generateLocalCode();
        const fallbackUser: UserData = {
          code: localCode,
          name: cleanName,
          characterId: customChar.id,
          confirmed: false,
          rollsLeft: 2,
          registeredAt: Date.now()
        };
        setUser(fallbackUser);
        setCharacter(customChar);
        localStorage.setItem('hlw_party_code', localCode);
        localStorage.setItem('hlw_local_user', JSON.stringify(fallbackUser));
        localStorage.setItem('hlw_local_character', JSON.stringify(customChar));
        halloweenAudio.playCreepyLaugh();
      }
    } catch {
      const customChar: Character = {
        id: `custom_${Date.now()}`,
        name: cleanCharName,
        category: 'Cine de Terror',
        source: customCharSource.trim() || 'Sugerencia libre',
        quote: '¡Esta noche de Halloween es mía!',
        description: `Personaje sugerido especialmente para la fiesta en Casa de Nico.`,
        imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=800&q=80',
        difficulty: 'Creativo Low-Cost',
        estimatedCost: '0€ - 3€',
        costumeBreakdown: {
          faceAndHair: 'Caracterízate con peinado o maquillaje icónico.',
          clothing: 'Prendas clave en tu armario que simulen el atuendo representativo.',
          signatureProp: 'El accesorio u objeto inconfundible del personaje.',
          zeroEuroHack: 'Usa cartón, tijeras y ropa reciclada de casa.'
        },
        diyTips: [
          { material: 'Ropa base', instructions: 'Revisa tu armario buscando los colores y cortes más parecidos.' },
          { material: 'Atrezzo con cartón', instructions: 'Recorta en cartón los accesorios clave.' }
        ],
        secretMission: `Actúa como ${cleanCharName} en algún momento de la fiesta.`
      };
      const localCode = generateLocalCode();
      const fallbackUser: UserData = {
        code: localCode,
        name: cleanName,
        characterId: customChar.id,
        confirmed: false,
        rollsLeft: 2,
        registeredAt: Date.now()
      };
      setUser(fallbackUser);
      setCharacter(customChar);
      localStorage.setItem('hlw_party_code', localCode);
      localStorage.setItem('hlw_local_user', JSON.stringify(fallbackUser));
      localStorage.setItem('hlw_local_character', JSON.stringify(customChar));
      halloweenAudio.playCreepyLaugh();
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
    if (!user) return;
    await safeFetchJson('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voterCode: user.code,
        targetCode,
        score
      })
    });
    await fetchCatwalk(user.code);
  };

  const handleGuess = async (targetCode: string, guessText: string) => {
    if (!user) return;
    await safeFetchJson('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guesserCode: user.code,
        targetCode,
        guessText
      })
    });
    await fetchCatwalk(user.code);
  };

  const handleVoteCutre = async (targetCode: string) => {
    if (!user) return;
    await safeFetchJson('/api/vote-cutre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voterCode: user.code,
        targetCode
      })
    });
    await fetchCatwalk(user.code);
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

          {/* Catwalk / Live Voting nav button or locked badge */}
          {!isUnlocked ? (
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
              onClick={() => setShowHostModal(true)}
              className="p-1.5 sm:p-2 rounded-full bg-purple-950/90 border border-purple-500/40 text-purple-300 hover:text-orange-400 hover:border-orange-500/50 transition-colors cursor-pointer"
              title="Panel del anfitrión (Nico)"
            >
              <Skull className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
            </button>

            {/* User code pill if logged in */}
            {user && (
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
            )}
          </div>
        </div>
      </header>

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
        {!user && (
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

            {/* Catwalk access or lock notification on landing page */}
            {isUnlocked ? (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('catwalk');
                    fetchCatwalk();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white text-sm sm:text-base font-extrabold py-3.5 px-6 rounded-2xl shadow-xl shadow-orange-600/30 border border-orange-400/40 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Eye className="w-5 h-5 text-purple-950" />
                  <span>🎭 Entrar a La Pasarela y Votación en Directo</span>
                </button>
              </div>
            ) : (
              <div className="text-center pt-1">
                <div className="w-full inline-flex items-center justify-center gap-2.5 bg-purple-950/70 border border-purple-500/30 text-purple-200 text-xs sm:text-sm font-semibold py-3 px-4 rounded-2xl shadow-md">
                  <Lock className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Juegos y Pasarela estrictamente bloqueados hasta las 22:00</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- VIEW 2: CHARACTER ASSIGNMENT (Deciding / Rerolls) ----------------- */}
        {activeView === 'home' && user && !user.confirmed && character && (
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

        {/* ----------------- VIEW 3: SECRET LOCKDOWN (Confirmed, waiting until 22:00) ----------------- */}
        {activeView === 'home' && user && user.confirmed && character && !isUnlocked && (
          <div className="space-y-6 max-w-xl mx-auto">
            {/* Big Secrecy Warning */}
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

            {/* Direct jump to Catwalk or locked state */}
            {isUnlocked ? (
              <button
                onClick={() => {
                  setActiveView('catwalk');
                  fetchCatwalk(user.code);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white text-base font-extrabold py-4 px-6 rounded-2xl cursor-pointer shadow-xl shadow-orange-600/30 border border-orange-400/40 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Eye className="w-5 h-5 text-purple-950" />
                <span>🎭 Entrar a La Pasarela y Votación en Vivo</span>
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 bg-purple-950/70 border border-purple-500/30 text-purple-200 text-xs sm:text-sm font-semibold py-3.5 px-4 rounded-2xl shadow-md">
                <Lock className="w-4 h-4 text-orange-400 shrink-0" />
                <span>La Pasarela y votaciones se desbloquearán a las 22:00</span>
              </div>
            )}

            {/* Countdown until Catwalk Opens */}
            <CountdownTimer targetDateStr={partyDate} onUnlocked={() => setIsUnlocked(true)} />

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
        {isUnlocked && (activeView === 'catwalk' || (activeView === 'home' && user && user.confirmed && character)) && (
          <CatwalkRunway
            myCode={user?.code || ''}
            myName={user?.name || ''}
            myCharacterName={character?.name || ''}
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
            onRefresh={() => fetchCatwalk(user?.code)}
            onOpenCeremony={() => setShowCeremonyModal(true)}
            onGoToLogin={() => {
              setActiveView('home');
              setShowCodeLogin(true);
            }}
            onSwitchUser={(code) => {
              fetchUserByCode(code);
            }}
          />
        )}
      </main>

      {/* Host Modal with direct ceremony and catwalk jump */}
      <HostModal
        isOpen={showHostModal}
        onClose={() => setShowHostModal(false)}
        isUnlocked={isUnlocked}
        votingFinalized={votingFinalized}
        onToggleCatwalk={async () => {
          const res = await safeFetchJson<{ isUnlocked: boolean }>('/api/host/toggle-catwalk', { method: 'POST' });
          if (res.data) {
            setIsUnlocked(res.data.isUnlocked);
          } else {
            setIsUnlocked(prev => !prev);
          }
          await fetchCatwalk(user?.code);
        }}
        onToggleFinalize={async () => {
          const res = await safeFetchJson<{ votingFinalized: boolean }>('/api/host/toggle-finalize', { method: 'POST' });
          if (res.data) {
            setVotingFinalized(res.data.votingFinalized);
          } else {
            setVotingFinalized(prev => !prev);
          }
          await fetchCatwalk(user?.code);
        }}
        onSeedDemo={async () => {
          const res = await safeFetchJson<{ primaryUser?: UserData; primaryCharacter?: Character }>('/api/host/seed-demo', { method: 'POST' });
          setIsUnlocked(true);
          if (res.data?.primaryUser) {
            setUser(res.data.primaryUser);
            setCharacter(res.data.primaryCharacter || null);
            localStorage.setItem('hlw_party_code', res.data.primaryUser.code);
            localStorage.setItem('hlw_local_user', JSON.stringify(res.data.primaryUser));
            if (res.data.primaryCharacter) {
              localStorage.setItem('hlw_local_character', JSON.stringify(res.data.primaryCharacter));
            }
            await fetchCatwalk(res.data.primaryUser.code);
          } else {
            const ghostface = HALLOWEEN_CHARACTERS.find(c => c.id === 'ghostface') || HALLOWEEN_CHARACTERS[0];
            const primary: UserData = {
              code: 'HLW-VGHZ',
              name: 'Nico (Anfitrión)',
              characterId: ghostface.id,
              confirmed: true,
              rollsLeft: 0,
              photoUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80',
              registeredAt: Date.now()
            };
            setUser(primary);
            setCharacter(ghostface);
            localStorage.setItem('hlw_party_code', primary.code);
            localStorage.setItem('hlw_local_user', JSON.stringify(primary));
            localStorage.setItem('hlw_local_character', JSON.stringify(ghostface));
            await fetchCatwalk(primary.code);
          }
          setActiveView('catwalk');
        }}
        onReset={async () => {
          await safeFetchJson('/api/host/reset', { method: 'POST' });
          setUser(null);
          setCharacter(null);
          localStorage.removeItem('hlw_party_code');
          localStorage.removeItem('hlw_local_user');
          localStorage.removeItem('hlw_local_character');
          setIsUnlocked(false);
          setVotingFinalized(false);
          setActiveView('home');
          await fetchCatwalk();
        }}
        onOpenCatwalk={() => {
          setActiveView('catwalk');
          fetchCatwalk(user?.code);
        }}
        onOpenCeremony={() => {
          setShowCeremonyModal(true);
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
