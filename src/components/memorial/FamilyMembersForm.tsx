import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FamilyMember } from '@/types/obituary';

interface FamilyMembersFormProps {
  familyMembers: FamilyMember[];
  onUpdate: (familyMembers: FamilyMember[]) => void;
}

export const FamilyMembersForm: React.FC<FamilyMembersFormProps> = ({ 
  familyMembers, 
  onUpdate 
}) => {
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(new Set());

  const relationshipOptions = [
    { value: 'ehefrau-und-ehemann', label: 'Ehefrau & Ehemann' },
    { value: 'mutter', label: 'Mutter' },
    { value: 'vater', label: 'Vater' },
    { value: 'tochter', label: 'Tochter' },
    { value: 'sohn', label: 'Sohn' },
    { value: 'schwester', label: 'Schwester' },
    { value: 'bruder', label: 'Bruder' },
    { value: 'tante', label: 'Tante' },
    { value: 'onkel', label: 'Onkel' },
    { value: 'nichte', label: 'Nichte' },
    { value: 'neffe', label: 'Neffe' },
    { value: 'cousine', label: 'Cousine' },
    { value: 'cousin', label: 'Cousin' },
    { value: 'grossmutter', label: 'Großmutter' },
    { value: 'grossvater', label: 'Großvater' },
    { value: 'enkelin', label: 'Enkelin' },
    { value: 'enkel', label: 'Enkel' }
  ];

  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      relationship: 'tochter',
      firstName: '',
      lastName: '',
      birthDate: '',
      deathDate: '',
      birthPlace: '',
      deathPlace: ''
    };
    onUpdate([...familyMembers, newMember]);
  };

  const updateFamilyMember = (index: number, updates: Partial<FamilyMember>) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index] = { ...updatedMembers[index], ...updates };
    onUpdate(updatedMembers);
  };

  const removeFamilyMember = (index: number) => {
    const updatedMembers = familyMembers.filter((_, i) => i !== index);
    onUpdate(updatedMembers);
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedMembers(newExpanded);
  };

  return (
    <Card className="memorial-border-elegant">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-memorial-heading">
          <Users className="w-5 h-5 text-memorial-darkGrey" />
          Familienmitglieder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {familyMembers.map((member, index) => (
          <Collapsible 
            key={member.id || index} 
            open={expandedMembers.has(index)}
            onOpenChange={() => toggleExpanded(index)}
          >
            <div className="border border-memorial-silver rounded-lg overflow-hidden bg-memorial-snow">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-memorial-platinum transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-memorial-charcoal">
                      {relationshipOptions.find(opt => opt.value === member.relationship)?.label || 'Verwandter'}
                      {member.firstName && `: ${member.firstName} ${member.lastName || ''}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFamilyMember(index);
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedMembers.has(index) ? (
                      <ChevronUp className="w-4 h-4 text-memorial-grey" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-memorial-grey" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="p-4 border-t border-memorial-silver space-y-4">
                  {/* Beziehung */}
                  <div>
                    <Label className="text-sm font-medium text-memorial-charcoal">Beziehung</Label>
                    <Select 
                      value={member.relationship} 
                      onValueChange={(value) => updateFamilyMember(index, { relationship: value as FamilyMember['relationship'] })}
                    >
                      <SelectTrigger className="bg-white border-memorial-silver">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-memorial-charcoal">Vorname *</Label>
                      <Input
                        value={member.firstName}
                        onChange={(e) => updateFamilyMember(index, { firstName: e.target.value })}
                        placeholder="Anna"
                        className="font-elegant bg-white border-memorial-silver"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-memorial-charcoal">Nachname</Label>
                      <Input
                        value={member.lastName || ''}
                        onChange={(e) => updateFamilyMember(index, { lastName: e.target.value })}
                        placeholder="Mustermann"
                        className="font-elegant bg-white border-memorial-silver"
                      />
                    </div>
                  </div>

                  {/* Lebensdaten */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-memorial-charcoal">Geburtsdatum</Label>
                      <Input
                        type="date"
                        value={member.birthDate || ''}
                        onChange={(e) => updateFamilyMember(index, { birthDate: e.target.value })}
                        className="font-elegant bg-white border-memorial-silver"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-memorial-charcoal">Sterbedatum</Label>
                      <Input
                        type="date"
                        value={member.deathDate || ''}
                        onChange={(e) => updateFamilyMember(index, { deathDate: e.target.value })}
                        className="font-elegant bg-white border-memorial-silver"
                      />
                    </div>
                  </div>

                  {/* Orte */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-memorial-charcoal">Geburtsort</Label>
                      <Input
                        value={member.birthPlace || ''}
                        onChange={(e) => updateFamilyMember(index, { birthPlace: e.target.value })}
                        placeholder="Berlin"
                        className="font-elegant bg-white border-memorial-silver"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-memorial-charcoal">Sterbeort</Label>
                      <Input
                        value={member.deathPlace || ''}
                        onChange={(e) => updateFamilyMember(index, { deathPlace: e.target.value })}
                        placeholder="München"
                        className="font-elegant bg-white border-memorial-silver"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}

        <Button
          onClick={addFamilyMember}
          variant="outline"
          className="w-full border-memorial-silver hover:bg-memorial-platinum"
        >
          <Plus className="w-4 h-4 mr-2" />
          Familienmitglied hinzufügen
        </Button>
      </CardContent>
    </Card>
  );
};