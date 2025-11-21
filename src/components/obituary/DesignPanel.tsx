import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ObituaryData } from '@/types/obituary';
import { Image, Frame, Palette, Type, Upload, Trash2, Grid, Sparkles, Monitor, Smartphone, Play, AlignLeft, AlignCenter, AlignRight, AlignStartHorizontal, AlignEndHorizontal } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { PhotoUpload } from './PhotoUpload';
import { AnzeigenTypPanel } from './AnzeigenTypPanel';
// Dynamische Hintergründe aus src/assets/memorial-bg (Bilder & Videos)
const backgroundModules = import.meta.glob('/src/assets/memorial-bg/*.{jpg,jpeg,png,mp4}', { eager: true, as: 'url' }) as Record<string, string>;

interface DesignPanelProps {
  obituary: ObituaryData;
  onUpdate: (updates: Partial<ObituaryData>) => void;
}

const backgroundOptions = Object.entries(backgroundModules)
  .map(([path, url]) => {
    const fileName = path.split('/').pop() || 'background';
    return { id: fileName, name: fileName.replace(/\.[^.]+$/, ''), image: url, category: 'uploaded' };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const symbolModules = import.meta.glob('/src/assets/symbols/*.{png,PNG}', { eager: true, as: 'url' }) as Record<string, string>;

const symbolOptions = Object.entries(symbolModules)
  .map(([path, url]) => {
    const fileName = path.split('/').pop() || 'symbol';
    return { id: fileName, name: fileName.replace(/\.[^.]+$/, ''), image: url };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const DesignPanel: React.FC<DesignPanelProps> = ({ obituary, onUpdate }) => {
  const [backgroundOpacity, setBackgroundOpacity] = useState(20);
  const [customImageMode, setCustomImageMode] = useState(false);
  
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Datei zu groß",
          description: "Bitte wählen Sie eine Datei unter 5MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdate({ backgroundImage: result });
        toast({
          title: "Bild hochgeladen",
          description: "Ihr eigenes Hintergrundbild wurde erfolgreich hinzugefügt.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCustomImage = () => {
    onUpdate({ backgroundImage: '' });
    setCustomImageMode(false);
    toast({
      title: "Hintergrundbild entfernt",
      description: "Das Hintergrundbild wurde zurückgesetzt.",
    });
  };

  const alignments = [
    { name: 'Links', value: 'left', icon: AlignLeft },
    { name: 'Mittig', value: 'center', icon: AlignCenter },
    { name: 'Rechts', value: 'right', icon: AlignRight },
    { name: 'Spitze', value: 'top', icon: AlignStartHorizontal },
    { name: 'Unten', value: 'bottom', icon: AlignEndHorizontal },
  ];

    const handleSymbolClick = (symbol) => {
      let updatedSymbols = [...(obituary.symbols || [])];
      const cleanId = symbol.id.replace(/\s+/g, '').toLowerCase();
      const isSelected = obituary.symbols?.some(s => s.image === symbol.image);

      if (isSelected) {
        // Remove symbol
        updatedSymbols = updatedSymbols.filter(s => s.image !== symbol.image);
      } else {
        // Add symbol with default properties
        updatedSymbols.push({
          id: `${cleanId}-${Date.now()}`, 
          image: symbol.image,
          width: 100,
          height: 100,
          opacity: 100,
          position: { x: 100, y: 100 }
        });
        
      }

      onUpdate({ symbols: updatedSymbols });
    };

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 max-h-[100vh] overflow-y-auto">
      {/* Anzeigentyp & Format */}
      {/* <AnzeigenTypPanel obituary={obituary} onUpdate={onUpdate} /> */}

      {/* Foto des Verstorbenen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Type className="w-5 h-5" />
            Fotos der Verstorbenen
            <Badge variant="secondary" className="ml-auto">
              {obituary.photos?.length ? `${obituary.photos.length} Foto(s)` : 'Keine Fotos'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            photos={obituary.photos || []}
            onPhotoAdd={(newPhoto) => {
              const updatedPhotos = [
                ...(obituary.photos || []),
                {
                  ...newPhoto,
                  width: 150,
                  height: 150,
                  opacity: 100,
                  position: { x: 100, y: 100 },
                },
              ];
              onUpdate({ photos: updatedPhotos });
            }}
            onPhotoDelete={(photoId) => {
              const updatedPhotos = (obituary.photos || []).filter(
                (p) => p.id !== photoId
              );
              onUpdate({ photos: updatedPhotos });
            }}
          />
        </CardContent>
      </Card>


      {/* Hintergrund */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Image className="w-5 h-5" /> Hintergrund auswählen
            <Badge variant="secondary" className="ml-auto">
              {obituary.backgroundImage ? 'Aktiv' : 'Standard'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-elegant text-lg">Eigenes Bild verwenden</span>
              <Switch 
                checked={customImageMode}
                onCheckedChange={setCustomImageMode}
              />
            </div>

          {customImageMode ? (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <div className="space-y-2">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-primary hover:underline">
                      Bild auswählen
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                    />
                  </Label>
                  <p className="text-lg text-muted-foreground">
                    JPG, PNG bis 5MB
                  </p>
                </div>
              </div>
              
              {obituary.backgroundImage && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-lg font-elegant">Eigenes Bild geladen</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCustomImage}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              <button
                type="button"
                onClick={() => onUpdate({ backgroundImage: '' })}
                className={`relative overflow-hidden rounded-md border aspect-[4/3] bg-muted/40 transition hover:opacity-90 ${!obituary.backgroundImage ? 'ring-2 ring-primary' : ''}`}
                aria-label="Kein Hintergrund"
                title="Kein Hintergrund"
              >
                <span className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">∅</span>
              </button>
              {backgroundOptions.map((bg) => {
                const isVideo = bg.image.toLowerCase().endsWith('.mp4');
                const selected = obituary.backgroundImage === bg.image;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => onUpdate({ backgroundImage: bg.image })}
                    className={`relative overflow-hidden rounded-md border aspect-[4/3] transition hover:opacity-90 ${selected ? 'ring-2 ring-primary' : ''}`}
                    aria-label={bg.name}
                    title={bg.name}
                  >
                    {isVideo ? (
                      <>
                        <video
                          src={bg.image}
                          className="absolute inset-0 w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-background/70 backdrop-blur-sm border border-border flex items-center justify-center">
                            <Play className="w-4 h-4 text-foreground/80" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img src={bg.image} alt={bg.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Background Opacity Slider */}
          {obituary.backgroundImage && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="font-elegant text-lg">Hintergrund-Transparenz</Label>
                <span className="text-sm text-muted-foreground">{backgroundOpacity}%</span>
              </div>
              <Slider
                value={[backgroundOpacity]}
                onValueChange={(value) => {
                  const newOpacity = value[0];
                  setBackgroundOpacity(newOpacity);
                  // Apply opacity to background through CSS custom property
                  onUpdate({ 
                    backgroundImage: obituary.backgroundImage,
                    backgroundOpacity: newOpacity
                  });
                }}
                max={100}
                min={20}
                step={5}
                className="w-full"
              />
              <p className="text-lg text-muted-foreground">
                Bestimmt wie durchsichtig der Hintergrund erscheint
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Symbol */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-memorial">
            <Sparkles className="w-5 h-5" />
            Symbole
            <Badge variant="secondary" className="ml-auto">
              {obituary.symbols?.length > 0 ? `${obituary.symbols.length} Symbole` : 'Kein Symbol'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            <button
              type="button"
              onClick={() => onUpdate({ symbols: [] })}
              className={`relative overflow-hidden rounded-md border aspect-square flex items-center justify-center transition hover:opacity-90 ${!obituary.symbols?.length ? 'ring-2 ring-primary' : ''}`}
              aria-label="Kein Symbol"
              title="Kein Symbol"
            >
              <span className="text-lg">∅</span>
            </button>
            {symbolOptions.map((symbol) => {
              const cleanId = symbol.id.replace(/\s+/g, '').toLowerCase();
              const isSelected = obituary.symbols?.some(s => s.image === symbol.image);

              return (
                <button
                  key={symbol.id}
                  type="button"
                  onClick={() => handleSymbolClick(symbol)}
                  className={`relative overflow-hidden rounded-md border aspect-square flex items-center justify-center transition hover:opacity-90 ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  aria-label={symbol.name}
                  title={symbol.name}
                >
                  <img
                    src={symbol.image}
                    alt={symbol.name}
                    className="w-16 h-16 object-contain"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>

          <hr />

          <Card>
          <CardContent className='mt-5'>
            <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xl"
              >
                Rahmenstil
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-100 p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Rahmenstil
                </label>
                <Select
                  value={obituary.frameStyle ?? "none"}
                  onValueChange={(value) =>
                    onUpdate({ frameStyle: value })
                  }
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Rahmenstil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Rahmen</SelectItem>
                    <SelectItem value="simple">Einfach</SelectItem>
                    <SelectItem value="double">Doppelt</SelectItem>
                    <SelectItem value="elegant">Elegant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Rahmenfarbe
                </label>
                <input
                  type="color"
                  value={obituary.frameColor ?? "#000000"}
                  onChange={(e) =>
                    onUpdate({ frameColor: e.target.value })
                  }
                  className="w-full h-8 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">
                    Rahmenbreite
                  </label>
                  <span className="text-sm text-gray-500">
                    {obituary.frameWidth ?? 2}px
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={obituary.frameWidth ?? 2}
                  onChange={(e) =>
                    onUpdate({ frameWidth: parseInt(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
              </div>
            </PopoverContent>
          </Popover>
          </CardContent>
        </Card>

        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Frame className="w-5 h-5" />
            Rahmenstil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={obituary.frameStyle} 
            onValueChange={(value: 'none' | 'simple' | 'double' | 'elegant') => onUpdate({ frameStyle: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Kein Rahmen</SelectItem>
              <SelectItem value="simple">Einfacher Rahmen</SelectItem>
              <SelectItem value="double">Doppelter Rahmen</SelectItem>
              <SelectItem value="elegant">Eleganter Rahmen</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card> */}


      {/* Farbschema */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Palette className="w-5 h-5" />
            Farbschema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'light', name: 'Hell & Klar', colors: 'bg-white text-gray-900' },
              { value: 'dark', name: 'Dunkel & Würdevoll', colors: 'bg-slate-800 text-white' },
              { value: 'warm', name: 'Warm & Einladend', colors: 'bg-amber-50 text-amber-900' }
            ].map((theme) => (
              <Button
                key={theme.value}
                variant={obituary.colorTheme === theme.value ? "default" : "outline"}
                className="h-12 justify-start p-3 hover-lift"
                onClick={() => onUpdate({ colorTheme: theme.value as 'light' | 'dark' | 'warm' })}
              >
                <div className={`w-8 h-8 rounded mr-3 ${theme.colors}`} />
                <span className="font-elegant text-lg">{theme.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card> */}

      {/* Design Presets */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Grid className="w-5 h-5" />
            Schnell-Vorlagen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              className="h-12 justify-start p-3 hover-lift text-lg"
              onClick={() => onUpdate({
                backgroundImage: backgroundOptions[0]?.image || '',
                symbolImage: symbolOptions[0]?.image || '',
                colorTheme: 'light',
                frameStyle: 'simple',
                fontFamily: 'memorial'
              })}
            >
              <span className="font-elegant text-lg">Klassisch & Traditionell</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start p-3 hover-lift text-lg"
              onClick={() => onUpdate({
                backgroundImage: '',
                symbolImage: symbolOptions[1]?.image || '',
                colorTheme: 'warm',
                frameStyle: 'elegant',
                fontFamily: 'elegant'
              })}
            >
              <span className="font-elegant">Modern & Warm</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start p-3 hover-lift text-lg"
              onClick={() => onUpdate({
                backgroundImage: backgroundOptions[backgroundOptions.length - 1]?.image || '',
                symbolImage: '',
                colorTheme: 'light',
                frameStyle: 'none',
                fontFamily: 'elegant'
              })}
            >
              <span className="font-elegant">Minimalistisch & Elegant</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};