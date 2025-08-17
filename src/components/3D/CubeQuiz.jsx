// CubeQuiz.jsx
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";

export default function CubeQuiz({ cubeSize = 6, brickSize = [0.6, 0.3, 0.2] }) {
    const groupRef = useRef();
    const [faceIndex, setFaceIndex] = useState(0);
    const [targetRotation, setTargetRotation] = useState([0, 0, 0]);

    const rotations = [
        [0, 0, 0],               // front
        [0, Math.PI, 0],         // back
        [0, -Math.PI / 2, 0],    // right
        [0, Math.PI / 2, 0],     // left
        [Math.PI / 2, 0, 0],     // top
        [-Math.PI / 2, 0, 0],    // bottom
    ];

    const goNextFace = () => {
        const newFace = (faceIndex + 1) % 6;
        setFaceIndex(newFace);
        setTargetRotation(rotations[newFace]);
    };

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            targetRotation[0],
            0.1
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            targetRotation[1],
            0.1
        );
    });

    return (
        <group ref={groupRef} onClick={goNextFace}>
            {/* Costruzione cubo a mattoni */}
            {Array.from({ length: 6 }).map((_, face) => {
                const [bw, bh, bd] = brickSize;
                const half = cubeSize / 2;
                const bricksPerRow = Math.floor(cubeSize / bw);
                const bricksPerCol = Math.floor(cubeSize / bh);
                const bricks = [];

                for (let y = 0; y < bricksPerCol; y++) {
                    for (let x = 0; x < bricksPerRow; x++) {
                        let position = [0, 0, 0];
                        let rotation = [0, 0, 0];
                        switch (face) {
                            case 0: position = [(x + 0.5) * bw - half, (y + 0.5) * bh - half, half]; break;
                            case 1: position = [(x + 0.5) * bw - half, (y + 0.5) * bh - half, -half]; break;
                            case 2: position = [half, (y + 0.5) * bh - half, (x + 0.5) * bw - half]; rotation = [0, Math.PI / 2, 0]; break;
                            case 3: position = [-half, (y + 0.5) * bh - half, (x + 0.5) * bw - half]; rotation = [0, Math.PI / 2, 0]; break;
                            case 4: position = [(x + 0.5) * bw - half, half, (y + 0.5) * bh - half]; rotation = [Math.PI / 2, 0, 0]; break;
                            case 5: position = [(x + 0.5) * bw - half, -half, (y + 0.5) * bh - half]; rotation = [Math.PI / 2, 0, 0]; break;
                        }

                        bricks.push(
                            <group key={`${face}-${x}-${y}`} position={position} rotation={rotation}>
                                <mesh>
                                    <boxGeometry args={brickSize} />
                                    <meshStandardMaterial color="#888888" roughness={1} metalness={0} />
                                </mesh>
                                <lineSegments>
                                    <edgesGeometry args={[new THREE.BoxGeometry(...brickSize)]} />
                                    <lineBasicMaterial color="#333333" />
                                </lineSegments>
                            </group>
                        );
                    }
                }

                // Solo faccia attiva: aggiungi il plane con Text 3D
                if (face === faceIndex) {
                    let planePosition = [5, 5, 5];
                    let planeRotation = [0, 0, 0];
                    switch (face) {
                        case 0: planePosition = [0, 0, half + 0.01]; break;
                        case 1: planePosition = [0, 0, -half - 0.01]; planeRotation = [0, Math.PI, 0]; break;
                        case 2: planePosition = [half + 0.01, 0, 0]; planeRotation = [0, -Math.PI / 2, 0]; break;
                        case 3: planePosition = [-half - 0.01, 0, 0]; planeRotation = [0, Math.PI / 2, 0]; break;
                        case 4: planePosition = [0, half + 0.01, 0]; planeRotation = [Math.PI / 2, 0, 0]; break;
                        case 5: planePosition = [0, -half - 0.01, 0]; planeRotation = [-Math.PI / 2, 0, 0]; break;
                    }

                    bricks.push(
                        <group position={planePosition} rotation={planeRotation}>
                            <mesh renderOrder={999}>
                                <planeGeometry args={[cubeSize, cubeSize]} />
                                <meshBasicMaterial transparent opacity={0} />
                            </mesh>
                            <Text
                                renderOrder={1000}
                                fontSize={cubeSize * 0.5}
                                color="white"
                                anchorX="center"
                                anchorY="middle"
                            >
                                Test Button {face}
                            </Text>
                        </group>
                    );
                }

                return bricks;
            })}
        </group>
    );
}
