import React, { useState, useEffect } from 'react';
import { Skull, X, KeyRound, ArrowRight } from 'lucide-react';

interface HostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuperadminAuth?: () => void;
  isUnlocked?: boolean;
  votingFinalized?: boolean;
  onToggleCatwalk?: () => Promise<void>;
  onToggleFinalize?: () => Promise<void>;
  onSeedDemo?: () => Promise<void>;
  onReset?: () => Promise<void>;
  onOpenCatwalk?: () => void;
  onOpenCeremony?: () => void;
  isSuperAdmin?: boolean;
  onHostLogout?: () => void;
}

export const HostModal: React.FC<HostModalProps> = ({
  isOpen,
  onClose,
  onSuperadminAuth
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset inputs whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().toLowerCase() === 'nico1234') {
      setErrorMsg(null);
      setPin('');
      onSuperadminAuth?.();
      onClose();
    } else {
      setErrorMsg('Contraseña incorrecta');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-[#160a2b] border-2 border-orange-500/60 rounded-3xl p-6 shadow-2xl glow-box-orange">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-300 hover:text-white w-9 h-9 flex items-center justify-center rounded-full bg-purple-900/60 border border-purple-500/30 cursor-pointer active:scale-95 transition-all"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 text-orange-400 mb-2">
          <div className="p-2.5 rounded-2xl bg-orange-500/20 border border-orange-500/40">
            <Skull className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-orange-400 uppercase">
              ACCESO RESTRINGIDO
            </span>
            <h3 className="font-creepster text-2xl text-orange-400 tracking-wide">
              PANEL DEL ANFITRIÓN
            </h3>
          </div>
        </div>

        <p className="text-xs text-purple-300/90 mb-5 leading-relaxed">
          Ingresa la contraseña de anfitrión para acceder a la gestión de la fiesta en Casa de Nico.
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-orange-400" />
              <span>Contraseña:</span>
            </label>
            <input
              type="password"
              autoFocus
              placeholder="••••••••"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              className="w-full bg-purple-950/70 border-2 border-purple-500/40 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-base text-purple-100 placeholder-purple-500/50 outline-none transition-colors shadow-inner font-mono tracking-widest"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-300 font-semibold animate-in shake">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-purple-300 hover:text-white bg-purple-950/50 border border-purple-500/30 cursor-pointer transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!pin.trim()}
              className="flex-2 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-extrabold py-3 px-5 rounded-2xl text-xs cursor-pointer active:scale-95 transition-all shadow-lg shadow-orange-600/30 border border-orange-400/40"
            >
              <span>Acceder al Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
