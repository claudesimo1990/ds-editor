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
        'flex items-center gap-1 bg-white border border-gray-300 rounded-lg shadow-lg p-1.5',
        'backdrop-blur-sm',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Format de texte - Gras, Italique, Souligné */}
      <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1.5">
        <button
          type="button"
          onClick={onBold}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded-md transition-colors',
            'hover:bg-gray-100 active:bg-gray-200',
            bold && 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          )}
          title="Gras (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onItalic}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded-md transition-colors',
            'hover:bg-gray-100 active:bg-gray-200',
            italic && 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          )}
          title="Italique (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onUnderline}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded-md transition-colors',
            'hover:bg-gray-100 active:bg-gray-200',
            underline && 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          )}
          title="Souligné (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
      </div>

      {/* Alignement */}
      <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1.5">
        <button
          type="button"
          onClick={() => onAlignment?.('left')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded-md transition-colors',
            'hover:bg-gray-100 active:bg-gray-200',
            alignment === 'left' && 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          )}
          title="Aligner à gauche"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onAlignment?.('center')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded-md transition-colors',
            'hover:bg-gray-100 active:bg-gray-200',
            alignment === 'center' && 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          )}
          title="Centrer"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onAlignment?.('right')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'p-2 rounded-md transition-colors',
            'hover:bg-gray-100 active:bg-gray-200',
            alignment === 'right' && 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          )}
          title="Aligner à droite"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      {showAdvanced && (
        <>
          {/* Taille de police */}
          <div className="relative border-r border-gray-300 pr-1.5 mr-1.5">
            <button
              type="button"
              onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                'flex items-center gap-1 px-2 py-2 rounded-md transition-colors',
                'hover:bg-gray-100 active:bg-gray-200',
                showFontSizeMenu && 'bg-gray-100'
              )}
              title="Taille de police"
            >
              <Type className="w-4 h-4" />
              <span className="text-sm font-medium min-w-[2rem] text-center">{fontSize}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFontSizeMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
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
                      'w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 transition-colors',
                      fontSize === size && 'bg-blue-100 text-blue-700 font-semibold'
                    )}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Famille de police */}
          <div className="relative border-r border-gray-300 pr-1.5 mr-1.5">
            <button
              type="button"
              onClick={() => setShowFontFamilyMenu(!showFontFamilyMenu)}
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                'flex items-center gap-1 px-2 py-2 rounded-md transition-colors',
                'hover:bg-gray-100 active:bg-gray-200',
                showFontFamilyMenu && 'bg-gray-100'
              )}
              title="Famille de police"
            >
              <span className="text-sm font-medium min-w-[6rem] text-left" style={{ fontFamily }}>
                {fontFamily}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFontFamilyMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto min-w-[12rem]">
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
                      'w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 transition-colors',
                      fontFamily === family && 'bg-blue-100 text-blue-700 font-semibold'
                    )}
                    style={{ fontFamily }}
                  >
                    {family}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Couleur du texte */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                'p-2 rounded-md transition-colors',
                'hover:bg-gray-100 active:bg-gray-200',
                showColorPicker && 'bg-gray-100'
              )}
              title="Couleur du texte"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    onColor?.(e.target.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full h-10 cursor-pointer rounded border border-gray-300"
                />
                <div className="mt-2 text-xs text-gray-600 text-center">{color}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

