import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Search, Calendar, MapPin, Eye, Share2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import memorialBg1 from '@/assets/memorial-bg-1.jpg';
import memorialBg2 from '@/assets/memorial-bg-2.jpg';
import memorialBg3 from '@/assets/memorial-bg-3.jpg';

interface ObituaryEntry {
  id: string;
  name: string;
  birthDate: string;
  deathDate: string;
  location: string;
  image: string;
  quote: string;
  category: 'klassisch' | 'modern' | 'natürlich';
  views: number;
  shared: number;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Beispiel-Traueranzeigen
  const obituaries: ObituaryEntry[] = [
    {
      id: '1',
      name: 'Anna Müller',
      birthDate: '15.03.1945',
      deathDate: '12.01.2024',
      location: 'München',
      image: memorialBg1,
      quote: 'In liebevoller Erinnerung an eine wunderbare Mutter',
      category: 'klassisch',
      views: 245,
      shared: 12
    },
    {
      id: '2',
      name: 'Dr. Hans Weber',
      birthDate: '08.07.1952',
      deathDate: '28.12.2023',
      location: 'Berlin',
      image: memorialBg2,
      quote: 'Ein Leben voller Hingabe und Güte',
      category: 'modern',
      views: 189,
      shared: 8
    },
    {
      id: '3',
      name: 'Maria Schmidt',
      birthDate: '22.11.1938',
      deathDate: '05.01.2024',
      location: 'Hamburg',
      image: memorialBg3,
      quote: 'Ihre Liebe wird für immer in unseren Herzen leben',
      category: 'natürlich',
      views: 312,
      shared: 18
    },
    {
      id: '4',
      name: 'Friedrich Bauer',
      birthDate: '14.09.1940',
      deathDate: '20.01.2024',
      location: 'Köln',
      image: memorialBg1,
      quote: 'Ein treuer Begleiter auf allen Wegen des Lebens',
      category: 'klassisch',
      views: 156,
      shared: 7
    },
    {
      id: '5',
      name: 'Elisabeth Klein',
      birthDate: '03.05.1955',
      deathDate: '15.01.2024',
      location: 'Stuttgart',
      image: memorialBg2,
      quote: 'Ihre Güte und ihr Lächeln werden unvergessen bleiben',
      category: 'modern',
      views: 278,
      shared: 15
    },
    {
      id: '6',
      name: 'Johann Fischer',
      birthDate: '28.12.1933',
      deathDate: '10.01.2024',
      location: 'Frankfurt',
      image: memorialBg3,
      quote: 'In Dankbarkeit für ein erfülltes Leben',
      category: 'natürlich',
      views: 198,
      shared: 9
    }
  ];

  const categories = [
    { value: 'alle', label: 'Alle Kategorien' },
    { value: 'klassisch', label: 'Klassisch' },
    { value: 'modern', label: 'Modern' },
    { value: 'natürlich', label: 'Natürlich' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Neueste zuerst' },
    { value: 'oldest', label: 'Älteste zuerst' },
    { value: 'most-viewed', label: 'Meist angesehen' },
    { value: 'most-shared', label: 'Meist geteilt' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'klassisch': return 'bg-blue-100 text-blue-800';
      case 'modern': return 'bg-purple-100 text-purple-800';
      case 'natürlich': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredObituary = obituaries.filter(obituary => {
    const matchesSearch = obituary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obituary.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'alle' || obituary.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedObituary = [...filteredObituary].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.deathDate.split('.').reverse().join('-')).getTime() - 
               new Date(a.deathDate.split('.').reverse().join('-')).getTime();
      case 'oldest':
        return new Date(a.deathDate.split('.').reverse().join('-')).getTime() - 
               new Date(b.deathDate.split('.').reverse().join('-')).getTime();
      case 'most-viewed':
        return b.views - a.views;
      case 'most-shared':
        return b.shared - a.shared;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-subtle py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-memorial font-bold text-foreground mb-4">
            Traueranzeigen Verzeichnis
          </h1>
          <p className="text-lg text-muted-foreground font-elegant max-w-2xl mx-auto">
            Entdecken Sie würdevolle Traueranzeigen und lassen Sie sich für Ihre eigene inspirieren. 
            Jede Anzeige erzählt eine einzigartige Geschichte des Abschieds.
          </p>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="py-8 px-4 bg-card border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Nach Namen oder Ort suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => navigate('/editor')} className="w-full md:w-auto">
              <Heart className="w-4 h-4 mr-2" />
              Eigene Anzeige erstellen
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {sortedObituary.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-memorial font-medium mb-2">Keine Anzeigen gefunden</h3>
              <p className="text-muted-foreground">Versuchen Sie andere Suchbegriffe oder Filter.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-memorial font-semibold text-foreground">
                  {sortedObituary.length} Traueranzeigen gefunden
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedObituary.map((obituary) => (
                  <Card key={obituary.id} className="overflow-hidden shadow-memorial hover-lift group">
                    <div className="relative">
                      <div 
                        className="h-64 bg-cover bg-center"
                        style={{ backgroundImage: `url(${obituary.image})` }}
                      >
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button variant="secondary" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Vollständig ansehen
                          </Button>
                        </div>
                      </div>
                      <Badge className={`absolute top-3 right-3 ${getCategoryColor(obituary.category)}`}>
                        {obituary.category}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-memorial font-semibold mb-2 text-foreground">
                        {obituary.name}
                      </h3>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        {obituary.birthDate} - {obituary.deathDate}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {obituary.location}
                      </div>
                      
                      <p className="text-sm text-muted-foreground italic mb-4 line-clamp-2 font-elegant">
                        "{obituary.quote}"
                      </p>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {obituary.views}
                          </span>
                          <span className="flex items-center">
                            <Share2 className="w-3 h-3 mr-1" />
                            {obituary.shared}
                          </span>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4 mr-1" />
                          Inspiration
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-subtle">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-memorial font-semibold mb-4 text-foreground">
            Erstellen Sie Ihre eigene Traueranzeige
          </h2>
          <p className="text-lg text-muted-foreground mb-8 font-elegant">
            Lassen Sie sich von diesen Beispielen inspirieren und gestalten Sie eine würdevolle Anzeige.
          </p>
          <Button size="lg" onClick={() => navigate('/editor')} className="shadow-elegant">
            <Heart className="w-5 h-5 mr-2" />
            Jetzt kostenlos erstellen
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Gallery;