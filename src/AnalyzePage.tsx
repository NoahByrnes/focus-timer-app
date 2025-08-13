import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useTodos } from './context/TodoContext';

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

const AnalyzePage = () => {
  const { todos, tags } = useTodos();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [tagStats, setTagStats] = useState<TagStats[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [productiveDays, setProductiveDays] = useState<string[]>([]);
  const [dailyData, setDailyData] = useState<Map<string, number>>(new Map());
  const [hoveredDay, setHoveredDay] = useState<{date: Date, studyTime: number, x: number, y: number} | null>(null);

  useEffect(() => {
    calculateAnalytics();
  }, [todos, tags, timeRange]);

  const calculateAnalytics = () => {
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate.setFullYear(2020); // All time
    }

    // Calculate tag statistics
    const tagStatsMap: Map<string, TagStats> = new Map();
    
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

    // Add "No tag" category
    tagStatsMap.set('no-tag', {
      tagId: 'no-tag',
      tagName: 'No tag',
      tagColor: '#9CA3AF',
      totalTime: 0,
      totalTasks: 0,
      completedTasks: 0,
      sessions: 0
    });

    // Calculate time distribution by hour
    const hourDistribution: Map<number, number> = new Map();
    for (let i = 0; i < 24; i++) {
      hourDistribution.set(i, 0);
    }

    // Track productive days
    const dayProductivity: Map<string, number> = new Map();
    
    // Track daily data for contribution grid
    const dailyDataMap: Map<string, number> = new Map();

    // Process todos
    todos.forEach(todo => {
      const tagKey = todo.tagId || 'no-tag';
      const stats = tagStatsMap.get(tagKey);
      
      if (stats) {
        stats.totalTasks++;
        if (todo.completed) {
          stats.completedTasks++;
        }

        // Process sessions
        todo.sessions?.forEach(session => {
          const sessionDate = new Date(session.startTime);
          
          if (sessionDate >= startDate && sessionDate <= now) {
            stats.totalTime += session.duration;
            stats.sessions++;

            // Update hour distribution
            const hour = sessionDate.getHours();
            hourDistribution.set(hour, (hourDistribution.get(hour) || 0) + session.duration);

            // Track day productivity
            const dayKey = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][sessionDate.getDay()];
            dayProductivity.set(dayKey, (dayProductivity.get(dayKey) || 0) + session.duration);
            
            // Track daily data for contribution grid (YYYY-MM-DD format)
            const dailyKey = sessionDate.toISOString().split('T')[0];
            dailyDataMap.set(dailyKey, (dailyDataMap.get(dailyKey) || 0) + session.duration);
          }
        });
      }
    });

    // Convert to arrays and sort
    const sortedTagStats = Array.from(tagStatsMap.values())
      .filter(stat => stat.totalTasks > 0)
      .sort((a, b) => b.totalTime - a.totalTime);
    
    setTagStats(sortedTagStats);

    // Set time distribution
    const distribution = Array.from(hourDistribution.entries())
      .map(([hour, time]) => ({ hour, time }));
    setTimeDistribution(distribution);

    // Find most productive days
    const sortedDays = Array.from(dayProductivity.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([day]) => day);
    setProductiveDays(sortedDays.slice(0, 3));
    
    // Set daily data for contribution grid
    setDailyData(dailyDataMap);
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
  const totalCompleted = tagStats.reduce((acc, stat) => acc + stat.completedTasks, 0);
  const totalTasks = tagStats.reduce((acc, stat) => acc + stat.totalTasks, 0);
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const averageSessionLength = totalSessions > 0 ? Math.round(totalTime / totalSessions / 60) : 0;

  // Find peak hours
  const peakHours = timeDistribution
    .filter(d => d.time > 0)
    .sort((a, b) => b.time - a.time)
    .slice(0, 3)
    .map(d => {
      const hour = d.hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}${period}`;
    });

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

  // Generate contribution grid data organized by months
  const generateContributionGrid = () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(1); // Start from first of the month
    
    const months = [];
    const currentMonth = new Date(oneYearAgo);
    
    // Generate 12 months of data
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Create grid for this month (max 6 weeks x 7 days)
      const monthGrid = [];
      
      // Find the first Sunday of the calendar view for this month
      const firstDay = new Date(monthStart);
      const startOfWeek = firstDay.getDay(); // 0 = Sunday
      firstDay.setDate(firstDay.getDate() - startOfWeek);
      
      // Generate 6 weeks to cover the entire month
      for (let week = 0; week < 6; week++) {
        const weekData = [];
        for (let day = 0; day < 7; day++) {
          const currentDate = new Date(firstDay);
          currentDate.setDate(firstDay.getDate() + (week * 7) + day);
          
          // Only include dates within the month and not in the future
          if (currentDate >= monthStart && currentDate <= monthEnd && currentDate <= today) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const studyTime = dailyData.get(dateKey) || 0;
            weekData.push({
              date: currentDate,
              dateKey,
              studyTime,
              colorClass: getColorIntensity(studyTime),
              isCurrentMonth: true
            });
          } else if (currentDate <= today) {
            // Outside current month but not future
            weekData.push({
              date: currentDate,
              dateKey: currentDate.toISOString().split('T')[0],
              studyTime: 0,
              colorClass: 'bg-transparent',
              isCurrentMonth: false
            });
          } else {
            weekData.push(null); // Future dates
          }
        }
        monthGrid.push(weekData);
      }
      
      months.push({
        month: monthStart,
        monthName: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        grid: monthGrid
      });
      
      // Move to next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    
    return months;
  };

  // Calculate trend (compare to previous period)
  const previousPeriodTime = totalTime * 0.8; // Mock data for trend
  const trend = totalTime > previousPeriodTime ? 'up' : totalTime < previousPeriodTime ? 'down' : 'neutral';
  const trendPercentage = Math.abs(Math.round(((totalTime - previousPeriodTime) / previousPeriodTime) * 100));

  return (
    <div className="flex-1 flex flex-col p-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Deep insights into your productivity patterns</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeRange === 'week'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeRange === 'month'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeRange === 'year'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Last year
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeRange === 'all'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All time
          </button>
        </div>

        {/* Contribution Grid - Year View */}
        {timeRange === 'year' && (
          <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Study Activity</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-300 dark:bg-green-800 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-700 dark:bg-green-500 rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </div>
            
            <div className="overflow-x-auto relative">
              <div className="flex space-x-1">
                {/* Day labels */}
                <div className="flex flex-col space-y-1 mr-3">
                  <div className="h-4"></div> {/* Spacer for month labels */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 h-3 flex items-center">Sun</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 h-3 flex items-center">Mon</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 h-3 flex items-center">Tue</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 h-3 flex items-center">Wed</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 h-3 flex items-center">Thu</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 h-3 flex items-center">Fri</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 h-3 flex items-center">Sat</div>
                </div>
                
                {/* Monthly grids */}
                <div className="flex space-x-4">
                  {generateContributionGrid().map((monthData, monthIndex) => (
                    <div key={monthIndex} className="flex flex-col">
                      {/* Month label */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 h-4 flex items-center justify-center">
                        {monthData.monthName}
                      </div>
                      
                      {/* Days grid for this month */}
                      <div className="flex space-x-1">
                        {monthData.grid[0] && monthData.grid[0].map((_, weekIndex) => (
                          <div key={weekIndex} className="flex flex-col space-y-1">
                            {monthData.grid.map((week, dayIndex) => {
                              const day = week[weekIndex];
                              return (
                                <div
                                  key={dayIndex}
                                  className={`w-3 h-3 rounded-sm cursor-pointer ${
                                    day && day.isCurrentMonth ? day.colorClass : 'bg-transparent'
                                  }`}
                                  onMouseEnter={(e) => {
                                    if (day && day.isCurrentMonth) {
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
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Custom Tooltip */}
              {hoveredDay && (
                <div 
                  className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
                  style={{
                    left: hoveredDay.x - 50,
                    top: hoveredDay.y - 60,
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
                  <div className="text-gray-300">
                    {hoveredDay.studyTime > 0 ? formatTime(hoveredDay.studyTime) : 'No study time'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {dailyData.size > 0 
                  ? `${Array.from(dailyData.values()).filter(time => time > 0).length} days with study activity in the past year`
                  : 'No study activity recorded in the past year'
                }
              </span>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div className="flex items-center space-x-1">
                {trend === 'up' && <ArrowUp className="w-4 h-4 text-green-600" />}
                {trend === 'down' && <ArrowDown className="w-4 h-4 text-red-600" />}
                {trend === 'neutral' && <Minus className="w-4 h-4 text-gray-600" />}
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {trendPercentage}%
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatTime(totalTime)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total focus time</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{completionRate}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completion rate</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{averageSessionLength}m</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg session length</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Category Breakdown</h2>
            
            <div className="space-y-4">
              {tagStats.map((stat) => {
                const percentage = totalTime > 0 ? Math.round((stat.totalTime / totalTime) * 100) : 0;
                return (
                  <div key={stat.tagId}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stat.tagColor }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {stat.tagName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{formatTime(stat.totalTime)}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{percentage}%</span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: stat.tagColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {tagStats.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No data available for the selected period
                </div>
              )}
            </div>
          </div>

          {/* Time Distribution */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hourly Distribution</h2>
            
            <div className="h-48 flex items-end space-x-1">
              {timeDistribution.map((dist) => {
                const height = maxDistributionTime > 0 ? (dist.time / maxDistributionTime) * 100 : 0;
                const isActive = dist.time > 0;
                return (
                  <div
                    key={dist.hour}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="w-full relative flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t ${
                          isActive 
                            ? 'bg-gradient-to-t from-green-500 to-green-400' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        style={{ height: `${height}%`, minHeight: isActive ? '4px' : '1px' }}
                      />
                    </div>
                    {dist.hour % 3 === 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {dist.hour}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">Hour of day (24h)</p>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Peak Hours</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {peakHours.length > 0 ? peakHours.join(', ') : 'No activity yet'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Most Productive Days</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {productiveDays.length > 0 ? productiveDays.join(', ') : 'No activity yet'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Focus Sessions</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalSessions} sessions completed
            </p>
          </div>
        </div>

        {/* Task Statistics by Category */}
        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Task Statistics</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Category</th>
                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tasks</th>
                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Completed</th>
                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Sessions</th>
                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {tagStats.map((stat) => (
                  <tr key={stat.tagId} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stat.tagColor }}
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{stat.tagName}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {stat.totalTasks}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {stat.completedTasks}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {stat.sessions}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatTime(stat.totalTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;