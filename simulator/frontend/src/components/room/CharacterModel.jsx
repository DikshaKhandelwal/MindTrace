import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// ─── Deterministic hash from a string ───────────────────────
function hashStr(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── Infer gender signal from name (simple heuristic) ───────
function inferFeminine(name = '') {
  const n = name.toLowerCase().trim();
  const female = ['a','e','i','ie','ia','na','ra','la','sa','ya','ee','ey','elle','ette','emma','lia'];
  return female.some(s => n.endsWith(s)) || ['she','her'].some(w => n.includes(w));
}

// ─── Build full appearance profile from persona ──────────────
function buildAppearance(persona = {}) {
  const rel = (persona.relationship || '').toLowerCase();
  const name = persona.name || '';
  const age = parseInt(persona.age) || 30;
  const seed = hashStr(name + rel);
  const feminine = inferFeminine(name);

  // Skin tone — 6-option diverse palette, seeded
  const skinPalette = [
    { skin: '#fddbb0', lip: '#c87060' },   // very light
    { skin: '#f5c5a3', lip: '#c06858' },   // light
    { skin: '#e8a87c', lip: '#b05a48' },   // medium light
    { skin: '#c98b5a', lip: '#9a4838' },   // medium
    { skin: '#a0623a', lip: '#7a3422' },   // medium dark
    { skin: '#6a3820', lip: '#5a2818' },   // dark
  ];
  const { skin, lip } = skinPalette[seed % skinPalette.length];

  // Hair
  const hairPalette = ['#1c0a00','#2e1a0e','#4a2e12','#6b4423','#8b5e30','#bba060','#d4a055','#e8d0a0','#c0c0c0','#1a1a2e'];
  const hair = hairPalette[(seed >> 2) % hairPalette.length];

  // Hair shape (0=short cap, 1=medium, 2=long, 3=bun, 4=curly)
  const hairStyle = (seed >> 4) % 5;

  // Clothing by relationship
  let shirt, pants, tie = null, hasGlasses = false, jacketColor = null;

  if (rel.includes('boss') || rel.includes('manager') || rel.includes('employer') || rel.includes('ceo')) {
    shirt = feminine ? '#d0c0e0' : '#e8e4f0';
    pants = feminine ? '#434060' : '#1e2a42';
    tie = feminine ? null : '#8b1a1a';
    jacketColor = '#1e2a42';
    hasGlasses = age > 38;
  } else if (rel.includes('doctor') || rel.includes('therapist') || rel.includes('counselor') || rel.includes('nurse')) {
    shirt = '#e8f4f8';
    pants = '#2c4a6e';
    jacketColor = '#e8f8f4';   // white coat
    hasGlasses = (seed % 3) === 0;
  } else if (rel.includes('teacher') || rel.includes('professor') || rel.includes('instructor')) {
    shirt = '#c8dce8';
    pants = '#3a4a5a';
    hasGlasses = age > 35;
  } else if (rel.includes('parent') || rel.includes('mom') || rel.includes('dad')) {
    shirt = feminine ? '#e8c8d0' : '#d4d8cc';
    pants = '#4a4a4a';
  } else if (rel.includes('sibling') || rel.includes('brother') || rel.includes('sister')) {
    const casuals = ['#f87171','#34d399','#60a5fa','#a78bfa','#fbbf24','#f472b6'];
    shirt = casuals[(seed >> 1) % casuals.length];
    pants = '#374151';
  } else if (rel.includes('partner') || rel.includes('girlfriend') || rel.includes('boyfriend') || rel.includes('spouse')) {
    shirt = feminine ? '#fbcfe8' : '#bfdbfe';
    pants = feminine ? '#7c3aed' : '#1e40af';
  } else if (rel.includes('coworker') || rel.includes('colleague')) {
    shirt = '#cbd5e1';
    pants = '#374151';
  } else if (rel.includes('friend')) {
    const friendly = ['#6ee7b7','#93c5fd','#fcd34d','#f9a8d4','#a5b4fc'];
    shirt = friendly[(seed >> 3) % friendly.length];
    pants = ['#374151','#1e3a5f','#292524','#3b0764'][(seed >> 5) % 4];
  } else if (rel.includes('stranger') || rel.includes('customer') || rel.includes('client')) {
    shirt = '#f0f0f0';
    pants = '#374151';
  } else {
    shirt = '#8b5cf6';
    pants = '#4c1d95';
  }

  // Body scale by age/gender
  const bodyW  = feminine ? 0.46 : 0.54;
  const bodyH  = feminine ? 0.58 : 0.64;
  const hipW   = feminine ? 0.52 : 0.48;
  const shoulderW = feminine ? 0.28 : 0.34;
  const headR  = age < 12 ? 0.21 : (feminine ? 0.215 : 0.225);
  const eyeSpread = headR * 0.4;

  return { skin, lip, hair, hairStyle, shirt, pants, tie, jacketColor, hasGlasses,
           feminine, bodyW, bodyH, hipW, shoulderW, headR, eyeSpread,
           age, seed };
}

// ─── Shared material helper ──────────────────────────────────
function M({ color, roughness = 0.75, metalness = 0, emissive, emissiveIntensity = 0, transparent, opacity = 1 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={emissive || color}
      emissiveIntensity={emissive ? emissiveIntensity : 0}
      transparent={transparent}
      opacity={opacity}
    />
  );
}

// ─── Hair component — different styles ───────────────────────
function Hair({ style, color, headR, feminine }) {
  const r = headR;
  const c = color;
  switch (style) {
    case 1: // medium length — drape over sides
      return (
        <>
          <mesh position={[0, r * 0.28, -r * 0.12]}>
            <sphereGeometry args={[r * 1.025, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
            <M color={c} roughness={0.95} />
          </mesh>
          {/* Side drapes */}
          <mesh position={[-r * 0.88, -r * 0.15, 0]} rotation={[0, 0.3, 0.2]}>
            <capsuleGeometry args={[r * 0.18, r * 0.4, 6, 8]} />
            <M color={c} roughness={0.95} />
          </mesh>
          <mesh position={[r * 0.88, -r * 0.15, 0]} rotation={[0, -0.3, -0.2]}>
            <capsuleGeometry args={[r * 0.18, r * 0.4, 6, 8]} />
            <M color={c} roughness={0.95} />
          </mesh>
        </>
      );
    case 2: // long hair — reaches shoulders
      return (
        <>
          <mesh position={[0, r * 0.28, -r * 0.1]}>
            <sphereGeometry args={[r * 1.028, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <M color={c} roughness={0.95} />
          </mesh>
          <mesh position={[-r * 0.82, -r * 0.3, -r * 0.1]} rotation={[0.15, 0.2, 0.15]}>
            <capsuleGeometry args={[r * 0.2, r * 0.75, 6, 8]} />
            <M color={c} roughness={0.95} />
          </mesh>
          <mesh position={[r * 0.82, -r * 0.3, -r * 0.1]} rotation={[0.15, -0.2, -0.15]}>
            <capsuleGeometry args={[r * 0.2, r * 0.75, 6, 8]} />
            <M color={c} roughness={0.95} />
          </mesh>
          <mesh position={[0, -r * 0.55, -r * 0.55]} rotation={[0.1, 0, 0]}>
            <capsuleGeometry args={[r * 0.24, r * 0.5, 6, 8]} />
            <M color={c} roughness={0.95} />
          </mesh>
        </>
      );
    case 3: // bun
      return (
        <>
          <mesh position={[0, r * 0.28, 0]}>
            <sphereGeometry args={[r * 1.025, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <M color={c} roughness={0.95} />
          </mesh>
          <mesh position={[0, r * 0.88, -r * 0.08]}>
            <sphereGeometry args={[r * 0.28, 12, 12]} />
            <M color={c} roughness={0.95} />
          </mesh>
        </>
      );
    case 4: // curly/afro
      return (
        <>
          {[...Array(12)].map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const px = Math.cos(a) * r * 0.85;
            const pz = Math.sin(a) * r * 0.85;
            return (
              <mesh key={i} position={[px, r * 0.18 + Math.abs(Math.sin(a)) * r * 0.3, pz]}>
                <sphereGeometry args={[r * 0.32, 8, 8]} />
                <M color={c} roughness={1} />
              </mesh>
            );
          })}
          <mesh position={[0, r * 0.55, 0]}>
            <sphereGeometry args={[r * 0.65, 12, 12]} />
            <M color={c} roughness={1} />
          </mesh>
        </>
      );
    default: // 0 — short cap
      return (
        <mesh position={[0, r * 0.28, -r * 0.08]}>
          <sphereGeometry args={[r * 1.022, 22, 22, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <M color={c} roughness={0.92} />
        </mesh>
      );
  }
}

// ─── Glasses (for older/professional personas) ───────────────
function Glasses({ headR, skinColor }) {
  const r = headR;
  const frameColor = '#1a1a1a';
  return (
    <group position={[0, r * 0.12, r * 0.88]}>
      {/* Left lens frame */}
      <mesh position={[-r * 0.42, 0, 0]}>
        <torusGeometry args={[r * 0.2, r * 0.02, 8, 20]} />
        <M color={frameColor} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Right lens frame */}
      <mesh position={[r * 0.42, 0, 0]}>
        <torusGeometry args={[r * 0.2, r * 0.02, 8, 20]} />
        <M color={frameColor} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Bridge */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[r * 0.015, r * 0.22, 4, 6]} />
        <M color={frameColor} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Lens tint */}
      <mesh position={[-r * 0.42, 0, 0.01]}>
        <circleGeometry args={[r * 0.185, 16]} />
        <M color="#a8d8f0" roughness={0} metalness={0.1} transparent opacity={0.25} />
      </mesh>
      <mesh position={[r * 0.42, 0, 0.01]}>
        <circleGeometry args={[r * 0.185, 16]} />
        <M color="#a8d8f0" roughness={0} metalness={0.1} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// ─── Head component ───────────────────────────────────────────
function Head({ ap, headRef, lBrowRef, rBrowRef, mouthRef }) {
  const { skin, lip, hair, hairStyle, headR, eyeSpread, hasGlasses } = ap;
  const r = headR;
  const eyeZ = r * 0.86;
  const eyeY = r * 0.12;

  // Iris colours — seeded diversity
  const irisColors = ['#3a2008','#1a3a60','#2a5a30','#5a3060','#4a3018','#1c3a4a'];
  const iris = irisColors[ap.seed % irisColors.length];
  const pupil = '#0a0808';
  const sclera = '#f5f0ea';

  return (
    <group ref={headRef} position={[0, 1.58 + r, 0]}>
      {/* Skull — slightly elongated vertically */}
      <mesh castShadow scale={[1, 1.08, 0.95]}>
        <sphereGeometry args={[r, 28, 28]} />
        <M color={skin} roughness={0.62} />
      </mesh>

      {/* Forehead slight brow ridge */}
      <mesh position={[0, r * 0.28, r * 0.74]} scale={[0.85, 0.3, 0.5]}>
        <sphereGeometry args={[r * 0.7, 12, 8]} />
        <M color={skin} roughness={0.7} />
      </mesh>

      {/* ── Hair ── */}
      <Hair style={hairStyle} color={hair} headR={r} feminine={ap.feminine} />

      {/* ── Ears ── */}
      <group position={[-r * 0.96, r * 0.02, 0]}>
        <mesh scale={[0.55, 0.72, 0.35]}>
          <sphereGeometry args={[r * 0.32, 10, 10]} />
          <M color={skin} roughness={0.7} />
        </mesh>
        {/* Ear canal */}
        <mesh position={[r * 0.08, 0, 0]}>
          <sphereGeometry args={[r * 0.1, 8, 8]} />
          <M color={skin} roughness={0.9} />
        </mesh>
      </group>
      <group position={[r * 0.96, r * 0.02, 0]}>
        <mesh scale={[0.55, 0.72, 0.35]}>
          <sphereGeometry args={[r * 0.32, 10, 10]} />
          <M color={skin} roughness={0.7} />
        </mesh>
        <mesh position={[-r * 0.08, 0, 0]}>
          <sphereGeometry args={[r * 0.1, 8, 8]} />
          <M color={skin} roughness={0.9} />
        </mesh>
      </group>

      {/* ── Eyes ── Left */}
      <group position={[-eyeSpread, eyeY, eyeZ]}>
        {/* Sclera */}
        <mesh scale={[1, 0.82, 0.55]}>
          <sphereGeometry args={[r * 0.22, 14, 14]} />
          <M color={sclera} roughness={0.25} metalness={0.02} />
        </mesh>
        {/* Iris */}
        <mesh position={[0, 0, r * 0.11]}>
          <circleGeometry args={[r * 0.115, 18]} />
          <M color={iris} roughness={0.3} />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, 0, r * 0.115]}>
          <circleGeometry args={[r * 0.068, 14]} />
          <M color={pupil} roughness={0.1} />
        </mesh>
        {/* Catchlight */}
        <mesh position={[r * 0.04, r * 0.05, r * 0.118]}>
          <circleGeometry args={[r * 0.025, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* ── Eyes ── Right */}
      <group position={[eyeSpread, eyeY, eyeZ]}>
        <mesh scale={[1, 0.82, 0.55]}>
          <sphereGeometry args={[r * 0.22, 14, 14]} />
          <M color={sclera} roughness={0.25} metalness={0.02} />
        </mesh>
        <mesh position={[0, 0, r * 0.11]}>
          <circleGeometry args={[r * 0.115, 18]} />
          <M color={iris} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, r * 0.115]}>
          <circleGeometry args={[r * 0.068, 14]} />
          <M color={pupil} roughness={0.1} />
        </mesh>
        <mesh position={[-r * 0.04, r * 0.05, r * 0.118]}>
          <circleGeometry args={[r * 0.025, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* ── Eyelids — top (slightly over each eye) ── */}
      <mesh position={[-eyeSpread, eyeY + r * 0.065, eyeZ + r * 0.06]} rotation={[0.4, 0, 0]} scale={[1.1, 0.45, 0.5]}>
        <sphereGeometry args={[r * 0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <M color={skin} roughness={0.65} />
      </mesh>
      <mesh position={[eyeSpread, eyeY + r * 0.065, eyeZ + r * 0.06]} rotation={[0.4, 0, 0]} scale={[1.1, 0.45, 0.5]}>
        <sphereGeometry args={[r * 0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <M color={skin} roughness={0.65} />
      </mesh>

      {/* ── Eyebrows ── refs for emotion animation */}
      <mesh ref={lBrowRef} position={[-eyeSpread, eyeY + r * 0.28, eyeZ - r * 0.02]} rotation={[0, 0, ap.feminine ? 0.08 : 0.18]}>
        <capsuleGeometry args={[r * 0.025, r * 0.2, 4, 6]} />
        <M color={hair} roughness={0.85} />
      </mesh>
      <mesh ref={rBrowRef} position={[eyeSpread, eyeY + r * 0.28, eyeZ - r * 0.02]} rotation={[0, 0, ap.feminine ? -0.08 : -0.18]}>
        <capsuleGeometry args={[r * 0.025, r * 0.2, 4, 6]} />
        <M color={hair} roughness={0.85} />
      </mesh>

      {/* ── Nose bridge + tip ── */}
      <mesh position={[0, r * 0.02, eyeZ + r * 0.08]} scale={[0.5, 1, 0.7]}>
        <capsuleGeometry args={[r * 0.055, r * 0.22, 4, 8]} />
        <M color={skin} roughness={0.75} />
      </mesh>
      {/* Nostrils */}
      <mesh position={[-r * 0.1, -r * 0.11, eyeZ + r * 0.12]} scale={[0.7, 0.5, 0.6]}>
        <sphereGeometry args={[r * 0.08, 8, 8]} />
        <M color={skin} roughness={0.8} />
      </mesh>
      <mesh position={[r * 0.1, -r * 0.11, eyeZ + r * 0.12]} scale={[0.7, 0.5, 0.6]}>
        <sphereGeometry args={[r * 0.08, 8, 8]} />
        <M color={skin} roughness={0.8} />
      </mesh>

      {/* ── Mouth / lips ── */}
      <group ref={mouthRef} position={[0, -r * 0.42, eyeZ]} scale={[1, 1, 1]}>
        {/* Upper lip — cupid's bow shape via 3 segments */}
        <mesh position={[-r * 0.14, r * 0.04, 0]}>
          <capsuleGeometry args={[r * 0.028, r * 0.16, 4, 6]} />
          <M color={lip} roughness={0.55} />
        </mesh>
        <mesh position={[r * 0.14, r * 0.04, 0]}>
          <capsuleGeometry args={[r * 0.028, r * 0.16, 4, 6]} />
          <M color={lip} roughness={0.55} />
        </mesh>
        {/* Lower lip — fuller */}
        <mesh position={[0, -r * 0.05, 0]} scale={[1, 0.7, 1]}>
          <capsuleGeometry args={[r * 0.034, r * 0.36, 4, 8]} />
          <M color={lip} roughness={0.5} />
        </mesh>
        {/* Mouth interior */}
        <mesh position={[0, -r * 0.005, -r * 0.02]}>
          <capsuleGeometry args={[r * 0.018, r * 0.25, 4, 6]} />
          <M color="#4a1010" roughness={1} />
        </mesh>
      </group>

      {/* ── Cheeks (subtle blush for softer personalities) ── */}
      {ap.feminine && (
        <>
          <mesh position={[-r * 0.6, -r * 0.05, r * 0.7]} scale={[1, 0.6, 0.3]}>
            <sphereGeometry args={[r * 0.22, 8, 8]} />
            <M color="#f09090" roughness={1} transparent opacity={0.18} />
          </mesh>
          <mesh position={[r * 0.6, -r * 0.05, r * 0.7]} scale={[1, 0.6, 0.3]}>
            <sphereGeometry args={[r * 0.22, 8, 8]} />
            <M color="#f09090" roughness={1} transparent opacity={0.18} />
          </mesh>
        </>
      )}

      {/* ── Glasses (optional) ── */}
      {hasGlasses && <Glasses headR={r} skinColor={skin} />}
    </group>
  );
}

// ─── Jacket/coat layer over torso ────────────────────────────
function JacketLayer({ ap }) {
  if (!ap.jacketColor) return null;
  const isWhiteCoat = ap.jacketColor === '#e8f8f4';
  return (
    <>
      {/* Main jacket body — slightly larger than shirt */}
      <RoundedBox args={[ap.bodyW + 0.07, ap.bodyH + 0.04, 0.3]} radius={0.055} smoothness={4} position={[0, 1.04, 0]}>
        <M color={ap.jacketColor} roughness={isWhiteCoat ? 0.6 : 0.5} />
      </RoundedBox>
      {/* Jacket lapels */}
      <mesh position={[-0.1, 1.15, 0.15]} rotation={[0, 0.2, 0.15]}>
        <boxGeometry args={[0.09, 0.28, 0.04]} />
        <M color={ap.jacketColor} roughness={0.5} />
      </mesh>
      <mesh position={[0.1, 1.15, 0.15]} rotation={[0, -0.2, -0.15]}>
        <boxGeometry args={[0.09, 0.28, 0.04]} />
        <M color={ap.jacketColor} roughness={0.5} />
      </mesh>
      {/* Shirt/collar visible underneath */}
      <mesh position={[0, 1.32, 0.14]}>
        <boxGeometry args={[0.12, 0.12, 0.04]} />
        <M color={ap.shirt} roughness={0.6} />
      </mesh>
    </>
  );
}

// ─── Character component ─────────────────────────────────────
export default function CharacterModel({ persona, isTalking, emotion }) {
  const ap = useMemo(() => buildAppearance(persona), [persona?.name, persona?.relationship]);

  const root    = useRef();
  const body    = useRef();
  const headRef = useRef();
  const lArm    = useRef();
  const rArm    = useRef();
  const mouthRef = useRef();
  const lBrowRef = useRef();
  const rBrowRef = useRef();

  // Emotion → target brow/head deltas
  const emotionTarget = useRef({ headTilt: 0, headNod: 0, browY: 0, browTiltL: 0, browTiltR: 0 });
  useEffect(() => {
    switch (emotion) {
      case 'defensive': case 'frustrated': case 'resistant':
        emotionTarget.current = { headTilt: -0.1, headNod: -0.04, browY: -0.012, browTiltL: -0.06, browTiltR: 0.06 }; break;
      case 'hurt': case 'guilty': case 'vulnerable':
        emotionTarget.current = { headTilt: 0.14, headNod: 0.06, browY: 0.028, browTiltL: 0.14, browTiltR: -0.14 }; break;
      case 'warming': case 'apologetic':
        emotionTarget.current = { headTilt: 0.07, headNod: 0.03, browY: 0.012, browTiltL: 0.05, browTiltR: -0.05 }; break;
      case 'dismissive': case 'confused':
        emotionTarget.current = { headTilt: -0.06, headNod: 0, browY: 0.018, browTiltL: -0.12, browTiltR: 0.05 }; break;
      case 'calm':
        emotionTarget.current = { headTilt: 0, headNod: 0, browY: 0, browTiltL: 0, browTiltR: 0 }; break;
      default:
        emotionTarget.current = { headTilt: 0, headNod: 0, browY: 0, browTiltL: 0, browTiltR: 0 };
    }
  }, [emotion]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const et = emotionTarget.current;

    // Breathing
    if (body.current) body.current.position.y = Math.sin(t * 1.35) * 0.011;

    // Head animation
    if (headRef.current) {
      if (!isTalking) {
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, Math.sin(t * 0.55) * 0.07 + et.headTilt, 0.06);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, Math.sin(t * 0.38) * 0.035, 0.05);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, et.headNod, 0.05);
      } else {
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, Math.sin(t * 5.5) * 0.038 + et.headNod, 0.12);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, Math.sin(t * 2.8) * 0.05 + et.headTilt, 0.1);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, Math.sin(t * 1.9) * 0.025, 0.08);
      }
    }

    // Eyebrow animation
    const browR = ap.headR;
    if (lBrowRef.current) {
      lBrowRef.current.position.y = THREE.MathUtils.lerp(
        lBrowRef.current.position.y,
        browR * 0.28 + et.browY + (isTalking ? Math.sin(t * 4) * 0.003 : 0),
        0.08
      );
      lBrowRef.current.rotation.z = THREE.MathUtils.lerp(lBrowRef.current.rotation.z, (ap.feminine ? 0.08 : 0.18) + et.browTiltL, 0.07);
    }
    if (rBrowRef.current) {
      rBrowRef.current.position.y = THREE.MathUtils.lerp(
        rBrowRef.current.position.y,
        browR * 0.28 + et.browY + (isTalking ? Math.sin(t * 4 + 0.5) * 0.003 : 0),
        0.08
      );
      rBrowRef.current.rotation.z = THREE.MathUtils.lerp(rBrowRef.current.rotation.z, (ap.feminine ? -0.08 : -0.18) + et.browTiltR, 0.07);
    }

    // Arms
    if (lArm.current && rArm.current) {
      const swing = isTalking ? 0.14 : 0.03;
      lArm.current.rotation.z = THREE.MathUtils.lerp(lArm.current.rotation.z, 0.22 + Math.sin(t * 1.35) * swing, 0.06);
      rArm.current.rotation.z = THREE.MathUtils.lerp(rArm.current.rotation.z, -0.22 - Math.sin(t * 1.35 + 0.5) * swing, 0.06);
      if (isTalking) {
        lArm.current.rotation.x = THREE.MathUtils.lerp(lArm.current.rotation.x, Math.sin(t * 3.8) * 0.13 - 0.1, 0.08);
        rArm.current.rotation.x = THREE.MathUtils.lerp(rArm.current.rotation.x, Math.sin(t * 3.8 + 1.1) * 0.11 - 0.05, 0.08);
      } else {
        lArm.current.rotation.x = THREE.MathUtils.lerp(lArm.current.rotation.x, 0, 0.05);
        rArm.current.rotation.x = THREE.MathUtils.lerp(rArm.current.rotation.x, 0, 0.05);
      }
    }

    // Mouth
    if (mouthRef.current) {
      const targetScaleY = isTalking ? 0.55 + Math.abs(Math.sin(t * 8.5)) * 0.9 : 1;
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetScaleY, 0.22);
    }

    // Gentle body sway
    if (root.current) root.current.position.y = Math.sin(t * 0.65) * 0.006;
  });

  const { skin, shirt, pants, bodyW, bodyH, shoulderW } = ap;
  const shoeColor = ap.feminine ? '#5a2c2c' : '#2a2a2a';

  return (
    <group ref={root} position={[0, 0, 0]} castShadow>

      {/* ─── LEGS ────────────────────────────── */}
      {/* Left leg */}
      <mesh position={[-0.115, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.088, 0.078, 0.44, 14]} />
        <M color={pants} />
      </mesh>
      <mesh position={[-0.115, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.076, 0.068, 0.38, 14]} />
        <M color={pants} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.115, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.088, 0.078, 0.44, 14]} />
        <M color={pants} />
      </mesh>
      <mesh position={[0.115, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.076, 0.068, 0.38, 14]} />
        <M color={pants} />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.115, 0.042, 0.05]} castShadow>
        <boxGeometry args={[0.13, 0.075, 0.25]} />
        <M color={shoeColor} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0.115, 0.042, 0.05]} castShadow>
        <boxGeometry args={[0.13, 0.075, 0.25]} />
        <M color={shoeColor} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Shoe toe cap */}
      <mesh position={[-0.115, 0.055, 0.155]} scale={[0.9, 0.6, 0.5]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <M color={shoeColor} roughness={0.45} metalness={0.12} />
      </mesh>
      <mesh position={[0.115, 0.055, 0.155]} scale={[0.9, 0.6, 0.5]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <M color={shoeColor} roughness={0.45} metalness={0.12} />
      </mesh>

      {/* ─── BODY GROUP (breathing) ──────────── */}
      <group ref={body}>
        {/* Shirt/base torso */}
        <RoundedBox args={[bodyW, bodyH, 0.28]} radius={0.058} smoothness={5} position={[0, 1.04, 0]} castShadow>
          <M color={shirt} />
        </RoundedBox>

        {/* Shirt collar */}
        <mesh position={[0, 1.36, 0.12]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.2, 0.06, 0.04]} />
          <M color={shirt} roughness={0.7} />
        </mesh>

        {/* Tie (for formal/boss) */}
        {ap.tie && (
          <group position={[0, 1.18, 0.145]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.06, 0.32, 0.012]} />
              <M color={ap.tie} roughness={0.5} />
            </mesh>
            {/* Tie knot */}
            <mesh position={[0, 0.17, 0.01]}>
              <boxGeometry args={[0.07, 0.06, 0.018]} />
              <M color={ap.tie} roughness={0.4} />
            </mesh>
          </group>
        )}

        {/* Belt */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[bodyW * 0.54, bodyW * 0.54, 0.04, 18]} />
          <M color="#1c1c1c" roughness={0.5} />
        </mesh>
        {/* Belt buckle */}
        <mesh position={[0, 0.75, bodyW * 0.54]}>
          <boxGeometry args={[0.055, 0.04, 0.014]} />
          <M color="#888870" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Jacket / white coat overlay */}
        <JacketLayer ap={ap} />

        {/* ─── ARMS ─────────────────────────── */}
        {/* Left arm */}
        <group ref={lArm} position={[-(shoulderW + 0.04), 1.22, 0]}>
          <mesh position={[0, -0.19, 0]} castShadow>
            <cylinderGeometry args={[0.072, 0.063, 0.36, 12]} />
            <M color={ap.jacketColor || shirt} />
          </mesh>
          <mesh position={[0, -0.39, 0]}>
            <sphereGeometry args={[0.067, 10, 10]} />
            <M color={skin} />
          </mesh>
          <mesh position={[0, -0.57, 0]} castShadow>
            <cylinderGeometry args={[0.062, 0.054, 0.34, 12]} />
            <M color={skin} />
          </mesh>
          {/* Hand — slightly more shaped */}
          <mesh position={[0, -0.76, 0.01]} scale={[1, 0.82, 0.75]}>
            <sphereGeometry args={[0.075, 12, 10]} />
            <M color={skin} roughness={0.7} />
          </mesh>
          {/* Thumb stub */}
          <mesh position={[0.06, -0.74, 0.03]} rotation={[0, 0, -0.6]}>
            <capsuleGeometry args={[0.022, 0.05, 4, 6]} />
            <M color={skin} roughness={0.7} />
          </mesh>
        </group>

        {/* Right arm */}
        <group ref={rArm} position={[shoulderW + 0.04, 1.22, 0]}>
          <mesh position={[0, -0.19, 0]} castShadow>
            <cylinderGeometry args={[0.072, 0.063, 0.36, 12]} />
            <M color={ap.jacketColor || shirt} />
          </mesh>
          <mesh position={[0, -0.39, 0]}>
            <sphereGeometry args={[0.067, 10, 10]} />
            <M color={skin} />
          </mesh>
          <mesh position={[0, -0.57, 0]} castShadow>
            <cylinderGeometry args={[0.062, 0.054, 0.34, 12]} />
            <M color={skin} />
          </mesh>
          <mesh position={[0, -0.76, 0.01]} scale={[1, 0.82, 0.75]}>
            <sphereGeometry args={[0.075, 12, 10]} />
            <M color={skin} roughness={0.7} />
          </mesh>
          <mesh position={[-0.06, -0.74, 0.03]} rotation={[0, 0, 0.6]}>
            <capsuleGeometry args={[0.022, 0.05, 4, 6]} />
            <M color={skin} roughness={0.7} />
          </mesh>
        </group>

        {/* ─── NECK ─────────────────────────── */}
        <mesh position={[0, 1.42, 0]}>
          <cylinderGeometry args={[0.083, 0.093, 0.14, 14]} />
          <M color={skin} roughness={0.65} />
        </mesh>

        {/* ─── HEAD ─────────────────────────── */}
        <Head
          ap={ap}
          headRef={headRef}
          lBrowRef={lBrowRef}
          rBrowRef={rBrowRef}
          mouthRef={mouthRef}
        />
      </group>
    </group>
  );
}
