import { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import RoomEnvironment from './RoomEnvironment';
import CharacterModel from './CharacterModel';

// ─── Cinematic camera — gentle idle drift ────────────────────
function CinematicCamera({ roomType }) {
  const cameraPos = {
    restaurant:   { pos: [0, 1.35, 2.55], look: [0, 1.05, 0] },
    office:       { pos: [0, 1.55, 2.8],  look: [0, 1.1,  -0.2] },
    living_room:  { pos: [0, 1.45, 2.4],  look: [0, 1.05, 0] },
    cafe:         { pos: [0, 1.3,  2.3],  look: [0, 1.0,  0] },
    outdoors:     { pos: [0, 1.6,  2.9],  look: [0, 1.1,  0] },
    bedroom:      { pos: [0, 1.45, 2.5],  look: [0, 1.05, 0] },
    classroom:    { pos: [0, 1.55, 2.8],  look: [0, 1.1,  -0.2] },
    therapy_room: { pos: [0, 1.45, 2.5],  look: [0, 1.05, 0] },
    hospital:     { pos: [0, 1.5,  2.7],  look: [0, 1.1,  -0.1] },
    gym:          { pos: [0, 1.6,  3.0],  look: [0, 1.1,  0] },
    bar:          { pos: [0, 1.35, 2.4],  look: [0, 1.0,  0] },
    kitchen:      { pos: [0, 1.45, 2.5],  look: [0, 1.05, 0] },
  }[roomType] || { pos: [0, 1.35, 2.55], look: [0, 1.05, 0] };

  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    // Very subtle breathing/micro drift
    camera.position.x = cameraPos.pos[0] + Math.sin(t * 0.4) * 0.008;
    camera.position.y = cameraPos.pos[1] + Math.sin(t * 0.7) * 0.006;
    camera.position.z = cameraPos.pos[2] + Math.sin(t * 0.3) * 0.005;
    camera.lookAt(...cameraPos.look);
  });

  return null;
}

// ─── Scene content (inside canvas) ───────────────────────────
function SceneContent({ persona, roomType, isTalking, emotion }) {
  return (
    <>
      <CinematicCamera roomType={roomType} />
      <Suspense fallback={null}>
        <RoomEnvironment roomType={roomType} />
        <CharacterModel
          persona={persona}
          isTalking={isTalking}
          emotion={emotion}
        />
      </Suspense>
    </>
  );
}

// ─── Public component ────────────────────────────────────────
export default function SimRoom({ persona, roomType, isTalking, emotion }) {
  const camPos = {
    restaurant:   [0, 1.35, 2.55],
    office:       [0, 1.55, 2.8],
    living_room:  [0, 1.45, 2.4],
    cafe:         [0, 1.3,  2.3],
    outdoors:     [0, 1.6,  2.9],
    bedroom:      [0, 1.45, 2.5],
    classroom:    [0, 1.55, 2.8],
    therapy_room: [0, 1.45, 2.5],
    hospital:     [0, 1.5,  2.7],
    gym:          [0, 1.6,  3.0],
    bar:          [0, 1.35, 2.4],
    kitchen:      [0, 1.45, 2.5],
  }[roomType] || [0, 1.35, 2.55];

  return (
    <Canvas
      shadows
      camera={{ position: camPos, fov: 58, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%', background: '#e8e0f0' }}
    >
      <SceneContent
        persona={persona}
        roomType={roomType}
        isTalking={isTalking}
        emotion={emotion}
      />
    </Canvas>
  );
}
