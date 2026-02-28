// RoomEnvironment — fully self-contained, no CDN dependencies
// 12 room types: restaurant, office, living_room, cafe, outdoors, bedroom,
//                classroom, therapy_room, hospital, gym, bar, kitchen

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

// ─── Shared material shorthand ────────────────────────────────
function M({ color, roughness = 0.75, metalness = 0, emissive, emissiveIntensity = 0, transparent, opacity = 1 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={emissive || '#000000'}
      emissiveIntensity={emissiveIntensity}
      transparent={transparent}
      opacity={opacity}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
//  SHARED PROP COMPONENTS
// ═══════════════════════════════════════════════════════════════

function WoodFloor({ size = [16, 16], color = '#6b4423' }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={size} />
      <M color={color} roughness={0.52} metalness={0.03} />
    </mesh>
  );
}

function Ceiling({ height = 4.5, size = [16, 16], color = '#f5efe6' }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
      <planeGeometry args={size} />
      <M color={color} roughness={1} />
    </mesh>
  );
}

function BackWall({ z = -6, height = 4.5, width = 16, color = '#d6c4ae' }) {
  return (
    <mesh position={[0, height / 2, z]} receiveShadow>
      <planeGeometry args={[width, height]} />
      <M color={color} roughness={0.9} />
    </mesh>
  );
}

function SideWalls({ x = 7, height = 4.5, depth = 16, color = '#d6c4ae' }) {
  return (
    <>
      <mesh position={[-x, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <M color={color} roughness={0.9} />
      </mesh>
      <mesh position={[x, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <M color={color} roughness={0.9} />
      </mesh>
    </>
  );
}

function GlowWindow({ position, size = [2.6, 2.0], color = '#cce8ff', intensity = 1.1 }) {
  return (
    <>
      <mesh position={position}>
        <planeGeometry args={size} />
        <M color={color} emissive={color} emissiveIntensity={intensity} transparent opacity={0.9} />
      </mesh>
      {[[-size[0] / 2, 0], [size[0] / 2, 0]].map(([ox], i) => (
        <mesh key={i} position={[position[0] + ox, position[1], position[2] + 0.01]}>
          <boxGeometry args={[0.045, size[1] + 0.06, 0.04]} />
          <M color="#c8b89a" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[position[0], position[1], position[2] + 0.01]}>
        <boxGeometry args={[size[0] + 0.06, 0.045, 0.04]} />
        <M color="#c8b89a" roughness={0.6} />
      </mesh>
    </>
  );
}

function Candle({ position }) {
  const flameRef = useRef();
  useFrame(({ clock }) => {
    if (flameRef.current) {
      const t = clock.getElapsedTime();
      flameRef.current.position.y = 0.04 + Math.sin(t * 8 + position[0] * 10) * 0.005;
      flameRef.current.scale.x = 0.85 + Math.sin(t * 11) * 0.18;
    }
  });
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.018, 0.02, 0.1, 8]} />
        <M color="#f5f0e8" />
      </mesh>
      <group ref={flameRef} position={[0, 0.08, 0]}>
        <mesh scale={[1, 1.6, 1]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshStandardMaterial color="#ffaa20" emissive="#ff7700" emissiveIntensity={2.5} />
        </mesh>
      </group>
      <pointLight position={[0, 0.15, 0]} intensity={0.35} color="#ff8800" distance={1.4} />
    </group>
  );
}

function WineGlass({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.038, 0.024, 0.18, 12]} />
        <M color="#e8f4ff" roughness={0.05} metalness={0.05} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.07, 6]} />
        <M color="#e8f4ff" roughness={0.05} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.008, 12]} />
        <M color="#e8f4ff" roughness={0.05} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, 0.086, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.06, 12]} />
        <M color="#7a1020" roughness={0.1} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function Pendant({ position, small }) {
  const s = small ? 0.7 : 1;
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.003, 0.003, 0.6 * s, 4]} />
        <M color="#888888" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.42 * s, 0]} scale={[s, s, s]}>
        <cylinderGeometry args={[0.12, 0.08, 0.18, 14]} />
        <M color="#1c1c1c" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.43 * s, 0]}>
        <circleGeometry args={[0.075 * s, 12]} />
        <meshStandardMaterial color="#fff5cc" emissive="#ffe090" emissiveIntensity={2.5} />
      </mesh>
      <pointLight position={[0, -0.5 * s, 0]} intensity={0.9 * s} color="#ffe090" distance={4} />
    </group>
  );
}

