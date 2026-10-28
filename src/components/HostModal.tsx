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
  isSuperAdmin?: boolean;
  onSuperadminAuth?: () => void;
  onHostLogout?: () => void;
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
  onOpenCeremony,
  isSuperAdmin,
  onSuperadminAuth,
  onHostLogout
}) => {
  const [pin, setPin] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(isSuperAdmin));
  const [hostUsers, setHostUsers] = useState<HostUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ code: string; name: string } | null>(null);

  // Sync auth state strictly with isSuperAdmin
  React.useEffect(() => {
    if (!isSuperAdmin) {
      setIsAuthenticated(false);
      setPin('');
    } else {
      setIsAuthenticated(true);
    }
  }, [isSuperAdmin]);

  React.useEffect(() => {
    if (isOpen && (isSuperAdmin || isAuthenticated)) {
      setIsAuthenticated(true);
      fetchUsers();
    }
  }, [isOpen, isSuperAdmin, isAuthenticated]);

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Strictly password nico1234 - no hints
    if (pin.trim().toLowerCase() === 'nico1234') {
      setIsAuthenticated(true);
      setStatusMsg(null);
      fetchUsers();
      onSuperadminAuth?.();
    } else {
      setStatusMsg('Contraseña incorrecta');
    }
  };

  const handleLogoutAdmin = () => {
    setIsAuthenticated(false);
    setPin('');
    onHostLogout?.();
    onClose();
  };

  const executeDeleteUser = async () => {
    if (!userToDelete) return;
    const { code, name } = userToDelete;
    setUserToDelete(null);
    setStatusMsg(`Eliminando a ${name}...`);
    try {
      const res = await fetch('/api/host/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      // Clear from local storage if this was the local active user
      const savedCode = localStorage.getItem('hlw_party_code');
      if (savedCode === code) {
        localStorage.removeItem('hlw_party_code');
        localStorage.removeItem('hlw_local_user');
        localStorage.removeItem('hlw_local_character');
      }
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setStatusMsg(`✅ ${name} (${code}) eliminado`);
        await fetchUsers();
      } else {
        setStatusMsg(data?.error || 'Error al eliminar');
      }
    } catch (e) {
      console.error(e);
      setStatusMsg('Error al conectar con el servidor');
    }
  };

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/host/all-users');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && Array.isArray(data.users)) {
          setHostUsers(data.users);
          return;
        }
      }
      setHostUsers([]);
    } catch (err) {
      console.error('Error fetching host data:', err);
      setHostUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSeed = async () => {
    setIsLoadingUsers(true);
    setStatusMsg('Cargando participantes de prueba...');
    try {
      await onSeedDemo();
      await fetchUsers();
      setStatusMsg('✅ ¡5 participantes de prueba cargados con fotos y votos en la pasarela!');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error al cargar pruebas');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const executeReset = async () => {
    setShowResetConfirm(false);
    setStatusMsg('Reiniciando base de datos...');
    try {
      await onReset();
      await fetchUsers();
      setStatusMsg('✅ Base de datos reiniciada por completo');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error al reiniciar base de datos');
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
              <div className="p-3 bg-purple-950/80 border border-orange-500/40 rounded-xl text-xs text-orange-300 flex flex-col gap-2">
                <span>{statusMsg}</span>
                {statusMsg.includes('cargados') && onOpenCatwalk && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCatwalk();
                    }}
                    className="self-start px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Verlos ahora en la Pasarela en Directo</span>
                  </button>
                )}
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
                  type="button"
                  onClick={handleSeed}
                  disabled={isLoadingUsers}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-900/70 hover:bg-purple-800 border border-purple-500/40 text-purple-200 py-2.5 px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isLoadingUsers ? 'Cargando...' : 'Cargar 5 Amigos de Prueba con Fotos y Votos'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center justify-center gap-1.5 bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300 py-2.5 px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors active:scale-95"
                  title="Reiniciar todo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              </div>

              {/* Inline Reset Entire DB Confirmation Box */}
              {showResetConfirm && (
                <div className="p-3 bg-red-950/90 border-2 border-red-500 rounded-2xl text-xs space-y-2.5 shadow-xl animate-in fade-in zoom-in-95">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-red-400" />
                    <span>¿Reiniciar fiesta y vaciar la lista por completo?</span>
                  </div>
                  <p className="text-red-200 text-[11px]">
                    Se borrarán todos los participantes, votos, fotos y la pasarela se volverá a bloquear.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={executeReset}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold shadow cursor-pointer"
                    >
                      Sí, Vaciar Todo
                    </button>
                  </div>
                </div>
              )}
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
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-400 hover:text-orange-300 bg-purple-950/80 border border-purple-500/30 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  <RotateCcw className={`w-3 h-3 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                  <span>{isLoadingUsers ? 'Cargando...' : 'Actualizar'}</span>
                </button>
              </div>

              {/* Inline Delete Confirmation Box */}
              {userToDelete && (
                <div className="p-3 bg-red-950/90 border-2 border-red-500 rounded-2xl text-xs space-y-2.5 shadow-xl animate-in fade-in zoom-in-95">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>¿Eliminar a {userToDelete.name} ({userToDelete.code})?</span>
                  </div>
                  <p className="text-red-200 text-[11px]">
                    Se borrará de la lista del anfitrión, de la pasarela y se eliminarán todos sus votos y fotos.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setUserToDelete(null)}
                      className="px-3 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={executeDeleteUser}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold shadow cursor-pointer"
                    >
                      Sí, Eliminar
                    </button>
                  </div>
                </div>
              )}

              {hostUsers.length === 0 ? (
                <div className="text-center py-4 text-xs text-purple-400 bg-purple-950/20 rounded-2xl border border-purple-500/20">
                  <p className="italic">No hay invitados registrados en la base de datos todavía.</p>
                </div>
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
                          type="button"
                          onClick={() => setUserToDelete({ code: u.code, name: u.name })}
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

            {/* Logout from Admin completely */}
            <div className="pt-3 border-t border-purple-500/20 flex justify-between items-center">
              <span className="text-[11px] text-purple-400">
                Sesión de anfitrión activa
              </span>
              <button
                type="button"
                onClick={handleLogoutAdmin}
                className="text-xs text-red-400 hover:text-red-300 font-bold px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 hover:bg-red-900/60 transition-colors cursor-pointer"
              >
                Cerrar Sesión de Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
