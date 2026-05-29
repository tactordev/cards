"use client";
import * as three from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, OrbitControls, Center, Resize } from "@react-three/drei";



export default function LoadingMenu(
    { scene }: 
    { scene: three.Scene }
) {
    const divEl = document.createElement("div");
    divEl.className = "absolute section shadow-sm left-4 top-104 w-72 h-72 shadow-lg rounded-md flex flex-col gap-2 justify-center items-center p-4";
    divEl.textContent = "Loading...";
    const label = new CSS2DObject(divEl);
    label.position.set(0, 0, 0);
    scene.add(label);
    // const mesh = new three.Mesh(
    //     new three.BoxGeometry(5, 5, 5),
    //     new three.MeshStandardMaterial({ color: 0xff6347, wireframe: true })
    // );
    // scene.add(mesh);

    return (
        <group>
            <primitive object={scene} />
        </group>
    );
}