'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';

interface SortableBlockWrapperProps {
  id: string;
  children: ReactNode;
}

export default function SortableBlockWrapper({ id, children }: SortableBlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    scale: isDragging ? 0.95 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? 'z-50 rotate-2 shadow-2xl' : ''}`}
    >
      {/* Drag Handle - immer sichtbar beim Hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-14 top-1/2 -translate-y-1/2 flex items-center opacity-0 transition-all group-hover:opacity-100 cursor-grab active:cursor-grabbing z-10"
      >
        <div className="flex flex-col gap-1 rounded-lg bg-white border-2 border-zinc-300 p-2.5 shadow-lg hover:border-blue-500 hover:bg-blue-50 dark:bg-zinc-800 dark:border-zinc-600 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 transition-all hover:scale-110">
          <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="5" r="1.5" />
            <circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" />
            <circle cx="15" cy="19" r="1.5" />
          </svg>
        </div>
      </div>
      {children}
    </div>
  );
}

