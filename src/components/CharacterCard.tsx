import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Sparkles, 
  Scissors, 
  Coins, 
  Skull, 
  RefreshCw, 
  CheckCircle2, 
  Shirt, 
  Smile, 
  Wrench, 
  Lightbulb 
} from 'lucide-react';
import { Character } from '../data/characters.ts';

interface CharacterCardProps {
  character: Character;
  isConfirmed?: boolean;
  rollsLeft?: number;
  onReroll?: () => void;
  onConfirm?: () => void;
  isRerolling?: boolean;
  isConfirming?: boolean;
  allowHide?: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isConfirmed = false,
  rollsLeft = 0,
  onReroll,
  onConfirm,
  isRerolling = false,
  isConfirming = false,
  allowHide = false
}) => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(true);
  const [imgSrc, setImgSrc] = useState<string>(character.imageUrl);
  const [hasTriedSearch, setHasTriedSearch] = useState<boolean>(false);

  useEffect(() => {
    if (character.imageUrl && !character.imageUrl.includes('unsplash.com')) {
      setImgSrc(character.imageUrl);
      setHasTriedSearch(false);
    } else {
      let active = true;
      const fetchImage = async () => {
        try {
          const query = `${character.name} ${character.source || ''}`;
          const res = await fetch(`/api/search-image?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            if (active && data.imageUrl) {
              setImgSrc(data.imageUrl);
              return;
            }
          }
        } catch (e) {
          console.warn('Auto search error:', e);
        }
        if (active) {
          setImgSrc(character.imageUrl || 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=800&q=80');
        }
      };
      fetchImage();
      return () => {
        active = false;
      };
    }
  }, [character.id, character.imageUrl, character.name, character.source]);

  const handleImageError = async () => {
    if (!hasTriedSearch) {
      setHasTriedSearch(true);
      try {
        const query = `${character.name} ${character.source || ''}`;
        const res = await fetch(`/api/search-image?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl && data.imageUrl !== imgSrc) {
            setImgSrc(data.imageUrl);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed dynamic search for character image:', e);
      }
    }
    // High-contrast atmospheric fallback
    setImgSrc('https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=800&q=80');
  };

  return (
    <div className="relative bg-[#150c26] border-2 border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl glow-box-purple transition-all duration-300">
      {/* Privacy curtain if user hides character from peeking friends */}
      {allowHide && isHidden ? (
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[360px] bg-gradient-to-b from-[#180d2c] to-[#0c0517]">
          <div className="w-16 h-16 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-4 animate-pulse">
            <EyeOff className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="font-creepster text-2xl text-purple-200 text-glow-purple tracking-wide">
            IDENTIDAD PROTEGIDA
          </h3>
          <p className="text-xs text-purple-300/80 max-w-xs mt-2 mb-6">
            Tu personaje está oculto para que nadie que esté mirando tu pantalla pueda descubrir de qué vas disfrazado.
          </p>
          <button
            onClick={() => setIsHidden(false)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Revelar solo para mí</span>
          </button>
        </div>
      ) : (
        <>
          {/* Top Bar with tags & privacy button */}
          <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-purple-500/20 bg-purple-950/40">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {character.category}
              </span>
              <span className="text-xs text-purple-300/80 font-medium truncate max-w-[150px] sm:max-w-none">
                {character.source}
              </span>
            </div>

            {allowHide && (
              <button
                onClick={() => setIsHidden(true)}
                className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-orange-400 bg-purple-900/40 border border-purple-500/30 px-3 py-1 rounded-full transition-colors cursor-pointer"
                title="Tapar para que no miren"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ocultar de miradas</span>
              </button>
            )}
          </div>

          {/* Character Photo & Title */}
          <div className="relative">
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black flex items-center justify-center">
              <img
                src={imgSrc}
                alt={character.name}
                onError={handleImageError}
                className="w-full h-full object-cover object-center filter contrast-110 brightness-95 transform hover:scale-105 transition-transform duration-700"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#150c26] via-[#150c26]/20 to-transparent" />

              {/* Difficulty & Cost Badges on the image */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 bg-black/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
                  <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                  {character.difficulty}
                </span>
                <span className="flex items-center gap-1 bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-medium">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  Coste: {character.estimatedCost}
                </span>
              </div>
            </div>

            <div className="px-5 pt-3 pb-2 text-center">
              <h2 className="font-creepster text-3xl sm:text-4xl text-orange-400 text-glow-orange tracking-wide">
                {character.name}
              </h2>
              <p className="italic text-xs sm:text-sm text-purple-200/90 font-serif mt-1 max-w-md mx-auto">
                "{character.quote}"
              </p>
              <p className="text-xs text-purple-300/80 mt-2 leading-relaxed">
                {character.description}
              </p>
            </div>
          </div>

          {/* QUICK VISUAL COSTUME BLUEPRINT */}
          {character.costumeBreakdown && (
            <div className="px-4 sm:px-6 py-2.5">
              <div className="text-xs sm:text-sm font-extrabold text-orange-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Guía Rápida para Armar tu Disfraz:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {/* 1. Rostro y Pelo */}
                <div className="bg-purple-950/60 border border-purple-500/30 rounded-2xl p-3">
                  <div className="text-xs sm:text-sm font-bold text-purple-200 flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Rostro & Pelo</span>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-300 mt-1 leading-relaxed">
                    {character.costumeBreakdown.faceAndHair}
                  </p>
                </div>

                {/* 2. Ropa & Traje */}
                <div className="bg-purple-950/60 border border-purple-500/30 rounded-2xl p-3">
                  <div className="text-xs sm:text-sm font-bold text-purple-200 flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Ropa & Traje</span>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-300 mt-1 leading-relaxed">
                    {character.costumeBreakdown.clothing}
                  </p>
                </div>

                {/* 3. Objeto Clave */}
                <div className="bg-purple-950/60 border border-purple-500/30 rounded-2xl p-3">
                  <div className="text-xs sm:text-sm font-bold text-purple-200 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Objeto Clave</span>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-300 mt-1 leading-relaxed">
                    {character.costumeBreakdown.signatureProp}
                  </p>
                </div>

                {/* 4. Truco 0€ */}
                <div className="bg-purple-950/60 border border-purple-500/30 rounded-2xl p-3">
                  <div className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Truco 0€</span>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-300 mt-1 leading-relaxed">
                    {character.costumeBreakdown.zeroEuroHack}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Secret Party Mission Box */}
          <div className="mx-4 sm:mx-6 my-2.5 p-4 rounded-2xl bg-gradient-to-r from-red-950/50 via-purple-950/60 to-orange-950/50 border border-orange-500/40 text-left">
            <div className="flex items-center gap-2 text-orange-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
              <Skull className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Tu Misión Secreta para la Fiesta en Casa de Nico:</span>
            </div>
            <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed">
              {character.secretMission}
            </p>
          </div>

          {/* Detailed Low Cost Tips Section */}
          <div className="p-4 sm:p-6 pt-2 border-t border-purple-500/20 bg-purple-950/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
                <Scissors className="w-4 h-4 text-orange-400" />
                <span>Consejos Caseros Paso a Paso</span>
              </div>
              <button
                onClick={() => setShowTips(!showTips)}
                className="text-xs sm:text-sm text-purple-300 hover:text-white underline cursor-pointer"
              >
                {showTips ? 'Plegar' : 'Ver trucos'}
              </button>
            </div>

            {showTips && (
              <div className="space-y-2.5 text-left">
                {character.diyTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-purple-900/40 border border-purple-500/20 hover:border-purple-400/40 transition-colors"
                  >
                    <div className="text-xs sm:text-sm font-bold text-purple-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                      {tip.material}:
                    </div>
                    <div className="text-xs sm:text-sm text-purple-300/90 mt-1 pl-3.5 leading-relaxed">
                      {tip.instructions}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignment Controls (Reroll & Confirm) */}
          {!isConfirmed && onReroll && onConfirm && (
            <div className="p-4 sm:p-6 border-t border-purple-500/30 bg-[#120822] flex flex-col gap-3.5">
              <div className="flex items-center justify-between text-xs sm:text-sm text-purple-300">
                <span>¿Te convence este espíritu?</span>
                <span className="font-extrabold text-orange-400">
                  {rollsLeft > 0 ? `Te quedan ${rollsLeft} cambios` : '¡Última opción!'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={onReroll}
                  disabled={rollsLeft <= 0 || isRerolling}
                  className={`flex items-center justify-center gap-2 py-3.5 sm:py-4 px-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
                    rollsLeft > 0 && !isRerolling
                      ? 'bg-purple-900/70 hover:bg-purple-800 text-purple-100 border border-purple-500/40 hover:border-orange-500/50 cursor-pointer shadow-lg'
                      : 'bg-purple-950/40 text-purple-600 border border-purple-900/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isRerolling ? 'animate-spin text-orange-400' : ''}`} />
                  <span>{rollsLeft > 0 ? `Cambiar personaje (${rollsLeft}/2)` : 'Sin cambios restantes'}</span>
                </button>

                <button
                  onClick={onConfirm}
                  disabled={isConfirming}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-[0.98] text-white py-3.5 sm:py-4 px-4 rounded-2xl text-sm sm:text-base font-extrabold shadow-xl shadow-orange-600/40 border border-orange-400/40 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>¡Acepto mi personaje!</span>
                </button>
              </div>

              <p className="text-xs text-center text-purple-300/80 leading-relaxed">
                ⚠️ Una vez confirmado, se retirará del bombo para que nadie más se disfrace de él.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
