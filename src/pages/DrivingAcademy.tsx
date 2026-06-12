import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Gauge,
  Trophy,
  Lock,
  CheckCircle2,
  ArrowRight,
  Settings,
  Home,
} from 'lucide-react';
import {
  getAllLessons,
  getLessonsByCategory,
  getLessonsByDifficulty,
} from '../utils/lessonContent';
import { useProgressStore } from '../stores/progressStore';

type FilterType = 'all' | 'category' | 'difficulty';

const DrivingAcademy: React.FC<{ onLessonSelect?: (lessonId: string) => void; onHome?: () => void }> = ({
  onLessonSelect,
  onHome,
}) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const lessons = getAllLessons();
  const { lessons: progressLessons, achievements } = useProgressStore();

  // Get filtered lessons
  let filteredLessons = lessons;
  if (filterType === 'category' && selectedFilter) {
    filteredLessons = getLessonsByCategory(selectedFilter);
  } else if (filterType === 'difficulty' && selectedFilter) {
    filteredLessons = getLessonsByDifficulty(selectedFilter);
  }

  const categories = [...new Set(lessons.map((l) => l.category))];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const completedCount = Array.from(progressLessons.values()).filter(
    (l) => l.completed
  ).length;
  const achievementCount = achievements.size;

  return (
    <div className="min-h-screen bg-brand-dark text-white overflow-x-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-brand-blue/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-brand-teal/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-white/10 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onHome}
              className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white"
            >
              <Home size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-display font-bold text-gradient">
                🚗 Driving Academy
              </h1>
              <p className="text-sm text-slate-400">Learn Road Safety Through 3D Simulations</p>
            </div>
          </div>
          <button className="p-3 rounded-lg hover:bg-white/10 transition border border-white/10 text-slate-400 hover:text-white">
            <Settings size={20} />
          </button>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: BookOpen,
              label: 'Lessons Completed',
              value: `${completedCount}/${lessons.length}`,
              color: 'brand-blue',
            },
            {
              icon: Trophy,
              label: 'Achievements',
              value: achievementCount,
              color: 'brand-green',
            },
            {
              icon: Gauge,
              label: 'Safety Score',
              value: useProgressStore().totalSafetyScore,
              color: 'brand-teal',
              unit: '%',
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-brand-teal/30 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}`}>
                      {stat.value}
                      {stat.unit && <span className="text-lg ml-1">{stat.unit}</span>}
                    </p>
                  </div>
                  <Icon className={`w-12 h-12 text-${stat.color} opacity-50`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-8"
      >
        <div className="space-y-4">
          {/* Category Filter */}
          <div>
            <p className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-widest">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFilterType('all');
                  setSelectedFilter(null);
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === 'all'
                    ? 'bg-brand-teal text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilterType('category');
                    setSelectedFilter(cat);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${
                    filterType === 'category' && selectedFilter === cat
                      ? 'bg-brand-blue text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <p className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-widest">
              Difficulty
            </p>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setFilterType('difficulty');
                    setSelectedFilter(diff);
                  }}
                  className={`px-4 py-2 rounded-lg transition capitalize ${
                    filterType === 'difficulty' && selectedFilter === diff
                      ? 'bg-brand-green text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lessons Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 max-w-7xl mx-auto px-6 pb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson, index) => {
            const progress = progressLessons.get(lesson.id);
            const isCompleted = progress?.completed || false;

            return (
              <motion.button
                key={lesson.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onLessonSelect?.(lesson.id)}
                className="text-left bg-gradient-to-br from-brand-card/80 to-brand-dark/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-brand-teal/50 transition-all hover:shadow-xl hover:shadow-brand-teal/10"
              >
                {/* Header with badge */}
                <div className="relative p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{lesson.badge}</div>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-brand-green" />
                    ) : lesson.prerequisites &&
                      lesson.prerequisites.length > 0 &&
                      !lesson.prerequisites.some((p) =>
                        progressLessons.get(p)?.completed
                      ) ? (
                      <Lock className="w-5 h-5 text-slate-600" />
                    ) : (
                      <Gauge className="w-5 h-5 text-brand-teal opacity-50" />
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-white mb-1">{lesson.name}</h3>
                  <p className="text-xs text-slate-400">{lesson.description}</p>
                </div>

                {/* Stats */}
                <div className="px-6 py-4 border-t border-white/5 space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="text-white font-semibold">{lesson.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty</span>
                    <span className="text-white font-semibold capitalize">
                      {lesson.difficulty}
                    </span>
                  </div>
                  {progress?.highScore && (
                    <div className="flex justify-between">
                      <span>High Score</span>
                      <span className="text-brand-green font-semibold">
                        {progress.highScore}%
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-white group">
                  <span className="text-sm font-semibold">
                    {isCompleted ? '✓ Completed' : 'Start Lesson'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default DrivingAcademy;
