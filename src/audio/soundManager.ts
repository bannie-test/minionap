class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private currentTrack: 'game' | 'wedding' | 'none' = 'none';
  private musicInterval: any = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isInitialized: boolean = false;
  private stepCounter: number = 0;

  constructor() {
    // Read user preferences from localStorage if available
    try {
      const savedMute = localStorage.getItem('wedding_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('wedding_sound_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
      }
    } catch {
      // ignore
    }
  }

  private init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.45;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext initialization failed', e);
    }
  }

  public ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('wedding_sound_muted', muted.toString());
    } catch {}
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('wedding_sound_volume', this.volume.toString());
    } catch {}
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): 'game' | 'wedding' | 'none' {
    return this.currentTrack;
  }

  // Play a simple tone helper
  private playTone(freq: number, type: OscillatorType, duration: number, targetGainNode: GainNode, when = 0, gain = 0.3) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);

    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    osc.connect(g);
    g.connect(targetGainNode);

    osc.start(when);
    osc.stop(when + duration);
  }

  // Sound Effects
  public playJump() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);

    g.gain.setValueAtTime(0.25, now);
    g.gain.linearRampToValueAtTime(0.001, now + 0.18);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playCollect() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Pleasant chime double-ping
    this.playTone(659.25, 'sine', 0.15, this.sfxGain, now, 0.25); // E5
    this.playTone(987.77, 'sine', 0.25, this.sfxGain, now + 0.08, 0.3); // B5
    this.playTone(1318.51, 'sine', 0.35, this.sfxGain, now + 0.16, 0.35); // E6
  }

  public playGiftOpen() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Sparkly upward arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.3, this.sfxGain!, now + idx * 0.07, 0.28);
    });
  }

  public playCorrect() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Happy triumphal major chord fanfare
    this.playTone(523.25, 'sine', 0.2, this.sfxGain, now, 0.25); // C5
    this.playTone(659.25, 'sine', 0.2, this.sfxGain, now + 0.1, 0.28); // E5
    this.playTone(783.99, 'sine', 0.2, this.sfxGain, now + 0.2, 0.3); // G5
    this.playTone(1046.50, 'sine', 0.5, this.sfxGain, now + 0.3, 0.35); // C6
  }

  public playWrong() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Funny comic "wobble / wah-wah"
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.25);
    osc.frequency.linearRampToValueAtTime(140, now + 0.5);

    g.gain.setValueAtTime(0.18, now);
    g.gain.linearRampToValueAtTime(0.001, now + 0.52);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  public playHitObstacle() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Boing recoil sound
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.18);

    g.gain.setValueAtTime(0.3, now);
    g.gain.linearRampToValueAtTime(0.001, now + 0.2);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playGateOpen() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Majestic shimmer
    const chords = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66];
    chords.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 1.8, this.sfxGain!, now + idx * 0.12, 0.22);
    });
  }

  public playClick() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    this.playTone(900, 'triangle', 0.05, this.sfxGain, now, 0.12);
  }

  // Procedural Music Loops
  public startMusic(track: 'game' | 'wedding') {
    if (this.currentTrack === track) return;
    this.ensureContext();
    this.stopMusic();

    this.currentTrack = track;
    this.stepCounter = 0;

    if (track === 'game') {
      this.runGameMusicLoop();
    } else if (track === 'wedding') {
      this.runWeddingMusicLoop();
    }
  }

  public crossfadeTo(targetTrack: 'game' | 'wedding') {
    this.ensureContext();
    if (this.currentTrack === targetTrack) return;
    if (!this.ctx || !this.musicGain) {
      this.startMusic(targetTrack);
      return;
    }

    // Fade down current
    const now = this.ctx.currentTime;
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(0.01, now + 0.6);

    setTimeout(() => {
      this.startMusic(targetTrack);
      if (this.ctx && this.musicGain) {
        const after = this.ctx.currentTime;
        this.musicGain.gain.setValueAtTime(0.01, after);
        this.musicGain.gain.linearRampToValueAtTime(0.45, after + 0.8);
      }
    }, 650);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTrack = 'none';
  }

  private runGameMusicLoop() {
    // Playful, cheerful, upbeat ragtime/chiptune melody loop (C Major / G / Am / F)
    // Tempo approx 128 BPM -> 16th notes are ~117ms
    const notesBass = [130.81, 130.81, 196.00, 196.00, 220.00, 220.00, 174.61, 196.00];
    const melodyPattern = [
      523.25, 659.25, 783.99, 659.25, 880.00, 783.99, 659.25, 587.33,
      523.25, 659.25, 783.99, 880.00, 1046.50, 783.99, 880.00, 987.77,
      1046.50, 880.00, 783.99, 659.25, 698.46, 659.25, 587.33, 523.25,
      587.33, 659.25, 783.99, 587.33, 523.25, 0, 523.25, 0
    ];

    const stepDuration = 135; // ms
    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) {
        this.stepCounter++;
        return;
      }
      const now = this.ctx.currentTime;
      const step = this.stepCounter % melodyPattern.length;

      // Bassline on eighth notes
      if (step % 2 === 0) {
        const bassIdx = Math.floor(step / 4) % notesBass.length;
        const bassFreq = notesBass[bassIdx];
        this.playTone(bassFreq, 'triangle', 0.22, this.musicGain, now, 0.22);
      }

      // Melodic note
      const mNote = melodyPattern[step];
      if (mNote > 0) {
        this.playTone(mNote, 'square', 0.12, this.musicGain, now, 0.08);
      }

      // Playful percussive tick on beats 2 & 4
      if (step % 4 === 2) {
        this.playTone(800, 'triangle', 0.04, this.musicGain, now, 0.05);
      }

      this.stepCounter++;
    }, stepDuration);
  }

  private runWeddingMusicLoop() {
    // Warm, romantic, elegant acoustic/piano chord arpeggiator (Canon in D / F-C-Dm-Bb style in F major)
    const chords = [
      [349.23, 440.00, 523.25, 698.46], // F maj
      [261.63, 329.63, 392.00, 523.25], // C maj
      [293.66, 349.23, 440.00, 587.33], // D min
      [233.08, 293.66, 349.23, 466.16], // Bb maj
      [349.23, 440.00, 523.25, 698.46], // F maj
      [261.63, 392.00, 523.25, 659.25], // C maj / G
      [233.08, 349.23, 466.16, 698.46], // Bb maj9
      [261.63, 329.63, 392.00, 523.25]  // C sus -> maj
    ];

    const stepDuration = 320; // ms per gentle arpeggio note
    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) {
        this.stepCounter++;
        return;
      }
      const now = this.ctx.currentTime;
      const chordIndex = Math.floor((this.stepCounter / 4) % chords.length);
      const noteInChord = this.stepCounter % 4;
      const currentChord = chords[chordIndex];

      const noteFreq = currentChord[noteInChord];
      // Gentle warm sine/triangle blend
      this.playTone(noteFreq, 'sine', 0.65, this.musicGain, now, 0.16);
      this.playTone(noteFreq, 'triangle', 0.45, this.musicGain, now, 0.08);

      // Low root octave on the first beat of each chord
      if (noteInChord === 0) {
        this.playTone(currentChord[0] / 2, 'sine', 1.2, this.musicGain, now, 0.22);
      }

      this.stepCounter++;
    }, stepDuration);
  }
}

export const soundManager = new SoundManager();
