import { useState, useEffect } from 'react';
import { User, Mail, Award, Target, Clock, Calendar, TrendingUp, Edit2, Save, X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTodos } from './context/TodoContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const { todos } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    goals: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [editedData, setEditedData] = useState(profileData);

  useEffect(() => {
    // Load profile data from localStorage or backend
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfileData(parsed);
      setEditedData(parsed);
    } else {
      // Set default display name from email
      const defaultName = user?.email?.split('@')[0] || 'User';
      setProfileData(prev => ({ ...prev, displayName: defaultName }));
      setEditedData(prev => ({ ...prev, displayName: defaultName }));
    }
  }, [user]);

  const handleSave = () => {
    setProfileData(editedData);
    localStorage.setItem('userProfile', JSON.stringify(editedData));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  // Calculate statistics
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalFocusTime = todos.reduce((acc, todo) => acc + todo.totalTime, 0);
  const totalSessions = todos.reduce((acc, todo) => acc + (todo.sessions?.length || 0), 0);
  
  // Calculate streak (mock data for demonstration)
  const currentStreak = 7;
  const longestStreak = 15;
  
  // Calculate member since
  const memberSince = user?.user_metadata?.created_at 
    ? new Date(user.user_metadata.created_at)
    : new Date();
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };

  // Achievement badges
  const achievements = [
    { 
      id: 1, 
      name: 'Early Bird', 
      description: 'Complete 5 tasks before 9 AM', 
      earned: totalSessions > 10,
      icon: '🌅'
    },
    { 
      id: 2, 
      name: 'Focus Master', 
      description: '100 hours of focus time', 
      earned: totalFocusTime > 360000,
      icon: '🎯'
    },
    { 
      id: 3, 
      name: 'Consistent', 
      description: '7-day streak', 
      earned: currentStreak >= 7,
      icon: '🔥'
    },
    { 
      id: 4, 
      name: 'Productivity Pro', 
      description: '90% completion rate', 
      earned: completionRate >= 90,
      icon: '⭐'
    },
    { 
      id: 5, 
      name: 'Task Crusher', 
      description: 'Complete 100 tasks', 
      earned: completedTasks >= 100,
      icon: '💪'
    },
    { 
      id: 6, 
      name: 'Marathon Runner', 
      description: '5-hour focus in one day', 
      earned: false,
      icon: '🏃'
    },
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <div className="flex-1 flex flex-col p-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your profile and view achievements</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.displayName}
                    onChange={(e) => setEditedData({ ...editedData, displayName: e.target.value })}
                    className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-green-500"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {profileData.displayName || user?.email?.split('@')[0]}
                  </h2>
                )}
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Member since {memberSince.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div>
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  value={editedData.bio}
                  onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  {profileData.bio || 'No bio added yet.'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goals</label>
              {isEditing ? (
                <textarea
                  value={editedData.goals}
                  onChange={(e) => setEditedData({ ...editedData, goals: e.target.value })}
                  placeholder="What are your productivity goals?"
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  {profileData.goals || 'No goals set yet.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedTasks}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tasks completed</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTime(totalFocusTime)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total focus time</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completionRate}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completion rate</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentStreak}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Day streak</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Award className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Achievements</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {earnedAchievements.length} of {achievements.length} earned
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  achievement.earned
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-50'
                }`}
              >
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <h3 className={`text-sm font-semibold mb-1 ${
                  achievement.earned 
                    ? 'text-gray-900 dark:text-gray-100' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {achievement.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Overview */}
        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Activity Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Today</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {todos.filter(t => {
                      const today = new Date().toDateString();
                      return t.sessions?.some(s => new Date(s.startTime).toDateString() === today);
                    }).length} sessions
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">This week</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{totalSessions} sessions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Longest streak</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{longestStreak} days</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Average session</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {totalSessions > 0 ? Math.round(totalFocusTime / totalSessions / 60) : 0}m
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Daily average</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatTime(Math.round(totalFocusTime / 7))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Most productive day</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Monday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;