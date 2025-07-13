'use client';

import { useEffect, useState, useRef } from 'react';
import { Visualizer } from '@/../components/Visualizer';
import { VisualizerSettingsPanel } from '@/../components/VisualizerSettingsPanel';
import { VisualizerSettings, VisualizerMode, defaultSettings } from '@/types/visualizer';
import Link from 'next/link';

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const [settings, setSettings] = useState<VisualizerSettings>(defaultSettings);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioFile]);

  // Klávesové ovládanie
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Zabráň default akcii len ak sú to naše klávesy
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case 'Space':
          handlePlayPause();
          break;
        case 'ArrowLeft':
          handleSeekBy(-10); // Posun o 10 sekúnd dozadu
          break;
        case 'ArrowRight':
          handleSeekBy(10); // Posun o 10 sekúnd dopredu
          break;
        case 'ArrowUp':
          handleVolumeChange(volume + 0.1); // Zvýš hlasitosť o 10%
          break;
        case 'ArrowDown':
          handleVolumeChange(volume - 0.1); // Zníž hlasitosť o 10%
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, duration]); // Závislosti pre správne fungovanie

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

  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  };

  const handleSeekBy = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleBackgroundImageChange = (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundImage(url);
    } else {
      setBackgroundImage(null);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Ľavý bočný panel s nastaveniami */}
      <VisualizerSettingsPanel
        mode={mode}
        settings={settings}
        onSettingsChange={setSettings}
        onModeChange={setMode}
        onBackgroundImageChange={handleBackgroundImageChange}
      />

      {/* Hlavná oblasť s vizualizérom */}
      <div className="flex-1 flex flex-col">
        {/* Oblasť vizualizácie */}
        <div className="flex-1 bg-black relative" style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          {backgroundImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          )}
          {audioUrl ? (
            <>
              <audio 
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onVolumeChange={() => {
                  if (audioRef.current) {
                    setVolume(audioRef.current.volume);
                  }
                }}
                className="hidden"
              />
              
              <Visualizer 
                audioElement={audioRef.current}
                mode={mode}
                isPlaying={isPlaying}
                settings={settings}
                backgroundImage={backgroundImage}
              />
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="mx-auto h-16 w-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                </svg>
                <h2 className="text-2xl font-semibold mb-2">Nahrajte audio súbor</h2>
                <p className="text-gray-400 mb-6">Podporované formáty: MP3, WAV, OGG</p>
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <p><kbd className="px-1 py-0.5 bg-gray-700 rounded text-white">Medzerník</kbd> - Play/Pause</p>
                  <p><kbd className="px-1 py-0.5 bg-gray-700 rounded text-white">←→</kbd> - Posun o 10s</p>
                  <p><kbd className="px-1 py-0.5 bg-gray-700 rounded text-white">↑↓</kbd> - Hlasitosť</p>
                </div>
                <label className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                  Vybrať súbor
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}