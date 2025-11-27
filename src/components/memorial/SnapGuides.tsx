import React from 'react';
import { SnapGuide } from '@/hooks/useSnapAlignment';

interface SnapGuidesProps {
  guides: SnapGuide[];
  containerRef: React.RefObject<HTMLElement>;
}

export const SnapGuides: React.FC<SnapGuidesProps> = ({ guides, containerRef }) => {
  if (!guides || guides.length === 0) {
    return null;
  }

  // Si le containerRef n'est pas disponible, on ne peut pas positionner les guides
  if (!containerRef.current) {
    return null;
  }

  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10000,
        overflow: 'visible',
      }}
    >
      {guides.map((guide, index) => {
        if (guide.type === 'horizontal') {
          return (
            <div
              key={`guide-h-${index}`}
              style={{
                position: 'absolute',
                left: `${Math.max(0, guide.start)}px`,
                top: `${guide.position}px`,
                width: `${Math.max(0, guide.end - guide.start)}px`,
                height: '1px',
                backgroundColor: '#3b82f6',
                opacity: 0.8,
                zIndex: 10001,
                boxShadow: '0 0 2px rgba(59, 130, 246, 0.8)',
                transform: 'translateZ(0)',
              }}
            />
          );
        } else {
          return (
            <div
              key={`guide-v-${index}`}
              style={{
                position: 'absolute',
                left: `${guide.position}px`,
                top: `${Math.max(0, guide.start)}px`,
                width: '1px',
                height: `${Math.max(0, guide.end - guide.start)}px`,
                backgroundColor: '#3b82f6',
                opacity: 0.8,
                zIndex: 10001,
                boxShadow: '0 0 2px rgba(59, 130, 246, 0.8)',
                transform: 'translateZ(0)',
              }}
            />
          );
        }
      })}
    </div>
  );
};

