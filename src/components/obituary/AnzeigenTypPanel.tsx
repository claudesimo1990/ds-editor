import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ObituaryData } from '@/types/obituary';
import { FileText, Heart, Gift, BookOpen } from 'lucide-react';

interface AnzeigenTypPanelProps {
  obituary: ObituaryData;
  onUpdate: (updates: Partial<ObituaryData>) => void;
}

const anzeigenTypen = [
  {
    value: 'todesanzeige',
    name: 'Todesanzeige',
    icon: FileText,
    description: 'Klassische Anzeige zur Bekanntgabe des Todes',
    formats: ['182x100', '136x100', '90x100']
  },
  {
    value: 'in_memoriam',
    name: 'In Memoriam',
    icon: Heart,
    description: 'Gedenken an den Verstorbenen',
    formats: ['90x100', '44x100']
  },
  {
    value: 'danksagung',
    name: 'Danksagung',
    icon: Gift,
    description: 'Dank für Anteilnahme und Beileid',
    formats: ['136x100', '90x100']
  },
  {
    value: 'nachruf',
    name: 'Nachruf',
    icon: BookOpen,
    description: 'Ausführliche Würdigung des Verstorbenen',
    formats: ['182x100', '136x100', '90x100']
  }
];

const formatLabels = {
  '182x100': '182 × 100 mm (Groß, Querformat)',
  '136x100': '136 × 100 mm (Mittel, Querformat)',
  '90x100': '90 × 100 mm (Klein, Hochformat)',
  '44x100': '44 × 100 mm (Schmal, Hochformat)'
};

export const AnzeigenTypPanel: React.FC<AnzeigenTypPanelProps> = ({ obituary, onUpdate }) => {
  const currentType = anzeigenTypen.find(type => type.value === obituary.type);
  const availableFormats = currentType?.formats || [];

  const handleTypeChange = (newType: string) => {
    const typeInfo = anzeigenTypen.find(t => t.value === newType);
    if (typeInfo) {
      // Automatically select the largest available format for the new type
      const defaultFormat = typeInfo.formats[0];
      onUpdate({ 
        type: newType as ObituaryData['type'],
        format: defaultFormat as ObituaryData['format']
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
          <FileText className="w-5 h-5" />
          Anzeigentyp & Format
          <Badge variant="secondary" className="ml-auto">
            {currentType?.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Anzeigentyp auswählen */}
        <div className="space-y-2">
          <Label className="font-elegant text-base">Anzeigentyp</Label>
          <div className="grid grid-cols-1 gap-2">
            {anzeigenTypen.map((typ) => {
              const Icon = typ.icon;
              return (
                <button
                  key={typ.value}
                  className={`
                    p-3 rounded-lg border-2 text-left transition-all hover:shadow-md
                    ${obituary.type === typ.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                    }
                  `}
                  onClick={() => handleTypeChange(typ.value)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 text-primary" />
                    <div className="flex-1">
                      <div className="font-elegant text-base font-medium">{typ.name}</div>
                      <div className="text-base text-muted-foreground mt-1">
                        {typ.description}
                      </div>
                      <div className="text-base text-primary mt-1">
                        Verfügbare Formate: {typ.formats.map(f => formatLabels[f as keyof typeof formatLabels]).join(', ')}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format auswählen */}
        <div className="space-y-2">
          <Label className="font-elegant text-base">Format</Label>
          <Select 
            value={obituary.format} 
            onValueChange={(value: string) => onUpdate({ format: value as ObituaryData['format'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {formatLabels[format as keyof typeof formatLabels]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-base text-muted-foreground">
            Das Format bestimmt die Größe der gedruckten Anzeige in der Zeitung
          </p>
        </div>

        {/* Format-Info */}
        {obituary.format && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-base font-elegant mb-1">Gewähltes Format:</div>
            <div className="text-sm text-muted-foreground">
              {formatLabels[obituary.format as keyof typeof formatLabels]}
            </div>
            <div className="text-base text-muted-foreground mt-1">
              {obituary.format === '182x100' && 'Großes Querformat - ideal für ausführliche Texte und Fotos'}
              {obituary.format === '136x100' && 'Mittleres Querformat - ausgewogenes Verhältnis von Text und Bild'}
              {obituary.format === '90x100' && 'Kompaktes Hochformat - für prägnante Anzeigen'}
              {obituary.format === '44x100' && 'Schmales Hochformat - für kurze Gedenkzeilen'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};