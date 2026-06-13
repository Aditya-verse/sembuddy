import React from 'react';
import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress?: number;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon,
  name,
  description,
  unlocked,
  progress = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      className={`rounded-xl p-6 border-2 transition-all cursor-pointer ${
        unlocked
          ? 'bg-gradient-to-br from-brand-green/20 to-brand-teal/20 border-brand-green'
          : 'bg-slate-900/40 border-slate-700/40'
      }`}
    >
      {/* Icon */}
      <div
        className={`text-6xl text-center mb-3 transition-transform ${
          unlocked ? 'scale-100' : 'scale-75 opacity-50'
        }`}
      >
        {icon}
      </div>

      {/* Name */}
      <h3
        className={`text-center font-bold mb-1 ${
          unlocked ? 'text-white' : 'text-slate-500'
        }`}
      >
        {name}
      </h3>

      {/* Description */}
      <p
        className={`text-xs text-center mb-3 ${
          unlocked ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        {description}
      </p>

      {/* Progress Bar (if not unlocked) */}
      {!unlocked && progress > 0 && (
        <div className="mb-2">
          <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              className="h-full bg-gradient-to-r from-brand-blue to-brand-teal"
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-slate-500 text-center mt-1">
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {/* Unlocked Badge */}
      {unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="inline-block px-3 py-1 rounded-full bg-brand-green/30 border border-brand-green text-xs font-bold text-brand-green">
            ✓ Unlocked
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AchievementBadge;
