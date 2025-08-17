import React from "react";
import { Canvas } from "@react-three/fiber";
import FantasyBackground from "./FantasyBackground";

export default function Quiz3D({ lessons, ...props }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 5, 15], fov: 50 }}>
        <FantasyBackground />
        {/* Qui in futuro il cubo con le domande */}
      </Canvas>
    </div>
  );
}
