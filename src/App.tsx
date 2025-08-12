import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Target, Calendar, BarChart3, FileText, Settings, LogOut, User } from 'lucide-react';
import FocusPage from './FocusPage';
import PlanPage from './PlanPage';
import { TodoProvider } from './context/TodoContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
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

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div>
            <h1 className="font-semibold text-gray-900 text-lg">Focus Timer</h1>
            <p className="text-xs text-gray-500">Stay focused, achieve more</p>
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
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
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
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Focus</span>
              </NavLink>
            </li>
            <li>
              <button className="flex items-center space-x-3 px-3 py-2.5 w-full text-left rounded-lg text-gray-600 hover:bg-gray-50">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Review</span>
              </button>
            </li>
            <li>
              <button className="flex items-center space-x-3 px-3 py-2.5 w-full text-left rounded-lg text-gray-600 hover:bg-gray-50">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Analyze</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <button className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full text-left">
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </button>
            <button className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full text-left">
              <User className="w-4 h-4" />
              <span className="text-sm">Profile</span>
            </button>
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
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
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </div>
  );
};

const KairuApp = () => {
  return (
    <AuthProvider>
      <TodoProvider>
        <Router>
          <MainApp />
        </Router>
      </TodoProvider>
    </AuthProvider>
  );
};

export default KairuApp;