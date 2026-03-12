export interface SfxEngine {
  playCountdownTick(): void;
  playCountdownGo(): void;
  playFinishCelebration(): void;
  playOvertakeChime(): void;
  setMuted(muted: boolean): void;
  dispose(): void;
}

export function createSfxEngine(): SfxEngine {
  let ctx: AudioContext | null = null;
  let muted = false;

  function getCtx(): AudioContext | null {
    if (muted) return null;
    if (!ctx || ctx.state === "closed") {
      ctx = new AudioContext();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playCountdownTick() {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = 80;
    gain.gain.setValueAtTime(0.3, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
    osc.connect(gain).connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.1);
  }

  function playCountdownGo() {
    const c = getCtx();
    if (!c) return;
    // Ascending chime: C5 → E5
    const notes = [523.25, 659.25];
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = c.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  function playFinishCelebration() {
    const c = getCtx();
    if (!c) return;
    // Arpeggio: C5 → E5 → G5 → C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = c.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  function playOvertakeChime() {
    const c = getCtx();
    if (!c) return;
    // Two quick triangle tones: 880Hz → 1100Hz
    const notes = [880, 1100];
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const start = c.currentTime + i * 0.05;
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.05);
    });
  }

  function setMuted(m: boolean) {
    muted = m;
    if (m && ctx) {
      ctx.close().catch(() => {});
      ctx = null;
    }
  }

  function dispose() {
    if (ctx) {
      ctx.close().catch(() => {});
      ctx = null;
    }
  }

  return { playCountdownTick, playCountdownGo, playFinishCelebration, playOvertakeChime, setMuted, dispose };
}
