import React, { useRef } from "react";
import { Sky, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

import CubeQuiz from "./CubeQuiz";
export default function FantasyBackground(lessons) {
  const lightRef = useRef();
  const { camera } = useThree();

  // Fissa la luce alla direzione della camera
  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);
      lightRef.current.target.position.set(0, 0, 0); // punta al centro della scena
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[50, 10, 20]}
        inclination={0.25}
        azimuth={0.3}
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <Stars radius={300} depth={60} count={1000} factor={4} fade />

      {/* Luce che segue la camera */}
      <directionalLight ref={lightRef} intensity={1} />
      <ambientLight intensity={0.5} />

      {/* Cubo fatto di mattoni */}
      <CubeQuiz lessons={lessons} />
    </>
  );
}
