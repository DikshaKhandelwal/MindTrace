import { motion } from 'framer-motion';

export default function SoundMixer({ TRACKS, active, volumes, toggle, setVolume, started, start }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs mb-3 uppercase tracking-widest"
        style={{ color: '#9a7a62', fontFamily: 'Georgia, serif', letterSpacing: '0.15em' }}>
        Ambience
      </p>

      {TRACKS.map(track => (
        <div key={track.id} className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { if (!started) start(); toggle(track.id); }}
              className="flex items-center gap-2 transition-all"
              style={{ color: active[track.id] ? '#2c1a0e' : '#b0917a' }}
            >
              <span style={{ fontSize: 14 }}>{track.emoji}</span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 12, fontWeight: active[track.id] ? 700 : 400 }}>
                {track.label}
              </span>
              <span style={{ fontSize: 9, opacity: 0.5 }}>
                {active[track.id] ? '▶' : ''}
              </span>
            </button>
          </div>

          {/* Slider */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 10, color: '#c4a882' }}>🔈</span>
            <div className="relative flex-1" style={{ height: 3 }}>
              <div className="absolute inset-0 rounded-full" style={{ background: '#e0cfc0' }} />
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${volumes[track.id] * 100}%`,
                  background: active[track.id] ? '#5c3c1e' : '#c4a882',
                }}
              />
              <input
                type="range"
                min={0} max={1} step={0.01}
                value={volumes[track.id]}
                onChange={e => setVolume(track.id, parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                style={{ height: '100%' }}
              />
            </div>
          </div>
        </div>
      ))}

      {!started && (
        <p className="text-[10px] mt-2 italic" style={{ color: '#c4a882', fontFamily: 'Georgia, serif' }}>
          Click a track to start audio
        </p>
      )}
    </div>
  );
}
