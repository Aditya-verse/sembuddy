import { Difficulty } from '../stores/settingsStore';

export interface VehiclePhysics {
  mass: number;
  acceleration: number;
  maxSpeed: number;
  brakingForce: number;
  steeringAngle: number;
  friction: number;
  rollingResistance: number;
}

export const VEHICLE_PHYSICS_PRESETS: Record<string, Record<Difficulty, VehiclePhysics>> = {
  car: {
    easy: {
      mass: 1500,
      acceleration: 5,
      maxSpeed: 80,
      brakingForce: 8,
      steeringAngle: 0.05,
      friction: 0.8,
      rollingResistance: 0.02,
    },
    medium: {
      mass: 1500,
      acceleration: 6,
      maxSpeed: 100,
      brakingForce: 7,
      steeringAngle: 0.04,
      friction: 0.75,
      rollingResistance: 0.025,
    },
    hard: {
      mass: 1500,
      acceleration: 7,
      maxSpeed: 120,
      brakingForce: 6,
      steeringAngle: 0.035,
      friction: 0.7,
      rollingResistance: 0.03,
    },
  },
  motorcycle: {
    easy: {
      mass: 200,
      acceleration: 6,
      maxSpeed: 80,
      brakingForce: 6,
      steeringAngle: 0.08,
      friction: 0.6,
      rollingResistance: 0.015,
    },
    medium: {
      mass: 200,
      acceleration: 8,
      maxSpeed: 120,
      brakingForce: 5,
      steeringAngle: 0.06,
      friction: 0.55,
      rollingResistance: 0.02,
    },
    hard: {
      mass: 200,
      acceleration: 10,
      maxSpeed: 150,
      brakingForce: 4,
      steeringAngle: 0.05,
      friction: 0.5,
      rollingResistance: 0.025,
    },
  },
};

export class VehiclePhysicsSimulator {
  private position: { x: number; y: number; z: number };
  private velocity: { x: number; y: number; z: number };
  private rotation: number; // yaw in radians
  private physics: VehiclePhysics;

  constructor(physics: VehiclePhysics) {
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotation = 0;
    this.physics = physics;
  }

  update(deltaTime: number, throttle: number, brake: number, steering: number): void {
    // Clamp inputs
    throttle = Math.min(1, Math.max(-1, throttle));
    brake = Math.min(1, Math.max(0, brake));
    steering = Math.min(1, Math.max(-1, steering));

    // Calculate current speed
    const speed = Math.sqrt(
      this.velocity.x * this.velocity.x +
      this.velocity.z * this.velocity.z
    );

    // Apply throttle and brake
    const acceleration = throttle * this.physics.acceleration - brake * this.physics.brakingForce;
    const speedChange = acceleration * deltaTime;
    let newSpeed = speed + speedChange;

    // Clamp to max speed
    newSpeed = Math.min(this.physics.maxSpeed, Math.max(0, newSpeed));

    // Apply friction and rolling resistance
    newSpeed *= (1 - this.physics.rollingResistance * deltaTime);

    // Apply steering
    if (newSpeed > 0.1) {
      const steeringAmount = steering * this.physics.steeringAngle * deltaTime;
      this.rotation += steeringAmount;
    }

    // Update velocity based on new speed and rotation
    if (newSpeed > 0.01) {
      this.velocity.x = Math.sin(this.rotation) * newSpeed;
      this.velocity.z = Math.cos(this.rotation) * newSpeed;
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
  }

  getPosition(): { x: number; y: number; z: number } {
    return { ...this.position };
  }

  getRotation(): number {
    return this.rotation;
  }

  getVelocity(): { x: number; y: number; z: number } {
    return { ...this.velocity };
  }

  getSpeed(): number {
    return Math.sqrt(
      this.velocity.x * this.velocity.x +
      this.velocity.z * this.velocity.z
    );
  }

  setPosition(pos: { x: number; y: number; z: number }): void {
    this.position = { ...pos };
  }

  setRotation(rot: number): void {
    this.rotation = rot;
  }

  reset(): void {
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotation = 0;
  }

  checkCollision(point: { x: number; y: number; z: number }, radius: number = 2): boolean {
    const dx = this.position.x - point.x;
    const dz = this.position.z - point.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < radius;
  }
}

// Traffic light state management
export type TrafficLightColor = 'red' | 'yellow' | 'green';

export class TrafficLightController {
  private color: TrafficLightColor = 'red';
  private elapsedTime: number = 0;
  private cycleTiming = {
    red: 30000, // 30 seconds
    yellow: 5000, // 5 seconds
    green: 25000, // 25 seconds
  };

  constructor(initialColor: TrafficLightColor = 'red') {
    this.color = initialColor;
  }

  update(deltaTime: number): void {
    this.elapsedTime += deltaTime;

    const timings = [
      { color: 'red' as TrafficLightColor, duration: this.cycleTiming.red },
      { color: 'green' as TrafficLightColor, duration: this.cycleTiming.green },
      { color: 'yellow' as TrafficLightColor, duration: this.cycleTiming.yellow },
    ];

    let totalTime = 0;
    for (const { color, duration } of timings) {
      if (this.elapsedTime < totalTime + duration) {
        this.color = color;
        return;
      }
      totalTime += duration;
    }

    // Reset cycle
    this.elapsedTime = 0;
    this.color = 'red';
  }

  getColor(): TrafficLightColor {
    return this.color;
  }

  setColor(color: TrafficLightColor): void {
    this.color = color;
    this.elapsedTime = 0;
  }

  getTimeUntilChange(): number {
    const timings: Record<TrafficLightColor, number> = {
      red: this.cycleTiming.red,
      green: this.cycleTiming.green,
      yellow: this.cycleTiming.yellow,
    };

    return timings[this.color] - this.elapsedTime;
  }

  isChanging(): boolean {
    const timeUntilChange = this.getTimeUntilChange();
    return timeUntilChange < 2000; // Alert in last 2 seconds
  }
}
