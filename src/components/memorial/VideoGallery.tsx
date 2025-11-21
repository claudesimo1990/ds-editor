import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VideoIcon, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface VideoGalleryProps {
  onVideoSelect: (videoUrl: string) => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ onVideoSelect }) => {
  const [videoUrl, setVideoUrl] = React.useState('');

  // Charger les vidéos depuis les assets
  const videoAssets = useMemo(() => {
    try {
      const modules = import.meta.glob('/src/assets/**/*.{mp4,MP4,webm,WEBM}', { 
        eager: true, 
        as: 'url' 
      }) as Record<string, string>;
      
      const videos = Object.entries(modules).map(([path, url]) => {
        const filename = path.split('/').pop() || 'video';
        const name = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        return {
          id: `video-${filename}`,
          name: name,
          src: url,
        };
      });
      
      return videos;
    } catch (e) {
      console.error('Erreur lors du chargement des vidéos:', e);
      return [];
    }
  }, []);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl.trim()) {
      onVideoSelect(videoUrl.trim());
      setVideoUrl('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Input pour URL de vidéo */}
      <form onSubmit={handleUrlSubmit} className="space-y-2">
        <Input
          type="url"
          placeholder="Coller l'URL d'une vidéo..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <Button type="submit" variant="outline" className="w-full" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Ajouter depuis URL
        </Button>
      </form>

      {/* Galerie de vidéos */}
      {videoAssets.length > 0 ? (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {videoAssets.map((video) => (
              <button
                key={video.id}
                onClick={() => onVideoSelect(video.src)}
                className="w-full p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <VideoIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.name}</p>
                    <p className="text-xs text-gray-500">Cliquer pour ajouter</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <VideoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune vidéo disponible</p>
          <p className="text-xs mt-1">Utilisez l'URL pour ajouter une vidéo</p>
        </div>
      )}
    </div>
  );
};

