/**
 * ambientAudio.js
 * Generative Web Audio API ambient soundscapes — no audio files needed.
 * Each type synthesises its own sound from noise / oscillators.
 */

function createNoiseBuffer(ctx) {
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function loopNoise(ctx, buffer) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  return src;
}

/**
 * Create an ambient soundscape.
 * @param {'ocean'|'rain'|'wind'|'space'} type
 * @returns {{ stop: () => void, setVolume: (v: number) => void }}
 */
export function createAmbient(type = 'ocean') {
  let ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    // No audio context support → return no-op
    return { stop: () => {}, setVolume: () => {} };
  }

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.5);

  const toStop = [];

  const noise = createNoiseBuffer(ctx);

  // ── OCEAN ─────────────────────────────────────────────────────────────────
  if (type === 'ocean') {
    const src = loopNoise(ctx, noise);

    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 700;

    // Slow LFO simulates wave rhythm (~every 8s)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain);
    lfoGain.connect(lpf.frequency);

    src.connect(lpf);
    lpf.connect(masterGain);

    src.start();
    lfo.start();
    toStop.push(src, lfo);
  }

  // ── RAIN ──────────────────────────────────────────────────────────────────
  if (type === 'rain') {
    // Pink noise-ish: band-pass filtered white noise
    const src = loopNoise(ctx, noise);

    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 1400;
    bpf.Q.value = 0.4;

    const bpf2 = ctx.createBiquadFilter();
    bpf2.type = 'highpass';
    bpf2.frequency.value = 600;

    src.connect(bpf);
    bpf.connect(bpf2);
    bpf2.connect(masterGain);

    src.start();
    toStop.push(src);
  }

  // ── WIND (mountain) ───────────────────────────────────────────────────────
  if (type === 'wind') {
    const src = loopNoise(ctx, noise);

    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 320;
    bpf.Q.value = 1.8;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain);
    lfoGain.connect(bpf.frequency);

    src.connect(bpf);
    bpf.connect(masterGain);

    src.start();
    lfo.start();
    toStop.push(src, lfo);
  }

  // ── SPACE ─────────────────────────────────────────────────────────────────
  if (type === 'space') {
    // Very low drone chord + slow tremolo = cosmic hum
    const freqs = [40, 60, 80, 120, 160];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const ogain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      ogain.gain.value = 0.035 / (i * 0.6 + 1);

      const lfo = ctx.createOscillator();
      const lgain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.04 + i * 0.008;
      lgain.gain.value = 0.008;
      lfo.connect(lgain);
      lgain.connect(ogain.gain);

      osc.connect(ogain);
      ogain.connect(masterGain);
      osc.start();
      lfo.start();
      toStop.push(osc, lfo);
    });
  }

  // ── FOREST ────────────────────────────────────────────────────────────────
  if (type === 'forest') {
    // Low wind + occasional bird-like tones
    const src = loopNoise(ctx, noise);
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 500;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain);
    lfoGain.connect(lpf.frequency);

    src.connect(lpf);
    lpf.connect(masterGain);
    src.start();
    lfo.start();
    toStop.push(src, lfo);
  }

  return {
    stop() {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
      setTimeout(() => {
        toStop.forEach(n => { try { n.stop(); } catch { } });
        ctx.close();
      }, 2000);
    },
    setVolume(v) {
      masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime + 0.6);
    },
  };
}

export const AMBIENT_TYPES = [
  { key: 'ocean',  label: 'Ocean',         emoji: '🌊' },
  { key: 'rain',   label: 'Rain',          emoji: '🌧️' },
  { key: 'wind',   label: 'Mountain Wind', emoji: '🏔️' },
  { key: 'space',  label: 'Space',         emoji: '🚀' },
  { key: 'forest', label: 'Forest',        emoji: '🌲' },
];

/** Map story places to default ambient sounds */
export const PLACE_AMBIENT = {
  beach:     'ocean',
  mountains: 'wind',
  space:     'space',
  forest:    'forest',
  rain:      'rain',
  clouds:    'wind',
};
