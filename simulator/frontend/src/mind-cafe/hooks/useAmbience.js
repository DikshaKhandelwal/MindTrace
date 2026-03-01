import { useRef, useState, useCallback, useEffect } from 'react';

// Creates and manages Web Audio API nodes for each ambience track
function createRain(ctx) {
  const bufferSize = 4096;
  const node = ctx.createScriptProcessor(bufferSize, 1, 1);
  let lastOut = 0;
  node.onaudioprocess = e => {
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
    }
  };
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 400;
  filter.Q.value = 0.5;
  node.connect(filter);
  return { source: node, output: filter };
}

function createFireplace(ctx) {
  const bufferSize = 4096;
  const node = ctx.createScriptProcessor(bufferSize, 1, 1);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  node.onaudioprocess = e => {
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0+b1+b2+b3+b4+b5+b6+white*0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  };
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;
  node.connect(filter);
  return { source: node, output: filter };
}

function createChatter(ctx) {
  const bufferSize = 4096;
  const node = ctx.createScriptProcessor(bufferSize, 1, 1);
  node.onaudioprocess = e => {
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }
  };
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  filter.Q.value = 0.3;
  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'lowpass';
  filter2.frequency.value = 3000;
  node.connect(filter);
  filter.connect(filter2);
  return { source: node, output: filter2 };
}

function createCups(ctx) {
  // Gentle ticks via OscillatorNode bursts modulated
  const bufferSize = 4096;
  const node = ctx.createScriptProcessor(bufferSize, 1, 1);
  let phase = 0;
  node.onaudioprocess = e => {
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      phase++;
      const burst = Math.sin(phase * 0.003) > 0.97 ? (Math.random() * 2 - 1) * 0.6 : 0;
      output[i] = burst;
    }
  };
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  node.connect(filter);
  return { source: node, output: filter };
}

const TRACKS = [
  { id: 'rain',    label: 'Rain',           emoji: '🌧️', create: createRain },
  { id: 'fire',    label: 'Fireplace',      emoji: '🔥', create: createFireplace },
  { id: 'chatter', label: 'Café Chatter',   emoji: '💬', create: createChatter },
  { id: 'cups',    label: 'Coffee Cups',    emoji: '☕', create: createCups },
];

export default function useAmbience() {
  const ctxRef = useRef(null);
  const gainRefs = useRef({});
  const nodeRefs = useRef({});
  const [volumes, setVolumes] = useState({ rain: 0.4, fire: 0.3, chatter: 0.2, cups: 0.2 });
  const [active, setActive] = useState({});
  const [started, setStarted] = useState(false);

  const start = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    setStarted(true);
  }, []);

  // Activate / deactivate a track
  const toggle = useCallback((id) => {
    const ctx = ctxRef.current;
    if (!ctx) { start(); return; }

    setActive(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        const track = TRACKS.find(t => t.id === id);
        const { source, output } = track.create(ctx);
        const gainNode = ctx.createGain();
        gainNode.gain.value = volumes[id] ?? 0.3;
        output.connect(gainNode);
        gainNode.connect(ctx.destination);
        gainRefs.current[id] = gainNode;
        nodeRefs.current[id] = source;
      } else {
        try {
          gainRefs.current[id]?.disconnect();
          nodeRefs.current[id]?.disconnect();
        } catch {}
        delete gainRefs.current[id];
        delete nodeRefs.current[id];
      }
      return next;
    });
  }, [volumes, start]);

  const setVolume = useCallback((id, val) => {
    setVolumes(prev => ({ ...prev, [id]: val }));
    if (gainRefs.current[id]) {
      gainRefs.current[id].gain.value = val;
    }
  }, []);

  useEffect(() => () => {
    try { ctxRef.current?.close(); } catch {}
  }, []);

  return { TRACKS, active, volumes, toggle, setVolume, started, start };
}
