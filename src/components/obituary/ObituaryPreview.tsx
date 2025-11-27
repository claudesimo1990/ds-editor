import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import Draggable from 'react-draggable';
import { ObituaryData } from '@/types/obituary';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bold, Underline, Italic, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import { WysiwygToolbar } from '@/components/memorial/WysiwygToolbar';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ObituaryPreviewProps {
  obituary: ObituaryData;
  onUpdate: (updates: Partial<ObituaryData>) => void;
  isEditable: boolean;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
}

const symbolMap: Record<string, string> = {
  cross: '✞',
  flower: '❀',
  dove: '🕊',
  heart: '♡',
  star: '✦',
  candle: '🕯',
  rose: '🌹',
  butterfly: '🦋',
  angel: '👼',
  ornament: '❦',
  none: '',
};

const fontFamilies = ['Arial', 'Verdana', 'Times New Roman', 'Georgia', 'Courier New'];

interface DraggableElementProps {
  element: { field: string; type: 'text' | 'image'; text?: string; src?: string; symbolData?: any; photoData?: any };
  obituary: ObituaryData;
  onUpdate: (updates: Partial<ObituaryData>) => void;
  position: { x: number; y: number };
  onDrag: (position: { x: number; y: number }) => void;
  onSelect: (id: string | null) => void;
  isSelected: boolean;
  isEditable: boolean;
  boundaryRef: React.RefObject<HTMLDivElement>;
  onEditChange?: (field: string | null) => void; 
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  obituary,
  onUpdate,
  position,
  onDrag,
  onSelect,
  isSelected,
  isEditable,
  boundaryRef,
  onEditChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.text || '');
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentPosition, setCurrentPosition] = useState(position);
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const [currentWidth, setCurrentWidth] = useState(() => {
    if (element.field.startsWith('symbol-')) {
      const parts = element.field.split('-');
      const symbolIndex = parseInt(parts[parts.length - 1]);
      return obituary.symbols?.[symbolIndex]?.width || 100;
    }
    if (element.field.startsWith('photo-')) {
      const parts = element.field.split('-');
      const photoIndex = parseInt(parts[parts.length - 1]);
      return obituary.photos?.[photoIndex]?.width || 150;
    }
    return (obituary as any)[`${element.field}Width`] || (element.type === 'text' ? 'auto' : 150);
  });

  const [currentHeight, setCurrentHeight] = useState(() => {
    if (element.field.startsWith('symbol-')) {
      const parts = element.field.split('-');
      const symbolIndex = parseInt(parts[parts.length - 1]);
      return obituary.symbols?.[symbolIndex]?.height || 100;
    }
    if (element.field.startsWith('photo-')) {
      const parts = element.field.split('-');
      const photoIndex = parseInt(parts[parts.length - 1]);
      return obituary.photos?.[photoIndex]?.height || 150;
    }
    return (obituary as any)[`${element.field}Height`] || (element.type === 'text' ? 'auto' : 150);
  });

  const [currentOpacity, setCurrentOpacity] = useState(() => {
    if (element.field.startsWith('symbol-')) {
      const parts = element.field.split('-');
      const symbolIndex = parseInt(parts[parts.length - 1]);
      return obituary.symbols?.[symbolIndex]?.opacity ?? 100;
    }
    if (element.field.startsWith('photo-')) {
      const parts = element.field.split('-');
      const photoIndex = parseInt(parts[parts.length - 1]);
      return obituary.photos?.[photoIndex]?.opacity ?? 100;
    }
    return (obituary as any)[`${element.field}Opacity`] ?? 100;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(
    (obituary as any)[`${element.field}FontSize`] || 16
  );
  const [currentColor, setCurrentColor] = useState(
    (obituary as any)[`${element.field}Color`] || 'currentColor'
  );
  const [isBold, setIsBold] = useState((obituary as any)[`${element.field}Bold`] || false);
  const [isUnderline, setIsUnderline] = useState((obituary as any)[`${element.field}Underline`] || false);
  const [isItalic, setIsItalic] = useState((obituary as any)[`${element.field}Italic`] || false);
  const [currentAlignment, setCurrentAlignment] = useState(
    (obituary as any)[`${element.field}Alignment`] || 'left'
  );

  const handleChangeStyle = useCallback(
    (key: string, value: any) => {
      if (element.field.startsWith('symbol-')) {
        const parts = element.field.split('-');
        const symbolIndex = parseInt(parts[parts.length - 1]);

        const updatedSymbols = obituary.symbols?.map((symbol, index) =>
          index === symbolIndex ? { ...symbol, [key.toLowerCase()]: value } : symbol
        ) || [];

        onUpdate({ symbols: updatedSymbols });
      } else if (element.field.startsWith('photo-')) {
        const parts = element.field.split('-');
        const photoIndex = parseInt(parts[parts.length - 1]);
        const updatedPhotos = obituary.photos?.map((photo, index) =>
          index === photoIndex ? { ...photo, [key.toLowerCase()]: value } : photo
        ) || [];
        onUpdate({ photos: updatedPhotos });
      } else {
        onUpdate({
          [`${element.field}${key}`]: value,
        });
      }
    },
    [element.field, onUpdate, obituary.symbols, obituary.photos],
  );

  const handleChangeStyleRef = useRef(handleChangeStyle);
  useEffect(() => {
    handleChangeStyleRef.current = handleChangeStyle;
  });

  useEffect(() => {
    setText(element.text || '');
  }, [element.text]);

  useEffect(() => {
    if (element.field.startsWith("symbol-")) {
      const parts = element.field.split("-");
      const symbolIndex = parseInt(parts[parts.length - 1]);
      const symbol = obituary.symbols?.[symbolIndex];

      if (symbol) {
        setCurrentWidth(symbol.width ?? 100);
        setCurrentHeight(symbol.height ?? 100);
        setCurrentOpacity(symbol.opacity ?? 100);
      }
    } else if (element.field.startsWith("photo-")) {
      const parts = element.field.split("-");
      const photoIndex = parseInt(parts[parts.length - 1]);
      const photo = obituary.photos?.[photoIndex];

      if (photo) {
        setCurrentWidth(photo.width ?? 150);
        setCurrentHeight(photo.height ?? 150);
        setCurrentOpacity(photo.opacity ?? 100);
      }
    }
    else {
      const fieldWidth = (obituary as any)[`${element.field}Width`];
      const fieldHeight = (obituary as any)[`${element.field}Height`];
      const fieldOpacity = (obituary as any)[`${element.field}Opacity`];
      const fieldFontSize = (obituary as any)[`${element.field}FontSize`];
      const fieldColor = (obituary as any)[`${element.field}Color`];
      const fieldBold = (obituary as any)[`${element.field}Bold`];
      const fieldUnderline = (obituary as any)[`${element.field}Underline`];
      const fieldItalic = (obituary as any)[`${element.field}Italic`];
      const fieldAlignment = (obituary as any)[`${element.field}Alignment`];

      if (fieldWidth !== undefined) setCurrentWidth(fieldWidth);
      if (fieldHeight !== undefined) setCurrentHeight(fieldHeight);
      if (fieldOpacity !== undefined) setCurrentOpacity(fieldOpacity);
      if (fieldFontSize !== undefined) setCurrentFontSize(fieldFontSize);
      if (fieldColor !== undefined) setCurrentColor(fieldColor);
      if (fieldBold !== undefined) setIsBold(fieldBold);
      if (fieldUnderline !== undefined) setIsUnderline(fieldUnderline);
      if (fieldItalic !== undefined) setIsItalic(fieldItalic);
      if (fieldAlignment !== undefined) setCurrentAlignment(fieldAlignment);
    }
  }, [obituary, element.field]);

  useEffect(() => {
    if (isEditing && contentRef.current) {
      const el = contentRef.current;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [isEditing]);

  const handleClickSelect = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      if (!isEditable) return;

      onSelect(element.field);

      if (element.type === 'image') {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
    },
    [element, onSelect, isEditable],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isEditable) return;

      onSelect(element.field);
      setIsEditing(true);

      onEditChange?.(element.field);
    },
    [element, onSelect, isEditable, onEditChange],
  );

  function parseDates(text: string) {
    const sepMatch = text.match(/(.+?)\s*[-—–|\/]\s*(.+)/);
    if (sepMatch) {
      return {
        birthDate: sepMatch[1].trim(),
        deathDate: sepMatch[2].trim(),
      };
    }
    const parts = text.trim().split(/\s+/);
    return {
      birthDate: parts[0] || '',
      deathDate: parts.slice(1).join(' ') || '',
    };
  }

  const handleBlur = useCallback(() => {
    if (contentRef.current) {
      const newText = contentRef.current.innerText;
      setText(newText);
      const field = element.field;
      if (element.type !== 'text') return;

      if (field === 'fullname') {
        const parts = newText.trim().split(/\s+/);
        onUpdate({ deceased: { ...obituary.deceased, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' } });
      } else if (field === 'additionalName') {
        onUpdate({ deceased: { ...obituary.deceased, additionalName: newText } });
      } else if (field === 'dates') {
        const { birthDate, deathDate } = parseDates(newText);
        onUpdate({ deceased: { ...obituary.deceased, birthDate, deathDate } });
      } else {
        onUpdate({ texts: { ...obituary.texts, [field]: newText } });
      }
    }

    setIsEditing(false);
    onEditChange?.(null);
  }, [element, onUpdate, obituary, onEditChange]);

  const handleDragStart = useCallback(() => {
    if (isEditable) {
      setIsDragging(true);
    }
  }, [isEditable]);

  const handleDragStop = useCallback(
    (e: any, data: any) => {
      setIsDragging(false);
      setCurrentPosition({ x: data.x, y: data.y });

      if (element.field.startsWith('symbol-')) {
        const parts = element.field.split('-');
        const symbolIndex = parseInt(parts[parts.length - 1]);
        const updatedSymbols = obituary.symbols?.map((symbol, index) => index === symbolIndex ? { ...symbol, position: { x: data.x, y: data.y } } : symbol) || [];
        onUpdate({ symbols: updatedSymbols });
      } else if (element.field.startsWith('photo-')) {
        const parts = element.field.split('-');
        const photoIndex = parseInt(parts[parts.length - 1]);
        const updatedPhotos = obituary.photos?.map((photo, index) => index === photoIndex ? { ...photo, position: { x: data.x, y: data.y } } : photo) || [];
        onUpdate({ photos: updatedPhotos });
      }
      else {
        onUpdate({ [`${element.field}Position`]: { x: data.x, y: data.y } });
      }
      onDrag({ x: data.x, y: data.y });
    },
    [element, onDrag, onUpdate, obituary.symbols, obituary.photos],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, direction: string) => {
      if (!isEditable || !containerRef.current) return;
      e.stopPropagation();
      setIsResizing(true);

      const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const boundaryRect = boundaryRef.current?.getBoundingClientRect();
      if (!boundaryRect) return;

      const elementRect = containerRef.current.getBoundingClientRect();
      const initialWidth = elementRect.width;
      const initialHeight = elementRect.height;

      const initialX = currentPosition.x;
      const initialY = currentPosition.y;
      const initialFontSize = currentFontSize;

      const latestState = { current: {
        x: initialX,
        y: initialY,
        width: initialWidth,
        height: initialHeight,
        fontSize: initialFontSize
      }};

      const onMove = (moveEvent: MouseEvent | TouchEvent) => {
        const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
        const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        let newX = initialX;
        let newY = initialY;
        let newWidth = initialWidth;
        let newHeight = initialHeight;

        if (direction.includes('right')) newWidth = initialWidth + deltaX;
        if (direction.includes('left')) {
          newWidth = initialWidth - deltaX;
          newX = initialX + deltaX;
        }
        if (direction.includes('bottom')) newHeight = initialHeight + deltaY;
        if (direction.includes('top')) {
          newHeight = initialHeight - deltaY;
          newY = initialY + deltaY;
        }

        if (newX < 0) {
          newWidth += newX;
          newX = 0;
        }
        if (newY < 0) {
          newHeight += newY;
          newY = 0;
        }
        if (newX + newWidth > boundaryRect.width) {
          newWidth = boundaryRect.width - newX;
        }
        if (newY + newHeight > boundaryRect.height) {
          newHeight = boundaryRect.height - newY;
        }

        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(30, newHeight);

        setCurrentPosition({ x: newX, y: newY });
        setCurrentWidth(newWidth);
        setCurrentHeight(newHeight);

        if (element.type === 'text') {
          const widthScale = initialWidth > 0 ? newWidth / initialWidth : 1;
          const heightScale = initialHeight > 0 ? newHeight / initialHeight : 1;
          const scaleFactor = Math.min(widthScale, heightScale);
          const newFontSize = Math.max(8, Math.round(initialFontSize * scaleFactor));
          setCurrentFontSize(newFontSize);
          latestState.current.fontSize = newFontSize;
        }

        latestState.current.x = newX;
        latestState.current.y = newY;
        latestState.current.width = newWidth;
        latestState.current.height = newHeight;
      };

      const onUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', onMove as any);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchmove', onMove as any);
        window.removeEventListener('touchend', onUp);

        const finalState = latestState.current;

        if (element.field.startsWith('symbol-')) {
          const parts = element.field.split('-');
          const symbolIndex = parseInt(parts[parts.length - 1]);
          const updatedSymbols = obituary.symbols?.map((s, i) => i === symbolIndex ? { ...s, width: finalState.width, height: finalState.height, position: { x: finalState.x, y: finalState.y }} : s) || [];
          onUpdate({ symbols: updatedSymbols });
        } else if (element.field.startsWith('photo-')) {
          const parts = element.field.split('-');
          const photoIndex = parseInt(parts[parts.length - 1]);
          const updatedPhotos = obituary.photos?.map((p, i) => i === photoIndex ? { ...p, width: finalState.width, height: finalState.height, position: { x: finalState.x, y: finalState.y }} : p) || [];
          onUpdate({ photos: updatedPhotos });
        } else {
          const updates: { [key: string]: any } = {};
          updates[`${element.field}Width`] = finalState.width;
          updates[`${element.field}Height`] = finalState.height;
          updates[`${element.field}Position`] = { x: finalState.x, y: finalState.y };
          if (element.type === 'text') {
            updates[`${element.field}FontSize`] = finalState.fontSize;
          }
          onUpdate(updates);
        }

      };

      window.addEventListener('mousemove', onMove as any);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove as any);
      window.addEventListener('touchend', onUp);
    },
    [isEditable, element, onUpdate, currentPosition, currentFontSize, obituary.photos, obituary.symbols, boundaryRef],
  );

  useEffect(() => {
    const handler = (ev: MouseEvent | TouchEvent) => {
      const target = ev.target as Node | null;
      if (!containerRef.current) return;
  
      if (containerRef.current.contains(target)) return;
  
      const toolbarEl = document.querySelector('[data-obituary-toolbar]');
      if (toolbarEl && toolbarEl.contains(target)) return;
  
      setIsEditing(false);
      onSelect(null);
    };
  
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler as any);
    };
  }, [onSelect]);

  const textStyles = {
    color: currentColor,
    fontSize: `${currentFontSize}px`,
    fontFamily: (obituary as any)[`${element.field}FontFamily`] || 'Arial',
    fontWeight: isBold ? 'bold' : 'normal',
    textDecoration: isUnderline ? 'underline' : 'none',
    fontStyle: isItalic ? 'italic' : 'normal',
    textAlign: currentAlignment as any,
    userSelect: 'text' as const,
  };

  const isTextElement = element.type === 'text';

  const getSource = () => {
    if (element.field === 'symbolImage' && obituary.symbolImage) {
      if (symbolMap[obituary.symbolImage]) {
        const symbolChar = symbolMap[obituary.symbolImage];
        return `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='90' font-size='90' text-anchor='middle' x='50' fill='currentColor'>${symbolChar}</text></svg>`;
      } else {
        return obituary.symbolImage;
      }
    }
    return element.src;
  };

  return (
    <Draggable
      position={currentPosition}
      disabled={!isEditable || isResizing}
      onStart={handleDragStart}
      onDrag={(e, data) => setCurrentPosition({ x: data.x, y: data.y })}
      onStop={handleDragStop}
      bounds='parent'
      onMouseDown={(e) => {
        handleClickSelect(e);
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          'absolute transition-all duration-100',
          (isSelected || isDragging) && isEditable && 'outline-none border-2 border-yellow-400 shadow-md rounded-md z-[999]',
          isEditing ? '' : isEditable ? 'cursor-grab' : 'cursor-default',
          (isDragging || isResizing) && 'select-none'
        )}
        style={{
          width: isTextElement
            ? (typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth)
            : `${currentWidth}px`,
          height: isTextElement
            ? (typeof currentHeight === 'number' ? `${currentHeight}px` : 'auto')
            : `${currentHeight}px`,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isTextElement ? (
          <>
            <div
              ref={contentRef}
              contentEditable={isEditing && isEditable}
              suppressContentEditableWarning={true}
              onBlur={handleBlur}
              onInput={(e) => {
                const target = e.target as HTMLDivElement;
                setText(target.innerText);
              }}
              onMouseDown={(e) => {
                if (isEditing) {
                  e.stopPropagation();
                }
              }}
              style={{ ...textStyles }}
              className='whitespace-pre-wrap outline-none'
            >
              {element.text}
            </div>

            {isSelected && isEditable && !isDragging && (
              <>
                <div
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-nwse-resize"
                  onPointerDown={(e) => handleResizeStart(e as any, 'top-left')}
                />
                <div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-nesw-resize"
                  onPointerDown={(e) => handleResizeStart(e as any, 'top-right')}
                />
                <div
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-nesw-resize"
                  onPointerDown={(e) => handleResizeStart(e as any, 'bottom-left')}
                />
                <div
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-nwse-resize"
                  onPointerDown={(e) => handleResizeStart(e as any, 'bottom-right')}
                />
                <div
                  className='absolute top-1/2 -left-2 w-4 h-4 -translate-y-1/2 bg-white border border-gray-400 rounded-full cursor-ew-resize'
                  onPointerDown={(e) => handleResizeStart(e as any, 'left')}
                />
                <div
                  className='absolute top-1/2 -right-2 w-4 h-4 -translate-y-1/2 bg-white border border-gray-400 rounded-full cursor-ew-resize'
                  onPointerDown={(e) => handleResizeStart(e as any, 'right')}
                />
                <div
                  className='absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-ns-resize'
                  onPointerDown={(e) => handleResizeStart(e as any, 'top')}
                />
                <div
                  className='absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-ns-resize'
                  onPointerDown={(e) => handleResizeStart(e as any, 'bottom')}
                />
              </>
            )}
          </>
        ) : (
          <>
            <img
              src={getSource() as string}
              alt='Draggable Element'
              className='w-full h-full object-contain pointer-events-none'
              style={{
                width: `${currentWidth}px`,
                height: `${currentHeight}px`,
                opacity: currentOpacity / 100
              }}
            />

            {isSelected && isEditable && !isDragging && (
              <>
                <div
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-nwse-resize"
                  onPointerDown={(e) => handleResizeStart(e as any, 'top-left')}
                />
                <div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-nesw-resize"
                  onPointerDown={(e) => handleResizeStart(e as any, 'top-right')}
                />
                <div
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-nesw-resize"
                  onPointerDown={(e) => handleResizeStart(e as any, 'bottom-left')}
                />
                <div
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-nwse-resize"
                  onPointerDown={(e) => handleResizeStart(e as any, 'bottom-right')}
                />
                <div
                  className='absolute top-1/2 -left-2 w-4 h-4 -translate-y-1/2 bg-white border border-gray-400 rounded-full cursor-ew-resize'
                  onPointerDown={(e) => handleResizeStart(e as any, 'left')}
                />
                <div
                  className='absolute top-1/2 -right-2 w-4 h-4 -translate-y-1/2 bg-white border border-gray-400 rounded-full cursor-ew-resize'
                  onPointerDown={(e) => handleResizeStart(e as any, 'right')}
                />
              </>
            )}
          </>
        )}
      </div>
    </Draggable>
  );
};

