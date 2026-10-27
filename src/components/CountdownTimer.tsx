import React, { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface CountdownTimerProps {
  targetDateStr?: string;
  onUnlocked?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPassed: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDateStr = '2026-10-30T22:00:00',
  onUnlocked
}) => {
  const calculateTimeLeft = (): TimeLeft => {
    const target = new Date(targetDateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isPassed: false };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isPassed && onUnlocked) {
        onUnlocked();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr, onUnlocked]);

  if (timeLeft.isPassed) {
    return (
      <div className="bg-gradient-to-r from-orange-950/70 via-purple-950/80 to-orange-950/70 border border-orange-500/50 rounded-2xl p-4 text-center glow-box-orange">
        <div className="flex items-center justify-center gap-2 text-orange-400 font-creepster text-2xl tracking-wider">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>¡LA HORA HA LLEGADO!</span>
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-sm text-purple-200 mt-1">
          La pasarela en Casa de Nico está oficialmente abierta. ¡A desfilar y votar!
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#130a21]/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 glow-box-purple backdrop-blur-md">
      {/* Background glow circle */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-center gap-2 mb-3 text-orange-400 text-xs font-semibold uppercase tracking-widest">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>Apertura de La Pasarela</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
        {/* Days */}
        <div className="bg-purple-950/60 border border-purple-500/20 rounded-xl p-2 sm:p-3">
          <div className="font-creepster text-2xl sm:text-3xl text-orange-400 text-glow-orange leading-tight">
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-purple-300 font-medium uppercase mt-0.5">Días</div>
        </div>

        {/* Hours */}
        <div className="bg-purple-950/60 border border-purple-500/20 rounded-xl p-2 sm:p-3">
          <div className="font-creepster text-2xl sm:text-3xl text-purple-300 text-glow-purple leading-tight">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-purple-300 font-medium uppercase mt-0.5">Horas</div>
        </div>

        {/* Minutes */}
        <div className="bg-purple-950/60 border border-purple-500/20 rounded-xl p-2 sm:p-3">
          <div className="font-creepster text-2xl sm:text-3xl text-orange-400 text-glow-orange leading-tight">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-purple-300 font-medium uppercase mt-0.5">Min</div>
        </div>

        {/* Seconds */}
        <div className="bg-purple-950/60 border border-purple-500/20 rounded-xl p-2 sm:p-3">
          <div className="font-creepster text-2xl sm:text-3xl text-purple-200 text-glow-purple leading-tight">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-purple-300 font-medium uppercase mt-0.5">Seg</div>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-xs text-purple-300/80 font-medium">
          Viernes 30 de Octubre a las <span className="text-orange-400 font-bold">22:00</span> • Casa de Nico
        </p>
      </div>
    </div>
  );
};
