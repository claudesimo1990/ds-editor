import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, Clock, Euro, Heart, Shield } from 'lucide-react';

interface PublishingOption {
  id: string;
  duration: number; // days
  price: number; // euros
  title: string;
  description: string;
  popular?: boolean;
}

interface PublishingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (option: PublishingOption) => void;
  isLoading?: boolean;
}

const publishingOptions: PublishingOption[] = [
  {
    id: 'free',
    duration: 30,
    price: 0,
    title: '30 Tage kostenlos',
    description: 'Ideal zum Ausprobieren und für kurzfristige Gedenkseiten'
  },
  {
    id: 'standard',
    duration: 365,
    price: 29.99,
    title: '1 Jahr Premium',
    description: 'Ein ganzes Jahr für Familie und Freunde zugänglich',
    popular: true
  },
  {
    id: 'extended',
    duration: 1825, // 5 years
    price: 99.99,
    title: '5 Jahre Premium',
    description: 'Langfristige Erinnerung für kommende Generationen'
  },
  {
    id: 'lifetime',
    duration: -1, // unlimited
    price: 199.99,
    title: 'Lebenslang Premium',
    description: 'Dauerhafte Gedenkseite ohne zeitliche Begrenzung'
  }
];

export const PublishingDialog: React.FC<PublishingDialogProps> = ({
  open,
  onOpenChange,
  onPublish,
  isLoading = false
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('standard');

  const handlePublish = () => {
    const option = publishingOptions.find(opt => opt.id === selectedOption);
    if (option) {
      onPublish(option);
    }
  };

  const selectedPlan = publishingOptions.find(opt => opt.id === selectedOption);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-memorial text-memorial-heading flex items-center gap-2">
            <Heart className="w-6 h-6 text-memorial-charcoal" />
            Gedenkseite veröffentlichen
          </DialogTitle>
          <DialogDescription className="text-memorial-grey font-elegant">
            Wählen Sie eine Laufzeit für Ihre Gedenkseite. Nach der Veröffentlichung wird sie kurz geprüft und dann öffentlich zugänglich.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishingOptions.map((option) => (
                <div key={option.id} className="relative">
                  <Label htmlFor={option.id} className="cursor-pointer">
                    <Card className={`memorial-border-elegant transition-all hover:shadow-md ${
                      selectedOption === option.id ? 'ring-2 ring-memorial-charcoal' : ''
                    }`}>
                      {option.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-memorial-charcoal text-memorial-white">
                            Beliebt
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-memorial text-memorial-heading">
                            {option.title}
                          </CardTitle>
                          <RadioGroupItem value={option.id} id={option.id} />
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-memorial-charcoal">
                            {option.price === 0 ? 'Kostenlos' : `€${option.price}`}
                          </span>
                          {option.duration > 0 && (
                            <span className="text-memorial-grey text-sm">
                              für {option.duration === 365 ? '1 Jahr' : 
                                   option.duration === 1825 ? '5 Jahre' : 
                                   `${option.duration} Tage`}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-memorial-grey text-sm mb-4">
                          {option.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-memorial-charcoal">
                            <Check className="w-4 h-4 text-green-600" />
                            Unbegrenzte Besucher
                          </div>
                          <div className="flex items-center gap-2 text-sm text-memorial-charcoal">
                            <Check className="w-4 h-4 text-green-600" />
                            Kondolenz-Nachrichten
                          </div>
                          <div className="flex items-center gap-2 text-sm text-memorial-charcoal">
                            <Check className="w-4 h-4 text-green-600" />
                            Virtuelle Kerzen
                          </div>
                          <div className="flex items-center gap-2 text-sm text-memorial-charcoal">
                            <Check className="w-4 h-4 text-green-600" />
                            Foto-Galerie
                          </div>
                          {option.price > 0 && (
                            <div className="flex items-center gap-2 text-sm text-memorial-charcoal">
                              <Check className="w-4 h-4 text-green-600" />
                              Premium-Support
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {selectedPlan && (
            <Card className="bg-memorial-platinum/50 memorial-border-elegant">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-memorial-charcoal mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-memorial-charcoal">
                      Wie geht es weiter?
                    </h4>
                    <ol className="text-sm text-memorial-grey space-y-1 list-decimal list-inside">
                      <li>Nach dem Bestätigen wird {selectedPlan.price > 0 ? 'die Zahlung verarbeitet und ' : ''}Ihre Gedenkseite zur Prüfung eingereicht</li>
                      <li>Unser Team prüft die Inhalte (normalerweise innerhalb von 24 Stunden)</li>
                      <li>Sie erhalten eine E-Mail, sobald die Gedenkseite online ist</li>
                      <li>Die Gedenkseite ist dann {selectedPlan.duration === -1 ? 'dauerhaft' : `für ${selectedPlan.duration === 365 ? '1 Jahr' : selectedPlan.duration === 1825 ? '5 Jahre' : `${selectedPlan.duration} Tage`}`} öffentlich zugänglich</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handlePublish}
            disabled={isLoading}
            className="bg-memorial-charcoal hover:bg-memorial-black text-memorial-white"
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                {selectedPlan?.price ? 'Zahlung wird verarbeitet...' : 'Wird eingereicht...'}
              </>
            ) : (
              <>
                {selectedPlan?.price ? (
                  <>
                    <Euro className="w-4 h-4 mr-2" />
                    Jetzt bezahlen & veröffentlichen
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Kostenlos veröffentlichen
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};