import React from 'react';
import { useDrivingStore } from '../stores/drivingStore';
import { motion } from 'framer-motion';

interface LessonHUDProps {
  lessonName: string;
  objective?: string;
  onPause?: () => void;
  onQuit?: () => void;
  showHints?: boolean;
}

const LessonHUD: React.FC<LessonHUDProps> = ({
  lessonName,
  objective,
  onPause,
  onQuit,
  showHints,
}) => {
  const { score, collisions, violations, vehicleVelocity, isPlaying, isPaused } =
    useDrivingStore();

  const kmh = Math.round(vehicleVelocity * 3.6);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top HUD - Lesson Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 right-6 pointer-events-auto"
      >
        <div className="bg-black/60 backdrop-blur-md border border-brand-teal/30 rounded-lg p-4">
          <h2 className="text-xl font-bold text-white mb-2">{lessonName}</h2>
          {objective && (
            <p className="text-sm text-slate-300">{objective}</p>
          )}
        </div>
      </motion.div>

      {/* Speed HUD - Center Bottom */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto"
      >
        <div className="bg-black/70 backdrop-blur-md border border-brand-green/30 rounded-lg p-6 w-40">
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-green font-display">
              {kmh}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">
              km/h
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats HUD - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-8 right-8 pointer-events-auto"
      >
        <div className="bg-black/60 backdrop-blur-md border border-brand-blue/30 rounded-lg p-4 space-y-3 w-48">
          {/* Score */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-300">Score</span>
            <span className="font-bold text-brand-green">{score}</span>
          </div>

          {/* Collisions */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-300">Collisions</span>
            <span className={`font-bold ${collisions > 0 ? 'text-red-500' : 'text-slate-300'}`}>
              {collisions}
            </span>
          </div>

          {/* Violations */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-300">Violations</span>
            <span className={`font-bold ${violations.length > 0 ? 'text-orange-500' : 'text-slate-300'}`}>
              {violations.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Control Hints - Top Right */}
      {showHints && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 right-6 pointer-events-auto"
        >
          <div className="bg-black/60 backdrop-blur-md border border-slate-600/30 rounded-lg p-4 w-56 text-xs text-slate-300">
            <div className="font-bold text-white mb-2">Controls</div>
            <div className="space-y-1">
              <div>🎮 <span>W/↑ - Accelerate</span></div>
              <div>🎮 <span>S/↓ - Reverse</span></div>
              <div>🎮 <span>A/← → D/→ - Steer</span></div>
              <div>🎮 <span>Space - Brake</span></div>
              <div>📷 <span>1/2/3 - Camera Views</span></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center pointer-events-auto"
        >
          <div className="bg-brand-card border border-brand-teal/30 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-6">Lesson Paused</h3>
            <div className="space-y-3">
              <button
                onClick={onPause}
                className="w-full px-6 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/80 transition"
              >
                Resume
              </button>
              <button
                onClick={onQuit}
                className="w-full px-6 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition"
              >
                Exit Lesson
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LessonHUD;