function Chair({ position, rotation, small }) {
  const s = small ? 0.85 : 1;
  const sc = '#7c5030';
  return (
    <group position={position || [0, 0, 0]} rotation={rotation || [0, 0, 0]}>
      <mesh position={[0, 0.45 * s, 0]} castShadow>
        <boxGeometry args={[0.42 * s, 0.045 * s, 0.42 * s]} />
        <M color={sc} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.78 * s, -0.19 * s]} castShadow>
        <boxGeometry args={[0.42 * s, 0.62 * s, 0.045 * s]} />
        <M color={sc} roughness={0.7} />
      </mesh>
      {[[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].map(([x, z], i) => (
        <mesh key={i} position={[x * s, 0.225 * s, z * s]} castShadow>
          <cylinderGeometry args={[0.018 * s, 0.018 * s, 0.44 * s, 6]} />
          <M color={sc} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function OfficeChair({ position }) {
  return (
    <group position={position || [0, 0, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.08, 18]} />
        <M color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.9, -0.22]} castShadow>
        <boxGeometry args={[0.44, 0.52, 0.08]} />
        <M color="#1a1a1a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.42, 8]} />
        <M color="#888888" metalness={0.8} roughness={0.3} />
      </mesh>
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <mesh key={i} position={[Math.cos(deg * Math.PI / 180) * 0.26, 0.04, Math.sin(deg * Math.PI / 180) * 0.26]}
          rotation={[0, -deg * Math.PI / 180, 0]}>
          <boxGeometry args={[0.24, 0.025, 0.04]} />
          <M color="#555555" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Plant({ position }) {
  return (
    <group position={position || [0, 0, 0]}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.36, 14]} />
        <M color="#c06040" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.37, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.155, 12]} />
        <M color="#2a1a08" roughness={1} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.55, 6]} />
        <M color="#2a5a18" roughness={0.9} />
      </mesh>
      {[0, 70, 140, 210, 280].map((deg, i) => (
        <mesh key={i} position={[Math.cos(deg * Math.PI / 180) * 0.22, 0.75 + i * 0.04, Math.sin(deg * Math.PI / 180) * 0.22]}
          rotation={[0.3, deg * Math.PI / 180, 0.5]}>
          <sphereGeometry args={[0.14, 8, 6]} />
          <M color={i % 2 === 0 ? '#3a7a20' : '#2a6818'} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function FloorLamp({ position }) {
  return (
    <group position={position || [0, 0, 0]}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 2.4, 6]} />
        <M color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <cylinderGeometry args={[0.28, 0.18, 0.34, 16, 1, true]} />
        <M color="#f5e8c8" roughness={0.6} />
      </mesh>
      <pointLight position={[0, 2.1, 0]} intensity={1.2} color="#ffd080" distance={4} />
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 12]} />
        <M color="#333333" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Sofa({ position }) {
  return (
    <group position={position || [0, 0, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.22, 0.8]} />
        <M color="#6a5070" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.76, -0.38]} castShadow>
        <boxGeometry args={[2.0, 0.52, 0.18]} />
        <M color="#6a5070" roughness={0.75} />
      </mesh>
      <mesh position={[-0.98, 0.62, 0]} castShadow>
        <boxGeometry args={[0.18, 0.44, 0.8]} />
        <M color="#5a4060" roughness={0.75} />
      </mesh>
      <mesh position={[0.98, 0.62, 0]} castShadow>
        <boxGeometry args={[0.18, 0.44, 0.8]} />
        <M color="#5a4060" roughness={0.75} />
      </mesh>
      {[-0.48, 0, 0.48].map((x, i) => (
        <mesh key={i} position={[x, 0.57, 0.05]}>
          <boxGeometry args={[0.56, 0.12, 0.7]} />
          <M color="#7a6080" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Bookshelf({ position }) {
  const books = ['#c0392b','#2980b9','#27ae60','#8e44ad','#e67e22','#16a085','#d35400','#2c3e50'];
  return (
    <group position={position || [0, 0, 0]}>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 2.2, 0.3]} />
        <M color="#5c3d1a" roughness={0.6} />
      </mesh>
      {[0.3, 0.82, 1.34, 1.86].map((y, i) => (
        <mesh key={i} position={[0, y, 0.01]}>
          <boxGeometry args={[1.1, 0.03, 0.28]} />
          <M color="#7c5030" roughness={0.5} />
        </mesh>
      ))}
      {books.map((c, i) => (
        <mesh key={i} position={[-0.42 + (i % 4) * 0.24, 0.5 + Math.floor(i / 4) * 0.52, 0.06]}>
          <boxGeometry args={[0.09, 0.3 + (i % 3) * 0.06, 0.2]} />
          <M color={c} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function CoffeeCup({ position }) {
  return (
    <group position={position || [0, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.042, 0.034, 0.072, 12]} />
        <M color="#e8e0d8" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.038, 12]} />
        <M color="#3a1a08" roughness={0.2} />
      </mesh>
      <mesh position={[0.056, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.022, 0.006, 6, 10, Math.PI]} />
        <M color="#ddd5c8" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.01, 16]} />
        <M color="#e8e0d8" roughness={0.65} />
      </mesh>
    </group>
  );
}

function BackgroundTable({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.73, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.045, 20]} />
        <M color="#f0ebe2" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.04, 0.095, 0.72, 8]} />
        <M color="#5a3410" roughness={0.7} />
      </mesh>
      <Chair position={[-0.65, 0, 0]} />
      <Chair position={[0.65, 0, 0]} />
    </group>
  );
}

function Bench({ position }) {
  return (
    <group position={position || [0, 0, 0]}>
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.06, 0.48]} />
        <M color="#8b6040" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.78, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.5, 0.06]} />
        <M color="#8b6040" roughness={0.7} />
      </mesh>
      {[-0.65, 0.65].map((x, i) => (
        <mesh key={i} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.08, 0.44, 0.44]} />
          <M color="#6a4820" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.13, 0.2, 1.4, 8]} />
        <M color="#5c3a18" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <coneGeometry args={[1.1, 2.1, 10]} />
        <M color="#2a6a20" roughness={1} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <coneGeometry args={[0.82, 1.6, 10]} />
        <M color="#348a28" roughness={1} />
      </mesh>
    </group>
  );
}

function Frame({ position, color = '#8b6a44' }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.7, 0.55, 0.04]} />
        <M color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[0.58, 0.44, 0.02]} />
        <M color="#d8c8a0" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 1 — RESTAURANT
