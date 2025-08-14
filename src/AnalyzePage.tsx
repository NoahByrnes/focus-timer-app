import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Calendar, Pause, Users, Award } from 'lucide-react';
import { useTodos } from './context/TodoContext';
import BackgroundGradient from './components/BackgroundGradient';

interface TagStats {
  tagId: string;
  tagName: string;
  tagColor: string;
  totalTime: number;
  totalTasks: number;
  completedTasks: number;
  sessions: number;
}

interface TimeDistribution {
  hour: number;
  time: number;
}

interface SessionData {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  taskName: string;
  tagName: string;
  tagColor: string;
}

interface DailyData {
  date: string;
  totalTime: number;
  sessions: number;
  tasks: number;
  completedTasks: number;
}

interface WeeklyData {
  weekStart: string;
  totalTime: number;
  sessions: number;
  tasks: number;
  completedTasks: number;
}

interface MonthlyData {
  month: string;
  totalTime: number;
  sessions: number;
  tasks: number;
  completedTasks: number;
}

interface AnalyzePageProps {
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

const AnalyzePage = ({ timeRange = 'week' }: AnalyzePageProps) => {
  const { todos, tags } = useTodos();
  const [tagStats, setTagStats] = useState<TagStats[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [dailyData, setDailyData] = useState<Map<string, number>>(new Map());
  const [hoveredDay, setHoveredDay] = useState<{date: Date, studyTime: number, x: number, y: number} | null>(null);
  const [sessionsData, setSessionsData] = useState<SessionData[]>([]);
  const [dailyDataArray, setDailyDataArray] = useState<DailyData[]>([]);
  const [weeklyDataArray, setWeeklyDataArray] = useState<WeeklyData[]>([]);
  const [monthlyDataArray, setMonthlyDataArray] = useState<MonthlyData[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    calculateAnalytics();
  }, [todos, tags, timeRange]);

  const calculateAnalytics = () => {
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    if (timeRange === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Initialize data structures
    const tagStatsMap: Map<string, TagStats> = new Map();
    const sessionsArray: SessionData[] = [];
    const dailyMap: Map<string, DailyData> = new Map();
    const weeklyMap: Map<string, WeeklyData> = new Map();
    const monthlyMap: Map<string, MonthlyData> = new Map();
    const dailyDataMap: Map<string, number> = new Map();
    const hourDistribution: Map<number, number> = new Map();
    const dayProductivity: Map<string, number> = new Map();
    
    // Initialize tag stats
    tags.forEach(tag => {
      tagStatsMap.set(tag.id, {
        tagId: tag.id,
        tagName: tag.name,
        tagColor: tag.color,
        totalTime: 0,
        totalTasks: 0,
        completedTasks: 0,
        sessions: 0
      });
    });

    tagStatsMap.set('no-tag', {
      tagId: 'no-tag',
      tagName: 'No tag',
      tagColor: '#9CA3AF',
      totalTime: 0,
      totalTasks: 0,
      completedTasks: 0,
      sessions: 0
    });

    // Initialize hour distribution
    for (let i = 0; i < 24; i++) {
      hourDistribution.set(i, 0);
    }

    // Process todos and sessions
    todos.forEach(todo => {
      const tagKey = todo.tagId || 'no-tag';
      const stats = tagStatsMap.get(tagKey);
      const tag = tags.find(t => t.id === todo.tagId);
      
      if (stats) {
        stats.totalTasks++;
        if (todo.completed) {
          stats.completedTasks++;
        }

        // Process sessions
        todo.sessions?.forEach(session => {
          const sessionDate = new Date(session.startTime);
          const sessionEndDate = new Date(session.startTime);
          sessionEndDate.setSeconds(sessionEndDate.getSeconds() + session.duration);
          
          if (sessionDate >= startDate && sessionDate <= now) {
            stats.totalTime += session.duration;
            stats.sessions++;

            // Add to sessions array for detailed view
            sessionsArray.push({
              id: `${todo.id}-${session.startTime}`,
              startTime: sessionDate,
              endTime: sessionEndDate,
              duration: session.duration,
              taskName: todo.text,
              tagName: tag?.name || 'No tag',
              tagColor: tag?.color || '#9CA3AF'
            });

            // Update hour distribution
            const hour = sessionDate.getHours();
            hourDistribution.set(hour, (hourDistribution.get(hour) || 0) + session.duration);

            // Track day productivity
            const dayKey = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][sessionDate.getDay()];
            dayProductivity.set(dayKey, (dayProductivity.get(dayKey) || 0) + session.duration);
            
            // Daily data
            const dailyKey = sessionDate.toISOString().split('T')[0];
            dailyDataMap.set(dailyKey, (dailyDataMap.get(dailyKey) || 0) + session.duration);
            
            if (!dailyMap.has(dailyKey)) {
              dailyMap.set(dailyKey, {
                date: dailyKey,
                totalTime: 0,
                sessions: 0,
                tasks: 0,
                completedTasks: 0
              });
            }
            const dayData = dailyMap.get(dailyKey)!;
            dayData.totalTime += session.duration;
            dayData.sessions++;
            
            // Weekly data
            const weekStart = new Date(sessionDate);
            weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeklyMap.has(weekKey)) {
              weeklyMap.set(weekKey, {
                weekStart: weekKey,
                totalTime: 0,
                sessions: 0,
                tasks: 0,
                completedTasks: 0
              });
            }
            const weekData = weeklyMap.get(weekKey)!;
            weekData.totalTime += session.duration;
            weekData.sessions++;
            
            // Monthly data
            const monthKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyMap.has(monthKey)) {
              monthlyMap.set(monthKey, {
                month: monthKey,
                totalTime: 0,
                sessions: 0,
                tasks: 0,
                completedTasks: 0
              });
            }
            const monthData = monthlyMap.get(monthKey)!;
            monthData.totalTime += session.duration;
            monthData.sessions++;
          }
        });
      }
    });

