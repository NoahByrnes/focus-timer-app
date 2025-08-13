import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Target, Calendar, BarChart3, FileText, Settings, LogOut, User, Moon, Sun, ChevronDown, Menu, X } from 'lucide-react';
import FocusPage from './FocusPage';
import PlanPage from './PlanPage';
import ReviewPage from './ReviewPage';
import AnalyzePage from './AnalyzePage';
import SettingsPage from './SettingsPage';
import ProfilePage from './ProfilePage';
import { TodoProvider } from './context/TodoContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Auth } from './components/Auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const MainApp = () => {
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [analyzeTimeRange, setAnalyzeTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Focus Timer</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Stay focused, achieve more</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/plan"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 w-full text-left rounded-lg ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`
                }
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Plan</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 w-full text-left rounded-lg ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`
                }
              >
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Focus</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/review"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 w-full text-left rounded-lg ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`
                }
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Review</span>
              </NavLink>
            </li>
            <li className="relative">
              <button
                onClick={() => setIsAnalyzeOpen(!isAnalyzeOpen)}
                className={`flex items-center justify-between px-3 py-2.5 w-full text-left rounded-lg ${
                  window.location.pathname === '/analyze'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Analyze</span>
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${isAnalyzeOpen ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              
              {isAnalyzeOpen && (
                <div className="ml-7 mt-1 space-y-1">
                  <NavLink
                    to="/analyze?range=day"
                    onClick={() => setAnalyzeTimeRange('day')}
                    className={`block px-3 py-2 text-sm rounded-lg ${
                      analyzeTimeRange === 'day'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Day
                  </NavLink>
                  <NavLink
                    to="/analyze?range=week"
                    onClick={() => setAnalyzeTimeRange('week')}
                    className={`block px-3 py-2 text-sm rounded-lg ${
                      analyzeTimeRange === 'week'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Week
                  </NavLink>
                  <NavLink
                    to="/analyze?range=month"
                    onClick={() => setAnalyzeTimeRange('month')}
                    className={`block px-3 py-2 text-sm rounded-lg ${
                      analyzeTimeRange === 'month'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Month
                  </NavLink>
                  <NavLink
                    to="/analyze?range=year"
                    onClick={() => setAnalyzeTimeRange('year')}
                    className={`block px-3 py-2 text-sm rounded-lg ${
                      analyzeTimeRange === 'year'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Year
                  </NavLink>
                </div>
              )}
            </li>
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <button
              onClick={toggleDarkMode}
              className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg w-full text-left"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <User className="w-4 h-4" />
              <span className="text-sm">Profile</span>
            </NavLink>
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-900">
            {/* Mobile Sidebar Content - Same as desktop */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Focus Timer</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Stay focused, achieve more</p>
              </div>
            </div>

            <nav className="flex-1 p-3 overflow-y-auto">
              <ul className="space-y-1">
                <li>
                  <NavLink
                    to="/plan"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 w-full text-left rounded-lg ${
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Plan</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 w-full text-left rounded-lg ${
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">Focus</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/review"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 w-full text-left rounded-lg ${
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Review</span>
                  </NavLink>
                </li>
                <li className="relative">
                  <button
                    onClick={() => setIsAnalyzeOpen(!isAnalyzeOpen)}
                    className={`flex items-center justify-between px-3 py-2.5 w-full text-left rounded-lg ${
                      window.location.pathname === '/analyze'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm">Analyze</span>
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isAnalyzeOpen ? 'rotate-0' : '-rotate-90'}`} />
                  </button>
                  
                  {isAnalyzeOpen && (
                    <div className="ml-7 mt-1 space-y-1">
                      <NavLink
                        to="/analyze?range=day"
                        onClick={() => { setAnalyzeTimeRange('day'); setIsMobileMenuOpen(false); }}
                        className={`block px-3 py-2 text-sm rounded-lg ${
                          analyzeTimeRange === 'day'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        Day
                      </NavLink>
                      <NavLink
                        to="/analyze?range=week"
                        onClick={() => { setAnalyzeTimeRange('week'); setIsMobileMenuOpen(false); }}
                        className={`block px-3 py-2 text-sm rounded-lg ${
                          analyzeTimeRange === 'week'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        Week
                      </NavLink>
                      <NavLink
                        to="/analyze?range=month"
                        onClick={() => { setAnalyzeTimeRange('month'); setIsMobileMenuOpen(false); }}
                        className={`block px-3 py-2 text-sm rounded-lg ${
                          analyzeTimeRange === 'month'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        Month
                      </NavLink>
                      <NavLink
                        to="/analyze?range=year"
                        onClick={() => { setAnalyzeTimeRange('year'); setIsMobileMenuOpen(false); }}
                        className={`block px-3 py-2 text-sm rounded-lg ${
                          analyzeTimeRange === 'year'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        Year
                      </NavLink>
                    </div>
                  )}
                </li>
              </ul>
            </nav>

            {/* Mobile User Section */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg w-full text-left"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                  <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <NavLink
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </NavLink>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <FocusPage />
          </ProtectedRoute>
        } />
        <Route path="/plan" element={
          <ProtectedRoute>
            <PlanPage />
          </ProtectedRoute>
        } />
        <Route path="/review" element={
          <ProtectedRoute>
            <ReviewPage />
          </ProtectedRoute>
        } />
        <Route path="/analyze" element={
          <ProtectedRoute>
            <AnalyzePage timeRange={analyzeTimeRange} />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </div>
  );
};

const KairuApp = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TodoProvider>
          <Router>
            <MainApp />
          </Router>
        </TodoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default KairuApp;