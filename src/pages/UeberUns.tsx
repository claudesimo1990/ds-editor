import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Award, Shield, Phone, Mail, MapPin } from 'lucide-react';

const UeberUns = () => {
  const values = [
    {
      icon: Heart,
      title: 'Würde und Respekt',
      description: 'Jede Traueranzeige wird mit größter Sorgfalt und Respekt vor dem Verstorbenen behandelt.'
    },
    {
      icon: Users,
      title: 'Persönliche Betreuung',
      description: 'Unser erfahrenes Team steht Ihnen in schweren Zeiten einfühlsam zur Seite.'
    },
    {
      icon: Award,
      title: 'Qualität seit Jahren',
      description: 'Über 15 Jahre Erfahrung in der Gestaltung von würdevollen Gedenkseiten.'
    },
    {
      icon: Shield,
      title: 'Vertrauen und Sicherheit',
      description: 'Ihre Daten und Erinnerungen sind bei uns in sicheren Händen.'
    }
  ];

  const team = [
    {
      name: 'Georg Geheb',
      position: 'Geschäftsführer & Gründer',
      description: 'Mit über 15 Jahren Erfahrung in der Trauerbegleitung leitet Georg unser Unternehmen mit Herz und Verstand.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
    }
  ];

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

      {/* Mission Statement */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Heart className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-memorial font-bold text-foreground mb-6">
              Unsere Mission
            </h2>
            <p className="text-lg text-muted-foreground font-elegant leading-relaxed">
              Das Deutschland Echo wurde mit dem Ziel gegründet, Familien in Zeiten des Abschieds zu unterstützen. 
              Wir glauben daran, dass jeder Mensch eine würdevolle Erinnerung verdient, die sein Leben und 
              seine Persönlichkeit widerspiegelt. Unser digitales Gedenkportal verbindet Tradition mit 
              modernen Möglichkeiten, um Erinnerungen für die Ewigkeit zu bewahren.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-memorial font-bold text-foreground text-center mb-12">
            Unsere Werte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-elegant transition-gentle">
                  <CardContent className="p-6">
                    <IconComponent className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-memorial font-semibold text-foreground mb-3">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-elegant">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-memorial font-bold text-foreground text-center mb-12">
            Unser Team
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-elegant transition-gentle">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/3">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                  </div>
                  <CardContent className="lg:w-2/3 p-8">
                    <h3 className="text-2xl font-memorial font-bold text-foreground mb-2">
                      {member.name}
                    </h3>
                    <p className="text-primary font-elegant font-medium mb-4">
                      {member.position}
                    </p>
                    <p className="text-muted-foreground font-elegant leading-relaxed">
                      {member.description}
                    </p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
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

export default UeberUns;