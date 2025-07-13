'use client';

import { VisualizerSettings, VisualizerMode } from '@/types/visualizer';

interface VisualizerSettingsProps {
  mode: VisualizerMode;
  settings: VisualizerSettings;
  onSettingsChange: (newSettings: VisualizerSettings) => void;
  onModeChange: (mode: VisualizerMode) => void;
  onBackgroundImageChange?: (file: File | null) => void;
  onBackgroundColorChange?: (color: string) => void;
}

export function VisualizerSettingsPanel({ mode, settings, onSettingsChange, onModeChange, onBackgroundImageChange, onBackgroundColorChange }: VisualizerSettingsProps) {
  const updateBarSettings = (key: keyof typeof settings.bars, value: any) => {
    const newSettings = {
      ...settings,
      bars: {
        ...settings.bars,
        [key]: value
      }
    };
    onSettingsChange(newSettings);
  };

  const updateWaveformSettings = (key: keyof typeof settings.waveform, value: any) => {
    const newSettings = {
      ...settings,
      waveform: {
        ...settings.waveform,
        [key]: value
      }
    };
    onSettingsChange(newSettings);
  };

  const updateCircleSettings = (key: keyof typeof settings.circle, value: any) => {
    const newSettings = {
      ...settings,
      circle: {
        ...settings.circle,
        [key]: value
      }
    };
    onSettingsChange(newSettings);
  };

  const updateBackgroundSettings = (key: keyof typeof settings.background, value: any) => {
    const newSettings = {
      ...settings,
      background: {
        ...settings.background,
        [key]: value
      }
    };
    onSettingsChange(newSettings);
  };

  const renderBackgroundControls = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pozadie</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Farba pozadia
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            defaultValue="#000000"
            onChange={(e) => onBackgroundColorChange?.(e.target.value)}
            className="w-10 h-10 rounded border border-gray-300"
          />
          <span className="text-sm text-gray-600">Predvolená farba</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Obrázok pozadia
        </label>
        <div className="space-y-2">
          <label className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onBackgroundImageChange?.(e.target.files?.[0] || null)}
              className="sr-only"
            />
            📷 Nahrať obrázok
          </label>
          <button
            onClick={() => onBackgroundImageChange?.(null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            🗑️ Odstrániť obrázok
          </button>
        </div>
      </div>
    </div>
  );

  const renderModeSelector = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Typ vizualizácie</h3>
      <div className="grid grid-cols-1 gap-2">
        {([
          { value: 'bars', label: 'Stĺpce', emoji: '📊' },
          { value: 'waveform', label: 'Waveform', emoji: '〰️' },
          { value: 'circle', label: 'Kruhové', emoji: '⭕' },
          { value: 'background', label: 'Pozadie', emoji: '🌈' }
        ] as const).map((option) => (
          <button
            key={option.value}
            onClick={() => onModeChange(option.value)}
            className={`flex items-center justify-start rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
              mode === option.value
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-3 text-lg">{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSlider = (label: string, value: number, min: number, max: number, step: number, onChange: (value: number) => void) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            if (newValue >= min && newValue <= max) {
              onChange(newValue);
            }
          }}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
        />
      </div>
    </div>
  );

  const renderColorInput = (label: string, value: string, onChange: (value: string) => void) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded border border-gray-300"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  );

  const renderRangeInputs = (label: string, minValue: number, maxValue: number, min: number, max: number, step: number, onChange: (min: number, max: number) => void) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Min: {minValue}</label>
          <div className="flex items-center space-x-1">
            <input
              type="range"
              min={min}
              max={Math.min(maxValue - step, max)}
              step={step}
              value={minValue}
              onChange={(e) => onChange(Number(e.target.value), maxValue)}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min={min}
              max={Math.min(maxValue - step, max)}
              step={step}
              value={minValue}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                if (newValue >= min && newValue <= Math.min(maxValue - step, max)) {
                  onChange(newValue, maxValue);
                }
              }}
              className="w-16 px-1 py-1 border border-gray-300 rounded text-xs text-center"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Max: {maxValue}</label>
          <div className="flex items-center space-x-1">
            <input
              type="range"
              min={Math.max(minValue + step, min)}
              max={max}
              step={step}
              value={maxValue}
              onChange={(e) => onChange(minValue, Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min={Math.max(minValue + step, min)}
              max={max}
              step={step}
              value={maxValue}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                if (newValue >= Math.max(minValue + step, min) && newValue <= max) {
                  onChange(minValue, newValue);
                }
              }}
              className="w-16 px-1 py-1 border border-gray-300 rounded text-xs text-center"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBarSettings = () => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-800">Nastavenia stĺpcov</h4>
      
      {renderRangeInputs(
        'Frekvenčný rozsah (Hz)',
        settings.bars.frequencyRange.min,
        settings.bars.frequencyRange.max,
        0, 20000, 10,
        (min, max) => updateBarSettings('frequencyRange', { min, max })
      )}

      {renderSlider(
        'Násobiteľ výšky',
        settings.bars.barHeight.multiplier,
        0.1, 10, 0.1,
        (value) => updateBarSettings('barHeight', { ...settings.bars.barHeight, multiplier: value })
      )}

      {renderSlider(
        'Minimálna výška stĺpca (px)',
        settings.bars.barHeight.minHeight,
        0, 50, 1,
        (value) => updateBarSettings('barHeight', { ...settings.bars.barHeight, minHeight: value })
      )}

      {renderSlider(
        'Maximálna výška stĺpca (px)',
        settings.bars.barHeight.maxHeight,
        50, 4000, 10,
        (value) => updateBarSettings('barHeight', { ...settings.bars.barHeight, maxHeight: value })
      )}

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.bars.barHeight.logarithmic}
            onChange={(e) => updateBarSettings('barHeight', { ...settings.bars.barHeight, logarithmic: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Logaritmické škálovanie</span>
        </label>
      </div>

      {renderSlider(
        'Šírka stĺpca (px)',
        settings.bars.barWidth,
        1, 50, 0.5,
        (value) => updateBarSettings('barWidth', value)
      )}

      {renderSlider(
        'Medzera medzi stĺpcami (px)',
        settings.bars.gap,
        0, 50, 0.5,
        (value) => updateBarSettings('gap', value)
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          FFT Veľkosť (počet reálnych stĺpcov): {settings.bars.fftSize}
        </label>
        <div className="text-xs text-gray-500 mb-2">
          Skutočný počet frekvenčných pásiem: {settings.bars.fftSize / 2}
        </div>
        <select
          value={settings.bars.fftSize}
          onChange={(e) => updateBarSettings('fftSize', Number(e.target.value))}
          className="w-full px-3 pr-10 py-2 border-2 border-gray-300 rounded-md text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 8px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '16px'
          }}
        >
          <option value={32}>32 (16 pásiem)</option>
          <option value={64}>64 (32 pásiem)</option>
          <option value={128}>128 (64 pásiem)</option>
          <option value={256}>256 (128 pásiem)</option>
          <option value={512}>512 (256 pásiem)</option>
          <option value={1024}>1024 (512 pásiem)</option>
          <option value={2048}>2048 (1024 pásiem)</option>
          <option value={4096}>4096 (2048 pásiem)</option>
          <option value={8192}>8192 (4096 pásiem)</option>
          <option value={16384}>16384 (8192 pásiem)</option>
        </select>
      </div>

      {renderSlider(
        'Susedné vyhladzovanie (počet stĺpcov)',
        settings.bars.smoothing.neighborSmoothing,
        0, 10, 1,
        (value) => updateBarSettings('smoothing', { ...settings.bars.smoothing, neighborSmoothing: value })
      )}

      {renderSlider(
        'Časové vyhladzovanie',
        settings.bars.smoothing.temporalSmoothing,
        0, 1, 0.1,
        (value) => updateBarSettings('smoothing', { ...settings.bars.smoothing, temporalSmoothing: value })
      )}

      {renderColorInput(
        'Primárna farba',
        settings.bars.colors.primary,
        (value) => updateBarSettings('colors', { ...settings.bars.colors, primary: value })
      )}

      {renderColorInput(
        'Sekundárna farba',
        settings.bars.colors.secondary,
        (value) => updateBarSettings('colors', { ...settings.bars.colors, secondary: value })
      )}

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.bars.colors.gradient}
            onChange={(e) => updateBarSettings('colors', { ...settings.bars.colors, gradient: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Použiť gradient</span>
        </label>
      </div>

      <h5 className="text-sm font-semibold text-gray-700 mt-6">Pozícia na obrazovke (%)</h5>
      {renderSlider(
        'Počiatočná X pozícia',
        settings.bars.position.startX,
        0, 100, 1,
        (value) => updateBarSettings('position', { ...settings.bars.position, startX: value })
      )}
      {renderSlider(
        'Koncová X pozícia',
        settings.bars.position.endX,
        0, 100, 1,
        (value) => updateBarSettings('position', { ...settings.bars.position, endX: value })
      )}
      {renderSlider(
        'Počiatočná Y pozícia',
        settings.bars.position.startY,
        0, 100, 1,
        (value) => updateBarSettings('position', { ...settings.bars.position, startY: value })
      )}
      {renderSlider(
        'Koncová Y pozícia',
        settings.bars.position.endY,
        0, 100, 1,
        (value) => updateBarSettings('position', { ...settings.bars.position, endY: value })
      )}

      <h5 className="text-sm font-semibold text-gray-700 mt-6">Štyl renderingu</h5>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Typ znázornenia
        </label>
        <select
          value={settings.bars.renderStyle.type}
          onChange={(e) => updateBarSettings('renderStyle', { ...settings.bars.renderStyle, type: e.target.value as 'bars' | 'dots' | 'lines' })}
          className="w-full px-3 pr-10 py-2 border-2 border-gray-300 rounded-md text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 8px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '16px'
          }}
        >
          <option value="bars">Stĺpce</option>
          <option value="dots">Bodky</option>
          <option value="lines">Čiary</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Smer rastu
        </label>
        <select
          value={settings.bars.renderStyle.direction}
          onChange={(e) => updateBarSettings('renderStyle', { ...settings.bars.renderStyle, direction: e.target.value as 'up' | 'down' | 'both' })}
          className="w-full px-3 pr-10 py-2 border-2 border-gray-300 rounded-md text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 8px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '16px'
          }}
        >
          <option value="up">Hore ↑</option>
          <option value="down">Dole ↓</option>
          <option value="both">Oboje ↕</option>
        </select>
      </div>

      <h5 className="text-sm font-semibold text-gray-700 mt-6">Falling Bars Efekt</h5>
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.bars.fallingBars.enabled}
            onChange={(e) => updateBarSettings('fallingBars', { ...settings.bars.fallingBars, enabled: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Zapnúť falling bars (gravitácia)</span>
        </label>
        <div className="text-xs text-gray-500 mt-1">
          Stĺpce budú pomaly padať dole keď zvuk ztíši
        </div>
      </div>

      {settings.bars.fallingBars.enabled && (
        <>
          {renderSlider(
            'Gravitácia (rýchlosť padania)',
            settings.bars.fallingBars.gravity,
            0.1, 1, 0.05,
            (value) => updateBarSettings('fallingBars', { ...settings.bars.fallingBars, gravity: value })
          )}

          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.bars.fallingBars.peak}
                onChange={(e) => updateBarSettings('fallingBars', { ...settings.bars.fallingBars, peak: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Zobraziť peak hodnoty</span>
            </label>
            <div className="text-xs text-gray-500 mt-1">
              Malé čiarky na vrchole stĺpcov pre maximálne hodnoty
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderWaveformSettings = () => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-800">Nastavenia waveform</h4>
      
      {renderRangeInputs(
        'Frekvenčný rozsah (Hz)',
        settings.waveform.frequencyRange.min,
        settings.waveform.frequencyRange.max,
        0, 20000, 10,
        (min, max) => updateWaveformSettings('frequencyRange', { min, max })
      )}

      {renderRangeInputs(
        'Amplitúda',
        settings.waveform.amplitude.min,
        settings.waveform.amplitude.max,
        0, 300, 5,
        (min, max) => updateWaveformSettings('amplitude', { min, max })
      )}

      {renderSlider(
        'Hrúbka čiary',
        settings.waveform.lineWidth,
        0.5, 10, 0.1,
        (value) => updateWaveformSettings('lineWidth', value)
      )}

      {renderSlider(
        'Vyhladenie',
        settings.waveform.smoothing,
        0, 1, 0.1,
        (value) => updateWaveformSettings('smoothing', value)
      )}

      {renderColorInput(
        'Farba čiary',
        settings.waveform.colors.lineColor,
        (value) => updateWaveformSettings('colors', { ...settings.waveform.colors, lineColor: value })
      )}

      {renderColorInput(
        'Farba pozadia',
        settings.waveform.colors.backgroundColor,
        (value) => updateWaveformSettings('colors', { ...settings.waveform.colors, backgroundColor: value })
      )}

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.waveform.colors.fillGradient}
            onChange={(e) => updateWaveformSettings('colors', { ...settings.waveform.colors, fillGradient: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Vyplniť gradientom</span>
        </label>
      </div>

      <h5 className="text-sm font-semibold text-gray-700 mt-6">Pozícia na obrazovke (%)</h5>
      {renderSlider(
        'X pozícia',
        settings.waveform.position.x,
        0, 100, 1,
        (value) => updateWaveformSettings('position', { ...settings.waveform.position, x: value })
      )}
      {renderSlider(
        'Y pozícia',
        settings.waveform.position.y,
        0, 100, 1,
        (value) => updateWaveformSettings('position', { ...settings.waveform.position, y: value })
      )}
      {renderSlider(
        'Šírka',
        settings.waveform.position.width,
        10, 100, 1,
        (value) => updateWaveformSettings('position', { ...settings.waveform.position, width: value })
      )}
      {renderSlider(
        'Výška',
        settings.waveform.position.height,
        10, 100, 1,
        (value) => updateWaveformSettings('position', { ...settings.waveform.position, height: value })
      )}
    </div>
  );

  const renderCircleSettings = () => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-800">Nastavenia kruhového módu</h4>
      
      {renderRangeInputs(
        'Frekvenčný rozsah (Hz)',
        settings.circle.frequencyRange.min,
        settings.circle.frequencyRange.max,
        0, 20000, 10,
        (min, max) => updateCircleSettings('frequencyRange', { min, max })
      )}

      {renderRangeInputs(
        'Polomer (px)',
        settings.circle.radius.min,
        settings.circle.radius.max,
        10, 500, 5,
        (min, max) => updateCircleSettings('radius', { min, max })
      )}

      {renderSlider(
        'Veľkosť bodov',
        settings.circle.pointSize,
        0.5, 10, 0.1,
        (value) => updateCircleSettings('pointSize', value)
      )}

      {renderSlider(
        'Rýchlosť rotácie',
        settings.circle.rotationSpeed,
        -5, 5, 0.1,
        (value) => updateCircleSettings('rotationSpeed', value)
      )}

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.circle.colors.useSpectrum}
            onChange={(e) => updateCircleSettings('colors', { ...settings.circle.colors, useSpectrum: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Použiť spektrum farieb</span>
        </label>
      </div>

      {renderSlider(
        'Sýtosť',
        settings.circle.colors.saturation,
        0, 100, 1,
        (value) => updateCircleSettings('colors', { ...settings.circle.colors, saturation: value })
      )}

      {renderSlider(
        'Jas',
        settings.circle.colors.brightness,
        0, 100, 1,
        (value) => updateCircleSettings('colors', { ...settings.circle.colors, brightness: value })
      )}

      <h5 className="text-sm font-semibold text-gray-700 mt-6">Pozícia stredu (%)</h5>
      {renderSlider(
        'Centrum X',
        settings.circle.position.centerX,
        0, 100, 1,
        (value) => updateCircleSettings('position', { ...settings.circle.position, centerX: value })
      )}
      {renderSlider(
        'Centrum Y',
        settings.circle.position.centerY,
        0, 100, 1,
        (value) => updateCircleSettings('position', { ...settings.circle.position, centerY: value })
      )}
    </div>
  );

  const renderBackgroundSettings = () => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-800">Nastavenia pozadia</h4>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Obrázok pozadia
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            if (onBackgroundImageChange) {
              onBackgroundImageChange(file);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
        />
      </div>
      
      {renderRangeInputs(
        'Frekvenčný rozsah (Hz)',
        settings.background.frequencyRange.min,
        settings.background.frequencyRange.max,
        0, 20000, 10,
        (min, max) => updateBackgroundSettings('frequencyRange', { min, max })
      )}

      {renderSlider(
        'Citlivosť',
        settings.background.sensitivity,
        0, 3, 0.1,
        (value) => updateBackgroundSettings('sensitivity', value)
      )}

      {renderSlider(
        'Intenzita',
        settings.background.intensity,
        0, 1, 0.1,
        (value) => updateBackgroundSettings('intensity', value)
      )}

      {renderColorInput(
        'Základná farba',
        settings.background.colors.baseColor,
        (value) => updateBackgroundSettings('colors', { ...settings.background.colors, baseColor: value })
      )}

      {renderColorInput(
        'Akcentová farba',
        settings.background.colors.accentColor,
        (value) => updateBackgroundSettings('colors', { ...settings.background.colors, accentColor: value })
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Režim miešania
        </label>
        <select
          value={settings.background.colors.blendMode}
          onChange={(e) => updateBackgroundSettings('colors', { ...settings.background.colors, blendMode: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="normal">Normálny</option>
          <option value="multiply">Násobenie</option>
          <option value="screen">Premietanie</option>
          <option value="overlay">Prekryv</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Efekt
        </label>
        <select
          value={settings.background.effect}
          onChange={(e) => updateBackgroundSettings('effect', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="solid">Plná farba</option>
          <option value="gradient">Gradient</option>
          <option value="pulse">Pulz</option>
          <option value="wave">Vlna</option>
        </select>
      </div>
    </div>
  );

  const renderCurrentModeSettings = () => {
    switch (mode) {
      case 'bars':
        return renderBarSettings();
      case 'waveform':
        return renderWaveformSettings();
      case 'circle':
        return renderCircleSettings();
      case 'background':
        return renderBackgroundSettings();
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200 h-screen flex flex-col">
      <div className="flex-1 p-6" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 20px)' }}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Nastavenia vizualizácie</h2>
        
        {renderBackgroundControls()}
        
        <hr className="my-6 border-gray-200" />
        
        {renderModeSelector()}
        
        <hr className="my-6 border-gray-200" />
        
        {renderCurrentModeSettings()}
      </div>
    </div>
  );
}
