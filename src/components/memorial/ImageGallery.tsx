import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageIcon } from 'lucide-react';

interface ImageGalleryProps {
  onImageSelect: (imageUrl: string) => void;
  photos?: (string | { src: string; [key: string]: any })[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ onImageSelect, photos = [] }) => {
  // Charger les images depuis la Fotogalerie (Live-Vorschau)
  const imageAssets = useMemo(() => {
    if (!photos || photos.length === 0) {
      return [];
    }

    return photos.map((photo, index) => {
      const src = typeof photo === 'string' ? photo : photo.src || '';
      const name = typeof photo === 'string' 
        ? `Photo ${index + 1}` 
        : photo.name || `Photo ${index + 1}`;
      
      return {
        id: `photo-${index}`,
        name: name,
        src: src,
      };
    }).filter(img => img.src); // Filtrer les images sans src
  }, [photos]);

  if (imageAssets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aucune image disponible</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="grid grid-cols-2 gap-2">
        {imageAssets.map((image) => (
          <button
            key={image.id}
            onClick={() => onImageSelect(image.src)}
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors group"
          >
            <img
              src={image.src}
              alt={image.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

