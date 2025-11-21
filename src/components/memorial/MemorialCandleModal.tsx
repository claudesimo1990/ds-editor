import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Heart, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface MemorialCandleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCandleLit: () => void;
  memorialPageId?: string;
}

export const MemorialCandleModal: React.FC<MemorialCandleModalProps> = ({
  isOpen,
  onClose,
  onCandleLit,
  memorialPageId
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    duration: '24'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Bitte geben Sie Ihren Namen ein.");
      return;
    }

    setLoading(true);

    try {
      // Calculate expires_at manually
      const now = new Date();
      const duration = parseInt(formData.duration);
      const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

      const candleData: any = {
        lit_by_name: formData.name.trim(),
        lit_by_email: formData.email.trim() || null,
        message: formData.message.trim() || null,
        duration_hours: duration,
        expires_at: expiresAt.toISOString()
      };

      if (memorialPageId) {
        candleData.memorial_page_id = memorialPageId;
      }

      const { error } = await supabase
        .from('dde_candles')
        .insert(candleData);

      if (error) throw error;

      toast.success(`Eine Gedenkkerze wurde angezündet und brennt ${formData.duration} Stunden.`);

      setFormData({ name: '', email: '', message: '', duration: '24' });
      onCandleLit();
      onClose();

    } catch (error) {
      console.error('Error lighting candle:', error);
      toast.error("Die Kerze konnte nicht angezündet werden. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-memorial">
            <Flame className="w-5 h-5 text-orange-500" />
            Gedenkkerze anzünden
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Zünden Sie eine Kerze zum Gedenken an
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animated Candle Preview */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-8 h-12 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-full border border-orange-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="w-4 h-4 text-orange-300 opacity-75" />
                  </div>
                </div>
              </div>
              <div className="w-10 h-2 bg-orange-800 rounded-full mx-auto mt-1"></div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Ihr Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ihr vollständiger Name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                E-Mail (optional)
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ihre.email@beispiel.de"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="duration" className="text-sm font-medium">
                Brenndauer
              </Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => handleInputChange('duration', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      6 Stunden
                    </div>
                  </SelectItem>
                  <SelectItem value="12">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      12 Stunden
                    </div>
                  </SelectItem>
                  <SelectItem value="24">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      24 Stunden (Standard)
                    </div>
                  </SelectItem>
                  <SelectItem value="48">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      48 Stunden
                    </div>
                  </SelectItem>
                  <SelectItem value="72">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      72 Stunden
                    </div>
                  </SelectItem>
                  <SelectItem value="168">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      1 Woche
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Persönliche Nachricht (optional)
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Eine persönliche Nachricht oder Erinnerung..."
                rows={3}
                disabled={loading}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.message.length}/200 Zeichen
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Flame className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Anzünden...' : 'Kerze anzünden'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};