'use client';

import { useEffect, useRef } from 'react';

type Props = {
  src: string;
  mode: 'bars' | 'waveform' | 'circle' | 'background';
};

export function Visualizer({ src, mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.crossOrigin = 'anonymous';
    audio.play();

    const ctx = canvas?.getContext('2d');
    const audioCtx = new AudioContext();
    const srcNode = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    srcNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 4096;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function animate() {
      requestAnimationFrame(animate);
      analyser.getByteFrequencyData(dataArray);

      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === 'bars') {
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i] * dataArray[i] / 80;
          ctx.fillStyle = 'rgb(255, 50, 50)';
          ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
          x += barWidth + 1;
        }
      } else if (mode === 'waveform') {
        analyser.getByteTimeDomainData(dataArray);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'lime';
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const y = (dataArray[i] / 128.0) * canvas.height / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      } else if (mode === 'circle') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        for (let i = 0; i < bufferLength; i++) {
          const angle = (i / bufferLength) * 2 * Math.PI;
          const r = radius + dataArray[i] / 4;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          ctx.fillStyle = 'hsl(' + (i * 360 / bufferLength) + ', 100%, 50%)';
          ctx.fillRect(x, y, 2, 2);
        }
      } else if (mode === 'background') {
        const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const color = `rgb(${avg + 50}, ${100 - avg}, ${200 - avg})`;
        canvas.style.backgroundColor = color;
      }
    }

    animate();
  }, [src, mode]);

  return <canvas ref={canvasRef} width={1500} height={600} className="w-full border border-white" />;
}
