import React, { useEffect } from 'react';
import { useDrivingStore } from '../stores/drivingStore';

const VehicleControls: React.FC = () => {
  const { setSteering, setThrottle, setBrake, setCameraMode } = useDrivingStore();
  const keysPressed = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key.toLowerCase());
      updateControls();

      // Camera mode switching
      if (event.key === '1') setCameraMode('first-person');
      if (event.key === '2') setCameraMode('third-person');
      if (event.key === '3') setCameraMode('top-down');
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
      updateControls();
    };

    const updateControls = () => {
      const keys = keysPressed.current;

      // Steering (A/D or Arrow Left/Right)
      let steeringValue = 0;
      if (keys.has('a') || keys.has('arrowleft')) steeringValue -= 1;
      if (keys.has('d') || keys.has('arrowright')) steeringValue += 1;
      setSteering(steeringValue);

      // Throttle (W or ArrowUp)
      let throttleValue = 0;
      if (keys.has('w') || keys.has('arrowup')) throttleValue = 1;
      if (keys.has('s') || keys.has('arrowdown')) throttleValue = -1;
      setThrottle(throttleValue);

      // Brake (Space)
      const brakeValue = keys.has(' ') ? 1 : 0;
      setBrake(brakeValue);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setSteering, setThrottle, setBrake, setCameraMode]);

  return null;
};

export default VehicleControls;
