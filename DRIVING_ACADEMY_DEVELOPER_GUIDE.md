# Driving Academy Developer Guide

## Getting Started

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Development**
   ```bash
   npm run dev
   ```

## File Structure

```
src/
├── pages/
│   ├── DrivingAcademy.tsx          # Main landing/hub page
│   └── Lessons/
│       ├── TrafficSignalsLesson.tsx # Traffic signal training
│       └── ParkingLesson.tsx        # Parking masterclass
│
├── components/
│   ├── 3D/
│   │   ├── Scene3D.tsx             # Three.js scene setup
│   │   ├── Vehicle.tsx             # Vehicle model + physics
│   │   ├── Road.tsx                # Road generation
│   │   ├── RoadSign.tsx            # Interactive signs
│   │   ├── Instructor.tsx          # Animated instructor (TBD)
│   │   └── Environment.tsx         # Skybox, lighting (TBD)
│   │
│   ├── UI/
│   │   ├── LessonHUD.tsx           # On-screen HUD
│   │   ├── Quiz.tsx                # Quiz interface
│   │   ├── AchievementBadge.tsx    # Badge display
│   │   └── Dashboard.tsx           # Progress dashboard (TBD)
│   │
│   └── Controls/
│       ├── VehicleControls.tsx     # Keyboard input
│       └── CameraControls.tsx      # Camera management
│
├── stores/
│   ├── drivingStore.ts             # Real-time driving state
│   ├── progressStore.ts            # Lesson progress & achievements
│   └── settingsStore.ts            # User preferences
│
└── utils/
    ├── lessonContent.ts            # Lesson definitions & quiz data
    ├── physics.ts                  # Vehicle physics, traffic lights
    ├── audio.ts                    # Audio manager (Howler.js)
    └── achievements.ts             # Achievement logic
```

## Key Concepts

### State Management (Zustand)

#### Driving Store
Real-time state during lessons:
```typescript
- vehiclePosition, vehicleRotation, vehicleVelocity
- Player inputs: steering, throttle, brake
- Lesson state: score, violations, collisions, camera mode
- Actions: updatePosition, addViolation, addScore, etc.
```

#### Progress Store
Long-term progress tracking:
```typescript
- lessons: Map<lessonId, LessonProgress>
- achievements: Map<achievementId, Achievement>
- totalSafetyScore, lessonCount
- Actions: markLessonComplete, unlockAchievement, etc.
```

#### Settings Store
User preferences:
```typescript
- Volume levels (master, voice, SFX)
- Difficulty: 'easy' | 'medium' | 'hard'
- Accessibility: subtitles, instructor visibility
- Performance: performance mode, target FPS
```

### Physics System

**Vehicle Physics**
- Difficulty-based presets (easy/medium/hard)
- Velocity, steering angle, friction, rolling resistance
- Supports car and motorcycle physics

**Traffic Light Controller**
- Red → Green → Yellow cycle
- 30s red, 25s green, 5s yellow
- Methods: update, getColor, setColor, getTimeUntilChange

### Lesson Structure

Each lesson has:
```typescript
{
  id: 'lesson-id',
  name: 'Lesson Name',
  description: 'What students will learn',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  duration: 10,  // minutes
  category: 'Basics' | 'Rules' | 'Safety' | etc,
  badge: '🎯',
  objectives: ['Goal 1', 'Goal 2'],
  quizCount: 3,
  prerequisites?: ['other-lesson-id']
}
```

### Quiz Questions

```typescript
{
  id: 'q-1',
  question: 'What does red mean?',
  options: ['Stop', 'Go', 'Slow', 'Honk'],
  correctAnswerIndex: 0,
  explanation: 'Red means stop before the line.'
}
```

## Adding a New Lesson

### 1. Add Lesson Data
In `src/utils/lessonContent.ts`:
```typescript
export const LESSONS: Record<string, Lesson> = {
  'my-lesson': {
    id: 'my-lesson',
    name: 'My New Lesson',
    // ... other fields
  }
};
```

### 2. Add Quiz Questions
```typescript
export const QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  'my-lesson': [
    { id: 'q1', question: '...', options: [...], correctAnswerIndex: 0, explanation: '...' }
  ]
};
```

