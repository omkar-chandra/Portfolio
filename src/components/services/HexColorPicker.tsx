import React, { FC, useState, useEffect, useMemo } from 'react';

interface HexColorPickerProps {
  label?: string;
  value?: string | null;
  onChange: (color: string) => void;
  presetColors?: string[];
  className?: string;
  defaultValue?: string;
}

const DEFAULT_PRESETS = [
  '#B3E32B', // Signature Lime Green
  '#FFFFFF', // Pure White
  '#00D2FF', // Electric Cyan
  '#FF4655', // Crimson Coral
  '#FFB703', // Amber Gold
  '#A855F7', // Vivid Purple
  '#94A3B8', // Cool Slate
  '#111827', // Deep Obsidian
];

// Utility: normalize any string to #RRGGBB format
function normalizeHex(val?: string | null): string {
  if (!val) return '#B3E32B';
  let hex = val.trim();
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
    const match = hex.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0], 10).toString(16).padStart(2, '0');
      const g = parseInt(match[1], 10).toString(16).padStart(2, '0');
      const b = parseInt(match[2], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    }
    return '#B3E32B';
  }
  if (!hex.startsWith('#')) hex = `#${hex}`;
  if (hex.length === 4) {
    // Expand 3-digit hex #RGB -> #RRGGBB
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toUpperCase();
  }
  return hex.toUpperCase().slice(0, 7);
}

// Convert Hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = normalizeHex(hex).replace('#', '');
  if (clean.length !== 6) return { h: 76, s: 78, l: 52 };
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = Math.round(h * 60);
  }

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export const HexColorPicker: FC<HexColorPickerProps> = ({
  label,
  value,
  onChange,
  presetColors = DEFAULT_PRESETS,
  className = '',
  defaultValue,
}) => {
  const currentHex = useMemo(() => normalizeHex(value), [value]);
  const [textInput, setTextInput] = useState(currentHex);
  const [isValid, setIsValid] = useState(true);

  // Sync internal text state with external value changes
  useEffect(() => {
    setTextInput(currentHex);
    setIsValid(true);
  }, [currentHex]);

  // Derive Hue from current hex
  const hsl = useMemo(() => hexToHsl(currentHex), [currentHex]);

  // Handle direct text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setTextInput(val);

    const validHexPattern = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
    if (validHexPattern.test(val)) {
      setIsValid(true);
      onChange(normalizeHex(val));
    } else {
      setIsValid(false);
    }
  };

  // Handle hue spectrum slider change
  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value, 10);
    // Maintain current saturation and lightness, or default to vibrant
    const sat = hsl.s < 20 ? 90 : hsl.s;
    const lit = hsl.l < 10 || hsl.l > 90 ? 50 : hsl.l;
    const newHex = hslToHex(newHue, sat, lit);
    setTextInput(newHex);
    setIsValid(true);
    onChange(newHex);
  };

  // Handle blur: if invalid, reset text to actual currentHex
  const handleBlur = () => {
    if (!isValid) {
      setTextInput(currentHex);
      setIsValid(true);
    }
  };

  return (
    <div className={`hex-color-control ${className}`}>
      {label && (
        <div className="hex-color-header-row">
          <label className="control-label">{label}</label>
          {defaultValue && (
            <button
              type="button"
              className="hex-color-reset-mini-btn"
              onClick={() => {
                const norm = normalizeHex(defaultValue);
                setTextInput(norm);
                setIsValid(true);
                onChange(norm);
              }}
              title="Reset color"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Main input row: Swatch + Text field */}
      <div className="hex-color-input-row">
        {/* Color preview swatch */}
        <div
          className="hex-color-swatch-box"
          style={{ backgroundColor: currentHex }}
          aria-label={`Color preview: ${currentHex}`}
        />

        {/* Text input for exact HEX */}
        <div className="hex-color-text-wrapper">
          <span className="hex-prefix">#</span>
          <input
            type="text"
            className={`studio-input hex-color-text-input ${!isValid ? 'has-error' : ''}`}
            value={textInput.replace('#', '')}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
              handleTextChange({ ...e, target: { ...e.target, value: `#${raw}` } });
            }}
            onBlur={handleBlur}
            placeholder="B3E32B"
            maxLength={6}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Rainbow Hue Spectrum Slider */}
      <div className="hex-hue-slider-row">
        <input
          type="range"
          min="0"
          max="360"
          value={hsl.h}
          onChange={handleHueChange}
          className="hex-hue-spectrum-slider"
          title={`Hue: ${hsl.h}°`}
        />
      </div>

      {/* Quick Swatches */}
      {presetColors.length > 0 && (
        <div className="hex-swatches-grid">
          {presetColors.map((color) => {
            const normColor = normalizeHex(color);
            const isActive = currentHex.toLowerCase() === normColor.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                className={`hex-mini-swatch ${isActive ? 'is-active' : ''}`}
                style={{ backgroundColor: normColor }}
                onClick={() => {
                  setTextInput(normColor);
                  setIsValid(true);
                  onChange(normColor);
                }}
                title={normColor}
                aria-label={`Select ${normColor}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
