/**
 * Tiny WebAudio cues so the app ships without binary sound assets.
 * All calls are no-ops if the browser blocks audio before a user gesture.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as never as AudioContext))();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface ToneOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  delay?: number;
  gain?: number;
  sweepTo?: number;
}

function tone({ freq, duration, type = 'sine', delay = 0, gain = 0.16, sweepTo }: ToneOptions) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + duration);
  vol.gain.setValueAtTime(0.0001, t0);
  vol.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(vol).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Heavy "thunk" of a rubber stamp hitting paper, then a bright confirmation. */
export function playStamp() {
  tone({ freq: 180, duration: 0.12, type: 'triangle', gain: 0.3, sweepTo: 70 });
  tone({ freq: 660, duration: 0.16, delay: 0.1, type: 'sine' });
  tone({ freq: 990, duration: 0.28, delay: 0.19, type: 'sine' });
}

/** Correct-answer chime. */
export function playCorrect() {
  tone({ freq: 784, duration: 0.14, type: 'sine' });
  tone({ freq: 1046, duration: 0.28, delay: 0.12, type: 'sine' });
}

/** Wrong-answer buzz. */
export function playWrong() {
  tone({ freq: 220, duration: 0.18, type: 'sawtooth', gain: 0.12 });
  tone({ freq: 165, duration: 0.3, delay: 0.15, type: 'sawtooth', gain: 0.12 });
}

/** Coin-like sound for spending points on a Deco. */
export function playUnlock() {
  tone({ freq: 880, duration: 0.1, type: 'square', gain: 0.1 });
  tone({ freq: 1318, duration: 0.24, delay: 0.09, type: 'square', gain: 0.1 });
}

export function playTap() {
  tone({ freq: 520, duration: 0.06, type: 'sine', gain: 0.07 });
}