    // Update task counts for daily/weekly/monthly data
    todos.forEach(todo => {
      // Use the first session date if available, otherwise use current date
      const firstSession = todo.sessions && todo.sessions.length > 0 ? todo.sessions[0] : null;
      const createdDate = firstSession ? new Date(firstSession.startTime) : new Date();
      if (createdDate >= startDate && createdDate <= now) {
        const dailyKey = createdDate.toISOString().split('T')[0];
        const dayData = dailyMap.get(dailyKey);
        if (dayData) {
          dayData.tasks++;
          if (todo.completed) dayData.completedTasks++;
        }
        
        const weekStart = new Date(createdDate);
        weekStart.setDate(createdDate.getDate() - createdDate.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        const weekData = weeklyMap.get(weekKey);
        if (weekData) {
          weekData.tasks++;
          if (todo.completed) weekData.completedTasks++;
        }
        
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        const monthData = monthlyMap.get(monthKey);
        if (monthData) {
          monthData.tasks++;
          if (todo.completed) monthData.completedTasks++;
        }
      }
    });

    // Calculate streaks
    const sortedDates = Array.from(dailyDataMap.keys()).sort();
    let currentStreakCount = 0;
    let longestStreakCount = 0;
    let tempStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date();
    
    // Check current streak
    while (checkDate >= startDate) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dailyDataMap.has(dateStr) && dailyDataMap.get(dateStr)! > 0) {
        if (dateStr === today || currentStreakCount > 0) {
          currentStreakCount++;
        }
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Find longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      if (dailyDataMap.get(sortedDates[i])! > 0) {
        tempStreak++;
        longestStreakCount = Math.max(longestStreakCount, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Set all state
    const sortedTagStats = Array.from(tagStatsMap.values())
      .filter(stat => stat.totalTasks > 0)
      .sort((a, b) => b.totalTime - a.totalTime);
    
    setTagStats(sortedTagStats);
    setTimeDistribution(Array.from(hourDistribution.entries()).map(([hour, time]) => ({ hour, time })));
    setDailyData(dailyDataMap);
    setSessionsData(sessionsArray.sort((a, b) => a.startTime.getTime() - b.startTime.getTime()));
    setDailyDataArray(Array.from(dailyMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setWeeklyDataArray(Array.from(weeklyMap.values()).sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()));
    setMonthlyDataArray(Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month)));
    setCurrentStreak(currentStreakCount);
    setLongestStreak(longestStreakCount);
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

  const totalTime = tagStats.reduce((acc, stat) => acc + stat.totalTime, 0);
  const totalSessions = tagStats.reduce((acc, stat) => acc + stat.sessions, 0);
  const averageSessionLength = totalSessions > 0 ? Math.round(totalTime / totalSessions / 60) : 0;

  // Find peak hours

  const maxDistributionTime = Math.max(...timeDistribution.map(d => d.time), 1);

  // Get color intensity for contribution grid
  const getColorIntensity = (studyTime: number) => {
    if (studyTime === 0) return 'bg-gray-200 dark:bg-gray-800'; // No study - gray
    
    // Calculate max study time for normalization
    const maxTime = Math.max(...Array.from(dailyData.values()), 1);
    const intensity = Math.min(studyTime / maxTime, 1);
    
    if (intensity <= 0.25) return 'bg-green-200 dark:bg-green-900'; // Light green
    if (intensity <= 0.5) return 'bg-green-300 dark:bg-green-800';  // Medium light
    if (intensity <= 0.75) return 'bg-green-500 dark:bg-green-600'; // Medium
    return 'bg-green-700 dark:bg-green-500'; // Dark green
  };

  // Generate contribution grid data like GitHub
  const generateContributionGrid = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Start from one year ago
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);
    startDate.setDate(startDate.getDate() + 1); // Start from day after one year ago
    
    // Adjust to start from Sunday
    const startDay = startDate.getDay();
    if (startDay !== 0) {
      startDate.setDate(startDate.getDate() - startDay);
    }
    
    // Generate weeks array (52 weeks + current partial week)
    const weeks = [];
    const monthLabels = new Map(); // Track where each month starts
    
    let currentDate = new Date(startDate);
    let weekIndex = 0;
    let currentMonth = -1; // Track to avoid duplicate month labels
    
    while (currentDate <= today || weekIndex < 52) {
      const week = [];
      
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const date = new Date(currentDate);
        
        // Track month labels at the actual start of each month
        if (date.getMonth() !== currentMonth && dayOfWeek === 0) {
          // Only add label if it's the first Sunday of the month or if month changed
          const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
          const daysFromFirstSunday = (7 - firstOfMonth.getDay()) % 7;
          const firstSundayOfMonth = new Date(firstOfMonth);
          firstSundayOfMonth.setDate(1 + daysFromFirstSunday);
          
          // Add label if this is within the first week of the month
          if (Math.abs(date.getDate() - firstSundayOfMonth.getDate()) <= 6) {
            monthLabels.set(weekIndex, date.toLocaleDateString('en-US', { month: 'short' }));
            currentMonth = date.getMonth();
          }
        }
        
        if (currentDate <= today) {
          const studyTime = dailyData.get(dateStr) || 0;
          week.push({
            date: date,
            dateKey: dateStr,
            studyTime: studyTime,
            colorClass: getColorIntensity(studyTime),
            isToday: dateStr === todayStr,
            isFuture: false
          });
        } else {
          week.push({
            date: date,
            dateKey: dateStr,
            studyTime: 0,
            colorClass: 'bg-gray-100 dark:bg-gray-800',
            isToday: false,
            isFuture: true
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
      weekIndex++;
      
      // Stop after we've covered today
      if (currentDate > today && weekIndex >= 52) break;
    }
    
    return { weeks, monthLabels };
  };


  // Helper function to render stats cards based on timeframe
  const renderStatsCards = () => {
    const cards = [];
    
    // Common cards for all timeframes
    cards.push(
      <div key="focus-time" className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-2">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {formatTime(totalTime)}
        </div>
        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {timeRange === 'day' ? 'Today' : 'Focus Time'}
        </div>
      </div>
    );

    cards.push(
      <div key="sessions" className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-2">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {totalSessions}
        </div>
        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Sessions</div>
      </div>
    );

    // Timeframe-specific cards
    if (timeRange === 'day') {
      cards.push(
        <div key="breaks" className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-2">
            <Pause className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Math.max(0, sessionsData.length - 1)}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Breaks</div>
        </div>
      );
    } else if (timeRange === 'week') {
      cards.push(
        <div key="streak" className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-2">
            <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentStreak}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Current Streak</div>
        </div>
      );
    } else {
      cards.push(
        <div key="focus-days" className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-2">
            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Array.from(dailyData.values()).filter(time => time > 0).length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Focus Days</div>
        </div>
      );
    }

    cards.push(
      <div key="avg-session" className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mx-auto mb-2">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {averageSessionLength}m
        </div>
        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Avg Session</div>
      </div>
    );

    // Best performance card
    if (timeRange === 'day') {
      const peakHour = timeDistribution.reduce((max, current) => 
        current.time > max.time ? current : max, { hour: 0, time: 0 });
      cards.push(
        <div key="peak-hour" className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {peakHour.time > 0 ? `${peakHour.hour}:00` : 'N/A'}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Peak Hour</div>
        </div>
      );
    } else {
      cards.push(
        <div key="best-performance" className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Array.from(dailyData.values()).length > 0 ? formatTime(Math.max(...Array.from(dailyData.values()))) : '0m'}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
            {timeRange === 'week' ? 'Best Day' : timeRange === 'month' ? 'Best Day' : 'Best Day'}
          </div>
        </div>
      );
    }

    // Longest streak for week/month/year views
    if (timeRange !== 'day') {
      cards.push(
        <div key="longest-streak" className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg mx-auto mb-2">
            <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {longestStreak}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Longest Streak</div>
        </div>
      );
    }

    return cards;
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 relative overflow-x-hidden">
      {/* Unified background gradient */}
      <BackgroundGradient />
      <div className="max-w-6xl w-full mx-auto relative z-10">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {timeRange === 'day' && 'Daily Analytics'}
            {timeRange === 'week' && 'Weekly Analytics'}
            {timeRange === 'month' && 'Monthly Analytics'}
            {timeRange === 'year' && 'Yearly Analytics'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {timeRange === 'day' && 'Your productivity over the last 24 hours'}
            {timeRange === 'week' && 'Your productivity over the last 7 days'}
            {timeRange === 'month' && 'Your productivity over the last 30 days'}
            {timeRange === 'year' && 'Your productivity over the past year'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {renderStatsCards()}
        </div>

        {/* Day View */}
        {timeRange === 'day' && (
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Today's Sessions</h3>
              
              {sessionsData.length > 0 ? (
                <div className="space-y-4">
                  {sessionsData.map((session) => (
                    <div key={session.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: session.tagColor }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {session.taskName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {session.tagName}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1" />
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatTime(session.duration)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {session.startTime.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {session.endTime.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No focus sessions today yet</p>
                  <p className="text-sm">Start a timer to see your daily timeline</p>
                </div>
              )}
            </div>

            {/* Hourly Productivity */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Hourly Productivity</h3>
              
              <div className="h-64 flex items-end space-x-1">
                {timeDistribution.map((dist) => {
                  const height = maxDistributionTime > 0 ? (dist.time / maxDistributionTime) * 100 : 0;
                  const isActive = dist.time > 0;
                  return (
                    <div key={dist.hour} className="flex-1 flex flex-col items-center">
                      <div className="w-full relative flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t transition-all hover:opacity-80 ${
                            isActive 
                              ? 'bg-gradient-to-t from-blue-500 to-blue-400' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`${dist.hour}:00 - ${formatTime(dist.time)}`}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {dist.hour}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">Hour of day (24h)</p>
            </div>

            {/* Break Analysis */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Break Patterns</h3>
              
              {sessionsData.length > 1 ? (
                <div className="space-y-3">
                  {sessionsData.slice(0, -1).map((session, index) => {
                    const nextSession = sessionsData[index + 1];
                    const breakDuration = (nextSession.startTime.getTime() - session.endTime.getTime()) / 1000;
                    
                    return (
                      <div key={`break-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Break {index + 1}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatTime(breakDuration)}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Pause className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Break Insights</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Average break: {formatTime(
                        sessionsData.slice(0, -1).reduce((total, session, index) => {
                          const nextSession = sessionsData[index + 1];
                          return total + (nextSession.startTime.getTime() - session.endTime.getTime()) / 1000;
                        }, 0) / Math.max(1, sessionsData.length - 1)
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Pause className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No breaks to analyze yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Week View */}
        {timeRange === 'week' && (
          <div className="space-y-6">
            {/* Daily Bar Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Daily Focus Time</h3>
              
              {dailyDataArray.length > 0 ? (
                <div className="h-64 flex items-end justify-center space-x-4">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const dateStr = date.toISOString().split('T')[0];
                    const dayData = dailyDataArray.find(d => d.date === dateStr);
                    const maxTime = Math.max(...dailyDataArray.map(d => d.totalTime), 1);
                    const height = dayData ? (dayData.totalTime / maxTime) * 100 : 0;
                    
                    return (
                      <div key={i} className="flex-1 max-w-16 flex flex-col items-center">
                        <div className="w-full relative flex-1 flex items-end">
                          <div
                            className={`w-full rounded-t transition-all hover:opacity-80 ${
                              dayData && dayData.totalTime > 0
                                ? 'bg-gradient-to-t from-green-500 to-green-400' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                            style={{ height: `${Math.max(height, 2)}%` }}
                            title={`${date.toLocaleDateString('en-US', { weekday: 'short' })} - ${dayData ? formatTime(dayData.totalTime) : '0m'}`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {dayData ? formatTime(dayData.totalTime) : '0m'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No focus data this week</p>
                </div>
              )}
            </div>

            {/* Streak & Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Streak Tracking</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{currentStreak} days</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{longestStreak} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Days Active This Week</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {dailyDataArray.filter(d => d.totalTime > 0).length}/7
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Week Summary</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {dailyDataArray.reduce((sum, d) => sum + d.tasks, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {dailyDataArray.reduce((sum, d) => sum + d.completedTasks, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {dailyDataArray.reduce((sum, d) => sum + d.tasks, 0) > 0 
                        ? Math.round((dailyDataArray.reduce((sum, d) => sum + d.completedTasks, 0) / dailyDataArray.reduce((sum, d) => sum + d.tasks, 0)) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Month View */}
        {timeRange === 'month' && (
          <div className="space-y-6">
            {/* Calendar Heat Map */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Monthly Activity</h3>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs text-center text-gray-500 dark:text-gray-400 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - 30 + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayTime = dailyData.get(dateStr) || 0;
                  const maxTime = Math.max(...Array.from(dailyData.values()), 1);
                  const intensity = dayTime / maxTime;
                  
                  let bgClass = 'bg-gray-200 dark:bg-gray-700';
                  if (dayTime > 0) {
                    if (intensity <= 0.25) bgClass = 'bg-green-200 dark:bg-green-900';
                    else if (intensity <= 0.5) bgClass = 'bg-green-300 dark:bg-green-800';
                    else if (intensity <= 0.75) bgClass = 'bg-green-500 dark:bg-green-600';
                    else bgClass = 'bg-green-700 dark:bg-green-500';
                  }
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded ${bgClass} flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 hover:scale-110 transition-all cursor-pointer`}
                      title={`${date.toLocaleDateString()} - ${formatTime(dayTime)}`}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Category Distribution</h3>
              
              {tagStats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="relative">
                    <div className="w-48 h-48 mx-auto">
                      {/* Simple pie chart representation */}
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {tagStats.map((stat, index) => {
                          const percentage = totalTime > 0 ? (stat.totalTime / totalTime) : 0;
                          const startAngle = tagStats.slice(0, index).reduce((sum, s) => 
                            sum + (totalTime > 0 ? (s.totalTime / totalTime) : 0), 0) * 360;
                          const endAngle = startAngle + (percentage * 360);
                          
                          if (percentage === 0) return null;
                          
                          const largeArcFlag = percentage > 0.5 ? 1 : 0;
                          const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                          const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                          const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                          const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                          
                          return (
                            <path
                              key={stat.tagId}
                              d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                              fill={stat.tagColor}
                              className="hover:opacity-80 transition-opacity"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {tagStats.map((stat) => {
                      const percentage = totalTime > 0 ? Math.round((stat.totalTime / totalTime) * 100) : 0;
                      return (
                        <div key={stat.tagId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: stat.tagColor }}
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {stat.tagName}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {percentage}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(stat.totalTime)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No category data available</p>
                </div>
              )}
            </div>

            {/* Weekly Comparisons */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Weekly Comparison</h3>
              
              {weeklyDataArray.length > 0 ? (
                <div className="h-48 flex items-end space-x-4">
                  {weeklyDataArray.slice(-4).map((week, index) => {
                    const maxTime = Math.max(...weeklyDataArray.map(w => w.totalTime), 1);
                    const height = (week.totalTime / maxTime) * 100;
                    const weekDate = new Date(week.weekStart);
                    
                    return (
                      <div key={week.weekStart} className="flex-1 flex flex-col items-center">
                        <div className="w-full relative flex-1 flex items-end">
                          <div
                            className="w-full rounded-t bg-gradient-to-t from-purple-500 to-purple-400 transition-all hover:opacity-80"
                            style={{ height: `${Math.max(height, 2)}%` }}
                            title={`Week of ${weekDate.toLocaleDateString()} - ${formatTime(week.totalTime)}`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Week {index + 1}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatTime(week.totalTime)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No weekly data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Year View */}
        {timeRange === 'year' && (
          <div className="space-y-6">
            {/* Contribution Grid */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Study Activity</h3>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {new Date().getFullYear()}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <div className="flex items-center justify-end mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Less</span>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-300 dark:bg-green-800 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-700 dark:bg-green-500 rounded-sm"></div>
                    </div>
                    <span>More</span>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="min-w-max">
                    {(() => {
                      const { weeks, monthLabels } = generateContributionGrid();
                      
                      return (
                        <div className="relative">
                          {/* Month labels */}
                          <div className="flex mb-2 pl-8 relative h-4">
                            {Array.from(monthLabels.entries()).map(([weekIndex, monthName]) => (
                              <div 
                                key={weekIndex}
                                className="absolute text-xs text-gray-600 dark:text-gray-400"
                                style={{ 
                                  left: `${weekIndex * 16}px`
                                }}
                              >
                                {monthName}
                              </div>
                            ))}
                          </div>
                          
                          {/* Days of week labels and grid */}
                          <div className="flex gap-1">
                            {/* Day labels */}
                            <div className="flex flex-col gap-1 pr-2 text-xs text-gray-600 dark:text-gray-400">
                              <div className="h-3"></div>
                              <div className="h-3 flex items-center">Mon</div>
                              <div className="h-3"></div>
                              <div className="h-3 flex items-center">Wed</div>
                              <div className="h-3"></div>
                              <div className="h-3 flex items-center">Fri</div>
                              <div className="h-3"></div>
                            </div>
                            
                            {/* Weeks grid */}
                            <div className="flex gap-1">
                              {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-1">
                                  {week.map((day, dayIndex) => (
                                    <div
                                      key={dayIndex}
                                      className={`w-3 h-3 rounded-sm transition-all ${
                                        day.isFuture 
                                          ? 'bg-transparent' 
                                          : day.isToday
                                          ? `${day.colorClass} ring-1 ring-offset-1 ring-gray-400 dark:ring-gray-500`
                                          : day.colorClass
                                      } ${!day.isFuture ? 'cursor-pointer hover:scale-125' : ''}`}
                                      onMouseEnter={(e) => {
                                        if (!day.isFuture) {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          setHoveredDay({
                                            date: day.date,
                                            studyTime: day.studyTime,
                                            x: rect.left + rect.width / 2,
                                            y: rect.top
                                          });
                                        }
                                      }}
                                      onMouseLeave={() => setHoveredDay(null)}
                                    />
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Custom Tooltip */}
                {hoveredDay && (
                  <div 
                    className="fixed z-50 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl pointer-events-none border border-gray-700"
                    style={{
                      left: hoveredDay.x - 75,
                      top: hoveredDay.y - 70,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="font-medium">
                      {hoveredDay.date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-gray-300 text-xs">
                      {hoveredDay.studyTime > 0 ? formatTime(hoveredDay.studyTime) : 'No study time'}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                  </div>
                )}

                {/* Summary */}
                <div className="mt-6 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {dailyData.size > 0 
                      ? `${Array.from(dailyData.values()).filter(time => time > 0).length} days with study activity in ${new Date().getFullYear()}`
                      : `No focus sessions for ${new Date().getFullYear()}`
                    }
                  </div>
                  {dailyData.size === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Start focusing to see your activity breakdown
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Bar Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Monthly Totals</h3>
              
              {monthlyDataArray.length > 0 ? (
                <div className="h-64 flex items-end justify-center space-x-3">
                  {monthlyDataArray.slice(-12).map((month) => {
                    const maxTime = Math.max(...monthlyDataArray.map(m => m.totalTime), 1);
                    const height = (month.totalTime / maxTime) * 100;
                    const monthDate = new Date(month.month + '-01');
                    
                    return (
                      <div key={month.month} className="flex-1 max-w-16 flex flex-col items-center">
                        <div className="w-full relative flex-1 flex items-end">
                          <div
                            className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-indigo-400 transition-all hover:opacity-80"
                            style={{ height: `${Math.max(height, 2)}%` }}
                            title={`${monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${formatTime(month.totalTime)}`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {monthDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatTime(month.totalTime)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No monthly data available</p>
                </div>
              )}
            </div>

            {/* Year Highlights */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Year Highlights</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                  <Award className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {longestStreak}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                    Longest Streak
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {monthlyDataArray.length > 0 
                      ? monthlyDataArray.reduce((max, month) => 
                          month.totalTime > max.totalTime ? month : max
                        ).month.split('-')[1]
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Most Productive Month
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {Array.from(dailyData.values()).length > 0 
                      ? formatTime(Math.max(...Array.from(dailyData.values())))
                      : '0m'
                    }
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Best Day
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalyzePage;