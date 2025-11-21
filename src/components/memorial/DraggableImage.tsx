import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DraggableImageProps {
  imageUrl: string;
  onDrop: (imageUrl: string) => void;
}

export const DraggableImage: React.FC<DraggableImageProps> = ({ imageUrl, onDrop }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `image-${imageUrl}`,
    data: {
      type: 'image',
      url: imageUrl,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onDrop(imageUrl)}
      className={cn(
        "aspect-square rounded-lg overflow-hidden border-2 border-gray-600 hover:border-purple-500 transition-colors cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <img
        src={imageUrl}
        alt="Upload"
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
    </div>
  );
};

