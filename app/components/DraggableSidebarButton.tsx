'use client';

import { useDraggable } from '@dnd-kit/core';
import { BlockType } from './types';

interface DraggableSidebarButtonProps {
  type: BlockType;
  label: string;
  icon: string;
  onClick?: () => void;
}

export default function DraggableSidebarButton({ type, label, icon, onClick }: DraggableSidebarButtonProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      type: 'sidebar-item',
      blockType: type,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleClick = (e: React.MouseEvent) => {
    // Also allow clicking to add block
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm hover:shadow ${
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

