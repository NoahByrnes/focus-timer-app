import { useState } from 'react';
import { Plus, Check, Trash2, Clock, Target, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useTodos } from './context/TodoContext';
import { TagSelector } from './components/TagSelector';

const TasksPage = () => {
  const { todos, tags, loading, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [newTodo, setNewTodo] = useState('');
  const [newTodoTagId, setNewTodoTagId] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState(false);

  const handleAddTodo = async () => {
    if (newTodo.trim()) {
      try {
        await addTodo(newTodo, newTodoTagId || undefined);
        setNewTodo('');
        setNewTodoTagId('');
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else if (mins > 0) {
      return `${mins}m`;
    } else {
      return 'No time tracked';
    }
  };

  // Get today's todos
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activeTodos = todos.filter(todo => !todo.completed);
  const todaysCompletedTodos = todos.filter(todo => {
    if (!todo.completed) return false;
    // Check if any session was today
    const hasSessionToday = todo.sessions?.some(session => {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });
    return hasSessionToday;
  });

  // Calculate today's stats
  const todaysFocusTime = todos.reduce((total, todo) => {
    const todaysTime = todo.sessions?.reduce((sum, session) => {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      if (sessionDate.getTime() === today.getTime()) {
        return sum + session.duration;
      }
      return sum;
    }, 0) || 0;
    return total + todaysTime;
  }, 0);

  // Calculate streak (simplified)
  const calculateStreak = () => {
    let streak = 0;
    const checkDate = new Date();
    
    while (streak < 365) {
      checkDate.setHours(0, 0, 0, 0);
      const hasActivity = todos.some(todo => 
        todo.sessions?.some(session => {
          const sessionDate = new Date(session.startTime);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === checkDate.getTime();
        })
      );
      
      if (!hasActivity && streak > 0) break;
      if (hasActivity) streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  if (loading && todos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-ios-gray animate-pulse">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          
          {/* Header with Stats */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Tasks</h1>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-ios-gray dark:text-gray-500">Today</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatTime(todaysFocusTime)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-ios-gray dark:text-gray-500">Completed</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{todaysCompletedTodos.length}</p>
                </div>
              </div>
              
              {currentStreak > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-ios-gray dark:text-gray-500">Streak</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Task Card */}
          <div className="card-hover p-6 mb-8 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="w-32">
                <TagSelector
                  tags={tags}
                  value={newTodoTagId}
                  onChange={setNewTodoTagId}
                  placeholder="No tag"
                />
              </div>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleAddTodo}
                className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Active Tasks */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Active Tasks
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({activeTodos.length})</span>
            </h2>
            
            <div className="space-y-3">
              {activeTodos.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No active tasks</p>
                  <p className="text-sm mt-1">Add a task to get started</p>
                </div>
              ) : (
                activeTodos.map(todo => {
                  const tag = tags.find(t => t.id === todo.tagId);
                  return (
                    <div
                      key={todo.id}
                      className="group flex items-center gap-4 p-4 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/30 rounded-2xl hover:shadow-md transition-all duration-200"
                    >
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 transition-colors duration-200 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{todo.text}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {tag && (
                            <span 
                              className="text-xs px-2 py-1 rounded-full text-white"
                              style={{ backgroundColor: tag.color + '90' }}
                            >
                              {tag.name}
                            </span>
                          )}
                          {todo.totalTime > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(todo.totalTime)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Completed Today (Collapsible) */}
          {todaysCompletedTodos.length > 0 && (
            <div>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <Check className="w-5 h-5 text-green-500" />
                Completed Today
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({todaysCompletedTodos.length})</span>
                {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showCompleted && (
                <div className="space-y-3 animate-slide-down">
                  {todaysCompletedTodos.map(todo => {
                    const tag = tags.find(t => t.id === todo.tagId);
                    return (
                      <div
                        key={todo.id}
                        className="group flex items-center gap-4 p-4 backdrop-blur-xl bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200/30 dark:border-gray-700/20 rounded-2xl"
                      >
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className="w-6 h-6 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center flex-shrink-0"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </button>
                        <div className="flex-1">
                          <p className="text-gray-500 dark:text-gray-400 line-through">{todo.text}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {tag && (
                              <span 
                                className="text-xs px-2 py-1 rounded-full text-white opacity-60"
                                style={{ backgroundColor: tag.color }}
                              >
                                {tag.name}
                              </span>
                            )}
                            {todo.totalTime > 0 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(todo.totalTime)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;