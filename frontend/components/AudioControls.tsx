'use client';

import { useState, useEffect } from 'react';

interface AudioControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSeekBy: (seconds: number) => void;
}

export function AudioControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onSeekBy
}: AudioControlsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeFromPosition = (clientX: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    return percentage * duration;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const newTime = getTimeFromPosition(e.clientX, e.currentTarget);
    onSeek(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const newTime = getTimeFromPosition(e.clientX, e.currentTarget);
    setDragTime(newTime);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const progressBar = document.querySelector('.progress-bar') as HTMLDivElement;
    if (progressBar) {
      const newTime = getTimeFromPosition(e.clientX, progressBar);
      setDragTime(newTime);
      // Pretáčaj hudbu v reálnom čase počas ťahania
      onSeek(newTime);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragTime]);

  return (
    <div className="bg-white text-black p-6 border-t-2 border-gray-300">
      <div className="flex items-center space-x-6 max-w-6xl mx-auto">
        {/* Play/Pause tlačidlo */}
        <button
          onClick={onPlayPause}
          className="flex items-center justify-center w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg"
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Aktuálny čas */}
        <div className="text-xl min-w-[80px] font-mono font-bold mx-6 px-4 py-2" style={{color: '#000000'}}>
          {formatTime(isDragging ? dragTime : currentTime)}
        </div>

        {/* Progress bar */}
        <div className="flex-1 mx-8">
          <div 
            className="progress-bar relative h-5 bg-gray-200 rounded-full cursor-pointer group shadow-inner border border-gray-300"
            onClick={handleProgressClick}
            onMouseDown={handleMouseDown}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-150 shadow-md pointer-events-none border-2 border-blue-400"
              style={{ width: `${duration > 0 ? ((isDragging ? dragTime : currentTime) / duration) * 100 : 0}%` }}
            />
            <div 
              className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-3 border-blue-500 rounded-full transition-opacity shadow-lg ${isDragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'}`}
              style={{ left: `${duration > 0 ? ((isDragging ? dragTime : currentTime) / duration) * 100 : 0}%`, marginLeft: '-12px' }}
            />
          </div>
        </div>

        {/* Celková dĺžka */}
        <div className="text-xl min-w-[80px] font-mono font-bold mx-6 px-4 py-2" style={{color: '#000000'}}>
          {formatTime(duration)}
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 1)}
            className="text-black hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded p-1"
          >
            {volume === 0 ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : volume < 0.5 ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          
          <div className="w-32">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer slider shadow-inner border border-gray-300"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>
          
          <span className="text-lg min-w-[50px] font-bold" style={{color: '#000000'}}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
