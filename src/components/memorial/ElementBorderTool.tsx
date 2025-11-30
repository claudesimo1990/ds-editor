import React, { useState } from 'react';
import { Circle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ElementBorderToolProps {
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed';
  onStrokeColor?: (color: string) => void;
  onStrokeWidth?: (width: number) => void;
  onStrokeStyle?: (style: 'solid' | 'dashed') => void;
  onRemoveBorder?: () => void;
  className?: string;
}

export const ElementBorderTool: React.FC<ElementBorderToolProps> = ({
  strokeColor = '#000000',
  strokeWidth = 0,
  strokeStyle = 'solid',
  onStrokeColor,
  onStrokeWidth,
  onStrokeStyle,
  onRemoveBorder,
  className,
}) => {
  const [showStrokeMenu, setShowStrokeMenu] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setShowStrokeMenu(!showStrokeMenu)}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          'p-2 rounded transition-colors text-gray-300',
          'hover:bg-gray-700 active:bg-gray-600',
          showStrokeMenu && 'bg-gray-700',
          strokeWidth > 0 && 'bg-purple-600 text-white hover:bg-purple-700'
        )}
        title="Rahmen des Elements"
      >
        <Circle className="w-5 h-5" />
      </button>
      {showStrokeMenu && (
        <div className="absolute top-full right-0 mt-2 bg-[#2d2d2d] border border-gray-600 rounded-lg shadow-xl z-[200] p-4 min-w-[240px]">
          <div className="mb-4">
            <label className="text-xs text-gray-300 mb-2 block font-medium">Rahmenfarbe</label>
            <input
              type="color"
              value={strokeColor || '#000000'}
              onChange={(e) => {
                onStrokeColor?.(e.target.value);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full h-12 cursor-pointer rounded border-2 border-gray-600"
            />
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-300 mb-3 block font-medium">Dicke: {strokeWidth}px</label>
            <input
              type="range"
              min="0"
              max="20"
              value={strokeWidth || 0}
              onChange={(e) => {
                onStrokeWidth?.(parseInt(e.target.value));
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>0</span>
              <span>20</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-300 mb-3 block font-medium">Linienstil</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onStrokeStyle?.('solid');
                }}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                  'flex-1 px-3 py-2.5 text-xs rounded border-2 transition-colors flex items-center justify-center gap-2 font-medium',
                  strokeStyle === 'solid'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                )}
              >
                <div className="w-8 h-0.5 bg-current" />
                <span>Durchgehend</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onStrokeStyle?.('dashed');
                }}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                  'flex-1 px-3 py-2.5 text-xs rounded border-2 transition-colors flex items-center justify-center gap-2 font-medium',
                  strokeStyle === 'dashed'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                )}
              >
                <div className="w-8 h-0.5 border-t-2 border-current border-dashed" />
                <span>Gestrichelt</span>
              </button>
            </div>
          </div>
          {strokeWidth > 0 && (
            <div className="mb-4 pt-4 border-t border-gray-600">
              <button
                type="button"
                onClick={() => {
                  onRemoveBorder?.();
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full px-3 py-2.5 text-xs rounded border-2 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <X className="w-4 h-4" />
                <span>Rahmen entfernen</span>
              </button>
            </div>
          )}
          <div className="flex gap-2">
            {[0, 1, 2, 3, 5, 10].map((width) => (
              <button
                key={width}
                type="button"
                onClick={() => {
                  onStrokeWidth?.(width);
                  if (width > 0 && !strokeColor) {
                    onStrokeColor?.('#000000');
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                  'flex-1 px-2 py-2 text-xs rounded border-2 transition-colors font-medium',
                  strokeWidth === width
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                )}
              >
                {width}px
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

