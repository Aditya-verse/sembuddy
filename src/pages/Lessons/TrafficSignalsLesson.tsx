import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import Scene3D from '../components/3D/Scene3D';
import Road from '../components/3D/Road';
import Vehicle from '../components/3D/Vehicle';
import VehicleControls from '../components/Controls/VehicleControls';
import CameraControls from '../components/Controls/CameraControls';
import LessonHUD from '../components/UI/LessonHUD';
import Quiz from '../components/UI/Quiz';
import { useDrivingStore } from '../stores/drivingStore';
import { useProgressStore } from '../stores/progressStore';
import { getQuizQuestions, getLesson } from '../utils/lessonContent';
import {
  TrafficLightController,
  TrafficLightColor,
} from '../utils/physics';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TrafficSignalsLessonProps {
  onComplete?: (score: number) => void;
  onExit?: () => void;
}

const TrafficSignalsLesson: React.FC<TrafficSignalsLessonProps> = ({
  onComplete,
  onExit,
}) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const trafficLightRef = useRef<TrafficLightController>(new TrafficLightController('red'));
  const trafficLightMeshRef = useRef<THREE.Group | null>(null);

  const [sceneReady, setSceneReady] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [lessonPhase, setLessonPhase] = useState<'red' | 'yellow' | 'green'>('red');
  const [instructorMessage, setInstructorMessage] = useState(
    'Welcome to Traffic Signal Training! Approach the signal and follow the rules.'
  );

  const {
    isPlaying,
    isPaused,
    startLesson,
    pauseLesson,
    resumeLesson,
    endLesson,
    addViolation,
    addScore,
    vehiclePosition,
    vehicleRotation,
    vehicleVelocity,
  } = useDrivingStore();

  const { markLessonComplete } = useProgressStore();
  const lesson = getLesson('traffic-signals');
  const quizQuestions = getQuizQuestions('traffic-signals');

  useEffect(() => {
    if (!isPlaying) {
      startLesson();
    }
  }, []);

  // Update traffic light mesh
  useEffect(() => {
    if (!sceneReady || !sceneRef.current) return;

    // Create traffic light mesh if not exists
    if (!trafficLightMeshRef.current) {
      const group = new THREE.Group();
      group.position.set(0, 0, -30);

      // Pole
      const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 4, 16);
      const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.y = 2;
      pole.castShadow = true;
      group.add(pole);

      // Light box
      const boxGeometry = new THREE.BoxGeometry(1, 3, 0.3);
      const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.y = 3.5;
      box.castShadow = true;
      group.add(box);

      // Lights
      const lightPositions = [
        { y: 4.2, name: 'red' },
        { y: 3.5, name: 'yellow' },
        { y: 2.8, name: 'green' },
      ];

      lightPositions.forEach((pos) => {
        const lightGeometry = new THREE.CircleGeometry(0.35, 32);
        const lightMaterial = new THREE.MeshPhongMaterial({
          color:
            pos.name === 'red'
              ? 0xff0000
              : pos.name === 'yellow'
              ? 0xffff00
              : 0x00ff00,
          emissive:
            pos.name === 'red'
              ? 0xff0000
              : pos.name === 'yellow'
              ? 0xffff00
              : 0x00ff00,
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(0, pos.y, 0.16);
        light.userData.type = pos.name;
        group.add(light);

        // Point light
        const pointLight = new THREE.PointLight(
          pos.name === 'red'
            ? 0xff0000
            : pos.name === 'yellow'
            ? 0xffff00
            : 0x00ff00,
          1,
          10
        );
        pointLight.position.set(0, pos.y, 0.5);
        group.add(pointLight);
      });

      sceneRef.current.add(group);
      trafficLightMeshRef.current = group;
    }

    // Update traffic light
    const color = trafficLightRef.current.getColor();
    const lights = trafficLightMeshRef.current.children.filter(
      (child) => child.userData.type
    );

    lights.forEach((light) => {
      const isActive = light.userData.type === color;
      (light as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>).material.opacity = isActive
        ? 1
        : 0.1;
    });

    // Update phase message
    if (color !== lessonPhase) {
      setLessonPhase(color);
      const messages: Record<TrafficLightColor, string> = {
        red: 'Red signal! Stop before the stop line. Never cross it.',
        yellow:
          'Yellow signal! Prepare to stop safely. Do not accelerate to beat the signal.',
        green:
          'Green signal! Check surroundings and proceed carefully. Stay in your lane.',
      };
      setInstructorMessage(messages[color]);
    }

    // Check vehicle behavior
    const distanceToSignal = Math.abs(vehiclePosition.z + 30);
    const speed = vehicleVelocity;

    if (color === 'red' && distanceToSignal < 5 && speed > 0.5) {
      addViolation('Ran red light - did not stop');
    } else if (color === 'green' && distanceToSignal < 2) {
      if (speed > 0) {
        addScore(5);
      }
    }
  }, [sceneReady, vehiclePosition, vehicleVelocity, lessonPhase]);

  const handleSceneReady = (
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer
  ) => {
    sceneRef.current = scene;
    cameraRef.current = camera as THREE.PerspectiveCamera;
    setSceneReady(true);
  };

  const handleQuizComplete = (score: number) => {
    endLesson();
    const finalScore = Math.round((useDrivingStore.getState().score / 100) * score);
    markLessonComplete('traffic-signals', finalScore, Math.floor(Date.now() / 1000));
    setShowQuiz(false);
    if (onComplete) onComplete(finalScore);
  };

  if (showQuiz) {
    return (
      <Quiz
        questions={quizQuestions}
        onComplete={handleQuizComplete}
        onCancel={() => setShowQuiz(false)}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-black relative">
      {/* 3D Scene */}
      <Scene3D
        onSceneReady={handleSceneReady}
        environmentType="day"
      />

      {/* Road and Vehicle */}
      {sceneReady && sceneRef.current && (
        <>
          <Road
            scene={sceneRef.current}
            roadType="straight"
            length={100}
            width={8}
          />
          <Vehicle scene={sceneRef.current} vehicleType="car" />
        </>
      )}

      {/* Controls */}
      <VehicleControls />

      {/* Camera Controls */}
      {cameraRef.current && (
        <CameraControls
          camera={cameraRef.current}
          vehiclePosition={vehiclePosition}
          vehicleRotation={vehicleRotation}
        />
      )}

      {/* HUD */}
      <LessonHUD
        lessonName={lesson?.name || 'Traffic Signal Training'}
        objective={instructorMessage}
        onPause={() => (isPaused ? resumeLesson() : pauseLesson())}
        onQuit={onExit}
        showHints={true}
      />

      {/* Instructor Bubble */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-32 left-6 bg-brand-card border border-brand-teal/50 rounded-2xl p-6 max-w-sm"
      >
        <div className="flex gap-3">
          <div className="text-4xl flex-shrink-0">🤖</div>
          <div>
            <p className="font-bold text-white mb-2">Shivraj's Guidance</p>
            <p className="text-sm text-slate-300">{instructorMessage}</p>
          </div>
        </div>
      </motion.div>

      {/* Exit Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onExit}
        className="fixed top-6 right-6 p-3 rounded-lg bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition z-50"
      >
        <X className="w-6 h-6 text-red-400" />
      </motion.button>

      {/* Quiz Button */}
      {isPlaying && !isPaused && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowQuiz(true)}
          className="fixed bottom-6 right-6 px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-teal text-white rounded-lg font-bold hover:shadow-lg hover:shadow-brand-teal/50 transition z-40"
        >
          📝 Take Quiz
        </motion.button>
      )}
    </div>
  );
};

export default TrafficSignalsLesson;
