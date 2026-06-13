import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDrivingStore } from '../stores/drivingStore';
import { useSettingsStore } from '../stores/settingsStore';
import { VehiclePhysicsSimulator, VEHICLE_PHYSICS_PRESETS } from '../utils/physics';

interface VehicleProps {
  scene: THREE.Scene;
  vehicleType?: 'car' | 'motorcycle';
}

const Vehicle: React.FC<VehicleProps> = ({ scene, vehicleType = 'car' }) => {
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const physicsRef = useRef<VehiclePhysicsSimulator | null>(null);
  const cameraOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 3, 10));

  const difficulty = useSettingsStore((state) => state.difficulty);
  const cameraMode = useDrivingStore((state) => state.cameraMode);
  const {
    setVehiclePosition,
    setVehicleRotation,
    setVehicleVelocity,
    steering,
    throttle,
    brake,
  } = useDrivingStore();

  // Create vehicle geometry
  useEffect(() => {
    const group = new THREE.Group();

    if (vehicleType === 'car') {
      // Car body
      const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 4);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.75;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // Car cabin
      const cabinGeometry = new THREE.BoxGeometry(1.6, 1, 1.5);
      const cabinMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
      const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
      cabin.position.set(0, 1.8, -0.3);
      cabin.castShadow = true;
      cabin.receiveShadow = true;
      group.add(cabin);

      // Wheels
      const wheelRadius = 0.5;
      const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.4, 16);
      const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

      const wheelPositions = [
        { x: -1, z: 1 },
        { x: 1, z: 1 },
        { x: -1, z: -1 },
        { x: 1, z: -1 },
      ];

      wheelPositions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, 0.5, pos.z);
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        group.add(wheel);
      });
    } else {
      // Motorcycle body (simplified)
      const frameGeometry = new THREE.BoxGeometry(0.3, 1, 1.8);
      const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.y = 0.5;
      frame.castShadow = true;
      group.add(frame);

      // Seat
      const seatGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.8);
      const seatMaterial = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
      const seat = new THREE.Mesh(seatGeometry, seatMaterial);
      seat.position.set(0, 1.1, 0);
      seat.castShadow = true;
      group.add(seat);

      // Wheels (motorcycle)
      const wheelRadius = 0.35;
      const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.25, 16);
      const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });

      const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      frontWheel.rotation.z = Math.PI / 2;
      frontWheel.position.set(0, 0.35, -0.8);
      frontWheel.castShadow = true;
      group.add(frontWheel);

      const rearWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      rearWheel.rotation.z = Math.PI / 2;
      rearWheel.position.set(0, 0.35, 0.8);
      rearWheel.castShadow = true;
      group.add(rearWheel);
    }

    scene.add(group);
    vehicleGroupRef.current = group;

    // Initialize physics
    const physicsPreset = VEHICLE_PHYSICS_PRESETS[vehicleType][difficulty];
    const physics = new VehiclePhysicsSimulator(physicsPreset);
    physicsRef.current = physics;

    return () => {
      scene.remove(group);
    };
  }, [scene, vehicleType, difficulty]);

  // Update physics and position
  useEffect(() => {
    let lastTime = Date.now();
    const frameRate = useSettingsStore.getState().targetFPS;

    const updateLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // Convert to seconds
      lastTime = now;

      if (physicsRef.current && vehicleGroupRef.current) {
        // Update physics
        physicsRef.current.update(deltaTime, throttle, brake, steering);

        // Get new position and rotation
        const position = physicsRef.current.getPosition();
        const rotation = physicsRef.current.getRotation();

        // Update Three.js object
        vehicleGroupRef.current.position.set(position.x, position.y, position.z);
        vehicleGroupRef.current.rotation.y = rotation;

        // Update store
        setVehiclePosition(position);
        setVehicleRotation({ x: 0, y: rotation, z: 0 });
        setVehicleVelocity(physicsRef.current.getSpeed());
      }

      setTimeout(updateLoop, 1000 / frameRate);
    };

    updateLoop();
  }, [throttle, brake, steering, setVehiclePosition, setVehicleRotation, setVehicleVelocity]);

  return null;
};

export default Vehicle;
