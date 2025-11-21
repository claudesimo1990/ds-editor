import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PhotoGalleryProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  userId: string;
  maxPhotos?: number;
  type?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onPhotosChange,
  userId,
  maxPhotos = 10,
  type
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Zu viele Dateien",
        description: `Sie können nur noch ${remainingSlots} Foto(s) hinzufügen.`,
        variant: "destructive",
      });
      return;
    }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Ungültiger Dateityp",
          description: "Bitte wählen Sie nur Bilddateien aus.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Datei zu groß",
          description: "Jede Datei darf maximal 5MB groß sein.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/gallery/${Date.now()}-${Math.random()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('dde_memorial_photos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('dde_memorial_photos')
          .getPublicUrl(data.path);

        return publicUrl;
      });

      const newPhotoUrls = await Promise.all(uploadPromises);
      onPhotosChange([...photos, ...newPhotoUrls]);

      console.log('submited', type)
      
      toast({
        title: "Fotos hochgeladen",
        description: `${newPhotoUrls.length} Foto(s) wurden erfolgreich hochgeladen.`,
      });
    } catch (error: any) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Upload-Fehler",
        description: "Die Fotos konnten nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async (photoUrl: string, index: number) => {
    try {
      // Extract file path from URL
      const url = new URL(photoUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts.slice(-2).join('/'); // userId/gallery/filename

      await supabase.storage
        .from('dde_memorial_photos')
        .remove([fileName]);

      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
      
      toast({
        title: "Foto entfernt",
        description: "Das Foto wurde erfolgreich entfernt.",
      });
    } catch (error: any) {
      console.error('Error removing photo:', error);
      toast({
        title: "Fehler",
        description: "Das Foto konnte nicht entfernt werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="memorial-border-elegant" key={type}>
      <CardContent className="space-y-2 p-4">
        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              {photo.src ? (
                <>
                <img
                  src={photo.src}
                  alt={`Galerie Foto ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg memorial-border-subtle"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePhoto(photo.src, index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                </>
              ) : (
                <>
                <img
                  src={photo}
                  alt={`Galerie Foto ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg memorial-border-subtle"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePhoto(photo, index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                </>
              )}

            </div>
          ))}
          
          {/* Add Photo Button */}
          {photos.length < maxPhotos && (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id={`upload-${type}`}
              />
              <label htmlFor={`upload-${type}`}>
                <Card className="h-32 border-dashed border-2 border-memorial-silver hover:border-memorial-charcoal transition-colors cursor-pointer">
                  <CardContent className="h-full flex flex-col items-center justify-center p-2">
                    {isUploading ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-memorial-charcoal mb-2"></div>
                        <p className="text-xs text-memorial-grey">Hochladen...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Plus className="w-6 h-6 text-memorial-grey mb-2" />
                        <p className="text-xs text-memorial-grey">Fotos hinzufügen</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </label>
            </div>
          )}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-8">
            <ImageIcon className="w-16 h-16 text-memorial-grey mx-auto mb-4" />
            <p className="text-memorial-grey font-elegant mb-4">
              Noch keine Fotos in der Galerie
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id={`first-upload-${type}`}
            />
            <label htmlFor={`first-upload-${type}`}>
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Erste Fotos hochladen
                </span>
              </Button>
            </label>
          </div>
        )}
        
        <p className="text-xs text-memorial-grey">
          Unterstützte Formate: JPG, PNG, GIF. Maximale Größe pro Foto: 5MB. 
          Maximal {maxPhotos} Fotos.
        </p>
      </CardContent>
    </Card>
  );
};