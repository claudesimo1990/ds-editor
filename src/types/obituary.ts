type TextAlign = 'left' | 'center' | 'right';
type FontFamily = 'memorial' | 'elegant' | 'serif' | 'sans-serif';

// Familienmitglied Interface
export interface FamilyMember {
  id?: string;
  relationship: 'mutter' | 'vater' | 'tochter' | 'sohn' | 'schwester' | 'bruder' | 'tante' | 'onkel' | 'nichte' | 'neffe' | 'cousine' | 'cousin' | 'grossmutter' | 'grossvater' | 'enkelin' | 'enkel';
  firstName: string;
  lastName?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
}

// Lebensereignis Interface  
export interface LifeEvent {
  category: 'arbeit' | 'ausbildung' | 'beziehung' | 'haus_wohnen' | 'familie' | 'reise' | 'interessen' | 'meilensteine' | 'memoriam';
  title: string;
  description?: string;
  date?: string;
  location?: string;
}

export interface SymbolData {
  id: string;
  image: string;
  width?: number;
  height?: number;
  opacity?: number;
  position?: { x: number; y: number };
}


export interface ObituaryDataBase {
  id?: string;
  category?: string;

  obituaryWidth?: string | number;
  obituaryHeight?: string | number;
  
  // Anzeigentyp und Format
  type: 'todesanzeige' | 'in_memoriam' | 'danksagung' | 'nachruf';
  format: '182x100' | '136x100' | '90x100' | '44x100' | '16x9';
  
  // Design-Optionen
  backgroundImage: string;
  backgroundOpacity?: number;
  symbolImage: string;
  symbolPosition?: string;
  symbolPositionAbsolute?: string;
  symbolSize?: string;
  fontFamily: 'memorial' | 'elegant' | 'serif' | 'sans-serif';
  frameStyle: 'none' | 'simple' | 'double' | 'elegant';
  colorTheme: 'light' | 'dark' | 'warm';
  orientation?: 'portrait' | 'landscape';
  photoUrl?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  customColor?: string;
  userImagePosition?: string;
  userImagePositionAbsolute?: string;
  userImageSize?: string;
  photoOpacity?: number;
  
  // Verstorbene Person (erweitert)
  deceased: {
    firstName: string;
    lastName: string;
    additionalName?: string;
    birthDate: string;
    deathDate: string;
    birthMaidenName?: string;
    gender?: 'weiblich' | 'männlich' | 'divers';
    birthYear?: number;
    birthPlace?: string;
    deathPlace?: string;
    relationshipStatus?: 'single' | 'in_beziehung' | 'verlobt' | 'verheiratet' | 'getrennt' | 'geschieden' | 'verwitwet' | 'kompliziert';
    causeOfDeath?: 'natuerlich' | 'unnatuerlich';
    locationStreet?: string;
    locationZip?: string;
    locationCity?: string;
  };
  
  // Familienmitglieder
  familyMembers?: FamilyMember[];
  
  // Lebensereignisse
  lifeEvents?: LifeEvent[];
  
  // Texte
  texts: {
    locationDate: string;
    trauerspruch: string;
    introduction: string;
    mainText: string;
    sideTexts: string;
    additionalTexts: string;
    lastResidence?: string;
    fullname?: string; 
    date?: string; 
    placedate?: string;
  };

  createdAt?: string;
  updatedAt?: string;

  frameColor?: string;
  frameWidth?: any;
  framePadding?: string;
  scale?: any;

  symbols: SymbolData[];
  photos?: any[];
}

type TextKeys = keyof ObituaryDataBase['texts'] & string;

type PerSectionStyleFields<K extends string> =
  { [P in K as `${P}TextAlign`]?: TextAlign } &
  { [P in K as `${P}FontFamily`]?: FontFamily } &
  { [P in K as `${P}FontSize`]?: string } &
  { [P in K as `${P}Color`]?: string };

export type ObituaryData = ObituaryDataBase & PerSectionStyleFields<TextKeys>;

interface DesignOption {
  name: string;
  thumbnail: string;
  description?: string;
}

export interface BackgroundOption extends DesignOption {
  image: string;
}

export interface SymbolOption extends DesignOption {
  icon: string;
}