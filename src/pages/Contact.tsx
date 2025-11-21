import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, HelpCircle, Heart } from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      content: '+49 (0) 800 123-4567',
      subtitle: 'Kostenlose Hotline'
    },
    {
      icon: Mail,
      title: 'E-Mail',
      content: 'support@memorial.de',
      subtitle: 'Wir antworten binnen 24h'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      content: 'Musterstraße 123',
      subtitle: '10115 Berlin, Deutschland'
    },
    {
      icon: Clock,
      title: 'Erreichbarkeit',
      content: 'Mo-Fr: 8:00-18:00',
      subtitle: 'Sa: 9:00-14:00'
    }
  ];

  const supportCategories = [
    { value: 'technical', label: 'Technische Probleme' },
    { value: 'design', label: 'Design & Gestaltung' },
    { value: 'export', label: 'Export & Download' },
    { value: 'account', label: 'Account & Registrierung' },
    { value: 'billing', label: 'Abrechnung & Premium' },
    { value: 'general', label: 'Allgemeine Fragen' },
    { value: 'feedback', label: 'Feedback & Vorschläge' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validierung
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Simuliere API-Aufruf
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Nachricht gesendet",
        description: "Vielen Dank für Ihre Nachricht. Wir melden uns binnen 24 Stunden bei Ihnen.",
      });

      // Form zurücksetzen
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Fehler beim Senden",
        description: "Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-subtle py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-memorial font-bold text-foreground mb-4">
            Wir sind für Sie da
          </h1>
          <p className="text-lg text-muted-foreground font-elegant">
            Bei Fragen, Problemen oder Anregungen zögern Sie nicht, uns zu kontaktieren. 
            Unser erfahrenes Team hilft Ihnen gerne weiter.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-memorial font-semibold text-center mb-8 text-foreground">
            So erreichen Sie uns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center shadow-memorial hover-lift">
                <CardContent className="p-6">
                  <info.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-memorial font-medium text-foreground mb-2">
                    {info.title}
                  </h3>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {info.content}
                  </p>
                  <p className="text-xs text-muted-foreground font-elegant">
                    {info.subtitle}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-memorial">
                <CardHeader>
                  <CardTitle className="flex items-center font-memorial text-foreground">
                    <MessageCircle className="w-5 h-5 mr-2 text-primary" />
                    Nachricht senden
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="font-elegant">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Ihr vollständiger Name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="font-elegant">E-Mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="ihre@email.de"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category" className="font-elegant">Kategorie</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="font-elegant">Betreff</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Kurze Beschreibung Ihres Anliegens"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="font-elegant">Nachricht *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Beschreiben Sie Ihr Anliegen so detailliert wie möglich..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        "Wird gesendet..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Nachricht senden
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Quick Help & FAQ */}
            <div className="space-y-6">
              <Card className="shadow-memorial">
                <CardHeader>
                  <CardTitle className="flex items-center font-memorial text-foreground">
                    <HelpCircle className="w-5 h-5 mr-2 text-primary" />
                    Schnelle Hilfe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium font-memorial text-foreground mb-2">
                      Häufige Probleme sofort lösen:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground font-elegant">
                      <li>• Anzeige wird nicht korrekt angezeigt → Browser aktualisieren</li>
                      <li>• PDF-Download funktioniert nicht → Pop-ups aktivieren</li>
                      <li>• Änderungen werden nicht gespeichert → Konto erstellen</li>
                      <li>• Bilder laden nicht → Internetverbindung prüfen</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium font-memorial text-foreground mb-2">
                      Bevor Sie uns kontaktieren:
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground font-elegant">
                      <li>✓ FAQ-Seite besucht</li>
                      <li>✓ Browser und Cache geleert</li>
                      <li>✓ Anderes Gerät getestet</li>
                      <li>✓ Fehlermeldung notiert</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Heart className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium font-memorial text-foreground mb-1">
                          Eilige Hilfe benötigt?
                        </h4>
                        <p className="text-sm text-muted-foreground font-elegant mb-2">
                          Bei dringenden Problemen rufen Sie uns direkt an.
                        </p>
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4 mr-2" />
                          Jetzt anrufen
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Support Promise */}
      <section className="py-16 px-4 bg-gradient-subtle">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-memorial font-semibold mb-4 text-foreground">
              Unser Versprechen an Sie
            </h2>
            <p className="text-lg text-muted-foreground font-elegant">
              Wir verstehen, dass Sie sich in einer schwierigen Zeit befinden. 
              Deshalb ist es uns besonders wichtig, Ihnen schnell und einfühlsam zu helfen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: '24h Antwortzeit',
                description: 'Wir melden uns spätestens am nächsten Werktag bei Ihnen zurück.'
              },
              {
                title: 'Kostenloser Support',
                description: 'Alle Hilfestellungen sind für Sie völlig kostenfrei.'
              },
              {
                title: 'Persönliche Betreuung',
                description: 'Jede Anfrage wird individuell und einfühlsam bearbeitet.'
              }
            ].map((promise, index) => (
              <Card key={index} className="text-center shadow-memorial">
                <CardContent className="p-6">
                  <h3 className="font-memorial font-medium text-foreground mb-2">
                    {promise.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-elegant">
                    {promise.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;