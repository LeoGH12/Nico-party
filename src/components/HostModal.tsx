import React, { useState } from 'react';
import { Skull, Key, Lock, Unlock, Users, Sparkles, RotateCcw, X, Check, ShieldCheck, Film, Eye, Trophy, Trash2 } from 'lucide-react';

interface HostUser {
  code: string;
  name: string;
  characterId: string;
  confirmed: boolean;
  rollsLeft: number;
  photoUrl?: string;
  registeredAt: number;
  character?: {
    name: string;
    source: string;
  };
}

interface HostModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  votingFinalized: boolean;
  onToggleCatwalk: () => Promise<void>;
  onToggleFinalize: () => Promise<void>;
  onSeedDemo: () => Promise<void>;
  onReset: () => Promise<void>;
  onOpenCatwalk?: () => void;
  onOpenCeremony?: () => void;
}

export const HostModal: React.FC<HostModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  votingFinalized,
  onToggleCatwalk,
  onToggleFinalize,
  onSeedDemo,
  onReset,
  onOpenCatwalk,
  onOpenCeremony
}) => {
  const [pin, setPin] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hostUsers, setHostUsers] = useState<HostUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Strictly password nico1234 - no hints
    if (pin.trim().toLowerCase() === 'nico1234') {
      setIsAuthenticated(true);
      setStatusMsg(null);
      fetchUsers();
    } else {
      setStatusMsg('Contraseña incorrecta');
    }
  };

  const handleDeleteUser = async (code: string, name: string) => {
    if (confirm(`¿Eliminar a ${name} (${code}) de la fiesta? Se borrarán sus votos y foto.`)) {
      try {
        const res = await fetch('/api/host/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok) {
            setStatusMsg(data.message || 'Participante eliminado');
            await fetchUsers();
          } else {
            setStatusMsg(data.error || 'Error al eliminar');
          }
        } else {
          setStatusMsg(res.ok ? 'Participante eliminado' : 'Error al eliminar');
          await fetchUsers();
        }
      } catch (e) {
        console.error(e);
        setStatusMsg('Error al conectar con el servidor');
      }
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/host/all-users');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setHostUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching host data:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSeed = async () => {
    setStatusMsg('Cargando participantes de prueba...');
    try {
      await onSeedDemo();
      await fetchUsers();
      setStatusMsg('¡5 participantes de prueba añadidos y pasarela desbloqueada para probar!');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error al cargar pruebas');
    }
  };

  const handleReset = async () => {
    if (confirm('¿Seguro que quieres reiniciar la base de datos de la fiesta? Se borrarán todos los personajes asignados y fotos.')) {
      try {
        await onReset();
        await fetchUsers();
        setStatusMsg('Base de datos reiniciada');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#140a24] border-2 border-orange-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl glow-box-orange max-h-[88vh] overflow-y-auto overscroll-contain">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-300 hover:text-white w-10 h-10 flex items-center justify-center rounded-full bg-purple-900/60 border border-purple-500/30 cursor-pointer active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-orange-400 mb-4 pr-10">
          <Skull className="w-6 h-6 text-orange-400 shrink-0" />
          <h3 className="font-creepster text-xl sm:text-2xl tracking-wider text-orange-400">
            PANEL DEL ANFITRIÓN (CASA DE NICO)
          </h3>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-purple-200 font-bold">Contraseña:</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="flex-1 bg-purple-950/60 border border-purple-500/40 rounded-2xl px-4 py-3 text-base text-purple-100 placeholder-purple-500/60 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold px-5 py-3 rounded-2xl text-sm cursor-pointer active:scale-95 transition-all shadow-lg"
                >
                  Acceder
                </button>
              </div>
            </div>
            {statusMsg && <p className="text-xs text-red-400 font-medium">{statusMsg}</p>}
          </form>
        ) : (
          <div className="space-y-5">
            {statusMsg && (
              <div className="p-3 bg-purple-950/80 border border-orange-500/40 rounded-xl text-xs text-orange-300">
                {statusMsg}
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <span>Acciones Rápidas del Evento</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Catwalk Unlock Toggle */}
                <button
                  onClick={async () => {
                    await onToggleCatwalk();
                    setStatusMsg(isUnlocked ? 'Pasarela bloqueada a modo cuenta atrás' : 'Pasarela forzada a desbloqueada');
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    isUnlocked
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                      : 'bg-purple-950/60 border-purple-500/30 text-purple-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isUnlocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-purple-400" />}
                    <span>{isUnlocked ? 'Pasarela Abierta' : 'Pasarela Bloqueada'}</span>
                  </span>
                  <span className="text-[10px] underline">{isUnlocked ? 'Bloquear' : 'Desbloquear Ya'}</span>
                </button>

                {/* Voting Finalize Toggle */}
                <button
                  onClick={async () => {
                    await onToggleFinalize();
                    setStatusMsg(votingFinalized ? 'Votación reabierta' : 'Votación cerrada y podio final fijado');
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    votingFinalized
                      ? 'bg-amber-950/50 border-amber-500/50 text-amber-300'
                      : 'bg-purple-950/60 border-purple-500/30 text-purple-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{votingFinalized ? 'Podio Cerrado' : 'Votación En Curso'}</span>
                  </span>
                  <span className="text-[10px] underline">{votingFinalized ? 'Reabrir' : 'Cerrar Votación'}</span>
                </button>
              </div>

              {/* Special Host Ceremony & Live Runway Projection Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {onOpenCeremony && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCeremony();
                    }}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:scale-[1.02] text-white p-3 rounded-2xl text-xs font-black shadow-lg shadow-orange-600/30 border border-amber-300/40 cursor-pointer transition-all"
                  >
                    <Film className="w-4 h-4 text-white animate-pulse" />
                    <span>🎬 Proyectar Gala de Ganadores</span>
                  </button>
                )}

                {onOpenCatwalk && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCatwalk();
                    }}
                    className="flex items-center justify-center gap-2 bg-purple-900/90 hover:bg-purple-800 border border-purple-400/50 text-purple-200 p-3 rounded-2xl text-xs font-bold cursor-pointer transition-all"
                  >
                    <Eye className="w-4 h-4 text-orange-400" />
                    <span>🎭 Ver Pasarela & Votos en Vivo</span>
                  </button>
                )}
              </div>

              {/* Demo test seed */}
              <div className="flex gap-2">
                <button
                  onClick={handleSeed}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-900/70 hover:bg-purple-800 border border-purple-500/40 text-purple-200 py-2.5 px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Cargar 5 Amigos de Prueba con Fotos y Votos</span>
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300 py-2.5 px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  title="Reiniciar todo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>

            {/* List of Registered Guests and their Codes */}
            <div className="space-y-2 pt-2 border-t border-purple-500/20">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span>Lista de Invitados Registrados ({hostUsers.length})</span>
                </h4>
                <button
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                  className="text-[11px] text-purple-400 hover:text-purple-200 underline"
                >
                  Actualizar lista
                </button>
              </div>

              {hostUsers.length === 0 ? (
                <p className="text-xs text-purple-400 italic">No hay invitados registrados todavía.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {hostUsers.map((u) => (
                    <div
                      key={u.code}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs"
                    >
                      <div>
                        <div className="font-bold text-purple-100 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.confirmed ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                              Confirmado
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                              Eligiendo
                            </span>
                          )}
                          {u.photoUrl && <span title="Foto en pasarela">📸</span>}
                        </div>
                        <div className="text-[11px] text-orange-400 font-medium">
                          {u.character?.name || u.characterId}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-mono text-purple-300 font-bold bg-black/40 px-2 py-0.5 rounded border border-purple-500/30 text-[11px]">
                            {u.code}
                          </div>
                          <div className="text-[10px] text-purple-400">
                            {u.rollsLeft} cambios rest.
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteUser(u.code, u.name)}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-850 text-red-400 hover:text-white border border-red-500/30 hover:border-red-400 transition-colors cursor-pointer"
                          title={`Eliminar a ${u.name} (${u.code})`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