// ═══════════════════════════════════════════════════════════════
function Restaurant() {
  return (
    <>
      <pointLight position={[0, 3.8, 0.5]} intensity={2.2} color="#ffd580" castShadow distance={12} />
      <pointLight position={[-2.5, 2.5, -1]} intensity={0.6} color="#ff9950" />
      <pointLight position={[2.5, 2.5, -1]}  intensity={0.6} color="#ff9950" />
      <ambientLight intensity={0.3} color="#ffe4c4" />
      <fog attach="fog" args={['#f5e8d8', 8, 22]} />

      <WoodFloor color="#4a2e10" />
      <Ceiling height={4.5} color="#f5efe6" />
      <BackWall z={-6} height={4.5} color="#c9b49a" />
      <SideWalls x={7} height={4.5} color="#d6c4ae" />

      <GlowWindow position={[6.95, 2.3, -0.5]} size={[2.4, 2.0]} color="#cce8ff" intensity={1.1} />
      <pointLight position={[5.5, 2.3, -0.5]} intensity={0.8} color="#cce8ff" />

      <mesh position={[0, 0.38, -5.97]}>
        <boxGeometry args={[14, 0.76, 0.06]} />
        <M color="#a0845c" roughness={0.6} />
      </mesh>

      {/* Main dining table */}
      <mesh position={[0, 0.74, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.68, 0.68, 0.015, 32]} />
        <M color="#f8f4ee" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.73, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.055, 32]} />
        <M color="#7c4a1e" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.37, 0.1]}>
        <cylinderGeometry args={[0.055, 0.13, 0.72, 12]} />
        <M color="#5a3410" roughness={0.6} />
      </mesh>

      <Candle position={[-0.28, 0.755, 0.0]} />
      <Candle position={[0.28, 0.755, 0.2]} />
      <WineGlass position={[-0.15, 0.755, -0.2]} />
      <WineGlass position={[0.15, 0.755, -0.28]} />

      <Pendant position={[0, 3.6, 0.1]} />
      <Pendant position={[-2.8, 3.4, -1.8]} small />
      <Pendant position={[2.8, 3.4, -1.8]} small />

      <BackgroundTable position={[-2.6, 0, -2.2]} />
      <BackgroundTable position={[2.6, 0, -2.2]} />
      <BackgroundTable position={[-2.4, 0, -4.0]} />

      <Chair position={[0, 0, -1.05]} />
      <Chair position={[0, 0, 1.15]} rotation={[0, Math.PI, 0]} />

      <pointLight position={[-6.5, 2.0, -2]} intensity={0.5} color="#ffa040" distance={3} />
      <pointLight position={[6.5, 2.0, -2]} intensity={0.5} color="#ffa040" distance={3} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 2 — OFFICE
// ═══════════════════════════════════════════════════════════════
function Office() {
  return (
    <>
      <directionalLight position={[3, 6, 2]} intensity={1.8} castShadow color="#f0f4ff" />
      <ambientLight intensity={0.5} color="#dde8ff" />
      <pointLight position={[0, 4.0, 0]} intensity={0.9} color="#e8f0ff" />
      <fog attach="fog" args={['#eeeeff', 10, 26]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <M color="#9a9488" roughness={1} />
      </mesh>
      <Ceiling height={3.2} color="#f2f2f0" />
      <BackWall z={-6} height={3.2} color="#e8e6e0" />
      <SideWalls x={7} height={3.2} color="#eceae4" />

      <GlowWindow position={[6.95, 1.9, 0.5]} size={[3.5, 2.6]} color="#d0e8ff" intensity={1.2} />
      <pointLight position={[5.5, 2, 0.5]} intensity={1.2} color="#b8d8ff" />
      {[[-0.9, -0.4, 0.1, 0.6, 1.1]].flat().map((y, i) => (
        <mesh key={i} position={[6.96, 1.9 + y * 0.48, 0.5]}>
          <boxGeometry args={[3.5, 0.025, 0.01]} />
          <M color="#c0c8d0" roughness={0.5} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Large executive desk */}
      <mesh position={[0, 0.76, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.06, 0.92]} />
        <M color="#5c3d1a" roughness={0.5} metalness={0.05} />
      </mesh>
      {[[-0.88,-0.1],[0.88,-0.1],[-0.88,0.36],[0.88,0.36]].map(([x,z],i) => (
        <mesh key={i} position={[x, 0.38, z - 0.5]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.76, 8]} />
          <M color="#4a2e0e" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.793, -0.3]}>
        <boxGeometry args={[1.2, 0.006, 0.6]} />
        <M color="#1a2030" roughness={0.9} />
      </mesh>

      {/* Monitor */}
      <mesh position={[0, 1.32, -0.82]} castShadow>
        <boxGeometry args={[0.75, 0.46, 0.042]} />
        <M color="#181818" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.32, -0.799]}>
        <boxGeometry args={[0.69, 0.4, 0.01]} />
        <M color="#0a1628" emissive="#1a3060" emissiveIntensity={0.45} roughness={0} />
      </mesh>
      <mesh position={[0, 0.96, -0.82]}>
        <cylinderGeometry args={[0.026, 0.032, 0.5, 8]} />
        <M color="#1c1c1c" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.795, -0.22]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.44, 0.018, 0.15]} />
        <M color="#2d2d2d" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.32, 0.793, -0.22]}>
        <boxGeometry args={[0.065, 0.018, 0.1]} />
        <M color="#2a2a2a" roughness={0.4} metalness={0.4} />
      </mesh>

      {[['#2563eb',0],['#7c3aed',0.06],['#1e6840',0.12]].map(([c, dy], i) => (
        <mesh key={i} position={[0.66, 0.82 + dy, -0.5]}>
          <boxGeometry args={[0.22, 0.07, 0.16]} />
          <M color={c} roughness={0.8} />
        </mesh>
      ))}

      <group position={[-0.6, 0.82, -0.5]} rotation={[0, -0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.14, 0.18, 0.015]} />
          <M color="#c8a870" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.009]}>
          <boxGeometry args={[0.11, 0.15, 0.005]} />
          <M color="#d8c8b0" roughness={0.9} />
        </mesh>
      </group>

      <OfficeChair position={[0, 0, -1.3]} />

      {/* Filing cabinet */}
      <mesh position={[2.8, 0.7, -5.2]} castShadow>
        <boxGeometry args={[0.55, 1.4, 0.65]} />
        <M color="#a8a8a0" roughness={0.6} metalness={0.2} />
      </mesh>

      {[[-2.2, 0.8],[2.2, 0.8],[-2.2,-1.5],[2.2,-1.5]].map(([x,z],i) => (
        <group key={i}>
          <mesh position={[x, 3.18, z]}>
            <boxGeometry args={[1.4, 0.04, 0.22]} />
            <M color="#f0f0ee" emissive="#e8e8e0" emissiveIntensity={0.6} />
          </mesh>
          <pointLight position={[x, 3.1, z]} intensity={0.4} color="#e8f0ff" distance={5} />
        </group>
      ))}

      <Plant position={[3.0, 0, -1.5]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 3 — LIVING ROOM
// ═══════════════════════════════════════════════════════════════
function LivingRoom() {
  return (
    <>
      <pointLight position={[-2, 2.6, 0.8]} intensity={1.5} color="#ffd0a0" castShadow />
      <pointLight position={[2.5, 3.2, -1.5]} intensity={0.6} color="#ffe8cc" />
      <ambientLight intensity={0.38} color="#ffe8d0" />
      <fog attach="fog" args={['#f0e8e0', 9, 20]} />

      <WoodFloor color="#c8a87a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[3.4, 4.0]} />
        <M color="#7c4a6e" roughness={1} />
      </mesh>
      <Ceiling height={4.0} color="#f5f0ea" />
      <BackWall z={-5.5} height={4.0} color="#e8ddd0" />
      <SideWalls x={7} height={4.0} color="#ece2d4" />

      <Sofa position={[0, 0, -2.2]} />
      <mesh position={[-0.6, 0.72, -1.85]} rotation={[0, 0.3, 0.15]}>
        <boxGeometry args={[0.34, 0.22, 0.1]} />
        <M color="#e88870" roughness={0.8} />
      </mesh>

      {/* Coffee table */}
      <mesh position={[0, 0.38, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.06, 0.65]} />
        <M color="#6b3a1f" roughness={0.55} />
      </mesh>
      {[[-0.45,-0.22],[0.45,-0.22],[-0.45,0.22],[0.45,0.22]].map(([x,z],i) => (
        <mesh key={i} position={[x, 0.19, z - 0.15]}>
          <cylinderGeometry args={[0.022, 0.022, 0.36, 6]} />
          <M color="#5a3010" roughness={0.7} />
        </mesh>
      ))}
      <CoffeeCup position={[0.28, 0.41, -0.15]} />

      <FloorLamp position={[-3.0, 0, -1.6]} />
      <Bookshelf position={[3.4, 0, -4.5]} />
      <Plant position={[-3.6, 0, -4.0]} />

      <Frame position={[-1.2, 2.8, -5.47]} />
      <Frame position={[1.2, 2.8, -5.47]} color="#c4a882" />
      <Frame position={[0, 2.8, -5.47]} color="#8a7050" />

      {/* TV */}
      <mesh position={[0, 0.35, -5.0]} castShadow>
        <boxGeometry args={[2.0, 0.7, 0.4]} />
        <M color="#3a3028" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.85, -4.82]}>
        <boxGeometry args={[1.4, 0.82, 0.06]} />
        <M color="#111111" roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.85, -4.79]}>
        <boxGeometry args={[1.3, 0.74, 0.01]} />
        <M color="#1a2a40" emissive="#0a1528" emissiveIntensity={0.6} />
      </mesh>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 4 — CAFÉ
