import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const EMERALD = new THREE.Color("#34D399");
const VIOLET = new THREE.Color("#8B5CF6");
const MAGENTA = new THREE.Color("#D946EF");

function fibonacciSphere(count: number, radius: number) {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return pts;
}

function NetworkGlobe() {
  const group = useRef<THREE.Group>(null);

  const { nodePositions, nodeColors, linePositions, lineColors } = useMemo(() => {
    const nodes = fibonacciSphere(120, 2.2);

    const nodePos = new Float32Array(nodes.length * 3);
    const nodeCol = new Float32Array(nodes.length * 3);
    nodes.forEach((p, i) => {
      nodePos.set([p.x, p.y, p.z], i * 3);
      const t = (p.y + 2.2) / 4.4;
      const c = EMERALD.clone().lerp(t > 0.5 ? MAGENTA : VIOLET, Math.abs(t - 0.5) * 1.6);
      nodeCol.set([c.r, c.g, c.b], i * 3);
    });

    const segs: number[] = [];
    const cols: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        if (a.distanceTo(b) < 0.95) {
          segs.push(a.x, a.y, a.z, b.x, b.y, b.z);
          const c1 = EMERALD.clone().lerp(VIOLET, (a.y + 2.2) / 4.4);
          const c2 = EMERALD.clone().lerp(MAGENTA, (b.y + 2.2) / 4.4);
          cols.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
        }
      }
    }

    return {
      nodePositions: nodePos,
      nodeColors: nodeCol,
      linePositions: new Float32Array(segs),
      lineColors: new Float32Array(cols),
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.07;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.16;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nodeColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.24}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <mesh>
        <icosahedronGeometry args={[1.72, 1]} />
        <meshBasicMaterial color="#10B981" wireframe transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

export default function HeroNetwork() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6.4], fov: 45 }}
      style={{ pointerEvents: "none" }}
    >
      <NetworkGlobe />
    </Canvas>
  );
}
