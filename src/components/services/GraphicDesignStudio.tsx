import React, { FC, useState, useRef, useCallback, useEffect } from 'react';
import {
  TypeIcon, SquareIcon, CircleIcon, StarIcon, LayersIcon, SlidersIcon,
  TrashIcon, CopyIcon, DownloadIcon, CursorPointerIcon, CheckIcon,
  RotateCcwIcon, LockIcon, UnlockIcon, EyeIcon, EyeOffIcon
} from './ServiceIcons';
import { HexColorPicker } from './HexColorPicker';

export interface CanvasElement {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'star' | 'pill' | 'frame';
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage
  height: number; // percentage
  rotation: number; // degrees
  opacity: number; // 0-1
  visible: boolean;
  locked: boolean;
  // Style properties
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
  boxShadowBlur: number;
  boxShadowColor: string;
  // Typography properties (for text)
  text?: string;
  fontFamily?: string;
  fontSize?: number; // px
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number; // px
  lineHeight?: number; // multiplier e.g. 1.2
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

const DEFAULT_PRESET: CanvasElement[] = [
  {
    id: 'elem-backdrop',
    type: 'rect',
    name: 'Glass Panel',
    x: 12, y: 12, width: 76, height: 76,
    rotation: 0, opacity: 0.8, visible: true, locked: false,
    fill: '#0d120d', stroke: '#B3E32B', strokeWidth: 1.5,
    borderRadius: 20, boxShadowBlur: 25, boxShadowColor: '#B3E32B',
  },
  {
    id: 'elem-star',
    type: 'star',
    name: 'Accent Starburst',
    x: 68, y: 20, width: 14, height: 14,
    rotation: 12, opacity: 1, visible: true, locked: false,
    fill: '#B3E32B', stroke: '#050505', strokeWidth: 1,
    borderRadius: 0, boxShadowBlur: 16, boxShadowColor: '#B3E32B',
  },
  {
    id: 'elem-tag',
    type: 'text',
    name: 'Category Tag',
    x: 18, y: 22, width: 50, height: 8,
    rotation: 0, opacity: 0.9, visible: true, locked: false,
    fill: '#B3E32B', stroke: 'transparent', strokeWidth: 0,
    borderRadius: 0, boxShadowBlur: 0, boxShadowColor: '#B3E32B',
    text: 'FUTURE VISION // 2026',
    fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 700,
    textAlign: 'left', letterSpacing: 4, lineHeight: 1.2, textTransform: 'uppercase',
  },
  {
    id: 'elem-headline',
    type: 'text',
    name: 'Hero Title',
    x: 18, y: 34, width: 62, height: 20,
    rotation: 0, opacity: 1, visible: true, locked: false,
    fill: '#FFFFFF', stroke: 'transparent', strokeWidth: 0,
    borderRadius: 0, boxShadowBlur: 0, boxShadowColor: '#B3E32B',
    text: 'NEO STUDIO',
    fontFamily: 'Syne', fontSize: 42, fontWeight: 900,
    textAlign: 'left', letterSpacing: -1, lineHeight: 1.1, textTransform: 'uppercase',
  },
  {
    id: 'elem-subtext',
    type: 'text',
    name: 'Subtitle',
    x: 18, y: 56, width: 55, height: 10,
    rotation: 0, opacity: 0.75, visible: true, locked: false,
    fill: '#A0A5A0', stroke: 'transparent', strokeWidth: 0,
    borderRadius: 0, boxShadowBlur: 0, boxShadowColor: '#B3E32B',
    text: 'Precision vector architecture & fluid visual systems.',
    fontFamily: 'Inter', fontSize: 14, fontWeight: 400,
    textAlign: 'left', letterSpacing: 0, lineHeight: 1.4, textTransform: 'none',
  },
  {
    id: 'elem-badge',
    type: 'pill',
    name: 'Action Pill',
    x: 18, y: 72, width: 28, height: 9,
    rotation: 0, opacity: 1, visible: true, locked: false,
    fill: 'rgba(179, 227, 43, 0.15)', stroke: '#B3E32B', strokeWidth: 1.5,
    borderRadius: 999, boxShadowBlur: 8, boxShadowColor: '#B3E32B',
  },
  {
    id: 'elem-badgetext',
    type: 'text',
    name: 'Badge Label',
    x: 19, y: 74, width: 26, height: 5,
    rotation: 0, opacity: 1, visible: true, locked: false,
    fill: '#B3E32B', stroke: 'transparent', strokeWidth: 0,
    borderRadius: 0, boxShadowBlur: 0, boxShadowColor: '#B3E32B',
    text: 'EXPLORE DESIGN',
    fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 700,
    textAlign: 'center', letterSpacing: 2, lineHeight: 1, textTransform: 'uppercase',
  },
];

const PRESETS: { name: string; elements: CanvasElement[] }[] = [
  {
    name: 'Cyberpunk Identity',
    elements: DEFAULT_PRESET,
  },
  {
    name: 'Minimal Editorial',
    elements: [
      {
        id: 'ed-frame',
        type: 'rect',
        name: 'Border Frame',
        x: 8, y: 8, width: 84, height: 84,
        rotation: 0, opacity: 0.95, visible: true, locked: false,
        fill: '#080808', stroke: 'rgba(255,255,255,0.18)', strokeWidth: 1,
        borderRadius: 12, boxShadowBlur: 10, boxShadowColor: '#ffffff',
      },
      {
        id: 'ed-dot',
        type: 'circle',
        name: 'Lime Accent Dot',
        x: 76, y: 18, width: 8, height: 8,
        rotation: 0, opacity: 1, visible: true, locked: false,
        fill: '#B3E32B', stroke: 'transparent', strokeWidth: 0,
        borderRadius: 999, boxShadowBlur: 16, boxShadowColor: '#B3E32B',
      },
      {
        id: 'ed-title',
        type: 'text',
        name: 'Title',
        x: 16, y: 22, width: 68, height: 22,
        rotation: 0, opacity: 1, visible: true, locked: false,
        fill: '#F5F5F5', stroke: 'transparent', strokeWidth: 0,
        borderRadius: 0, boxShadowBlur: 0, boxShadowColor: '#ffffff',
        text: 'AESTHETIC',
        fontFamily: 'Syne', fontSize: 40, fontWeight: 700,
        textAlign: 'left', letterSpacing: 6, lineHeight: 1.1, textTransform: 'uppercase',
      },
      {
        id: 'ed-desc',
        type: 'text',
        name: 'Description',
        x: 16, y: 46, width: 68, height: 16,
        rotation: 0, opacity: 0.7, visible: true, locked: false,
        fill: '#999999', stroke: 'transparent', strokeWidth: 0,
        borderRadius: 0, boxShadowBlur: 0, boxShadowColor: '#ffffff',
        text: 'Form follows intention. Crafted with mathematical rhythm and clean grid hierarchy.',
        fontFamily: 'Inter', fontSize: 13, fontWeight: 400,
        textAlign: 'left', letterSpacing: 0, lineHeight: 1.5, textTransform: 'none',
      },
      {
        id: 'ed-rule',
        type: 'rect',
        name: 'Lime Accent Rule',
        x: 16, y: 68, width: 28, height: 1.5,
        rotation: 0, opacity: 1, visible: true, locked: false,
        fill: '#B3E32B', stroke: 'transparent', strokeWidth: 0,
        borderRadius: 2, boxShadowBlur: 8, boxShadowColor: '#B3E32B',
      },
    ],
  },
  {
    name: 'Modern Social Card',
    elements: [
      {
        id: 'soc-bg',
        type: 'rect',
        name: 'Card Backing',
        x: 10, y: 14, width: 80, height: 72,
        rotation: 0, opacity: 0.85, visible: true, locked: false,
        fill: '#111610', stroke: '#B3E32B', strokeWidth: 1.2,
        borderRadius: 24, boxShadowBlur: 25, boxShadowColor: '#B3E32B',
      },
      {
        id: 'soc-t1',
        type: 'text',
        name: 'Headline',
        x: 18, y: 26, width: 64, height: 18,
        rotation: 0, opacity: 1, visible: true, locked: false,
        fill: '#B3E32B', stroke: 'transparent', strokeWidth: 0,
        borderRadius: 0, boxShadowBlur: 0, boxShadowColor: '#B3E32B',
        text: 'CREATIVE',
        fontFamily: 'Syne', fontSize: 44, fontWeight: 900,
        textAlign: 'left', letterSpacing: -1, lineHeight: 1, textTransform: 'uppercase',
      },
      {
        id: 'soc-t2',
        type: 'text',
        name: 'Sub-headline',
        x: 18, y: 46, width: 64, height: 18,
        rotation: 0, opacity: 1, visible: true, locked: false,
        fill: '#FFFFFF', stroke: 'transparent', strokeWidth: 0,
        borderRadius: 0, boxShadowBlur: 0, boxShadowColor: '#B3E32B',
        text: 'PORTFOLIO',
        fontFamily: 'Space Grotesk', fontSize: 36, fontWeight: 700,
        textAlign: 'left', letterSpacing: 2, lineHeight: 1, textTransform: 'uppercase',
      },
      {
        id: 'soc-star',
        type: 'star',
        name: 'Star Accent',
        x: 70, y: 56, width: 12, height: 12,
        rotation: 30, opacity: 1, visible: true, locked: false,
        fill: '#B3E32B', stroke: 'transparent', strokeWidth: 0,
        borderRadius: 0, boxShadowBlur: 14, boxShadowColor: '#B3E32B',
      },
    ],
  },
];

const FONTS = [
  'Syne',
  'Space Grotesk',
  'Inter',
  'Outfit',
  'Plus Jakarta Sans',
  'JetBrains Mono',
];

export const GraphicDesignStudio: FC = () => {
  const [elements, setElements] = useState<CanvasElement[]>(DEFAULT_PRESET);
  const [selectedId, setSelectedId] = useState<string>('elem-headline');
  const [activeInspectorTab, setActiveInspectorTab] = useState<'typography' | 'shape' | 'layers'>('typography');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  // Update selected element property
  const updateSelected = useCallback((updates: Partial<CanvasElement>) => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, ...updates } : el))
    );
  }, [selectedId]);

  // Load a preset
  const loadPreset = (presetIndex: number) => {
    const p = PRESETS[presetIndex];
    if (!p) return;
    setElements(p.elements);
    setSelectedId(p.elements[p.elements.length - 1]?.id || '');
  };

  // Reset to default preset
  const handleResetAll = () => {
    setElements(DEFAULT_PRESET);
    setSelectedId('elem-headline');
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    setElements([]);
    setSelectedId('');
  };

  // Add Element
  const addElement = (type: CanvasElement['type']) => {
    const newId = `elem-${Date.now()}`;
    let newElem: CanvasElement;

    if (type === 'text') {
      newElem = {
        id: newId,
        type: 'text',
        name: `Text ${elements.length + 1}`,
        x: 25, y: 35, width: 50, height: 14,
        rotation: 0, opacity: 1, visible: true, locked: false,
        fill: '#B3E32B', stroke: 'transparent', strokeWidth: 0,
        borderRadius: 0, boxShadowBlur: 0, boxShadowColor: '#B3E32B',
        text: 'NEW TYPOGRAPHY',
        fontFamily: 'Syne', fontSize: 32, fontWeight: 800,
        textAlign: 'center', letterSpacing: 1, lineHeight: 1.2, textTransform: 'uppercase',
      };
      setActiveInspectorTab('typography');
    } else if (type === 'rect') {
      newElem = {
        id: newId,
        type: 'rect',
        name: `Rectangle ${elements.length + 1}`,
        x: 30, y: 30, width: 40, height: 35,
        rotation: 0, opacity: 0.9, visible: true, locked: false,
        fill: 'rgba(179, 227, 43, 0.12)', stroke: '#B3E32B', strokeWidth: 1.5,
        borderRadius: 16, boxShadowBlur: 10, boxShadowColor: '#B3E32B',
      };
      setActiveInspectorTab('shape');
    } else if (type === 'circle') {
      newElem = {
        id: newId,
        type: 'circle',
        name: `Circle ${elements.length + 1}`,
        x: 35, y: 30, width: 25, height: 25,
        rotation: 0, opacity: 0.9, visible: true, locked: false,
        fill: '#B3E32B', stroke: '#050505', strokeWidth: 1,
        borderRadius: 999, boxShadowBlur: 16, boxShadowColor: '#B3E32B',
      };
      setActiveInspectorTab('shape');
    } else if (type === 'star') {
      newElem = {
        id: newId,
        type: 'star',
        name: `Star Badge ${elements.length + 1}`,
        x: 40, y: 30, width: 18, height: 18,
        rotation: 0, opacity: 1, visible: true, locked: false,
        fill: '#B3E32B', stroke: 'transparent', strokeWidth: 0,
        borderRadius: 0, boxShadowBlur: 12, boxShadowColor: '#B3E32B',
      };
      setActiveInspectorTab('shape');
    } else {
      newElem = {
        id: newId,
        type: 'pill',
        name: `Pill ${elements.length + 1}`,
        x: 25, y: 40, width: 50, height: 12,
        rotation: 0, opacity: 0.9, visible: true, locked: false,
        fill: '#151c12', stroke: '#B3E32B', strokeWidth: 1.5,
        borderRadius: 999, boxShadowBlur: 8, boxShadowColor: '#B3E32B',
      };
      setActiveInspectorTab('shape');
    }

    setElements((prev) => [...prev, newElem]);
    setSelectedId(newId);
  };

  // Delete selected
  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId('');
  }, [selectedId]);

  // Duplicate selected
  const duplicateSelected = () => {
    if (!selectedElement) return;
    const copy: CanvasElement = {
      ...selectedElement,
      id: `elem-${Date.now()}`,
      name: `${selectedElement.name} (Copy)`,
      x: Math.min(selectedElement.x + 4, 85),
      y: Math.min(selectedElement.y + 4, 85),
    };
    setElements((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  // Reorder elements
  const reorderElement = (dir: 'top' | 'up' | 'down' | 'bottom') => {
    if (!selectedId) return;
    const idx = elements.findIndex((el) => el.id === selectedId);
    if (idx === -1) return;
    const arr = [...elements];
    const [item] = arr.splice(idx, 1);

    if (dir === 'top') arr.push(item);
    else if (dir === 'bottom') arr.unshift(item);
    else if (dir === 'up') arr.splice(Math.min(arr.length, idx + 1), 0, item);
    else if (dir === 'down') arr.splice(Math.max(0, idx - 1), 0, item);

    setElements(arr);
  };

  // Toggle visibility / lock
  const toggleVisibility = (id: string) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, visible: !el.visible } : el))
    );
  };

  const toggleLock = (id: string) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el))
    );
  };

  // Global Keyboard shortcuts (Delete / Backspace to remove selected element)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteSelected]);

  // Mouse Drag to Move Element on Canvas
  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    const elem = elements.find((el) => el.id === id);
    if (!elem || elem.locked || !elem.visible) return;
    e.stopPropagation();
    setSelectedId(id);

    if (!canvasRef.current) return;

    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: elem.x,
      origY: elem.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaXPercent = ((moveEvent.clientX - dragRef.current.startX) / rect.width) * 100;
      const deltaYPercent = ((moveEvent.clientY - dragRef.current.startY) / rect.height) * 100;

      const newX = Math.round(Math.max(0, Math.min(92, dragRef.current.origX + deltaXPercent)));
      const newY = Math.round(Math.max(0, Math.min(92, dragRef.current.origY + deltaYPercent)));

      setElements((prev) =>
        prev.map((el) =>
          el.id === dragRef.current?.id ? { ...el, x: newX, y: newY } : el
        )
      );
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Interactive Drag-to-Resize on Corner Handles
  const handleResizeMouseDown = (e: React.MouseEvent, id: string, handle: 'tl' | 'tr' | 'bl' | 'br') => {
    const elem = elements.find((el) => el.id === id);
    if (!elem || elem.locked || !elem.visible || !canvasRef.current) return;
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = elem.x;
    const origY = elem.y;
    const origW = elem.width;
    const origH = elem.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;

      let newX = origX;
      let newY = origY;
      let newW = origW;
      let newH = origH;

      if (handle === 'br') {
        newW = Math.max(5, Math.min(100 - origX, origW + deltaX));
        newH = Math.max(4, Math.min(100 - origY, origH + deltaY));
      } else if (handle === 'bl') {
        const candidateW = origW - deltaX;
        if (candidateW >= 5 && origX + deltaX >= 0) {
          newX = origX + deltaX;
          newW = candidateW;
        }
        newH = Math.max(4, Math.min(100 - origY, origH + deltaY));
      } else if (handle === 'tr') {
        newW = Math.max(5, Math.min(100 - origX, origW + deltaX));
        const candidateH = origH - deltaY;
        if (candidateH >= 4 && origY + deltaY >= 0) {
          newY = origY + deltaY;
          newH = candidateH;
        }
      } else if (handle === 'tl') {
        const candidateW = origW - deltaX;
        if (candidateW >= 5 && origX + deltaX >= 0) {
          newX = origX + deltaX;
          newW = candidateW;
        }
        const candidateH = origH - deltaY;
        if (candidateH >= 4 && origY + deltaY >= 0) {
          newY = origY + deltaY;
          newH = candidateH;
        }
      }

      setElements((prev) =>
        prev.map((el) =>
          el.id === id
            ? {
                ...el,
                x: Math.round(newX * 10) / 10,
                y: Math.round(newY * 10) / 10,
                width: Math.round(newW * 10) / 10,
                height: Math.round(newH * 10) / 10,
              }
            : el
        )
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Export design configuration
  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(elements, null, 2));
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="design-studio">
      {/* Studio Top Action Bar */}
      <div className="studio-topbar">
        <div className="studio-topbar__left">
          <div className="studio-window-dots" aria-hidden="true">
            <span className="dot dot--lime" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <span className="studio-doc-title">vector_artboard.fig</span>
          <span className="studio-canvas-scale">1920×1080 RGB</span>
        </div>

        {/* Preset Selector */}
        <div className="studio-preset-bar">
          <span className="studio-preset-label">PRESETS:</span>
          {PRESETS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              className="studio-preset-chip"
              onClick={() => loadPreset(i)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="studio-topbar__right">
          <button
            type="button"
            className="studio-action-btn"
            onClick={handleResetAll}
            title="Reset Artboard to Default"
          >
            <RotateCcwIcon size={13} />
            <span>Reset Artboard</span>
          </button>

          <button
            type="button"
            className="studio-action-btn studio-action-btn--highlight"
            onClick={handleExport}
            title="Export design config to clipboard"
          >
            {copiedSuccess ? <CheckIcon size={14} /> : <DownloadIcon size={14} />}
            <span>{copiedSuccess ? 'Copied JSON!' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Split Area */}
      <div className="design-studio__workspace">
        {/* Left Toolbar (Creation Tools) */}
        <div className="design-studio__toolbar">
          <button
            type="button"
            className="tool-btn tool-btn--active"
            title="Select & Move (V)"
          >
            <CursorPointerIcon size={16} />
          </button>

          <div className="tool-btn-divider" />

          <button
            type="button"
            className="tool-btn"
            onClick={() => addElement('text')}
            title="Add Typography (T)"
          >
            <TypeIcon size={16} />
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={() => addElement('rect')}
            title="Add Rectangle (R)"
          >
            <SquareIcon size={16} />
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={() => addElement('circle')}
            title="Add Circle (O)"
          >
            <CircleIcon size={16} />
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={() => addElement('star')}
            title="Add Star Badge"
          >
            <StarIcon size={16} />
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={() => addElement('pill')}
            title="Add Pill Badge"
          >
            <span className="tool-btn-pill-icon" />
          </button>

          <div className="tool-btn-divider" />

          <button
            type="button"
            className="tool-btn"
            onClick={duplicateSelected}
            disabled={!selectedId}
            title="Duplicate Selected"
          >
            <CopyIcon size={15} />
          </button>

          <button
            type="button"
            className="tool-btn tool-btn--danger"
            onClick={deleteSelected}
            disabled={!selectedId}
            title="Delete Selected"
          >
            <TrashIcon size={15} />
          </button>
        </div>

        {/* Center Interactive Artboard Canvas */}
        <div
          ref={canvasRef}
          className="design-studio__canvas"
          onClick={() => setSelectedId('')}
        >
          {/* Subtle Canvas Dot Grid Background */}
          <div className="canvas-grid-pattern" aria-hidden="true" />

          {/* Rendered Design Elements */}
          {elements.map((el) => {
            if (!el.visible) return null;
            const isSelected = el.id === selectedId;

            // Render Text Element
            if (el.type === 'text') {
              return (
                <div
                  key={el.id}
                  className={`canvas-element canvas-element--text ${isSelected ? 'is-selected' : ''} ${el.locked ? 'is-locked' : ''}`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: `${el.height}%`,
                    transform: `rotate(${el.rotation}deg)`,
                    opacity: el.opacity,
                    color: el.fill,
                    fontFamily: el.fontFamily,
                    fontSize: `${el.fontSize}px`,
                    fontWeight: el.fontWeight,
                    textAlign: el.textAlign,
                    letterSpacing: `${el.letterSpacing}px`,
                    lineHeight: el.lineHeight,
                    textTransform: el.textTransform,
                    textShadow: el.boxShadowBlur ? `0 0 ${el.boxShadowBlur}px ${el.boxShadowColor || el.fill}` : 'none',
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(el.id);
                  }}
                >
                  <span className="canvas-text-content">{el.text}</span>

                  {isSelected && (
                    <div className="canvas-selection-box">
                      <span className="handle handle--tl" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'tl')} />
                      <span className="handle handle--tr" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'tr')} />
                      <span className="handle handle--bl" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'bl')} />
                      <span className="handle handle--br" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'br')} />
                    </div>
                  )}
                </div>
              );
            }

            // Render Shape Elements (Rect, Circle, Star, Pill)
            if (el.type === 'star') {
              return (
                <div
                  key={el.id}
                  className={`canvas-element canvas-element--star ${isSelected ? 'is-selected' : ''} ${el.locked ? 'is-locked' : ''}`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: `${el.height}%`,
                    transform: `rotate(${el.rotation}deg)`,
                    opacity: el.opacity,
                    filter: el.boxShadowBlur ? `drop-shadow(0 0 ${el.boxShadowBlur}px ${el.boxShadowColor || el.fill})` : 'none',
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(el.id);
                  }}
                >
                  <svg viewBox="0 0 24 24" width="100%" height="100%">
                    <polygon
                      points="12,2 15,8.5 22,9.2 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.2 9,8.5"
                      fill={el.fill}
                      stroke={el.stroke}
                      strokeWidth={el.strokeWidth}
                    />
                  </svg>

                  {isSelected && (
                    <div className="canvas-selection-box">
                      <span className="handle handle--tl" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'tl')} />
                      <span className="handle handle--tr" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'tr')} />
                      <span className="handle handle--bl" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'bl')} />
                      <span className="handle handle--br" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'br')} />
                    </div>
                  )}
                </div>
              );
            }

            // Rect, Circle, Pill
            return (
              <div
                key={el.id}
                className={`canvas-element canvas-element--${el.type} ${isSelected ? 'is-selected' : ''} ${el.locked ? 'is-locked' : ''}`}
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}%`,
                  height: `${el.height}%`,
                  transform: `rotate(${el.rotation}deg)`,
                  opacity: el.opacity,
                  backgroundColor: el.fill,
                  border: el.strokeWidth > 0 ? `${el.strokeWidth}px solid ${el.stroke}` : 'none',
                  borderRadius: `${el.borderRadius}px`,
                  boxShadow: el.boxShadowBlur ? `0 0 ${el.boxShadowBlur}px ${el.boxShadowColor || el.fill}` : 'none',
                }}
                onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(el.id);
                }}
              >
                {isSelected && (
                  <div className="canvas-selection-box">
                    <span className="handle handle--tl" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'tl')} />
                    <span className="handle handle--tr" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'tr')} />
                    <span className="handle handle--bl" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'bl')} />
                    <span className="handle handle--br" onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'br')} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Inspector & Properties Panel */}
        <aside className="design-inspector">
          {/* Inspector Tab Switcher */}
          <div className="inspector-tabs">
            <button
              type="button"
              className={`inspector-tab ${activeInspectorTab === 'typography' ? 'is-active' : ''}`}
              onClick={() => setActiveInspectorTab('typography')}
            >
              <TypeIcon size={13} />
              <span>Typography</span>
            </button>
            <button
              type="button"
              className={`inspector-tab ${activeInspectorTab === 'shape' ? 'is-active' : ''}`}
              onClick={() => setActiveInspectorTab('shape')}
            >
              <SlidersIcon size={13} />
              <span>Shape & Style</span>
            </button>
            <button
              type="button"
              className={`inspector-tab ${activeInspectorTab === 'layers' ? 'is-active' : ''}`}
              onClick={() => setActiveInspectorTab('layers')}
            >
              <LayersIcon size={13} />
              <span>Layers ({elements.length})</span>
            </button>
          </div>

          <div className="inspector-body">
            {!selectedElement ? (
              <div className="inspector-empty">
                <CursorPointerIcon size={24} className="inspector-empty__icon" />
                <p>Click any canvas item to inspect and edit its live properties, or pick a creation tool on the left.</p>
              </div>
            ) : (
              <>
                {/* Active Layer Header with quick actions */}
                <div className="inspector-section-header">
                  <div className="inspector-header-left">
                    <span className="inspector-selected-tag">{selectedElement.type.toUpperCase()}</span>
                    <span className="inspector-selected-name">{selectedElement.name}</span>
                  </div>
                  <div className="inspector-header-actions">
                    <button
                      type="button"
                      className="inspector-action-icon-btn"
                      onClick={duplicateSelected}
                      title="Duplicate"
                    >
                      <CopyIcon size={13} />
                    </button>
                    <button
                      type="button"
                      className="inspector-action-icon-btn inspector-action-icon-btn--danger"
                      onClick={deleteSelected}
                      title="Delete"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </div>

                {/* TAB 1: Typography Controls */}
                {activeInspectorTab === 'typography' && (
                  <div className="inspector-group">
                    {selectedElement.type === 'text' ? (
                      <>
                        <div className="control-row">
                          <label className="control-label">Text Content</label>
                          <input
                            type="text"
                            className="studio-input"
                            value={selectedElement.text || ''}
                            onChange={(e) => updateSelected({ text: e.target.value })}
                          />
                        </div>

                        <div className="control-row">
                          <label className="control-label">Font Family</label>
                          <select
                            className="studio-select"
                            value={selectedElement.fontFamily || 'Syne'}
                            onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                          >
                            {FONTS.map((font) => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>

                        <div className="control-grid-2">
                          <div className="control-col">
                            <label className="control-label">Font Size ({selectedElement.fontSize}px)</label>
                            <input
                              type="range"
                              min="12"
                              max="96"
                              value={selectedElement.fontSize || 24}
                              onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                              className="studio-slider"
                            />
                          </div>

                          <div className="control-col">
                            <label className="control-label">Weight</label>
                            <select
                              className="studio-select"
                              value={selectedElement.fontWeight || 700}
                              onChange={(e) => updateSelected({ fontWeight: Number(e.target.value) })}
                            >
                              <option value="300">300 - Light</option>
                              <option value="400">400 - Regular</option>
                              <option value="500">500 - Medium</option>
                              <option value="600">600 - SemiBold</option>
                              <option value="700">700 - Bold</option>
                              <option value="900">900 - Black</option>
                            </select>
                          </div>
                        </div>

                        <div className="control-grid-2">
                          <div className="control-col">
                            <label className="control-label">Letter Spacing ({selectedElement.letterSpacing || 0}px)</label>
                            <input
                              type="range"
                              min="-2"
                              max="16"
                              value={selectedElement.letterSpacing || 0}
                              onChange={(e) => updateSelected({ letterSpacing: Number(e.target.value) })}
                              className="studio-slider"
                            />
                          </div>

                          <div className="control-col">
                            <label className="control-label">Line Height ({selectedElement.lineHeight || 1.2})</label>
                            <input
                              type="range"
                              min="0.8"
                              max="2.2"
                              step="0.1"
                              value={selectedElement.lineHeight || 1.2}
                              onChange={(e) => updateSelected({ lineHeight: Number(e.target.value) })}
                              className="studio-slider"
                            />
                          </div>
                        </div>

                        <div className="control-row">
                          <label className="control-label">Alignment</label>
                          <div className="control-btn-group">
                            {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                              <button
                                key={align}
                                type="button"
                                className={`mini-btn ${selectedElement.textAlign === align ? 'is-active' : ''}`}
                                onClick={() => updateSelected({ textAlign: align })}
                              >
                                {align.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Full HEX Color Picker for Text */}
                        <HexColorPicker
                          label="Text Color"
                          value={selectedElement.fill}
                          onChange={(c) => updateSelected({ fill: c })}
                          defaultValue="#B3E32B"
                        />
                      </>
                    ) : (
                      <div className="inspector-notice">
                        <p>Selected item is a shape. Switch to <strong>Shape & Style</strong> tab or select a text element.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Shape & Style Controls */}
                {activeInspectorTab === 'shape' && (
                  <div className="inspector-group">
                    {/* Transform sliders */}
                    <div className="control-grid-2">
                      <div className="control-col">
                        <label className="control-label">Rotation ({selectedElement.rotation}°)</label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={selectedElement.rotation}
                          onChange={(e) => updateSelected({ rotation: Number(e.target.value) })}
                          className="studio-slider"
                        />
                      </div>
                      <div className="control-col">
                        <label className="control-label">Opacity ({Math.round(selectedElement.opacity * 100)}%)</label>
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={selectedElement.opacity}
                          onChange={(e) => updateSelected({ opacity: Number(e.target.value) })}
                          className="studio-slider"
                        />
                      </div>
                    </div>

                    <div className="control-grid-2">
                      <div className="control-col">
                        <label className="control-label">Width ({selectedElement.width}%)</label>
                        <input
                          type="range"
                          min="5"
                          max="95"
                          value={selectedElement.width}
                          onChange={(e) => updateSelected({ width: Number(e.target.value) })}
                          className="studio-slider"
                        />
                      </div>
                      <div className="control-col">
                        <label className="control-label">Height ({selectedElement.height}%)</label>
                        <input
                          type="range"
                          min="4"
                          max="95"
                          value={selectedElement.height}
                          onChange={(e) => updateSelected({ height: Number(e.target.value) })}
                          className="studio-slider"
                        />
                      </div>
                    </div>

                    {selectedElement.type !== 'star' && selectedElement.type !== 'text' && (
                      <div className="control-grid-2">
                        <div className="control-col">
                          <label className="control-label">Corner Radius ({selectedElement.borderRadius}px)</label>
                          <input
                            type="range"
                            min="0"
                            max="80"
                            value={selectedElement.borderRadius}
                            onChange={(e) => updateSelected({ borderRadius: Number(e.target.value) })}
                            className="studio-slider"
                          />
                        </div>
                        <div className="control-col">
                          <label className="control-label">Glow Blur ({selectedElement.boxShadowBlur}px)</label>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={selectedElement.boxShadowBlur}
                            onChange={(e) => updateSelected({ boxShadowBlur: Number(e.target.value) })}
                            className="studio-slider"
                          />
                        </div>
                      </div>
                    )}

                    {/* Full HEX Color Pickers for Shape Fill & Stroke */}
                    <HexColorPicker
                      label="Fill Color"
                      value={selectedElement.fill}
                      onChange={(c) => updateSelected({ fill: c })}
                      defaultValue="#B3E32B"
                    />

                    {selectedElement.type !== 'text' && (
                      <>
                        <div className="control-grid-2" style={{ marginTop: '8px' }}>
                          <div className="control-col">
                            <label className="control-label">Stroke Width ({selectedElement.strokeWidth}px)</label>
                            <input
                              type="range"
                              min="0"
                              max="8"
                              step="0.5"
                              value={selectedElement.strokeWidth}
                              onChange={(e) => updateSelected({ strokeWidth: Number(e.target.value) })}
                              className="studio-slider"
                            />
                          </div>
                          <div className="control-col">
                            <label className="control-label">Glow Blur ({selectedElement.boxShadowBlur}px)</label>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={selectedElement.boxShadowBlur}
                              onChange={(e) => updateSelected({ boxShadowBlur: Number(e.target.value) })}
                              className="studio-slider"
                            />
                          </div>
                        </div>

                        <HexColorPicker
                          label="Stroke Color"
                          value={selectedElement.stroke}
                          onChange={(c) => updateSelected({ stroke: c })}
                          defaultValue="#B3E32B"
                        />
                      </>
                    )}
                  </div>
                )}

                {/* TAB 3: Layer Stack Management */}
                {activeInspectorTab === 'layers' && (
                  <div className="inspector-group">
                    <div className="layer-actions-bar">
                      <button
                        type="button"
                        className="layer-btn"
                        onClick={() => reorderElement('up')}
                        title="Bring Forward"
                      >
                        ▲ Up
                      </button>
                      <button
                        type="button"
                        className="layer-btn"
                        onClick={() => reorderElement('down')}
                        title="Send Backward"
                      >
                        ▼ Down
                      </button>
                      <button
                        type="button"
                        className="layer-btn"
                        onClick={duplicateSelected}
                        title="Duplicate Element"
                      >
                        <CopyIcon size={12} /> Duplicate
                      </button>
                      <button
                        type="button"
                        className="layer-btn layer-btn--danger"
                        onClick={deleteSelected}
                        title="Delete Element"
                      >
                        <TrashIcon size={12} /> Delete
                      </button>
                    </div>

                    <div className="layers-list">
                      {[...elements].reverse().map((el) => {
                        const isSel = el.id === selectedId;
                        return (
                          <div
                            key={el.id}
                            className={`layer-item ${isSel ? 'is-active' : ''}`}
                            onClick={() => setSelectedId(el.id)}
                          >
                            <span className="layer-item__type-icon">
                              {el.type === 'text' ? <TypeIcon size={12} /> : <SquareIcon size={12} />}
                            </span>
                            <span className="layer-item__name">{el.name}</span>

                            <div className="layer-item__tools">
                              <button
                                type="button"
                                className="layer-icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleVisibility(el.id);
                                }}
                                title="Toggle Visibility"
                              >
                                {el.visible ? <EyeIcon size={11} /> : <EyeOffIcon size={11} />}
                              </button>
                              <button
                                type="button"
                                className="layer-icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLock(el.id);
                                }}
                                title="Toggle Lock"
                              >
                                {el.locked ? <LockIcon size={11} /> : <UnlockIcon size={11} />}
                              </button>
                            </div>

                            <span
                              className="layer-item__color-dot"
                              style={{ backgroundColor: el.fill.startsWith('#') ? el.fill : '#B3E32B' }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="control-row" style={{ marginTop: '12px' }}>
                      <button
                        type="button"
                        className="studio-action-btn"
                        onClick={handleClearCanvas}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <TrashIcon size={13} />
                        <span>Clear All Canvas Layers</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
