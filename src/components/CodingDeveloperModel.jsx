import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CodingDeveloperModel = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentRef = mountRef.current;
    const { clientWidth: width, clientHeight: height } = currentRef;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505); // High-contrast, pure black background

    // --- CAMERA SETUP ---
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 3, 7); // Set to frame the scene perfectly
    camera.lookAt(0, 0, 0);

    // --- RENDERER SETUP WITH SHADOWS ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true; // Enable shadows for the entire scene
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentRef.appendChild(renderer.domElement);

    // --- ORBIT CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth motion
    controls.dampingFactor = 0.05;

    // --- GEOMETRY & MATERIAL CREATION ---

    // 1. Ground Plane (Receives Shadows)
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.rotation.x = -Math.PI / 2; // Make it horizontal
    planeMesh.receiveShadow = true; // Receive shadows from objects
    scene.add(planeMesh);

    // 2. Desk (Receives Shadows)
    const deskGeometry = new THREE.BoxGeometry(4, 1, 2);
    const deskMaterial = new THREE.MeshStandardMaterial({ color: 0xcc7744, metalness: 0.1, roughness: 0.8 }); // Wooden tone
    const deskMesh = new THREE.Mesh(deskGeometry, deskMaterial);
    deskMesh.position.set(0, 0.5, 0);
    deskMesh.receiveShadow = true;
    scene.add(deskMesh);

    // 3. Chair Base & Back (Receives Shadows)
    const chairLegsGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16);
    const chairLegsMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const chairLegsMesh = new THREE.Mesh(chairLegsGeometry, chairLegsMaterial);
    chairLegsMesh.position.set(0, 0.3, 0);
    chairLegsMesh.receiveShadow = true;
    scene.add(chairLegsMesh);

    const chairSeatGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const chairSeatMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const chairSeatMesh = new THREE.Mesh(chairSeatGeometry, chairSeatMaterial);
    chairSeatMesh.position.set(0, 0.65, 0);
    chairSeatMesh.receiveShadow = true;
    scene.add(chairSeatMesh);

    const chairBackGeometry = new THREE.BoxGeometry(0.1, 1.2, 1);
    const chairBackMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const chairBackMesh = new THREE.Mesh(chairBackGeometry, chairBackMaterial);
    chairBackMesh.position.set(0, 1.2, -0.5);
    chairBackMesh.receiveShadow = true;
    scene.add(chairBackMesh);

    // 4. Seated Developer Figure (Casts Shadows)
    const developerGroup = new THREE.Group();
    developerGroup.position.set(0, 0.65, 0); // Position at seat level
    scene.add(developerGroup);

    // Body (Casts Shadows)
    const torsoGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
    const torsoMaterial = new THREE.MeshStandardMaterial({ color: 0xea580c }); // Orange shirt
    const torsoMesh = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torsoMesh.position.set(0, 0.5, 0);
    torsoMesh.castShadow = true; // Cast shadows
    torsoMesh.receiveShadow = true;
    developerGroup.add(torsoMesh);

    // Head (Casts Shadows)
    const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5dc }); // Flesh tone
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    headMesh.position.set(0, 1.2, 0);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    developerGroup.add(headMesh);

    // Arms Posed for Typing (Casts Shadows)
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0xea580c });
    const leftArmMesh = new THREE.Mesh(armGeometry, armMaterial);
    leftArmMesh.position.set(-0.4, 0.7, 0.3);
    leftArmMesh.rotation.z = Math.PI / 8;
    leftArmMesh.castShadow = true;
    leftArmMesh.receiveShadow = true;
    developerGroup.add(leftArmMesh);

    const rightArmMesh = new THREE.Mesh(armGeometry, armMaterial);
    rightArmMesh.position.set(0.4, 0.7, 0.3);
    rightArmMesh.rotation.z = -Math.PI / 8;
    rightArmMesh.castShadow = true;
    rightArmMesh.receiveShadow = true;
    developerGroup.add(rightArmMesh);

    // 5. Computer Setup
    // Monitor Box with Emissive Screen for Glow (Receives Shadows)
    const monitorGeometry = new THREE.BoxGeometry(2, 1.2, 0.1);
    const monitorMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const monitorMesh = new THREE.Mesh(monitorGeometry, monitorMaterial);
    monitorMesh.position.set(0, 1.6, -1.2);
    monitorMesh.receiveShadow = true;
    scene.add(monitorMesh);

    // Emissive Screen Glow for 'depth' and 'feel'
    const screenGeometry = new THREE.BoxGeometry(1.9, 1.1, 0.01);
    const screenMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 });
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.position.set(0, 1.6, -1.14);
    screenMesh.receiveShadow = true;
    scene.add(screenMesh);

    // Keyboard (flat box) (Receives Shadows)
    const keyboardGeometry = new THREE.BoxGeometry(1.6, 0.05, 0.6);
    const keyboardMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const keyboardMesh = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboardMesh.position.set(0, 1.02, 0.4);
    keyboardMesh.receiveShadow = true;
    scene.add(keyboardMesh);

    // 6. Environment details
    // Coffee Mug (Casts/Receives Shadows)
    const mugGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16);
    const mugMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const mugMesh = new THREE.Mesh(mugGeometry, mugMaterial);
    mugMesh.position.set(1.5, 1.2, 0.5); // On the desk
    mugMesh.castShadow = true;
    mugMesh.receiveShadow = true;
    scene.add(mugMesh);

    // --- LIGHTING SETUP ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5); // Angle to cast useful shadows
    directionalLight.castShadow = true; // Enable light to cast shadows
    directionalLight.shadow.mapSize.width = 1024; // Shadow resolution
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 20;
    scene.add(directionalLight);

    // --- ANIMATION LOOP ---
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Dampening relies on controls.update() being called
      renderer.render(scene, camera);
    };
    animate();

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (mountRef.current) {
        const { clientWidth, clientHeight } = mountRef.current;
        renderer.setSize(clientWidth, clientHeight);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
      }
    };
    window.addEventListener('resize', handleResize);

    // --- CLEANUP ---
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        currentRef.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />;
};

export default CodingDeveloperModel;