import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CandleDisplay } from '@/components/obituary/CandleDisplay';
import { LightCandleModal } from '@/components/obituary/LightCandleModal';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar,
  MapPin,
  Flame,
  Heart,
  Star,
  Users,
  Clock,
  Eye,
  Sparkles,
  BookOpen,
  PhoneCall,
  Mail,
  PenTool
} from 'lucide-react';
import newspaperVintage from '@/assets/newspaper-vintage.jpg';
import oldBooks from '@/assets/old-books.jpg';
import vintageTypewriter from '@/assets/vintage-typewriter.jpg';

interface Obituary {
  id: string;
  deceased_first_name: string;
  deceased_last_name: string;
  birth_date: string;
  death_date: string;
  photo_url?: string;
  orientation?: string;
  location_date?: string;
  trauerspruch?: string;
  main_text?: string;
  published_at: string;
}

const LandingPage = () => {
  const [recentObituaries, setRecentObituaries] = useState<Obituary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentObituaries = async () => {
      try {
        const { data, error } = await supabase
          .from('dde_memorial_pages')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        setRecentObituaries(data || []);
      } catch (error) {
        console.error('Error fetching obituaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentObituaries();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateAge = (birthDate: string, deathDate: string) => {
    const birth = new Date(birthDate);
    const death = new Date(deathDate);
    return death.getFullYear() - birth.getFullYear();
  };

  return (
    <div className="min-h-screen bg-amber-50 relative">
      {/* Newspaper container with max width */}
      <div className="max-w-[1300px] mx-auto">
        <div className="border-4 border-double border-white m-4">
          <div className="border-2 border-slate-600 p-6">
            {/* Newspaper masthead */}
            <header className="border-b-4 border-double border-white p-16 mb-8 memorialbackground">
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-white mb-2 mt-10">
                  Gegründet 1945 • Würdevolle Erinnerungen seit über 75 Jahren
                </div>
                {/* <h1 className="text-6xl md:text-8xl font-bold text-white mb-2" 
                    style={{ fontFamily: '"Times New Roman", serif' }}>
                  MEMORIAL TIMES
                </h1> */}
                <div className="text-sm uppercase tracking-widest text-white border-t border-b border-white py-2">
                  Deutschlands führende Traueranzeigen-Plattform
                </div>
                <div className="text-xs text-white mt-2">
                  {new Date().toLocaleDateString('de-DE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} • Ausgabe Nr. 29.567 • Kostenlos
                </div>
              </div>
            </header>

            {/* Main newspaper content in columns */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* Left column - Main story */}
              <div className="col-span-12 lg:col-span-8">
                <div className="border-b-2 border-slate-600 pb-4 mb-6">
                  <h2 className="text-4xl font-bold text-slate-900 mb-3 leading-tight"
                      style={{ fontFamily: '"Times New Roman", serif' }}>
                    TRAUERKULTUR IM WANDEL DER ZEIT
                  </h2>
                  <h3 className="text-xl text-slate-700 mb-4 font-semibold">
                    Wie die Digitalisierung das Gedenken revolutioniert
                  </h3>
                </div>
                
                {/* Article with image */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <div className="text-sm text-slate-800 leading-relaxed"
                         style={{ fontFamily: '"Times New Roman", serif' }}>
                      <p className="mb-4">
                        <span className="text-4xl float-left mr-2 mt-1 font-bold">I</span>
                        n einer Zeit des gesellschaftlichen Wandels verändert sich auch die Art, 
                        wie wir Abschied nehmen und unserer Verstorbenen gedenken. Die traditionelle 
                        Traueranzeige in der Tageszeitung weicht zunehmend modernen, digitalen Lösungen.
                      </p>
                      <p className="mb-4">
                        Diese Entwicklung spiegelt nicht nur den technologischen Fortschritt wider, 
                        sondern auch veränderte Bedürfnisse der Hinterbliebenen. Familien wünschen 
                        sich heute mehr Flexibilität, schnellere Verbreitung und die Möglichkeit, 
                        Erinnerungen dauerhaft zu bewahren.
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <img 
                      src={newspaperVintage} 
                      alt="Vintage Newspaper" 
                      className="w-full h-64 object-cover border border-slate-400"
                    />
                    <p className="text-xs text-slate-600 mt-1 italic text-center">
                      Traditionelle Zeitungen bleiben wichtig
                    </p>
                  </div>
                </div>

                {/* Kerzen Feature */}
                <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 mb-6">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <div className="w-12 h-16 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-full border-2 border-amber-300 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                              <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                              <div className="absolute inset-0 animate-ping">
                                <Sparkles className="w-6 h-6 text-amber-300 opacity-75" />
                              </div>
                            </div>
                          </div>
                          <div className="w-14 h-3 bg-amber-800 rounded-full mx-auto mt-1"></div>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-black font-serif mb-3">
                        GEDENKKERZEN ANZÜNDEN
                      </h3>
                      <p className="text-gray-700 mb-4 max-w-md mx-auto">
                        Zünden Sie eine Kerze für einen geliebten Menschen an. 
                        Ihre Flamme wird als Zeichen der Erinnerung und des Gedenkens leuchten.
                      </p>
                      
                      <CandleDisplay showAll />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Obituaries Section */}
                <div className="border-t-2 border-slate-600 pt-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-0.5 bg-slate-800"></div>
                    <h2 className="text-2xl font-black font-serif uppercase">Aktuelle Gedenkseiten</h2>
                    <div className="flex-1 h-0.5 bg-slate-800"></div>
                  </div>

                  {loading ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border border-gray-300">
                          <CardContent className="p-4">
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {recentObituaries.map((obituary) => (
                        <Card key={obituary.id} className="border border-gray-300 hover:border-black transition-colors group">
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              {obituary.main_photo_url && (
                                <div className="flex-shrink-0">
                                  <img 
                                    src={obituary.main_photo_url} 
                                    alt={`${obituary.deceased_first_name} ${obituary.deceased_last_name}`}
                                    className="w-16 h-20 object-cover border border-gray-300"
                                  />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-black font-serif text-lg mb-1">
                                  {obituary.deceased_first_name} {obituary.deceased_last_name}
                                </h3>
                                
                                <div className="text-sm text-gray-600 mb-2">
                                  {formatDate(obituary.birth_date)} - {formatDate(obituary.death_date)}
                                  <span className="ml-2 text-xs">
                                    ({calculateAge(obituary.birth_date, obituary.death_date)} Jahre)
                                  </span>
                                </div>
                                
                                {obituary.location_date && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    {obituary.location_date}
                                  </p>
                                )}
                                
                                {obituary.trauerspruch && (
                                  <p className="text-xs italic text-gray-700 mb-3 line-clamp-2">
                                    "{obituary.trauerspruch}"
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-2">
                                    <LightCandleModal
                                      obituaryId={obituary.id}
                                      deceasedName={`${obituary.deceased_first_name} ${obituary.deceased_last_name}`}
                                      trigger={
                                        <Button size="sm" variant="outline" className="text-xs border-amber-300 hover:bg-amber-50">
                                          <Flame className="w-3 h-3 mr-1" />
                                          Kerze
                                        </Button>
                                      }
                                    />
                                    <Link to={`/gedenkseite/${obituary.id}`}>
                                    <Button size="sm" variant="outline" className="text-xs">
                                      <Eye className="w-3 h-3 mr-1" />
                                      Ansehen
                                    </Button>
                                    </Link>
                                  </div>
                                  
                                  <CandleDisplay obituaryId={obituary.id} compact />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="text-center mt-6">
                    <Link to="/gedenkportal">
                      <Button className="bg-slate-800 text-white hover:bg-slate-700">
                        <PenTool className="w-4 h-4 mr-2" />
                        Alle Gedenkseiten anzeigen
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right column - Sidebar content */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Breaking news box */}
                <div className="border-2 border-slate-600 p-4 bg-slate-50">
                  <h4 className="text-lg font-bold text-slate-900 mb-2 border-b border-slate-400 pb-2">
                    EILMELDUNG
                  </h4>
                  <div className="text-sm text-slate-700">
                    <p className="font-bold mb-2">Neue Funktionen verfügbar:</p>
                    <p>• Foto-Upload für Verstorbene</p>
                    <p>• Querformat-Traueranzeigen</p>
                    <p>• Digitale Gedenkkerzen</p>
                    <p>• QR-Code für Gedenkseiten</p>
                  </div>
                </div>

                {/* Latest Candles */}
                <Card className="border-2 border-amber-300 bg-amber-50">
                  <CardContent className="p-4">
                    <h3 className="font-bold font-serif mb-3 border-b border-amber-200 pb-2 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      BRENNENDE KERZEN
                    </h3>
                    <CandleDisplay showAll />
                  </CardContent>
                </Card>

                {/* Image with caption */}
                <div className="border border-slate-400">
                  <img 
                    src={vintageTypewriter} 
                    alt="Vintage Typewriter" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3 bg-slate-50 border-t border-slate-400">
                    <p className="text-sm text-slate-700 font-bold mb-1">
                      Von der Schreibmaschine zum Computer
                    </p>
                    <p className="text-xs text-slate-600">
                      Die Entwicklung der Textverarbeitung hat auch das Erstellen 
                      von Traueranzeigen revolutioniert.
                    </p>
                  </div>
                </div>

                {/* Features box */}
                <div className="border-2 border-slate-600 p-4 bg-slate-50">
                  <h4 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-400 pb-2">
                    UNSERE DIENSTE
                  </h4>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex items-start gap-2">
                      <Flame className="w-4 h-4 mt-0.5 text-amber-600" />
                      <div>
                        <strong>Gedenkkerzen</strong><br/>
                        Zünden Sie virtuelle Kerzen an
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Eye className="w-4 h-4 mt-0.5 text-slate-600" />
                      <div>
                        <strong>Foto-Integration</strong><br/>
                        Persönliche Bilder einbinden
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 text-slate-600" />
                      <div>
                        <strong>24/7 Verfügbar</strong><br/>
                        Erstellen Sie jederzeit Anzeigen
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 mt-0.5 text-slate-600" />
                      <div>
                        <strong>Kostenlos</strong><br/>
                        Keine versteckten Gebühren
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial box */}
                <div className="border-2 border-slate-600 p-4 bg-slate-50">
                  <h4 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-400 pb-2">
                    LESERSTIMMEN
                  </h4>
                  <div className="space-y-4">
                    <blockquote className="text-sm text-slate-700">
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-600 fill-current" />
                        ))}
                      </div>
                      <p className="italic mb-2">
                        "Das Kerzen-Feature ist so bewegend. Wir konnten sehen, 
                        wie viele Menschen an unseren Vater gedacht haben."
                      </p>
                      <cite className="text-xs text-slate-600">
                        — Familie Müller, München
                      </cite>
                    </blockquote>
                    
                    <blockquote className="text-sm text-slate-700 border-t border-slate-300 pt-3">
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-600 fill-current" />
                        ))}
                      </div>
                      <p className="italic mb-2">
                        "Die Foto-Integration macht die Anzeige so persönlich. 
                        Genau das, was wir für Mama wollten."
                      </p>
                      <cite className="text-xs text-slate-600">
                        — Anna Weber, Berlin
                      </cite>
                    </blockquote>
                  </div>
                </div>

                {/* Weather/date box */}
                <div className="border-2 border-slate-600 p-4 bg-slate-50">
                  <h4 className="text-lg font-bold text-slate-900 mb-2 border-b border-slate-400 pb-2">
                    HEUTE
                  </h4>
                  <div className="text-sm text-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>München, Deutschland</span>
                    </div>
                    <p>Bewölkt, 18°C</p>
                    <p className="italic">Ein ruhiger Tag für stille Momente der Erinnerung</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="border-t-4 border-double border-slate-800 pt-6 mt-8 text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs text-slate-600">
                <div>
                  <strong>Redaktion:</strong><br/>
                  Hauptstraße 123, 10115 Berlin<br/>
                  Tel: 030-12345678
                </div>
                <div>
                  <strong>Services:</strong><br/>
                  <Link to="/traueranzeigen" className="hover:underline">Traueranzeigen</Link><br/>
                  <Link to="/begleiter" className="hover:underline">Begleiter-Service</Link>
                </div>
                <div>
                  <strong>Kontakt:</strong><br/>
                  <Link to="/contact" className="hover:underline">info@memorial-times.de</Link><br/>
                  24/7 Service verfügbar
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Memorial Times © 2024 • Alle Rechte vorbehalten • 
                <Link to="/impressum" className="hover:underline ml-1">Impressum</Link>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;