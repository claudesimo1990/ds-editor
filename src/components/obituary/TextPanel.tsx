import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ObituaryData } from '@/types/obituary';
import { FormValidation } from './FormValidation';
import { TextValidation } from './TextValidation';
import { 
  User, 
  Type, 
  Calendar as CalendarIcon, 
  MapPin, 
  Quote, 
  FileText,
  Users,
  Plus,
  Lightbulb,
  Check,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette as PaletteIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { debounce } from "lodash";


interface TextPanelProps {
  obituary: ObituaryData;
  onUpdateTexts: (updates: Partial<ObituaryData['texts']>) => void;
  onUpdateDeceased: (updates: Partial<ObituaryData['deceased']>) => void;
  onUpdate: (updates: Partial<ObituaryData>) => void;
}

export const TextPanel: React.FC<TextPanelProps> = ({
  obituary,
  onUpdateTexts,
  onUpdateDeceased,
  onUpdate
}) => {
  // const [birthDate, setBirthDate] = useState<Date | undefined>(
  //   obituary.deceased.birthDate ? new Date(obituary.deceased.birthDate) : undefined
  // );
  // const [deathDate, setDeathDate] = useState<Date | undefined>(
  //   obituary.deceased.deathDate ? new Date(obituary.deceased.deathDate) : undefined
  // );
  const [birthDate, setBirthDate] = useState<any>(
    obituary.deceased.birthDate 
  );
  const [deathDate, setDeathDate] = useState<any>(
    obituary.deceased.deathDate
  );

  const suggestions = {
    trauerspruch: [
      "In liebevoller Erinnerung",
      "Du fehlst uns jeden Tag",
      "Für immer in unseren Herzen",
      "Deine Liebe wird ewig bleiben",
      "Ein Leben voller Güte und Liebe",
      "Du warst das Licht in unserem Leben"
    ],
    introduction: [
      "Nach einem erfüllten Leben ist friedlich eingeschlafen",
      "Viel zu früh und völlig unerwartet ist von uns gegangen",
      "Nach langer, schwerer Krankheit erlöst worden",
      "Im Kreise seiner/ihrer Familie eingeschlafen"
    ],
    mainText: [
      "Wir werden dich nie vergessen und immer in liebevoller Erinnerung behalten.",
      "Deine Güte, dein Lächeln und deine Wärme werden für immer in unseren Herzen leben.",
      "Du hast unser Leben bereichert und wirst uns sehr fehlen.",
      "In Dankbarkeit für all die schönen Jahre, die wir mit dir verbringen durften."
    ]
  };

  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);

  // const handleDateChange = (date: Date | undefined, field: 'birthDate' | 'deathDate') => {
  //   if (field === 'birthDate') {
  //     setBirthDate(date);
  //     onUpdateDeceased({ birthDate: date ? date.toISOString().split('T')[0] : '' });
  //   } else {
  //     setDeathDate(date);
  //     onUpdateDeceased({ deathDate: date ? date.toISOString().split('T')[0] : '' });
  //   }
  // };
  const handleDateChange = (date: any, field: 'birthDate' | 'deathDate') => {
    if (field === 'birthDate') {
      setBirthDate(date);
      onUpdateDeceased({ birthDate: date ? date : '' });
    } else {
      setDeathDate(date);
      onUpdateDeceased({ deathDate: date ? date : '' });
    }
  };

  const getCompletionBadge = (field: string) => {
    switch (field) {
      case 'person':
        return obituary.deceased.firstName && obituary.deceased.lastName ? 
          <Badge variant="secondary" className="h-5"><Check className="w-3 h-3" /></Badge> : 
          <Badge variant="outline" className="h-5">Unvollständig</Badge>;
      case 'dates':
        return obituary.deceased.birthDate && obituary.deceased.deathDate ? 
          <Badge variant="secondary" className="h-5"><Check className="w-3 h-3" /></Badge> : 
          <Badge variant="outline" className="h-5">Optional</Badge>;
      case 'main':
        return obituary.texts.mainText ? 
          <Badge variant="secondary" className="h-5"><Check className="w-3 h-3" /></Badge> : 
          <Badge variant="outline" className="h-5">Empfohlen</Badge>;
      default:
        return null;
    }
  };

  const useSuggestion = (field: keyof ObituaryData['texts'], suggestion: string) => {
    onUpdateTexts({ [field]: suggestion });
    setShowSuggestions(null);
  };

  const colors = [
    { name: 'Standard', value: 'default' },
    { name: 'Schwarz', value: '#000000' },
    { name: 'Dunkelgrau', value: '#374151' },
    { name: 'Grau', value: '#808080' },
    { name: 'Silber', value: '#c0c0c0' },
    { name: 'Weiß', value: '#ffffff' },
    { name: 'Braun', value: '#8b4513' },
    { name: 'Dunkelbraun', value: '#5c4033' },
    { name: 'Dunkelgrün', value: '#14532d' },
    { name: 'Marineblau', value: '#1e3a8a' },
    { name: 'Dunkelblau', value: '#00008b' },
    { name: 'Lila', value: '#800080' },
    { name: 'Burgund', value: '#800020' },
  ];
  
  const alignments = [
    { name: 'Links', value: 'left', icon: AlignLeft },
    { name: 'Mittig', value: 'center', icon: AlignCenter },
    { name: 'Rechts', value: 'right', icon: AlignRight },
  ];

  const fontFamilies = [
    { name: 'Klassisch (Playfair)', value: 'memorial' },
    { name: 'Modern (Inter)', value: 'elegant' },
    { name: 'Serif', value: 'serif' },
    { name: 'Sans-serif', value: 'sans' },
    { name: 'Monospace', value: 'mono' },
  ];
  
  function FontSizeSlider({ field, obituary, onUpdate }) {
    const [localValue, setLocalValue] = useState(obituary[`${field}FontSize`] || "10");
  
    useEffect(() => {
      setLocalValue(obituary[`${field}FontSize`] || "10");
    }, [obituary, field]);
  
    // Debounced update (stable across renders)
    const debouncedUpdate = useRef(
      debounce((val: string) => {
        onUpdate({ [`${field}FontSize`]: val });
      }, 200)
    ).current;
  
    return (
      <input
        id="labels-range-input"
        type="range"
        min="10"
        max="50"
        value={localValue}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        onInput={(e) => {
          const val = (e.target as HTMLInputElement).value;
          setLocalValue(val);       
          debouncedUpdate(val);     
        }}
      />
    );
  }
  

  // const StyleControls = ({ field, label }: { field: string; label: string }) => (
  //   <div className="grid grid-cols-4 gap-3 mt-3 p-3 bg-muted/30 rounded-lg">
  //     <div>
  //       <Label className="text-base font-medium mb-1 block">Ausrichtung</Label>
  //       <div className="flex gap-1">
  //         {alignments.map((align) => (
  //           <Button
  //             key={align.value}
  //             variant="outline"
  //             size="sm"
  //             className="h-8 w-8 p-0"
  //             onClick={() => onUpdate({ [`${field}TextAlign`]: align.value })}
  //           >
  //             <align.icon className="w-3 h-3" />
  //           </Button>
  //         ))}
  //       </div>
  //     </div>
  //     <div>
  //       <Label className="text-base font-medium mb-1 block">Farbe</Label>
  //       <Select 
  //         value={obituary[`${field}Color` as keyof ObituaryData] as string || ''}
  //         onValueChange={(value) => onUpdate({ [`${field}Color`]: value })}
  //       >
  //         <SelectTrigger className="h-8">
  //           <SelectValue />
  //         </SelectTrigger>
  //         <SelectContent>
  //           {colors.map((color) => (
  //             <SelectItem key={color.value} value={color.value}>
  //               <div className="flex items-center gap-2">
  //                 <div 
  //                   className="w-3 h-3 rounded border"
  //                   style={{ backgroundColor: color.value || '#6b7280' }}
  //                 />
  //                 {color.name}
  //               </div>
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>
  //     </div>
  //     <div>
  //       <Label className="text-base font-medium mb-1 block">Schrift</Label>
  //       <Select 
  //         value={obituary[`${field}FontFamily` as keyof ObituaryData] as string || 'memorial'}
  //         onValueChange={(value) => onUpdate({ [`${field}FontFamily`]: value })}
  //       >
  //         <SelectTrigger className="h-8">
  //           <SelectValue />
  //         </SelectTrigger>
  //         <SelectContent>
  //           {fontFamilies.map((font) => (
  //             <SelectItem key={font.value} value={font.value}>
  //               {font.name}
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>
  //     </div>
  //     <div>
  //       <Label className="text-base font-medium mb-1 block">Größe</Label>
  //       <div className="relative mb-3">
  //         <FontSizeSlider field={field} obituary={obituary} onUpdate={onUpdate} />

  //         <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">10px</span>
  //         <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">50px</span>
  //       </div>

  //     </div>
  //   </div>
  // );

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      {/* Enhanced Text Validation */}
      <TextValidation obituary={obituary} />
      
      {/* Verstorbene Person */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <User className="w-5 h-5" />
            Verstorbene Person
            {getCompletionBadge('person')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="font-elegant text-lg">Vorname *</Label>
              <Input
                id="firstName"
                value={obituary.deceased.firstName}
                onChange={(e) => onUpdateDeceased({ firstName: e.target.value })}
                placeholder="Maria"
                className="font-elegant"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="font-elegant text-lg">Nachname *</Label>
              <Input
                id="lastName"
                value={obituary.deceased.lastName}
                onChange={(e) => onUpdateDeceased({ lastName: e.target.value })}
                placeholder="Mustermann"
                className="font-elegant"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="additionalName" className="font-elegant text-lg">Zusatzname (optional)</Label>
            <Input
              id="additionalName"
              value={obituary.deceased.additionalName}
              onChange={(e) => onUpdateDeceased({ additionalName: e.target.value })}
              placeholder="geb. Schmidt"
              className="font-elegant"
            />
          </div>

          {/* <StyleControls field="fullname" label="Vollständiger Namensstil" /> */}
        </CardContent>
      </Card>

      {/* Lebensdaten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <CalendarIcon className="w-5 h-5" />
            Lebensdaten
            {getCompletionBadge('dates')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-elegant text-lg">Geburtsdatum</Label>
              <Input
                value={birthDate}
                type='text'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleDateChange(e.target.value, "birthDate")
                }
                placeholder="dd.MM.yyyy"
                className="font-elegant"
              />


              {/* <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={(date) => handleDateChange(date, 'birthDate')}
                    initialFocus
                    disabled={(date) => date > new Date()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover> */}
            </div>

            <div>
              <Label className="font-elegant text-lg">Sterbedatum</Label>
              <Input
                value={deathDate}
                type='text'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleDateChange(e.target.value, "deathDate")
                }
                placeholder="dd.MM.yyyy"
                className="font-elegant"
              />

              {/* <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deathDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deathDate ? format(deathDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deathDate}
                    onSelect={(date) => handleDateChange(date, 'deathDate')}
                    initialFocus
                    disabled={(date) => date > new Date()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover> */}
            </div>
          </div>

          {/* <StyleControls field="date" label="Datumsstil" /> */}
        </CardContent>
      </Card>

      {/* Ort und Datum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <MapPin className="w-5 h-5" />
            Ort und Datum der Anzeige
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={obituary.texts.locationDate}
            onChange={(e) => onUpdateTexts({ locationDate: e.target.value })}
            placeholder="Berlin, im Januar 2024"
            className="font-elegant"
          />

          {/* <StyleControls field="placedate" label="Orts-und Datumsstil" /> */}

        </CardContent>
      </Card>

      {/* Trauerspruch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Quote className="w-5 h-5" />
            Trauerspruch
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(showSuggestions === 'trauerspruch' ? null : 'trauerspruch')}
              className="ml-auto"
            >
              <Lightbulb className="w-4 h-4" />
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
          
          {showSuggestions === 'trauerspruch' && (
            <div className="space-y-2">
              <Label className="text-lg font-medium">Vorschläge:</Label>
              <div className="grid gap-2">
                {suggestions.trauerspruch.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 text-left justify-start"
                    onClick={() => useSuggestion('trauerspruch', suggestion)}
                  >
                    <Plus className="w-3 h-3 mr-2 shrink-0" />
                    <span className="text-xs">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* <StyleControls field="trauerspruch" label="Trauerspruch-Stil" /> */}
        </CardContent>
      </Card>

      {/* Einleitungstext */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Type className="w-5 h-5" />
            Einleitungstext
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(showSuggestions === 'introduction' ? null : 'introduction')}
              className="ml-auto"
            >
              <Lightbulb className="w-4 h-4" />
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
          
          {showSuggestions === 'introduction' && (
            <div className="space-y-2">
              <Label className="text-lg font-medium">Vorschläge:</Label>
              <div className="grid gap-2">
                {suggestions.introduction.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 text-left justify-start"
                    onClick={() => useSuggestion('introduction', suggestion)}
                  >
                    <Plus className="w-3 h-3 mr-2 shrink-0" />
                    <span className="text-xs">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* <StyleControls field="introduction" label="Einleitungstext-Stil" /> */}
        </CardContent>
      </Card>

      {/* Haupttext */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <FileText className="w-5 h-5" />
            Haupttext
            {getCompletionBadge('main')}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(showSuggestions === 'mainText' ? null : 'mainText')}
              className="ml-auto"
            >
              <Lightbulb className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={obituary.texts.mainText}
            onChange={(e) => onUpdateTexts({ mainText: e.target.value })}
            placeholder="Wir werden dich nie vergessen und immer in liebevoller Erinnerung behalten..."
            className="font-elegant"
            rows={4}
          />
          
          {showSuggestions === 'mainText' && (
            <div className="space-y-2">
              <Label className="text-lg font-medium">Vorschläge:</Label>
              <div className="grid gap-2">
                {suggestions.mainText.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 text-left justify-start"
                    onClick={() => useSuggestion('mainText', suggestion)}
                  >
                    <Plus className="w-3 h-3 mr-2 shrink-0" />
                    <span className="text-xs">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* <StyleControls field="mainText" label="Haupttext-Stil" /> */}
        </CardContent>
      </Card>

      {/* Familie & Hinterbliebene - Erweitert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Users className="w-5 h-5" />
            Familie & Hinterbliebene
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={obituary.texts.sideTexts}
            onChange={(e) => onUpdateTexts({ sideTexts: e.target.value })}
            placeholder="In tiefer Trauer:&#10;Die Familie&#10;Anna und Peter Mustermann&#10;Die Enkelkinder"
            className="font-elegant"
            rows={4}
          />
          <p className="text-lg text-muted-foreground">
            Jede Zeile wird separat angezeigt. Verwenden Sie Zeilenumbrüche für die Strukturierung.
          </p>

          {/* <StyleControls field="sideTexts" label="Seitentextstil" /> */}
          
          {/* Häufige Formulierungen für Familie */}
          <div className="space-y-2">
            <Label className="text-lg font-medium">Häufige Formulierungen:</Label>
            <div className="grid gap-1">
              {[
                "In tiefer Trauer:",
                "In stillem Gedenken:",
                "Wir nehmen Abschied:",
                "Seine/Ihre Familie",
                "Alle Angehörigen",
                "Die trauernde Familie"
              ].map((phrase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 text-left justify-start"
                  onClick={() => {
                    const current = obituary.texts.sideTexts;
                    const newText = current ? `${phrase}\n${current}` : phrase;
                    onUpdateTexts({ sideTexts: newText });
                  }}
                >
                  <Plus className="w-3 h-3 mr-2 shrink-0" />
                  <span className="text-lg">{phrase}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zusatztexte - Erweitert mit Vorlagen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Plus className="w-5 h-5" />
            Zusätzliche Informationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="additionalTexts" className="font-elegant text-lg">Zusatztexte</Label>
            <Textarea
              id="additionalTexts"
              value={obituary.texts.additionalTexts}
              onChange={(e) => onUpdateTexts({ additionalTexts: e.target.value })}
              placeholder="Bestattung im engsten Familienkreis.&#10;Anstelle von Blumen bitten wir um Spenden an..."
              className="font-elegant"
              rows={3}
            />

            {/* <StyleControls field="additionalTexts" label="Stil für zusätzliche Texte" /> */}
          </div>
          
          <div>
            <Label htmlFor="lastResidence" className="font-elegant">Letzter Wohnort</Label>
            <Input
              id="lastResidence"
              value={obituary.texts.lastResidence}
              onChange={(e) => onUpdateTexts({ lastResidence: e.target.value })}
              placeholder="Berlin-Mitte"
              className="font-elegant"
            />
          </div>

          {/* Vorlagen für Zusatztexte */}
          <div className="space-y-2">
            <Label className="text-lg font-medium">Häufige Zusatztexte:</Label>
            <div className="grid gap-1">
              {[
                "Die Bestattung findet im engsten Familienkreis statt.",
                "Anstelle von Blumen bitten wir um eine Spende an...",
                "Die Trauerfeier findet am [Datum] um [Uhrzeit] in der [Kirche/Kapelle] statt.",
                "Die Urnenbeisetzung erfolgt zu einem späteren Zeitpunkt.",
                "Von Beileidsbekundungen am Grab bitten wir abzusehen.",
                "Kondolenzbesuche sind nicht erwünscht.",
                "Wir danken für Ihr stilles Gedenken."
              ].map((phrase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 text-left justify-start"
                  onClick={() => {
                    const current = obituary.texts.additionalTexts;
                    const newText = current ? `${current}\n${phrase}` : phrase;
                    onUpdateTexts({ additionalTexts: newText });
                  }}
                >
                  <Plus className="w-3 h-3 mr-2 shrink-0" />
                  <span className="text-lg">{phrase.length > 30 ? `${phrase.substring(0, 27)}...` : phrase}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erweiterte Hilfetext - Collapsible */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-lg">Hilfe & Tipps für bessere Texte</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-4">
              <div>
                <h5 className="font-medium text-lg mb-2">Formulierungshilfen:</h5>
                <div className="text-lg text-muted-foreground space-y-1">
                  <p><strong>Für den Trauerspruch:</strong> Kurze, emotionale Worte der Erinnerung</p>
                  <p><strong>Für die Einleitung:</strong> Wie die Person verstorben ist</p>
                  <p><strong>Für den Haupttext:</strong> Was die Person ausgemacht hat</p>
                  <p><strong>Für Familie:</strong> Wer in Trauer zurückbleibt</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-lg mb-2">Stilregeln:</h5>
                <ul className="text-lg text-muted-foreground space-y-1">
                  <li>• Verwenden Sie respektvolle, würdevolle Sprache</li>
                  <li>• Persönliche Details machen die Anzeige einzigartig</li>
                  <li>• Kurze, klare Sätze sind oft wirkungsvoller</li>
                  <li>• Überprüfen Sie alle Namen und Daten sorgfältig</li>
                  <li>• Die Vorschläge sind nur Inspiration - personalisieren Sie!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};