// ═══════════════════════════════════════════════════════════════
function Cafe() {
  return (
    <>
      <pointLight position={[0, 3.5, 0]} intensity={1.8} color="#ffcc80" castShadow />
      <pointLight position={[2.2, 2.2, -1.5]} intensity={0.6} color="#ff9940" />
      <ambientLight intensity={0.38} color="#ffe8c0" />
      <fog attach="fog" args={['#f5ead8', 7, 18]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <M color="#c29460" roughness={0.55} />
      </mesh>
      <Ceiling height={3.8} color="#f0e8d8" />
      <BackWall z={-5.0} height={3.8} color="#2a3a2a" />
      <mesh position={[-1.2, 2.2, -4.97]}>
        <planeGeometry args={[1.8, 1.0]} />
        <M color="#3a4a3a" emissive="#4a5a4a" emissiveIntensity={0.3} roughness={1} />
      </mesh>
      <SideWalls x={6.5} height={3.8} color="#e8dcc8" />

      <GlowWindow position={[6.47, 1.96, 0.5]} size={[2.2, 2.0]} color="#ffe8b0" intensity={1.1} />
      <pointLight position={[5.5, 2.0, 0.5]} intensity={0.8} color="#ffd080" />

      {/* Main table */}
      <mesh position={[0, 0.73, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 24]} />
        <M color="#8b5e3c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.36, 0.1]}>
        <cylinderGeometry args={[0.04, 0.1, 0.72, 8]} />
        <M color="#5a3410" roughness={0.7} />
      </mesh>

      <CoffeeCup position={[-0.2, 0.755, 0.05]} />
      <CoffeeCup position={[0.18, 0.755, -0.08]} />
      <Chair position={[0, 0, -0.9]} small />
      <Chair position={[0, 0, 1.1]} rotation={[0, Math.PI, 0]} small />

      {/* Counter */}
      <mesh position={[0, 0.54, -3.6]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.08, 0.6]} />
        <M color="#6b3a1f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.1, -3.6]}>
        <boxGeometry args={[3.8, 0.06, 0.66]} />
        <M color="#8b5e3c" roughness={0.45} />
      </mesh>
      <mesh position={[-1.0, 1.38, -3.56]}>
        <boxGeometry args={[0.38, 0.52, 0.32]} />
        <M color="#1a1a1a" roughness={0.3} metalness={0.6} />
      </mesh>

      <Pendant position={[0, 3.25, 0.1]} />
      <Pendant position={[-2.2, 3.25, -1.5]} small />
      <BackgroundTable position={[-2.8, 0, -1.8]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 5 — OUTDOORS (PARK)
// ═══════════════════════════════════════════════════════════════
function Outdoors() {
  return (
    <>
      <directionalLight position={[5, 9, 3]} intensity={2.6} castShadow color="#fff5e0" />
      <ambientLight intensity={0.55} color="#d0e8ff" />
      <pointLight position={[0, 4, 2]} intensity={0.3} color="#fffbe0" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <M color="#5a8a2a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[2.8, 14]} />
        <M color="#c8b89a" roughness={0.9} />
      </mesh>

      <Bench position={[0, 0, -0.8]} />
      <Tree position={[-3.5, 0, -3]} />
      <Tree position={[3.5, 0, -2.5]} />
      <Tree position={[-5.2, 0, 0.5]} />
      <Tree position={[5.2, 0, -0.5]} />
      <Tree position={[-2.2, 0, -6.0]} />
      <Tree position={[2.8, 0, -6.5]} />

      <mesh position={[0, 0.6, -7.5]}>
        <boxGeometry args={[20, 1.2, 0.8]} />
        <M color="#348a28" roughness={1} />
      </mesh>

      <mesh>
        <sphereGeometry args={[35, 18, 14]} />
        <meshStandardMaterial color="#87ceeb" side={2} roughness={1} />
      </mesh>
      <mesh position={[12, 18, -20]}>
        <circleGeometry args={[2.5, 16]} />
        <meshStandardMaterial color="#fffbe8" emissive="#ffe080" emissiveIntensity={1.5} />
      </mesh>

      <group position={[3.2, 0, 0.8]}>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 4.4, 8]} />
          <M color="#333333" metalness={0.6} roughness={0.5} />
        </mesh>
        <pointLight position={[0, 4.2, 0]} intensity={0.6} color="#ffe8a0" distance={6} />
      </group>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 6 — BEDROOM
// ═══════════════════════════════════════════════════════════════
function Bedroom() {
  return (
    <>
      <pointLight position={[-2.2, 1.7, -0.5]} intensity={1.1} color="#ffd080" castShadow />
      <pointLight position={[2.2, 2.8, -1.5]} intensity={0.35} color="#ffaa60" />
      <ambientLight intensity={0.22} color="#ffcc80" />
      <fog attach="fog" args={['#f0d8c0', 6, 16]} />

      <WoodFloor color="#8a7060" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0.5]}>
        <planeGeometry args={[2.2, 2.2]} />
        <M color="#6080a0" roughness={1} />
      </mesh>
      <Ceiling height={3.5} color="#e8e0d8" />
      <BackWall z={-5.5} height={3.5} color="#c4b8a8" />
      <SideWalls x={5.5} height={3.5} color="#ccc0b0" />

      <GlowWindow position={[5.47, 2.0, -1]} size={[1.8, 1.8]} color="#c8c0e8" intensity={0.9} />
      <mesh position={[5.46, 2.0, -0.05]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 2.6]} />
        <M color="#8a6080" roughness={0.9} transparent opacity={0.85} />
      </mesh>
      <mesh position={[5.46, 2.0, -1.95]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 2.6]} />
        <M color="#8a6080" roughness={0.9} transparent opacity={0.85} />
      </mesh>

      {/* Bed */}
      <group position={[0, 0, -4.0]}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.44, 2.8]} />
          <M color="#5c3d1a" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[1.8, 0.22, 2.6]} />
          <M color="#e8e0dc" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.62, 0.3]}>
          <boxGeometry args={[1.78, 0.18, 2.0]} />
          <M color="#a0b8d8" roughness={0.9} />
        </mesh>
        {[-0.44, 0.44].map((x, i) => (
          <mesh key={i} position={[x, 0.68, -0.85]}>
            <boxGeometry args={[0.74, 0.18, 0.55]} />
            <M color="#f0ecf0" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 0.88, -1.38]} castShadow>
          <boxGeometry args={[2.0, 0.92, 0.1]} />
          <M color="#5c3d1a" roughness={0.5} />
        </mesh>
      </group>

      <group position={[-2.2, 0, -3.5]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.8, 0.5]} />
          <M color="#6b4020" roughness={0.6} />
        </mesh>
        <FloorLamp position={[0, 0.8, 0]} />
      </group>

      <mesh position={[3.2, 0.65, -4.8]} castShadow>
        <boxGeometry args={[1.2, 1.3, 0.55]} />
        <M color="#7c5030" roughness={0.6} />
      </mesh>
      <Plant position={[3.6, 0, -1.0]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 7 — CLASSROOM
// ═══════════════════════════════════════════════════════════════
function Classroom() {
  return (
    <>
      <directionalLight position={[2, 6, 2]} intensity={1.8} castShadow color="#f8f5e8" />
      <ambientLight intensity={0.55} color="#f0eedd" />
      <fog attach="fog" args={['#eeecdf', 10, 24]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <M color="#c8c0a8" roughness={0.85} />
      </mesh>
      <Ceiling height={3.4} color="#f2f0e8" />
      <BackWall z={-6} height={3.4} color="#e8e2d4" />
      <SideWalls x={8} height={3.4} color="#ece6d8" />

      {/* Chalkboard */}
      <mesh position={[0, 1.8, -5.96]}>
        <planeGeometry args={[5.0, 2.4]} />
        <M color="#1a3028" roughness={1} />
      </mesh>
      <mesh position={[0, 1.8, -5.94]}>
        <planeGeometry args={[4.8, 2.2]} />
        <M color="#1e3830" emissive="#264840" emissiveIntensity={0.2} roughness={1} />
      </mesh>
      <mesh position={[0, 0.64, -5.96]}>
        <boxGeometry args={[5.0, 0.06, 0.12]} />
        <M color="#8a7050" roughness={0.7} />
      </mesh>

      {/* Teacher's desk */}
      <mesh position={[0, 0.76, -1.1]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.06, 0.7]} />
        <M color="#8b6040" roughness={0.55} />
      </mesh>
      {[[-0.72,-0.1],[0.72,-0.1],[-0.72,0.24],[0.72,0.24]].map(([x,z],i) => (
        <mesh key={i} position={[x, 0.38, z - 1.1]}>
          <cylinderGeometry args={[0.032, 0.032, 0.76, 6]} />
          <M color="#7a5030" roughness={0.7} />
        </mesh>
      ))}
      <Chair position={[0, 0, -1.8]} />

      {/* Student desks */}
      {[[-2.2,-3.0],[-0.0,-3.0],[2.2,-3.0],[-2.2,-4.5],[0.0,-4.5],[2.2,-4.5]].map(([x,z],i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.74, 0]} castShadow>
            <boxGeometry args={[0.7, 0.035, 0.55]} />
            <M color="#a87840" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.37, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.74, 6]} />
            <M color="#888888" metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Globe */}
      <group position={[2.5, 0.8, -0.9]}>
        <mesh>
          <sphereGeometry args={[0.22, 16, 12]} />
          <M color="#2a6080" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.38, 6]} />
          <M color="#8b6030" roughness={0.7} />
        </mesh>
      </group>

      {[[-3, 1.5],[0, 1.5],[3, 1.5],[-3,-1.0],[0,-1.0],[3,-1.0]].map(([x,z],i) => (
        <group key={i}>
          <mesh position={[x, 3.38, z]}>
            <boxGeometry args={[0.9, 0.04, 0.18]} />
            <M color="#e8e8e0" emissive="#d8d8c8" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[x, 3.25, z]} intensity={0.35} color="#f0f0e0" distance={5} />
        </group>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 8 — THERAPY ROOM
// ═══════════════════════════════════════════════════════════════
function TherapyRoom() {
  return (
    <>
      <pointLight position={[-1.5, 2.8, 0.5]} intensity={1.2} color="#ffd8a8" castShadow />
      <pointLight position={[2, 3, -2]} intensity={0.4} color="#ffe0c0" />
      <ambientLight intensity={0.4} color="#f0ead8" />
      <fog attach="fog" args={['#f0e8e0', 7, 16]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <M color="#a89478" roughness={1} />
      </mesh>
      <Ceiling height={3.2} color="#f0ece6" />
      <BackWall z={-5} height={3.2} color="#dcd0c4" />
      <SideWalls x={6} height={3.2} color="#e0d4c8" />

      {/* Sage feature wall */}
      <mesh position={[0, 1.6, -4.98]}>
        <planeGeometry args={[8, 3.2]} />
        <M color="#8aa898" roughness={0.9} />
      </mesh>

      {/* Therapy couch */}
      <group position={[0, 0, -2.8]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.82, 0.18, 2.0]} />
          <M color="#c8b89a" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.57, -0.88]}>
          <boxGeometry args={[0.82, 0.22, 0.22]} />
          <M color="#c0b090" roughness={0.75} />
        </mesh>
        {[[-0.35,-0.88],[0.35,-0.88],[-0.35,0.88],[0.35,0.88]].map(([x,z],i) => (
          <mesh key={i} position={[x, 0.16, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.32, 6]} />
            <M color="#8b6030" roughness={0.7} />
          </mesh>
        ))}
      </group>

      <Chair position={[0, 0, -0.7]} />

      {/* Side table */}
      <mesh position={[0.85, 0.62, -0.7]}>
        <boxGeometry args={[0.42, 0.04, 0.42]} />
        <M color="#a87840" roughness={0.55} />
      </mesh>
      <mesh position={[0.85, 0.65, -0.7]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.22, 0.015, 0.3]} />
        <M color="#f5f0e8" roughness={0.9} />
      </mesh>
      <mesh position={[0.78, 0.66, -0.58]} rotation={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.22, 6]} />
        <M color="#1a1a1a" roughness={0.5} />
      </mesh>
      <mesh position={[0.85, 0.69, -0.55]}>
        <boxGeometry args={[0.12, 0.075, 0.095]} />
        <M color="#d0e4f0" roughness={0.8} />
      </mesh>

      <FloorLamp position={[-2.5, 0, -0.8]} />
      <Plant position={[2.6, 0, -4.2]} />
      <Frame position={[-1.5, 2.2, -4.96]} color="#a0885c" />
      <Frame position={[1.5, 2.2, -4.96]} color="#7a6848" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 9 — HOSPITAL / CLINIC
