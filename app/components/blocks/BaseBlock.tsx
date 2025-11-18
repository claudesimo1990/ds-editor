import { Block } from '../types';

interface BaseBlockProps {
  block: Block;
  children: React.ReactNode;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function BaseBlock({
  children,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
}: BaseBlockProps) {
  return (
    <div className="group relative rounded-xl border-2 border-transparent bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg dark:bg-zinc-900 dark:hover:border-blue-700">
      {/* Controls */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onDelete}
          className="rounded-lg bg-red-100 p-2 text-red-600 transition-all hover:bg-red-200 hover:scale-110 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          title="Löschen"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
}

