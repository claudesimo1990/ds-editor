import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  Flower2, 
  Cross, 
  Star, 
  Sparkles
} from 'lucide-react';

interface SimpleIconGalleryProps {
  onIconSelect: (iconContent: string, type: 'emoji' | 'svg') => void;
}

// Exactement les mêmes icônes que dans l'ancien éditeur
const iconAssets = [
  { id: 'icon-heart', name: 'Cœur', icon: Heart },
  { id: 'icon-flower', name: 'Fleur', icon: Flower2 },
  { id: 'icon-cross', name: 'Croix', icon: Cross },
  { id: 'icon-star', name: 'Étoile', icon: Star },
  { id: 'icon-sparkles', name: 'Étincelles', icon: Sparkles },
];

export const SimpleIconGallery: React.FC<SimpleIconGalleryProps> = ({ onIconSelect }) => {
  const handleIconClick = (iconName: string) => {
    // Utiliser des emojis correspondants pour simplifier
    const emojiMap: Record<string, string> = {
      'Cœur': '❤️',
      'Fleur': '🌸',
      'Croix': '✝️',
      'Étoile': '⭐',
      'Étincelles': '✨',
    };
    const emoji = emojiMap[iconName] || '⭐';
    onIconSelect(emoji, 'emoji');
  };

  return (
    <ScrollArea className="h-[500px]">
      <div className="grid grid-cols-2 gap-3">
        {iconAssets.map((asset) => {
          const IconComponent = asset.icon;
          return (
            <button
              key={asset.id}
              onClick={() => handleIconClick(asset.name)}
              className="aspect-square rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors flex items-center justify-center bg-white hover:bg-gray-50"
              title={asset.name}
            >
              <IconComponent className="w-8 h-8 text-gray-700" />
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

