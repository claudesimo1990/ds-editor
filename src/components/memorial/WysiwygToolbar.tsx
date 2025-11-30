import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Minus,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WysiwygToolbarProps {
  // État actuel du texte
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  alignment?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  
  // Callbacks
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onAlignment?: (align: 'left' | 'center' | 'right') => void;
  onFontSize?: (size: number) => void;
  onFontFamily?: (family: string) => void;
  onColor?: (color: string) => void;
  
  // Options personnalisables
  fontSizes?: number[];
  fontFamilies?: string[];
  showAdvanced?: boolean;
  className?: string;
}

const DEFAULT_FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];
const DEFAULT_FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Comic Sans MS',
  'Trebuchet MS',
  'Impact',
];

export const WysiwygToolbar: React.FC<WysiwygToolbarProps> = ({
  bold = false,
  italic = false,
  underline = false,
  alignment = 'left',
  fontSize = 16,
  fontFamily = 'Arial',
  color = '#000000',
  onBold,
  onItalic,
  onUnderline,
  onAlignment,
  onFontSize,
  onFontFamily,
  onColor,
  fontSizes = DEFAULT_FONT_SIZES,
  fontFamilies = DEFAULT_FONT_FAMILIES,
  showAdvanced = true,
  className,
}) => {
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showFontFamilyMenu, setShowFontFamilyMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);

  return (
    <div
      className={cn(
        'flex items-center gap-0 bg-transparent',
        'relative z-[100]',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{ pointerEvents: 'auto', zIndex: 100 }}
    >
      {/* Format de texte - Gras, Italique, Souligné */}
      <div className="flex items-center gap-1 border-r border-gray-600 pr-3 mr-3">
        <button
          type="button"
          onClick={onBold}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded transition-colors',
            'hover:bg-gray-700 active:bg-gray-600',
            bold && 'bg-purple-600 text-white hover:bg-purple-700'
          )}
          title="Fett (Strg+B)"
        >
          <Bold className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onItalic}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded transition-colors',
            'hover:bg-gray-700 active:bg-gray-600',
            italic && 'bg-purple-600 text-white hover:bg-purple-700'
          )}
          title="Kursiv (Strg+I)"
        >
          <Italic className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onUnderline}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded transition-colors',
            'hover:bg-gray-700 active:bg-gray-600',
            underline && 'bg-purple-600 text-white hover:bg-purple-700'
          )}
          title="Unterstrichen (Strg+U)"
        >
          <Underline className="w-5 h-5" />
        </button>
      </div>

      {/* Ausrichtung */}
      <div className="flex items-center gap-1 border-r border-gray-600 pr-3 mr-3">
        <button
          type="button"
          onClick={() => onAlignment?.('left')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded transition-colors text-gray-300',
            'hover:bg-gray-700 active:bg-gray-600',
            alignment === 'left' && 'bg-purple-600 text-white hover:bg-purple-700'
          )}
          title="Links ausrichten"
        >
          <AlignLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onAlignment?.('center')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded transition-colors text-gray-300',
            'hover:bg-gray-700 active:bg-gray-600',
            alignment === 'center' && 'bg-purple-600 text-white hover:bg-purple-700'
          )}
          title="Zentrieren"
        >
          <AlignCenter className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onAlignment?.('right')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded transition-colors text-gray-300',
            'hover:bg-gray-700 active:bg-gray-600',
            alignment === 'right' && 'bg-purple-600 text-white hover:bg-purple-700'
          )}
          title="Rechts ausrichten"
        >
          <AlignRight className="w-5 h-5" />
        </button>
      </div>

      {showAdvanced && (
        <>
          {/* Schriftgröße */}
          <div className="relative border-r border-gray-600 pr-3 mr-3">
            <button
              type="button"
              onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded transition-colors text-gray-300',
                'hover:bg-gray-700 active:bg-gray-600',
                showFontSizeMenu && 'bg-gray-700'
              )}
              title="Schriftgröße"
            >
              <Type className="w-5 h-5" />
              <span className="text-sm font-medium min-w-[2.5rem] text-center">{fontSize}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showFontSizeMenu && (
              <div className="absolute top-full left-0 mt-2 bg-[#2d2d2d] border border-gray-600 rounded-lg shadow-xl z-[200] max-h-64 overflow-y-auto">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      onFontSize?.(size);
                      setShowFontSizeMenu(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                      'w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors',
                      fontSize === size && 'bg-purple-600 text-white font-semibold'
                    )}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Schriftart */}
          <div className="relative border-r border-gray-600 pr-3 mr-3">
            <button
              type="button"
              onClick={() => setShowFontFamilyMenu(!showFontFamilyMenu)}
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded transition-colors text-gray-300',
                'hover:bg-gray-700 active:bg-gray-600',
                showFontFamilyMenu && 'bg-gray-700'
              )}
              title="Schriftart"
            >
              <span className="text-sm font-medium min-w-[8rem] text-left" style={{ fontFamily }}>
                {fontFamily}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showFontFamilyMenu && (
              <div className="absolute top-full left-0 mt-2 bg-[#2d2d2d] border border-gray-600 rounded-lg shadow-xl z-[200] max-h-64 overflow-y-auto min-w-[12rem]">
                {fontFamilies.map((family) => (
                  <button
                    key={family}
                    type="button"
                    onClick={() => {
                      onFontFamily?.(family);
                      setShowFontFamilyMenu(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                      'w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors',
                      fontFamily === family && 'bg-purple-600 text-white font-semibold'
                    )}
                    style={{ fontFamily }}
                  >
                    {family}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Textfarbe */}
          <div className="relative border-r border-gray-600 pr-3 mr-3">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                'p-2 rounded transition-colors text-gray-300',
                'hover:bg-gray-700 active:bg-gray-600',
                showColorPicker && 'bg-gray-700'
              )}
              title="Textfarbe"
            >
              <Palette className="w-5 h-5" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full right-0 mt-2 bg-[#2d2d2d] border border-gray-600 rounded-lg shadow-xl z-[200] p-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    onColor?.(e.target.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full h-10 cursor-pointer rounded border border-gray-600"
                />
                <div className="mt-2 text-xs text-gray-400 text-center">{color}</div>
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
};