export const ObituaryPreview: React.FC<ObituaryPreviewProps> = ({
  obituary,
  onUpdate,
  isEditable,
  previewMode = 'desktop',
}) => {
  const [elementPositions, setElementPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const [editingElement, setEditingElement] = useState<string | null>(null);

  const boundaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialPositions: Record<string, { x: number; y: number }> = {};
    const keysToProcess = [
        'trauerspruch', 'introduction', 'fullname', 'additionalName', 'dates', 
        'mainText', 'sideTexts', 'additionalTexts', 'lastResidence', 
        'locationDate', 'symbolImage'
    ];
    
    keysToProcess.forEach(key => {
        const positionKey = `${key}Position`;
        if ((obituary as any)[positionKey]) {
            initialPositions[key] = (obituary as any)[positionKey];
        }
    });
    setElementPositions(initialPositions);
  }, [obituary]); 

  const handleUpdatePosition = useCallback(
    (field: string, newPosition: { x: number; y: number }) => {
      setElementPositions((prev) => ({ ...prev, [field]: newPosition }));
  
      if (field.startsWith("symbol-")) {
        const parts = field.split("-");
        const symbolIndex = parseInt(parts[parts.length - 1]);
  
        const updatedSymbols = obituary.symbols?.map((symbol, index) =>
          index === symbolIndex ? { ...symbol, position: newPosition } : symbol
        ) || [];
  
        onUpdate({ symbols: updatedSymbols });
      } else if (field.startsWith("photo-")) {
        const parts = field.split("-");
        const photoIndex = parseInt(parts[parts.length - 1]);
        const updatedPhotos = obituary.photos?.map((photo, index) =>
            index === photoIndex ? { ...photo, position: newPosition } : photo
        ) || [];
        onUpdate({ photos: updatedPhotos });
      }
      else {
        onUpdate({
          [`${field}Position`]: newPosition,
        });
      }
    },
    [onUpdate, obituary.symbols, obituary.photos],
  );

  const getBorderStyle = () => {
    const { frameStyle, frameWidth, frameColor } = obituary;
  
    if (frameStyle === 'none') {
      return {};
    }
  
    const baseStyle = {
      borderColor: frameColor ?? '#000000',
      borderWidth: `${frameWidth ?? 2}px`,
      borderStyle: 'solid',
    };
  
    switch (frameStyle) {
      case 'simple':
        return { ...baseStyle };
      case 'double':
        return { 
          ...baseStyle, 
          borderStyle: 'double',
          borderWidth: `${(frameWidth ?? 2) + 2}px`
        };
      case 'elegant':
        return { 
          ...baseStyle,
          borderImage: `linear-gradient(to bottom, ${frameColor ?? '#000000'}, transparent) 1`,
          borderStyle: 'solid',
          borderWidth: `${frameWidth ?? 2}px`,
        };
      default:
        return {};
    }
  };

  const getColorThemeClass = () => {
    switch (obituary.colorTheme) {
      case 'dark':
        return 'bg-slate-800 text-white';
      case 'warm':
        return 'bg-amber-50 text-amber-900';
      default:
        return 'bg-white text-foreground';
    }
  };

  const getPreviewContainerClass = () => {
    const getFormatClasses = () => {
      switch (obituary.format) {
        case '182x100':
          return 'w-full max-w-4xl aspect-[1.82/1]';
        case '136x100':
          return 'w-full max-w-3xl aspect-[1.36/1]';
        case '90x100':
          return 'w-full max-w-lg aspect-[0.9/1]';
        case '44x100':
          return 'w-full max-w-xs aspect-[0.44/1]';
        case '16x9':
          return 'w-full aspect-[16/9]';          
        default:
          return 'w-full aspect-[1.82/1]';
      }
    };
    const formatClasses = getFormatClasses();
    switch (previewMode) {
      case 'mobile':
        return `${formatClasses} scale-75`;
      case 'tablet':
        return `${formatClasses} scale-90`;
      default:
        return `${formatClasses}`;
    }
  };

  const hasValidContent = () => {
    const { firstName, lastName } = obituary.deceased;
    return firstName || lastName || obituary.texts.mainText;
  };

  const elementsToRender = [
    { field: 'trauerspruch', type: 'text', text: obituary.texts.trauerspruch },
    { field: 'introduction', type: 'text', text: obituary.texts.introduction },
    { field: 'fullname', type: 'text', text: `${obituary.deceased.firstName} ${obituary.deceased.lastName}` },
    { field: 'additionalName', type: 'text', text: obituary.deceased.additionalName },
    { field: 'dates', type: 'text', text: `${obituary.deceased.birthDate} - ${obituary.deceased.deathDate}` },
    { field: 'mainText', type: 'text', text: obituary.texts.mainText },
    { field: 'sideTexts', type: 'text', text: obituary.texts.sideTexts },
    { field: 'additionalTexts', type: 'text', text: obituary.texts.additionalTexts },
    { field: 'lastResidence', type: 'text', text: obituary.texts.lastResidence },
    { field: 'locationDate', type: 'text', text: obituary.texts.locationDate },
    { field: 'photoUrl', type: 'image', src: obituary.photoUrl },

    ...(obituary.symbols?.map((symbol, index) => ({
      field: `symbol-${symbol.id}-${index}`,
      type: 'image',
      src: symbol.image,
      symbolData: symbol
    })) || []),
    ...(obituary.photos?.map((photo, index) => ({
        field: `photo-${photo.id}-${index}`,
        type: 'image',
        src: photo.url,
        photoData: photo
    })) || []),
  ].filter(
    (e) =>
      (e.text && e.text.trim() !== '-' && e.text.trim() !== '') ||
      (e.src && e.src.trim() !== '')
  );

  const updateElementStyle = (field: string, key: string, value: any) => {
    if (field.startsWith('symbol-')) {
      const parts = field.split('-');
      const symbolIndex = parseInt(parts[parts.length - 1]);
      const updatedSymbols = obituary.symbols?.map((s, i) => i === symbolIndex ? { ...s, [key.toLowerCase()]: value } : s) || [];
      onUpdate({ symbols: updatedSymbols });
    } else if (field.startsWith('photo-')) {
      const parts = field.split('-');
      const photoIndex = parseInt(parts[parts.length - 1]);
      const updatedPhotos = obituary.photos?.map((p, i) => i === photoIndex ? { ...p, [key.toLowerCase()]: value } : p) || [];
      onUpdate({ photos: updatedPhotos });
    } else {
      onUpdate({ [`${field}${key}`]: value });
    }
  };

  const removeElement = (field: string | null) => {
    if (!field) return;
    if (field.startsWith('symbol-')) {
      const parts = field.split('-');
      const symbolIndex = parseInt(parts[parts.length - 1]);
      const updatedSymbols = obituary.symbols?.filter((_, index) => index !== symbolIndex) || [];
      onUpdate({ symbols: updatedSymbols });
    } else if (field.startsWith('photo-')) {
      const parts = field.split('-');
      const photoIndex = parseInt(parts[parts.length - 1]);
      const updatedPhotos = obituary.photos?.filter((_, index) => index !== photoIndex) || [];
      onUpdate({ photos: updatedPhotos });
    } else if (field === 'photoUrl') {
      onUpdate({ photoUrl: '' });
    } else if (field === 'fullname') {
      onUpdate({ deceased: { ...obituary.deceased, firstName: '', lastName: '' } });
    } else if (field === 'additionalName') {
      onUpdate({ deceased: { ...obituary.deceased, additionalName: '' } });
    } else if (field === 'dates') {
      onUpdate({ deceased: { ...obituary.deceased, birthDate: '', deathDate: '' } });
    } else {
      onUpdate({ texts: { ...obituary.texts, [field]: '' } });
    }
    setSelectedElement(null);
    setEditingElement(null);
  };

  const getTextFieldValue = (field: string, key: string) => {
    return (obituary as any)[`${field}${key}`];
  };

  const getPhotoValue = (field: string, prop: string) => {
    if (!field) return undefined;
    const parts = field.split('-');
    if (field.startsWith('photo-')) {
      const photoIndex = parseInt(parts[parts.length - 1]);
      return obituary.photos?.[photoIndex]?.[prop];
    }
    if (field.startsWith('symbol-')) {
      const symbolIndex = parseInt(parts[parts.length - 1]);
      return obituary.symbols?.[symbolIndex]?.[prop];
    }
    return undefined;
  };

  const handleToolbarAction = (action: string, field: string | null, payload?: any) => {
    if (!field) return;
    switch (action) {
      case 'bold':
        updateElementStyle(field, 'Bold', !getTextFieldValue(field, 'Bold'));
        break;
      case 'italic':
        updateElementStyle(field, 'Italic', !getTextFieldValue(field, 'Italic'));
        break;
      case 'underline':
        updateElementStyle(field, 'Underline', !getTextFieldValue(field, 'Underline'));
        break;
      case 'align':
        updateElementStyle(field, 'Alignment', payload);
        break;
      case 'fontSize':
        updateElementStyle(field, 'FontSize', payload);
        break;
      case 'fontFamily':
        updateElementStyle(field, 'FontFamily', payload);
        break;
      case 'color':
        updateElementStyle(field, 'Color', payload);
        break;
      case 'opacity':
        updateElementStyle(field, 'Opacity', payload);
        break;
      case 'remove':
        removeElement(field);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className='h-auto flex p-1 justify-center'
      onClick={() => {
        if (isEditable) {
          setSelectedElement(null);
          setEditingElement(null);
        }
      }}
    >
      <div className={getPreviewContainerClass()}>
        <Card
          ref={boundaryRef}
          data-preview='obituary'
          className={cn(
            'relative overflow-hidden transition-all duration-300',
            getColorThemeClass(),
            'shadow-memorial',
            !hasValidContent() && 'border-dashed border-muted-foreground/50',
          )}
          style={{
            backgroundImage:
              obituary.backgroundImage && !obituary.backgroundImage.toLowerCase().endsWith('.mp4')
                ? `url(${obituary.backgroundImage})`
                : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: obituary.colorTheme === 'dark' ? 'overlay' : 'normal',
            width: `${obituary.obituaryWidth}px`,
            height: `${obituary.obituaryHeight}px`,
            position: 'relative',
            ...getBorderStyle()
          }}
        >
          {obituary.backgroundImage?.toLowerCase().endsWith('.mp4') && (
            <video
              className='absolute inset-0 w-full h-full object-cover'
              src={obituary.backgroundImage}
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          <div
            className='absolute inset-0'
            style={{
              backgroundColor: obituary.colorTheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)',
              opacity: obituary.backgroundOpacity ? obituary.backgroundOpacity / 100 : 0.8,
            }}
          />

          {editingElement && isEditable && (
            <div
              data-obituary-toolbar="true"
              className="absolute top-0 left-1/2 -translate-x-1/2 z-50"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {(() => {
                const editingEl = elementsToRender.find(e => e.field === editingElement);
                if (!editingEl) return null;

                if (editingEl.type === 'text') {
                  const curFontSize = getTextFieldValue(editingElement, 'FontSize') ?? 16;
                  const curFontFamily = getTextFieldValue(editingElement, 'FontFamily') ?? 'Arial';
                  const curColor = getTextFieldValue(editingElement, 'Color') ?? '#000000';
                  const curBold = getTextFieldValue(editingElement, 'Bold') ?? false;
                  const curItalic = getTextFieldValue(editingElement, 'Italic') ?? false;
                  const curUnderline = getTextFieldValue(editingElement, 'Underline') ?? false;
                  const curAlignment = getTextFieldValue(editingElement, 'Alignment') ?? 'left';

                  return (
                    <div className="flex flex-col gap-2">
                      <WysiwygToolbar
                        bold={curBold}
                        italic={curItalic}
                        underline={curUnderline}
                        alignment={curAlignment}
                        fontSize={curFontSize}
                        fontFamily={curFontFamily}
                        color={curColor}
                        onBold={() => handleToolbarAction('bold', editingElement)}
                        onItalic={() => handleToolbarAction('italic', editingElement)}
                        onUnderline={() => handleToolbarAction('underline', editingElement)}
                        onAlignment={(align) => handleToolbarAction('align', editingElement, align)}
                        onFontSize={(size) => handleToolbarAction('fontSize', editingElement, size)}
                        onFontFamily={(family) => handleToolbarAction('fontFamily', editingElement, family)}
                        onColor={(color) => handleToolbarAction('color', editingElement, color)}
                        showAdvanced={true}
                        fontSizes={[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]}
                        fontFamilies={fontFamilies}
                      />
                      <button
                        type="button"
                        className="self-end p-2 rounded-md hover:bg-red-100 transition-colors border border-red-200"
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onClick={() => handleToolbarAction('remove', editingElement)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  );
                } else {
                  const curOpacity = getPhotoValue(editingElement, 'opacity') ??
                                    (getTextFieldValue(editingElement!, 'Opacity') ?? 100);
                  return (
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-lg p-2 space-x-2">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm">Opacity:</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={curOpacity}
                          onChange={(e) => handleToolbarAction('opacity', editingElement, parseInt(e.target.value))}
                          className="w-28"
                        />
                        <span className="text-sm w-8">{curOpacity}%</span>
                      </div>
                      <button
                        type="button"
                        className="p-2 rounded-md hover:bg-gray-200"
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onClick={() => handleToolbarAction('remove', editingElement)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          <div className='relative w-full h-full z-10' onClick={(e) => e.stopPropagation()}>
            {elementsToRender.map((element, index) => {
              const obituaryWidthNumber = typeof obituary.obituaryWidth === 'string' ? parseInt(obituary.obituaryWidth, 10) : obituary.obituaryWidth || 800;
              const defaultX = (obituaryWidthNumber / 2) - 100; 
              const defaultY = 50 + (index * 40); 

              let position;

              if (element.field.startsWith("symbol-")) {
                position = element.symbolData?.position || { x: defaultX, y: defaultY };
              } else if (element.field.startsWith("photo-")) {
                position = element.photoData?.position || { x: defaultX, y: defaultY };
              }
              else {
                position = elementPositions[element.field] || { x: defaultX, y: defaultY };
              }
              
              return (
                <DraggableElement
                  key={element.field}
                  element={element as any}
                  obituary={obituary}
                  onUpdate={onUpdate}
                  position={position}
                  onDrag={(pos) => handleUpdatePosition(element.field, pos)}
                  onSelect={(id) => setSelectedElement(id)}
                  onEditChange={(fieldOrNull) => {
                    setEditingElement(fieldOrNull);
                    if (fieldOrNull) {
                      setSelectedElement(fieldOrNull);
                    }
                  }}
                  isSelected={selectedElement === element.field}
                  isEditable={isEditable}
                  boundaryRef={boundaryRef}
                />
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
