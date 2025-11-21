import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, User } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
}

interface PhotoUploadProps {
  photos: Photo[];
  onPhotoAdd: (photo: Photo) => void;
  onPhotoDelete: (photoId: string) => void;
  disabled?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos = [],
  onPhotoAdd,
  onPhotoDelete,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ungültiger Dateityp',
        description: 'Bitte wählen Sie eine Bilddatei aus.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Datei zu groß',
        description: 'Bitte wählen Sie eine Datei unter 5MB aus.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('dde_obituary_photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('dde_obituary_photos')
        .getPublicUrl(data.path);
      
      const newPhoto = {
        id: `photo-${Date.now()}`,
        url: publicUrl,
      };
      
      onPhotoAdd(newPhoto);

      toast({
        title: 'Foto hochgeladen',
        description: 'Das Foto wurde erfolgreich hinzugefügt.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload-Fehler',
        description: 'Das Foto konnte nicht hochgeladen werden.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
       if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async (photoId: string, photoUrl: string) => {
    try {
      const url = new URL(photoUrl);
      const path = url.pathname.split('/storage/v1/object/public/dde_obituary_photos/')[1];

      if (path) {
        await supabase.storage.from('dde_obituary_photos').remove([path]);
      }

      onPhotoDelete(photoId);

      toast({
        title: 'Foto entfernt',
        description: 'Das Foto wurde erfolgreich entfernt.',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Fehler beim Löschen',
        description: 'Das Foto konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="relative overflow-hidden group">
            <div className="aspect-square w-full">
              <img
                src={photo.url}
                alt="Vorschau"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="absolute top-1 right-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemovePhoto(photo.id, photo.url)}
                disabled={disabled}
                className="h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}

        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <div
            className="aspect-square w-full flex flex-col items-center justify-center p-4 cursor-pointer"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-xs text-muted-foreground">Hochladen...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <span className="text-xs text-center">Foto hinzufügen</span>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <p className="text-sm text-muted-foreground">
        Sie können mehrere Fotos hochladen. Unterstützte Formate: JPG, PNG, GIF (max. 5MB)
      </p>
    </div>
  );
};