### 3. Create Lesson Component
Create `src/pages/Lessons/MyLesson.tsx`:
```typescript
interface MyLessonProps {
  onComplete?: (score: number) => void;
  onExit?: () => void;
}

const MyLesson: React.FC<MyLessonProps> = ({ onComplete, onExit }) => {
  // Use Scene3D, Vehicle, Road components
  // Use VehicleControls, CameraControls
  // Use LessonHUD and Quiz
};
```

### 4. Register in DrivingAcademy
Update the lesson selection handler to route to your component.

## Controls

### Vehicle Controls
- **W / ↑** - Accelerate
- **S / ↓** - Reverse/Brake
- **A / ←** - Steer Left
- **D / →** - Steer Right
- **Space** - Brake
- **1** - First-person camera
- **2** - Third-person camera
- **3** - Top-down camera

### UI Interactions
- Click signs/objects for interaction
- Quiz: Select option → Next
- HUD: Pause, Resume, Exit

## Audio Integration

### Adding Sound Effects
```typescript
import { audioManager } from '../utils/audio';

// Load sound
audioManager.loadSound('car-horn', '/sounds/horn.wav', { volume: 0.8 });

// Play sound
audioManager.play('car-horn');

// Play voice
audioManager.playVoice('instructor-hello');
```

### Background Music
```typescript
audioManager.playBGM('lesson-bgm', true); // fadeIn = true
audioManager.stopBGM(true); // fadeOut = true
```

## Performance Tips

1. **Use Performance Mode** for older devices
   ```typescript
   useSettingsStore().setPerformanceMode(true);
   ```

2. **Lazy Load Components**
   ```typescript
   const Component = React.lazy(() => import('./Component'));
   ```

3. **Optimize 3D Models**
   - Use LOD (Level of Detail)
   - Limit polygon count
   - Use texture atlases

4. **Monitor Frame Rate**
   - Set targetFPS appropriately
   - Profile with browser DevTools

## Testing

### Manual Testing Checklist
- [ ] Vehicle physics responds correctly
- [ ] Camera modes work smoothly
- [ ] Quiz displays all questions
- [ ] Scores calculate correctly
- [ ] Achievements unlock properly
- [ ] Progress saves between sessions
- [ ] Audio plays without issues
- [ ] Mobile responsive layout works

### Browser DevTools
- Monitor performance in Lighthouse
- Check for console errors
- Profile JavaScript execution
- Monitor WebGL performance

## Debugging

### Enable Debug Info
Add console logs to understand state flow:
```typescript
import { useDrivingStore } from '../stores/drivingStore';

const state = useDrivingStore();
console.log('Current state:', {
  position: state.vehiclePosition,
  score: state.score,
  violations: state.violations
});
```

### Common Issues

**Scene not rendering**
- Check if Scene3D component has parent with height
- Verify WebGL support in browser

**Vehicle not moving**
- Check if VehicleControls component is mounted
- Verify physics update loop is running

**Quiz not showing**
- Ensure lesson data exists in QUIZ_QUESTIONS
- Check Quiz component is properly imported

**Audio not playing**
- Check audio files exist at specified paths
- Verify Howler.js is loaded
- Check browser audio permissions

## Deployment

### Building for Production
```bash
npm run build
```

This creates optimized bundle in `dist/`

### Environment Variables
None required for core functionality, but for production:
- Set API keys for analytics
- Configure CDN for assets
- Set up error tracking

## Future Development

### To-Do Features
- [ ] Realistic 3D models
- [ ] Instructor voice acting
- [ ] NPC traffic simulation
- [ ] Multiplayer support
- [ ] Mobile app native code
- [ ] Leaderboards
- [ ] Social sharing
- [ ] Advanced analytics

### Architecture Improvements
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Improve error boundaries
- [ ] Add logging/analytics
- [ ] Implement service worker for offline
- [ ] Add data persistence/sync

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Cannon.js Documentation](https://www.npmjs.com/package/cannon-es)
- [Howler.js Documentation](https://howlerjs.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## Support

For questions or issues:
1. Check existing code for examples
2. Review inline documentation
3. Check browser console for errors
4. Profile with DevTools
5. Test on different browsers

---

**Last Updated:** 2025
**Version:** 1.0
