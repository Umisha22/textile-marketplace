import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

const LIGHTING_PRESETS = {
  studio: { intensity: 1.2, color: '#ffffff', env: 'studio' },
  daylight: { intensity: 1.0, color: '#fff5e6', env: 'sunset' },
  warm: { intensity: 0.9, color: '#ffe0b2', env: 'warehouse' },
};

const FABRIC_COLORS = {
  cotton: '#e8dcc8',
  linen: '#d4c9a8',
  silk: '#f0e6d3',
  wool: '#8b7d6b',
  denim: '#3b5998',
  velvet: '#4a0e2e',
};

function FabricPlane({ fabricType = 'cotton', color, roughness = 0.8 }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const baseColor = color || FABRIC_COLORS[fabricType] || FABRIC_COLORS.cotton;

  const weaveTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    const threadWidth = fabricType === 'silk' ? 1 : fabricType === 'velvet' ? 3 : 2;
    const gap = fabricType === 'silk' ? 2 : fabricType === 'linen' ? 5 : 3;

    ctx.globalAlpha = 0.15;
    for (let x = 0; x < size; x += threadWidth + gap) {
      ctx.fillStyle = x % ((threadWidth + gap) * 2) < threadWidth + gap ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(x, 0, threadWidth, size);
    }
    for (let y = 0; y < size; y += threadWidth + gap) {
      ctx.fillStyle = y % ((threadWidth + gap) * 2) < threadWidth + gap ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';
      ctx.fillRect(0, y, size, threadWidth);
    }

    if (fabricType === 'denim') {
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x, y, 1, 2);
      }
    }

    if (fabricType === 'silk') {
      ctx.globalAlpha = 0.08;
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, 'rgba(255,255,255,0.2)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(255,255,255,0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, [baseColor, fabricType]);

  const bumpTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    const step = fabricType === 'silk' ? 3 : fabricType === 'velvet' ? 6 : 4;
    ctx.globalAlpha = 0.3;
    for (let x = 0; x < size; x += step) {
      ctx.fillStyle = x % (step * 2) < step ? '#666' : '#999';
      ctx.fillRect(x, 0, 1, size);
    }
    for (let y = 0; y < size; y += step) {
      ctx.fillStyle = y % (step * 2) < step ? '#707070' : '#909090';
      ctx.fillRect(0, y, size, 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, [fabricType]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.03;
    }
  });

  const roughnessVal = fabricType === 'silk' ? 0.2 : fabricType === 'velvet' ? 0.95 : fabricType === 'linen' ? 0.85 : 0.7;
  const metalnessVal = fabricType === 'silk' ? 0.15 : 0.0;

  return (
    <mesh ref={meshRef} rotation={[-0.3, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[3.5, 3.5, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        map={weaveTexture}
        bumpMap={bumpTexture}
        bumpScale={0.02}
        roughness={roughnessVal}
        metalness={metalnessVal}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FloatingThreads() {
  const groupRef = useRef();
  const threads = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      pos: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, -0.5 + Math.random() * 0.5],
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: [0.5 + Math.random() * 1.5, 0.005, 0.005],
      speed: 0.2 + Math.random() * 0.4,
      color: i % 3 === 0 ? '#D4A853' : i % 3 === 1 ? '#00D4AA' : '#9B958D',
    })), []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.y += Math.sin(state.clock.elapsedTime * threads[i].speed) * 0.001;
        child.rotation.z += threads[i].speed * 0.002;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {threads.map((t) => (
        <mesh key={t.id} position={t.pos} rotation={t.rot} scale={t.scale}>
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial color={t.color} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ fabricType, color, lighting }) {
  const preset = LIGHTING_PRESETS[lighting] || LIGHTING_PRESETS.studio;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={preset.intensity} color={preset.color} />
      <directionalLight position={[-3, 3, 2]} intensity={0.3} color="#D4A853" />
      <FabricPlane fabricType={fabricType} color={color} />
      <FloatingThreads />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function FabricSwatch({
  fabricType = 'cotton',
  color,
  lighting = 'studio',
  className = '',
  interactive = true,
}) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene fabricType={fabricType} color={color} lighting={lighting} />
      </Canvas>
    </div>
  );
}

export { LIGHTING_PRESETS, FABRIC_COLORS };
