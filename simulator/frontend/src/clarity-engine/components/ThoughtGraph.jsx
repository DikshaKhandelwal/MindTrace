import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { NODE_TYPES } from '../data/engine';
import LoopBreaker from './LoopBreaker';

const W = 560, H = 500;

// Shape render per type
function NodeShape({ node, isSelected, onClick }) {
  const nt = NODE_TYPES[node.type];
  const size = nt.size + (node.weight - 1) * 8;
  const half = size / 2;

  const sharedProps = {
    onClick,
    style: { cursor: 'pointer', filter: `drop-shadow(0 0 ${isSelected ? 14 : 6}px ${nt.color}cc)` },
  };

  const pulseAnim = node.type === 'fear' ? {
    animate: { scale: [1, 1.07, 1] },
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  } : {};

  return (
    <motion.g
      key={node.id}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, ...pulseAnim?.animate }}
      transition={{ duration: 0.5, delay: node.id * 0.08, ...(pulseAnim?.transition || {}) }}
      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
      {...sharedProps}
    >
      {/* Outer glow ring */}
      {isSelected && (
        <circle
          cx={node.x} cy={node.y} r={half + 10}
          fill="none"
          stroke={nt.color}
          strokeWidth={1.5}
          strokeOpacity={0.4}
        >
          <animate attributeName="r" values={`${half + 8};${half + 16};${half + 8}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="strokeOpacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Shape per type */}
      {node.type === 'core' && (
        <>
          {/* Core: double circle with bloom */}
          <circle cx={node.x} cy={node.y} r={half + 6} fill={nt.bg} stroke={nt.ring} strokeWidth={1} strokeDasharray="4 4" />
          <circle cx={node.x} cy={node.y} r={half} fill={nt.bg} stroke={nt.color} strokeWidth={2} />
        </>
      )}
      {node.type === 'fear' && (
        // Fear: organic squircle
        <rect
          x={node.x - half} y={node.y - half}
          width={size} height={size}
          rx={half * 0.55}
          fill={nt.bg}
          stroke={nt.color}
          strokeWidth={1.8}
        />
      )}
      {node.type === 'logic' && (
        // Logic: rotated diamond
        <rect
          x={node.x - half * 0.76} y={node.y - half * 0.76}
          width={size * 0.76} height={size * 0.76}
          rx={4}
          fill={nt.bg}
          stroke={nt.color}
          strokeWidth={1.6}
          transform={`rotate(45, ${node.x}, ${node.y})`}
        />
      )}
      {node.type === 'opp' && (
        // Opportunity: rounded rectangle
        <rect
          x={node.x - half} y={node.y - half * 0.75}
          width={size} height={size * 0.75}
          rx={half * 0.45}
          fill={nt.bg}
          stroke={nt.color}
          strokeWidth={1.6}
        />
      )}
      {node.type === 'unknown' && (
        // Unknown: circle with dashed stroke
        <>
          <circle cx={node.x} cy={node.y} r={half} fill={nt.bg} stroke="none" />
          <circle cx={node.x} cy={node.y} r={half} fill="none" stroke={nt.color} strokeWidth={1.6} strokeDasharray="5 3" />
        </>
      )}
      {node.type === 'pressure' && (
        // Pressure: hexagon-like — use polygon
        <polygon
          points={[0,1,2,3,4,5].map(i => {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
            return `${node.x + half * Math.cos(a)},${node.y + half * Math.sin(a)}`;
          }).join(' ')}
          fill={nt.bg}
          stroke={nt.color}
          strokeWidth={1.6}
        />
      )}
      {node.type === 'past' && (
        // Past: teardrop-like — ellipse taller than wide
        <ellipse
          cx={node.x} cy={node.y}
          rx={half * 0.82} ry={half}
          fill={nt.bg}
          stroke={nt.color}
          strokeWidth={1.6}
        />
      )}

      {/* Emoji label inside */}
      <text
        x={node.x} y={node.y - (node.type === 'core' ? 6 : 4)}
        textAnchor="middle"
        fontSize={node.type === 'core' ? 16 : 12}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {NODE_TYPES[node.type].emoji}
      </text>
    </motion.g>
  );
}

export default function ThoughtGraph({ nodes, fearPct, loopInfo, onNext }) {
  const [selected, setSelected] = useState(null);
  const [showLoop, setShowLoop]   = useState(false);
  const [loopBroken, setLoopBroken] = useState(false);

  useEffect(() => {
    if (loopInfo.detected) {
      const t = setTimeout(() => setShowLoop(true), 1800);
      return () => clearTimeout(t);
    }
  }, [loopInfo.detected]);

  const nonCore = nodes.filter(n => n.type !== 'core');
  const coreNode = nodes.find(n => n.type === 'core');
  const selectedNode = nodes.find(n => n.id === selected);

  // Fear intensity — tint the whole graph slightly red-pink when fear is high
  const fearTint = fearPct > 60 ? `rgba(253,164,175,${(fearPct - 60) * 0.004})` : 'transparent';

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
        <h2 className="text-3xl sm:text-4xl font-black mb-1" style={{ color: 'rgba(80,10,40,0.88)' }}>
          Your Thought Map
        </h2>
        <p className="text-sm" style={{ color: 'rgba(160,60,90,0.55)' }}>
          {nodes.length} node{nodes.length !== 1 ? 's' : ''} identified · Tap any node to inspect
        </p>
      </motion.div>

      {/* Fear meter bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-2xl mb-3 px-2"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold" style={{ color: 'rgba(160,60,90,0.60)' }}>Fear Load</span>
          <span className="text-xs font-bold" style={{ color: fearPct > 60 ? '#f472b6' : 'rgba(160,60,90,0.60)' }}>
            {fearPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(244,114,182,0.12)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fearPct}%` }}
            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: fearPct > 60 ? 'linear-gradient(90deg, #f9a8d4, #f472b6)' : 'linear-gradient(90deg, #fde68a, #86efac)' }}
          />
        </div>
      </motion.div>

      {/* Loop breaker panel */}
      <AnimatePresence>
        {showLoop && loopInfo.detected && !loopBroken && (
          <motion.div
            key="loop-breaker"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full max-w-2xl mb-3"
          >
            <LoopBreaker loopInfo={loopInfo} onBreak={() => setLoopBroken(true)} />
          </motion.div>
        )}
        {loopBroken && (
          <motion.div
            key="loop-broken"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mb-3 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm"
            style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.35)', color: 'rgba(6,95,70,0.85)' }}
          >
            <span className="text-lg">✅</span>
            <div>
              <strong className="font-bold">Loop interrupted</strong> — your thinking map now shows the full picture without the cycle.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Graph SVG */}
      <div className="w-full max-w-2xl relative">
        {/* Fear tint overlay */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-1000"
          style={{ background: fearTint }}
        />
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ overflow: 'visible', borderRadius: '20px' }}
        >
          <defs>
            <filter id="ce-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Animated loop connection gradient */}
            <linearGradient id="loop-grad">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Faint background orbit */}
          {coreNode && (
            <>
              <circle cx={coreNode.x} cy={coreNode.y} r={152} fill="none" stroke="rgba(244,114,182,0.07)" strokeWidth={1} strokeDasharray="4 8" />
              <circle cx={coreNode.x} cy={coreNode.y} r={238} fill="none" stroke="rgba(244,114,182,0.04)" strokeWidth={1} strokeDasharray="3 10" />
            </>
          )}

          {/* Connection lines */}
          {coreNode && nonCore.map((node, i) => {
            const nt = NODE_TYPES[node.type];
            const isLoop = loopInfo.detected && !loopBroken && node.type === 'fear';
            return (
              <motion.line
                key={`line-${node.id}`}
                x1={coreNode.x} y1={coreNode.y}
                x2={node.x} y2={node.y}
                stroke={isLoop ? 'url(#loop-grad)' : nt.color}
                strokeWidth={isLoop ? 1.5 : 0.8}
                strokeOpacity={isLoop ? 0.7 : 0.22}
                strokeDasharray={node.type === 'unknown' ? '5 5' : 'none'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.07, duration: 0.6 }}
              />
            );
          })}

          {/* Loop arc — fear nodes connect to each other, removed when loop is broken */}
          {loopInfo.detected && showLoop && !loopBroken && nodes.filter(n => n.type === 'fear').map((fn, i, arr) => {
            const next = arr[(i + 1) % arr.length];
            if (fn === next) return null;
            const mx = (fn.x + next.x) / 2 + 30;
            const my = (fn.y + next.y) / 2 - 30;
            return (
              <motion.path
                key={`loop-${i}`}
                d={`M ${fn.x} ${fn.y} Q ${mx} ${my} ${next.x} ${next.y}`}
                fill="none"
                stroke="url(#loop-grad)"
                strokeWidth={1.2}
                strokeDasharray="6 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => (
            <NodeShape
              key={node.id}
              node={node}
              isSelected={selected === node.id}
              onClick={() => setSelected(selected === node.id ? null : node.id)}
            />
          ))}

          {/* Node labels (outside shape, below) */}
          {nodes.map(node => (
            <text
              key={`lbl-${node.id}`}
              x={node.x}
              y={node.y + NODE_TYPES[node.type].size / 2 + 16}
              textAnchor="middle"
              fontSize={node.type === 'core' ? 11 : 9.5}
              fontWeight={node.type === 'core' ? '700' : '500'}
              fill={NODE_TYPES[node.type].color}
              fillOpacity={0.80}
              style={{ userSelect: 'none', pointerEvents: 'none', paintOrder: 'stroke' }}
              stroke="rgba(255,245,250,0.7)"
              strokeWidth={3}
            >
              {node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Selected node detail */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="w-full max-w-2xl mt-3 px-5 py-4 rounded-2xl"
            style={{
              background: `${NODE_TYPES[selectedNode.type].bg}`,
              border: `1px solid ${NODE_TYPES[selectedNode.type].color}55`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{NODE_TYPES[selectedNode.type].emoji}</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: NODE_TYPES[selectedNode.type].color }}>
                {NODE_TYPES[selectedNode.type].label}
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'rgba(70,10,40,0.80)' }}>{selectedNode.label}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Node type counts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap justify-center gap-2.5 mt-5 max-w-lg"
      >
        {Object.entries(NODE_TYPES).filter(([k]) => k !== 'core').map(([type, nt]) => {
          const count = nodes.filter(n => n.type === type).length;
          if (count === 0) return null;
          return (
            <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{ background: nt.bg, border: `1px solid ${nt.color}44`, color: 'rgba(70,10,40,0.75)' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: nt.color }} />
              {count} {nt.label}
            </div>
          );
        })}
      </motion.div>

      {/* Continue */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="mt-8 flex items-center gap-3 px-10 py-4 rounded-2xl text-white text-lg font-bold"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.88), rgba(168,85,247,0.85))',
          boxShadow: '0 0 40px rgba(236,72,153,0.28)',
        }}
      >
        Analyse my thinking
        <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}
