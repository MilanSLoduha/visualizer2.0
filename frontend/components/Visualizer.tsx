'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  audioElement: HTMLAudioElement | null;
  mode: 'bars' | 'waveform' | 'circle' | 'background';
  isPlaying: boolean;
};

export function Visualizer({ audioElement, mode, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Dynamická veľkosť plátna podľa veľkosti okna
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight, // môžeš upraviť podľa potreby
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const initAudio = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const audioCtx = audioContextRef.current;

        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        if (!analyserRef.current && !sourceRef.current) {
          sourceRef.current = audioCtx.createMediaElementSource(audioElement);
          analyserRef.current = audioCtx.createAnalyser();
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioCtx.destination);
          analyserRef.current.fftSize = 4096;
        }
      } catch (error) {
        console.error('Audio context error:', error);
      }
    };

    initAudio();
  }, [audioElement]);

  useEffect(() => {
    if (isPlaying && analyserRef.current) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => stopAnimation();
  }, [isPlaying, mode]);

  const startAnimation = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function animate() {
      if (!isPlaying) return;

      analyser.getByteFrequencyData(dataArray);
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === 'bars') {
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i] * dataArray[i] / 80;
          ctx!.fillStyle = 'rgb(255, 50, 50)';
          ctx!.fillRect(x, canvas.height - barHeight / 2 - 10, barWidth, barHeight / 2);
          x += barWidth + 1;
        }
      } else if (mode === 'waveform') {
        analyser.getByteTimeDomainData(dataArray);
        ctx!.beginPath();
        ctx!.lineWidth = 2;
        ctx!.strokeStyle = 'lime';
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const y = (dataArray[i] / 128.0) * canvas.height / 2;
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
          x += sliceWidth;
        }
        ctx!.stroke();
      } else if (mode === 'circle') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        for (let i = 0; i < bufferLength; i++) {
          const angle = (i / bufferLength) * 2 * Math.PI;
          const r = radius + dataArray[i] / 4;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          ctx!.fillStyle = `hsl(${(i * 360) / bufferLength}, 100%, 50%)`;
          ctx!.fillRect(x, y, 2, 2);
        }
      } else if (mode === 'background') {
        const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const color = `rgb(${avg + 50}, ${100 - avg}, ${200 - avg})`;
        canvas.style.backgroundColor = color;
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full border border-white"
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <svg className="mx-auto h-8 w-8 mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <p className="text-sm opacity-75">Stlačte play pre spustenie</p>
          </div>
        </div>
      )}
    </div>
  );
}
