import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced flame shader for more realistic fire effect
const flameVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flameFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vec2 uv = vUv;
    
    // Create flame shape
    float flame = 1.0 - smoothstep(0.0, 0.8, distance(uv, vec2(0.5, 0.0)));
    
    // Add turbulence
    float turbulence = sin(uv.y * 10.0 + uTime * 3.0) * 0.1;
    turbulence += sin(uv.x * 15.0 + uTime * 2.0) * 0.05;
    
    flame *= (1.0 + turbulence);
    
    // Color gradient from blue to yellow to orange
    vec3 baseColor = mix(
      vec3(0.1, 0.4, 1.0),  // Blue base
      vec3(1.0, 0.3, 0.0),  // Orange tip
      uv.y
    );
    
    vec3 hotColor = mix(
      vec3(1.0, 1.0, 0.2),  // Yellow core
      baseColor,
      distance(uv, vec2(0.5, 0.3))
    );
    
    // Final flame effect
    float intensity = flame * (0.8 + sin(uTime * 4.0) * 0.2);
    vec3 finalColor = hotColor * intensity;
    
    gl_FragColor = vec4(finalColor, flame * 0.8);
  }
`;

// Dynamic flame component with enhanced realism
const Flame: React.FC<{ position: [number, number, number]; intensity?: number }> = ({ 
  position, 
  intensity = 1.0 
}) => {
  const flameRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (flameRef.current) {
      // Subtle flame movement
      flameRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  return (
    <mesh ref={flameRef} position={position}>
      <planeGeometry args={[0.4, 0.8]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={flameVertexShader}
        fragmentShader={flameFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Enhanced candle with better materials and lighting
const Candle: React.FC<{ 
  position: [number, number, number]; 
  index: number; 
  candleHeight: number;
}> = ({ position, index, candleHeight }) => {
  const candleRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (candleRef.current) {
      // Subtle candle movement from air currents
      candleRef.current.rotation.z = Math.sin(state.clock.elapsedTime + index) * 0.02;
    }
  });

  return (
    <group ref={candleRef} position={position} castShadow>
      {/* Candle body with realistic wax material */}
      <mesh position={[0, candleHeight * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, candleHeight, 16]} />
        <meshStandardMaterial 
          color={new THREE.Color(0.95, 0.92, 0.85)}
          roughness={0.6}
          metalness={0.02}
          bumpScale={0.1}
        />
      </mesh>

      {/* Wick */}
      <mesh position={[0, candleHeight, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 8]} />
        <meshStandardMaterial 
          color={new THREE.Color(0.2, 0.15, 0.1)}
          roughness={0.9}
        />
      </mesh>

      {/* Wax drips for realism */}
      <mesh position={[0.08, candleHeight * 0.8, 0]}>
        <sphereGeometry args={[0.02, 8, 6]} />
        <meshStandardMaterial 
          color={new THREE.Color(0.93, 0.90, 0.83)}
          roughness={0.7}
        />
      </mesh>

      {/* Melted wax pool on top */}
      <mesh position={[0, candleHeight + 0.02, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial 
          color={new THREE.Color(0.98, 0.95, 0.88)}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Enhanced point light for flame glow */}
      <pointLight
        position={[0, candleHeight + 0.2, 0]}
        intensity={0.8 + index * 0.1}
        color={new THREE.Color(1, 0.7, 0.4)}
        distance={3}
        decay={2}
      />

      {/* Soft ambient glow */}
      <pointLight
        position={[0, candleHeight + 0.1, 0]}
        intensity={0.3}
        color={new THREE.Color(1, 0.8, 0.6)}
        distance={1.5}
        decay={1}
      />

      {/* Verbesserte Flamme mit höherer Intensität */}
      <Flame position={[0, candleHeight * 0.12, 0]} intensity={1.0 + index * 0.15} />
    </group>
  );
};

const PortraitImage: React.FC<{ url: string }> = ({ url }) => {
  const texture = useTexture(url);
  
  React.useEffect(() => {
    if (texture) {
      texture.flipY = false;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    }
  }, [texture]);

  return (
    <mesh position={[0, 2.5, -2.35]} scale={[3.8, 4.8, 0.05]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

interface WebGLCandleProps {
  candleCount?: number;
  className?: string;
  portraitUrl?: string;
}

const CandleScene: React.FC<{ candleCount: number; portraitUrl?: string }> = ({ candleCount, portraitUrl }) => {
  // Better candle positioning - elegant arrangement
  const candlePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    
    // Arrange candles in elegant formation around the portrait
    const arrangements = [
      [-3.2, -0.4, 1.0],  // Left side, front
      [-1.5, -0.4, 1.8],  // Left center, back
      [0, -0.4, 2.5],     // Center, furthest back
      [1.5, -0.4, 1.8],   // Right center, back
      [3.2, -0.4, 1.0],   // Right side, front
      [-2.5, -0.4, 3.0],  // Left back
      [2.5, -0.4, 3.0],   // Right back
    ];
    
    for (let i = 0; i < Math.min(candleCount, 7); i++) {
      positions.push(arrangements[i] as [number, number, number]);
    }
    
    return positions;
  }, [candleCount]);

  return (
    <>
      <ambientLight intensity={0.2} color={new THREE.Color(1, 0.95, 0.9)} />

      {/* Sophisticated lighting setup for memorial atmosphere */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.8}
        color={new THREE.Color(1, 0.98, 0.95)}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Render memorial frame and portrait if URL provided */}
      {portraitUrl && (
        <group>
          {/* Elegant decorative frame */}
          <mesh position={[0, 2.5, -2.4]}>
            <boxGeometry args={[4.5, 5.8, 0.15]} />
            <meshStandardMaterial 
              color={new THREE.Color(0.4, 0.3, 0.2)}
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>

          {/* Frame mat/border */}
          <mesh position={[0, 2.5, -2.38]}>
            <boxGeometry args={[4.0, 5.2, 0.08]} />
            <meshStandardMaterial 
              color={new THREE.Color(0.9, 0.88, 0.85)}
              roughness={0.1}
              metalness={0.05}
            />
          </mesh>
          
          {/* Portrait photo - using PortraitImage component */}
          <Suspense fallback={null}>
            <PortraitImage url={portraitUrl} />
          </Suspense>

          {/* Portrait lighting - adjusted for new position */}
          <spotLight
            position={[0, 5, -1]}
            target-position={[0, 2.5, -2.35]}
            intensity={0.8}
            color={new THREE.Color(1, 0.98, 0.96)}
            angle={Math.PI / 6}
            penumbra={0.3}
            distance={15}
            decay={1.2}
          />
        </group>
      )}

      {/* Render candles */}
      {candlePositions.map((position, index) => (
        <Candle
          key={`candle-${index}`}
          position={position}
          index={index}
          candleHeight={1.8}
        />
      ))}

      {/* Elegant ground/surface */}
      <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color={new THREE.Color(0.15, 0.12, 0.1)} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Enhanced atmospheric lighting */}
      <pointLight
        position={[0, 4, 0]}
        intensity={0.4}
        color={new THREE.Color(1, 0.85, 0.7)}
        distance={12}
        decay={1.8}
      />

      {/* Warm side lighting */}
      <spotLight
        position={[-6, 8, 4]}
        intensity={0.3}
        color={new THREE.Color(1, 0.8, 0.7)}
        angle={Math.PI / 4}
        penumbra={0.9}
        distance={20}
        decay={1.5}
      />
      
      <spotLight
        position={[6, 8, 4]}
        intensity={0.3}
        color={new THREE.Color(1, 0.8, 0.7)}
        angle={Math.PI / 4}
        penumbra={0.9}
        distance={20}
        decay={1.5}
      />
    </>
  );
};

const WebGLCandle: React.FC<WebGLCandleProps> = ({ candleCount = 5, className = "", portraitUrl }) => {
  return (
    <div className={`w-full h-96 ${className}`}>
      <Canvas
        camera={{ 
          position: [0, 3, 8], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: 'transparent' }}
      >
        <CandleScene candleCount={candleCount} portraitUrl={portraitUrl} />
      </Canvas>
    </div>
  );
};

export default WebGLCandle;