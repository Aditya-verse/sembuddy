import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { QuizQuestion } from '../utils/lessonContent';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
  onCancel?: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onCancel }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswerIndex;

  const handleAnswer = (index: number) => {
    if (answered) return;

    setSelectedAnswer(index);
    setAnswered(true);

    if (index === question.correctAnswerIndex) {
      setScore((s) => s + Math.round(100 / questions.length));
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      // Quiz complete
      if (onComplete) {
        onComplete(score);
      }
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-brand-card to-brand-dark border border-brand-teal/30 rounded-2xl p-8 max-w-2xl w-full"
      >
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
              Question {currentQuestion + 1} of {questions.length}
            </h3>
            <span className="text-sm font-bold text-brand-green">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-brand-blue to-brand-teal"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">{question.question}</h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: answered ? 1 : 1.02 }}
                whileTap={{ scale: answered ? 1 : 0.98 }}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedAnswer === index
                    ? isCorrect
                      ? 'bg-green-500/20 border-green-500 text-green-300'
                      : 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-slate-800/40 border-slate-600/40 text-slate-300 hover:border-brand-teal/50'
                } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index
                        ? isCorrect
                          ? 'bg-green-500 border-green-600'
                          : 'bg-red-500 border-red-600'
                        : 'border-slate-500'
                    }`}
                  >
                    {selectedAnswer === index && (
                      isCorrect ? (
                        <Check size={14} className="text-white" />
                      ) : (
                        <X size={14} className="text-white" />
                      )
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-lg ${
                  isCorrect
                    ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                    : 'bg-orange-500/10 border border-orange-500/30 text-orange-300'
                }`}
              >
                <p className="font-semibold mb-1">Explanation</p>
                <p className="text-sm">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          {currentQuestion === 0 && (
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-lg border border-slate-600/40 text-slate-300 hover:bg-slate-800/40 transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!answered}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              answered
                ? 'bg-brand-teal text-white hover:bg-brand-teal/80'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Quiz;
