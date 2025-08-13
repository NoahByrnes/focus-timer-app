import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Settings, FileText, CheckSquare, Timer, X, Plus, Minus } from 'lucide-react';
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
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showConfigureMenu, setShowConfigureMenu] = useState(false);
  const [showLogMenu, setShowLogMenu] = useState(false);
  const [showTodoMenu, setShowTodoMenu] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  const [iterations, setIterations] = useState(1);
  const [currentIteration, setCurrentIteration] = useState(1);
  
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
        }, 1000) as unknown as number;
      } else if (timeLeft > 0) {
        // Count down for other modes
        interval = setInterval(() => {
          setTimeLeft(timeLeft => timeLeft - 1);
          sessionTimeElapsed.current += 1;
        }, 1000) as unknown as number;
      } else if (timeLeft === 0) {
        // Timer completed
        handleTimerComplete();
      }
    }
    
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isRunning, timeLeft, timerMode]);

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
    
    // Handle reverse pomodoro - start with break
    if (timerMode === 'reverse-pomodoro' && !isBreakTime && timeLeft === getCurrentConfig().workTime) {
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

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreakTime(false);
    setElapsedTime(0);
    sessionTimeElapsed.current = 0;
    sessionStartTime.current = null;
    
    const config = getCurrentConfig();
    if (timerMode === 'reverse-pomodoro') {
      setTimeLeft(config.workTime);
    } else if (timerMode === 'stopwatch' || timerMode === 'flowtime') {
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
    
    const durations = modeDurations[mode];
    setTimeLeft(durations.work * 60);
    
    setShowModeSelector(false);
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 relative">
      {/* Mode Selector Button */}
      <div className="absolute top-8 right-8">
        <button
          onClick={() => setShowModeSelector(!showModeSelector)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center space-x-2"
        >
          <Timer className="w-4 h-4" />
          <span className="text-sm font-medium">{getCurrentConfig().name}</span>
        </button>
      </div>

      {/* Mode Selector Modal */}
      {showModeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Choose Timer Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(timerConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleModeChange(key as TimerMode)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    timerMode === key
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{config.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{config.description}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModeSelector(false)}
              className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Configure Menu Modal */}
      {showConfigureMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Configure Timer</h2>
              <button
                onClick={() => setShowConfigureMenu(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Focus Duration */}
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

              {/* Break Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Break Duration
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

              {/* Iterations */}
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

              {/* Session Preview */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Preview</div>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: iterations }).map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className="bg-green-500 h-2 rounded" style={{ width: `${modeDurations[timerMode].work * 2}px` }} />
                      {modeDurations[timerMode].break > 0 && i < iterations - 1 && (
                        <div className="bg-blue-500 h-2 rounded ml-1" style={{ width: `${modeDurations[timerMode].break * 2}px` }} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Total: {modeDurations[timerMode].work * iterations + modeDurations[timerMode].break * (iterations - 1)} minutes
                </div>
              </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
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

      {/* Todo Menu Modal */}
      {showTodoMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Active Tasks</h2>
              <button
                onClick={() => setShowTodoMenu(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {activeTodos.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No active tasks</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add tasks from the Plan page</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTodos.map(todo => (
                    <button
                      key={todo.id}
                      onClick={() => {
                        setSelectedTodoId(todo.id);
                        setShowTodoMenu(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedTodoId === todo.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 dark:text-gray-100">{todo.text}</span>
                        {todo.totalTime > 0 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTime(todo.totalTime)}
                          </span>
                        )}
                      </div>
                      {todo.tagId && (() => {
                        const tag = todos.find(t => t.id === todo.tagId);
                        return tag ? (
                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            {tag.text}
                          </div>
                        ) : null;
                      })()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowTodoMenu(false)}
              className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Task Selector */}
      <div className="w-full max-w-xs mb-8">
        <select 
          value={selectedTodoId}
          onChange={(e) => setSelectedTodoId(e.target.value)}
          disabled={isRunning}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none text-gray-700 dark:text-gray-300 text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
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
      <div className="relative mb-16">
        <div className="w-72 h-72">
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
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2 font-medium">
              {isBreakTime ? 'Break Time' : (selectedTodo ? 'Focusing on' : 'Focus')}
            </p>
            {selectedTodo && !isBreakTime && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 max-w-[200px] text-center truncate">
                {selectedTodo.text}
              </p>
            )}
            <p className="text-5xl font-light text-gray-900 dark:text-gray-100">
              {getDisplayTime()}
            </p>
            {(timerMode === 'flowtime' || timerMode === 'stopwatch') && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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
          className="mb-12 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>
            {timerMode === 'stopwatch' ? 'Start Stopwatch' : 
             timerMode === 'flowtime' ? 'Start Flow Session' :
             isBreakTime ? 'Start Break' : 'Start Focus Session'}
          </span>
        </button>
      )}

      {/* Control Buttons for when timer is running or paused */}
      {(isRunning || (!isRunning && (
        (timerMode === 'stopwatch' || timerMode === 'flowtime' ? elapsedTime > 0 : timeLeft !== getCurrentConfig().workTime) || isBreakTime
      ))) && (
        <div className="flex items-center space-x-4 mb-12">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full"
          >
            {isRunning ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          
          <button className="p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <Volume2 className="w-5 h-5" />
          </button>

          {!isRunning && (
            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
            >
              Reset
            </button>
          )}

          {/* End Flow Session button for Flowtime mode */}
          {timerMode === 'flowtime' && isRunning && (
            <button
              onClick={() => {
                setIsRunning(false);
                saveSession();
                // Optionally start break
                if (getCurrentConfig().breakTime > 0) {
                  setIsBreakTime(true);
                  setTimeLeft(getCurrentConfig().breakTime);
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
            >
              End Flow
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setShowConfigureMenu(true)}
          className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Configure</span>
        </button>
        <button 
          onClick={() => setShowLogMenu(true)}
          className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Log</span>
        </button>
        <button 
          onClick={() => setShowTodoMenu(true)}
          className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center space-x-2"
        >
          <CheckSquare className="w-4 h-4" />
          <span className="text-sm font-medium">Todo</span>
        </button>
      </div>
    </div>
  );
};

export default FocusPage;