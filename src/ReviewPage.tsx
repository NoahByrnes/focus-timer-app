import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Filter, TrendingUp, Target, Tag } from 'lucide-react';
import { useTodos } from './context/TodoContext';

interface DayStats {
  date: Date;
  totalTime: number;
  completedTodos: number;
  totalTodos: number;
  sessions: number;
}

const ReviewPage = () => {
  const { todos, tags } = useTodos();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [selectedTagId, setSelectedTagId] = useState<string>('all');
  const [stats, setStats] = useState<DayStats[]>([]);

  useEffect(() => {
    calculateStats();
  }, [todos, timeRange, selectedTagId]);

  const calculateStats = () => {
    const now = new Date();
    const startDate = new Date();
    
    if (timeRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    const dayStats: Map<string, DayStats> = new Map();
    
    // Initialize days
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dayStats.set(dateKey, {
        date: new Date(currentDate),
        totalTime: 0,
        completedTodos: 0,
        totalTodos: 0,
        sessions: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process todos
    const filteredTodos = selectedTagId === 'all' 
      ? todos 
      : todos.filter(todo => todo.tagId === selectedTagId);

    filteredTodos.forEach(todo => {
      todo.sessions?.forEach(session => {
        const sessionDate = new Date(session.startTime);
        if (sessionDate >= startDate && sessionDate <= now) {
          const dateKey = sessionDate.toISOString().split('T')[0];
          const stat = dayStats.get(dateKey);
          if (stat) {
            stat.totalTime += session.duration;
            stat.sessions += 1;
          }
        }
      });
    });

    // Count completed todos
    filteredTodos.forEach(todo => {
      const dateKey = new Date().toISOString().split('T')[0];
      const stat = dayStats.get(dateKey);
      if (stat) {
        stat.totalTodos += 1;
        if (todo.completed) {
          stat.completedTodos += 1;
        }
      }
    });

    setStats(Array.from(dayStats.values()).reverse());
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const totalTimeInRange = stats.reduce((acc, stat) => acc + stat.totalTime, 0);
  const totalSessionsInRange = stats.reduce((acc, stat) => acc + stat.sessions, 0);
  const totalCompletedInRange = stats.reduce((acc, stat) => acc + stat.completedTodos, 0);
  const averageTimePerDay = stats.length > 0 ? totalTimeInRange / stats.length : 0;

  const maxTime = Math.max(...stats.map(s => s.totalTime), 1);

  return (
    <div className="flex-1 flex flex-col p-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Review</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your progress and productivity</p>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === 'today'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === 'week'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Month
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All tags</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTime(totalTimeInRange)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Focus time</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Sessions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalSessionsInRange}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Focus sessions</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCompletedInRange}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tasks done</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Average</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTime(averageTimePerDay)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per day</p>
          </div>
        </div>

        {/* Daily Activity Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Daily Activity</h2>
          
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(stat.date)}
                </div>
                
                <div className="flex-1">
                  <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 rounded"
                      style={{ width: `${(stat.totalTime / maxTime) * 100}%` }}
                    />
                    {stat.totalTime > 0 && (
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          {formatTime(stat.totalTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{stat.sessions}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {stat.completedTodos}/{stat.totalTodos}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {stats.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No activity data for the selected period
              </div>
            )}
          </div>
        </div>

        {/* Recent Completed Tasks */}
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Completed Tasks</h2>
          
          <div className="space-y-3">
            {todos
              .filter(todo => todo.completed && (selectedTagId === 'all' || todo.tagId === selectedTagId))
              .slice(0, 5)
              .map(todo => {
                const tag = tags.find(t => t.id === todo.tagId);
                return (
                  <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-900 dark:text-gray-100">{todo.text}</span>
                      {tag && (
                        <div 
                          className="px-2 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1"
                          style={{ backgroundColor: tag.color }}
                        >
                          <Tag className="w-3 h-3" />
                          <span>{tag.name}</span>
                        </div>
                      )}
                    </div>
                    {todo.totalTime > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(todo.totalTime)}</span>
                      </div>
                    )}
                  </div>
                );
              })}

            {todos.filter(todo => todo.completed).length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No completed tasks yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;