import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ObituaryData } from '@/types/obituary';
import { CheckCircle2, AlertTriangle, Info, Lightbulb } from 'lucide-react';

interface TextValidationProps {
  obituary: ObituaryData;
}

export const TextValidation: React.FC<TextValidationProps> = ({ obituary }) => {
  const validateText = () => {
    const issues = [];
    const warnings = [];
    const tips = [];

    // Kritische Validierungen
    if (!obituary.deceased.firstName && !obituary.deceased.lastName) {
      issues.push("Name der verstorbenen Person fehlt");
    }

    if (!obituary.texts.mainText || obituary.texts.mainText.length < 10) {
      issues.push("Haupttext ist zu kurz oder fehlt");
    }

    // Warnungen
    if (!obituary.texts.trauerspruch) {
      warnings.push("Trauerspruch fehlt - empfohlen für würdevolle Anzeigen");
    }

    if (!obituary.deceased.birthDate || !obituary.deceased.deathDate) {
      warnings.push("Lebensdaten unvollständig - hilfreich für Vollständigkeit");
    }

    if (obituary.texts.mainText && obituary.texts.mainText.length > 300) {
      warnings.push("Haupttext sehr lang - könnte gekürzt werden");
    }

    if (!obituary.texts.sideTexts) {
      warnings.push("Familienmitglieder nicht angegeben");
    }

    // Tipps
    if (!obituary.texts.locationDate) {
      tips.push("Ort und Datum der Anzeige hinzufügen für Vollständigkeit");
    }

    if (!obituary.texts.additionalTexts) {
      tips.push("Informationen zu Bestattung oder Trauerfeier ergänzen");
    }

    // Rechtschreibprüfung (vereinfacht)
    const commonMistakes = [
      { wrong: 'im Alter von', correct: 'im Alter von', text: obituary.texts.mainText },
      { wrong: 'ist gegangen', correct: 'ist von uns gegangen', text: obituary.texts.introduction }
    ];

    return { issues, warnings, tips, commonMistakes };
  };

  const validation = validateText();
  const completionScore = Math.max(0, 100 - (validation.issues.length * 30) - (validation.warnings.length * 10));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
          <CheckCircle2 className="w-5 h-5" />
          Text-Validierung
          <Badge variant={completionScore >= 80 ? "default" : completionScore >= 60 ? "secondary" : "destructive"}>
            {completionScore}% vollständig
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Kritische Probleme */}
        {validation.issues.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium text-lg">Probleme zu beheben:</div>
                {validation.issues.map((issue, index) => (
                  <div key={index} className="text-lg">• {issue}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Warnungen */}
        {validation.warnings.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium text-lg">Empfehlungen:</div>
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="text-lg">• {warning}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tipps */}
        {validation.tips.length > 0 && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium text-lg">Tipps für bessere Anzeigen:</div>
                {validation.tips.map((tip, index) => (
                  <div key={index} className="text-lg">• {tip}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Statistiken */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-lg font-bold text-primary">
              {obituary.texts.mainText ? obituary.texts.mainText.split(' ').length : 0}
            </div>
            <div className="text-lg text-muted-foreground">Wörter im Haupttext</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-lg font-bold text-primary">
              {Object.values(obituary.texts).filter(text => text && text.trim()).length}
            </div>
            <div className="text-lg text-muted-foreground">Ausgefüllte Textfelder</div>
          </div>
        </div>

        {/* Qualitätsbewertung */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-lg font-medium">Qualitätsbewertung</span>
          </div>
          <div className="space-y-1 text-lg text-muted-foreground">
            {completionScore >= 90 && <p>✓ Ausgezeichnet - Professionelle Traueranzeige</p>}
            {completionScore >= 70 && completionScore < 90 && <p>✓ Gut - Alle wichtigen Informationen vorhanden</p>}
            {completionScore >= 50 && completionScore < 70 && <p>⚠ Akzeptabel - Einige Verbesserungen möglich</p>}
            {completionScore < 50 && <p>❌ Unvollständig - Weitere Eingaben erforderlich</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};