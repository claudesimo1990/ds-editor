import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (url: string | null) => void;
  userId: string;
  label?: string;
  className?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhoto,
  onPhotoChange,
  userId,
  label = "Mehr Fotos hochladen",
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte wählen Sie eine Bilddatei aus.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Die Datei darf maximal 5MB groß sein.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('dde_memorial_photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('dde_memorial_photos')
        .getPublicUrl(data.path);

      onPhotoChange(publicUrl);
      
      toast({
        title: "Foto hochgeladen",
        description: "Das Foto wurde erfolgreich hochgeladen.",
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload-Fehler",
        description: "Das Foto konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhoto) return;

    try {
      // Extract file path from URL
      const url = new URL(currentPhoto);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${userId}/${fileName}`;

      await supabase.storage
        .from('dde_memorial_photos')
        .remove([filePath]);

      onPhotoChange(null);
      
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
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-memorial-charcoal">
        {label}
      </label>
      
      {currentPhoto ? (
        <Card className="memorial-border-elegant">
          <CardContent className="p-4">
            <div className="relative">
              <img 
                src={currentPhoto} 
                alt="Uploaded photo"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemovePhoto}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="memorial-border-elegant border-dashed">
          <CardContent className="p-6">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-memorial-grey mx-auto mb-4" />
              <p className="text-memorial-grey mb-4">
                Klicken Sie hier, um ein Foto hochzuladen
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id={`photo-upload-${label}`}
              />
              <label htmlFor={`photo-upload-${label}`}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Hochladen...' : 'Foto auswählen'}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      )}
      
      <p className="text-xs text-memorial-grey">
        Unterstützte Formate: JPG, PNG, GIF. Maximale Größe: 5MB
      </p>
    </div>
  );
};