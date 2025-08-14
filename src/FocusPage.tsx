import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Settings, FileText, Timer, X, Plus, Minus, Zap, Target, TrendingUp, Bell, BellOff, Keyboard, Flame, ChevronDown, Check } from 'lucide-react';
import { useTodos } from './context/TodoContext';
import BackgroundGradient from './components/BackgroundGradient';

type TimerMode = 'pomodoro' | 'flowtime' | 'custom';

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
  'flowtime': {
    name: 'Flowtime',
    description: 'Work until you find your natural break',
    workTime: 0, // No preset time
    breakTime: 5 * 60,
  },
  'custom': {
    name: 'Custom',
    description: 'Set your own work/break times',
    workTime: 25 * 60,
    breakTime: 5 * 60,
  },
};

const FocusPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerConfigs['pomodoro'].workTime);
  const [elapsedTime, setElapsedTime] = useState(0); // For stopwatch and flowtime
  const [selectedTodoId, setSelectedTodoId] = useState('');
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false);
  const taskSelectorRef = useRef<HTMLDivElement>(null);
  const [showConfigureMenu, setShowConfigureMenu] = useState(false);
  const [showLogMenu, setShowLogMenu] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  const [iterations, setIterations] = useState(1);
  const [currentIteration, setCurrentIteration] = useState(1);
  
  // Core feature states
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(120); // minutes
  const [dailyProgress, setDailyProgress] = useState(0); // minutes
  const [currentStreak, setCurrentStreak] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  // const [isAmbientMode, setIsAmbientMode] = useState(false);
  // const [showPopOutOption, setShowPopOutOption] = useState(false);
  
  // Configurable durations for each mode (in minutes)
  const [modeDurations, setModeDurations] = useState<Record<TimerMode, { work: number; break: number }>>({
    'pomodoro': { work: 25, break: 5 },
    'flowtime': { work: 0, break: 5 },
    'custom': { work: 25, break: 5 },
  });
  
  const sessionStartTime = useRef<Date | null>(null);
  const sessionTimeElapsed = useRef(0);
  
  const { todos, addSessionToTodo } = useTodos();
  const activeTodos = todos.filter(todo => !todo.completed);
  
  // Close task selector dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (taskSelectorRef.current && !taskSelectorRef.current.contains(event.target as Node)) {
        setIsTaskSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  


  // Timer logic
  useEffect(() => {
    let interval: number | null = null;
    
    if (isRunning) {
      if (timerMode === 'flowtime') {
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
  

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveSession = useCallback(async () => {
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
  }, [selectedTodoId, addSessionToTodo]);

  const startTimer = useCallback(() => {
    sessionStartTime.current = new Date();
    sessionTimeElapsed.current = 0;
    
    setIsRunning(true);
  }, [timerMode, isBreakTime, timeLeft, modeDurations]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (timerMode !== 'flowtime' && true) {
      saveSession();
    }
  }, [timerMode, saveSession]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Trigger notification with appropriate message
    if (!isBreakTime) {
      setCurrentStreak(prev => prev + 1);
      triggerNotification(`Great work! You completed a ${timerMode} session. Time for a break! 🎉`);
    } else {
      triggerNotification('Break time is over. Ready to focus again? 💪');
    }
    
    const workTime = modeDurations[timerMode].work * 60;
    const breakTime = modeDurations[timerMode].break * 60;
    
    // Toggle between work and break
    if (isBreakTime) {
      // Break is over, check if we need another iteration
      if (currentIteration < iterations) {
        setCurrentIteration(prev => prev + 1);
        setIsBreakTime(false);
        setTimeLeft(workTime);
        // Auto-start next work session
        setIsRunning(true);
      } else {
        // All iterations complete
        setIsBreakTime(false);
        setTimeLeft(workTime);
        setCurrentIteration(1);
      }
    } else {
      // Work is over, start break (if applicable)
      saveSession();
      if (breakTime > 0) {
        setIsBreakTime(true);
        setTimeLeft(breakTime);
        // Auto-start break
        setIsRunning(true);
      } else if (currentIteration < iterations) {
        // No break, but more iterations to go
        setCurrentIteration(prev => prev + 1);
        setTimeLeft(workTime);
        setIsRunning(true);
      } else {
        // All iterations complete
        setTimeLeft(workTime);
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

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsBreakTime(false);
    setElapsedTime(0);
    sessionTimeElapsed.current = 0;
    sessionStartTime.current = null;
    setCurrentIteration(1);
    
    const workTime = modeDurations[timerMode].work * 60;
    if (timerMode === 'flowtime') {
      setTimeLeft(0);
    } else {
      setTimeLeft(workTime);
    }
  }, [timerMode, modeDurations]);

  const handleModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
    setIsRunning(false);
    setIsBreakTime(false);
    setElapsedTime(0);
    sessionTimeElapsed.current = 0;
    setCurrentIteration(1);
    
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
            setShowStatsPanel(prev => !prev);
          }
          break;
        case '?':
          setShowKeyboardShortcuts(prev => !prev);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, pauseTimer, startTimer, resetTimer]);

  // Calculate progress based on mode
  const getProgress = () => {
    if (timerMode === 'flowtime') {
      return 0; // No progress bar for count-up modes
    }
    const workTime = modeDurations[timerMode].work * 60;
    const breakTime = modeDurations[timerMode].break * 60;
    const totalTime = isBreakTime ? breakTime : workTime;
    if (totalTime === 0) return 0;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const progress = getProgress();
  const selectedTodo = todos.find(t => t.id === selectedTodoId);
  
  // Get display time based on mode
  const getDisplayTime = () => {
    if (timerMode === 'flowtime') {
      return formatTime(elapsedTime);
    }
    return formatTime(timeLeft);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 sm:p-8 lg:p-12 relative overflow-auto">
      {/* Unified background gradient */}
      <BackgroundGradient />
      
      {/* Apple-style notification */}
      {showNotification && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-gray-100 pl-6 pr-4 py-4 rounded-2xl shadow-xl flex items-center space-x-4 max-w-sm">
            <div className="p-2 bg-ios-blue/10 dark:bg-ios-blue/20 rounded-xl">
              <Bell className="w-5 h-5 text-ios-blue" />
            </div>
            <p className="text-callout font-medium flex-1">{notificationMessage}</p>
            <button 
              onClick={() => setShowNotification(false)}
              className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl "
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Apple-style Stats Panel */}
      {showStatsPanel && (
        <div className="absolute top-24 right-6 backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl p-6 w-80 z-10 animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-title-3 font-bold text-gray-900 dark:text-gray-100">Today's Stats</h3>
            <button 
              onClick={() => setShowStatsPanel(false)}
              className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl "
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-5">
            <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 rounded-2xl p-4 border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-subhead font-medium text-gray-700 dark:text-gray-300">Daily Progress</span>
                <span className="text-subhead font-bold text-gray-900 dark:text-gray-100">
                  {dailyProgress}/{dailyGoal} min
                </span>
              </div>
              <div className="h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-ios-green to-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${Math.min((dailyProgress / dailyGoal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-caption text-gray-500 dark:text-gray-400 mt-2">
                {Math.max(0, dailyGoal - dailyProgress)} minutes remaining
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="backdrop-blur-sm bg-orange-50/60 dark:bg-orange-900/20 rounded-2xl p-4 border border-orange-200/30 dark:border-orange-700/20">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-ios-orange/10 dark:bg-ios-orange/20 rounded-xl">
                    <Flame className="w-5 h-5 text-ios-orange" />
                  </div>
                  <span className="text-title-2 font-bold text-ios-orange">
                    {currentStreak}
                  </span>
                </div>
                <p className="text-caption text-gray-600 dark:text-gray-400 mt-2">Session Streak</p>
              </div>
              
              <div className="backdrop-blur-sm bg-blue-50/60 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-700/20">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-ios-blue/10 dark:bg-ios-blue/20 rounded-xl">
                    <Zap className="w-5 h-5 text-ios-blue" />
                  </div>
                  <span className="text-title-2 font-bold text-ios-blue">
                    {Math.round((dailyProgress / dailyGoal) * 100)}%
                  </span>
                </div>
                <p className="text-caption text-gray-600 dark:text-gray-400 mt-2">Focus Score</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200/30 dark:border-gray-700/30 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-subhead text-gray-600 dark:text-gray-400">Sessions Today</span>
                <span className="text-subhead font-semibold text-gray-900 dark:text-gray-100">
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
                {timerMode === 'flowtime' && 'Work until you naturally lose focus, then take a break. Perfect for finding your rhythm.'}
                {timerMode === 'custom' && 'Set your own work and break durations to match your personal productivity rhythm.'}
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Focus Duration - Hide for stopwatch and flowtime */}
              {timerMode !== 'flowtime' && (
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
              {true && (
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
              {timerMode !== 'flowtime' && (
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


              {/* Session Summary */}
              {true && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {timerMode === 'flowtime' 
                        ? 'Flexible Duration'
                        : `${modeDurations[timerMode].work * iterations + modeDurations[timerMode].break * (iterations - 1)} minutes`}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {timerMode === 'flowtime' 
                        ? 'Flow until you naturally lose focus'
                        : `${iterations} ${iterations === 1 ? 'session' : 'sessions'} • ${modeDurations[timerMode].work}m work${modeDurations[timerMode].break > 0 ? ` / ${modeDurations[timerMode].break}m break` : ''}`}
                    </div>
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

      {/* Main Content Container */}
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center py-8 relative z-10">
        
        {/* Task Selector */}
        <div className="w-full max-w-xs mb-6 sm:mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Task
          </label>
          
          {/* Custom Dropdown */}
          <div className="relative" ref={taskSelectorRef}>
            <button
              type="button"
              onClick={() => !isRunning && setIsTaskSelectorOpen(!isTaskSelectorOpen)}
              disabled={isRunning}
              className={`
                w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:outline-none focus:ring-2 ring-accent focus:border-accent 
                text-sm flex items-center justify-between
                ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'}
              `}
            >
              <div className="flex items-center space-x-2">
                {selectedTodo ? (
                  <span className="text-gray-900 dark:text-gray-100 truncate">{selectedTodo.text}</span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">Unallocated (No specific task)</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ${isTaskSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isTaskSelectorOpen && !isRunning && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                {/* Unallocated option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTodoId('');
                    setIsTaskSelectorOpen(false);
                  }}
                  className={`
                    w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 text-left
                    ${selectedTodoId === '' ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  `}
                >
                  <span className="text-gray-500 dark:text-gray-400">Unallocated (No specific task)</span>
                  {selectedTodoId === '' && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </button>

                {/* Todo options */}
                {activeTodos.map(todo => (
                  <button
                    key={todo.id}
                    type="button"
                    onClick={() => {
                      setSelectedTodoId(todo.id);
                      setIsTaskSelectorOpen(false);
                    }}
                    className={`
                      w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 text-left
                      ${selectedTodoId === todo.id ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    `}
                  >
                    <span className="text-gray-900 dark:text-gray-100 truncate pr-2">{todo.text}</span>
                    {selectedTodoId === todo.id && (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {selectedTodo && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Total time: {formatTime(selectedTodo.totalTime)}
            </div>
          )}
        </div>

        {/* Apple-style Timer Display */}
        <div className="relative mb-12 sm:mb-16 lg:mb-20">
        <div className="relative">
          {/* Glass morphism background */}
          <div className="absolute inset-0 backdrop-blur-3xl bg-white/20 dark:bg-gray-900/20 rounded-full border border-white/30 dark:border-gray-700/30 shadow-2xl"></div>
          
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] p-8">
            <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="85"
                stroke="rgba(156, 163, 175, 0.2)"
                strokeWidth="3"
                fill="transparent"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                stroke="url(#timerGradient)"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 85}
                strokeDashoffset={2 * Math.PI * 85 * (1 - progress / 100)}
                strokeLinecap="round"
                className=" drop-shadow-lg"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: isBreakTime ? '#FF9500' : '#007AFF', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: isBreakTime ? '#FF3B30' : '#5AC8FA', stopOpacity: 1}} />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="text-center space-y-2">
                <p className="text-subhead font-semibold text-gray-700 dark:text-gray-300">
                  {isBreakTime ? 'Break Time' : (selectedTodo ? 'Focusing on' : 'Focus Session')}
                </p>
                {selectedTodo && !isBreakTime && (
                  <p className="text-footnote text-ios-gray dark:text-gray-400 max-w-60 text-center line-clamp-2 leading-relaxed">
                    {selectedTodo.text}
                  </p>
                )}
                <div className="py-4">
                  <p className="text-6xl sm:text-7xl lg:text-8xl font-thin text-gray-900 dark:text-gray-100 tracking-tight">
                    {getDisplayTime()}
                  </p>
                </div>
                {(timerMode === 'flowtime') && (
                  <p className="text-caption text-ios-gray dark:text-gray-400 font-medium">
                    {timerMode === 'flowtime' ? 'Track your natural flow' : 'Counting up'}
                  </p>
                )}
                {timerMode !== 'flowtime' && (
                  <div className="flex items-center justify-center space-x-2 pt-2">
                    <div className={`w-2 h-2 rounded-full  ${
                      currentIteration === 1 ? 'bg-ios-blue' : 'bg-gray-300 dark:bg-gray-600'
                    }`}></div>
                    {iterations > 1 && (
                      <>
                        {Array.from({ length: iterations - 1 }, (_, i) => (
                          <div key={i + 2} className={`w-2 h-2 rounded-full  ${
                            currentIteration >= i + 2 ? 'bg-ios-blue' : 'bg-gray-300 dark:bg-gray-600'
                          }`}></div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apple-style Start Button */}
      {!isRunning && !isBreakTime && (
        timerMode === 'flowtime' ? elapsedTime === 0 : timeLeft === modeDurations[timerMode].work * 60
      ) && (
        <button
          onClick={startTimer}
          className="mb-12 sm:mb-16 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-ios-blue to-ios-blue-light hover:from-ios-blue/90 hover:to-ios-blue-light/90 active:scale-95 text-white rounded-3xl font-semibold flex items-center space-x-3 text-body shadow-xl border border-white/20 backdrop-blur-sm  hover:shadow-glow"
        >
          <div className="p-1 bg-white/20 rounded-xl">
            <Play className="w-5 h-5" />
          </div>
          <span>
            {timerMode === 'flowtime' ? 'Start Flow Session' : 'Start Focus Session'}
          </span>
        </button>
      )}

      {/* Apple-style Control Buttons */}
      {(isRunning || (!isRunning && (
        (timerMode === 'flowtime' ? elapsedTime > 0 : timeLeft !== modeDurations[timerMode].work * 60) || isBreakTime
      ))) && (
        <div className="flex items-center justify-center space-x-6 sm:space-x-8 mb-12 sm:mb-16">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-ios-green to-emerald-500 hover:from-ios-green/90 hover:to-emerald-500/90 active:scale-90 text-white rounded-full shadow-2xl border border-white/20 backdrop-blur-sm  hover:shadow-glow"
          >
            {isRunning ? (
              <Pause className="w-6 h-6 sm:w-8 sm:h-8" />
            ) : (
              <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-0.5" />
            )}
          </button>

          {!isRunning && (
            <button
              onClick={resetTimer}
              className="px-6 py-3 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-white/30 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 rounded-2xl shadow-lg text-callout font-medium  active:scale-95"
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
                const breakTime = modeDurations[timerMode].break * 60;
                if (breakTime > 0) {
                  setIsBreakTime(true);
                  setTimeLeft(breakTime);
                  setIsRunning(true);
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-ios-red to-red-500 hover:from-ios-red/90 hover:to-red-500/90 text-white rounded-2xl shadow-lg text-callout font-medium  active:scale-95 border border-white/20"
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
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg appearance-none pr-8 sm:pr-10 text-xs sm:text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 ring-accent"
            >
              <option value="pomodoro">Pomodoro</option>
              <option value="flowtime">Flowtime</option>
              <option value="custom">Custom</option>
            </select>
            <Timer className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500 pointer-events-none" />
          </div>
          
          {/* Configure and Log Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button 
              onClick={() => setShowConfigureMenu(true)}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center space-x-1.5 sm:space-x-2  hover:scale-105 active:scale-95"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Configure</span>
            </button>
            <button 
              onClick={() => setShowLogMenu(true)}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center space-x-1.5 sm:space-x-2  hover:scale-105 active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Log</span>
            </button>
          </div>
        </div>
        
      </div> {/* End of Main Content Container */}
      
      {/* Quick Action Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
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
              ? 'bg-accent hover:opacity-90 text-white' 
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