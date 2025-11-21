import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CreditCard, Clock, Euro, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ObituaryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obituary: {
    id: string;
    deceased_first_name: string;
    deceased_last_name: string;
    is_published: boolean;
    published_until?: string;
    published_duration_days?: number;
    payment_status: string;
  };
  onUpdate: () => void;
}

const DURATION_OPTIONS = [
  { value: '7', label: '7 Tage', price: 0, description: 'Kostenlos' },
  { value: '14', label: '14 Tage', price: 0, description: 'Kostenlos' },
  { value: '30', label: '1 Monat', price: 0, description: 'Kostenlos' },
  { value: '60', label: '2 Monate', price: 19.9, description: 'Premium' },
  { value: '90', label: '3 Monate', price: 19.9, description: 'Premium' },
  { value: '180', label: '6 Monate', price: 19.9, description: 'Premium' },
  { value: '365', label: '12 Monate', price: 19.9, description: 'Premium' },
  { value: '1095', label: '36 Monate', price: 49.9, description: 'Premium Plus' },
  { value: '99999', label: 'Für immer', price: 129, description: 'Lifetime' },
];

export const ObituaryManagementDialog: React.FC<ObituaryManagementDialogProps> = ({
  open,
  onOpenChange,
  obituary,
  onUpdate
}) => {
  const [selectedDuration, setSelectedDuration] = useState<string>('30');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const selectedOption = DURATION_OPTIONS.find(opt => opt.value === selectedDuration);
  const requiresPayment = selectedOption && selectedOption.price > 0;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unbegrenzt';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const isExpired = obituary.published_until && new Date(obituary.published_until) < new Date();

  const handlePublish = async () => {
    if (!selectedOption) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (requiresPayment) {
        await handlePayment();
      } else {
        await publishObituary('none');
      }
    } catch (error) {
      console.error('Error publishing obituary:', error);
      toast({
        title: "Fehler",
        description: "Traueranzeige konnte nicht veröffentlicht werden.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedOption) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create order
      const orderData = {
        user_id: user.id,
        total_amount: selectedOption.price,
        currency: 'EUR',
        order_number: '',
        items: [{
          type: 'obituary_extension',
          title: `Traueranzeige verlängern - ${selectedOption.label}`,
          quantity: 1,
          price: selectedOption.price,
          duration_days: parseInt(selectedOption.value),
          obituary_id: obituary.id
        }],
        status: 'pending'
      };

      const { data: order, error: orderError } = await supabase
        .from('dde_orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions
        .invoke('create-payment', {
          body: {
            orderId: order.id,
            amount: selectedOption.price * 100,
            currency: 'eur',
            description: `Traueranzeige verlängern - ${selectedOption.label}`,
            metadata: {
              orderId: order.id,
              obituaryId: obituary.id,
              durationType: 'extension',
              durationDays: selectedOption.value
            }
          }
        });

      if (checkoutError) throw checkoutError;

      if (checkoutData?.url) {
        window.open(checkoutData.url, '_blank');
        toast({
          title: "Weiterleitung zur Zahlung",
          description: "Sie werden zur sicheren Zahlungsseite weitergeleitet.",
        });
        onOpenChange(false);
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Zahlungsfehler",
        description: "Die Zahlung konnte nicht verarbeitet werden.",
        variant: "destructive"
      });
    }
  };

  const publishObituary = async (paymentStatus: string) => {
    if (!selectedOption) return;

    try {
      const currentDate = new Date();
      const publishedUntil = selectedOption.value === '99999' 
        ? null 
        : new Date(currentDate.getTime() + parseInt(selectedOption.value) * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from('dde_obituaries')
        .update({
          is_published: true,
          published_at: currentDate.toISOString(),
          published_until: publishedUntil?.toISOString() || null,
          published_duration_days: parseInt(selectedOption.value),
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', obituary.id);

      if (error) throw error;

      toast({
        title: "Traueranzeige veröffentlicht",
        description: `Ihre Traueranzeige wurde für ${selectedOption.label} veröffentlicht.`,
      });

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error publishing obituary:', error);
      throw error;
    }
  };

  const handleUnpublish = async () => {
    try {
      const { error } = await supabase
        .from('dde_obituaries')
        .update({
          is_published: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', obituary.id);

      if (error) throw error;

      toast({
        title: "Traueranzeige entfernt",
        description: "Ihre Traueranzeige ist nicht mehr öffentlich sichtbar.",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error unpublishing obituary:', error);
      toast({
        title: "Fehler",
        description: "Traueranzeige konnte nicht entfernt werden.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Traueranzeige verwalten: {obituary.deceased_first_name} {obituary.deceased_last_name}
          </DialogTitle>
          <DialogDescription>
            Veröffentlichung bearbeiten oder verlängern
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={obituary.is_published ? "default" : "secondary"}>
                    {obituary.is_published ? "Veröffentlicht" : "Unveröffentlicht"}
                  </Badge>
                </div>
                
                {obituary.is_published && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Läuft ab am:</span>
                      <span className="text-sm">{formatDate(obituary.published_until)}</span>
                    </div>
                    
                    {isExpired && (
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Diese Traueranzeige ist abgelaufen</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              {obituary.is_published ? "Laufzeit verlängern um:" : "Veröffentlichungsdauer:"}
            </label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Dauer auswählen" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      <div className="flex items-center gap-2 ml-4">
                        {option.price > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            {option.price.toFixed(1)} €
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Kostenlos
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Duration Info */}
          {selectedOption && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{selectedOption.label}</span>
                  </div>
                  <Badge variant={selectedOption.price > 0 ? "default" : "outline"}>
                    {selectedOption.description}
                  </Badge>
                </div>
                
                {selectedOption.price > 0 && (
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Euro className="w-5 h-5" />
                    <span>{selectedOption.price.toFixed(1)} EUR</span>
                  </div>
                )}

                <div className="text-sm text-muted-foreground mt-2">
                  {selectedOption.price === 0 ? (
                    <p>Diese Verlängerung ist kostenlos verfügbar.</p>
                  ) : (
                    <p>Sichere Zahlung über Stripe oder PayPal. Die Verlängerung wird nach erfolgreicher Zahlung sofort aktiviert.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-col space-y-2">
          {obituary.is_published ? (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={handleUnpublish}
                className="flex-1"
              >
                Entfernen
              </Button>
              <Button 
                onClick={handlePublish}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Verarbeitet...
                  </>
                ) : requiresPayment ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Kostenpflichtig verlängern
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Kostenlos verlängern
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handlePublish}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Veröffentlicht...
                </>
              ) : requiresPayment ? (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Kostenpflichtig veröffentlichen
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Kostenlos veröffentlichen
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};