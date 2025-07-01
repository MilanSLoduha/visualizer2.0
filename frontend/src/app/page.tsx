'use client';

import { useEffect, useState } from 'react';
import { Visualizer } from '@/../components/Visualizer'
import Link from 'next/link'

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'bars' | 'waveform' | 'circle' | 'background'>('bars');

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
    }
  }, [audioFile]);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Audio Vizualizér</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
        className="mb-4 text-black"
      />

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as 'bars' | 'waveform' | 'circle' | 'background')}
        className="mb-4 p-2 text-black"
      >
        <option value="bars">Stĺpce</option>
        <option value="waveform">Waveform</option>
        <option value="circle">Kruhové spektrum</option>
        <option value="background">Reagujúce pozadie</option>
      </select>

      {audioUrl && <Visualizer src={audioUrl} mode={mode} />}
      <Link href="/login">Login</Link>
    </main>
  );
}