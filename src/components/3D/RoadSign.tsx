import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface RoadSignData {
  id: string;
  type:
    | 'stop'
    | 'no-entry'
    | 'one-way'
    | 'speed-limit'
    | 'school-zone'
    | 'hospital'
    | 'u-turn'
    | 'give-way'
    | 'pedestrian'
    | 'railway';
  position: { x: number; y: number; z: number };
  label?: string;
  value?: string | number;
}

interface RoadSignsProps {
  scene: THREE.Scene;
  signs: RoadSignData[];
  onSignClicked?: (signId: string) => void;
}

const RoadSigns: React.FC<RoadSignsProps> = ({ scene, signs, onSignClicked }) => {
  const signMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  useEffect(() => {
    // Create sign meshes
    signs.forEach((sign) => {
      const group = createRoadSign(sign);
      group.userData.signId = sign.id;
      scene.add(group);
      signMeshesRef.current.set(sign.id, group);
    });

    return () => {
      signMeshesRef.current.forEach((group) => {
        scene.remove(group);
      });
      signMeshesRef.current.clear();
    };
  }, [scene, signs]);

  // Handle mouse clicks for sign interaction
  useEffect(() => {
    const handleMouseClick = (event: MouseEvent) => {
      if (!onSignClicked) return;

      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      const camera = (window as any).__drivingAcademyCamera;
      if (!camera) return;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const allMeshes = Array.from(signMeshesRef.current.values()).flatMap((g) =>
        g.children
      );
      const intersects = raycasterRef.current.intersectObjects(allMeshes);

      if (intersects.length > 0) {
        let parent = intersects[0].object.parent;
        while (parent && !parent.userData.signId) {
          parent = parent.parent;
        }
        if (parent?.userData.signId) {
          onSignClicked(parent.userData.signId);
        }
      }
    };

    window.addEventListener('click', handleMouseClick);
    return () => window.removeEventListener('click', handleMouseClick);
  }, [onSignClicked]);

  return null;
};

function createRoadSign(sign: RoadSignData): THREE.Group {
  const group = new THREE.Group();
  group.position.set(sign.position.x, sign.position.y, sign.position.z);

  // Pole
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 16);
  const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = 1.5;
  pole.castShadow = true;
  group.add(pole);

  // Sign board (based on type)
  const signBoard = createSignBoard(sign.type, sign.value);
  signBoard.position.y = 3.5;
  signBoard.castShadow = true;
  group.add(signBoard);

  return group;
}

function createSignBoard(type: string, value?: string | number): THREE.Group {
  const group = new THREE.Group();

  switch (type) {
    case 'stop': {
      // Red octagon STOP sign
      const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 8);
      const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = Math.PI / 2;
      mesh.castShadow = true;
      group.add(mesh);

      // Add text "STOP"
      addSignText(group, 'STOP', 0xffffff);
      break;
    }
    case 'no-entry': {
      // Red circle with white horizontal bar
      const circleGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
      const circleMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      const circle = new THREE.Mesh(circleGeometry, circleMaterial);
      circle.rotation.x = Math.PI / 2;
      circle.castShadow = true;
      group.add(circle);

      // White bar
      const barGeometry = new THREE.BoxGeometry(1.6, 0.15, 0.15);
      const barMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.z = 0.1;
      bar.castShadow = true;
      group.add(bar);
      break;
    }
    case 'speed-limit': {
      // White square with red border and speed value
      const geometry = new THREE.BoxGeometry(0.8, 1, 0.1);
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      group.add(mesh);

      addSignText(group, `${value}`, 0xff0000, 0.4);
      break;
    }
    case 'school-zone': {
      // Yellow diamond with "SCHOOL"
      const geometry = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 4);
      const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = Math.PI / 2;
      mesh.rotation.z = Math.PI / 4;
      mesh.castShadow = true;
      group.add(mesh);

      addSignText(group, 'SCHOOL', 0x000000, 0.25);
      break;
    }
    default: {
      // Generic rectangular sign
      const geometry = new THREE.BoxGeometry(1, 0.8, 0.1);
      const material = new THREE.MeshPhongMaterial({
        color: 0x0066cc,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      group.add(mesh);

      addSignText(group, type.toUpperCase(), 0xffffff, 0.3);
    }
  }

  return group;
}

function addSignText(
  group: THREE.Group,
  text: string,
  color: number,
  scale: number = 0.35
): void {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const geometry = new THREE.PlaneGeometry(1.2, 0.9);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 0.08;
  mesh.scale.set(scale, scale, scale);
  group.add(mesh);
}

export default RoadSigns;
