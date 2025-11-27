import React from 'react';
import { SnapGuide } from '@/hooks/useSnapAlignment';

interface SnapGuidesProps {
  guides: SnapGuide[];
  containerRef: React.RefObject<HTMLElement>;
}

export const SnapGuides: React.FC<SnapGuidesProps> = ({ guides, containerRef }) => {
  if (!guides || guides.length === 0 || !containerRef.current) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[9999]"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {guides.map((guide, index) => {
        if (guide.type === 'horizontal') {
          return (
            <div
              key={`guide-h-${index}`}
              className="absolute bg-blue-500"
              style={{
                left: `${Math.max(0, guide.start)}px`,
                top: `${guide.position}px`,
                width: `${Math.max(0, guide.end - guide.start)}px`,
                height: '2px',
                zIndex: 9999,
                opacity: 0.7,
                boxShadow: '0 0 2px rgba(59, 130, 246, 0.5)',
              }}
            />
          );
        } else {
          return (
            <div
              key={`guide-v-${index}`}
              className="absolute bg-blue-500"
              style={{
                left: `${guide.position}px`,
                top: `${Math.max(0, guide.start)}px`,
                width: '2px',
                height: `${Math.max(0, guide.end - guide.start)}px`,
                zIndex: 9999,
                opacity: 0.7,
                boxShadow: '0 0 2px rgba(59, 130, 246, 0.5)',
              }}
            />
          );
        }
      })}
    </div>
  );
};

