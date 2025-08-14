import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Settings, FileText, Timer, X, Plus, Minus, Zap, Target, TrendingUp, Coffee, Wind, Trees, Waves, Cloud, Headphones, VolumeX, Bell, BellOff, Keyboard, Flame } from 'lucide-react';
import { useTodos } from './context/TodoContext';

type TimerMode = 'pomodoro' | '52-17' | 'flowtime' | '90-20' | '2-minute' | 'reverse-pomodoro' | 'stopwatch';

interface TimerConfig {
  name: string;
  description: string;
  workTime: number; // in seconds
  breakTime: number; // in seconds
  icon?: React.ReactNode;
}

const timerConfigs: Record<TimerMode, TimerConfig> = {
  'pomodoro': {
    name: 'Pomodoro',
    description: '25 min work, 5 min break',
    workTime: 25 * 60,
    breakTime: 5 * 60,
  },
  '52-17': {
    name: '52/17 Rule',
    description: '52 min work, 17 min break',
    workTime: 52 * 60,
    breakTime: 17 * 60,
  },
  'flowtime': {
    name: 'Flowtime',
    description: 'Work until you lose focus',
    workTime: 0, // No preset time
    breakTime: 5 * 60,
  },
  '90-20': {
    name: '90/20 Rule',
    description: '90 min deep focus, 20 min rest',
    workTime: 90 * 60,
    breakTime: 20 * 60,
  },
  '2-minute': {
    name: '2-Minute Rule',
    description: 'Start with just 2 minutes',
    workTime: 2 * 60,
    breakTime: 1 * 60,
  },
  'reverse-pomodoro': {
    name: 'Reverse Pomodoro',
    description: 'Start with a break, then work',
    workTime: 25 * 60,
    breakTime: 5 * 60, // Break comes first
  },
  'stopwatch': {
    name: 'Stopwatch',
    description: 'Basic timer, count up',
    workTime: 0,
    breakTime: 0,
  },
};

const FocusPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerConfigs['pomodoro'].workTime);
  const [elapsedTime, setElapsedTime] = useState(0); // For stopwatch and flowtime
  const [selectedTodoId, setSelectedTodoId] = useState('');
  const [showConfigureMenu, setShowConfigureMenu] = useState(false);
  const [showLogMenu, setShowLogMenu] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  const [iterations, setIterations] = useState(1);
  const [currentIteration, setCurrentIteration] = useState(1);
  const [startWithBreak, setStartWithBreak] = useState(false); // For reverse pomodoro and custom configurations
  
  // New feature states
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [currentSound, setCurrentSound] = useState<string>('none');
  const [soundVolume, setSoundVolume] = useState(50);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(120); // minutes
  const [dailyProgress, setDailyProgress] = useState(0); // minutes
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Configurable durations for each mode (in minutes)
  const [modeDurations, setModeDurations] = useState<Record<TimerMode, { work: number; break: number }>>({
    'pomodoro': { work: 25, break: 5 },
    '52-17': { work: 52, break: 17 },
    'flowtime': { work: 0, break: 5 },
    '90-20': { work: 90, break: 20 },
    '2-minute': { work: 2, break: 1 },
    'reverse-pomodoro': { work: 25, break: 5 },
    'stopwatch': { work: 0, break: 0 },
  });
  
  const sessionStartTime = useRef<Date | null>(null);
  const sessionTimeElapsed = useRef(0);
  
  const { todos, addSessionToTodo } = useTodos();
  const activeTodos = todos.filter(todo => !todo.completed);
  
  // Focus sounds library
  const focusSounds = [
    { id: 'none', name: 'No Sound', icon: VolumeX },
    { id: 'rain', name: 'Rain', icon: Cloud },
    { id: 'forest', name: 'Forest', icon: Trees },
    { id: 'waves', name: 'Ocean Waves', icon: Waves },
    { id: 'whitenoise', name: 'White Noise', icon: Wind },
    { id: 'cafe', name: 'Café Ambience', icon: Coffee },
    { id: 'lofi', name: 'Lo-Fi Beats', icon: Headphones },
  ];
  

  // Get current timer configuration
  const getCurrentConfig = () => {
    const durations = modeDurations[timerMode];
    return {
      ...timerConfigs[timerMode],
      workTime: durations.work * 60,
      breakTime: durations.break * 60,
    };
  };

  // Timer logic
  useEffect(() => {
    let interval: number | null = null;
    
    if (isRunning) {
      if (timerMode === 'stopwatch' || timerMode === 'flowtime') {
        // Count up for stopwatch and flowtime
        interval = setInterval(() => {
          setElapsedTime(prev => prev + 1);
          sessionTimeElapsed.current += 1;
          // Update daily progress
          if (!isBreakTime && sessionTimeElapsed.current % 60 === 0) {
            setDailyProgress(prev => prev + 1);
          }
        }, 1000) as unknown as number;
      } else if (timeLeft > 0) {
        // Count down for other modes
        interval = setInterval(() => {
          setTimeLeft(timeLeft => timeLeft - 1);
          sessionTimeElapsed.current += 1;
          // Update daily progress
          if (!isBreakTime && sessionTimeElapsed.current % 60 === 0) {
            setDailyProgress(prev => prev + 1);
          }
        }, 1000) as unknown as number;
      } else if (timeLeft === 0) {
        // Timer completed
        handleTimerComplete();
      }
    }
    
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isRunning, timeLeft, timerMode, isBreakTime]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (isRunning) pauseTimer(); else startTimer();
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetTimer();
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowStatsPanel(!showStatsPanel);
          }
          break;
        case '?':
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, showStatsPanel, showKeyboardShortcuts]);
  
  // Handle sound playback - simplified version
  useEffect(() => {
    if (currentSound !== 'none' && !isSoundMuted) {
      // For now, just log that sound would play
      // Actual audio implementation would require hosted audio files
      console.log(`Playing sound: ${currentSound} at volume ${soundVolume}`);
    }
    
    return () => {
      // Cleanup
    };
  }, [currentSound, isSoundMuted, soundVolume]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    sessionStartTime.current = new Date();
    sessionTimeElapsed.current = 0;
    
    // Handle starting with break if configured
    if ((timerMode === 'reverse-pomodoro' || startWithBreak) && !isBreakTime && timeLeft === getCurrentConfig().workTime) {
      setIsBreakTime(true);
      setTimeLeft(getCurrentConfig().breakTime);
    }
    
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (timerMode !== 'flowtime' && timerMode !== 'stopwatch') {
      saveSession();
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Trigger notification with appropriate message
    if (!isBreakTime) {
      setCurrentStreak(prev => prev + 1);
      triggerNotification(`Great work! You completed a ${timerMode} session. Time for a break! 🎉`);
    } else {
      triggerNotification('Break time is over. Ready to focus again? 💪');
    }
    
    const config = getCurrentConfig();
    
    // Toggle between work and break
    if (isBreakTime) {
      // Break is over, check if we need another iteration
      if (currentIteration < iterations) {
        setCurrentIteration(prev => prev + 1);
        setIsBreakTime(false);
        setTimeLeft(config.workTime);
        // Auto-start next work session
        setIsRunning(true);
      } else {
        // All iterations complete
        setIsBreakTime(false);
        setTimeLeft(config.workTime);
        setCurrentIteration(1);
      }
    } else {
      // Work is over, start break (if applicable)
      saveSession();
      if (config.breakTime > 0) {
        setIsBreakTime(true);
        setTimeLeft(config.breakTime);
        // Show breathing guide during breaks
        if (config.breakTime >= 60) {
          setShowBreathingGuide(true);
        }
        // Auto-start break
        setIsRunning(true);
      } else if (currentIteration < iterations) {
        // No break, but more iterations to go
        setCurrentIteration(prev => prev + 1);
        setTimeLeft(config.workTime);
        setIsRunning(true);
      } else {
        // All iterations complete
        setTimeLeft(config.workTime);
        setCurrentIteration(1);
      }
    }
  };
  
  const triggerNotification = (message: string) => {
    if (!notificationsEnabled) return;
    
    // Visual notification
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Play custom notification sound using Web Audio API - with proper error handling
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Simple notification beep
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
    
    // Browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Timer', {
        body: message,
        icon: '/favicon.ico',
        tag: 'focus-timer'
      });
    }
    
    // Auto-hide visual notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreakTime(false);
    setElapsedTime(0);
    sessionTimeElapsed.current = 0;
    sessionStartTime.current = null;
    setCurrentIteration(1);
    
    const config = getCurrentConfig();
    if (timerMode === 'stopwatch' || timerMode === 'flowtime') {
      setTimeLeft(0);
    } else {
      setTimeLeft(config.workTime);
    }
  };

  const handleModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
    setIsRunning(false);
    setIsBreakTime(false);
    setElapsedTime(0);
    sessionTimeElapsed.current = 0;
    setCurrentIteration(1);
    
    // Set startWithBreak for reverse pomodoro
    setStartWithBreak(mode === 'reverse-pomodoro');
    
    const durations = modeDurations[mode];
    setTimeLeft(durations.work * 60);
  };

  const updateModeDuration = (mode: TimerMode, type: 'work' | 'break', value: number) => {
    const newDurations = {
      ...modeDurations,
      [mode]: {
        ...modeDurations[mode],
        [type]: Math.max(type === 'break' ? 0 : 1, value)
      }
    };
    setModeDurations(newDurations);
    
    // Update current timer if it's the active mode
    if (mode === timerMode && !isRunning) {
      if (type === 'work' && !isBreakTime) {
        setTimeLeft(newDurations[mode].work * 60);
      } else if (type === 'break' && isBreakTime) {
        setTimeLeft(newDurations[mode].break * 60);
      }
    }
  };

  const saveSession = async () => {
    if (selectedTodoId && sessionStartTime.current && sessionTimeElapsed.current > 0) {
      const session = {
        id: Date.now().toString(),
        startTime: sessionStartTime.current,
        endTime: new Date(),
        duration: sessionTimeElapsed.current
      };
      await addSessionToTodo(selectedTodoId, session);
      sessionStartTime.current = null;
      sessionTimeElapsed.current = 0;
    }
  };

  // Calculate progress based on mode
  const getProgress = () => {
    if (timerMode === 'stopwatch' || timerMode === 'flowtime') {
      return 0; // No progress bar for count-up modes
    }
    const config = getCurrentConfig();
    const totalTime = isBreakTime ? config.breakTime : config.workTime;
    if (totalTime === 0) return 0;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const progress = getProgress();
  const selectedTodo = todos.find(t => t.id === selectedTodoId);
  
  // Get display time based on mode
  const getDisplayTime = () => {
    if (timerMode === 'stopwatch' || timerMode === 'flowtime') {
      return formatTime(elapsedTime);
    }
    return formatTime(timeLeft);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-transparent to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 opacity-50" />
      
      {/* Custom Visual Notification */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3">
            <div className="animate-pulse">
              <Bell className="w-6 h-6" />
            </div>
            <p className="font-medium">{notificationMessage}</p>
            <button 
              onClick={() => setShowNotification(false)}
              className="ml-4 hover:bg-white/20 rounded p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Floating Stats Panel */}
      {showStatsPanel && (
        <div className="absolute top-20 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-5 w-72 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Today's Stats</h3>
            <button 
              onClick={() => setShowStatsPanel(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Progress</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {dailyProgress}/{dailyGoal} min
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((dailyProgress / dailyGoal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.max(0, dailyGoal - dailyProgress)} minutes remaining
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {currentStreak}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Session Streak</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round((dailyProgress / dailyGoal) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Focus Score</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Sessions Today</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {Math.floor(dailyProgress / 25)} completed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      

      {/* Configure Menu Modal */}
      {showConfigureMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Configure Timer</h2>
              <button
                onClick={() => setShowConfigureMenu(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mode Description */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {timerMode === 'pomodoro' && 'Classic Pomodoro technique for focused work sessions with regular breaks.'}
                {timerMode === '52-17' && 'Extended focus sessions of 52 minutes with 17-minute breaks for deeper concentration.'}
                {timerMode === 'flowtime' && 'Work until you naturally lose focus, then take a break. Perfect for finding your rhythm.'}
                {timerMode === '90-20' && 'Based on ultradian rhythms - 90 minutes of deep focus followed by 20-minute rest.'}
                {timerMode === '2-minute' && 'Start with just 2 minutes to overcome procrastination. Momentum often keeps you going.'}
                {timerMode === 'reverse-pomodoro' && 'Start with a break to ease into work. Helpful when you\'re resisting starting.'}
                {timerMode === 'stopwatch' && 'Simple timer that counts up. Track your work without predetermined durations.'}
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Focus Duration - Hide for stopwatch and flowtime */}
              {timerMode !== 'stopwatch' && timerMode !== 'flowtime' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Focus Duration
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateModeDuration(timerMode, 'work', modeDurations[timerMode].work - 1)}
                      className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center"
                      disabled={modeDurations[timerMode].work <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="1"
                        max="120"
                        value={modeDurations[timerMode].work}
                        onChange={(e) => updateModeDuration(timerMode, 'work', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {modeDurations[timerMode].work} min
                      </div>
                    </div>
                    <button
                      onClick={() => updateModeDuration(timerMode, 'work', modeDurations[timerMode].work + 1)}
                      className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center"
                      disabled={modeDurations[timerMode].work >= 120}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Break Duration - Hide for stopwatch */}
              {timerMode !== 'stopwatch' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {timerMode === 'flowtime' ? 'Break Duration (after ending flow)' : 'Break Duration'}
                  </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateModeDuration(timerMode, 'break', modeDurations[timerMode].break - 1)}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center"
                    disabled={modeDurations[timerMode].break <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={modeDurations[timerMode].break}
                      onChange={(e) => updateModeDuration(timerMode, 'break', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {modeDurations[timerMode].break} min
                    </div>
                  </div>
                  <button
                    onClick={() => updateModeDuration(timerMode, 'break', modeDurations[timerMode].break + 1)}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center"
                    disabled={modeDurations[timerMode].break >= 30}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                </div>
              )}

              {/* Iterations - Hide for stopwatch and flowtime */}
              {timerMode !== 'stopwatch' && timerMode !== 'flowtime' && (
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Iterations
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIterations(Math.max(1, iterations - 1))}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center"
                    disabled={iterations <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {iterations}
                    </div>
                  </div>
                  <button
                    onClick={() => setIterations(Math.min(10, iterations + 1))}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center"
                    disabled={iterations >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              )}

              {/* Start with Break Toggle - Hide for stopwatch */}
              {timerMode !== 'stopwatch' && (
                <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={startWithBreak}
                    onChange={(e) => setStartWithBreak(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start with break period
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                  {timerMode === 'reverse-pomodoro' 
                    ? 'Reverse Pomodoro starts with a break to help overcome resistance'
                    : timerMode === '2-minute'
                    ? 'Starting with a break can help ease into difficult tasks'
                    : 'Begin your session with a break before focusing'}
                </p>
              </div>
              )}

              {/* Session Preview - Hide for stopwatch */}
              {timerMode !== 'stopwatch' && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Preview</div>
                <div className="flex items-center space-x-1 overflow-x-auto">
                  {Array.from({ length: iterations }).map((_, i) => {
                    const showBreakFirst = startWithBreak && i === 0;
                    const showBreakAfter = !startWithBreak && modeDurations[timerMode].break > 0 && i < iterations - 1;
                    const showBreakBetween = startWithBreak && modeDurations[timerMode].break > 0 && i > 0 && i < iterations;
                    
                    return (
                      <div key={i} className="flex items-center">
                        {showBreakFirst && (
                          <div className="bg-blue-500 h-2 rounded" style={{ width: `${Math.min(modeDurations[timerMode].break * 2, 60)}px` }} />
                        )}
                        {showBreakBetween && (
                          <div className="bg-blue-500 h-2 rounded ml-1" style={{ width: `${Math.min(modeDurations[timerMode].break * 2, 60)}px` }} />
                        )}
                        <div className={`bg-green-500 h-2 rounded ${(showBreakFirst || showBreakBetween) ? 'ml-1' : ''}`} 
                             style={{ width: `${Math.min(modeDurations[timerMode].work * 2, 120)}px` }} />
                        {showBreakAfter && (
                          <div className="bg-blue-500 h-2 rounded ml-1" style={{ width: `${Math.min(modeDurations[timerMode].break * 2, 60)}px` }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {timerMode === 'flowtime' 
                    ? 'Flow until you naturally lose focus, then take a break'
                    : `Total: ${modeDurations[timerMode].work * iterations + modeDurations[timerMode].break * Math.max(iterations - (startWithBreak ? 0 : 1), startWithBreak ? iterations : 0)} minutes`}
                </div>
              </div>
              )}
            </div>

            <button
              onClick={() => setShowConfigureMenu(false)}
              className="mt-6 w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Log Menu Modal */}
      {showLogMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Session Notes</h2>
              <button
                onClick={() => setShowLogMenu(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add notes for this session
                </label>
                <textarea
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  placeholder="What did you accomplish? Any thoughts or reflections?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  rows={5}
                />
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between mb-2">
                    <span>Current Session:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedTodo ? todos.find(t => t.id === selectedTodoId)?.text : 'Unallocated'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Time Elapsed:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatTime(sessionTimeElapsed.current)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  // Save note logic would go here
                  setShowLogMenu(false);
                }}
                className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
              >
                Save Note
              </button>
              <button
                onClick={() => setShowLogMenu(false)}
                className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sound Menu Modal */}
      {showSoundMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ambient Sounds</h2>
              <button onClick={() => setShowSoundMenu(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {focusSounds.map(sound => {
                const Icon = sound.icon;
                return (
                  <button
                    key={sound.id}
                    onClick={() => setCurrentSound(sound.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentSound === sound.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{sound.name}</p>
                  </button>
                );
              })}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Volume</label>
                <div className="flex items-center space-x-3 mt-2">
                  <VolumeX className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <button
                onClick={() => setIsSoundMuted(!isSoundMuted)}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  isSoundMuted
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isSoundMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Breathing Guide Modal */}
      {showBreathingGuide && isBreakTime && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="text-center">
            <button
              onClick={() => setShowBreathingGuide(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-20" />
              <div className="absolute inset-4 bg-blue-400 rounded-full animate-pulse animation-delay-200 opacity-30" />
              <div className="absolute inset-8 bg-blue-300 rounded-full animate-pulse animation-delay-400 opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wind className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-light text-white mb-2">Take a Deep Breath</h3>
            <p className="text-white/80">Inhale... Hold... Exhale...</p>
            <p className="text-sm text-white/60 mt-4">Relaxation helps maintain focus</p>
          </div>
        </div>
      )}
      
      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h2>
              <button onClick={() => setShowKeyboardShortcuts(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Start/Pause Timer</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">Space</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Reset Timer</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">Ctrl+R</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Toggle Stats</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">Ctrl+S</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Selector */}
      <div className="w-full max-w-xs mb-6 sm:mb-8">
        <select 
          value={selectedTodoId}
          onChange={(e) => setSelectedTodoId(e.target.value)}
          disabled={isRunning}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none text-gray-700 dark:text-gray-300 text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          <option value="">Unallocated (No specific task)</option>
          {activeTodos.map(todo => (
            <option key={todo.id} value={todo.id}>
              {todo.text}
            </option>
          ))}
        </select>
        {selectedTodo && (
          <div className="mt-2 text-sm text-gray-600">
            Total time: {formatTime(selectedTodo.totalTime)}
          </div>
        )}
      </div>

      {/* Timer Circle */}
      <div className="relative mb-8 sm:mb-12 lg:mb-16">
        <div className="w-60 h-60 sm:w-72 sm:h-72">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke="#22c55e"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 85}
              strokeDashoffset={2 * Math.PI * 85 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-1 sm:mb-2 font-medium">
              {isBreakTime ? 'Break Time' : (selectedTodo ? 'Focusing on' : 'Focus')}
            </p>
            {selectedTodo && !isBreakTime && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2 max-w-[150px] sm:max-w-[200px] text-center truncate">
                {selectedTodo.text}
              </p>
            )}
            <p className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-gray-100">
              {getDisplayTime()}
            </p>
            {(timerMode === 'flowtime' || timerMode === 'stopwatch') && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                {timerMode === 'flowtime' ? 'Track your flow' : 'Elapsed time'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Start Focus Session Button */}
      {!isRunning && !isBreakTime && (
        timerMode === 'stopwatch' || timerMode === 'flowtime' ? elapsedTime === 0 : timeLeft === getCurrentConfig().workTime
      ) && (
        <button
          onClick={startTimer}
          className="mb-8 sm:mb-12 px-6 sm:px-8 py-2.5 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium flex items-center space-x-2 text-sm sm:text-base"
        >
          <Play className="w-4 h-4" />
          <span>
            {timerMode === 'stopwatch' ? 'Start Stopwatch' : 
             timerMode === 'flowtime' ? 'Start Flow Session' :
             startWithBreak ? 'Start with Break' : 'Start Focus Session'}
          </span>
        </button>
      )}

      {/* Control Buttons for when timer is running or paused */}
      {(isRunning || (!isRunning && (
        (timerMode === 'stopwatch' || timerMode === 'flowtime' ? elapsedTime > 0 : timeLeft !== getCurrentConfig().workTime) || isBreakTime
      ))) && (
        <div className="flex items-center space-x-3 sm:space-x-4 mb-8 sm:mb-12">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 text-white rounded-full"
          >
            {isRunning ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            )}
          </button>
          
          <button 
            onClick={() => setShowSoundMenu(true)}
            className="p-2 sm:p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {currentSound !== 'none' ? (
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {!isRunning && (
            <button
              onClick={resetTimer}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs sm:text-sm"
            >
              Reset
            </button>
          )}

          {/* End Flow Session button for Flowtime mode */}
          {timerMode === 'flowtime' && isRunning && !isBreakTime && (
            <button
              onClick={() => {
                setIsRunning(false);
                saveSession();
                // Optionally start break
                if (getCurrentConfig().breakTime > 0) {
                  setIsBreakTime(true);
                  setTimeLeft(getCurrentConfig().breakTime);
                  setIsRunning(true);
                }
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm"
            >
              End Flow
            </button>
          )}
        </div>
      )}

      {/* Action Buttons and Timer Mode Selector */}
      <div className="flex flex-col items-center space-y-3 sm:space-y-4">
        {/* Timer Mode Selector Dropdown */}
        <div className="relative">
          <select
            value={timerMode}
            onChange={(e) => handleModeChange(e.target.value as TimerMode)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg appearance-none pr-8 sm:pr-10 text-xs sm:text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="pomodoro">Pomodoro</option>
            <option value="52-17">52/17</option>
            <option value="flowtime">Flowtime</option>
            <option value="90-20">90/20</option>
            <option value="2-minute">2-Minute</option>
            <option value="reverse-pomodoro">Reverse</option>
            <option value="stopwatch">Stopwatch</option>
          </select>
          <Timer className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500 pointer-events-none" />
        </div>
        
        {/* Configure and Log Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button 
            onClick={() => setShowConfigureMenu(true)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center space-x-1.5 sm:space-x-2"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Configure</span>
          </button>
          <button 
            onClick={() => setShowLogMenu(true)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center space-x-1.5 sm:space-x-2"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Log</span>
          </button>
        </div>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => setShowSoundMenu(true)}
          className={`p-3 rounded-full shadow-lg transition-all ${
            currentSound !== 'none' 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
          title="Ambient Sounds"
        >
          <Headphones className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setShowStatsPanel(!showStatsPanel)}
          className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full shadow-lg text-gray-600 dark:text-gray-400"
          title="Focus Stats"
        >
          <TrendingUp className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => {
            const newGoal = prompt('Set daily goal (minutes):', dailyGoal.toString());
            if (newGoal && !isNaN(parseInt(newGoal))) {
              setDailyGoal(parseInt(newGoal));
            }
          }}
          className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full shadow-lg text-gray-600 dark:text-gray-400"
          title="Daily Goal"
        >
          <Target className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={`p-3 rounded-full shadow-lg transition-all ${
            notificationsEnabled 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
          title="Notifications"
        >
          {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </button>
        
        <button
          onClick={() => setShowKeyboardShortcuts(true)}
          className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full shadow-lg text-gray-600 dark:text-gray-400"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Trigger Vercel rebuild
export default FocusPage;