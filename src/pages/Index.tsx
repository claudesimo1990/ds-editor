import React, { useState } from 'react';
import { ObituaryData } from '@/types/obituary';
import { ObituaryEditor } from '@/components/obituary/ObituaryEditor';
import memorialBg1 from '@/assets/memorial-bg/IMG-20250806-WA0005.jpg';

const Index = () => {
  const [obituary, setObituary] = useState<ObituaryData>({
    // Anzeigentyp
    type: 'todesanzeige',
    format: '182x100',
    
    // Design-Defaults
    backgroundImage: memorialBg1,
    symbolImage: '',
    fontFamily: 'memorial',
    frameStyle: 'simple',
    colorTheme: 'light',
    orientation: 'portrait',
    
    // Verstorbene Person
    deceased: {
      firstName: '',
      lastName: '',
      additionalName: '',
      birthDate: '',
      deathDate: ''
    },
    
    // Texte
    texts: {
      locationDate: '',
      trauerspruch: '',
      introduction: '',
      mainText: '',
      sideTexts: '',
      additionalTexts: '',
      lastResidence: ''
    }
  });

  const handleObituaryUpdate = (updatedObituary: ObituaryData) => {
    setObituary(updatedObituary);
  };

  return (
    <ObituaryEditor 
      obituary={obituary} 
      onUpdate={handleObituaryUpdate} 
    />
  );
};

export default Index;
