import { useState } from 'react';
import { motion } from 'framer-motion';

// Lofi / café ambient music playlists via YouTube
const STATIONS = [
  { id: 'lofi',   label: 'Lofi Café',      embed: 'jfKfPfyJRdk' },
  { id: 'jazz',   label: 'Jazz Morning',   embed: 'Dx5qFachd3A' },
  { id: 'bossa',  label: 'Bossa Nova',     embed: 'rSdoU7L3FWo' },
  { id: 'piano',  label: 'Soft Piano',     embed: 'HGl6VFcMJBk' },
];

export default function MusicPlayer() {
  const [station, setStation] = useState(STATIONS[0]);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-black text-4xl leading-tight tracking-tight" style={{ fontFamily: 'Georgia, serif', color: '#2c1a0e' }}>
          Mind<br />Café
        </h2>
        <p className="text-xs mt-2" style={{ color: '#7a5c44', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Take a seat and stay awhile.
        </p>
      </div>

      {/* Station selector */}
      <div className="flex flex-col gap-1.5 mt-1">
        {STATIONS.map(s => (
          <button
            key={s.id}
            onClick={() => { setStation(s); setPlaying(true); }}
            className="flex items-center gap-2 px-3 py-2 text-left transition-all"
            style={{
              background: station.id === s.id ? 'rgba(92,60,30,0.12)' : 'transparent',
              border: station.id === s.id ? '1px solid rgba(92,60,30,0.25)' : '1px solid transparent',
              color: station.id === s.id ? '#2c1a0e' : '#9a7a62',
            }}
          >
            <span style={{ fontSize: 10 }}>♪</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 12 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* YouTube embed */}
      {playing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
          style={{ border: '1px solid rgba(92,60,30,0.2)' }}
        >
          <iframe
            key={station.id}
            width="220"
            height="120"
            src={`https://www.youtube.com/embed/${station.embed}?autoplay=1&loop=1&playlist=${station.embed}`}
            title={station.label}
            allow="autoplay; encrypted-media"
            style={{ display: 'block', border: 'none' }}
          />
        </motion.div>
      )}

      {!playing && (
        <button
          onClick={() => setPlaying(true)}
          className="px-4 py-2.5 text-xs transition-all"
          style={{
            background: '#2c1a0e',
            color: '#fef3c7',
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.08em',
          }}
        >
          ▶ Play music
        </button>
      )}
    </div>
  );
}
