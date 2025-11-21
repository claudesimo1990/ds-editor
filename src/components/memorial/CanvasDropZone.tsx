import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface CanvasDropZoneProps {
  children: React.ReactNode;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const CanvasDropZone: React.FC<CanvasDropZoneProps> = ({ children, canvasRef }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-full h-full canvas-container",
        isOver && "ring-2 ring-blue-500 ring-offset-2 bg-blue-50/50"
      )}
    >
      {children}
    </div>
  );
};

