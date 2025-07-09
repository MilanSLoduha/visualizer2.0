'use client';

import { useEffect, useState, useRef } from 'react';
import { Visualizer } from '@/../components/Visualizer'
import Link from 'next/link'

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'bars' | 'waveform' | 'circle' | 'background'>('bars');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioFile]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">
                Audio Vizualizér
              </h1>
            </div>
            
            <Link 
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Prihlásiť sa
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Audio Visualizer
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Nahrajte váš obľúbený song a sledujte interaktívnu vizualizáciu hudby v reálnom čase.
            </p>
          </div>

          {/* File Upload Card */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-6 py-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Nahrajte audio súbor</h2>
                <p className="text-gray-600">Podporované formáty: MP3, WAV, OGG</p>
              </div>

              <label className="group relative block cursor-pointer">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 transition-colors group-hover:border-gray-400">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                    </svg>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {audioFile ? `✓ ${audioFile.name}` : 'Kliknite alebo pretiahnite súbor'}
                    </p>
                    <p className="text-xs text-gray-500">Maximálna veľkosť: 50MB</p>
                  </div>
                </div>
              </label>

              {/* Mode Selection */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Typ vizualizácie
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {([
                    { value: 'bars', label: 'Stĺpce', emoji: '📊' },
                    { value: 'waveform', label: 'Waveform', emoji: '〰️' },
                    { value: 'circle', label: 'Kruhové', emoji: '⭕' },
                    { value: 'background', label: 'Pozadie', emoji: '🌈' }
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMode(option.value)}
                      className={`flex flex-col items-center justify-center rounded-lg border px-3 py-4 text-sm font-medium transition-colors ${
                        mode === option.value
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg mb-1">{option.emoji}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visualizer & Controls */}
          {audioUrl && (
            <div className="space-y-6">
              
              {/* Main Audio Element (kontroluje všetko) */}
              <audio 
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />

              {/* Visualizer */}
              <div className="overflow-visible rounded-lg bg-white shadow">
                <div className="bg-black p-4">
                  <Visualizer 
                    audioElement={audioRef.current}
                    mode={mode}
                    isPlaying={isPlaying}
                  />
                </div>
              </div>

              {/* Controls Card */}
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-6 py-6">
                  
                  {/* Play Controls */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <button
                      onClick={handlePlayPause}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {isPlaying ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                    
                    <button
                      onClick={handleStop}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h12v12H6z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-gray-900 font-medium">
                        {audioFile?.name || 'Unknown Track'}
                      </span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-4 flex items-center justify-center">
                    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      isPlaying 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className={`mr-1.5 h-2 w-2 rounded-full ${
                        isPlaying ? 'bg-green-400' : 'bg-gray-400'
                      }`}></div>
                      {isPlaying ? 'Prehráva sa' : 'Pozastavené'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="rounded-lg bg-blue-50 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Ako používať Audio Visualizer
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Nahrajte audio súbor vo formáte MP3, WAV alebo OGG a vyberte si jeden zo štyroch režimov vizualizácie. 
                    Hudba sa zobrazí v reálnom čase pomocí Web Audio API.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}