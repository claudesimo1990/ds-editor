import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Music } from "lucide-react";
import { Canvas as FabricCanvas } from "fabric";

const MemorialShareView: React.FC = () => {
  const { id: idFromParams } = useParams<{ id: string }>();
  const location = useLocation();
  
  // Extraire l'ID de l'URL si useParams ne fonctionne pas
  const getIdFromUrl = () => {
    if (idFromParams) return idFromParams;
    
    // Extraire l'ID depuis le pathname
    const match = location.pathname.match(/\/gedenkseite\/share\/([^\/]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  };
  
  const id = getIdFromUrl();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memorialData, setMemorialData] = useState<any>(null);
  const [memorialStyles, setMemorialStyles] = useState<any>(null);
  const [audioGallery, setAudioGallery] = useState<string[]>([]);
  const [canvasImageUrl, setCanvasImageUrl] = useState<string | null>(null);
  const [canvasState, setCanvasState] = useState<any>(null);

  useEffect(() => {
    console.log('MemorialShareView - ID from params:', idFromParams);
    console.log('MemorialShareView - Location pathname:', location.pathname);
    console.log('MemorialShareView - Extracted ID:', id);
    
    if (!id) {
      console.error('No ID found in URL');
      setError("Keine ID gefunden");
      setLoading(false);
      return;
    }

    const loadMemorial = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer la page commémorative complète
        const { data: memorialPage, error: pageError } = await supabase
          .from("dde_memorial_pages")
          .select("*")
          .eq("id", id)
          .single();

        if (pageError) {
          console.error('Error fetching memorial page:', pageError);
          throw pageError;
        }

        if (!memorialPage) {
          setError("Gedenkseite nicht gefunden");
          setLoading(false);
          return;
        }

        // Mapper les données de la base de données au format de l'éditeur
        const mappedData = {
          deceased: {
            firstName: memorialPage.deceased_first_name || '',
            lastName: memorialPage.deceased_last_name || '',
            birthDate: memorialPage.birth_date || '',
            deathDate: memorialPage.death_date || '',
            birthPlace: memorialPage.birth_place || '',
            deathPlace: memorialPage.death_place || '',
            birthYear: memorialPage.birth_year,
            causeOfDeath: memorialPage.cause_of_death,
            relationshipStatus: memorialPage.relationship_status,
          },
          texts: {
            introduction: memorialPage.memorial_text || '',
            mainText: memorialPage.life_story || '',
            trauerspruch: '',
            sideTexts: '',
            additionalTexts: '',
            lastResidence: '',
            locationDate: memorialPage.location || '',
          },
          symbols: memorialPage.symbols || [],
          photoGallery: memorialPage.photo_gallery || [],
          mainPhotoGallery: memorialPage.main_photo_gallery || [],
          familyMembers: memorialPage.family_members || [],
          lifeEvents: memorialPage.life_events || [],
          mainPhoto: memorialPage.main_photo_url || '',
          heroBackgroundPhoto: memorialPage.hero_background_url || '',
          pageBackground: memorialPage.page_background || '',
          frameStyle: memorialPage.frame_style || 'none',
          frameColor: memorialPage.frame_color || '#000000',
          frameWidth: memorialPage.frame_width || 2,
          creatorFirstname: memorialPage.creator_firstname || '',
          creatorLastname: memorialPage.creator_lastname || '',
          creatorRelationship: memorialPage.creator_relationship || '',
          creatorStreet: memorialPage.creator_street || '',
          creatorCity: memorialPage.creator_city || '',
          creatorZip: memorialPage.creator_zip || '',
        };

        // Extraire les styles depuis style_config
        const styleConfig = memorialPage.style_config || {};
        const { canvasState: extractedCanvasState, videoGallery, audioGallery, ...cleanStyleConfig } = styleConfig;

        // Stocker le canvasState pour générer l'image
        if (extractedCanvasState) {
          setCanvasState(extractedCanvasState);
        }

        // Récupérer les audios depuis style_config
        const audios = audioGallery || [];
        setAudioGallery(Array.isArray(audios) ? audios : []);

        // S'assurer que les styles ont des couleurs par défaut pour les textes
        const processedStyles: any = { ...cleanStyleConfig };
        
        // Liste de tous les champs de texte possibles dans MemorialPreviewEditor
        const textFields = [
          'fullname', 'dates', 'birthPlace', 'deathPlace', 'birthYear', 
          'causeOfDeath', 'relationshipStatus', 'locationDate', 'trauerspruch',
          'introduction', 'mainText', 'sideTexts', 'additionalTexts', 'lastResidence',
          'creatorFirstname', 'creatorLastname', 'creatorRelationship', 
          'creatorStreet', 'creatorCity', 'creatorZip'
        ];
        
        // S'assurer que tous les champs de texte ont une couleur par défaut
        textFields.forEach(field => {
          if (!processedStyles[field]) {
            processedStyles[field] = {};
          }
          if (!processedStyles[field].color || processedStyles[field].color === 'transparent' || processedStyles[field].color === '#ffffff' || processedStyles[field].color === '#fff') {
            processedStyles[field].color = '#111111';
          }
        });

        console.log('Processed styles:', processedStyles);
        console.log('Memorial data:', mappedData);

        setMemorialData(mappedData);
        setMemorialStyles(processedStyles);
        setLoading(false);

      } catch (err: any) {
        console.error('Error loading memorial:', err);
        setError(err.message || "Fehler beim Laden der Gedenkseite");
        setLoading(false);
      }
    };

    loadMemorial();
  }, [id, location.pathname, idFromParams]);

  // Générer l'image du canvas depuis canvasState
  useEffect(() => {
    if (!canvasState) return;

    const generateCanvasImage = async () => {
      try {
        // Créer un canvas temporaire pour Fabric.js (caché)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 1280;
        tempCanvas.height = 720;
        tempCanvas.style.display = 'none';
        tempCanvas.style.position = 'absolute';
        tempCanvas.style.left = '-9999px';
        document.body.appendChild(tempCanvas);

        // Créer l'instance Fabric.js
        const fabricCanvas = new FabricCanvas(tempCanvas, {
          width: 1280,
          height: 720,
          backgroundColor: '#ffffff',
        });

        // Parser le canvasState (peut être une string JSON ou un objet)
        const parsedState = typeof canvasState === 'string' ? JSON.parse(canvasState) : canvasState;

        // Charger l'état dans le canvas
        await new Promise<void>((resolve, reject) => {
          fabricCanvas.loadFromJSON(parsedState, () => {
            fabricCanvas.renderAll();
            resolve();
          }, reject);
        });

        // Attendre un peu pour que les images se chargent
        await new Promise(resolve => setTimeout(resolve, 500));

        // Générer l'image
        const dataURL = fabricCanvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2,
        });

        setCanvasImageUrl(dataURL);

        // Nettoyer
        fabricCanvas.dispose();
        try {
          document.body.removeChild(tempCanvas);
        } catch (e) {
          // Ignorer si déjà supprimé
        }
      } catch (err) {
        console.error('Error generating canvas image:', err);
        setCanvasImageUrl(null);
      }
    };

    generateCanvasImage();
  }, [canvasState]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Gedenkseite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/" className="text-blue-600 hover:underline">Zur Startseite</a>
        </div>
      </div>
    );
  }

  if (!memorialData || !memorialStyles) {
    return null; // Ne rien afficher si les données ne sont pas chargées
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 w-full flex items-center justify-center">
      {/* Container principal */}
      <div className="w-full flex flex-col items-center justify-center py-12 px-4 md:px-8">
        {/* Contenu principal - Structure comme la prévisualisation */}
        <div className="w-full max-w-[1400px] space-y-6 flex flex-col items-center">
          {/* Titre centré */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {memorialData?.deceased?.firstName} {memorialData?.deceased?.lastName}
            </h1>
            {memorialData?.deceased?.birthDate && memorialData?.deceased?.deathDate && (
              <p className="text-lg text-gray-600">
                {new Date(memorialData.deceased.birthDate).toLocaleDateString('de-DE')} - {new Date(memorialData.deceased.deathDate).toLocaleDateString('de-DE')}
              </p>
            )}
          </div>

          {/* Image du canvas */}
          <div className="flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 max-w-full mx-auto">
              {canvasImageUrl ? (
                <img
                  src={canvasImageUrl}
                  alt="Gedenkseite Canvas"
                  className="max-w-full h-auto block mx-auto"
                  style={{ display: 'block', margin: '0 auto' }}
                />
              ) : canvasState ? (
                <div className="flex items-center justify-center p-12 bg-gray-50" style={{ minHeight: '400px' }}>
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Lade Canvas...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-12 bg-gray-50" style={{ minHeight: '400px' }}>
                  <p className="text-gray-500 text-center">Kein Canvas verfügbar</p>
                </div>
              )}
            </div>
          </div>

          {/* Texte de la page commémorative */}
          {(memorialData?.texts?.mainText || memorialData?.texts?.introduction) && (
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 w-full" style={{ maxWidth: '900px' }}>
              <div className="prose prose-lg max-w-none">
                {memorialData?.texts?.introduction && (
                  <p className="text-justify text-gray-700 leading-relaxed mb-4">
                    {memorialData.texts.introduction}
                  </p>
                )}
                {memorialData?.texts?.mainText && (
                  <p className="text-justify text-gray-700 leading-relaxed">
                    {memorialData.texts.mainText}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Audio Timeline si disponible */}
        {audioGallery.length > 0 && (
          <div className="w-full max-w-[1400px] mt-8 flex justify-center">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-full">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Hintergrundmusik</h3>
                    <p className="text-xs text-gray-300">
                      {audioGallery.length} {audioGallery.length === 1 ? 'Audio-Datei' : 'Audio-Dateien'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="space-y-3">
                  {audioGallery.map((audioUrl: string, index: number) => {
                    const fileName = audioUrl.split('/').pop()?.split('?')[0] || `Audio ${index + 1}`;
                    return (
                      <div
                        key={`share-audio-${index}`}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate mb-1">{fileName}</p>
                          <audio 
                            controls 
                            className="w-full h-10"
                            src={audioUrl}
                            preload="metadata"
                          >
                            Ihr Browser unterstützt das Audio-Element nicht.
                          </audio>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemorialShareView;

