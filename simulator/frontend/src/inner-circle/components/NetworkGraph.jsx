import { motion } from 'framer-motion';
import { MOOD_META } from '../data/circle';

const RADIUS = 130;
const CENTER = 200;

function memberPositions(count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return {
      x: CENTER + RADIUS * Math.cos(angle),
      y: CENTER + RADIUS * Math.sin(angle),
    };
  });
}

export default function NetworkGraph({ members, myState, onSelectMember }) {
  const positions = memberPositions(members.length);
  const myMood = MOOD_META[myState.mood];

  return (
    <div className="w-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-[360px] h-auto"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Single soft violet glow for center node */}
          <filter id="glow-center" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Subtle glow for member nodes */}
          <filter id="glow-node" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Radial gradient for lines */}
          {positions.map((pos, i) => {
            const id = `line-grad-${i}`;
            return (
              <radialGradient key={id} id={id} cx="0%" cy="0%" r="100%"
                gradientUnits="userSpaceOnUse"
                fx={CENTER} fy={CENTER}
                cx2={pos.x} cy2={pos.y}
              >
                <stop offset="0%"   stopColor="rgba(196,167,255,0.55)" />
                <stop offset="100%" stopColor="rgba(196,167,255,0.08)" />
              </radialGradient>
            );
          })}
          {/* Orbit ring gradient */}
          <radialGradient id="orbit-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(190,150,255,0)" />
            <stop offset="80%"  stopColor="rgba(190,150,255,0.06)" />
            <stop offset="100%" stopColor="rgba(190,150,255,0.12)" />
          </radialGradient>
        </defs>

        {/* Faint orbit ring */}
        <circle
          cx={CENTER} cy={CENTER} r={RADIUS}
          fill="none"
          stroke="rgba(190,150,255,0.10)"
          strokeWidth="1"
          strokeDasharray="3 6"
        />

        {/* Connection lines — white/violet gradient, no mood colors */}
        {positions.map((pos, i) => {
          const m = members[i];
          const isAtRisk = m.riskLevel === 'high' || m.riskLevel === 'medium';
          return (
            <motion.line
              key={`line-${m.id}`}
              x1={CENTER} y1={CENTER}
              x2={pos.x}  y2={pos.y}
              stroke={isAtRisk ? 'rgba(230,195,255,0.28)' : 'rgba(196,167,255,0.14)'}
              strokeWidth={m.riskLevel === 'high' ? 1.2 : 0.7}
              strokeDasharray={m.riskLevel === 'medium' ? '5 5' : m.riskLevel === 'high' ? '7 3' : 'none'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: i * 0.1 }}
            />
          );
        })}

        {/* Member nodes — floating pastel gem diamonds */}
        {positions.map((pos, i) => {
          const m = members[i];
          const mm = MOOD_META[m.currentMood];
          const isLow = m.currentMood === 'low' || m.currentMood === 'overwhelmed';
          // Unique rx per node for shape variety: pill, square, soft-diamond
          const gemRx   = [11, 14, 8, 16, 10][i % 5];
          const floatAmt = 5 + (i % 3);
          const floatDur = `${2.6 + i * 0.38}s`;
          const floatDelay = `${i * 0.45}s`;

          return (
            <motion.g
              key={m.id}
              style={{ cursor: 'pointer', transformOrigin: `${pos.x}px ${pos.y}px` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.12 + 0.25 }}
              onClick={() => onSelectMember(m.id)}
            >
              {/* Breathing halo for at-risk — diamond outline */}
              {isLow && (
                <rect
                  x={pos.x - 30} y={pos.y - 30}
                  width={60} height={60}
                  rx={gemRx + 5}
                  fill="none"
                  stroke={mm.color}
                  strokeWidth={0.9}
                  transform={`rotate(45, ${pos.x}, ${pos.y})`}
                >
                  <animate attributeName="strokeOpacity" values="0.32;0;0.32" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="strokeWidth" values="0.9;2.8;0.9" dur="3s" repeatCount="indefinite" />
                </rect>
              )}

              {/* Floating gem group */}
              <g filter="url(#glow-node)">
                <animateTransform
                  attributeName="transform" type="translate"
                  values={`0,0; 0,-${floatAmt}; 0,0`}
                  dur={floatDur}
                  begin={floatDelay}
                  repeatCount="indefinite"
                />
                {/* Gem diamond — rotated squircle with pastel fill */}
                <rect
                  x={pos.x - 19} y={pos.y - 19}
                  width={38} height={38}
                  rx={gemRx}
                  fill={`hsla(${m.avatarHue}, 52%, 76%, 0.84)`}
                  stroke="rgba(255,255,255,0.30)"
                  strokeWidth={1.2}
                  transform={`rotate(45, ${pos.x}, ${pos.y})`}
                />
                {/* Inner shimmer — lighter top half of gem */}
                <rect
                  x={pos.x - 12} y={pos.y - 19}
                  width={24} height={15}
                  rx={gemRx * 0.5}
                  fill="rgba(255,255,255,0.14)"
                  transform={`rotate(45, ${pos.x}, ${pos.y})`}
                />
                {/* Mood dot */}
                <circle
                  cx={pos.x + 16} cy={pos.y - 16} r={4.5}
                  fill={mm.color}
                  fillOpacity={0.88}
                />
                {/* Initials — dark on pastel */}
                <text
                  x={pos.x} y={pos.y + 5}
                  textAnchor="middle"
                  fontSize="13" fontWeight="800"
                  fill="rgba(25,8,55,0.82)"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {m.initials}
                </text>
              </g>

              {/* Name label (stays anchored — not floating) */}
              <text
                x={pos.x} y={pos.y + 44}
                textAnchor="middle"
                fontSize="14"
                fill="rgba(210,195,255,0.45)"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {m.name}
              </text>

              {/* Streak for at-risk */}
              {isLow && m.streakDays > 1 && (
                <text
                  x={pos.x} y={pos.y + 55}
                  textAnchor="middle"
                  fontSize="10"
                  fill={mm.color} fillOpacity={0.65}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {m.streakDays}d
                </text>
              )}
            </motion.g>
          );
        })}

        {/* Center "You" node — gentle rotating bloom */}
        {/* Soft glow backdrop */}
        <circle
          cx={CENTER} cy={CENTER} r={46}
          fill="rgba(90,40,170,0.16)"
          filter="url(#glow-center)"
        />
        {/* Bloom petal A — squircle at ~0°, slow sway */}
        <rect
          x={CENTER - 30} y={CENTER - 30}
          width={60} height={60}
          rx={20}
          fill="rgba(155,100,245,0.22)"
          stroke="rgba(205,175,255,0.42)"
          strokeWidth={1.5}
        >
          <animateTransform
            attributeName="transform" type="rotate"
            values={`0 ${CENTER} ${CENTER}; 7 ${CENTER} ${CENTER}; 0 ${CENTER} ${CENTER}; -7 ${CENTER} ${CENTER}; 0 ${CENTER} ${CENTER}`}
            dur="6s" repeatCount="indefinite"
          />
        </rect>
        {/* Bloom petal B — squircle at 45°, counter-sway */}
        <rect
          x={CENTER - 30} y={CENTER - 30}
          width={60} height={60}
          rx={20}
          fill="rgba(185,140,255,0.14)"
          stroke={myMood.color}
          strokeWidth={1}
          strokeOpacity={0.38}
        >
          <animateTransform
            attributeName="transform" type="rotate"
            values={`45 ${CENTER} ${CENTER}; 38 ${CENTER} ${CENTER}; 45 ${CENTER} ${CENTER}; 52 ${CENTER} ${CENTER}; 45 ${CENTER} ${CENTER}`}
            dur="6s" repeatCount="indefinite"
          />
        </rect>
        {/* YOU label */}
        <text
          x={CENTER} y={CENTER + 5}
          textAnchor="middle"
          fontSize="13" fontWeight="800"
          fill="rgba(240,230,255,0.90)"
          style={{ userSelect: 'none' }}
        >
          YOU
        </text>
        <text
          x={CENTER} y={CENTER + 52}
          textAnchor="middle"
          fontSize="11"
          fill={myMood.color} fillOpacity={0.65}
          style={{ userSelect: 'none' }}
        >
          {myMood.label}
        </text>
      </svg>
    </div>
  );
}
