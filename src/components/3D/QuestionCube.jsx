// src/components/3D/QuestionCube.jsx
import React from "react";

export default function QuestionCube() {
  return (
    <mesh>
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
