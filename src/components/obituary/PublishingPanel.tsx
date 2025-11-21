import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, CreditCard, Globe, Clock, Shield, Euro, UserPlus, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ObituaryData } from '@/types/obituary';
import { useNavigate } from 'react-router-dom';

interface PublishingPanelProps {
  obituary: ObituaryData;
  onPublish?: (published: boolean) => void;
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

export const PublishingPanel: React.FC<PublishingPanelProps> = ({
  obituary,
  onPublish
}) => {
  const [selectedDuration, setSelectedDuration] = useState<string>('30');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedOption = DURATION_OPTIONS.find(opt => opt.value === selectedDuration);
  const requiresPayment = selectedOption && selectedOption.price > 0;

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveDraft = async () => {
    setIsPublishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Fehler",
          description: "Sie müssen angemeldet sein, um eine Traueranzeige zu speichern.",
          variant: "destructive"
        });
        return;
      }

      const obituaryData = {
        user_id: user.id,
        deceased_first_name: obituary.deceased.firstName,
        deceased_last_name: obituary.deceased.lastName,
        deceased_additional_name: obituary.deceased.additionalName || null,
        birth_date: obituary.deceased.birthDate,
        death_date: obituary.deceased.deathDate,
        location_date: obituary.texts.locationDate || null,
        trauerspruch: obituary.texts.trauerspruch || null,
        introduction: obituary.texts.introduction || null,
        main_text: obituary.texts.mainText || null,
        side_texts: obituary.texts.sideTexts || null,
        additional_texts: obituary.texts.additionalTexts || null,
        last_residence: obituary.texts.lastResidence || null,
        background_image: obituary.backgroundImage || null,
        symbol_image: obituary.symbolImage || null,
        font_family: obituary.fontFamily,
        frame_style: obituary.frameStyle,
        color_theme: obituary.colorTheme,
        orientation: obituary.orientation || 'portrait',
        photo_url: obituary.photoUrl || null,
        text_align: obituary.textAlign || 'center',
        line_height: obituary.lineHeight || 1.6,
        letter_spacing: obituary.letterSpacing || 0,
        custom_color: obituary.customColor || null,
        background_opacity: obituary.backgroundOpacity || 0.7,
        is_published: false,
        is_deleted: false
      };

      const { error } = await supabase
        .from('dde_obituaries')
        .upsert(obituaryData);

      if (error) throw error;

      toast({
        title: "Entwurf gespeichert",
        description: "Ihre Traueranzeige wurde als Entwurf gespeichert.",
      });

    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Fehler",
        description: "Entwurf konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedOption) return;

    setIsPublishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Fehler",
          description: "Sie müssen angemeldet sein, um eine Traueranzeige zu veröffentlichen.",
          variant: "destructive"
        });
        return;
      }

      // If payment is required, handle payment first
      if (requiresPayment) {
        await handlePayment();
        return; // Payment flow will continue the publishing process
      }

      // Publish without payment (free durations)
      await publishObituary(user.id, 'none');

    } catch (error) {
      console.error('Error publishing obituary:', error);
      toast({
        title: "Fehler",
        description: "Traueranzeige konnte nicht veröffentlicht werden.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedOption) return;

    setIsProcessingPayment(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create order first
      const orderData = {
        user_id: user.id,
        total_amount: selectedOption.price,
        currency: 'EUR',
        order_number: '', // Will be auto-generated by trigger
        items: [{
          type: 'obituary_publishing',
          title: `Traueranzeige veröffentlichen - ${selectedOption.label}`,
          quantity: 1,
          price: selectedOption.price,
          duration_days: parseInt(selectedOption.value)
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
            amount: selectedOption.price * 100, // Convert to cents
            currency: 'eur',
            description: `Traueranzeige veröffentlichen - ${selectedOption.label}`,
            metadata: {
              orderId: order.id,
              obituaryData: JSON.stringify({
                user_id: user.id,
                deceased_first_name: obituary.deceased.firstName,
                deceased_last_name: obituary.deceased.lastName,
                deceased_additional_name: obituary.deceased.additionalName || null,
                birth_date: obituary.deceased.birthDate,
                death_date: obituary.deceased.deathDate,
                location_date: obituary.texts.locationDate || null,
                trauerspruch: obituary.texts.trauerspruch || null,
                introduction: obituary.texts.introduction || null,
                main_text: obituary.texts.mainText || null,
                side_texts: obituary.texts.sideTexts || null,
                additional_texts: obituary.texts.additionalTexts || null,
                last_residence: obituary.texts.lastResidence || null,
                background_image: obituary.backgroundImage || null,
                symbol_image: obituary.symbolImage || null,
                font_family: obituary.fontFamily,
                frame_style: obituary.frameStyle,
                color_theme: obituary.colorTheme,
                orientation: obituary.orientation || 'portrait',
                photo_url: obituary.photoUrl || null,
                text_align: obituary.textAlign || 'center',
                line_height: obituary.lineHeight || 1.6,
                letter_spacing: obituary.letterSpacing || 0,
                custom_color: obituary.customColor || null,
                background_opacity: obituary.backgroundOpacity || 0.7,
                published_duration_days: parseInt(selectedOption.value),
                is_published: true,
                published_at: new Date().toISOString()
              })
            }
          }
        });

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe Checkout
      if (checkoutData?.url) {
        window.open(checkoutData.url, '_blank');
        toast({
          title: "Weiterleitung zur Zahlung",
          description: "Sie werden zur sicheren Zahlungsseite weitergeleitet.",
        });
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Zahlungsfehler",
        description: "Die Zahlung konnte nicht verarbeitet werden.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
      setIsPublishing(false);
    }
  };

  const publishObituary = async (userId: string, paymentStatus: string) => {
    if (!selectedOption) return;

    const obituaryData = {
      user_id: userId,
      deceased_first_name: obituary.deceased.firstName,
      deceased_last_name: obituary.deceased.lastName,
      deceased_additional_name: obituary.deceased.additionalName || null,
      birth_date: obituary.deceased.birthDate,
      death_date: obituary.deceased.deathDate,
      location_date: obituary.texts.locationDate || null,
      trauerspruch: obituary.texts.trauerspruch || null,
      introduction: obituary.texts.introduction || null,
      main_text: obituary.texts.mainText || null,
      side_texts: obituary.texts.sideTexts || null,
      additional_texts: obituary.texts.additionalTexts || null,
      last_residence: obituary.texts.lastResidence || null,
      background_image: obituary.backgroundImage || null,
      symbol_image: obituary.symbolImage || null,
      font_family: obituary.fontFamily,
      frame_style: obituary.frameStyle,
      color_theme: obituary.colorTheme,
      orientation: obituary.orientation || 'portrait',
      photo_url: obituary.photoUrl || null,
      text_align: obituary.textAlign || 'center',
      line_height: obituary.lineHeight || 1.6,
      letter_spacing: obituary.letterSpacing || 0,
      custom_color: obituary.customColor || null,
      background_opacity: obituary.backgroundOpacity || 0.7,
      published_duration_days: parseInt(selectedOption.value),
      is_published: true,
      published_at: new Date().toISOString(),
      payment_status: paymentStatus,
      is_deleted: false
    };

    const { error } = await supabase
      .from('dde_obituaries')
      .upsert(obituaryData);

    if (error) throw error;

    toast({
      title: "Traueranzeige veröffentlicht",
      description: `Ihre Traueranzeige wurde für ${selectedOption.label} veröffentlicht.`,
    });

    onPublish?.(true);
  };

  const isFormValid = obituary.deceased.firstName && 
                     obituary.deceased.lastName && 
                     obituary.deceased.birthDate && 
                     obituary.deceased.deathDate && 
                     obituary.texts.mainText;

  return (
    <div className="space-y-6">
      {!isAuthenticated && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Registrierung erforderlich
                </h3>
                <p className="text-blue-800 text-lg mb-4">
                  Um Ihre Traueranzeige zu veröffentlichen und zu teilen, müssen Sie sich zuerst kostenlos registrieren. 
                  Dies ermöglicht es Ihnen, Ihre Anzeigen zu verwalten und eine öffentliche URL zum Teilen zu erhalten.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Jetzt kostenlos registrieren
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-2"
                  >
                    Bereits Mitglied? Anmelden
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='border-0'>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold gap-2">
            <Globe className="w-5 h-5" />
            Traueranzeige veröffentlichen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Status */}
          {!isFormValid && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800 mb-2">
                <Shield className="w-4 h-4" />
                <span className="font-medium text-lg">Pflichtfelder fehlen</span>
              </div>
              <p className="text-lg text-orange-700">
                Bitte füllen Sie alle Pflichtfelder aus: Name, Geburts-/Sterbedatum und Haupttext.
              </p>
            </div>
          )}

          {/* Duration Selection */}
          <div>
            <label className="block font-medium mb-3">
              Veröffentlichungsdauer wählen
            </label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Dauer auswählen" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full text-xl">
                      <span>{option.label}</span>
                      <div className="flex items-center gap-2 ml-4">
                        {option.price > 0 ? (
                          <Badge variant="secondary">
                            {option.price.toFixed(2)} €
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
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
                    <span>{selectedOption.price.toFixed(2)} EUR</span>
                  </div>
                )}

                <div className="text-lg text-muted-foreground mt-2">
                  {selectedOption.price === 0 ? (
                    <p>Diese Veröffentlichungsdauer ist kostenlos verfügbar.</p>
                  ) : (
                    <p>Sichere Zahlung über Stripe. Die Traueranzeige wird nach erfolgreicher Zahlung sofort veröffentlicht.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleSaveDraft}
              variant="outline" 
              className="w-full text-xl"
              disabled={isPublishing || !isFormValid || !isAuthenticated}
            >
              {isPublishing ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Speichert...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Als Entwurf speichern
                </>
              )}
            </Button>

            <Button 
              onClick={handlePublish}
              className="w-full text-xl" 
              size="lg"
              disabled={isPublishing || isProcessingPayment || !isFormValid || !isAuthenticated}
            >
              {isProcessingPayment ? (
                <>
                  <CreditCard className="w-5 h-5 mr-2 animate-pulse" />
                  Zahlung wird verarbeitet...
                </>
              ) : isPublishing ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Veröffentlicht...
                </>
              ) : requiresPayment ? (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Jetzt kostenpflichtig veröffentlichen
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5 mr-2" />
                  Kostenlos veröffentlichen
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-lg text-muted-foreground bg-muted/20 p-3 rounded">
            <p className="mb-1">
              <strong>Kostenlos:</strong> Bis zu 30 Tage Veröffentlichung ohne Kosten.
            </p>
            <p className="mb-1">
              <strong>Premium:</strong> Längere Laufzeiten mit einmaliger Zahlung.
            </p>
            <p>
              <strong>Sicherheit:</strong> Alle Zahlungen werden sicher über Stripe verarbeitet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};