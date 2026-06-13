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
import { motion } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';

type ParkingType = 'reverse' | 'parallel' | 'angle' | 'hill';

interface ParkingLessonProps {
  parkingType?: ParkingType;
  onComplete?: (score: number) => void;
  onExit?: () => void;
}

const ParkingLesson: React.FC<ParkingLessonProps> = ({
  parkingType = 'reverse',
  onComplete,
  onExit,
}) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const parkingSpotMeshRef = useRef<THREE.Group | null>(null);

  const [sceneReady, setSceneReady] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [parkingPhase, setParkingPhase] = useState<'approach' | 'align' | 'park'>('approach');
  const [instructorMessage, setInstructorMessage] = useState(
    `Let's learn ${parkingType} parking! Follow the guidance carefully.`
  );
  const [isParkingSuccessful, setIsParkingSuccessful] = useState(false);

  const {
    isPlaying,
    isPaused,
    startLesson,
    pauseLesson,
    resumeLesson,
    endLesson,
    addScore,
    addCollision,
    vehiclePosition,
    vehicleRotation,
  } = useDrivingStore();

  const { markLessonComplete } = useProgressStore();
  const lesson = getLesson(`parking-${parkingType}`);
  const quizQuestions = getQuizQuestions(`parking-${parkingType}`);

  useEffect(() => {
    if (!isPlaying) {
      startLesson();
    }
  }, []);

  // Setup parking spot
  useEffect(() => {
    if (!sceneReady || !sceneRef.current) return;

    if (!parkingSpotMeshRef.current) {
      const group = new THREE.Group();
      group.position.set(10, 0, -20);

      // Parking spot boundary
      const spotWidth = 3;
      const spotLength = 5;

      const positions = [
        { x: -spotWidth / 2, z: -spotLength / 2, w: spotWidth, d: 0.2 },
        { x: -spotWidth / 2, z: spotLength / 2, w: spotWidth, d: 0.2 },
        { x: -spotWidth / 2, z: 0, w: 0.2, d: spotLength },
        { x: spotWidth / 2, z: 0, w: 0.2, d: spotLength },
      ];

      positions.forEach((pos) => {
        const lineGeometry = new THREE.PlaneGeometry(pos.w, pos.d);
        const lineMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.x = -Math.PI / 2;
        line.position.set(pos.x, 0.01, pos.z);
        group.add(line);
      });

      // Target zone (goal)
      const targetGeometry = new THREE.PlaneGeometry(spotWidth - 0.4, spotLength - 0.4);
      const targetMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.1,
      });
      const target = new THREE.Mesh(targetGeometry, targetMaterial);
      target.rotation.x = -Math.PI / 2;
      target.position.y = 0.02;
      group.add(target);

      sceneRef.current.add(group);
      parkingSpotMeshRef.current = group;
    }

    // Check parking success
    const spotX = 10;
    const spotZ = -20;
    const tolerance = 1.5;

    const isInSpot =
      Math.abs(vehiclePosition.x - spotX) < tolerance &&
      Math.abs(vehiclePosition.z - spotZ) < tolerance;

    if (isInSpot && !isParkingSuccessful) {
      setIsParkingSuccessful(true);
      addScore(50);
      setInstructorMessage('Excellent parking! You completed the spot perfectly!');
    }
  }, [sceneReady, vehiclePosition, isParkingSuccessful]);

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
    markLessonComplete(`parking-${parkingType}`, finalScore, Math.floor(Date.now() / 1000));
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

      {/* Parking Lot */}
      {sceneReady && sceneRef.current && (
        <>
          <Road
            scene={sceneRef.current}
            roadType="parking"
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
        lessonName={`${parkingType.charAt(0).toUpperCase() + parkingType.slice(1)} Parking`}
        objective={instructorMessage}
        onPause={() => (isPaused ? resumeLesson() : pauseLesson())}
        onQuit={onExit}
        showHints={true}
      />

      {/* Instructor */}
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
            <div className="mt-3 space-y-1 text-xs text-slate-400">
              <p>✓ Drive into the parking spot</p>
              <p>✓ Align properly within boundaries</p>
              <p>✓ Avoid collisions with walls</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success Animation */}
      {isParkingSuccessful && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              <CheckCircle2 className="w-20 h-20 text-brand-green" />
            </motion.div>
            <p className="text-3xl font-bold text-white">Parking Success!</p>
          </div>
        </motion.div>
      )}

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
      {isPlaying && !isPaused && isParkingSuccessful && (
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

export default ParkingLesson;
