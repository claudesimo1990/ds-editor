'use client';

import { useDroppable } from '@dnd-kit/core';

interface DropZoneProps {
  id: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}

export default function DropZone({ id, children, isEmpty = false }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] transition-all ${
        isOver
          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 border-dashed rounded-xl'
          : isEmpty
          ? 'border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl'
          : ''
      }`}
    >
      {children}
    </div>
  );
}

