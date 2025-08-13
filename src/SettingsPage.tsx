import { useState } from 'react';
import { Bell, Clock, Volume2, Palette, Shield, Save, Check } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

const SettingsPage = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [saved, setSaved] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    // Focus settings
    defaultFocusTime: 25,
    defaultBreakTime: 5,
    longBreakTime: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    
    // Notifications
    enableNotifications: true,
    soundEnabled: true,
    volume: 50,
    desktopNotifications: false,
    
    // Appearance
    theme: isDarkMode ? 'dark' : 'light',
    accentColor: '#10B981',
    fontScale: 100,
    
    // Privacy
    analyticsEnabled: true,
    shareProgressPublicly: false,
  });

  const handleSave = () => {
    // Here you would typically save to backend or localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = (theme: string) => {
    if (theme === 'dark' && !isDarkMode) {
      toggleDarkMode();
    } else if (theme === 'light' && isDarkMode) {
      toggleDarkMode();
    }
    setSettings({ ...settings, theme });
  };

  const accentColors = [
    { name: 'Green', value: '#10B981' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F97316' },
  ];

  return (
    <div className="flex-1 flex flex-col p-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Customize your focus timer experience</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Focus Timer Settings */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Focus Timer</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Focus Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.defaultFocusTime}
                    onChange={(e) => setSettings({ ...settings, defaultFocusTime: parseInt(e.target.value) })}
                    min="1"
                    max="120"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Break Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.defaultBreakTime}
                    onChange={(e) => setSettings({ ...settings, defaultBreakTime: parseInt(e.target.value) })}
                    min="1"
                    max="30"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Long Break Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakTime}
                    onChange={(e) => setSettings({ ...settings, longBreakTime: parseInt(e.target.value) })}
                    min="5"
                    max="60"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sessions Before Long Break
                  </label>
                  <input
                    type="number"
                    value={settings.sessionsBeforeLongBreak}
                    onChange={(e) => setSettings({ ...settings, sessionsBeforeLongBreak: parseInt(e.target.value) })}
                    min="2"
                    max="10"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto-start breaks</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => setSettings({ ...settings, autoStartPomodoros: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto-start focus sessions</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="w-4 h-4 text-green-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable notifications</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                  className="w-4 h-4 text-green-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sound notifications</span>
              </label>
              
              <div className="flex items-center space-x-3">
                <Volume2 className="w-4 h-4 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => setSettings({ ...settings, volume: parseInt(e.target.value) })}
                  className="flex-1"
                  disabled={!settings.soundEnabled}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{settings.volume}%</span>
              </div>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.desktopNotifications}
                  onChange={(e) => setSettings({ ...settings, desktopNotifications: e.target.checked })}
                  className="w-4 h-4 text-green-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Desktop notifications</span>
              </label>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Palette className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      settings.theme === 'light'
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      settings.theme === 'dark'
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange('auto')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      settings.theme === 'auto'
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    System
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accent Color</label>
                <div className="flex space-x-2">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSettings({ ...settings, accentColor: color.value })}
                      className={`w-10 h-10 rounded-lg border-2 ${
                        settings.accentColor === color.value
                          ? 'border-gray-900 dark:border-gray-100'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Font Scale
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="80"
                    max="120"
                    value={settings.fontScale}
                    onChange={(e) => setSettings({ ...settings, fontScale: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{settings.fontScale}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Privacy</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.analyticsEnabled}
                  onChange={(e) => setSettings({ ...settings, analyticsEnabled: e.target.checked })}
                  className="w-4 h-4 text-green-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                />
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Usage analytics</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Help us improve by sharing anonymous usage data</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.shareProgressPublicly}
                  onChange={(e) => setSettings({ ...settings, shareProgressPublicly: e.target.checked })}
                  className="w-4 h-4 text-green-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                />
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Public profile</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Share your progress publicly on your profile</p>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;