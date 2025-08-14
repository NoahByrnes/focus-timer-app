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

interface AnalyzePageProps {
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

const AnalyzePage = ({ timeRange = 'week' }: AnalyzePageProps) => {
  const { todos, tags } = useTodos();
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
    
    if (timeRange === 'day') {
      startDate.setDate(now.getDate() - 1);
    } else if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
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
    
    while (currentDate <= today || weekIndex < 52) {
      const week = [];
      
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const date = new Date(currentDate);
        
        // Track month labels (first week of each month)
        if (date.getDate() <= 7 && dayOfWeek === 0) {
          monthLabels.set(weekIndex, date.toLocaleDateString('en-US', { month: 'short' }));
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

  // Calculate trend (compare to previous period)
  const previousPeriodTime = totalTime * 0.8; // Mock data for trend
  const trend = totalTime > previousPeriodTime ? 'up' : totalTime < previousPeriodTime ? 'down' : 'neutral';
  const trendPercentage = Math.abs(Math.round(((totalTime - previousPeriodTime) / previousPeriodTime) * 100));

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto">

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

        {/* Stats Grid - Common for all views */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatTime(totalTime)}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Focus Time</div>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-2">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalSessions}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Sessions</div>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-2">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Array.from(dailyData.values()).filter(time => time > 0).length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Focus Days</div>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mx-auto mb-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {averageSessionLength}m
            </div>
            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Avg Session</div>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Array.from(dailyData.values()).length > 0 ? Math.max(...Array.from(dailyData.values())) > 0 ? formatTime(Math.max(...Array.from(dailyData.values()))) : '0m' : '0m'}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Best Day</div>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg mx-auto mb-2">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(() => {
                // Calculate best week (7-day period with most study time)
                const weekTotals = new Map<string, number>();
                Array.from(dailyData.entries()).forEach(([date, time]) => {
                  const d = new Date(date);
                  const startOfWeek = new Date(d);
                  startOfWeek.setDate(d.getDate() - d.getDay());
                  const weekKey = startOfWeek.toISOString().split('T')[0];
                  weekTotals.set(weekKey, (weekTotals.get(weekKey) || 0) + time);
                });
                const maxWeekTime = Math.max(...Array.from(weekTotals.values()), 0);
                return maxWeekTime > 0 ? formatTime(maxWeekTime) : '0m';
              })()}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Best Week</div>
          </div>
        </div>

        {/* Year View - Contribution Grid */}
        {timeRange === 'year' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Study Activity</h3>
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {new Date().getFullYear()}
              </div>
            </div>

            
            {/* Contribution Grid */}
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
        )}

        {/* Week/Month/All Views - Charts and Analytics */}
        {timeRange !== 'year' && (
          <div className="space-y-6">
            {/* Category Breakdown */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Category Breakdown</h3>
              
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
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No data available for the selected period
                  </div>
                )}
              </div>
            </div>

            {/* Hourly Distribution */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Hourly Distribution</h3>
              
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

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Peak Hours</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {peakHours.length > 0 ? peakHours.join(', ') : 'No activity yet'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Most Productive Days</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {productiveDays.length > 0 ? productiveDays.join(', ') : 'No activity yet'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  {trend === 'up' && <ArrowUp className="w-4 h-4 text-green-600" />}
                  {trend === 'down' && <ArrowDown className="w-4 h-4 text-red-600" />}
                  {trend === 'neutral' && <Minus className="w-4 h-4 text-gray-600" />}
                  <span className={`text-sm font-medium ${
                    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trendPercentage}% vs previous period
                  </span>
                </div>
              </div>
            </div>

            {/* Task Statistics Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Task Statistics</h3>
              
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
        )}

      </div>
    </div>
  );
};

export default AnalyzePage;