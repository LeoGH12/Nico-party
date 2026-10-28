/**
 * Procedural Halloween audio synthesizer using Web Audio API.
 * Generates an atmospheric, delicate gothic synth track and sound effects
 * without relying on external MP3 files.
 */

class HalloweenAudioController {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private timerId: number | null = null;
  private currentVolume: number = 0.25;
  private activeOscillators: OscillatorNode[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.currentVolume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public startMusic() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // If already playing, do not create duplicate loops
    if (this.isPlaying) return;

    this.isPlaying = true;

    // Dedicated music gain node separate from sound effects
    if (this.musicGain) {
      try {
        this.musicGain.disconnect();
      } catch (e) {
        // ignore
      }
    }
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(1, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    // Haunting Gothic notes progression (F# minor / C# / D diminished classic horror ostinato)
    const melodyFreqs = [
      185.00, // F#3
      220.00, // A3
      277.18, // C#4
      293.66, // D4
      277.18, // C#4
      220.00, // A3
      174.61, // F3
      220.00, // A3
      261.63, // C4
      277.18, // C#4
      261.63, // C4
      220.00  // A3
    ];

    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.isPlaying || !this.ctx || !this.musicGain) {
        this.stopMusic();
        return;
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Triangle / saw organ tone
      osc.type = noteIndex % 4 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(melodyFreqs[noteIndex % melodyFreqs.length], now);

      // Lowpass eerie filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 1.1);

      // Soft envelope
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.musicGain);

      this.activeOscillators.push(osc);
      osc.onended = () => {
        this.activeOscillators = this.activeOscillators.filter(o => o !== osc);
      };

      try {
        osc.start(now);
        osc.stop(now + 1.2);
      } catch (e) {
        // ignore
      }

      // Deep eerie bass drone on measure starts
      if (noteIndex % 6 === 0) {
        const drone = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(92.50, now); // F#2 deep root
        droneGain.gain.setValueAtTime(0.001, now);
        droneGain.gain.linearRampToValueAtTime(0.08, now + 0.4);
        droneGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
        drone.connect(droneGain);
        droneGain.connect(this.musicGain);

        this.activeOscillators.push(drone);
        drone.onended = () => {
          this.activeOscillators = this.activeOscillators.filter(o => o !== drone);
        };

        try {
          drone.start(now);
          drone.stop(now + 3.1);
        } catch (e) {
          // ignore
        }
      }

      noteIndex++;
      this.timerId = window.setTimeout(playNextNote, 420);
    };

    playNextNote();
  }

  public stopMusic() {
    this.isPlaying = false;

    // 1. Clear loop timeout immediately
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }

    // 2. Mute music gain immediately
    if (this.musicGain && this.ctx) {
      try {
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.musicGain.disconnect();
      } catch (e) {
        // ignore
      }
      this.musicGain = null;
    }

    // 3. Stop and disconnect all active oscillators
    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // already stopped
      }
    }
    this.activeOscillators = [];
  }

  // Sound effects
  public playVoteStar() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  public playCameraShutter() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  public playCreepyLaugh() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      [220, 180, 240, 160].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const start = now + idx * 0.14;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.linearRampToValueAtTime(freq - 30, start + 0.12);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.13);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(start);
        osc.stop(start + 0.14);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  public playRerollWhoosh() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  /**
   * Pleasant, subtle high chime notification for real-time photo arrivals.
   */
  public playWhoosh() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.18); // E6
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio whoosh error:', e);
    }
  }

  /**
   * Suspenseful drumroll (redoble de tambores) that builds tension and volume.
   */
  public playDrumRoll(duration: number = 3.0) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate white noise with snare impulse texture
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Bandpass filter centered on snare resonance
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(1400, now + duration);
      filter.Q.setValueAtTime(2.5, now);

      // Tremolo / snare hit modulation
      const rollGain = this.ctx.createGain();
      // Start soft and ramp up to loud crescendo
      rollGain.gain.setValueAtTime(0.02, now);
      rollGain.gain.exponentialRampToValueAtTime(0.35, now + duration * 0.95);
      rollGain.gain.linearRampToValueAtTime(0.001, now + duration);

      // Modulate amplitude to create rapid snare stick strikes (accelerating ~18Hz to 32Hz)
      const tremoloOsc = this.ctx.createOscillator();
      tremoloOsc.frequency.setValueAtTime(16, now);
      tremoloOsc.frequency.linearRampToValueAtTime(32, now + duration);

      const tremoloGain = this.ctx.createGain();
      tremoloGain.gain.setValueAtTime(0.5, now);

      tremoloOsc.connect(tremoloGain.gain);

      whiteNoise.connect(filter);
      filter.connect(rollGain);
      rollGain.connect(this.masterGain);

      tremoloOsc.start(now);
      whiteNoise.start(now);
      tremoloOsc.stop(now + duration);
      whiteNoise.stop(now + duration);
    } catch (e) {
      console.warn('Drumroll error:', e);
    }
  }

  /**
   * Dramatic cymbal crash + triumphant fanfare chord when a winner is revealed!
   */
  public playFanfareHit() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // 1. Cymbal crash (high-passed noise with long shimmer decay)
      const sampleRate = this.ctx.sampleRate;
      const crashDuration = 1.6;
      const crashBuffer = this.ctx.createBuffer(1, Math.floor(sampleRate * crashDuration), sampleRate);
      const crashData = crashBuffer.getChannelData(0);
      for (let i = 0; i < crashData.length; i++) {
        crashData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.35));
      }
      const crashSource = this.ctx.createBufferSource();
      crashSource.buffer = crashBuffer;

      const crashFilter = this.ctx.createBiquadFilter();
      crashFilter.type = 'highpass';
      crashFilter.frequency.setValueAtTime(3500, now);

      const crashGain = this.ctx.createGain();
      crashGain.gain.setValueAtTime(0.25, now);
      crashGain.gain.exponentialRampToValueAtTime(0.001, now + crashDuration);

      crashSource.connect(crashFilter);
      crashFilter.connect(crashGain);
      crashGain.connect(this.masterGain);
      crashSource.start(now);

      // 2. Brass / triumph chords (Root: C4, G4, C5, E5)
      const chordFreqs = [261.63, 392.00, 523.25, 659.25];
      chordFreqs.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        const brassFilter = this.ctx!.createBiquadFilter();
        brassFilter.type = 'lowpass';
        brassFilter.frequency.setValueAtTime(2200, now);
        brassFilter.frequency.exponentialRampToValueAtTime(400, now + 1.2);

        osc.connect(brassFilter);
        brassFilter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch (e) {
      console.warn('Fanfare hit error:', e);
    }
  }
}

export const halloweenAudio = new HalloweenAudioController();
