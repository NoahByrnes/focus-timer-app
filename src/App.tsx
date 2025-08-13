import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Target, Calendar, BarChart3, FileText, Settings, LogOut, User, Moon, Sun } from 'lucide-react';
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

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
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
            <li>
              <NavLink
                to="/analyze"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 w-full text-left rounded-lg ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`
                }
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Analyze</span>
              </NavLink>
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
            <AnalyzePage />
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