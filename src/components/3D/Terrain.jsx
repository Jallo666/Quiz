// Terrain.jsx
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export default function Terrain({ scale = 1 }) {
  const { scene } = useGLTF("/Quiz/assets/models/terrain_with_mountains_rivers_and_forest.glb");
  const ref = useRef();

  return <primitive ref={ref} object={scene} scale={scale} position={[0, 0, 0]} />;
}
