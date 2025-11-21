import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ObituaryData } from '@/types/obituary';
import { 
  FileText, 
  Lightbulb, 
  Plus, 
  Wand2,
  BookOpen,
  Quote,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';

interface EnhancedTextPanelProps {
  obituary: ObituaryData;
  onUpdateTexts: (updates: Partial<ObituaryData['texts']>) => void;
  onUpdateDeceased: (updates: Partial<ObituaryData['deceased']>) => void;
}

export const EnhancedTextPanel: React.FC<EnhancedTextPanelProps> = ({
  obituary,
  onUpdateTexts,
  onUpdateDeceased
}) => {
  const [textLength, setTextLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [textStyle, setTextStyle] = useState<'formal' | 'personal' | 'modern'>('personal');

  const extendedSuggestions = {
    trauerspruch: {
      formal: [
        "In stillem Gedenken",
        "In liebevoller Erinnerung",
        "Ruhe in Frieden",
        "Unvergessen in unseren Herzen"
      ],
      personal: [
        "Du fehlst uns jeden Tag",
        "Für immer in unseren Herzen",
        "Deine Liebe wird ewig bleiben",
        "Du warst das Licht in unserem Leben"
      ],
      modern: [
        "Ein Leben voller Güte und Liebe",
        "Dankbar für die gemeinsame Zeit",
        "Du bleibst unvergessen",
        "In Liebe und Dankbarkeit"
      ]
    },
    introduction: {
      formal: [
        "Nach einem erfüllten Leben ist friedlich eingeschlafen",
        "Nach langer, schwerer Krankheit sanft entschlafen",
        "Plötzlich und unerwartet von uns gegangen",
        "Im Kreise der Familie friedlich eingeschlafen"
      ],
      personal: [
        "Viel zu früh und völlig unerwartet ist von uns gegangen",
        "Nach tapferem Kampf gegen eine schwere Krankheit",
        "Im Alter von [Alter] Jahren ist eingeschlafen",
        "Umgeben von der Liebe seiner Familie verstorben"
      ],
      modern: [
        "Hat sein/ihr Leben in Würde vollendet",
        "Ist seinem/ihrem Leiden erlegen",
        "Hat den Kampf gegen die Krankheit verloren",
        "Ist für immer eingeschlafen"
      ]
    },
    mainText: {
      short: [
        "Du wirst uns sehr fehlen.",
        "In liebevoller Erinnerung.",
        "Unvergessen in unseren Herzen.",
        "Ruhe in Frieden."
      ],
      medium: [
        "Wir werden dich nie vergessen und immer in liebevoller Erinnerung behalten.",
        "Deine Güte, dein Lächeln und deine Wärme werden für immer in unseren Herzen leben.",
        "Du hast unser Leben bereichert und wirst uns sehr fehlen.",
        "In Dankbarkeit für all die schönen Jahre, die wir mit dir verbringen durften."
      ],
      long: [
        "Du warst ein liebevoller Mensch, der uns allen sehr viel bedeutet hat. Deine Güte, deine Weisheit und dein warmes Herz werden uns immer in Erinnerung bleiben. Wir sind dankbar für all die wunderbaren Momente, die wir mit dir teilen durften.",
        "Ein Leben voller Liebe und Hingabe ist zu Ende gegangen. Du warst für uns alle ein Vorbild an Stärke und Güte. Deine Erinnerung wird in unseren Herzen weiterleben und uns Kraft geben in schweren Zeiten.",
        "Mit großer Trauer nehmen wir Abschied von einem wunderbaren Menschen. Deine Liebe, deine Fürsorge und dein unerschütterlicher Glaube haben unser Leben geprägt. Du wirst uns fehlen, aber niemals vergessen werden."
      ]
    }
  };

  const generateText = (field: keyof typeof extendedSuggestions, style: string, length?: string) => {
    const suggestions = extendedSuggestions[field];
    if (field === 'mainText' && length) {
      const lengthSuggestions = (suggestions as any)[length];
      return lengthSuggestions[Math.floor(Math.random() * lengthSuggestions.length)];
    } else {
      const styleSuggestions = (suggestions as any)[style];
      return styleSuggestions[Math.floor(Math.random() * styleSuggestions.length)];
    }
  };

  const handleAutoGenerate = (field: keyof ObituaryData['texts']) => {
    let text = '';
    if (field === 'mainText') {
      text = generateText('mainText', textStyle, textLength);
    } else if (field === 'trauerspruch') {
      text = generateText('trauerspruch', textStyle);
    } else if (field === 'introduction') {
      text = generateText('introduction', textStyle);
    }
    
    onUpdateTexts({ [field]: text });
  };

  const getTextStats = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    return { words, chars };
  };

  return (
    <div className="space-y-4">
      {/* Text-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-memorial">
            <Wand2 className="w-4 h-4" />
            Text-Assistent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-elegant">Stil</Label>
              <Select value={textStyle} onValueChange={(value: 'formal' | 'personal' | 'modern') => setTextStyle(value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Förmlich</SelectItem>
                  <SelectItem value="personal">Persönlich</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-elegant">Länge</Label>
              <Select value={textLength} onValueChange={(value: 'short' | 'medium' | 'long') => setTextLength(value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Kurz</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="long">Lang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trauerspruch mit Statistiken */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-memorial">
            <Quote className="w-4 h-4" />
            Trauerspruch
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAutoGenerate('trauerspruch')}
              className="ml-auto h-6"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              <span className="text-xs">Generieren</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={obituary.texts.trauerspruch}
            onChange={(e) => onUpdateTexts({ trauerspruch: e.target.value })}
            placeholder="In liebevoller Erinnerung..."
            className="font-elegant"
            rows={2}
          />
          {obituary.texts.trauerspruch && (
            <div className="flex gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="h-5">
                {getTextStats(obituary.texts.trauerspruch).words} Wörter
              </Badge>
              <Badge variant="outline" className="h-5">
                {getTextStats(obituary.texts.trauerspruch).chars} Zeichen
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Einleitungstext */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-memorial">
            <BookOpen className="w-4 h-4" />
            Einleitungstext
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAutoGenerate('introduction')}
              className="ml-auto h-6"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              <span className="text-xs">Generieren</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={obituary.texts.introduction}
            onChange={(e) => onUpdateTexts({ introduction: e.target.value })}
            placeholder="Nach einem erfüllten Leben ist friedlich eingeschlafen..."
            className="font-elegant"
            rows={2}
          />
        </CardContent>
      </Card>

      {/* Haupttext mit erweiterten Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-memorial">
            <FileText className="w-4 h-4" />
            Haupttext
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAutoGenerate('mainText')}
              className="ml-auto h-6"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              <span className="text-xs">Generieren</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={obituary.texts.mainText}
            onChange={(e) => onUpdateTexts({ mainText: e.target.value })}
            placeholder="Wir werden dich nie vergessen..."
            className="font-elegant"
            rows={4}
          />
          {obituary.texts.mainText && (
            <div className="flex gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="h-5">
                {getTextStats(obituary.texts.mainText).words} Wörter
              </Badge>
              <Badge variant="outline" className="h-5">
                {getTextStats(obituary.texts.mainText).chars} Zeichen
              </Badge>
              <Badge variant={getTextStats(obituary.texts.mainText).words < 20 ? "destructive" : 
                             getTextStats(obituary.texts.mainText).words < 50 ? "secondary" : "default"} 
                     className="h-5">
                {getTextStats(obituary.texts.mainText).words < 20 ? "Zu kurz" :
                 getTextStats(obituary.texts.mainText).words < 50 ? "Optimal" : "Lang"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vorlagen für häufige Phrasen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-memorial">
            <Lightbulb className="w-4 h-4" />
            Häufige Phrasen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            "Die Bestattung findet im engsten Familienkreis statt.",
            "Anstelle von Blumen bitten wir um eine Spende an...",
            "Die Trauerfeier findet am [Datum] um [Uhrzeit] statt.",
            "Von Beileidsbekundungen am Grab bitten wir abzusehen.",
            "Wir danken allen, die sich mit uns in Trauer verbunden fühlen."
          ].map((phrase, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto p-2 text-left justify-start w-full"
              onClick={() => {
                const current = obituary.texts.additionalTexts;
                const newText = current ? `${current}\n${phrase}` : phrase;
                onUpdateTexts({ additionalTexts: newText });
              }}
            >
              <Plus className="w-3 h-3 mr-2 shrink-0" />
              <span className="text-xs">{phrase}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};