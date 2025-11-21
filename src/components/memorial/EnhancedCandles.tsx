
import React from 'react';
import { Flame } from 'lucide-react';
import WebGLCandle from './WebGLCandle';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';

interface EnhancedCandlesProps {
  candleCount: number;
  litCandles?: Array<{ id: string; lit_by_name: string; message: string }>;
  className?: string;
}

const CSSCandles: React.FC<{ candleCount: number; className?: string }> = ({ 
  candleCount, 
  className = "" 
}) => {
  return (
    <div className={`flex space-x-8 justify-center ${className}`}>
      {Array.from({ length: Math.min(candleCount, 7) }).map((_, index) => (
        <div key={index} className="flex flex-col items-center" style={{ animationDelay: `${index * 0.5}s` }}>
          <div className="relative">
            {/* Erweiterte CSS-Flamme */}
            <div className="relative w-6 h-12">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-12 bg-gradient-to-t from-yellow-600 to-yellow-300 rounded-full" />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <div className="w-4 h-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-full" 
                       style={{ 
                         clipPath: 'ellipse(50% 70% at 50% 100%)',
                         animation: 'flicker 2s ease-in-out infinite alternate'
                       }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-300 rounded-full opacity-60" 
                       style={{ 
                         clipPath: 'ellipse(30% 50% at 50% 100%)',
                         animation: 'flicker 1.5s ease-in-out infinite alternate-reverse'
                       }} />
                </div>
              </div>
              
              {/* Lichtschein */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-400/20 rounded-full blur-md animate-pulse" />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400/30 rounded-full blur-sm animate-pulse" />
            </div>
          </div>
          
          {/* Verbesserter Kerzenkörper */}
          <div className="w-8 h-16 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 rounded-t-full mt-1 shadow-lg relative">
            {/* Wachs-Tropfen */}
            <div className="absolute top-2 left-1 w-1 h-3 bg-amber-200 rounded-full opacity-60" />
            <div className="absolute top-4 right-1 w-0.5 h-2 bg-amber-300 rounded-full opacity-40" />
            
            {/* Schatten am Boden */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-black/10 rounded-full blur-sm" />
          </div>
        </div>
      ))}
      
    </div>
  );
};

const EnhancedCandles: React.FC<EnhancedCandlesProps> = ({ 
  candleCount, 
  litCandles = [], 
  className = "" 
}) => {
  const { shouldUseWebGL } = useWebGLSupport();
  const displayCount = Math.max(candleCount, 5);

  if (shouldUseWebGL) {
    return (
      <div className={className}>
        <WebGLCandle candleCount={displayCount} />
      </div>
    );
  }

  return <CSSCandles candleCount={displayCount} className={className} />;
};

export default EnhancedCandles;
