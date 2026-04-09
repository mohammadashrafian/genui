"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

type ShapeType = "icosahedron" | "torusKnot" | "octahedron" | "tetrahedron";

function ShapeGeometry({ type }: { type: ShapeType }) {
    switch (type) {
        case "icosahedron":
            return <icosahedronGeometry args={[1, 1]} />;
        case "torusKnot":
            return <torusKnotGeometry args={[0.8, 0.28, 120, 16]} />;
        case "octahedron":
            return <octahedronGeometry args={[1, 0]} />;
        case "tetrahedron":
            return <tetrahedronGeometry args={[1.05, 0]} />;
        default:
            return <icosahedronGeometry args={[1, 1]} />;
    }
}

function FloatingShape({
                           geometry,
                           position,
                           color,
                           speed,
                           floatIntensity,
                           scale = 1,
                       }: {
    geometry: ShapeType;
    position: readonly [number, number, number];
    color: string;
    speed: number;
    floatIntensity: number;
    scale?: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const wireRef = useRef<THREE.Mesh>(null);
    const base = useMemo(() => new THREE.Vector3(...position), [position]);
    const temp = useMemo(() => new THREE.Vector3(), []);
    const { pointer, viewport } = useThree();

    const [hovered, setHovered] = useState(false);
    const [pulse, setPulse] = useState(0);

    useFrame((state, delta) => {
        if (!meshRef.current || !wireRef.current) return;

        const t = state.clock.getElapsedTime();
        const mesh = meshRef.current;
        const wire = wireRef.current;

        // Convert mouse position to world space
        const px = pointer.x * (viewport.width / 2);
        const py = pointer.y * (viewport.height / 2);

        // Dynamic distance calculation
        const dx = mesh.position.x - px;
        const dy = mesh.position.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Magnetic pull to mouse
        if (dist < 3.0) {
            const force = (3.0 - dist) * (hovered ? 0.2 : 0.08);
            temp.set(dx, dy, 0).normalize().multiplyScalar(force);
            mesh.position.x += temp.x;
            mesh.position.y += temp.y;
        }

        // Spring back to base position
        mesh.position.lerp(base, 0.05);
        wire.position.copy(mesh.position);

        // Dynamic rotation based on hover
        const targetSpeed = hovered ? speed * 4 : speed;
        mesh.rotation.x += delta * targetSpeed * 0.5;
        mesh.rotation.y += delta * targetSpeed;
        mesh.rotation.z = Math.cos(t * speed * 0.25) * 0.22 + pointer.x * 0.12;

        wire.rotation.copy(mesh.rotation);

        // Handle click pulse decay
        if (pulse > 0) {
            setPulse((p) => Math.max(0, p - delta * 3.0));
        }

        // Smooth scaling
        const clickBoost = 1 + pulse * 0.5;
        const hoverBoost = hovered ? 1.2 : 1;
        const finalScale = scale * hoverBoost * clickBoost;

        mesh.scale.lerp(new THREE.Vector3(finalScale, finalScale, finalScale), 0.1);
        wire.scale.copy(mesh.scale);

        // Animate emissive intensity for bloom effect
        const material = mesh.material as THREE.MeshStandardMaterial;
        const targetEmissive = hovered ? 2.5 : (pulse > 0 ? 4 : 0.2);
        material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetEmissive, 0.1);
    });

    return (
        <Float speed={speed} floatIntensity={floatIntensity} rotationIntensity={0.5}>
            <group position={position}>
                <mesh
                    ref={meshRef}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        setHovered(true);
                        document.body.style.cursor = "pointer";
                    }}
                    onPointerOut={() => {
                        setHovered(false);
                        document.body.style.cursor = "default";
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setPulse(1);
                    }}
                >
                    <ShapeGeometry type={geometry} />
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={hovered ? 0.6 : 0.15}
                        roughness={0.1}
                        metalness={0.8}
                        emissive={color}
                        emissiveIntensity={0.2} // Controlled in useFrame
                    />
                </mesh>

                <mesh ref={wireRef}>
                    <ShapeGeometry type={geometry} />
                    <meshBasicMaterial
                        color={color}
                        wireframe
                        transparent
                        opacity={hovered ? 0.8 : 0.3}
                    />
                </mesh>
            </group>
        </Float>
    );
}

// Global Camera Parallax Component
function CameraRig() {
    useFrame((state) => {
        // Subtly move the camera based on mouse position
        state.camera.position.lerp(
            new THREE.Vector3(state.pointer.x * 1.5, state.pointer.y * 1.5, 8),
            0.05
        );
        state.camera.lookAt(0, 0, 0);
    });
    return null;
}

function Scene() {
    const shapes = [
        { geometry: "icosahedron", position: [3.5, 1.6, -2.4], color: "#818cf8", speed: 1.1, floatIntensity: 2, scale: 1.15 },
        { geometry: "torusKnot", position: [1.0, -0.5, -2.0], color: "#06b6d4", speed: 0.9, floatIntensity: 1.8, scale: 0.95 },
        { geometry: "octahedron", position: [4.6, -1.7, -3.6], color: "#a78bfa", speed: 1.0, floatIntensity: 1.7, scale: 0.9 },
        { geometry: "tetrahedron", position: [2.5, 2.4, -4.4], color: "#22d3ee", speed: 0.7, floatIntensity: 1.4, scale: 0.75 },
        { geometry: "icosahedron", position: [0.8, 1.8, -5.2], color: "#6366f1", speed: 0.6, floatIntensity: 1.1, scale: 0.6 },
        { geometry: "octahedron", position: [5.4, 0.2, -5.8], color: "#38bdf8", speed: 0.8, floatIntensity: 1.3, scale: 0.55 },
        { geometry: "tetrahedron", position: [3.1, -2.5, -6.2], color: "#8b5cf6", speed: 0.65, floatIntensity: 1.2, scale: 0.5 },
        { geometry: "icosahedron", position: [6.2, 2.2, -6.5], color: "#67e8f9", speed: 0.55, floatIntensity: 1.0, scale: 0.45 },
    ] as const;

    return (
        <>
            <CameraRig />

            <ambientLight intensity={0.5} />
            <pointLight position={[8, 8, 8]} intensity={2} color="#818cf8" />
            <pointLight position={[-8, -6, 4]} intensity={1.5} color="#06b6d4" />

            {shapes.map((shape, index) => (
                <FloatingShape key={index} {...shape} />
            ))}

            <Stars
                radius={50}
                depth={50}
                count={3000}
                factor={4}
                saturation={0}
                fade
                speed={1.5}
            />

            <EffectComposer enableNormalPass={false}>
                <Bloom
                    luminanceThreshold={1.5} // High threshold so only active/hovered items glow
                    mipmapBlur
                    intensity={1.2}
                />
            </EffectComposer>
        </>
    );
}

export default function HeroScene() {
    return (
        <div className="absolute inset-0 z-0 h-full w-full pointer-events-auto">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 58 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
                style={{ width: "100%", height: "100%", background: "transparent" }}
            >
                <Scene />
            </Canvas>
        </div>
    );
}
