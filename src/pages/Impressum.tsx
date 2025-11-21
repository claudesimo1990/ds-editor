import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Building, ArrowLeft } from 'lucide-react';

const Impressum = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative ornaments */}
      <div className="absolute top-8 left-8 memorial-ornament-left opacity-60" />
      <div className="absolute top-8 right-8 memorial-ornament-right opacity-60" />
      <div className="absolute bottom-8 left-1/4 memorial-ornament-center opacity-40" />
      <div className="absolute bottom-8 right-1/4 memorial-ornament-center opacity-40" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-gentle mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Zurück zur Startseite</span>
          </Link>

          {/* Header with Logo */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <img 
                src="/lovable-uploads/9d4e5b81-dc9c-475a-aa0b-bcfb30b624d0.png" 
                alt="Das Deutschland Echo Logo" 
                className="h-12 w-auto"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-memorial text-foreground mb-4">
              Impressum
            </h1>
            <p className="text-muted-foreground font-memorial">
              Rechtliche Informationen und Kontaktdaten
            </p>
          </div>

          <div className="grid gap-8">
            {/* Anbieter Information */}
            <Card className="memorial-card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold font-memorial mb-6 flex items-center">
                  <Building className="h-6 w-6 mr-3 text-primary" />
                  Anbieter
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Das Deutschland Echo</h3>
                    <p className="text-muted-foreground">
                      Digitales Trauerportal für Deutschland
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <p className="font-medium">Adresse</p>
                          <p className="text-muted-foreground">
                            Musterstraße 123<br />
                            12345 Berlin<br />
                            Deutschland
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Telefon</p>
                          <p className="text-muted-foreground">+49-171-2942281</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">E-Mail</p>
                          <p className="text-muted-foreground">info@dasdeutschlandecho.de</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium">Geschäftsführung</p>
                        <p className="text-muted-foreground">Max Mustermann</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rechtliche Hinweise */}
            <Card className="memorial-card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold font-memorial mb-6">
                  Rechtliche Hinweise
                </h2>
                
                <div className="space-y-6 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Haftung für Inhalte</h3>
                    <p>
                      Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Haftung für Links</h3>
                    <p>
                      Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Urheberrecht</h3>
                    <p>
                      Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kontakt */}
            <Card className="memorial-card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold font-memorial mb-6">
                  Kontakt
                </h2>
                <p className="text-muted-foreground mb-4">
                  Bei Fragen zu diesem Impressum oder unseren Diensten können Sie uns gerne kontaktieren.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/kontakt" 
                    className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-gentle"
                  >
                    Kontakt aufnehmen
                  </Link>
                  <Link 
                    to="/datenschutz" 
                    className="inline-flex items-center px-6 py-3 border border-border rounded-lg hover:bg-accent transition-gentle"
                  >
                    Datenschutz
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impressum;