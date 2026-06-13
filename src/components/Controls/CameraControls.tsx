import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDrivingStore } from '../stores/drivingStore';

interface CameraControlsProps {
  camera: THREE.PerspectiveCamera;
  vehiclePosition: { x: number; y: number; z: number };
  vehicleRotation: number;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  camera,
  vehiclePosition,
  vehicleRotation,
}) => {
  const cameraMode = useDrivingStore((state) => state.cameraMode);
  const targetOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const currentOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3());

  useEffect(() => {
    (window as any).__drivingAcademyCamera = camera;
  }, [camera]);

  useEffect(() => {
    let animationId: number;

    const updateCamera = () => {
      const vehiclePos = new THREE.Vector3(
        vehiclePosition.x,
        vehiclePosition.y,
        vehiclePosition.z
      );

      // Set target offset based on camera mode
      switch (cameraMode) {
        case 'first-person':
          targetOffsetRef.current.set(0, 1.5, 0);
          break;
        case 'top-down':
          targetOffsetRef.current.set(0, 20, 0);
          break;
        case 'third-person':
        default:
          // Offset relative to vehicle rotation
          const distance = 8;
          const height = 3;
          targetOffsetRef.current.set(
            Math.sin(vehicleRotation) * distance,
            height,
            Math.cos(vehicleRotation) * distance
          );
      }

      // Smooth camera movement (lerp)
      currentOffsetRef.current.lerp(targetOffsetRef.current, 0.1);

      const cameraTarget = vehiclePos.clone().add(currentOffsetRef.current);
      camera.position.lerp(cameraTarget, 0.15);
      camera.lookAt(vehiclePos.x, vehiclePos.y + 1, vehiclePos.z);

      animationId = requestAnimationFrame(updateCamera);
    };

    updateCamera();

    return () => cancelAnimationFrame(animationId);
  }, [camera, vehiclePosition, vehicleRotation, cameraMode]);

  return null;
};

export default CameraControls;
