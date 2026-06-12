export interface Lesson {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  category: string;
  badge?: string;
  prerequisites?: string[];
  objectives: string[];
  quizCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const LESSONS: Record<string, Lesson> = {
  'traffic-signals': {
    id: 'traffic-signals',
    name: 'Traffic Signal Training',
    description: 'Learn the most important road rule - understanding traffic signals (Red, Yellow, Green)',
    difficulty: 'beginner',
    duration: 8,
    category: 'Basics',
    badge: '🚦',
    objectives: [
      'Understand when to stop at red signal',
      'Know when to prepare to stop at yellow signal',
      'Learn when to proceed at green signal',
      'Follow intersection safety rules',
    ],
    quizCount: 3,
  },
  'road-signs': {
    id: 'road-signs',
    name: 'Road Sign Simulator',
    description: 'Learn to identify and understand all important road signs',
    difficulty: 'beginner',
    duration: 15,
    category: 'Rules',
    badge: '🛑',
    objectives: [
      'Identify stop signs and road markings',
      'Understand no-entry and one-way signs',
      'Learn speed limit and warning signs',
      'Recognize special zone indicators',
    ],
    quizCount: 5,
  },
  'seat-belt': {
    id: 'seat-belt',
    name: 'Seat Belt Safety',
    description: 'Learn the importance of wearing seat belts',
    difficulty: 'beginner',
    duration: 5,
    category: 'Safety',
    badge: '🔐',
    objectives: [
      'Understand seat belt safety importance',
      'Learn proper fastening techniques',
      'Know accident prevention benefits',
      'Understand legal requirements',
    ],
    quizCount: 2,
  },
  'helmet-safety': {
    id: 'helmet-safety',
    name: 'Helmet Safety',
    description: 'Learn the importance of wearing helmets on two-wheelers',
    difficulty: 'beginner',
    duration: 5,
    category: 'Safety',
    badge: '🪖',
    objectives: [
      'Understand head protection importance',
      'Learn types of certified helmets',
      'Know accident survival benefits',
      'Understand legal requirements',
    ],
    quizCount: 2,
  },
  'parking-reverse': {
    id: 'parking-reverse',
    name: 'Reverse Parking',
    description: 'Master the skill of reverse parking with step-by-step guidance',
    difficulty: 'intermediate',
    duration: 10,
    category: 'Parking',
    badge: '🅿️',
    prerequisites: ['traffic-signals'],
    objectives: [
      'Learn mirror checking techniques',
      'Understand steering angles',
      'Practice smooth control',
      'Avoid collisions and obstacles',
    ],
    quizCount: 3,
  },
  'parking-parallel': {
    id: 'parking-parallel',
    name: 'Parallel Parking',
    description: 'Learn professional parallel parking techniques',
    difficulty: 'intermediate',
    duration: 12,
    category: 'Parking',
    badge: '🅿️',
    prerequisites: ['parking-reverse'],
    objectives: [
      'Master spatial awareness',
      'Learn precise steering angles',
      'Practice smooth maneuvers',
      'Optimize parking efficiency',
    ],
    quizCount: 3,
  },
  'roundabout': {
    id: 'roundabout',
    name: 'Roundabout Navigation',
    description: 'Learn how to safely navigate roundabouts',
    difficulty: 'intermediate',
    duration: 10,
    category: 'Driving',
    badge: '🔄',
    prerequisites: ['traffic-signals'],
    objectives: [
      'Understand right-of-way rules',
      'Learn lane discipline',
      'Practice smooth transitions',
      'Know exit strategies',
    ],
    quizCount: 3,
  },
  'blind-spot': {
    id: 'blind-spot',
    name: 'Blind Spot Awareness',
    description: 'Learn to detect vehicles in blind spots and drive safely',
    difficulty: 'intermediate',
    duration: 8,
    category: 'Safety',
    badge: '👁️',
    objectives: [
      'Identify blind spot locations',
      'Learn mirror checking techniques',
      'Practice shoulder checks',
      'Master safe lane changes',
    ],
    quizCount: 3,
  },
  'overtaking': {
    id: 'overtaking',
    name: 'Overtaking Training',
    description: 'Learn safe and unsafe overtaking techniques',
    difficulty: 'intermediate',
    duration: 8,
    category: 'Driving',
    badge: '➡️',
    prerequisites: ['blind-spot'],
    objectives: [
      'Understand indicator usage',
      'Learn speed judgement',
      'Practice safe positioning',
      'Know when to overtake',
    ],
    quizCount: 3,
  },
  'night-driving': {
    id: 'night-driving',
    name: 'Night Driving Simulator',
    description: 'Learn to drive safely in low visibility conditions',
    difficulty: 'advanced',
    duration: 12,
    category: 'Conditions',
    badge: '🌙',
    prerequisites: ['traffic-signals', 'road-signs'],
    objectives: [
      'Understand high beam vs low beam',
      'Learn visibility management',
      'Practice safe following distance',
      'Master night driving techniques',
    ],
    quizCount: 3,
  },
  'monsoon-driving': {
    id: 'monsoon-driving',
    name: 'Monsoon Driving',
    description: 'Learn to drive safely on wet roads and rainy conditions',
    difficulty: 'advanced',
    duration: 10,
    category: 'Conditions',
    badge: '🌧️',
    objectives: [
      'Understand hydroplaning prevention',
      'Learn braking distance adjustments',
      'Practice speed control',
      'Know visibility techniques',
    ],
    quizCount: 3,
  },
  'highway-driving': {
    id: 'highway-driving',
    name: 'Highway Driving',
    description: 'Learn safe high-speed driving techniques on highways',
    difficulty: 'advanced',
    duration: 15,
    category: 'Driving',
    badge: '🛣️',
    prerequisites: ['overtaking', 'road-signs'],
    objectives: [
      'Understand lane discipline',
      'Learn speed management',
      'Practice safe overtaking',
      'Know emergency procedures',
    ],
    quizCount: 4,
  },
  'emergency-response': {
    id: 'emergency-response',
    name: 'Emergency Response',
    description: 'Learn how to handle emergency situations while driving',
    difficulty: 'advanced',
    duration: 15,
    category: 'Emergency',
    badge: '🚨',
    prerequisites: ['highway-driving'],
    objectives: [
      'Handle tyre punctures',
      'Deal with brake failure',
      'Handle engine failure',
      'Know emergency procedures',
    ],
    quizCount: 4,
  },
};

export const QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  'traffic-signals': [
    {
      id: 'ts-q1',
      question: 'What should you do when you see a red traffic signal?',
      options: [
        'Stop before the stop line',
        'Speed up to cross quickly',
        'Slow down and proceed',
        'Honk and continue',
      ],
      correctAnswerIndex: 0,
      explanation: 'You must always stop before the stop line when the signal is red. Never cross it.',
    },
    {
      id: 'ts-q2',
      question: 'What does a yellow signal indicate?',
      options: [
        'Speed up immediately',
        'Prepare to stop safely',
        'Continue without caution',
        'Turn left only',
      ],
      correctAnswerIndex: 1,
      explanation: 'Yellow signal means prepare to stop. Do not accelerate to beat the signal.',
    },
    {
      id: 'ts-q3',
      question: 'When is it safe to proceed at a green signal?',
      options: [
        'Always, as soon as it turns green',
        'When you check that the intersection is clear',
        'When other vehicles clear out',
        'After you honk twice',
      ],
      correctAnswerIndex: 1,
      explanation: 'Green means go only when the intersection is clear. Always check surroundings.',
    },
  ],
  'road-signs': [
    {
      id: 'rs-q1',
      question: 'What does a red stop sign indicate?',
      options: [
        'Slow down',
        'Come to a complete stop',
        'Proceed with caution',
        'Turn right only',
      ],
      correctAnswerIndex: 1,
      explanation: 'A red stop sign means you must come to a complete stop and check for traffic.',
    },
  ],
  'blind-spot': [
    {
      id: 'bs-q1',
      question: 'Where are vehicle blind spots typically located?',
      options: [
        'In front of the vehicle',
        'Behind and to the sides of the vehicle',
        'On the roof',
        'Only at night',
      ],
      correctAnswerIndex: 1,
      explanation: 'Blind spots are areas around the vehicle not visible in mirrors or direct vision.',
    },
  ],
};

export function getLesson(lessonId: string): Lesson | undefined {
  return LESSONS[lessonId];
}

export function getQuizQuestions(lessonId: string): QuizQuestion[] {
  return QUIZ_QUESTIONS[lessonId] || [];
}

export function getAllLessons(): Lesson[] {
  return Object.values(LESSONS);
}

export function getLessonsByCategory(category: string): Lesson[] {
  return Object.values(LESSONS).filter(l => l.category === category);
}

export function getLessonsByDifficulty(difficulty: string): Lesson[] {
  return Object.values(LESSONS).filter(l => l.difficulty === difficulty);
}
