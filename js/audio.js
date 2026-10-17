// Web Audio API Synthesizer for Xianxia ARPG Sound Effects and Music
class AudioManager {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.bgmEnabled = true;
    this.bgmTimer = null;
    this.isInitialized = false;
    this.lastHitTime = 0;
    this.lastWolfHurtTime = 0;
    this.bgmNoteIndex = 0;
    this.nextNoteTime = 0;

    // Handle tab visibility to avoid audio drift or battery drain
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend();
        }
      } else {
        if (this.ctx && this.ctx.state === 'suspended' && this.bgmEnabled) {
          this.ctx.resume();
        }
      }
    });
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.isInitialized = true;

        // Auto-resume AudioContext on first user gesture to comply with browser autoplay policy
        const unlockAudio = () => {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
              if (this.bgmEnabled && !this.bgmTimer) {
                this.startBGM();
              }
            });
          } else if (this.bgmEnabled && !this.bgmTimer) {
            this.startBGM();
          }
        };

        ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
          window.addEventListener(evt, unlockAudio, { once: true, passive: true });
        });

        if (this.ctx.state === 'running' && this.bgmEnabled) {
          this.startBGM();
        }
      }
    } catch (e) {
      console.warn("Web Audio not available:", e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play normal sword swing
  playSlash() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    
    // Noise buffer for whoosh
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.08);

    // Gain
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);

    // Tone swoosh
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);
    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Hit impact - throttled to prevent audio clipping during AoE skills
  playHit(isCrit = false) {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    if (!isCrit && now - this.lastHitTime < 0.045) return;
    this.lastHitTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isCrit ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isCrit ? 280 : 200, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + (isCrit ? 0.18 : 0.1));

    gain.gain.setValueAtTime(isCrit ? 0.6 : 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (isCrit ? 0.2 : 0.12));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (isCrit ? 0.2 : 0.12));
  }

  // Skill 1: Sword Qi Wave (Kiếm Khí Trảm)
  playSwordQi() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(3800, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Skill 2: Flying Swords
  playFlyingSwords() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Staggered metallic pings scheduled directly with audio clock
    [0, 0.05, 0.1, 0.15, 0.2].forEach((offset, idx) => {
      const pingTime = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650 + idx * 80, pingTime);
      osc.frequency.exponentialRampToValueAtTime(1400, pingTime + 0.12);

      gain.gain.setValueAtTime(0.2, pingTime);
      gain.gain.exponentialRampToValueAtTime(0.01, pingTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(pingTime);
      osc.stop(pingTime + 0.12);
    });
  }

  // Dash / Khinh Công
  playDash() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Skill 4: Ultimate Sword Array / Lightning Domain
  playUltimate() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Deep sub bass
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, now);
    sub.frequency.exponentialRampToValueAtTime(35, now + 0.8);
    subGain.gain.setValueAtTime(0.7, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 0.8);

    // Chime chords
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      g.gain.setValueAtTime(0.15, now + idx * 0.08);
      g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.6);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  }

  // Wolf Growl / Hurt - throttled for crowds
  playWolfHurt() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    if (now - this.lastWolfHurtTime < 0.09) return;
    this.lastWolfHurtTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Level up fanfare
  playLevelUp() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const notes = [440, 554.37, 659.25, 880];
    const now = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.45);
    });
  }

  // Single Guzheng note scheduled on audio timeline
  playBGMNote(startTime, index) {
    if (!this.ctx || !this.bgmEnabled) return;
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const melody = [0, 2, 4, 3, 2, 0, 4, 5, 4, 2, 1, 0, 3, 4, 2, 0];
    const freq = scale[melody[index % melody.length]];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.06, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 1.25);
  }

  // Peaceful Xianxia Guzheng / Flute Melody (Pentatonic Scale with Web Audio timeline)
  startBGM() {
    if (this.bgmTimer) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.bgmNoteIndex = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    const stepTime = 0.45;
    const scheduleAheadTime = 0.25;

    this.bgmTimer = setInterval(() => {
      if (!this.bgmEnabled || !this.ctx || this.ctx.state !== 'running') return;
      while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
        this.playBGMNote(this.nextNoteTime, this.bgmNoteIndex);
        this.nextNoteTime += stepTime;
        this.bgmNoteIndex++;
      }
    }, 100);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleSound(enabled) {
    this.soundEnabled = enabled;
  }

  toggleBGM(enabled) {
    this.bgmEnabled = enabled;
    if (enabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
  }
}

const audioManager = new AudioManager();
window.audioManager = audioManager;

