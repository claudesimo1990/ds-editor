import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Upload, Play } from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';

// 🔹 Dynamically load all images & videos from memorial-bg
const backgroundModules = import.meta.glob('/src/assets/memorial-bg/*.{jpg,jpeg,png,mp4}', {
  eager: true,
  as: 'url',
}) as Record<string, string>;

const standardBackgrounds = Object.entries(backgroundModules)
  .map(([path, src], index) => {
    const name = path.split('/').pop()?.replace(/\.[^.]+$/, '') || `Background ${index + 1}`;
    return { id: index + 1, src, name };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

interface HeroBackgroundSelectorProps {
  currentBackground?: string;
  onBackgroundChange: (backgroundUrl: string | null) => void;
  userId: string;
}

export function HeroBackgroundSelector({
  currentBackground,
  onBackgroundChange,
  userId,
}: HeroBackgroundSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<'standard' | 'custom'>('standard');

  const handleStandardBackgroundSelect = (backgroundSrc: string) => {
    onBackgroundChange(backgroundSrc);
  };

  const handleCustomPhotoChange = (photoUrl: string | null) => {
    onBackgroundChange(photoUrl);
  };

  const isStandardBackgroundSelected = (backgroundSrc: string) => {
    return currentBackground === backgroundSrc;
  };

  const isCustomPhotoSelected = () => {
    return (
      currentBackground &&
      !standardBackgrounds.some((bg) => bg.src === currentBackground)
    );
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-memorial-platinum">
        <Button
          variant={selectedTab === 'standard' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('standard')}
          className="rounded-b-none"
        >
          Standard-Hintergründe
        </Button>
        <Button
          variant={selectedTab === 'custom' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('custom')}
          className="rounded-b-none"
        >
          <Upload className="w-4 h-4 mr-2" />
          Eigenes Bild
        </Button>
      </div>

      {/* 🔹 STANDARD BACKGROUNDS GRID */}
      {selectedTab === 'standard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {standardBackgrounds.map((background) => {
            const isVideo = background.src.toLowerCase().endsWith('.mp4');
            const selected = isStandardBackgroundSelected(background.src);
            return (
              <Card
                key={background.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selected ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                onClick={() => handleStandardBackgroundSelect(background.src)}
              >
                <CardContent className="p-2">
                  <div className="relative rounded overflow-hidden">
                    {isVideo ? (
                      <>
                        <video
                          src={background.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-20 object-cover rounded"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow">
                            <Play className="w-4 h-4 text-gray-700" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={background.src}
                        alt={background.name}
                        className="w-full h-20 object-cover rounded"
                        loading="lazy"
                      />
                    )}

                    {selected && (
                      <div className="absolute inset-0 bg-primary/20 rounded flex items-center justify-center">
                        <Check className="w-6 h-6 text-primary bg-white rounded-full p-1" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 🔹 CUSTOM BACKGROUND UPLOAD */}
      {selectedTab === 'custom' && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-4 ${
              isCustomPhotoSelected()
                ? 'border-primary bg-primary/5'
                : 'border-memorial-silver'
            }`}
          >
            <PhotoUpload
              currentPhoto={isCustomPhotoSelected() ? currentBackground : ''}
              onPhotoChange={handleCustomPhotoChange}
              userId={userId}
              label="Eigenes Hintergrundbild hochladen"
            />
          </div>
          <p className="text-sm text-memorial-grey font-elegant">
            Laden Sie Ihr eigenes Landschaftsfoto oder Video als Hintergrund hoch.
          </p>
        </div>
      )}

      {/* 🔹 REMOVE BACKGROUND */}
      {currentBackground && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => onBackgroundChange(null)}
            className="text-memorial-grey hover:text-memorial-charcoal"
          >
            Hintergrund entfernen
          </Button>
        </div>
      )}
    </div>
  );
}
