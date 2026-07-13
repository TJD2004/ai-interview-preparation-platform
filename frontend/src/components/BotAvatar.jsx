import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useTheme } from '../context/ThemeContext';

function Bot({ speaking, listening, theme }) {
  const group = useRef();
  const eyeL = useRef();
  const eyeR = useRef();
  const bars = useRef([]);
  const antennaTip = useRef();
  const ring = useRef();
  const t = useRef(0);

  useFrame((state, delta) => {
    t.current += delta;
    const g = group.current;
    if (!g) return;

    // Gentle idle bob + sway only - no continuous spin, so it never distracts
    g.position.y = Math.sin(t.current * 1.1) * 0.07;
    g.rotation.z = Math.sin(t.current * 0.5) * 0.025;
    g.rotation.y = Math.sin(t.current * 0.35) * (listening ? 0.14 : 0.05);

    // occasional blink
    const blinkCycle = t.current % 4;
    const eyeScale = blinkCycle > 3.85 ? 0.15 : 1;
    if (eyeL.current) eyeL.current.scale.y = eyeScale;
    if (eyeR.current) eyeR.current.scale.y = eyeScale;

    // mouth acts like an equalizer only while speaking, flat otherwise
    bars.current.forEach((bar, i) => {
      if (!bar) return;
      bar.scale.y = speaking
        ? 0.15 + Math.abs(Math.sin(t.current * (6 + i * 2) + i)) * 0.35
        : 0.15;
    });

    // antenna tip pulses faster while listening
    if (antennaTip.current) {
      antennaTip.current.scale.setScalar(
        listening ? 1 + Math.sin(t.current * 6) * 0.3 : 1 + Math.sin(t.current * 1.4) * 0.08
      );
    }

    // slow independent orbiting ring for extra depth - never fast enough to distract
    if (ring.current) {
      ring.current.rotation.x = Math.PI / 2.3 + Math.sin(t.current * 0.3) * 0.08;
      ring.current.rotation.z = t.current * 0.15;
    }
  });

  const glow = speaking ? '#22D3EE' : listening ? '#34D399' : '#D946EF';

  // The bot always contrasts against its surroundings: a light head on the
  // dark theme (matching the reference art), and a deep head on the light
  // theme, so it never washes out against its own page background.
  const isDark = theme !== 'light';
  const headColor = isDark ? '#EFEAFA' : '#2A1B42';
  const trimColor = isDark ? '#3A2B52' : '#D8CFEA';
  const faceColor = '#120B1D';

  return (
    <group ref={group}>
      {/* rounded-square head */}
      <RoundedBox args={[1.7, 1.7, 0.5]} radius={0.35} smoothness={4}>
        <meshStandardMaterial color={headColor} metalness={0.15} roughness={0.5} />
      </RoundedBox>

      {/* ear cups */}
      <mesh position={[-0.95, 0.05, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>
      <mesh position={[0.95, 0.05, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>

      {/* headset arc */}
      <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.035, 8, 24, Math.PI]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>

      {/* antenna */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>
      <mesh ref={antennaTip} position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.5} />
      </mesh>

      {/* face plate */}
      <RoundedBox position={[0, 0, 0.27]} args={[1.25, 1.05, 0.08]} radius={0.22} smoothness={4}>
        <meshStandardMaterial color={faceColor} />
      </RoundedBox>

      {/* eyes */}
      <mesh ref={eyeL} position={[-0.28, 0.15, 0.33]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.2} />
      </mesh>
      <mesh ref={eyeR} position={[0.28, 0.15, 0.33]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.2} />
      </mesh>

      {/* mouth - equalizer bars */}
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <mesh key={i} ref={el => (bars.current[i] = el)} position={[x, -0.22, 0.33]}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* mic boom */}
      <mesh position={[-0.75, -0.35, 0.25]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.025, 0.025, 0.55, 8]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>
      <mesh position={[-0.35, -0.6, 0.3]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>

      {/* orbiting ring - purely decorative, adds 3D depth around the bot */}
      <mesh ref={ring} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[1.7, 0.012, 8, 90]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.7} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

export default function BotAvatar({ speaking = false, listening = false }) {
  const { theme } = useTheme();

  return (
    <div className="bot-avatar-container">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 5]} intensity={1.3} />
        <pointLight position={[-3, -2, -3]} intensity={0.35} color="#22D3EE" />
        <Bot speaking={speaking} listening={listening} theme={theme} />
      </Canvas>
    </div>
  );
}