// ═══════════════════════════════════════════════════════════════
function Hospital() {
  return (
    <>
      <directionalLight position={[2, 6, 1]} intensity={2.0} castShadow color="#f0f8ff" />
      <ambientLight intensity={0.65} color="#e8f4ff" />
      <fog attach="fog" args={['#eef6ff', 10, 22]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <M color="#dde8f0" roughness={0.75} />
      </mesh>
      <Ceiling height={3.2} color="#f8fbff" />
      <BackWall z={-5.5} height={3.2} color="#e8f0f8" />
      <SideWalls x={7} height={3.2} color="#edf4fa" />

      {/* Examination table */}
      <group position={[0, 0, -2.0]}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.72, 0.12, 2.0]} />
          <M color="#c8d8e8" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.73, 0]}>
          <boxGeometry args={[0.7, 0.06, 1.98]} />
          <M color="#a0c0d8" roughness={0.7} />
        </mesh>
        {[[-0.3,-0.85],[0.3,-0.85],[-0.3,0.85],[0.3,0.85]].map(([x,z],i) => (
          <mesh key={i} position={[x, 0.35, z]}>
            <cylinderGeometry args={[0.035, 0.035, 0.68, 8]} />
            <M color="#a8b8c8" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Doctor's stool */}
      <group position={[0, 0, -0.4]}>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
          <M color="#2a4a6a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.5, 8]} />
          <M color="#a0b0c0" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Desk */}
      <mesh position={[-2.0, 0.76, -4.0]} castShadow>
        <boxGeometry args={[1.6, 0.06, 0.65]} />
        <M color="#c8d8e8" roughness={0.5} />
      </mesh>
      <mesh position={[-2.2, 1.26, -4.1]}>
        <boxGeometry args={[0.55, 0.38, 0.035]} />
        <M color="#1a2030" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-2.2, 1.26, -4.08]}>
        <boxGeometry args={[0.5, 0.34, 0.01]} />
        <M color="#1a3060" emissive="#1a4088" emissiveIntensity={0.5} />
      </mesh>

      {/* Privacy curtain */}
      <mesh position={[2.5, 1.6, -3.5]} rotation={[0, -0.1, 0]}>
        <planeGeometry args={[3.0, 3.2]} />
        <M color="#90b0d0" roughness={0.8} transparent opacity={0.75} />
      </mesh>

      {[[-2, 1.2],[0, 1.2],[2, 1.2]].map(([x,z],i) => (
        <group key={i}>
          <mesh position={[x, 3.18, z]}>
            <boxGeometry args={[1.5, 0.04, 0.2]} />
            <M color="#f5f8ff" emissive="#e8f0ff" emissiveIntensity={0.9} />
          </mesh>
          <pointLight position={[x, 3.0, z]} intensity={0.5} color="#e8f4ff" distance={6} />
        </group>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 10 — GYM
// ═══════════════════════════════════════════════════════════════
function Gym() {
  return (
    <>
      <directionalLight position={[3, 7, 2]} intensity={2.2} castShadow color="#f0f0f0" />
      <ambientLight intensity={0.6} color="#e8e8e8" />
      <fog attach="fog" args={['#e0e0e8', 10, 26]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <M color="#3a3838" roughness={0.95} />
      </mesh>
      {[-2, 0, 2].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, 0]}>
          <planeGeometry args={[0.12, 16]} />
          <M color="#f5c020" roughness={0.8} />
        </mesh>
      ))}
      <Ceiling height={5.5} color="#e8e8e8" />
      <BackWall z={-7} height={5.5} color="#d0d0d8" />
      <SideWalls x={8} height={5.5} color="#d4d4dc" />

      {/* Mirror wall */}
      <mesh position={[0, 2.75, -6.96]}>
        <planeGeometry args={[10, 5.5]} />
        <M color="#c8d4e0" roughness={0.05} metalness={0.6} transparent opacity={0.85} />
      </mesh>

      {/* Dumbbell rack */}
      <group position={[-4.0, 0, -5.5]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.8, 1.1, 0.48]} />
          <M color="#1a1a1a" roughness={0.5} metalness={0.4} />
        </mesh>
        {[0.6, 0.2, -0.2].map((y, i) => (
          <group key={i}>
            {[-0.5, 0, 0.5].map((x, j) => (
              <mesh key={j} position={[x, 0.55 + y * 0.6, 0.26]}>
                <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
                <M color={j === 2 ? '#555555' : '#888888'} metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Treadmill */}
      <group position={[3.5, 0, -5.0]} rotation={[0, 0.2, 0]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.72, 0.18, 1.8]} />
          <M color="#1a1a1a" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.62, 0.04, 1.6]} />
          <M color="#333333" roughness={0.7} />
        </mesh>
      </group>

      {[[-3, 0],[0, 0],[3, 0],[-3,-3],[0,-3],[3,-3]].map(([x,z],i) => (
        <group key={i}>
          <mesh position={[x, 5.45, z]}>
            <cylinderGeometry args={[0.2, 0.16, 0.22, 10]} />
            <M color="#1a1a1a" roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[x, 5.28, z]}>
            <circleGeometry args={[0.14, 10]} />
            <meshStandardMaterial color="#fff8e0" emissive="#ffe080" emissiveIntensity={2.5} />
          </mesh>
          <pointLight position={[x, 5.0, z]} intensity={0.65} color="#ffffe8" distance={7} />
        </group>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 11 — BAR / PUB
// ═══════════════════════════════════════════════════════════════
function Bar() {
  return (
    <>
      <pointLight position={[0, 3.0, 0.5]} intensity={1.4} color="#e08020" castShadow />
      <pointLight position={[-3, 2.0, -1]} intensity={0.7} color="#ff6010" />
      <pointLight position={[3, 2.0, -1]} intensity={0.5} color="#c04010" />
      <ambientLight intensity={0.25} color="#c87020" />
      <fog attach="fog" args={['#2a1808', 5, 16]} />

      <WoodFloor color="#2a1a08" />
      <Ceiling height={3.5} color="#1a1208" />
      <BackWall z={-5.5} height={3.5} color="#1c1204" />
      <SideWalls x={7} height={3.5} color="#201408" />

      {/* Bar counter */}
      <mesh position={[0, 1.1, -3.6]} castShadow receiveShadow>
        <boxGeometry args={[6.0, 1.14, 0.65]} />
        <M color="#3a1a08" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.67, -3.6]}>
        <boxGeometry args={[6.0, 0.05, 0.72]} />
        <M color="#1a1a20" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* Bottle shelf */}
      <mesh position={[0, 2.6, -5.42]}>
        <boxGeometry args={[4.5, 0.04, 0.3]} />
        <M color="#3a2008" roughness={0.6} />
      </mesh>
      {[...Array(8)].map((_, i) => (
        <group key={i} position={[-1.6 + i * 0.46, 2.82, -5.4]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.05, 0.35, 8]} />
            <M color={['#2a5020','#a02008','#c09020','#101830','#3a1808','#a04020','#204038','#601818'][i]}
              roughness={0.2} metalness={0.15} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.022, 0.04, 0.12, 8]} />
            <M color="#1a1a1a" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Bar stool */}
      <group position={[0, 0, -1.8]}>
        <mesh position={[0, 0.74, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 14]} />
          <M color="#1c1c1c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.74, 8]} />
          <M color="#888888" metalness={0.7} roughness={0.3} />
        </mesh>
        {[0,72,144,216,288].map((d,i) => (
          <mesh key={i} position={[Math.cos(d*Math.PI/180)*0.18, 0.06, Math.sin(d*Math.PI/180)*0.18]}
            rotation={[0,-d*Math.PI/180,0]}>
            <boxGeometry args={[0.18, 0.025, 0.04]} />
            <M color="#666666" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Beer glass */}
      <group position={[-0.3, 1.73, -3.3]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.038, 0.18, 12]} />
          <M color="#e8c848" roughness={0.05} transparent opacity={0.72} />
        </mesh>
        <mesh position={[0, 0.098, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.025, 12]} />
          <M color="#f5f0e8" roughness={1} />
        </mesh>
      </group>
      <CoffeeCup position={[0.35, 1.73, -3.35]} />

      {/* Neon sign */}
      <mesh position={[0, 2.8, -5.46]}>
        <boxGeometry args={[1.2, 0.22, 0.04]} />
        <meshStandardMaterial color="#ff3060" emissive="#ff0040" emissiveIntensity={2.0} />
      </mesh>
      <pointLight position={[0, 2.6, -5.0]} intensity={0.8} color="#ff2050" distance={3} />

      {/* Background booth */}
      <group position={[-3.5, 0, -4.8]}>
        <mesh position={[0, 0.55, -0.28]}>
          <boxGeometry args={[1.5, 1.1, 0.16]} />
          <M color="#2a1408" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.36, 0.1]}>
          <boxGeometry args={[1.5, 0.18, 0.7]} />
          <M color="#2a1408" roughness={0.6} />
        </mesh>
      </group>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOM 12 — KITCHEN
// ═══════════════════════════════════════════════════════════════
function Kitchen() {
  return (
    <>
      <directionalLight position={[2, 5, 1]} intensity={1.9} castShadow color="#f8f5e8" />
      <ambientLight intensity={0.5} color="#fff8e8" />
      <pointLight position={[0, 2.8, 0]} intensity={0.8} color="#ffe8c0" />
      <fog attach="fog" args={['#f5f0e8', 8, 18]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <M color="#d8d0c0" roughness={0.7} />
      </mesh>
      <Ceiling height={3.2} color="#f5f2ec" />
      <BackWall z={-5.5} height={3.2} color="#e8e4d8" />
      <SideWalls x={7} height={3.2} color="#ece8dc" />

      {/* Kitchen island */}
      <mesh position={[0, 0.88, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.88, 0.72]} />
        <M color="#d8d0c8" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.92, -0.3]}>
        <boxGeometry args={[1.4, 0.05, 0.72]} />
        <M color="#c8a878" roughness={0.5} />
      </mesh>

      {/* Upper cabinets */}
      <mesh position={[0, 2.4, -5.42]} castShadow>
        <boxGeometry args={[5.0, 0.76, 0.42]} />
        <M color="#e8e0d0" roughness={0.55} />
      </mesh>
      {[-1.6,-0.8,0,0.8,1.6].map((x,i) => (
        <group key={i}>
          <mesh position={[x, 2.4, -5.21]}>
            <boxGeometry args={[0.76, 0.7, 0.04]} />
            <M color="#ddd5c5" roughness={0.5} />
          </mesh>
          <mesh position={[x, 2.28, -5.19]}>
            <boxGeometry args={[0.22, 0.012, 0.016]} />
            <M color="#aaa898" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Lower cabinets + counter */}
      <mesh position={[0, 0.46, -5.42]} castShadow>
        <boxGeometry args={[5.0, 0.88, 0.55]} />
        <M color="#e0d8c8" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.9, -5.3]}>
        <boxGeometry args={[5.0, 0.05, 0.58]} />
        <M color="#3a3830" roughness={0.25} metalness={0.1} />
      </mesh>

      {/* Sink */}
      <mesh position={[-1.2, 0.86, -5.1]}>
        <boxGeometry args={[0.55, 0.04, 0.38]} />
        <M color="#c8d0d8" roughness={0.25} metalness={0.3} />
      </mesh>
      <mesh position={[-1.2, 0.78, -5.1]}>
        <boxGeometry args={[0.46, 0.1, 0.32]} />
        <M color="#a8b8c8" roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh position={[-1.2, 1.06, -5.2]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
        <M color="#a0a8a8" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Stove */}
      <mesh position={[1.2, 0.9, -5.1]}>
        <boxGeometry args={[0.65, 0.04, 0.55]} />
        <M color="#1a1a1a" roughness={0.3} metalness={0.5} />
      </mesh>
      {[[-0.14,-0.12],[0.14,-0.12],[-0.14,0.12],[0.14,0.12]].map(([x,z],i) => (
        <mesh key={i} position={[1.2 + x, 0.93, -5.1 + z]}>
          <cylinderGeometry args={[0.072, 0.072, 0.03, 16]} />
          <M color="#222222" roughness={0.6} />
        </mesh>
      ))}

      {/* Fridge */}
      <mesh position={[-3.5, 1.05, -5.1]} castShadow>
        <boxGeometry args={[0.7, 2.1, 0.68]} />
        <M color="#d8d8d8" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[-3.16, 1.3, -4.76]}>
        <boxGeometry args={[0.025, 0.48, 0.035]} />
        <M color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Kitchen table */}
      <mesh position={[0, 0.76, -2.8]} castShadow>
        <boxGeometry args={[1.6, 0.05, 0.9]} />
        <M color="#a07040" roughness={0.6} />
      </mesh>
      <Chair position={[-0.55, 0, -2.8]} />
      <Chair position={[0.55, 0, -2.8]} />

      <Pendant position={[0, 2.9, -0.3]} />

      {[-1.5,-0.5,0.5,1.5].map((x,i) => (
        <pointLight key={i} position={[x, 1.5, -4.8]} intensity={0.3} color="#ffe8b0" distance={2.5} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CHARACTER SHADOW
// ═══════════════════════════════════════════════════════════════
function CharacterShadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
      <circleGeometry args={[0.68, 32]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.2} />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════
//  REGISTRY + EXPORT
// ═══════════════════════════════════════════════════════════════
const roomComponents = {
  restaurant:   Restaurant,
  office:       Office,
  living_room:  LivingRoom,
  cafe:         Cafe,
  outdoors:     Outdoors,
  bedroom:      Bedroom,
  classroom:    Classroom,
  therapy_room: TherapyRoom,
  hospital:     Hospital,
  gym:          Gym,
  bar:          Bar,
  kitchen:      Kitchen,
};

export default function RoomEnvironment({ roomType }) {
  const Room = roomComponents[roomType] || LivingRoom;
  return (
    <>
      <Room />
      <CharacterShadow />
    </>
  );
}
