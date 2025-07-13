'use client';

import { useEffect, useRef, useState } from 'react';
import { VisualizerSettings, VisualizerMode } from '@/types/visualizer';

type Props = {
  audioElement: HTMLAudioElement | null;
  mode: VisualizerMode;
  isPlaying: boolean;
  settings: VisualizerSettings;
  backgroundImage?: string | null;
};

export function Visualizer({ audioElement, mode, isPlaying, settings, backgroundImage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const previousBarHeights = useRef<number[]>([]);
  const fallingBarHeights = useRef<number[]>([]);
  const peakHeights = useRef<number[]>([]);
  const peakTimers = useRef<number[]>([]);

  // Dynamická veľkosť plátna podľa veľkosti kontajnera
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
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
          console.log('Created new AudioContext');
        }

        const audioCtx = audioContextRef.current;
        console.log('AudioContext state:', audioCtx.state);

        if (audioCtx.state === 'suspended') {
          console.log('Resuming suspended AudioContext...');
          await audioCtx.resume();
          console.log('AudioContext resumed, new state:', audioCtx.state);
        }

        if (!analyserRef.current && !sourceRef.current) {
          console.log('Creating audio source and analyser...');
          sourceRef.current = audioCtx.createMediaElementSource(audioElement);
          analyserRef.current = audioCtx.createAnalyser();
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioCtx.destination);
          analyserRef.current.fftSize = settings.bars.fftSize;
          console.log('Audio setup complete with fftSize:', settings.bars.fftSize);
        } else if (analyserRef.current) {
          // Aktualizuj FFT size ak sa zmenil
          analyserRef.current.fftSize = settings.bars.fftSize;
          console.log('Updated fftSize to:', settings.bars.fftSize);
        }
      } catch (error) {
        console.error('Audio context error:', error);
      }
    };

    initAudio();
  }, [audioElement, settings.bars.fftSize]);

  useEffect(() => {
    console.log('Visualizer effect triggered:', { 
      isPlaying, 
      mode, 
      hasAnalyser: !!analyserRef.current,
      hasAudioElement: !!audioElement 
    });
    
    if (isPlaying && analyserRef.current) {
      console.log('Starting animation...');
      startAnimation();
    } else {
      console.log('Stopping animation...');
      stopAnimation();
    }

    return () => stopAnimation();
  }, [isPlaying, mode, settings]);

  const startAnimation = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function animate() {
      if (!isPlaying) {
        console.log('Animation stopped - isPlaying is false');
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === 'bars') {
        const barSettings = settings.bars;
        
        // Nové pozičné výpočty
        const startX = canvas.width * (barSettings.position.startX / 100);
        const endX = canvas.width * (barSettings.position.endX / 100);
        const startY = canvas.height * ((barSettings.position.startY ?? 0) / 100);
        const endY = canvas.height * ((barSettings.position.endY ?? 100) / 100);
        
        const canvasWidth = Math.abs(endX - startX);
        const canvasHeight = Math.abs(endY - startY);
        
        const barWidth = barSettings.barWidth;
        const gap = barSettings.gap;
        
        // Počet reálnych stĺpcov z FFT - toto je skutočný počet frekvenčných pásiem
        const realBarsCount = analyser.frequencyBinCount; // Toto už je fftSize / 2
        
        // Filtrovanie frekvenčného rozsahu
        const nyquist = audioContextRef.current?.sampleRate ? audioContextRef.current.sampleRate / 2 : 24000; // Zvýšené z 22050
        const minFreqIndex = Math.floor((barSettings.frequencyRange.min / nyquist) * realBarsCount);
        const maxFreqIndex = Math.floor((barSettings.frequencyRange.max / nyquist) * realBarsCount);
        
        // Získanie dát len z požadovaného frekvenčného rozsahu
        const startIndex = Math.max(0, minFreqIndex);
        const endIndex = Math.min(maxFreqIndex, realBarsCount);
        const frequencyData = dataArray.slice(startIndex, endIndex);
        
        // Výpočet koľko stĺpcov sa zmestí na obrazovku
        const maxDisplayBars = Math.floor(canvasWidth / (barWidth + gap));
        const actualBarsToShow = Math.min(maxDisplayBars, frequencyData.length);
        
        // Debug informácie (môžete odstrániť neskôr)
        if (Math.random() < 0.02) { // Znížené logovanie
          console.log('Canvas Debug:', {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            availableHeight: Math.abs(endY - startY),
            canvasHeightScale: Math.max(canvasHeight / 2, 200)
          });
          console.log('Audio Data Debug:', {
            isPlaying: isPlaying,
            maxValue: Math.max(...dataArray),
            frequencyDataLength: frequencyData.length,
            actualBarsToShow: actualBarsToShow,
            multiplier: barSettings.barHeight.multiplier
          });
        }
        
        // Vytvorenie novej sady výšok stĺpcov
        const newBarHeights: number[] = [];
        
        // Pridanie reálnych stĺpcov
        for (let i = 0; i < actualBarsToShow; i++) {
          // Získaj základnú hodnotu (0-1)
          let normalizedValue = frequencyData[i] / 255;
          
          // Kvadratické škálovanie - nízke hodnoty budú ešte nižšie, vysoké výrazne vyššie
          normalizedValue = normalizedValue * normalizedValue; // na druhú
          
          // Vynásob multiplier a škáluj na pixely - použij výška canvasu namiesto hardkódovanej hodnoty
          const canvasHeightScale = Math.max(canvasHeight / 2, 200); // Minimálne 200 pre škálovanie
          let rawHeight = normalizedValue * barSettings.barHeight.multiplier * canvasHeightScale;
          
          // Threshold - hodnoty pod 5 pixelov nastav na 0
          if (rawHeight < 5) {
            rawHeight = 0;
          }
          
          // Debug pre prvé pár stĺpcov
          if (i < 3 && Math.random() < 0.02) {
            console.log(`Bar ${i}: freq=${frequencyData[i]} → height=${rawHeight.toFixed(1)}px`);
          }
          
          // Logaritmické škálovanie (dodatočné, ak je zapnuté)
          if (barSettings.barHeight.logarithmic && rawHeight > 0) {
            rawHeight = rawHeight * Math.log10(rawHeight + 1);
          }
          
          // Aplikácia limitov
          rawHeight = Math.max(barSettings.barHeight.minHeight, Math.min(barSettings.barHeight.maxHeight, rawHeight));
          
          // Debug finálnej výšky - znížené logovanie
          if (i < 3 && Math.random() < 0.01) {
            console.log(`Bar ${i} final: ${rawHeight.toFixed(1)}px`);
          }
          
          newBarHeights.push(rawHeight);
        }
        
        // Susedné vyhladzovanie - pridanie interpolovaných stĺpcov medzi reálne
        if (barSettings.smoothing.neighborSmoothing > 0) {
          const smoothedHeights: number[] = [];
          
          for (let i = 0; i < newBarHeights.length; i++) {
            // Pridaj reálny stĺpec
            smoothedHeights.push(newBarHeights[i]);
            
            // Pridaj vyhladzovacie stĺpce medzi aktuálny a ďalší (ak existuje)
            if (i < newBarHeights.length - 1) {
              const currentHeight = newBarHeights[i];
              const nextHeight = newBarHeights[i + 1];
              
              // Pridaj určitý počet interpolovaných stĺpcov
              const interpolationSteps = Math.min(barSettings.smoothing.neighborSmoothing, 5); // Max 5 aby sa to nepretiahlo
              
              for (let j = 1; j <= interpolationSteps; j++) {
                const ratio = j / (interpolationSteps + 1);
                const interpolatedHeight = currentHeight + (nextHeight - currentHeight) * ratio;
                smoothedHeights.push(interpolatedHeight);
              }
            }
          }
          
          // Skontroluj či sa všetky zmestia na obrazovku
          const maxBarsWithSmoothing = Math.floor(canvasWidth / (barWidth + gap));
          if (smoothedHeights.length > maxBarsWithSmoothing) {
            smoothedHeights.splice(maxBarsWithSmoothing);
          }
          
          newBarHeights.splice(0, newBarHeights.length, ...smoothedHeights);
        }
        
        // Časové vyhladzovanie s predchádzajúcimi hodnotami
        if (barSettings.smoothing.temporalSmoothing > 0 && previousBarHeights.current.length === newBarHeights.length) {
          for (let i = 0; i < newBarHeights.length; i++) {
            newBarHeights[i] = previousBarHeights.current[i] * barSettings.smoothing.temporalSmoothing + 
                               newBarHeights[i] * (1 - barSettings.smoothing.temporalSmoothing);
          }
        }
        
        // Uloženie pre ďalší frame
        previousBarHeights.current = [...newBarHeights];
        
        // Falling bars logika
        let finalBarHeights = newBarHeights;
        if (barSettings.fallingBars.enabled) {
          // Inicializácia arrays ak sú prázdne alebo sa zmenila dĺžka
          if (fallingBarHeights.current.length !== newBarHeights.length) {
            fallingBarHeights.current = [...newBarHeights];
            peakHeights.current = [...newBarHeights];
            peakTimers.current = new Array(newBarHeights.length).fill(0);
          }
          
          for (let i = 0; i < newBarHeights.length; i++) {
            const currentHeight = newBarHeights[i];
            const fallingHeight = fallingBarHeights.current[i];
            
            // Ak je nová hodnota vyššia, okamžite ju nastaviť
            if (currentHeight > fallingHeight) {
              fallingBarHeights.current[i] = currentHeight;
              // Aktualizuj peak ak je potreba
              if (currentHeight > peakHeights.current[i]) {
                peakHeights.current[i] = currentHeight;
                peakTimers.current[i] = 30; // Peak sa zobrazí 30 framov (cca 0.5s)
              }
            } else {
              // Nech stĺpec padá gravitáciou
              fallingBarHeights.current[i] = Math.max(
                currentHeight, 
                fallingHeight - (fallingHeight * barSettings.fallingBars.gravity * 0.1)
              );
            }
            
            // Aktualizuj peak timer
            if (peakTimers.current[i] > 0) {
              peakTimers.current[i]--;
            } else {
              // Peak timer vypršal, nech peak tiež pomaly padá
              peakHeights.current[i] = Math.max(
                fallingBarHeights.current[i],
                peakHeights.current[i] - (peakHeights.current[i] * barSettings.fallingBars.gravity * 0.05)
              );
            }
          }
          
          finalBarHeights = fallingBarHeights.current;
        }
        
        // Kreslenie podľa typu znázornenia a smeru
        if (barSettings.renderStyle.type === 'bars') {
          // Klasické stĺpce
          renderBars(ctx!, finalBarHeights, barSettings, startX, startY, endX, endY, canvasWidth, canvasHeight, barWidth, gap);
          
          // Kresli peak hodnoty ak sú zapnuté
          if (barSettings.fallingBars.enabled && barSettings.fallingBars.peak) {
            renderPeaks(ctx!, peakHeights.current, barSettings, startX, startY, endX, endY, canvasWidth, canvasHeight, barWidth, gap);
          }
        } else if (barSettings.renderStyle.type === 'dots') {
          // Bodky
          renderDots(ctx!, finalBarHeights, barSettings, startX, startY, endX, endY, canvasWidth, canvasHeight);
        } else if (barSettings.renderStyle.type === 'lines') {
          // Čiary
          renderLines(ctx!, finalBarHeights, barSettings, startX, startY, endX, endY, canvasWidth, canvasHeight);
        }
      } else if (mode === 'waveform') {
        const waveSettings = settings.waveform;
        const canvasWidth = canvas.width * (waveSettings.position.width / 100);
        const canvasHeight = canvas.height * (waveSettings.position.height / 100);
        const startX = canvas.width * (waveSettings.position.x / 100);
        const startY = canvas.height * (waveSettings.position.y / 100);
        
        analyser.getByteTimeDomainData(dataArray);
        ctx!.beginPath();
        ctx!.lineWidth = waveSettings.lineWidth;
        ctx!.strokeStyle = waveSettings.colors.lineColor;
        
        const sliceWidth = canvasWidth / bufferLength;
        let x = startX;
        
        for (let i = 0; i < bufferLength; i++) {
          const amplitude = (dataArray[i] / 128.0 - 1) * (waveSettings.amplitude.max - waveSettings.amplitude.min) / 2;
          const y = startY + canvasHeight / 2 + amplitude;
          
          if (i === 0) {
            ctx!.moveTo(x, y);
          } else {
            ctx!.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx!.stroke();
        
        if (waveSettings.colors.fillGradient) {
          const gradient = ctx!.createLinearGradient(0, startY, 0, startY + canvasHeight);
          gradient.addColorStop(0, waveSettings.colors.lineColor + '80');
          gradient.addColorStop(1, waveSettings.colors.backgroundColor);
          ctx!.fillStyle = gradient;
          ctx!.fill();
        }
      } else if (mode === 'circle') {
        const circleSettings = settings.circle;
        const centerX = canvas.width * (circleSettings.position.centerX / 100);
        const centerY = canvas.height * (circleSettings.position.centerY / 100);
        const baseRadius = circleSettings.radius.min;
        const maxRadius = circleSettings.radius.max;
        
        ctx!.save();
        ctx!.translate(centerX, centerY);
        if (circleSettings.rotationSpeed !== 0) {
          ctx!.rotate(Date.now() * circleSettings.rotationSpeed * 0.001);
        }
        
        for (let i = 0; i < bufferLength; i++) {
          const angle = (i / bufferLength) * 2 * Math.PI;
          const amplitude = dataArray[i] / 255;
          const radius = baseRadius + amplitude * (maxRadius - baseRadius);
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          
          if (circleSettings.colors.useSpectrum) {
            const hue = (i * 360) / bufferLength;
            ctx!.fillStyle = `hsl(${hue}, ${circleSettings.colors.saturation}%, ${circleSettings.colors.brightness}%)`;
          } else {
            const colorIndex = i % circleSettings.colors.customColors.length;
            ctx!.fillStyle = circleSettings.colors.customColors[colorIndex];
          }
          
          ctx!.fillRect(x - circleSettings.pointSize / 2, y - circleSettings.pointSize / 2, circleSettings.pointSize, circleSettings.pointSize);
        }
        
        ctx!.restore();
      } else if (mode === 'background') {
        const bgSettings = settings.background;
        const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const normalizedAvg = (avg / 255) * bgSettings.sensitivity * bgSettings.intensity;
        
        switch (bgSettings.effect) {
          case 'solid':
            const intensity = Math.min(255, normalizedAvg * 255);
            const baseColor = bgSettings.colors.baseColor;
            const accentColor = bgSettings.colors.accentColor;
            
            // Mix base and accent colors based on intensity
            const baseR = parseInt(baseColor.slice(1, 3), 16);
            const baseG = parseInt(baseColor.slice(3, 5), 16);
            const baseB = parseInt(baseColor.slice(5, 7), 16);
            const accentR = parseInt(accentColor.slice(1, 3), 16);
            const accentG = parseInt(accentColor.slice(3, 5), 16);
            const accentB = parseInt(accentColor.slice(5, 7), 16);
            
            const mixR = Math.floor(baseR + (accentR - baseR) * normalizedAvg);
            const mixG = Math.floor(baseG + (accentG - baseG) * normalizedAvg);
            const mixB = Math.floor(baseB + (accentB - baseB) * normalizedAvg);
            
            canvas.style.backgroundColor = `rgb(${mixR}, ${mixG}, ${mixB})`;
            break;
            
          case 'gradient':
            const gradient = ctx!.createRadialGradient(
              canvas.width / 2, canvas.height / 2, 0,
              canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
            );
            gradient.addColorStop(0, bgSettings.colors.accentColor + Math.floor(normalizedAvg * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, bgSettings.colors.baseColor);
            ctx!.fillStyle = gradient;
            ctx!.fillRect(0, 0, canvas.width, canvas.height);
            break;
            
          case 'pulse':
            const pulseIntensity = Math.sin(Date.now() * 0.01) * normalizedAvg;
            canvas.style.backgroundColor = bgSettings.colors.baseColor;
            ctx!.fillStyle = bgSettings.colors.accentColor + Math.floor(Math.abs(pulseIntensity) * 255).toString(16).padStart(2, '0');
            ctx!.fillRect(0, 0, canvas.width, canvas.height);
            break;
            
          case 'wave':
            canvas.style.backgroundColor = bgSettings.colors.baseColor;
            for (let x = 0; x < canvas.width; x += 10) {
              const waveHeight = Math.sin((x + Date.now() * 0.01) * 0.01) * normalizedAvg * canvas.height * 0.5;
              ctx!.fillStyle = bgSettings.colors.accentColor + '80';
              ctx!.fillRect(x, canvas.height / 2 - waveHeight / 2, 8, waveHeight);
            }
            break;
        }
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

  const handleCanvasClick = async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      console.log('Attempting to resume AudioContext from user interaction...');
      try {
        await audioContextRef.current.resume();
        console.log('AudioContext resumed successfully');
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    }
  };

  // Render funkcie pre rôzne typy znázornenia
  const renderBars = (ctx: CanvasRenderingContext2D, heights: number[], settings: any, startX: number, startY: number, endX: number, endY: number, canvasWidth: number, canvasHeight: number, barWidth: number, gap: number) => {
    const direction = settings.renderStyle.direction;
    const centerY = startY + (endY - startY) / 2;
    
    // Debug render info - znížené logovanie
    if (Math.random() < 0.01) {
      console.log('Render Debug:', {
        maxBarHeight: Math.max(...heights),
        avgBarHeight: heights.reduce((a, b) => a + b, 0) / heights.length,
        nonZeroBars: heights.filter(h => h > 0).length
      });
    }
    
    for (let i = 0; i < heights.length; i++) {
      const barHeight = heights[i];
      const x = startX + i * (barWidth + gap);
      
      if (direction === 'up') {
        // Stĺpce rastú nahor
        const y = endY - barHeight;
        const width = barWidth;
        const height = barHeight;
        
        if (settings.colors.gradient) {
          const gradient = ctx.createLinearGradient(0, y, 0, y + height);
          gradient.addColorStop(0, settings.colors.primary);
          gradient.addColorStop(1, settings.colors.secondary);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = settings.colors.primary;
        }
        
        ctx.fillRect(x, y, width, height);
        
      } else if (direction === 'down') {
        // Stĺpce rastú nadol
        const y = startY;
        const width = barWidth;
        const height = barHeight;
        
        if (settings.colors.gradient) {
          const gradient = ctx.createLinearGradient(0, y, 0, y + height);
          gradient.addColorStop(0, settings.colors.primary);
          gradient.addColorStop(1, settings.colors.secondary);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = settings.colors.primary;
        }
        
        ctx.fillRect(x, y, width, height);
        
      } else if (direction === 'both') {
        // Stĺpce rastú nahor aj nadol zo stredu
        const halfHeight = barHeight / 2;
        
        // Horná časť
        const yUp = centerY - halfHeight;
        const heightUp = halfHeight;
        
        // Dolná časť  
        const yDown = centerY;
        const heightDown = halfHeight;
        
        if (settings.colors.gradient) {
          // Gradient pre hornú časť
          const gradientUp = ctx.createLinearGradient(0, yUp, 0, yUp + heightUp);
          gradientUp.addColorStop(0, settings.colors.primary);
          gradientUp.addColorStop(1, settings.colors.secondary);
          
          // Gradient pre dolnú časť
          const gradientDown = ctx.createLinearGradient(0, yDown, 0, yDown + heightDown);
          gradientDown.addColorStop(0, settings.colors.secondary);
          gradientDown.addColorStop(1, settings.colors.primary);
          
          // Kresli hornú časť
          ctx.fillStyle = gradientUp;
          ctx.fillRect(x, yUp, barWidth, heightUp);
          
          // Kresli dolnú časť
          ctx.fillStyle = gradientDown;
          ctx.fillRect(x, yDown, barWidth, heightDown);
        } else {
          ctx.fillStyle = settings.colors.primary;
          // Kresli hornú časť
          ctx.fillRect(x, yUp, barWidth, heightUp);
          // Kresli dolnú časť
          ctx.fillRect(x, yDown, barWidth, heightDown);
        }
      }
    }
  };

  const renderDots = (ctx: CanvasRenderingContext2D, heights: number[], settings: any, startX: number, startY: number, endX: number, endY: number, canvasWidth: number, canvasHeight: number) => {
    const direction = settings.renderStyle.direction;
    const spacing = canvasWidth / heights.length;
    const centerY = startY + (endY - startY) / 2;
    
    ctx.fillStyle = settings.colors.primary;
    
    for (let i = 0; i < heights.length; i++) {
      const intensity = heights[i];
      const x = startX + i * spacing;
      const dotSize = Math.max(2, intensity / 20);
      
      if (direction === 'up') {
        const y = endY - intensity;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
        ctx.fill();
      } else if (direction === 'down') {
        const y = startY + intensity;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
        ctx.fill();
      } else if (direction === 'both') {
        // Bodka hore
        const yUp = centerY - intensity / 2;
        ctx.beginPath();
        ctx.arc(x, yUp, dotSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Bodka dole  
        const yDown = centerY + intensity / 2;
        ctx.beginPath();
        ctx.arc(x, yDown, dotSize, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  const renderLines = (ctx: CanvasRenderingContext2D, heights: number[], settings: any, startX: number, startY: number, endX: number, endY: number, canvasWidth: number, canvasHeight: number) => {
    const direction = settings.renderStyle.direction;
    const spacing = canvasWidth / heights.length;
    const centerY = startY + (endY - startY) / 2;
    
    ctx.strokeStyle = settings.colors.primary;
    ctx.lineWidth = 2;
    
    if (direction === 'up') {
      ctx.beginPath();
      for (let i = 0; i < heights.length; i++) {
        const intensity = heights[i];
        const x = startX + i * spacing;
        const y = endY - intensity;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
    } else if (direction === 'down') {
      ctx.beginPath();
      for (let i = 0; i < heights.length; i++) {
        const intensity = heights[i];
        const x = startX + i * spacing;
        const y = startY + intensity;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
    } else if (direction === 'both') {
      // Horná čiara
      ctx.beginPath();
      for (let i = 0; i < heights.length; i++) {
        const intensity = heights[i];
        const x = startX + i * spacing;
        const y = centerY - intensity / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      // Dolná čiara
      ctx.beginPath();
      for (let i = 0; i < heights.length; i++) {
        const intensity = heights[i];
        const x = startX + i * spacing;
        const y = centerY + intensity / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  };

  const renderPeaks = (ctx: CanvasRenderingContext2D, peakHeights: number[], settings: any, startX: number, startY: number, endX: number, endY: number, canvasWidth: number, canvasHeight: number, barWidth: number, gap: number) => {
    const direction = settings.renderStyle.direction;
    const centerY = startY + (endY - startY) / 2;
    
    ctx.strokeStyle = settings.colors.primary;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < peakHeights.length; i++) {
      const peakHeight = peakHeights[i];
      const x = startX + i * (barWidth + gap);
      
      if (direction === 'up') {
        // Peak čiarka na vrchole stĺpca
        const y = endY - peakHeight;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + barWidth, y);
        ctx.stroke();
        
      } else if (direction === 'down') {
        // Peak čiarka na spodku stĺpca
        const y = startY + peakHeight;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + barWidth, y);
        ctx.stroke();
        
      } else if (direction === 'both') {
        // Peak čiarky na oboch stranách
        const halfHeight = peakHeight / 2;
        
        // Horný peak
        const yUp = centerY - halfHeight;
        ctx.beginPath();
        ctx.moveTo(x, yUp);
        ctx.lineTo(x + barWidth, yUp);
        ctx.stroke();
        
        // Dolný peak
        const yDown = centerY + halfHeight;
        ctx.beginPath();
        ctx.moveTo(x, yDown);
        ctx.lineTo(x + barWidth, yDown);
        ctx.stroke();
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
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
