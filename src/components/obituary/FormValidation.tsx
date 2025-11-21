import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ObituaryData } from '@/types/obituary';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface FormValidationProps {
  obituary: ObituaryData;
  showDetails?: boolean;
}

export const FormValidation: React.FC<FormValidationProps> = ({ 
  obituary, 
  showDetails = false 
}) => {
  const validations = [
    {
      field: 'firstName',
      label: 'Vorname',
      required: true,
      valid: !!obituary.deceased.firstName,
      message: 'Vorname ist erforderlich'
    },
    {
      field: 'lastName',
      label: 'Nachname',
      required: true,
      valid: !!obituary.deceased.lastName,
      message: 'Nachname ist erforderlich'
    },
    {
      field: 'mainText',
      label: 'Haupttext',
      required: true,
      valid: !!obituary.texts.mainText,
      message: 'Haupttext sollte hinzugefügt werden'
    },
    {
      field: 'dates',
      label: 'Lebensdaten',
      required: false,
      valid: !!(obituary.deceased.birthDate && obituary.deceased.deathDate),
      message: 'Lebensdaten vervollständigen die Anzeige'
    },
    {
      field: 'location',
      label: 'Ort und Datum',
      required: false,
      valid: !!obituary.texts.locationDate,
      message: 'Ort und Datum der Anzeige'
    }
  ];

  const requiredIssues = validations.filter(v => v.required && !v.valid);
  const optionalMissing = validations.filter(v => !v.required && !v.valid);
  const allValid = requiredIssues.length === 0;

  if (!showDetails && allValid) return null;

  return (
    <div className="space-y-3">
      {requiredIssues.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="font-medium mb-2">Erforderliche Felder fehlen:</div>
            <ul className="text-sm space-y-1">
              {requiredIssues.map((issue) => (
                <li key={issue.field} className="flex items-center gap-2">
                  • {issue.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {allValid && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="font-medium">Bereit zum Export!</div>
            <div className="text-sm mt-1">
              Alle erforderlichen Felder sind ausgefüllt. Sie können die Traueranzeige jetzt exportieren.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showDetails && optionalMissing.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="font-medium mb-2">Optionale Verbesserungen:</div>
            <div className="flex flex-wrap gap-1">
              {optionalMissing.map((item) => (
                <Badge key={item.field} variant="outline" className="text-xs">
                  {item.label}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};