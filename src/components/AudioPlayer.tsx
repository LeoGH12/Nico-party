import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';
import { halloweenAudio } from '../utils/audio.ts';

export const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.25);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);

  useEffect(() => {
    setIsPlaying(halloweenAudio.getIsPlaying());
  }, []);

  const handleToggle = () => {
    const active = halloweenAudio.toggle();
    setIsPlaying(active);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    halloweenAudio.setVolume(val);
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/30 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg shadow-purple-950/50">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 text-xs font-medium text-purple-200 hover:text-orange-400 transition-colors cursor-pointer"
          title={isPlaying ? "Pausar música de terror" : "Activar música de terror"}
        >
          {isPlaying ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <Pause className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Música On</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-purple-300" />
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Música Tenebrosa</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          className="text-purple-400 hover:text-purple-200 transition-colors p-1"
          title="Ajustar volumen"
        >
          {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showVolumeSlider && (
        <div className="absolute right-0 top-11 z-50 bg-[#160d26] border border-purple-500/40 p-3 rounded-xl shadow-2xl w-44 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs text-purple-300">
            <span>Volumen Hilo Musical</span>
            <span className="text-orange-400 font-bold">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};
