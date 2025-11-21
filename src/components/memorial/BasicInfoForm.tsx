import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Calendar, MapPin, Heart } from 'lucide-react';
import { ObituaryData } from '@/types/obituary';

interface BasicInfoFormProps {
  deceased: ObituaryData['deceased'];
  onUpdate: (updates: Partial<ObituaryData['deceased']>) => void;
  category: ObituaryData['category'];
  onUpdateCategory?: (category: string) => void;
  errors?: Record<string, string>;
  creator: any;
  onUpdateCreator: (field: string, value: string) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ deceased, onUpdate, category, onUpdateCategory, errors = {}, creator, onUpdateCreator }) => {
  const categoryOptions = [
    {
      label: 'Sternenkinder',
      value: 'Sternenkinder',
    },
    {
      label: 'Prominente',
      value: 'Prominente',
    },
    {
      label: 'Mordopfer',
      value: 'Mordopfer',
    },
    {
      label: 'Holocaustopfer',
      value: 'Holocaustopfer',
    },
    {
      label: 'Kriegsopfer',
      value: 'Kriegsopfer',
    },
    {
      label: 'Normal/Standard',
      value: 'Normal/Standard',
    },
  ];

  const genderOptions = [
    { value: 'weiblich', label: 'Weiblich' },
    { value: 'männlich', label: 'Männlich' },
    { value: 'divers', label: 'Divers' }
  ];

  const relationshipOptions = [
    { value: 'single', label: 'Single' },
    { value: 'in_beziehung', label: 'In einer Beziehung' },
    { value: 'verlobt', label: 'Verlobt' },
    { value: 'verheiratet', label: 'Verheiratet' },
    { value: 'getrennt', label: 'Getrennt' },
    { value: 'geschieden', label: 'Geschieden' },
    { value: 'verwitwet', label: 'Verwitwet' },
    { value: 'kompliziert', label: 'Es ist kompliziert' }
  ];

  return (
    <div className="space-y-6">
      {/* Creator */}
      <Card className="memorial-border-elegant">
      <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-memorial-heading">
            <User className="w-5 h-5 text-memorial-darkGrey" />
            Ersteller
          </CardTitle>
        </CardHeader>
        <CardContent>
          {creator && (
            <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-memorial-charcoal">
                Vorname *
              </Label>
               <Input
                id="firstName"
                value={creator.firstName}
                onChange={(e) => onUpdateCreator('creatorFirstname', e.target.value)}
                placeholder="Maria"
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.creatorFirstname ? 'border-red-500' : ''}`}
              />
              {errors.creatorFirstname && <p className="text-red-500 text-sm mt-1">{errors.creatorFirstname}</p>}
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-memorial-charcoal">
                Nachname *
              </Label>
               <Input
                id="lastName"
                value={creator.lastName}
                onChange={(e) => onUpdateCreator('creatorLastname', e.target.value)}
                placeholder="Mustermann"
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.creatorLastname ? 'border-red-500' : ''}`}
              />
              {errors.creatorLastname && <p className="text-red-500 text-sm mt-1">{errors.creatorLastname}</p>}
            </div>
          </div>

          <div>
            <Label
              htmlFor="creatorRelationship"
              className="text-sm font-medium text-memorial-charcoal"
            >
              Beziehungsstatus
            </Label>

            <Select
              value={creator.relationship || ''}
              onValueChange={(value: string) => {
                onUpdateCreator('creatorRelationship', value);
              }}
            >
              <SelectTrigger
                id="creatorRelationship"
                className="bg-memorial-snow border-memorial-silver"
              >
                <SelectValue placeholder="Wählen Sie den Beziehungsstatus..." />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Verwandschaftsbeziehung">
                  Verwandschaftsbeziehung
                </SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="strasse" className="text-sm font-medium text-memorial-charcoal">
              Strasse
              </Label>
               <Input
                id="street"
                value={creator.street}
                onChange={(e) => onUpdateCreator('creatorStreet', e.target.value)}
                placeholder=""
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.creatorStreet ? 'border-red-500' : ''}`}
              />
              {errors.creatorStreet && <p className="text-red-500 text-sm mt-1">{errors.creatorStreet}</p>}
            </div>
            <div>
              <Label htmlFor="city" className="text-sm font-medium text-memorial-charcoal">
              Stadt 
              </Label>
               <Input
                id="city"
                value={creator.city}
                onChange={(e) => onUpdateCreator('creatorCity', e.target.value)}
                placeholder=""
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.creatorCity ? 'border-red-500' : ''}`}
              />
              {errors.creatorCity && <p className="text-red-500 text-sm mt-1">{errors.creatorCity}</p>}
            </div>
            <div>
              <Label htmlFor="zip" className="text-sm font-medium text-memorial-charcoal">
              PLZ
              </Label>
               <Input
                id="zip"
                value={creator.zip}
                onChange={(e) => onUpdateCreator('creatorZip', e.target.value)}
                placeholder=""
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.creatorZip ? 'border-red-500' : ''}`}
              />
              {errors.creatorZip && <p className="text-red-500 text-sm mt-1">{errors.creatorZip}</p>}
            </div>
          </div>


            </>
          )}
        </CardContent>

        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-memorial-heading">
            <Heart className="w-5 h-5 text-memorial-darkGrey" />
            Kategorie
          </CardTitle>

          <p>In welcher Kategorie möchtest Du die Gedenkseite erstellen</p>
          </CardHeader>
        <CardContent>
          <Select 
            value={category || ''} 
            onValueChange={(value) => onUpdateCategory(value)}
          >
            <SelectTrigger className="bg-memorial-snow border-memorial-silver">
              <SelectValue placeholder="Wählen Sie die Kategorie..." />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </CardContent>
      </Card>

      {/* Grundinformationen */}
      <Card className="memorial-border-elegant">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-memorial-heading">
            <User className="w-5 h-5 text-memorial-darkGrey" />
            Grundinformationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-memorial-charcoal">
                Vorname *
              </Label>
               <Input
                id="firstName"
                value={deceased.firstName}
                onChange={(e) => onUpdate({ firstName: e.target.value })}
                placeholder="Maria"
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.firstName ? 'border-red-500' : ''}`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-memorial-charcoal">
                Nachname *
              </Label>
               <Input
                id="lastName"
                value={deceased.lastName}
                onChange={(e) => onUpdate({ lastName: e.target.value })}
                placeholder="Mustermann"
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.lastName ? 'border-red-500' : ''}`}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="birthMaidenName" className="text-sm font-medium text-memorial-charcoal">
              Geborene/r
            </Label>
            <Input
              id="birthMaidenName"
              value={deceased.birthMaidenName || ''}
              onChange={(e) => onUpdate({ birthMaidenName: e.target.value })}
              placeholder="Schmidt"
              className="font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-memorial-charcoal">Geschlecht</Label>
              <Select 
                value={deceased.gender || ''} 
                onValueChange={(value) => onUpdate({ gender: value as typeof deceased.gender })}
              >
                <SelectTrigger className="bg-memorial-snow border-memorial-silver">
                  <SelectValue placeholder="Wählen Sie..." />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="birthYear" className="text-sm font-medium text-memorial-charcoal">
                Geburtsjahr
              </Label>
              <Input
                id="birthYear"
                type="number"
                value={deceased.birthYear || ''}
                onChange={(e) => onUpdate({ birthYear: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="1950"
                min="1900"
                max={new Date().getFullYear()}
                className="font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthDate" className="text-sm font-medium text-memorial-charcoal">
                Geburtsdatum *
              </Label>
               <Input
                id="birthDate"
                type="date"
                value={deceased.birthDate}
                onChange={(e) => onUpdate({ birthDate: e.target.value })}
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.birthDate ? 'border-red-500' : ''}`}
              />
              {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
            </div>
            <div>
              <Label htmlFor="deathDate" className="text-sm font-medium text-memorial-charcoal">
                Sterbedatum *
              </Label>
               <Input
                id="deathDate"
                type="date"
                value={deceased.deathDate}
                onChange={(e) => onUpdate({ deathDate: e.target.value })}
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.deathDate ? 'border-red-500' : ''}`}
              />
              {errors.deathDate && <p className="text-red-500 text-sm mt-1">{errors.deathDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="strasse" className="text-sm font-medium text-memorial-charcoal">
              Strasse
              </Label>
               <Input
                id="street"
                value={deceased.locationStreet}
                onChange={(e) => onUpdate({ locationStreet: e.target.value })}
                placeholder=""
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.locationStreet ? 'border-red-500' : ''}`}
              />
              {errors.locationStreet && <p className="text-red-500 text-sm mt-1">{errors.locationStreet}</p>}
            </div>
            <div>
              <Label htmlFor="city" className="text-sm font-medium text-memorial-charcoal">
              Stadt 
              </Label>
               <Input
                id="city"
                value={deceased.locationCity}
                onChange={(e) => onUpdate({ locationCity: e.target.value })}
                placeholder=""
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.locationCity ? 'border-red-500' : ''}`}
              />
              {errors.locationCity && <p className="text-red-500 text-sm mt-1">{errors.locationCity}</p>}
            </div>
            <div>
              <Label htmlFor="zip" className="text-sm font-medium text-memorial-charcoal">
              PLZ
              </Label>
               <Input
                id="zip"
                value={deceased.locationZip}
                onChange={(e) => onUpdate({ locationZip: e.target.value })}
                placeholder=""
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.locationZip ? 'border-red-500' : ''}`}
              />
              {errors.locationZip && <p className="text-red-500 text-sm mt-1">{errors.locationZip}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lebensdaten
      <Card className="memorial-border-elegant">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-memorial-heading">
            <Calendar className="w-5 h-5 text-memorial-darkGrey" />
            Lebensdaten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthDate" className="text-sm font-medium text-memorial-charcoal">
                Geburtsdatum *
              </Label>
               <Input
                id="birthDate"
                type="date"
                value={deceased.birthDate}
                onChange={(e) => onUpdate({ birthDate: e.target.value })}
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.birthDate ? 'border-red-500' : ''}`}
              />
              {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
            </div>
            <div>
              <Label htmlFor="deathDate" className="text-sm font-medium text-memorial-charcoal">
                Sterbedatum *
              </Label>
               <Input
                id="deathDate"
                type="date"
                value={deceased.deathDate}
                onChange={(e) => onUpdate({ deathDate: e.target.value })}
                className={`font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey ${errors.deathDate ? 'border-red-500' : ''}`}
              />
              {errors.deathDate && <p className="text-red-500 text-sm mt-1">{errors.deathDate}</p>}
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Orte */}
      <Card className="memorial-border-elegant">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-memorial-heading">
            <MapPin className="w-5 h-5 text-memorial-darkGrey" />
            Orte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthPlace" className="text-sm font-medium text-memorial-charcoal">
                Geburtsort
              </Label>
              <Input
                id="birthPlace"
                value={deceased.birthPlace || ''}
                onChange={(e) => onUpdate({ birthPlace: e.target.value })}
                placeholder="Berlin"
                className="font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey"
              />
            </div>
            <div>
              <Label htmlFor="deathPlace" className="text-sm font-medium text-memorial-charcoal">
                Sterbeort
              </Label>
              <Input
                id="deathPlace"
                value={deceased.deathPlace || ''}
                onChange={(e) => onUpdate({ deathPlace: e.target.value })}
                placeholder="München"
                className="font-elegant bg-memorial-snow border-memorial-silver focus:ring-memorial-grey"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beziehungsstatus */}
      <Card className="memorial-border-elegant">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-memorial-heading">
            <Heart className="w-5 h-5 text-memorial-darkGrey" />
            Beziehungsstatus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={deceased.relationshipStatus || ''} 
            onValueChange={(value) => onUpdate({ relationshipStatus: value as typeof deceased.relationshipStatus })}
          >
            <SelectTrigger className="bg-memorial-snow border-memorial-silver">
              <SelectValue placeholder="Wählen Sie den Beziehungsstatus..." />
            </SelectTrigger>
            <SelectContent>
              {relationshipOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Todesart */}
      <Card className="memorial-border-elegant">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-memorial-heading">
            <Heart className="w-5 h-5 text-memorial-darkGrey" />
            Todesart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={deceased.causeOfDeath || ''} 
            onValueChange={(value) => onUpdate({ causeOfDeath: value as 'natuerlich' | 'unnatuerlich' })}
          >
            <SelectTrigger className="bg-memorial-snow border-memorial-silver">
              <SelectValue placeholder="Wählen Sie die Todesart..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natuerlich">Natürlicher Tod</SelectItem>
              <SelectItem value="unnatuerlich">Unnatürlicher Tod</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {errors.dateOrder && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          {errors.dateOrder}
        </div>
      )}
    </div>
  );
};