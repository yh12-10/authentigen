import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

const GOLD = new THREE.Color("#F5A623");
const BLUE = new THREE.Color("#4F8EF7");
const PARTICLE_COUNT = 2800;

function fibonacciSphere(samples: number, radius: number): Float32Array {
  const positions = new Float32Array(samples * 3);
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    positions[i * 3] = x * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = z * radius;
  }
  return positions;
}

function ParticlePoints() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const positions = fibonacciSphere(PARTICLE_COUNT, 1.4);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const tmp = new THREE.Color();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random();
      tmp.copy(GOLD).lerp(BLUE, t * 0.6);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
      sizes[i] = 0.5 + Math.random() * 1.5;
    }
    return { positions, colors, sizes };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.08;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    // Mouse parallax
    const mx = state.mouse.x * 0.3;
    const my = state.mouse.y * 0.3;
    pointsRef.current.position.x += (mx - pointsRef.current.position.x) * 0.05;
    pointsRef.current.position.y += (my - pointsRef.current.position.y) * 0.05;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1 },
    }),
    []
  );

  return (
    <points ref={pointsRef as ThreeElements["points"]["ref"]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float aSize;
          varying vec3 vColor;
          uniform float uTime;
          uniform float uPixelRatio;
          void main() {
            vColor = color;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            float pulse = 0.85 + 0.15 * sin(uTime * 0.8 + position.y * 4.0);
            gl_PointSize = aSize * pulse * 4.0 * uPixelRatio * (1.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            vec2 c = gl_PointCoord - vec2(0.5);
            float d = length(c);
            float a = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vColor, a);
          }
        `}
      />
    </points>
  );
}

export default function ParticleSphere() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <ParticlePoints />
      </Canvas>
    </div>
  );
}
