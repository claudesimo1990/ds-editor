import React, { useState } from 'react';
import { Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OpacityToolProps {
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  className?: string;
}

export const OpacityTool: React.FC<OpacityToolProps> = ({
  opacity = 100,
  onOpacityChange,
  className,
}) => {
  const [showOpacityMenu, setShowOpacityMenu] = useState(false);

  const handleOpacityChange = (value: number) => {
    onOpacityChange?.(value);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setShowOpacityMenu(!showOpacityMenu)}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          'p-2 rounded transition-colors text-gray-300',
          'hover:bg-gray-700 active:bg-gray-600',
          showOpacityMenu && 'bg-gray-700',
          opacity < 100 && 'bg-purple-600 text-white hover:bg-purple-700'
        )}
        title="Transparenz"
      >
        <Droplets className="w-5 h-5" />
      </button>
      {showOpacityMenu && (
        <div className="absolute top-full right-0 mt-2 bg-[#2d2d2d] border border-gray-600 rounded-lg shadow-xl z-[200] p-4 min-w-[240px]">
          <div className="mb-4">
            <label className="text-xs text-gray-300 mb-3 block font-medium">
              Transparenz: {opacity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => {
                handleOpacityChange(parseInt(e.target.value));
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${opacity}%, #374151 ${opacity}%, #374151 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="flex gap-2">
            {[100, 75, 50, 25, 0].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  handleOpacityChange(value);
                }}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                  'flex-1 px-2 py-2 text-xs rounded border-2 transition-colors font-medium',
                  opacity === value
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                )}
              >
                {value}%
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

