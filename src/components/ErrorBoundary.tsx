import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08030f] text-purple-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#160d26] border-2 border-orange-500/50 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="font-creepster text-2xl text-orange-400 tracking-wide">
              ¡UPS! UN SUSTO INESPERADO
            </h2>

            <p className="text-xs text-purple-200">
              Ocurrió un error temporal al cargar esta pantalla. Pulsa el botón abajo para recargar la fiesta con los datos guardados.
            </p>

            {this.state.error?.message && (
              <div className="p-3 bg-black/60 rounded-xl border border-purple-500/20 text-[11px] font-mono text-purple-300 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white font-extrabold py-3.5 px-5 rounded-2xl text-xs cursor-pointer active:scale-95 transition-all shadow-lg shadow-orange-600/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recargar Aplicación</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
