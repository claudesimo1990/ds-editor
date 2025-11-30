import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, Save, User, Users, Calendar, Heart, Shield, 
  Image as ImageIcon,
  Undo, 
  Redo, 
  RotateCcw,
  Eye,
  ArrowLeft,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';
import { BasicInfoForm } from '@/components/memorial/BasicInfoForm';
import { FamilyMembersForm } from '@/components/memorial/FamilyMembersForm';
import { LifeEventsForm } from '@/components/memorial/LifeEventsForm';
import { PhotoUpload } from '@/components/memorial/PhotoUpload';
import { PhotoGallery } from '@/components/memorial/PhotoGallery';
import { PublishingDialog } from '@/components/memorial/PublishingDialog';
import { ObituaryData, FamilyMember, LifeEvent } from '@/types/obituary';
import { HeroBackgroundSelector } from '@/components/memorial/HeroBackgroundSelector';
import { sendApprovalRequiredNotification } from '@/lib/notifications';
import EditorSwitcher from '@/components/layout/EditorSwitcher';

import { SimpleCanvaEditor } from '@/components/memorial/SimpleCanvaEditor';

// --- HISTORY TYPES AND HELPERS ---

interface MemorialState {
  data: any;
  styles: Record<string, any>;
}

function getDefaultMemorialStyles(): Record<string, any> {
    return {};
}

function getDefaultMemorial() {
  return {
    category: '',
    backgroundImage: '',
    symbolImage: '',
    fontFamily: 'memorial',
    frameStyle: 'none',
    colorTheme: 'light',
    orientation: 'portrait',
    deceased: {
      firstName: '',
      lastName: '',
      birthDate: '',
      deathDate: '',
      birthMaidenName: '',
      gender: undefined,
      birthYear: undefined,
      birthPlace: '',
      deathPlace: '',
      relationshipStatus: undefined,
      causeOfDeath: undefined,
      locationStreet: '',
      locationCity: '',
      locationZip: ''
    },
    creatorFirstname: '',
    creatorLastname: '',
    creatorRelationship: '',
    creatorStreet: '',
    creatorCity: '',
    creatorZip: '',
    familyMembers: [],
    lifeEvents: [],
    texts: {
      locationDate: '',
      trauerspruch: '',
      introduction: '',
      mainText: '',
      sideTexts: '',
      additionalTexts: '',
      lastResidence: ''
    },
    mainPhoto: '',
    pageBackground: '',
    photoGallery: [],
    mainPhotoGallery: [],
    customFields: []
  };
}

// ---------------------------------

const MemorialEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit') || id;

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPublishingDialog, setShowPublishingDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [existingMemorialId, setExistingMemorialId] = useState<string | null>(null);
  
  // Références aux fonctions de SimpleCanvaEditor (utiliser useRef pour éviter les mises à jour pendant le rendu)
  const handlePreviewFnRef = useRef<(() => void) | null>(null);
  const handleDownloadFnRef = useRef<(() => void) | null>(null);
  const handleShareFnRef = useRef<(() => void) | null>(null);
  
  // États pour forcer le re-render quand les fonctions sont disponibles
  const [hasPreviewFn, setHasPreviewFn] = useState(false);
  const [hasDownloadFn, setHasDownloadFn] = useState(false);
  const [hasShareFn, setHasShareFn] = useState(false);

  const [memorialStyles, setMemorialStyles] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem(`memorial-draft-${editId || 'new'}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.memorialStyles || getDefaultMemorialStyles();
      } catch {
        return getDefaultMemorialStyles();
      }
    }
    return getDefaultMemorialStyles();
  });

  const [memorialData, setMemorialData] = useState<ObituaryData & {
    mainPhoto?: string;
    heroBackgroundPhoto?: string;
    pageBackground?: string;
    photoGallery?: string[];
    mainPhotoGallery?: string[];
    canvasState?: string | null;
    videoGallery?: string[];
    audioGallery?: string[];
    creatorFirstname?: string;
    creatorLastname?: string;
    creatorRelationship?: string;
    creatorStreet?: string;
    creatorCity?: string;
    creatorZip?: string;
    customFields?: Array<{ id: string; content: string }>;
  }>(() => {
    const saved = localStorage.getItem(`memorial-draft-${editId || 'new'}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.memorialData || parsed || getDefaultMemorial(); 
      } catch {
        return getDefaultMemorial();
      }
    }
    return getDefaultMemorial();
  });
  
  const [history, setHistory] = useState<MemorialState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateMemorialState = useCallback((newMemorialData: any, newMemorialStyles: Record<string, any>) => {
      setMemorialData(newMemorialData);
      setMemorialStyles(newMemorialStyles);
      
      setHistory(prevHistory => {
          let newIndex = prevHistory.slice(0, historyIndex + 1).length;
          const newHistory = prevHistory.slice(0, historyIndex + 1);
          
          if (newHistory.length === 0 || JSON.stringify(newMemorialData) !== JSON.stringify(newHistory[newHistory.length - 1].data) || JSON.stringify(newMemorialStyles) !== JSON.stringify(newHistory[newHistory.length - 1].styles)) {
              newHistory.push({ data: newMemorialData, styles: newMemorialStyles });
              newIndex = newHistory.length - 1;
          } else {
            newIndex = newHistory.length - 1;
          }
          
          const cappedHistory = newHistory.slice(-50); 
          setHistoryIndex(cappedHistory.length - 1);
          return cappedHistory;
      });
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
      setHistoryIndex(prevIndex => {
        const newIndex = prevIndex - 1;
        if (newIndex >= 0) {
            const { data, styles } = history[newIndex];
            setMemorialData(data);
            setMemorialStyles(styles);
            return newIndex;
        }
        return prevIndex;
      });
  }, [history]); 

  const handleRedo = useCallback(() => {
      setHistoryIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        if (newIndex < history.length) {
            const { data, styles } = history[newIndex];
            setMemorialData(data);
            setMemorialStyles(styles);
            return newIndex;
        }
        return prevIndex;
      });
  }, [history]);

  const handleResetToDefault = useCallback(() => {
      const defaultData = getDefaultMemorial();
      const defaultStyles = getDefaultMemorialStyles();
      updateMemorialState(defaultData, defaultStyles); 
      toast({
        title: "Zurückgesetzt",
        description: "Alle Änderungen wurden auf die Standardwerte zurückgesetzt.",
        duration: 3000
      });
  }, [updateMemorialState]);
  
  useEffect(() => {
    if (history.length === 0 && memorialData && memorialStyles) {
        setHistory([{ data: memorialData, styles: memorialStyles }]);
        setHistoryIndex(0);
    }
  }, [memorialData, memorialStyles, history.length]);

  
  const handleDataChange = useCallback((updates: Partial<any>) => {
      setMemorialData(prevData => {
          const newMemorialData = { ...prevData, ...updates } as any;
          updateMemorialState(newMemorialData, memorialStyles);
          return newMemorialData;
      });
  }, [memorialStyles, updateMemorialState]);

  const handleStylesChange = useCallback((styles: Record<string, any>) => {
      setMemorialStyles(styles);
      updateMemorialState(memorialData, styles);
  }, [memorialData, updateMemorialState]);


  useEffect(() => {
    const draft = {
      memorialData,
      memorialStyles
    };
    localStorage.setItem(
      `memorial-draft-${editId || 'new'}`,
      JSON.stringify(draft)
    );
  }, [memorialData, memorialStyles, editId]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (editId && user) loadExistingMemorial(editId);
  }, [editId, user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setShowAuthPrompt(true);
    setUser(user);
  };

  const loadExistingMemorial = async (memorialId: string) => {
    try {
      setIsLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return setShowAuthPrompt(true);

      const { data, error } = await supabase
        .from('dde_memorial_pages')
        .select('*')
        .eq('id', memorialId)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error || !data) throw error;

      setExistingMemorialId(memorialId);
      localStorage.removeItem(`memorial-draft-${editId || 'new'}`);

      const d = data as any;

      const loadedData: any = {
        ...getDefaultMemorial(),
        deceased: {
          firstName: d.deceased_first_name || '',
          lastName: d.deceased_last_name || '',
          birthDate: d.birth_date || '',
          deathDate: d.death_date || '',
          birthMaidenName: d.birth_maiden_name || '',
          gender: d.gender,
          birthYear: d.birth_year,
          birthPlace: d.birth_place || '',
          deathPlace: d.death_place || '',
          relationshipStatus: d.relationship_status,
          causeOfDeath: d.cause_of_death,
          locationStreet: d.deceased_location_street || '',
          locationCity: d.deceased_location_city || '',
          locationZip: d.deceased_location_zip || ''
        },
        creatorFirstname: d.creator_firstname || '',
        creatorLastname: d.creator_last_name || '',
        creatorRelationship: d.creator_relationship || '',
        creatorStreet: d.creator_street || '',
        creatorCity: d.creator_city || '',
        creatorZip: d.creator_zip || '',
        familyMembers: d.family_members || [],
        lifeEvents: d.life_events || [],
        texts: {
          locationDate: d.location || '',
          trauerspruch: '',
          introduction: '',
          mainText: d.memorial_text || '',
          sideTexts: '',
          additionalTexts: '',
          lastResidence: ''
        },
        mainPhoto: d.main_photo_url || '',
        pageBackground: d.page_background || '',
        heroBackgroundPhoto: d.hero_background_url || '',
        photoGallery: d.photo_gallery || [],
        mainPhotoGallery: d.main_photo_gallery || [],
        canvasState: d.style_config?.canvasState || null,
        videoGallery: d.style_config?.videoGallery || [],
        audioGallery: d.style_config?.audioGallery || [],
        symbols: d.symbols || [],
        frameStyle: d.frame_style || 'none',
        frameColor: d.frame_color || '#000000',
        frameWidth: d.frame_width || 2,
        customFields: d.custom_fields || []
      };

      setMemorialData(loadedData);
      // Extraire canvasState, videoGallery et audioGallery du style_config pour ne pas les mettre dans memorialStyles
      const { canvasState, videoGallery, audioGallery, ...cleanStyleConfig } = d.style_config || {};
      setMemorialStyles(cleanStyleConfig || getDefaultMemorialStyles());
      
      setHistory([{ data: loadedData, styles: d.style_config || getDefaultMemorialStyles() }]);
      setHistoryIndex(0);

    } catch (e) {
      console.error('Error loading memorial:', e);
      toast({
        title: 'Fehler',
        description: 'Die Gedenkseite konnte nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthRedirect = () => {
    navigate('/auth');
  };

  const updateCategory = (value: string | null) => {
    handleDataChange({ category: value || '' });
  };

  const updateDeceased = (updates: Partial<ObituaryData['deceased']>) => {
    handleDataChange({
      deceased: { ...memorialData.deceased, ...updates }
    });
  };

  const updateFamilyMembers = (familyMembers: FamilyMember[]) => {
    handleDataChange({ familyMembers });
  };

  const updateLifeEvents = (lifeEvents: LifeEvent[]) => {
    handleDataChange({ lifeEvents });
  };

  const updateMainPhoto = (photoUrl: string | null) => {
    handleDataChange({ mainPhoto: photoUrl || '' });
  };

  // const updateHeroBackgroundPhoto = (photoUrl: string | null) => {
  //   handleDataChange({ heroBackgroundPhoto: photoUrl || '' });
  // };

  const updatePhotoGallery = (photos: string[]) => {
    handleDataChange({ photoGallery: photos });
  };

  const updatePageBackground = (photoUrl: string | null) => {
    handleDataChange({ pageBackground: photoUrl || '' });
  };

  const updateCreator = (field: keyof typeof memorialData, value: string) => {
    handleDataChange({ [field]: value || '' });
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 0) {
      if(!memorialData.category.trim()) {
        errors.category = 'Kategorie ist erforderlich';
      }

      if (!memorialData.deceased.firstName.trim()) {
        errors.firstName = 'Vorname ist erforderlich';
      }
      if (!memorialData.deceased.lastName.trim()) {
        errors.lastName = 'Nachname ist erforderlich';
      }
      if (!memorialData.deceased.birthDate) {
        errors.birthDate = 'Geburtsdatum ist erforderlich';
      }
      if (!memorialData.deceased.deathDate) {
        errors.deathDate = 'Sterbedatum ist erforderlich';
      }
      if (memorialData.deceased.birthDate && memorialData.deceased.deathDate && 
          new Date(memorialData.deceased.birthDate) >= new Date(memorialData.deceased.deathDate)) {
        errors.dateOrder = 'Das Sterbedatum muss nach dem Geburtsdatum liegen';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };


  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) return setShowAuthPrompt(true);
    setIsSaving(true);
    try {
      // Valider les données requises
      if (!memorialData.deceased?.firstName || !memorialData.deceased?.lastName) {
        toast({
          title: 'Fehler',
          description: 'Bitte füllen Sie mindestens den Vor- und Nachnamen der verstorbenen Person aus.',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }

      const memorialPayload = {
        user_id: user.id,
        category: memorialData.category || 'memorial',
        deceased_first_name: memorialData.deceased.firstName,
        deceased_last_name: memorialData.deceased.lastName,
        deceased_location_street: memorialData.deceased.locationStreet,
        deceased_location_city: memorialData.deceased.locationCity,
        deceased_location_zip: memorialData.deceased.locationZip,
        creator_firstname: memorialData.creatorFirstname || '',
        creator_lastname: memorialData.creatorLastname || '',
        creator_relationship: memorialData.creatorRelationship || '',
        creator_street: memorialData.creatorStreet || '',
        creator_city: memorialData.creatorCity || '',
        creator_zip: memorialData.creatorZip || '',
        birth_date: memorialData.deceased.birthDate,
        death_date: memorialData.deceased.deathDate,
        birth_maiden_name: memorialData.deceased.birthMaidenName,
        gender: memorialData.deceased.gender,
        birth_year: memorialData.deceased.birthYear,
        birth_place: memorialData.deceased.birthPlace,
        death_place: memorialData.deceased.deathPlace,
        relationship_status: memorialData.deceased.relationshipStatus,
        cause_of_death: memorialData.deceased.causeOfDeath,
        family_members: memorialData.familyMembers as any,
        life_events: memorialData.lifeEvents as any,
        memorial_text: memorialData.texts.mainText,
        main_photo_url: memorialData.mainPhoto,
        page_background: memorialData.pageBackground,
        hero_background_url: memorialData.heroBackgroundPhoto,
        photo_gallery: memorialData.photoGallery,
        main_photo_gallery: memorialData.mainPhotoGallery,
        style_config: {
          ...memorialStyles,
          canvasState: memorialData.canvasState 
            ? (typeof memorialData.canvasState === 'string' 
                ? memorialData.canvasState 
                : JSON.stringify(memorialData.canvasState))
            : null,
          videoGallery: memorialData.videoGallery || [],
          audioGallery: memorialData.audioGallery || [],
        },
        symbols: memorialData.symbols || [],
        frame_style: memorialData.frameStyle || 'none',
        frame_color: memorialData.frameColor || '#000000',
        frame_width: memorialData.frameWidth || 2,
        custom_fields: memorialData.customFields || [],
        is_published: false,
        is_moderated: false,
        moderation_status: 'pending'
      };

      let result;
      if (existingMemorialId) {
        result = await supabase
          .from('dde_memorial_pages')
          .update(memorialPayload)
          .eq('id', existingMemorialId)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('dde_memorial_pages')
          .insert(memorialPayload)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Supabase error:', result.error);
        console.error('Error details:', {
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code
        });
        throw result.error;
      }

      console.log('Memorial page saved successfully:', result.data);
      console.log('Saved with user_id:', user.id);
      console.log('Page ID:', result.data?.id);

      // Mettre à jour l'ID si c'est une nouvelle page
      if (!existingMemorialId && result.data?.id) {
        setExistingMemorialId(result.data.id);
        // Mettre à jour l'URL sans recharger la page
        const newUrl = `/gedenkseite/erstellen?edit=${result.data.id}`;
        window.history.replaceState({}, '', newUrl);
      }

      toast({ 
        title: 'Entwurf gespeichert',
        description: 'Ihre Gedenkseite wurde erfolgreich gespeichert.'
      });
      localStorage.removeItem(`memorial-draft-${editId || 'new'}`);
      
      // Attendre un peu avant de naviguer pour s'assurer que la sauvegarde est complète
      setTimeout(() => {
        navigate('/user-bereich');
      }, 500);
    } catch (e: any) {
      console.error('Error saving draft:', e);
      console.error('Error object:', JSON.stringify(e, null, 2));
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = 'Der Entwurf konnte nicht gespeichert werden.';
      if (e?.message) {
        errorMessage += ` ${e.message}`;
      } else if (e?.details) {
        errorMessage += ` ${e.details}`;
      } else if (typeof e === 'string') {
        errorMessage += ` ${e}`;
      }
      
      toast({
        title: 'Fehler',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (option: any) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    setIsPublishing(true);
    try {
      const memorialPayload = {
        user_id: user.id,
        category: memorialData.category,
        deceased_first_name: memorialData.deceased.firstName,
        deceased_last_name: memorialData.deceased.lastName,
        deceased_location_street: memorialData.deceased.locationStreet,
        deceased_location_city: memorialData.deceased.locationCity,
        deceased_location_zip: memorialData.deceased.locationZip,
        creator_firstname: memorialData.creatorFirstname || '',
        creator_lastname: memorialData.creatorLastname || '',
        creator_relationship: memorialData.creatorRelationship || '',
        creator_street: memorialData.creatorStreet || '',
        creator_city: memorialData.creatorCity || '',
        creator_zip: memorialData.creatorZip || '',  
        birth_date: memorialData.deceased.birthDate,
        death_date: memorialData.deceased.deathDate,
        birth_maiden_name: memorialData.deceased.birthMaidenName,
        gender: memorialData.deceased.gender,
        birth_year: memorialData.deceased.birthYear,
        birth_place: memorialData.deceased.birthPlace,
        death_place: memorialData.deceased.deathPlace,
        relationship_status: memorialData.deceased.relationshipStatus,
        cause_of_death: memorialData.deceased.causeOfDeath,
        family_members: memorialData.familyMembers as any,
        life_events: memorialData.lifeEvents as any,
        memorial_text: memorialData.texts.mainText,
        main_photo_url: memorialData.mainPhoto,
        page_background: memorialData.pageBackground,
        hero_background_url: memorialData.heroBackgroundPhoto,
        photo_gallery: memorialData.photoGallery,
        main_photo_gallery: memorialData.mainPhotoGallery,
        style_config: {
          ...memorialStyles,
          canvasState: memorialData.canvasState 
            ? (typeof memorialData.canvasState === 'string' 
                ? memorialData.canvasState 
                : JSON.stringify(memorialData.canvasState))
            : null,
          videoGallery: memorialData.videoGallery || [],
          audioGallery: memorialData.audioGallery || [],
        },
        symbols: memorialData.symbols || [],
        frame_style: memorialData.frameStyle || 'none',
        frame_color: memorialData.frameColor || '#000000',
        frame_width: memorialData.frameWidth || 2,
        custom_fields: memorialData.customFields || [],
        publishing_duration_days: option.duration > 0 ? option.duration : null,
        publishing_fee: option.price,
        payment_required: option.price > 0,
        payment_status: option.price > 0 ? 'pending' : 'completed',
        is_published: false,
        is_moderated: false,
        moderation_status: 'pending'
      };

      let memorialResult;
      if (existingMemorialId) {
        memorialResult = await supabase
          .from('dde_memorial_pages')
          .update(memorialPayload)
          .eq('id', existingMemorialId)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        memorialResult = await supabase
          .from('dde_memorial_pages')
          .insert(memorialPayload)
          .select()
          .single();
      }

      if (memorialResult.error) throw memorialResult.error;

      // Mettre à jour l'ID si c'est une nouvelle page
      if (!existingMemorialId && memorialResult.data?.id) {
        setExistingMemorialId(memorialResult.data.id);
        // Mettre à jour l'URL sans recharger la page
        const newUrl = `/gedenkseite/erstellen?edit=${memorialResult.data.id}`;
        window.history.replaceState({}, '', newUrl);
      }

      if (option.price > 0) {
        toast({
          title: "Zahlung erforderlich",
          description: "Die Zahlungsintegration wird implementiert...",
          variant: "destructive",
        });
        setIsPublishing(false);
        setShowPublishingDialog(false);
        return;
      }

      try {
        const deceasedName = `${memorialData.deceased.firstName} ${memorialData.deceased.lastName}`;
        await sendApprovalRequiredNotification(user.id, 'Gedenkseite', deceasedName);
        console.log('Approval required notification sent successfully');
      } catch (notificationError) {
        console.error('Error sending approval required notification:', notificationError);
      }

      toast({
        title: "Zur Prüfung eingereicht",
        description: "Ihre Gedenkseite wurde zur Prüfung eingereicht. Sie erhalten eine E-Mail sobald sie freigegeben wurde.",
      });

      localStorage.removeItem(`memorial-draft-${editId || 'new'}`);
      navigate('/user-bereich');
    } catch (error) {
      console.error('Error publishing memorial:', error);
      toast({
        title: "Fehler",
        description: "Die Gedenkseite konnte nicht eingereicht werden.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
      setShowPublishingDialog(false);
    }
  };

  const [showFormStatus, setShowFormStatus] = useState(true);

  const steps = [
    { key: 'basic', title: 'Grunddaten', icon: User },
    { key: 'family', title: 'Familie', icon: Users },
    { key: 'life', title: 'Leben', icon: Calendar },
    { key: 'photos', title: 'Fotos', icon: ImageIcon },
  ];

  if (showAuthPrompt) {
    return (
      <div className="min-h-screen bg-memorial-gradient flex items-center justify-center p-4">
        <Card className="max-w-md w-full memorial-border-elegant shadow-elegant">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-memorial-platinum rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-memorial-charcoal" />
            </div>
            <CardTitle className="text-xl font-memorial text-memorial-heading">
              Anmeldung erforderlich
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-memorial-grey font-elegant">
              Um eine Gedenkseite zu erstellen, müssen Sie sich zuerst registrieren oder anmelden.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleAuthRedirect}
                className="w-full bg-memorial-charcoal hover:bg-memorial-black text-memorial-white"
              >
                Zur Anmeldung
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="w-full text-memorial-grey hover:text-memorial-charcoal"
              >
                Zurück zur Startseite
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-memorial-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-memorial text-memorial-heading mb-2">
              Gedenkseite erstellen
            </h1>
            <p className="text-memorial-grey font-elegant">
              Erstellen Sie eine würdevolle Gedenkseite für Ihre verstorbene Person
            </p>
          </div>

          <div className="flex items-center justify-between p-3 border border-b-0 dark:border-gray-700 bg-white dark:bg-gray-50 sticky top-0 z-10 shadow-sm rounded-t-lg">
            <h3 className="text-xl font-memorial flex items-center text-memorial-charcoal dark:text-memorial-heading">
              <Eye className="w-5 h-5 mr-2" /> Live Vorschau
            </h3>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleUndo} 
                variant="outline" 
                size="sm"
                disabled={historyIndex === 0}
                title="Rückgängig"
                className="text-memorial-charcoal hover:bg-memorial-platinum"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                onClick={handleRedo} 
                variant="outline" 
                size="sm"
                disabled={historyIndex === history.length - 1}
                title="Wiederherstellen"
                className="text-memorial-charcoal hover:bg-memorial-platinum"
              >
                <Redo className="w-4 h-4" />
              </Button>
              <Button 
                onClick={handleResetToDefault} 
                variant="outline" 
                size="sm"
                title="Auf Standard zurücksetzen"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Zurücksetzen
              </Button>
              <div className="border-l border-gray-300 h-6 mx-2" />
              {handleSaveDraft && (
                <Button
                  onClick={handleSaveDraft}
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  title="Gedenkseite speichern"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Speichern
                </Button>
              )}
              {hasPreviewFn && handlePreviewFnRef.current && (
                <Button
                  onClick={() => handlePreviewFnRef.current?.()}
                  variant="outline"
                  size="sm"
                  className="text-memorial-charcoal hover:bg-memorial-platinum"
                  title="Vorschau"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vorschau
                </Button>
              )}
              {hasDownloadFn && handleDownloadFnRef.current && (
                <Button
                  onClick={() => handleDownloadFnRef.current?.()}
                  variant="outline"
                  size="sm"
                  className="text-memorial-charcoal hover:bg-memorial-platinum"
                  title="Herunterladen"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Downloaden
                </Button>
              )}
              {hasShareFn && handleShareFnRef.current && (
                <Button
                  onClick={() => handleShareFnRef.current?.()}
                  variant="outline"
                  size="sm"
                  className="text-memorial-charcoal hover:bg-memorial-platinum"
                  title="Teilen"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Teilen
                </Button>
              )}
            </div>
          </div>
          
          <div style={{ background: 'white', padding: '0.5rem', border: 'solid 1px rgba(0,0,0,0.1)', borderTop: 'none', borderRadius: '0 0 0.5rem 0.5rem', minHeight: '600px' }}>
            <div className="h-screen">
              <SimpleCanvaEditor
                data={memorialData}
                styles={memorialStyles}
                onDataChange={handleDataChange}
                onStylesChange={handleStylesChange}
                memorialId={existingMemorialId || editId || undefined}
                onSave={handleSaveDraft}
                onPreview={(fn) => {
                  handlePreviewFnRef.current = fn;
                  setHasPreviewFn(true);
                }}
                onDownload={(fn) => {
                  handleDownloadFnRef.current = fn;
                  setHasDownloadFn(true);
                }}
                onShare={(fn) => {
                  handleShareFnRef.current = fn;
                  setHasShareFn(true);
                }}
              />
            </div>
          </div>

          <button
            className="my-4 px-4 py-2 text-sm font-medium text-memorial-charcoal bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-memorial-charcoal/30 transition-all duration-200"
            onClick={() => setShowFormStatus(!showFormStatus)}
          >
            {showFormStatus ? 'Formular ausblenden' : 'Formular anzeigen'}
          </button>

          <hr style={{ margin: '1rem 0rem' }} />

          {showFormStatus && (
            <>
            <div className="w-full mb-8">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex min-w-max md:min-w-0 justify-start md:justify-center bg-white shadow-sm rounded-lg border">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = index === currentStep;

                    return (
                      <button
                        key={step.key}
                        onClick={() => goToStep(index)}
                        className={`
                          relative flex items-center gap-2 px-5 py-4 md:px-8 md:py-5 text-sm md:text-base font-medium
                          transition-all duration-300 ease-in-out whitespace-nowrap
                          ${
                            isActive
                              ? "text-memorial-charcoal bg-white"
                              : "text-memorial-grey bg-white hover:text-memorial-charcoal/70"
                          }
                        `}
                      >
                        <StepIcon className="w-4 h-4 md:w-5 md:h-5" />
                        <span>{step.title}</span>

                        {isActive && (
                          <span className="absolute bottom-0 left-0 w-full h-[3px] bg-memorial-charcoal rounded-t-md"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {Object.keys(validationErrors).length > 0 && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className="text-red-600 text-sm">
                      <p className="font-medium mb-2">Bitte korrigieren Sie folgende Fehler:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {Object.values(validationErrors).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              {currentStep === 0 && (
                <BasicInfoForm 
                  deceased={memorialData.deceased}
                  onUpdate={updateDeceased}
                  category={memorialData.category}
                  onUpdateCategory={updateCategory}
                  errors={validationErrors}
                  creator={
                    {
                      firstName: memorialData.creatorFirstname,
                      lastName: memorialData.creatorLastname,
                      relationship: memorialData.creatorRelationship,
                      street: memorialData.creatorStreet,
                      city: memorialData.creatorCity,
                      zip: memorialData.creatorZip
                    }
                  }
                  onUpdateCreator={updateCreator}
                />
              )}

              {currentStep === 1 && (
                <FamilyMembersForm 
                  familyMembers={memorialData.familyMembers || []}
                  onUpdate={updateFamilyMembers}
                />
              )}

              {currentStep === 2 && (
                <LifeEventsForm 
                  lifeEvents={memorialData.lifeEvents || []}
                  onUpdate={updateLifeEvents}
                />
              )}

              {currentStep === 3 && user && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-memorial text-memorial-heading">Hauptfoto</h3>
                    <p className="text-sm text-memorial-grey font-elegant">
                      Ein Portrait-Foto der verstorbenen Person (wird links unten im Hero-Bereich angezeigt)
                    </p>
                    <PhotoUpload
                      currentPhoto={memorialData.mainPhoto}
                      onPhotoChange={updateMainPhoto}
                      userId={user.id}
                      label="Hauptfoto"
                    />
                  </div>

                  <hr className="border-memorial-platinum" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-memorial text-memorial-heading">Fotogalerie (Formular)</h3>
                    <p className="text-sm text-memorial-grey font-elegant">
                      Diese Fotos sind nur für das Formular - nicht für die Live-Vorschau
                    </p>
                    <PhotoGallery
                      photos={memorialData.photoGallery || []}
                      onPhotosChange={(photos) => updatePhotoGallery(photos)}
                      userId={user.id}
                      type='photoGallery'
                    />
                  </div>

                  <hr className="border-memorial-platinum" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-memorial text-memorial-heading">Seitenhintergrund</h3>
                    <p className="text-sm text-memorial-grey font-elegant">
                    Wählen Sie den Hintergrund für Ihre Gedenkseite
                    </p>
                    <PhotoUpload
                      currentPhoto={memorialData.pageBackground}
                      onPhotoChange={updatePageBackground}
                      userId={user.id}
                      label="Seite"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={currentStep === 0 ? () => navigate('/user-bereich') : prevStep}
                className="border-memorial-silver hover:bg-memorial-platinum"
              >
                {currentStep === 0 ? 'Abbrechen' : 'Zurück'}
              </Button>
              
              <div className="flex gap-2">
                {currentStep === steps.length - 1 && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={isSaving || isPublishing}
                      className="border-memorial-silver hover:bg-memorial-platinum"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Speichern...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Entwurf speichern
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={() => setShowPublishingDialog(true)}
                      disabled={isSaving || isPublishing || Object.keys(validationErrors).length > 0}
                      className="bg-memorial-charcoal hover:bg-memorial-black text-memorial-white"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Veröffentlichen
                    </Button>
                  </>
                )}
                
                {currentStep < steps.length - 1 && (
                  <Button 
                    onClick={nextStep}
                    disabled={isSaving || isPublishing}
                    className="bg-memorial-charcoal hover:bg-memorial-black text-memorial-white"
                  >
                    Weiter
                  </Button>
                )}
              </div>
            </div>
            </>
          )}

          <PublishingDialog
            open={showPublishingDialog}
            onOpenChange={setShowPublishingDialog}
            onPublish={handlePublish}
            isLoading={isPublishing}
          />

        </div>
      </div>
    </div>
  );
};

export default MemorialEditor;