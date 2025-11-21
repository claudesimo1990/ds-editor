import React, { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { 
  Image, Video, Type, Shapes, Sparkles, Heart, 
  Flower2, Cross, Star, Search, X, ChevronRight,
  ImageIcon, VideoIcon, TypeIcon, SparklesIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface DraggableAssetProps {
  id: string;
  type: 'icon' | 'image' | 'video' | 'text' | 'shape';
  src?: string;
  name: string;
  icon?: React.ReactNode;
  text?: string;
  fontSize?: number;
}

const DraggableAsset: React.FC<DraggableAssetProps> = ({ id, type, src, name, icon, text, fontSize }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      type,
      src,
      name,
      text,
      fontSize,
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
      className={`
        group relative cursor-grab active:cursor-grabbing
        bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700
        hover:border-blue-500 hover:shadow-lg transition-all duration-200
        ${isDragging ? 'z-50' : ''}
      `}
    >
      <div className="aspect-square flex items-center justify-center p-3">
        {type === 'image' && src ? (
          <img 
            src={src} 
            alt={name}
            className="w-full h-full object-cover rounded"
            draggable={false}
          />
        ) : type === 'video' && src ? (
          <div className="relative w-full h-full">
            <video 
              src={src}
              className="w-full h-full object-cover rounded"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoIcon className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>
        ) : icon ? (
          <div className="text-4xl">{icon}</div>
        ) : (
          <TypeIcon className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="truncate text-center">{name}</p>
      </div>
    </div>
  );
};

interface AssetLibraryProps {
  onAssetAdd?: (asset: { type: string; data: any }) => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ onAssetAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('icons');

  // Charger les icônes disponibles
  const iconAssets = useMemo(() => {
    const icons = [
      { id: 'icon-heart', name: 'Cœur', icon: <Heart className="w-full h-full" />, type: 'icon' as const },
      { id: 'icon-flower', name: 'Fleur', icon: <Flower2 className="w-full h-full" />, type: 'icon' as const },
      { id: 'icon-cross', name: 'Croix', icon: <Cross className="w-full h-full" />, type: 'icon' as const },
      { id: 'icon-star', name: 'Étoile', icon: <Star className="w-full h-full" />, type: 'icon' as const },
      { id: 'icon-sparkles', name: 'Étincelles', icon: <Sparkles className="w-full h-full" />, type: 'icon' as const },
    ];
    return icons.filter(icon => 
      icon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Charger les images depuis les assets
  const imageAssets = useMemo(() => {
    try {
      const modules = import.meta.glob('/src/assets/symbols/*.{png,PNG,jpg,JPG}', { eager: true, as: 'url' }) as Record<string, string>;
      const images = Object.entries(modules).map(([path, url]) => {
        const filename = path.split('/').pop() || 'image';
        const name = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        return {
          id: `image-${filename}`,
          name: name,
          src: url,
          type: 'image' as const,
        };
      }).filter(img => 
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return images;
    } catch (e) {
      return [];
    }
  }, [searchQuery]);

  // Charger les vidéos depuis les assets
  const videoAssets = useMemo(() => {
    try {
      const modules = import.meta.glob('/src/assets/memorial-bg/*.mp4', { eager: true, as: 'url' }) as Record<string, string>;
      const videos = Object.entries(modules).map(([path, url]) => {
        const filename = path.split('/').pop() || 'video';
        const name = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        return {
          id: `video-${filename}`,
          name: name,
          src: url,
          type: 'video' as const,
        };
      }).filter(video => 
        video.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return videos;
    } catch (e) {
      return [];
    }
  }, [searchQuery]);

  // Éléments texte prédéfinis
  const textAssets = useMemo(() => {
    const texts = [
      { id: 'text-title', name: 'Titre', type: 'text' as const, text: 'Titre', fontSize: 32 },
      { id: 'text-subtitle', name: 'Sous-titre', type: 'text' as const, text: 'Sous-titre', fontSize: 24 },
      { id: 'text-body', name: 'Texte', type: 'text' as const, text: 'Votre texte ici', fontSize: 16 },
      { id: 'text-quote', name: 'Citation', type: 'text' as const, text: 'Citation', fontSize: 18 },
      { id: 'text-caption', name: 'Légende', type: 'text' as const, text: 'Légende', fontSize: 14 },
      { id: 'text-heading', name: 'En-tête', type: 'text' as const, text: 'En-tête', fontSize: 28 },
    ];
    return texts.filter(text => 
      text.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Formes géométriques
  const shapeAssets = useMemo(() => {
    const shapes = [
      { id: 'shape-rect', name: 'Rectangle', type: 'shape' as const, icon: <div className="w-full h-full border-2 border-gray-600 rounded" /> },
      { id: 'shape-circle', name: 'Cercle', type: 'shape' as const, icon: <div className="w-full h-full border-2 border-gray-600 rounded-full" /> },
      { id: 'shape-triangle', name: 'Triangle', type: 'shape' as const, icon: <div className="w-full h-full border-2 border-gray-600" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} /> },
      { id: 'shape-line', name: 'Ligne', type: 'shape' as const, icon: <div className="w-full h-full flex items-center"><div className="w-full h-0.5 bg-gray-600" /></div> },
    ];
    return shapes.filter(shape => 
      shape.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Éléments
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-5 mx-2 mt-2 flex-shrink-0">
          <TabsTrigger value="text" className="text-xs p-2">
            <TypeIcon className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="icons" className="text-xs p-2">
            <SparklesIcon className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="images" className="text-xs p-2">
            <ImageIcon className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="videos" className="text-xs p-2">
            <VideoIcon className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="shapes" className="text-xs p-2">
            <Shapes className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <TabsContent value="text" className="p-3 mt-0">
            <div className="space-y-2">
              {textAssets.map((asset) => (
                <DraggableAsset
                  key={asset.id}
                  id={asset.id}
                  type={asset.type}
                  name={asset.name}
                  text={asset.text}
                  fontSize={asset.fontSize}
                  icon={<div className="text-sm font-medium p-2 text-center w-full h-full flex items-center justify-center" style={{ fontSize: `${asset.fontSize}px` }}>{asset.text}</div>}
                />
              ))}
            </div>
            {textAssets.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                Aucun texte trouvé
              </div>
            )}
          </TabsContent>

          <TabsContent value="icons" className="p-3 mt-0">
            <div className="grid grid-cols-2 gap-3">
              {iconAssets.map((asset) => (
                <DraggableAsset
                  key={asset.id}
                  id={asset.id}
                  type={asset.type}
                  name={asset.name}
                  icon={asset.icon}
                />
              ))}
            </div>
            {iconAssets.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                Aucune icône trouvée
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="p-3 mt-0">
            <div className="grid grid-cols-2 gap-3">
              {imageAssets.map((asset) => (
                <DraggableAsset
                  key={asset.id}
                  id={asset.id}
                  type={asset.type}
                  src={asset.src}
                  name={asset.name}
                />
              ))}
            </div>
            {imageAssets.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                Aucune image trouvée
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="p-3 mt-0">
            <div className="grid grid-cols-2 gap-3">
              {videoAssets.map((asset) => (
                <DraggableAsset
                  key={asset.id}
                  id={asset.id}
                  type={asset.type}
                  src={asset.src}
                  name={asset.name}
                />
              ))}
            </div>
            {videoAssets.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                Aucune vidéo trouvée
              </div>
            )}
          </TabsContent>

          <TabsContent value="shapes" className="p-3 mt-0">
            <div className="grid grid-cols-2 gap-3">
              {shapeAssets.map((asset) => (
                <DraggableAsset
                  key={asset.id}
                  id={asset.id}
                  type={asset.type}
                  name={asset.name}
                  icon={asset.icon}
                />
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <span className="text-sm text-gray-600 dark:text-gray-400">Télécharger</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

