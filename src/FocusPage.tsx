import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Settings, FileText, CheckSquare } from 'lucide-react';
import { useTodos } from './context/TodoContext';

const FocusPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [selectedTodoId, setSelectedTodoId] = useState('');
  const sessionStartTime = useRef<Date | null>(null);
  const sessionTimeElapsed = useRef(0);
  
  const { todos, addSessionToTodo } = useTodos();
  const activeTodos = todos.filter(todo => !todo.completed);

  // Timer logic
  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
        sessionTimeElapsed.current += 1;
      }, 1000) as unknown as number;
    } else if (timeLeft === 0) {
      // Timer completed
      handleTimerComplete();
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
  };

  const startTimer = () => {
    sessionStartTime.current = new Date();
    sessionTimeElapsed.current = 0;
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    saveSession();
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    saveSession();
    setTimeLeft(5 * 60); // Reset timer
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

  const progress = ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  const selectedTodo = todos.find(t => t.id === selectedTodoId);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
      {/* Task Selector */}
      <div className="w-full max-w-xs mb-16">
        <select 
          value={selectedTodoId}
          onChange={(e) => setSelectedTodoId(e.target.value)}
          disabled={isRunning}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none text-gray-700 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <p className="text-gray-600 text-lg mb-2 font-medium">
              {selectedTodo ? 'Focusing on' : 'Focus'}
            </p>
            {selectedTodo && (
              <p className="text-sm text-gray-500 mb-2 max-w-[200px] text-center truncate">
                {selectedTodo.text}
              </p>
            )}
            <p className="text-5xl font-light text-gray-900">
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
      </div>

      {/* Start Focus Session Button */}
      {!isRunning && timeLeft === 5 * 60 && (
        <button
          onClick={startTimer}
          className="mb-12 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Start Focus Session</span>
        </button>
      )}

      {/* Control Buttons for when timer is running */}
      {(isRunning || timeLeft !== 5 * 60) && (
        <div className="flex items-center space-x-4 mb-12">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200"
          >
            {isRunning ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          
          <button className="p-3 text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <Volume2 className="w-5 h-5" />
          </button>

          {!isRunning && timeLeft !== 5 * 60 && (
            <button
              onClick={() => {
                setTimeLeft(5 * 60);
                sessionTimeElapsed.current = 0;
                sessionStartTime.current = null;
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Configure</span>
        </button>
        <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Log</span>
        </button>
        <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2">
          <CheckSquare className="w-4 h-4" />
          <span className="text-sm font-medium">Todo</span>
        </button>
      </div>
    </div>
  );
};

export default FocusPage;