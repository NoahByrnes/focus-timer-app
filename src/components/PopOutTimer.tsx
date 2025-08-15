import React, { useState, useEffect } from 'react';
import { Play, Pause, Minimize2, Move } from 'lucide-react';

interface PopOutTimerProps {
  isActive: boolean;
  onClose: () => void;
  timeDisplay: string;
  isRunning: boolean;
  isBreakTime: boolean;
  taskName?: string;
  onPlayPause: () => void;
}

export const PopOutTimer: React.FC<PopOutTimerProps> = ({
  isActive,
  onClose,
  timeDisplay,
  isRunning,
  isBreakTime,
  taskName,
  onPlayPause,
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 360, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 320;
      const maxY = window.innerHeight - 200;
      
      setPosition({
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!isActive) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  return (
    <div
      className="fixed z-[200] shadow-2xl rounded-2xl overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '320px',
      }}
    >
      {/* Header/Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-3 cursor-move flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <Move className="w-4 h-4 text-white/70" />
          <span className="text-sm font-medium text-white">Focus Timer</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Minimize2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Timer Content */}
      <div className="bg-white dark:bg-gray-900 p-6">
        {/* Timer Display */}
        <div className="text-center mb-4">
          <div className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-2">
            {timeDisplay}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isBreakTime ? 'Break Time' : 'Focus Time'}
          </div>
          {taskName && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate px-2">
              {taskName}
            </div>
          )}
        </div>

        {/* Control Button */}
        <button
          onClick={onPlayPause}
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center space-x-2 ${
            isRunning
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Resume</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};