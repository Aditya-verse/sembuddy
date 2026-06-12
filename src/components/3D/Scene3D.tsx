import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDrivingStore } from '../stores/drivingStore';
import { useSettingsStore } from '../stores/settingsStore';

interface Scene3DProps {
  onSceneReady?: (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => void;
  environmentType?: 'day' | 'night' | 'monsoon';
}

const Scene3D: React.FC<Scene3DProps> = ({
  onSceneReady,
  environmentType = 'day',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isReady, setIsReady] = useState(false);

  const performanceMode = useSettingsStore((state) => state.performanceMode);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = environmentType === 'night'
      ? new THREE.Color(0x1a1a2e)
      : environmentType === 'monsoon'
      ? new THREE.Color(0x4a5568)
      : new THREE.Color(0x87ceeb);

    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !performanceMode,
      powerPreference: performanceMode ? 'low-power' : 'high-performance',
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.shadowMap.enabled = !performanceMode;
    renderer.shadowMap.type = performanceMode
      ? THREE.BasicShadowMap
      : THREE.PCFShadowShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup lighting
    setupLighting(scene, environmentType);

    // Add basic environment
    addEnvironment(scene, environmentType);

    // Callback
    if (onSceneReady) {
      onSceneReady(scene, camera, renderer);
    }

    setIsReady(true);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [onSceneReady, environmentType, performanceMode]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  );
};

function setupLighting(scene: THREE.Scene, environmentType: string): void {
  if (environmentType === 'night') {
    // Night: minimal natural light, artificial lights
    const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
    scene.add(ambientLight);

    // Moon light
    const moonLight = new THREE.DirectionalLight(0xccccff, 0.4);
    moonLight.position.set(50, 40, 30);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.far = 200;
    moonLight.shadow.camera.left = -100;
    moonLight.shadow.camera.right = 100;
    moonLight.shadow.camera.top = 100;
    moonLight.shadow.camera.bottom = -100;
    scene.add(moonLight);

    // Street lights (point lights at road level)
    for (let i = 0; i < 5; i++) {
      const streetLight = new THREE.PointLight(0xffff99, 1, 50);
      streetLight.position.set(i * 20 - 40, 8, -50);
      scene.add(streetLight);
    }
  } else if (environmentType === 'monsoon') {
    // Monsoon: overcast, diffused lighting
    const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xcccccc, 0.4);
    sunLight.position.set(50, 30, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Fog effect for monsoon
    scene.fog = new THREE.Fog(0x4a5568, 100, 200);
  } else {
    // Day: bright, clear lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);
  }

  // Hemispheric light for better ambient
  const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x654321, 0.5);
  scene.add(hemiLight);
}

function addEnvironment(scene: THREE.Scene, environmentType: string): void {
  // Simple plane for ground
  const groundGeometry = new THREE.PlaneGeometry(200, 200);
  const groundMaterial = new THREE.MeshLambertMaterial({
    color: environmentType === 'night' ? 0x333333 : 0x2d5016,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Add simple road (placeholder)
  const roadGeometry = new THREE.PlaneGeometry(8, 100);
  const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.01;
  road.receiveShadow = true;
  scene.add(road);

  // Add sky (simple box)
  if (environmentType !== 'night') {
    const skyGeometry = new THREE.SphereGeometry(300, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: environmentType === 'monsoon' ? 0x7f8896 : 0x87ceeb,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
  }
}

export default Scene3D;
