import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Heart, Clock, Sparkles } from 'lucide-react';

interface LightCandleModalProps {
  obituaryId: string;
  deceasedName: string;
  trigger?: React.ReactNode;
}

export const LightCandleModal: React.FC<LightCandleModalProps> = ({
  obituaryId,
  deceasedName,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    duration: '24'
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name erforderlich",
        description: "Bitte geben Sie Ihren Namen ein.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate expires_at manually since TypeScript expects it
      const now = new Date();
      const duration = parseInt(formData.duration);
      const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

      const { error } = await supabase
        .from('dde_candles')
        .insert({
          obituary_id: obituaryId,
          lit_by_name: formData.name.trim(),
          lit_by_email: formData.email.trim() || null,
          message: formData.message.trim() || null,
          duration_hours: duration,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Kerze angezündet",
        description: `Eine Gedenkkerze für ${deceasedName} wurde angezündet und brennt ${formData.duration} Stunden.`,
      });

      setFormData({ name: '', email: '', message: '', duration: '24' });
      setOpen(false);

    } catch (error) {
      console.error('Error lighting candle:', error);
      toast({
        title: "Fehler",
        description: "Die Kerze konnte nicht angezündet werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg">
      <Flame className="w-4 h-4 mr-2" />
      Kerze anzünden
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-memorial">
            <Flame className="w-5 h-5 text-amber-500" />
            Gedenkkerze anzünden
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Zünden Sie eine Kerze für <span className="font-medium">{deceasedName}</span> an
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animated Candle Preview */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-8 h-12 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-full border border-amber-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="w-4 h-4 text-amber-300 opacity-75" />
                  </div>
                </div>
              </div>
              <div className="w-10 h-2 bg-amber-800 rounded-full mx-auto mt-1"></div>
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
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
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