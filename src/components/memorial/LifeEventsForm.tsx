import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Trash2, BookOpen, Heart, Home, Users, Plane, Trophy, Star, Calendar } from 'lucide-react';
import { LifeEvent } from '@/types/obituary';

interface LifeEventsFormProps {
  lifeEvents: LifeEvent[];
  onUpdate: (lifeEvents: LifeEvent[]) => void;
}

export const LifeEventsForm: React.FC<LifeEventsFormProps> = ({ 
  lifeEvents, 
  onUpdate 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<LifeEvent['category'] | 'all'>('all');

  const categoryOptions = [
    { value: 'arbeit', label: 'Arbeit', icon: Briefcase, color: 'bg-blue-100 text-blue-800' },
    { value: 'ausbildung', label: 'Ausbildung', icon: BookOpen, color: 'bg-green-100 text-green-800' },
    { value: 'beziehung', label: 'Beziehung', icon: Heart, color: 'bg-pink-100 text-pink-800' },
    { value: 'haus_wohnen', label: 'Haus und Wohnen', icon: Home, color: 'bg-orange-100 text-orange-800' },
    { value: 'familie', label: 'Familie', icon: Users, color: 'bg-purple-100 text-purple-800' },
    { value: 'reise', label: 'Reise', icon: Plane, color: 'bg-cyan-100 text-cyan-800' },
    { value: 'interessen', label: 'Interessen und Aktivitäten', icon: Star, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'meilensteine', label: 'Meilensteine und Erfolge', icon: Trophy, color: 'bg-amber-100 text-amber-800' },
    { value: 'memoriam', label: 'In Memoriam', icon: Calendar, color: 'bg-slate-100 text-slate-800' }
  ] as const;

  const addLifeEvent = (category: LifeEvent['category']) => {
    const newEvent: LifeEvent = {
      category,
      title: '',
      description: '',
      date: '',
      location: ''
    };
    onUpdate([...lifeEvents, newEvent]);
  };

  const updateLifeEvent = (index: number, updates: Partial<LifeEvent>) => {
    const updatedEvents = [...lifeEvents];
    updatedEvents[index] = { ...updatedEvents[index], ...updates };
    onUpdate(updatedEvents);
  };

  const removeLifeEvent = (index: number) => {
    const updatedEvents = lifeEvents.filter((_, i) => i !== index);
    onUpdate(updatedEvents);
  };

  const filteredEvents = selectedCategory === 'all' 
    ? lifeEvents 
    : lifeEvents.filter(event => event.category === selectedCategory);

  const getCategoryInfo = (category: LifeEvent['category']) => {
    return categoryOptions.find(opt => opt.value === category);
  };

  return (
    <Card className="memorial-border-elegant">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-memorial-heading">
          <Calendar className="w-5 h-5 text-memorial-darkGrey" />
          Lebensereignisse
        </CardTitle>
        <p className="text-sm text-memorial-grey font-elegant">
          Beschreiben Sie wichtige Ereignisse und Stationen im Leben der verstorbenen Person.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="text-xs"
          >
            Alle ({lifeEvents.length})
          </Button>
          {categoryOptions.map((category) => {
            const count = lifeEvents.filter(event => event.category === category.value).length;
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="text-xs"
              >
                <category.icon className="w-3 h-3 mr-1" />
                {category.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categoryOptions.map((category) => (
            <Button
              key={category.value}
              variant="outline"
              size="sm"
              onClick={() => addLifeEvent(category.value)}
              className="h-auto p-3 text-left justify-start border-memorial-silver hover:bg-memorial-platinum"
            >
              <category.icon className="w-4 h-4 mr-2 shrink-0" />
              <span className="text-xs">{category.label}</span>
            </Button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((event, globalIndex) => {
            const actualIndex = lifeEvents.findIndex(e => e === event);
            const categoryInfo = getCategoryInfo(event.category);
            
            return (
              <div key={actualIndex} className="border border-memorial-silver rounded-lg p-4 bg-memorial-snow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {categoryInfo && <categoryInfo.icon className="w-4 h-4 text-memorial-darkGrey" />}
                    <Badge variant="secondary" className={categoryInfo?.color}>
                      {categoryInfo?.label}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLifeEvent(actualIndex)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-memorial-charcoal">Titel *</Label>
                    <Input
                      value={event.title}
                      onChange={(e) => updateLifeEvent(actualIndex, { title: e.target.value })}
                      placeholder="z.B. Abschluss als Ingenieur"
                      className="font-elegant bg-white border-memorial-silver"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-memorial-charcoal">Beschreibung</Label>
                    <Textarea
                      value={event.description || ''}
                      onChange={(e) => updateLifeEvent(actualIndex, { description: e.target.value })}
                      placeholder="Beschreiben Sie dieses Ereignis näher..."
                      rows={3}
                      className="font-elegant bg-white border-memorial-silver"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-memorial-charcoal">Datum</Label>
                      <Input
                        type="date"
                        value={event.date || ''}
                        onChange={(e) => updateLifeEvent(actualIndex, { date: e.target.value })}
                        className="font-elegant bg-white border-memorial-silver"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-memorial-charcoal">Ort</Label>
                      <Input
                        value={event.location || ''}
                        onChange={(e) => updateLifeEvent(actualIndex, { location: e.target.value })}
                        placeholder="Berlin"
                        className="font-elegant bg-white border-memorial-silver"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-memorial-grey">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-elegant text-sm">
              {selectedCategory === 'all' 
                ? 'Noch keine Lebensereignisse hinzugefügt'
                : `Keine Ereignisse in der Kategorie "${categoryOptions.find(c => c.value === selectedCategory)?.label}"`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};