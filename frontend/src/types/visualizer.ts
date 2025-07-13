export interface VisualizerSettings {
  bars: {
    frequencyRange: {
      min: number;
      max: number;
    };
    barHeight: {
      multiplier: number; // Čím sa násobí veľkosť stĺpca
      minHeight: number;  // Minimálna výška stĺpca
      maxHeight: number;  // Maximálna výška stĺpca
      logarithmic: boolean; // Použiť logaritmické škálovanie
    };
    position: {
      startX: number;  // Počiatočná X pozícia (%)
      endX: number;    // Koncová X pozícia (%)
      startY?: number;  // Počiatočná Y pozícia (%) - voliteľné
      endY?: number;    // Koncová Y pozícia (%) - voliteľné
    };
    renderStyle: {
      type: 'bars' | 'dots' | 'lines'; // Typ znázornenia
      direction: 'up' | 'down' | 'both'; // Smer rastu
    };
    colors: {
      primary: string;
      secondary: string;
      gradient: boolean;
    };
    barWidth: number;
    gap: number;
    fftSize: number; // Počet reálnych stĺpcov (musí byť 2^n: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384)
    smoothing: {
      neighborSmoothing: number; // 0-10, počet susedných stĺpcov na priemerovanie
      temporalSmoothing: number; // 0-1, vyhladzovanie s predchádzajúcou hodnotou
    };
    fallingBars: {
      enabled: boolean; // Zapnutie/vypnutie falling bars efektu
      gravity: number; // 0.1-1, rýchlosť padania (gravitácia)
      peak: boolean; // Zobrazenie peak hodnôt
    };
  };
  waveform: {
    frequencyRange: {
      min: number;
      max: number;
    };
    amplitude: {
      min: number;
      max: number;
    };
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    colors: {
      lineColor: string;
      backgroundColor: string;
      fillGradient: boolean;
    };
    lineWidth: number;
    smoothing: number;
  };
  circle: {
    frequencyRange: {
      min: number;
      max: number;
    };
    radius: {
      min: number;
      max: number;
    };
    position: {
      centerX: number;
      centerY: number;
    };
    colors: {
      useSpectrum: boolean;
      customColors: string[];
      saturation: number;
      brightness: number;
    };
    pointSize: number;
    rotationSpeed: number;
  };
  background: {
    frequencyRange: {
      min: number;
      max: number;
    };
    sensitivity: number;
    colors: {
      baseColor: string;
      accentColor: string;
      blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
    };
    effect: 'solid' | 'gradient' | 'pulse' | 'wave';
    intensity: number;
  };
}

export type VisualizerMode = 'bars' | 'waveform' | 'circle' | 'background';

export const defaultSettings: VisualizerSettings = {
  bars: {
    frequencyRange: { min: 0, max: 10000 },
    barHeight: { 
      multiplier: 2, 
      minHeight: 1, 
      maxHeight: 4000,
      logarithmic: false
    },
    position: { startX: 0, endX: 100 },
    renderStyle: { type: 'bars', direction: 'up' },
    colors: { primary: '#ff3232', secondary: '#ff6666', gradient: false },
    barWidth: 4,
    gap: 2,
    fftSize: 2048,
    smoothing: {
      neighborSmoothing: 1,
      temporalSmoothing: 0.7
    },
    fallingBars: {
      enabled: false,
      gravity: 0.3,
      peak: true
    }
  },
  waveform: {
    frequencyRange: { min: 0, max: 10000 },
    amplitude: { min: 0, max: 200 },
    position: { x: 0, y: 50, width: 100, height: 50 },
    colors: { lineColor: '#00ff00', backgroundColor: '#000000', fillGradient: false },
    lineWidth: 2,
    smoothing: 0.7
  },
  circle: {
    frequencyRange: { min: 0, max: 10000 },
    radius: { min: 100, max: 300 },
    position: { centerX: 50, centerY: 50 },
    colors: { useSpectrum: true, customColors: ['#ff0000', '#00ff00', '#0000ff'], saturation: 100, brightness: 50 },
    pointSize: 2,
    rotationSpeed: 0
  },
  background: {
    frequencyRange: { min: 0, max: 5000 },
    sensitivity: 1,
    colors: { baseColor: '#000000', accentColor: '#ff0000', blendMode: 'normal' },
    effect: 'solid',
    intensity: 0.5
  }
};
