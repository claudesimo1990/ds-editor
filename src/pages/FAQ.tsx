import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Phone, Mail, MessageCircle, Download, Share2, Palette, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
  const navigate = useNavigate();

  const faqCategories = [
    {
      title: 'Allgemeine Fragen',
      icon: HelpCircle,
      items: [
        {
          question: 'Was ist eine digitale Traueranzeige?',
          answer: 'Eine digitale Traueranzeige ist eine moderne Alternative zur gedruckten Traueranzeige. Sie wird online erstellt und kann digital geteilt, als PDF heruntergeladen oder ausgedruckt werden. Dadurch erreichen Sie Familie und Freunde schneller und kostengünstiger.'
        },
        {
          question: 'Ist die Nutzung wirklich kostenlos?',
          answer: 'Ja, unser Basis-Service ist vollständig kostenlos. Sie können Traueranzeigen erstellen, bearbeiten und als PDF herunterladen, ohne dafür zu bezahlen. Lediglich für Premium-Features wie erweiterte Designoptionen fallen geringe Kosten an.'
        },
        {
          question: 'Benötige ich eine Registrierung?',
          answer: 'Nein, Sie können sofort mit der Erstellung beginnen, ohne sich registrieren zu müssen. Wenn Sie Ihre Anzeige später bearbeiten möchten, empfehlen wir Ihnen jedoch, ein kostenloses Konto zu erstellen.'
        },
        {
          question: 'Wie lange dauert es, eine Anzeige zu erstellen?',
          answer: 'Die meisten Nutzer benötigen 10-15 Minuten für eine vollständige Traueranzeige. Dank unserer intuitiven Benutzeroberfläche und Vorlagen können Sie sehr schnell ein würdevolles Ergebnis erzielen.'
        }
      ]
    },
    {
      title: 'Design & Gestaltung',
      icon: Palette,
      items: [
        {
          question: 'Welche Designoptionen stehen zur Verfügung?',
          answer: 'Wir bieten verschiedene Hintergründe, Schriftarten, Rahmen und Farbschemata an. Sie können zwischen klassischen, modernen und natürlichen Designs wählen und diese individuell anpassen.'
        },
        {
          question: 'Kann ich eigene Bilder hochladen?',
          answer: 'Ja, Sie können eigene Fotos der verstorbenen Person sowie individuelle Hintergrundbilder hochladen. Unterstützt werden gängige Formate wie JPG und PNG.'
        },
        {
          question: 'Sind die Vorlagen für verschiedene Religionen geeignet?',
          answer: 'Unsere Designs sind bewusst universell gehalten und für alle Religionen und Weltanschauungen geeignet. Sie können passende Symbole wie Kreuze, Sterne oder Blumen auswählen.'
        },
        {
          question: 'Kann ich die Schriftgröße anpassen?',
          answer: 'Ja, alle Textbereiche können in der Schriftgröße angepasst werden. Dies ist besonders hilfreich für unterschiedliche Textmengen und bessere Lesbarkeit.'
        }
      ]
    },
    {
      title: 'Export & Teilen',
      icon: Share2,
      items: [
        {
          question: 'In welchen Formaten kann ich die Anzeige herunterladen?',
          answer: 'Die Anzeige kann als hochqualitatives PDF heruntergeladen werden, das perfekt für den Druck oder das digitale Teilen geeignet ist. Das PDF behält alle Formatierungen und die hohe Bildqualität bei.'
        },
        {
          question: 'Wie kann ich die Anzeige mit anderen teilen?',
          answer: 'Sie können die Anzeige per E-Mail versenden, über WhatsApp teilen oder in sozialen Medien posten. Zusätzlich erhalten Sie einen direkten Link, den Sie weitergeben können.'
        },
        {
          question: 'Ist die Anzeige für den Zeitungsdruck geeignet?',
          answer: 'Ja, das PDF ist in Druckqualität erstellt und kann direkt an Zeitungen weitergegeben werden. Die Auflösung und das Format entsprechen den Industriestandards.'
        },
        {
          question: 'Kann ich die Anzeige später noch ändern?',
          answer: 'Wenn Sie ein Konto erstellt haben, können Sie jederzeit auf Ihre gespeicherten Anzeigen zugreifen und diese bearbeiten. Ohne Konto sollten Sie alle gewünschten Änderungen vor dem Export vornehmen.'
        }
      ]
    },
    {
      title: 'Technischer Support',
      icon: Phone,
      items: [
        {
          question: 'Was tun, wenn die Anzeige nicht korrekt angezeigt wird?',
          answer: 'Aktualisieren Sie zunächst Ihren Browser und löschen Sie den Cache. Falls das Problem bestehen bleibt, kontaktieren Sie unseren Support mit Angabe Ihres Browsers und Betriebssystems.'
        },
        {
          question: 'Auf welchen Geräten funktioniert der Editor?',
          answer: 'Unser Editor funktioniert auf allen modernen Geräten - Desktop-Computer, Tablets und Smartphones. Für die beste Erfahrung empfehlen wir jedoch die Nutzung auf einem Desktop oder Tablet.'
        },
        {
          question: 'Was passiert, wenn mein Browser abstürzt?',
          answer: 'Wir speichern Ihre Arbeit automatisch im Browser. Nach einem Neustart können Sie meist dort weitermachen, wo Sie aufgehört haben. Für zusätzliche Sicherheit empfehlen wir das Erstellen eines Kontos.'
        },
        {
          question: 'Werden meine Daten sicher gespeichert?',
          answer: 'Ja, alle Daten werden verschlüsselt übertragen und gespeichert. Wir befolgen strenge Datenschutzrichtlinien und geben Ihre persönlichen Informationen niemals an Dritte weiter.'
        }
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Sofort starten',
      description: 'Beginnen Sie direkt mit der Erstellung Ihrer Traueranzeige',
      icon: Clock,
      action: () => navigate('/editor'),
      buttonText: 'Editor öffnen'
    },
    {
      title: 'Inspiration finden',
      description: 'Schauen Sie sich Beispiele anderer Traueranzeigen an',
      icon: HelpCircle,
      action: () => navigate('/verzeichnis'),
      buttonText: 'Verzeichnis ansehen'
    },
    {
      title: 'Persönlichen Support',
      description: 'Kontaktieren Sie uns für individuelle Hilfe',
      icon: MessageCircle,
      action: () => navigate('/kontakt'),
      buttonText: 'Kontakt aufnehmen'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-subtle py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-memorial font-bold text-foreground mb-4">
            Häufig gestellte Fragen
          </h1>
          <p className="text-lg text-muted-foreground font-elegant">
            Hier finden Sie Antworten auf die wichtigsten Fragen zur Erstellung von Traueranzeigen. 
            Falls Sie weitere Hilfe benötigen, kontaktieren Sie uns gerne.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-memorial font-semibold text-center mb-8 text-foreground">
            Schnelle Hilfe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="text-center shadow-memorial hover-lift">
                <CardContent className="p-6">
                  <action.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-memorial font-medium mb-2 text-foreground">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 font-elegant">
                    {action.description}
                  </p>
                  <Button onClick={action.action} variant="outline" size="sm">
                    {action.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <div className="flex items-center mb-6">
                <category.icon className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-memorial font-semibold text-foreground">
                  {category.title}
                </h2>
              </div>
              
              <Accordion type="single" collapsible className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <AccordionItem 
                    key={itemIndex} 
                    value={`${categoryIndex}-${itemIndex}`}
                    className="border border-border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-elegant font-medium text-foreground hover:text-primary">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground font-elegant leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-gradient-subtle">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-memorial font-semibold mb-4 text-foreground">
            Haben Sie weitere Fragen?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 font-elegant">
            Unser Support-Team steht Ihnen gerne zur Verfügung und hilft bei allen Anliegen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/kontakt')}>
              <Mail className="w-5 h-5 mr-2" />
              Kontakt aufnehmen
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/editor')}>
              <Palette className="w-5 h-5 mr-2" />
              Direkt starten
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;