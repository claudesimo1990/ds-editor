import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Calendar, Share2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ObituaryPreview } from '@/components/obituary/ObituaryPreview';
import { ObituaryData } from '@/types/obituary';

interface DatabaseObituary {
  id: string;
  deceased_first_name: string;
  deceased_last_name: string;
  deceased_additional_name?: string;
  birth_date: string;
  death_date: string;
  location_date?: string;
  trauerspruch?: string;
  introduction?: string;
  main_text?: string;
  side_texts?: string;
  additional_texts?: string;
  last_residence?: string;
  background_image?: string;
  symbol_image?: string;
  font_family: string;
  frame_style: string;
  color_theme: string;
  orientation: string;
  photo_url?: string;
  text_align: string;
  line_height: number;
  letter_spacing: number;
  custom_color?: string;
  background_opacity: number;
  views_count: number;
  published_at?: string;
  published_until?: string;
  user_id: string;
}

const ObituaryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [obituary, setObituary] = useState<DatabaseObituary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const convertToObituaryData = (dbObituary: DatabaseObituary): ObituaryData => ({
    type: 'todesanzeige',
    format: '182x100',
    deceased: {
      firstName: dbObituary.deceased_first_name,
      lastName: dbObituary.deceased_last_name,
      additionalName: dbObituary.deceased_additional_name || '',
      birthDate: dbObituary.birth_date,
      deathDate: dbObituary.death_date
    },
    texts: {
      trauerspruch: dbObituary.trauerspruch || '',
      introduction: dbObituary.introduction || '',
      mainText: dbObituary.main_text || '',
      sideTexts: dbObituary.side_texts || '',
      additionalTexts: dbObituary.additional_texts || '',
      locationDate: dbObituary.location_date || '',
      lastResidence: dbObituary.last_residence || ''
    },
    backgroundImage: dbObituary.background_image || '',
    symbolImage: dbObituary.symbol_image || '',
    fontFamily: dbObituary.font_family as 'memorial' | 'serif' | 'sans-serif',
    frameStyle: dbObituary.frame_style as 'none' | 'simple' | 'double' | 'elegant',
    colorTheme: dbObituary.color_theme as 'light' | 'dark' | 'warm',
    orientation: dbObituary.orientation as 'portrait' | 'landscape',
    photoUrl: dbObituary.photo_url || '',
    textAlign: dbObituary.text_align as 'left' | 'center' | 'right',
    lineHeight: dbObituary.line_height,
    letterSpacing: dbObituary.letter_spacing,
    customColor: dbObituary.custom_color || '',
    backgroundOpacity: dbObituary.background_opacity * 100
  });

  useEffect(() => {
    if (id) {
      fetchObituary();
      incrementViews();
    }
  }, [id]);

  const fetchObituary = async () => {
    try {
      const { data, error } = await supabase
        .from('dde_obituaries')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .eq('is_deleted', false)
        .single();

      if (error) throw error;
      console.log(data)
      setObituary(data);
    } catch (error) {
      console.error('Error fetching obituary:', error);
      toast({
        title: "Fehler",
        description: "Traueranzeige konnte nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      // Update views count directly
      await supabase.from('dde_obituaries')
        .update({ views_count: (obituary?.views_count || 0) + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const shareObituary = () => {
    const url = window.location.href;
    const title = `Traueranzeige für ${obituary?.deceased_first_name} ${obituary?.deceased_last_name}`;
    
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link kopiert",
        description: "Der Link zur Traueranzeige wurde in die Zwischenablage kopiert.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Lade Traueranzeige...</p>
        </div>
      </div>
    );
  }

  if (!obituary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Traueranzeige nicht gefunden</h1>
          <p className="text-muted-foreground">Diese Traueranzeige existiert nicht oder ist nicht mehr verfügbar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs">
              Traueranzeige
            </Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{obituary.views_count} Aufrufe</span>
              </div>
              {obituary.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Veröffentlicht am {formatDate(obituary.published_at)}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            onClick={shareObituary}
            variant="outline" 
            size="sm"
            className="mb-6"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Teilen
          </Button>
        </div>

        {/* Obituary Display */}
        <div className="max-w-4xl mx-auto">
          <ObituaryPreview 
            obituary={convertToObituaryData(obituary)}
            previewMode="desktop"
          />
        </div>

        {/* Actions */}
        <div className="mt-8 text-center space-y-4">
          <Separator />
          <div className="flex justify-center items-center gap-4 text-muted-foreground">
            <Heart className="w-4 h-4" />
            <span className="text-sm">
              In liebevoller Erinnerung
            </span>
            <Heart className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObituaryView;