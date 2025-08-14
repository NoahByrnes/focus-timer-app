import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        <div className="animate-pulse-soft">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-ios-blue to-ios-blue-light shadow-glow animate-bounce-gentle"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const NavItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-4 px-4 py-4 w-full text-left rounded-2xl transition-all duration-300 group ${
        isActive
          ? 'bg-ios-blue/10 dark:bg-ios-blue/20 text-ios-blue shadow-sm backdrop-blur-sm'
          : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-800/40 hover:backdrop-blur-sm hover:shadow-sm'
      }`}
    >
      <div className={`p-2 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-ios-blue/20 dark:bg-ios-blue/30' 
          : 'bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-gray-200/70 dark:group-hover:bg-gray-600/70'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-callout font-medium">{label}</span>
    </NavLink>
  );
};

const AnalyzeDropdownButton = ({ isAnalyzeOpen, setIsAnalyzeOpen }: {
  isAnalyzeOpen: boolean;
  setIsAnalyzeOpen: (open: boolean) => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === '/analyze';
  
  return (
    <button
      onClick={() => setIsAnalyzeOpen(!isAnalyzeOpen)}
      className={`flex items-center justify-between px-4 py-4 w-full text-left rounded-2xl transition-all duration-300 group ${
        isActive
          ? 'bg-ios-blue/10 dark:bg-ios-blue/20 text-ios-blue shadow-sm backdrop-blur-sm'
          : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-800/40 hover:backdrop-blur-sm hover:shadow-sm'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-xl transition-all duration-300 ${
          isActive
            ? 'bg-ios-blue/20 dark:bg-ios-blue/30' 
            : 'bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-gray-200/70 dark:group-hover:bg-gray-600/70'
        }`}>
          <BarChart3 className="w-5 h-5" />
        </div>
        <span className="text-callout font-medium">Analyze</span>
      </div>
      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
        isAnalyzeOpen ? 'rotate-0' : '-rotate-90'
      }`} />
    </button>
  );
};

const AnalyzeSubMenuItem = ({ range, label, setAnalyzeTimeRange, onClick }: {
  range: 'day' | 'week' | 'month' | 'year';
  label: string;
  setAnalyzeTimeRange: (range: 'day' | 'week' | 'month' | 'year') => void;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentRange = searchParams.get('range') || 'week';
  const isActive = currentRange === range;
  
  return (
    <NavLink
      to={`/analyze?range=${range}`}
      onClick={() => {
        setAnalyzeTimeRange(range);
        onClick?.();
      }}
      className={`block px-4 py-2 text-subhead rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-ios-blue/10 dark:bg-ios-blue/20 text-ios-blue'
          : 'text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30'
      }`}
    >
      {label}
    </NavLink>
  );
};

const MobileTabBar = () => {
  const location = useLocation();
  
  const tabItems = [
    { path: '/plan', icon: Calendar, label: 'Plan' },
    { path: '/', icon: Target, label: 'Focus' },
    { path: '/review', icon: FileText, label: 'Review' },
    { path: '/analyze', icon: BarChart3, label: 'Analyze' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom">
      <div className="mx-4 mb-4 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl">
        <div className="flex items-center justify-around px-2 py-3">
          {tabItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-ios-blue/10 dark:bg-ios-blue/20' 
                    : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive 
                      ? 'text-ios-blue scale-110' 
                      : 'text-ios-gray dark:text-gray-400'
                  }`} 
                />
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-ios-blue' 
                    : 'text-ios-gray dark:text-gray-400'
                }`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-8 left-6 z-50 p-3 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-900 dark:text-gray-100" />
        ) : (
          <Menu className="w-6 h-6 text-gray-900 dark:text-gray-100" />
        )}
      </button>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex w-80 flex-col relative">
        <div className="absolute inset-0 backdrop-blur-2xl bg-white/30 dark:bg-gray-900/30 border-r border-white/20 dark:border-gray-700/20"></div>
        <div className="relative flex flex-col h-full z-10">
          {/* Header */}
          <div className="p-8 border-b border-white/10 dark:border-gray-700/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-ios-blue to-ios-blue-light shadow-glow flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-title-2 font-bold text-gray-900 dark:text-gray-100">Focus Timer</h1>
                <p className="text-caption text-ios-gray dark:text-gray-400">Stay focused, achieve more</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              <li>
                <NavItem to="/plan" icon={Calendar} label="Plan" />
              </li>
              <li>
                <NavItem to="/" icon={Target} label="Focus" />
              </li>
              <li>
                <NavItem to="/review" icon={FileText} label="Review" />
              </li>
              <li className="relative">
                <AnalyzeDropdownButton 
                  isAnalyzeOpen={isAnalyzeOpen}
                  setIsAnalyzeOpen={setIsAnalyzeOpen}
                />
                
                {isAnalyzeOpen && (
                  <div className="ml-16 mt-2 space-y-1 animate-slide-down">
                    <AnalyzeSubMenuItem 
                      range="day" 
                      label="Day" 
                      setAnalyzeTimeRange={setAnalyzeTimeRange}
                    />
                    <AnalyzeSubMenuItem 
                      range="week" 
                      label="Week" 
                      setAnalyzeTimeRange={setAnalyzeTimeRange}
                    />
                    <AnalyzeSubMenuItem 
                      range="month" 
                      label="Month" 
                      setAnalyzeTimeRange={setAnalyzeTimeRange}
                    />
                    <AnalyzeSubMenuItem 
                      range="year" 
                      label="Year" 
                      setAnalyzeTimeRange={setAnalyzeTimeRange}
                    />
                  </div>
                )}
              </li>
          </ul>
        </nav>

          {/* User Section */}
          <div className="p-6 border-t border-white/10 dark:border-gray-700/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-ios-green to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-caption text-ios-gray dark:text-gray-400">Signed in as</p>
                <p className="text-subhead font-medium text-gray-900 dark:text-gray-100 truncate">{user?.email}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={toggleDarkMode}
                className="flex items-center space-x-4 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-800/40 rounded-2xl w-full text-left transition-all duration-300 group"
              >
                <div className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-gray-200/70 dark:group-hover:bg-gray-600/70 transition-all duration-300">
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-callout font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center space-x-4 px-4 py-3 rounded-2xl w-full text-left transition-all duration-300 group ${
                    isActive
                      ? 'bg-ios-blue/10 dark:bg-ios-blue/20 text-ios-blue shadow-sm backdrop-blur-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-800/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-ios-blue/20 dark:bg-ios-blue/30' 
                        : 'bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-gray-200/70 dark:group-hover:bg-gray-600/70'
                    }`}>
                      <Settings className="w-5 h-5" />
                    </div>
                    <span className="text-callout font-medium">Settings</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center space-x-4 px-4 py-3 rounded-2xl w-full text-left transition-all duration-300 group ${
                    isActive
                      ? 'bg-ios-blue/10 dark:bg-ios-blue/20 text-ios-blue shadow-sm backdrop-blur-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-800/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-ios-blue/20 dark:bg-ios-blue/30' 
                        : 'bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-gray-200/70 dark:group-hover:bg-gray-600/70'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-callout font-medium">Profile</span>
                  </>
                )}
              </NavLink>
              <button 
                onClick={handleSignOut}
                className="flex items-center space-x-4 px-4 py-3 text-ios-red dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl w-full text-left transition-all duration-300 group"
              >
                <div className="p-2 rounded-xl bg-red-100/50 dark:bg-red-950/50 group-hover:bg-red-200/70 dark:group-hover:bg-red-900/70 transition-all duration-300">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-callout font-medium">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex animate-fade-in">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-sm w-full animate-slide-in">
            <div className="absolute inset-0 backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90"></div>
            <div className="relative flex flex-col h-full z-10">
              {/* Mobile Header */}
              <div className="p-8 border-b border-white/10 dark:border-gray-700/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-ios-blue to-ios-blue-light shadow-glow flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-title-2 font-bold text-gray-900 dark:text-gray-100">Focus Timer</h1>
                    <p className="text-caption text-ios-gray dark:text-gray-400">Stay focused, achieve more</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-6 overflow-y-auto">
                <ul className="space-y-2">
                  <li>
                    <NavItem to="/plan" icon={Calendar} label="Plan" onClick={() => setIsMobileMenuOpen(false)} />
                  </li>
                  <li>
                    <NavItem to="/" icon={Target} label="Focus" onClick={() => setIsMobileMenuOpen(false)} />
                  </li>
                  <li>
                    <NavItem to="/review" icon={FileText} label="Review" onClick={() => setIsMobileMenuOpen(false)} />
                  </li>
                  <li className="relative">
                    <AnalyzeDropdownButton 
                      isAnalyzeOpen={isAnalyzeOpen}
                      setIsAnalyzeOpen={setIsAnalyzeOpen}
                    />
                    
                    {isAnalyzeOpen && (
                      <div className="ml-16 mt-2 space-y-1 animate-slide-down">
                        <AnalyzeSubMenuItem 
                          range="day" 
                          label="Day" 
                          setAnalyzeTimeRange={setAnalyzeTimeRange}
                          onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <AnalyzeSubMenuItem 
                          range="week" 
                          label="Week" 
                          setAnalyzeTimeRange={setAnalyzeTimeRange}
                          onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <AnalyzeSubMenuItem 
                          range="month" 
                          label="Month" 
                          setAnalyzeTimeRange={setAnalyzeTimeRange}
                          onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <AnalyzeSubMenuItem 
                          range="year" 
                          label="Year" 
                          setAnalyzeTimeRange={setAnalyzeTimeRange}
                          onClick={() => setIsMobileMenuOpen(false)}
                        />
                      </div>
                    )}
                  </li>
                </ul>
              </nav>

              {/* Mobile User Section */}
              <div className="p-6 border-t border-white/10 dark:border-gray-700/20">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-ios-green to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption text-ios-gray dark:text-gray-400">Signed in as</p>
                    <p className="text-subhead font-medium text-gray-900 dark:text-gray-100 truncate">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center space-x-4 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-800/40 rounded-2xl w-full text-left transition-all duration-300 group"
                  >
                    <div className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-gray-200/70 dark:group-hover:bg-gray-600/70 transition-all duration-300">
                      {isDarkMode ? (
                        <Sun className="w-5 h-5" />
                      ) : (
                        <Moon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-callout font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <NavItem to="/settings" icon={Settings} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
                  <NavItem to="/profile" icon={User} label="Profile" onClick={() => setIsMobileMenuOpen(false)} />
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-4 px-4 py-3 text-ios-red dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl w-full text-left transition-all duration-300 group"
                  >
                    <div className="p-2 rounded-xl bg-red-100/50 dark:bg-red-950/50 group-hover:bg-red-200/70 dark:group-hover:bg-red-900/70 transition-all duration-300">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="text-callout font-medium">Log out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-auto pb-20 lg:pb-0">
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

        {/* Mobile Tab Bar */}
        <MobileTabBar />
      </div>
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