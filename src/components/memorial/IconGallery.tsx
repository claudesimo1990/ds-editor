import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  Flower2, 
  Cross, 
  Star, 
  Sparkles,
  Flame,
  Bird,
  Leaf,
  Sun,
  Moon,
  Cloud,
  Rainbow
} from 'lucide-react';

interface IconGalleryProps {
  onIconSelect: (iconContent: string, type: 'emoji' | 'svg') => void;
}

const emojiIcons = [
  { name: 'Cœur', emoji: '❤️' },
  { name: 'Bougie', emoji: '🕯️' },
  { name: 'Colombe', emoji: '🕊️' },
  { name: 'Fleur', emoji: '🌸' },
  { name: 'Rose', emoji: '🌹' },
  { name: 'Étoile', emoji: '⭐' },
  { name: 'Croix', emoji: '✝️' },
  { name: 'Ange', emoji: '👼' },
  { name: 'Paix', emoji: '☮️' },
  { name: 'Infini', emoji: '∞' },
  { name: 'Soleil', emoji: '☀️' },
  { name: 'Lune', emoji: '🌙' },
];

const lucideIcons = [
  { name: 'Cœur', icon: Heart },
  { name: 'Fleur', icon: Flower2 },
  { name: 'Croix', icon: Cross },
  { name: 'Étoile', icon: Star },
  { name: 'Étincelles', icon: Sparkles },
  { name: 'Flamme', icon: Flame },
  { name: 'Oiseau', icon: Bird },
  { name: 'Feuille', icon: Leaf },
  { name: 'Soleil', icon: Sun },
  { name: 'Lune', icon: Moon },
  { name: 'Nuage', icon: Cloud },
  { name: 'Arc-en-ciel', icon: Rainbow },
];

export const IconGallery: React.FC<IconGalleryProps> = ({ onIconSelect }) => {
  const handleEmojiClick = (emoji: string) => {
    onIconSelect(emoji, 'emoji');
  };

  const handleLucideIconClick = async (IconComponent: React.ComponentType<any>) => {
    // Pour les icônes Lucide, on les convertit en SVG
    // Note: Cette approche nécessite de rendre l'icône et de la convertir
    // Pour l'instant, on utilise une approche simplifiée avec des emojis
    // ou on peut créer des SVG statiques
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <!-- Icon SVG would go here -->
    </svg>`;
    onIconSelect(svgString, 'svg');
  };

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-6">
        {/* Emojis */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Emojis</h3>
          <div className="grid grid-cols-4 gap-2">
            {emojiIcons.map((item, index) => (
              <button
                key={`emoji-${index}`}
                onClick={() => handleEmojiClick(item.emoji)}
                className="aspect-square rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors flex items-center justify-center text-3xl bg-white hover:bg-gray-50"
                title={item.name}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Icônes Lucide */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Icônes</h3>
          <div className="grid grid-cols-4 gap-2">
            {lucideIcons.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={`icon-${index}`}
                  onClick={() => {
                    // Pour simplifier, on utilise l'emoji correspondant si disponible
                    const emojiMap: Record<string, string> = {
                      'Cœur': '❤️',
                      'Fleur': '🌸',
                      'Croix': '✝️',
                      'Étoile': '⭐',
                      'Étincelles': '✨',
                      'Flamme': '🔥',
                      'Oiseau': '🕊️',
                      'Feuille': '🍃',
                      'Soleil': '☀️',
                      'Lune': '🌙',
                      'Nuage': '☁️',
                      'Arc-en-ciel': '🌈',
                    };
                    const emoji = emojiMap[item.name] || '⭐';
                    handleEmojiClick(emoji);
                  }}
                  className="aspect-square rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors flex items-center justify-center bg-white hover:bg-gray-50"
                  title={item.name}
                >
                  <IconComponent className="w-6 h-6 text-gray-700" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

