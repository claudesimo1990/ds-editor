import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin } from 'lucide-react';

const Kontakt = () => {

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle page ornaments */}
      <div className="memorial-page-ornament top-left" />
      <div className="memorial-page-ornament top-right" />
      <div className="memorial-page-ornament bottom-left" />
      <div className="memorial-page-ornament bottom-right" />
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-memorial font-bold text-foreground mb-4">
            Über Das Deutschland Echo
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-elegant">
            Seit über einem Jahrzehnt begleiten wir Familien in schweren Zeiten und helfen dabei, 
            würdevolle Erinnerungen an geliebte Menschen zu bewahren.
          </p>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-memorial font-bold text-foreground text-center mb-12">
            Firmendaten
          </h2>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-memorial font-bold text-foreground mb-2">
                  Media Franken G.G
                </h3>
                <p className="text-muted-foreground font-elegant">
                  Ihr vertrauensvoller Partner für digitale Gedenkkultur
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Geschäftsführer</h4>
                  <p className="text-muted-foreground">Georg Geheb</p>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <div className="text-center">
                    <p>Weidengasse 7</p>
                    <p>97483 Eltmann</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a href="mailto:info@dasdeutschlandecho.de" className="hover:text-primary transition-colors">
                      info@dasdeutschlandecho.de
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <a href="tel:+4917129422881" className="hover:text-primary transition-colors">
                      +49 171 2942281
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-memorial font-bold text-foreground mb-4">
            Haben Sie Fragen?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 font-elegant">
            Wir sind für Sie da und beantworten gerne alle Ihre Fragen rund um unser Gedenkportal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="shadow-elegant">
              <Phone className="w-5 h-5 mr-2" />
              Kontakt aufnehmen
            </Button>
            <Button variant="outline" size="lg">
              <Mail className="w-5 h-5 mr-2" />
              E-Mail schreiben
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Kontakt;