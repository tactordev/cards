"use client";
import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, OrbitControls, Center, Resize } from "@react-three/drei";
import * as three from "three";
import { CameraControls } from "three-stdlib";

// always:
// scene, camera, renderer

// function Torus() {
//   const mesh = useRef<three.Mesh>(null);

//   useFrame(() => {
//     if (mesh.current) {
//       mesh.current.rotation.x += 0.01;
//       mesh.current.rotation.y += 0.005;
//       mesh.current.rotation.z += 0.01;
//     }
//   });

//   return (
//     <mesh ref={mesh}>
//       <torusGeometry args={[10, 3, 16, 100]} />
//       <meshStandardMaterial color={0xff6347} wireframe />
//     </mesh>
//   );
// }

function Table() {
  const { scene } = useGLTF("/models/table/scene.gltf");

  return (
    <group scale={12} position={[0, -5, 20]} rotation={[0, 0, 0]}>
      <Center>
        <Resize>
          <primitive object={scene} />
        </Resize>
      </Center>
    </group>
  );
}

function ErrorBox() {
  const mesh = useRef<three.Mesh>(null);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.005;
      mesh.current.rotation.z += 0.01;
    }
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[5, 5, 5]} />
      <meshStandardMaterial color={0xff0000} wireframe />
    </mesh>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -11, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="red" side={three.DoubleSide} />
    </mesh>
  )
}

function BackWall() {
  return (
    <mesh rotation={[0, 0, 0]} position={[0, 0, -10]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="blue" side={three.DoubleSide} />
    </mesh>
  )
}

function PackOfCards() {
    const { scene } = useGLTF("/models/pack_of_cards/scene.gltf");
    return (
        <group scale={0.75} position={[1.5, -1.65, 21.25]} rotation={[Math.PI / 2, -Math.PI/40, -Math.PI/4]}>
            <Center>
                <Resize>
                    <primitive object={scene} />
                </Resize>
            </Center>
        </group>
    );
}

function CardStack() {
    const { scene } = useGLTF("/models/stack_of_cards/scene.gltf");
    return (
        <group className="hover:cursor-pointer" scale={1} position={[-1.5, -1.65, 21.25]} rotation={[0, 0, 0]} onClick={() => console.log("clicked card stack")}>
            <Center>
                <Resize>
                    <primitive object={scene} />
                </Resize>
            </Center>
        </group>
    );
}

export default function TwoD() {
  return (
    <div className="w-screen h-screen fixed top-0 left-0">
      <Canvas camera={{ position: [0, 0.5, 25], fov: 75, rotation: [-Math.PI / 8, 0, 0] }}>

        {/* <ambientLight intensity={2} /> */}
        <pointLight position={[0, 10, 10]} intensity={1000} />
        
        {/* <Torus /> */}
        <Suspense fallback={<ErrorBox />}>
          <Table />
          <PackOfCards />
          <CardStack />
        </Suspense>
{/* 
        <OrbitControls /> */}
        <Floor />
        <BackWall />

      </Canvas>
    </div>
  )
}
