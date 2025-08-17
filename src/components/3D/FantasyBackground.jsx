// FantasyBackground.jsx
import React, { useRef, useMemo, useEffect } from "react";
import { Sky, Stars, OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import Terrain from "./Terrain";
export function Dragon({ radius = 10, speed = 0.5, height = 5, scale = 0.5 }) {
  const { scene, animations } = useGLTF("/Quiz/assets/models/dragon_animated.glb");
  const clonedScene = useMemo(() => clone(scene), [scene]);
  const { actions } = useAnimations(animations, clonedScene);
  const ref = useRef();

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      actions[Object.keys(actions)[0]].play();
    }
  }, [actions]);

  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const speedFactor = useMemo(() => 0.5 + Math.random() * 0.5, []);
  const heightFactor = useMemo(() => height + Math.random() * 2, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed * speedFactor + offset;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = heightFactor + Math.sin(t * 2) * 0.5;
      ref.current.rotation.y = Math.atan2(-ref.current.position.x, -ref.current.position.z) - Math.PI / 2;
    }
  });

  return <primitive ref={ref} object={clonedScene} scale={scale} rotation={[0, Math.PI, 0]} />;
}

function Castle() {
  return (
    <mesh position={[0, 3, 0]}>
      <boxGeometry args={[6, 6, 6]} />
      <meshStandardMaterial color="#555555" />
    </mesh>
  );
}

export default function FantasyBackground() {
  return (
    <>
      {/* Cielo dinamico tipo tramonto */}
      <Sky
        distance={450000}
        sunPosition={[50, 10, 20]}   // posizione del sole
        inclination={0.25}           // altezza del sole (0 = tramonto, 0.5 = mezzogiorno)
        azimuth={0.3}                // direzione del sole
        turbidity={8}                // foschia
        rayleigh={2}                 // scattering della luce
        mieCoefficient={0.005}       // scattering dell'atmosfera
        mieDirectionalG={0.8}        // orientamento scattering
      />

      <Stars radius={300} depth={60} count={1000} factor={4} fade />
      <directionalLight position={[100, 100, 100]} intensity={1} />
      <ambientLight intensity={0.5} />
      <Castle />
<Terrain size={100} segments={100} />

      {/* Draghi orbitanti */}
      <Dragon radius={10} speed={0.5} height={5} scale={0.5} />
      <Dragon radius={15} speed={0.3} height={8} scale={0.6} />
      <Dragon radius={12} speed={0.7} height={6} scale={0.4} />
      <Dragon radius={8} speed={0.6} height={7} scale={0.45} />
      <Dragon radius={18} speed={0.4} height={9} scale={0.55} />

      <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
    </>
  );
}
