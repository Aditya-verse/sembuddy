import React, { useEffect } from 'react';
import * as THREE from 'three';

interface RoadProps {
  scene: THREE.Scene;
  roadType?: 'straight' | 'roundabout' | 'parking';
  length?: number;
  width?: number;
}

const Road: React.FC<RoadProps> = ({
  scene,
  roadType = 'straight',
  length = 100,
  width = 8,
}) => {
  useEffect(() => {
    const roadGroup = new THREE.Group();

    if (roadType === 'straight') {
      createStraightRoad(roadGroup, length, width);
    } else if (roadType === 'roundabout') {
      createRoundabout(roadGroup);
    } else if (roadType === 'parking') {
      createParkingLot(roadGroup);
    }

    scene.add(roadGroup);

    return () => {
      scene.remove(roadGroup);
    };
  }, [scene, roadType, length, width]);

  return null;
};

function createStraightRoad(
  group: THREE.Group,
  length: number,
  width: number
): void {
  // Main road surface
  const roadGeometry = new THREE.PlaneGeometry(width, length);
  const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.01;
  road.receiveShadow = true;
  group.add(road);

  // Road markings (center line)
  const lineGeometry = new THREE.PlaneGeometry(0.2, length);
  const lineMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
  const line = new THREE.Mesh(lineGeometry, lineMaterial);
  line.rotation.x = -Math.PI / 2;
  line.position.y = 0.02;
  group.add(line);

  // Road markings (dashed center line)
  for (let i = 0; i < length; i += 3) {
    const dashGeometry = new THREE.PlaneGeometry(0.15, 2);
    const dashMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    const dash = new THREE.Mesh(dashGeometry, dashMaterial);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.02, -length / 2 + i);
    group.add(dash);
  }

  // Lane dividers (side lines)
  const sideLineGeometry = new THREE.PlaneGeometry(0.1, length);
  const sideLineMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const leftLine = new THREE.Mesh(sideLineGeometry, sideLineMaterial);
  leftLine.rotation.x = -Math.PI / 2;
  leftLine.position.set(-width / 2 - 0.05, 0.02, 0);
  group.add(leftLine);

  const rightLine = new THREE.Mesh(sideLineGeometry, sideLineMaterial);
  rightLine.rotation.x = -Math.PI / 2;
  rightLine.position.set(width / 2 + 0.05, 0.02, 0);
  group.add(rightLine);

  // Road borders (curbs)
  createCurb(group, -width / 2 - 0.3, length);
  createCurb(group, width / 2 + 0.3, length);
}

function createRoundabout(group: THREE.Group): void {
  // Central circle
  const circleGeometry = new THREE.CircleGeometry(15, 64);
  const circleMaterial = new THREE.MeshLambertMaterial({ color: 0x3d5a3d });
  const circle = new THREE.Mesh(circleGeometry, circleMaterial);
  circle.rotation.x = -Math.PI / 2;
  circle.position.y = 0.01;
  circle.receiveShadow = true;
  group.add(circle);

  // Roundabout ring (road)
  const ringGeometry = new THREE.RingGeometry(12, 18, 64);
  const ringMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  ring.receiveShadow = true;
  group.add(ring);

  // Center circle (grass/island)
  const islandGeometry = new THREE.CircleGeometry(12, 64);
  const islandMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
  const island = new THREE.Mesh(islandGeometry, islandMaterial);
  island.rotation.x = -Math.PI / 2;
  island.position.y = 0.01;
  island.receiveShadow = true;
  group.add(island);

  // Entry roads (4 directions)
  const directions = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  directions.forEach((angle) => {
    const roadGeometry = new THREE.PlaneGeometry(6, 20);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;

    const distance = 23;
    road.position.x = Math.cos(angle) * distance;
    road.position.z = Math.sin(angle) * distance;

    // Rotate to face roundabout
    road.rotation.z = angle;

    road.receiveShadow = true;
    group.add(road);
  });
}

function createParkingLot(group: THREE.Group): void {
  // Parking lot surface
  const lotGeometry = new THREE.PlaneGeometry(30, 50);
  const lotMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
  const lot = new THREE.Mesh(lotGeometry, lotMaterial);
  lot.rotation.x = -Math.PI / 2;
  lot.position.y = 0.01;
  lot.receiveShadow = true;
  group.add(lot);

  // Parking spaces (white lines)
  const spotsPerRow = 5;
  const rowCount = 3;
  const spotWidth = 5;
  const spotDepth = 4;

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < spotsPerRow; col++) {
      const x = col * spotWidth - 10;
      const z = row * spotDepth - 6;

      // Draw parking spot outline
      drawParkingSpot(group, x, z, spotWidth, spotDepth);
    }
  }

  // Road markings
  const roadGeometry = new THREE.PlaneGeometry(6, 50);
  const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.02, 0);
  road.receiveShadow = true;
  group.add(road);
}

function createCurb(group: THREE.Group, x: number, length: number): void {
  const curbGeometry = new THREE.BoxGeometry(0.3, 0.3, length);
  const curbMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
  const curb = new THREE.Mesh(curbGeometry, curbMaterial);
  curb.position.set(x, 0.15, 0);
  curb.castShadow = true;
  curb.receiveShadow = true;
  group.add(curb);
}

function drawParkingSpot(
  group: THREE.Group,
  x: number,
  z: number,
  width: number,
  depth: number
): void {
  const lineThickness = 0.05;
  const lineHeight = 0.02;

  const positions = [
    // Top line
    { x: x, z: z - depth / 2, w: width, d: lineThickness },
    // Bottom line
    { x: x, z: z + depth / 2, w: width, d: lineThickness },
    // Left line
    { x: x - width / 2, z: z, w: lineThickness, d: depth },
    // Right line
    { x: x + width / 2, z: z, w: lineThickness, d: depth },
  ];

  positions.forEach((pos) => {
    const lineGeometry = new THREE.PlaneGeometry(pos.w, pos.d);
    const lineMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.x = -Math.PI / 2;
    line.position.set(pos.x, lineHeight, pos.z);
    group.add(line);
  });
}

export default Road;
