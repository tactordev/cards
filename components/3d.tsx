"use client";
import React, { useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, Center, Resize } from "@react-three/drei";
import * as three from "three";
import LoadingMenu from "@/components/loading";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';




export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!containerRef.current) return;

    // setup
    const container = containerRef.current;

    const scene = new three.Scene();
    

    const camera = new three.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, -8);

    const renderer = new three.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new three.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new three.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 40, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);


    // texture & tiling
    const textureLoader = new three.TextureLoader();

    function createTiledTexture(url: string, repeatX: number, repeatY: number): three.Texture {
      const texture = textureLoader.load(url);
      texture.wrapS = three.RepeatWrapping;
      texture.wrapT = three.RepeatWrapping;
      texture.repeat.set(repeatX, repeatY);
      texture.magFilter = three.NearestFilter;
      return texture;
    }


    const floorTexture = createTiledTexture('/models/3d/floor/texture.webp', 20, 20);
    const wallTexture = createTiledTexture('https://threejs.org/examples/textures/brick_diffuse.jpg', 5, 2);

    // world
    const floorGeometry = new three.PlaneGeometry(40, 40);
    const floorMaterial = new three.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.8,
    });
    const floor = new three.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);


    // const wallMaterial = new three.MeshStandardMaterial({
    //   map: wallTexture,
    //   roughness: 0.9,
    // });

    // const wallGroup = new three.Group();
    const mapSize = 40;
    // const wallHeight = 5;
    // const wallGeometry = new three.BoxGeometry(mapSize, wallHeight, 1);


    // const wall1 = new three.Mesh(wallGeometry, wallMaterial);
    // wall1.position.set(0, wallHeight / 2, -mapSize / 2);

    // const wall2 = new three.Mesh(wallGeometry, wallMaterial);
    // wall2.position.set(0, wallHeight / 2, mapSize / 2);
    // wall2.rotation.y = Math.PI;

    // const wall3 = new three.Mesh(wallGeometry, wallMaterial);
    // wall3.position.set(-mapSize / 2, wallHeight / 2, 0);
    // wall3.rotation.y = Math.PI / 2;

    // const wall4 = new three.Mesh(wallGeometry, wallMaterial);
    // wall4.position.set(mapSize / 2, wallHeight / 2, 0);

    // wallGroup.add(wall1, wall2, wall3, wall4);
    // wallGroup.children.forEach((wall) => {
    //   wall.castShadow = true;
    //   wall.receiveShadow = true;
    // });
    // scene.add(wallGroup);


    // character
    const characterGroup = new three.Group();


    const bodyGeometry = new three.CapsuleGeometry(0.5, 1, 4, 8);
    const bodyMaterial = new three.MeshStandardMaterial({ color: 0x3498db, roughness: 0.5 });
    const body = new three.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    characterGroup.add(body);

    scene.add(characterGroup);


    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.5 - 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 8;


    const keys: Record<string, boolean> = {
      w: false, a: false, s: false, d: false,
      ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
    };

    function keyDown(event: KeyboardEvent) {
      if (event.key in keys) {
        keys[event.key] = true;
      }
    }

    function keyUp(event: KeyboardEvent) {
      if (event.key in keys) {
        keys[event.key] = false;
      }
    }

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    // loop
    const clock = new three.Clock();
    const moveSpeed = 5.0;
    const boundary = mapSize / 2 - 0.8;

    let animationFrameId: number;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      const up = keys.w || keys.ArrowUp;
      const down = keys.s || keys.ArrowDown;
      const left = keys.a || keys.ArrowLeft;
      const right = keys.d || keys.ArrowRight;

      if (up || down || left || right) {
        const camDirection = new three.Vector3();
        camera.getWorldDirection(camDirection);
        camDirection.y = 0;
        camDirection.normalize();

        const camSideways = new three.Vector3(-camDirection.z, 0, camDirection.x);
          const moveDirection = new three.Vector3();

        if (up) moveDirection.add(camDirection);
        if (down) moveDirection.add(camDirection.clone().negate());
        if (left) moveDirection.add(camSideways.clone().negate());
        if (right) moveDirection.add(camSideways.clone());

        moveDirection.normalize();
        characterGroup.position.add(moveDirection.multiplyScalar(moveSpeed * delta));

        const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
        characterGroup.rotation.y = three.MathUtils.lerp(characterGroup.rotation.y, targetAngle, 0.15);
      }

      characterGroup.position.x = Math.max(-boundary, Math.min(boundary, characterGroup.position.x));
      characterGroup.position.z = Math.max(-boundary, Math.min(boundary, characterGroup.position.z));

      controls.target.copy(characterGroup.position).add(new three.Vector3(0, 1, 0));
      controls.update();

      renderer.render(scene, camera);
    }

    animate();



    // end
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    }

  }, []);

  return (
    <div className="w-screen h-screen relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}