import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Heart, Flame, Share2, Calendar, MapPin, Users, MessageCircle, Edit3, Camera, Save, X, Eye, Music } from "lucide-react";
import { MemorialCandleModal } from "@/components/memorial/MemorialCandleModal";
import WebGLCandle from "@/components/memorial/WebGLCandle";
import MemorialPreviewEditor from "@/components/memorial/MemorialPreviewEditor";

interface MemorialPage {
  id: string;
  deceased_first_name: string;
  deceased_last_name: string;
  birth_date: string;
  death_date: string;
  birth_place?: string;
  death_place?: string;
  birth_maiden_name?: string;
  gender?: string;
  relationship_status?: string;
  location: string;
  main_photo_url: string;
  page_background: string;
  memorial_text: string;
  life_story: string;
  family_members?: any[] | null;
  life_events?: any | null;
  visitor_count: number;
  user_id: string;
  photo_gallery?: string[] | null;
  hero_background_url?: string;
  creator_firstname?: string;
  creator_lastname?: string;
  creator_relationship?: string;
  creator_street?: string;
  creator_city?: string;
  creator_zip?: string;
  style_config?: any;
  main_photo_gallery?: any[] | null;
}

interface MemorialPhoto {
  id: string;
  photo_url: string;
  caption: string;
  sort_order: number;
}

interface Condolence {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
}

interface Candle {
  id: string;
  lit_by_name: string;
  message: string;
  lit_at: string;
  expires_at: string;
}

const MemorialPageView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [memorialPage, setMemorialPage] = useState<MemorialPage | null>(null);
  const [photos, setPhotos] = useState<MemorialPhoto[]>([]);
  const [condolences, setCondolences] = useState<Condolence[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCondolenceForm, setShowCondolenceForm] = useState(false);
  const [showCandleModal, setShowCandleModal] = useState(false);
  const [condolenceName, setCondolenceName] = useState("");
  const [condolenceMessage, setCondolenceMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    deceased_first_name: "",
    deceased_last_name: "",
    birth_date: "",
    death_date: "",
    location: "",
    memorial_text: "",
    life_story: ""
  });

  useEffect(() => {
    checkCurrentUser();
    if (id) {
      fetchMemorialPage();
      incrementVisitorCount();
    }
  }, [id]);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  useEffect(() => {
    if (memorialPage && currentUser) {
      setIsOwner(memorialPage.user_id === currentUser.id);
      setEditForm({
        deceased_first_name: memorialPage.deceased_first_name,
        deceased_last_name: memorialPage.deceased_last_name,
        birth_date: memorialPage.birth_date,
        death_date: memorialPage.death_date,
        location: memorialPage.location || "",
        memorial_text: memorialPage.memorial_text || "",
        life_story: memorialPage.life_story || ""
      });
    }
  }, [memorialPage, currentUser]);

  const fetchMemorialPage = async () => {
    try {
      // Fetch memorial page
      const { data: pageData, error: pageError } = await supabase
        .from("dde_memorial_pages")
        .select("*")
        .eq("id", id)
        .single();

        console.log(pageData)

      if (pageError) throw pageError;
      setMemorialPage({
        ...pageData,
        family_members: Array.isArray(pageData.family_members) 
          ? pageData.family_members 
          : pageData.family_members 
            ? JSON.parse(pageData.family_members as string) 
            : [],
        life_events: pageData.life_events 
          ? typeof pageData.life_events === 'string' 
            ? JSON.parse(pageData.life_events)
            : pageData.life_events
          : {},
        photo_gallery: Array.isArray(pageData.photo_gallery) 
          ? pageData.photo_gallery 
          : pageData.photo_gallery 
            ? JSON.parse(pageData.photo_gallery as string) 
            : [],
            main_photo_gallery: Array.isArray(pageData.main_photo_gallery) 
          ? pageData.main_photo_gallery 
          : pageData.main_photo_gallery 
            ? JSON.parse(pageData.main_photo_gallery as string) 
            : []
      } as MemorialPage);

      // Fetch photos
      const { data: photosData, error: photosError } = await supabase
        .from("dde_memorial_photos")
        .select("*")
        .eq("memorial_page_id", id)
        .eq("is_moderated", true)
        .order("sort_order");

      if (photosError) throw photosError;
      setPhotos(photosData || []);

      // Fetch condolences
      const { data: condolencesData, error: condolencesError } = await supabase
        .from("dde_condolences")
        .select("*")
        .eq("memorial_page_id", id)
        .eq("is_public", true)
        .eq("is_moderated", true)
        .order("created_at", { ascending: false });

      if (condolencesError) throw condolencesError;
      setCondolences(condolencesData || []);

      // Fetch candles
      const { data: candlesData, error: candlesError } = await supabase
        .from("dde_candles")
        .select("*")
        .eq("memorial_page_id", id)
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString())
        .order("lit_at", { ascending: false });

      if (candlesError) throw candlesError;
      setCandles(candlesData || []);

    } catch (error) {
      console.error("Error fetching memorial page:", error);
      toast.error("Fehler beim Laden der Gedenkseite");
    } finally {
      setLoading(false);
    }
  };

  const incrementVisitorCount = async () => {
    try {
      const visitorIp = "anonymous"; // In production, get real IP
      
      // Insert visit record
      await supabase.from('dde_memorial_visits').insert({
        memorial_page_id: id,
        visitor_ip: visitorIp
      });
      
      // Update visitor count - first get current count
      if (memorialPage) {
        await supabase.from('dde_memorial_pages')
          .update({ visitor_count: (memorialPage.visitor_count || 0) + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error("Error incrementing visitor count:", error);
    }
  };

  const handleCondolenceSubmit = async () => {
    if (!condolenceName.trim() || !condolenceMessage.trim()) {
      toast.error("Bitte füllen Sie alle Felder aus");
      return;
    }

    try {
      const { error } = await supabase
        .from("dde_condolences")
        .insert({
          memorial_page_id: id,
          author_name: condolenceName,
          message: condolenceMessage
        });

      if (error) throw error;

      toast.success("Ihre Anteilnahme wurde eingereicht und wird nach Prüfung veröffentlicht");
      setCondolenceName("");
      setCondolenceMessage("");
      setShowCondolenceForm(false);
    } catch (error) {
      console.error("Error submitting condolence:", error);
      toast.error("Fehler beim Senden der Anteilnahme");
    }
  };

  const handleCandleLit = () => {
    setShowCandleModal(false);
    fetchMemorialPage(); // Refresh candles
    toast.success("Kerze wurde angezündet");
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${memorialPage?.user_id}/memorial_photos/${Date.now()}-${Math.random()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('dde_memorial_photos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('dde_memorial_photos')
          .getPublicUrl(data.path);

        // Add photo to database
        const { data: photoData, error: insertError } = await supabase
          .from('dde_memorial_photos')
          .insert({
            memorial_page_id: id,
            photo_url: publicUrl,
            caption: '',
            sort_order: photos.length
          })
          .select()
          .single();

        if (insertError) throw insertError;

        return photoData;
      });

      const newPhotos = await Promise.all(uploadPromises);
      setPhotos([...photos, ...newPhotos]);
      toast.success(`${newPhotos.length} Foto(s) hochgeladen`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error("Fehler beim Hochladen der Fotos");
    }
  };

  const handleRemovePhoto = async (photoUrl: string, index: number) => {
    try {
      // Remove from database
      await supabase
        .from('dde_memorial_photos')
        .delete()
        .eq('memorial_page_id', id)
        .eq('photo_url', photoUrl);

      // Remove from storage
      const url = new URL(photoUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts.slice(-2).join('/');
      
      await supabase.storage
        .from('dde_memorial_photos')
        .remove([fileName]);

      const newPhotos = photos.filter((_, i) => i !== index);
      setPhotos(newPhotos);
      toast.success("Foto entfernt");
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error("Fehler beim Entfernen des Fotos");
    }
  };

  const shareMemorialPage = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Gedenkseite für ${memorialPage?.deceased_first_name} ${memorialPage?.deceased_last_name}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link wurde in die Zwischenablage kopiert");
    }
  };

  const startEditing = (section: string) => {
    setEditingSection(section);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    if (memorialPage) {
      setEditForm({
        deceased_first_name: memorialPage.deceased_first_name,
        deceased_last_name: memorialPage.deceased_last_name,
        birth_date: memorialPage.birth_date,
        death_date: memorialPage.death_date,
        location: memorialPage.location || "",
        memorial_text: memorialPage.memorial_text || "",
        life_story: memorialPage.life_story || ""
      });
    }
  };

  const saveSection = async (section: string) => {
    try {
      const updateData: any = {};
      
      if (section === 'basic') {
        updateData.deceased_first_name = editForm.deceased_first_name;
        updateData.deceased_last_name = editForm.deceased_last_name;
        updateData.birth_date = editForm.birth_date;
        updateData.death_date = editForm.death_date;
        updateData.location = editForm.location;
      } else if (section === 'memorial_text') {
        updateData.memorial_text = editForm.memorial_text;
      } else if (section === 'life_story') {
        updateData.life_story = editForm.life_story;
      }

      const { error } = await supabase
        .from("dde_memorial_pages")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setMemorialPage(prev => prev ? { ...prev, ...updateData } : null);
      setEditingSection(null);
      toast.success("Änderungen gespeichert");
    } catch (error) {
      console.error("Error updating memorial page:", error);
      toast.error("Fehler beim Speichern");
    }
  };

  function mapDbMemorialToEditorFormat(dbRow: any) {
    if (!dbRow) return {};
  
    return {
      deceased: {
        firstName: dbRow.deceased_first_name || "",
        lastName: dbRow.deceased_last_name || "",
        birthDate: dbRow.birth_date || "",
        deathDate: dbRow.death_date || "",
        birthPlace: dbRow.birth_place || "",
        deathPlace: dbRow.death_place || "",
        birthYear: dbRow.birth_year || "",
        causeOfDeath: dbRow.cause_of_death || "",
        relationshipStatus: dbRow.relationship_status || "",
      },
      texts: {
        introduction: dbRow.memorial_text || "",
        mainText: dbRow.life_story || "",
        trauerspruch: "",
        sideTexts: "",
        additionalTexts: "",
        lastResidence: "",
        locationDate: "",
      },
      symbols: dbRow.symbols || [],
      photoGallery: dbRow.photo_gallery || [],
      mainPhotoGallery: dbRow.main_photo_gallery || [],
      familyMembers: dbRow.family_members || [],
      lifeEvents: dbRow.life_events || [],
      mainPhoto: dbRow.main_photo_url || "",
      heroBackgroundPhoto: dbRow.hero_background_url || "",
      frameStyle: dbRow.frame_style || "none",
      frameColor: dbRow.frame_color || "#000000",
      frameWidth: dbRow.frame_width || 2,
  
      creatorFirstname: dbRow.creator_firstname || "",
      creatorLastname: dbRow.creator_lastname || "",
      creatorRelationship: dbRow.creator_relationship || "",
      creatorStreet: dbRow.creator_street || "",
      creatorCity: dbRow.creator_city || "",
      creatorZip: dbRow.creator_zip || "",
    };
  }
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Lade Gedenkseite...</p>
        </div>
      </div>
    );
  }

  if (!memorialPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Gedenkseite nicht gefunden</h1>
          <p className="text-muted-foreground">Diese Gedenkseite existiert nicht oder ist nicht veröffentlicht.</p>
        </div>
      </div>
    );
  }

  // Combine photos for "Leben in Bildern"
  const allPhotos = [
    ...photos.map(p => ({ url: p.photo_url, caption: p.caption, id: p.id })),
    ...(memorialPage.photo_gallery || []).map((url, idx) => ({ 
      url, 
      caption: '', 
      id: `gallery-${idx}` 
    }))
  ];

  return (
    <div
      className={`min-h-screen ${memorialPage?.page_background ? '' : 'bg-memorial-gradient'}`}
      style={
        memorialPage?.page_background
          ? {
              backgroundImage: `url(${memorialPage.page_background})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : {}
      }
    >
      {/* Decorative corner ornaments */}
      <div className="memorial-page-ornament top-left"></div>
      <div className="memorial-page-ornament top-right"></div>
      <div className="memorial-page-ornament bottom-left"></div>
      <div className="memorial-page-ornament bottom-right"></div>

      {/* Full WebGL Altar Scene */}
      {memorialPage.style_config ? (
        <>
        <div className="mx-auto max-w-[1300px]">
        <MemorialPreviewEditor
            data={mapDbMemorialToEditorFormat(memorialPage)} 
            styles={memorialPage.style_config}
            onDataChange={() => {}}
            onStylesChange={() => {}}
            isEditable={false}
        />
        </div>
        
        {/* Audio Timeline - Unterhalb des Editors für öffentliche Ansicht */}
        {memorialPage.style_config?.audioGallery && Array.isArray(memorialPage.style_config.audioGallery) && memorialPage.style_config.audioGallery.length > 0 && (
          <div className="mx-auto max-w-[1300px] mt-4 bg-[#1a1a1a] border-t border-gray-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Music className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Audio-Timeline</h3>
              <span className="text-xs text-gray-500">
                ({memorialPage.style_config.audioGallery.length} {memorialPage.style_config.audioGallery.length === 1 ? 'Datei' : 'Dateien'})
              </span>
            </div>
            <div className="space-y-2">
              {memorialPage.style_config.audioGallery.map((audio: string | any, index: number) => {
                const src = typeof audio === 'string' ? audio : audio.src || audio;
                const fileName = typeof audio === 'string' 
                  ? audio.split('/').pop()?.split('?')[0] || `Audio ${index + 1}`
                  : audio.name || `Audio ${index + 1}`;
                return (
                  <div
                    key={`public-audio-${index}`}
                    className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center flex-shrink-0">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-300 truncate">{fileName}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <audio 
                        controls 
                        className="w-full h-8"
                        src={src}
                        preload="metadata"
                        onError={(e) => {
                          console.error('Error loading audio:', src, e);
                        }}
                      >
                        Ihr Browser unterstützt das Audio-Element nicht.
                      </audio>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </>
      ) : (
        <>
        <div className="relative min-h-[600px] h-[600px] overflow-hidden">
          <div className="absolute inset-0">
              <WebGLCandle 
                portraitUrl={memorialPage.main_photo_url}
                candleCount={Math.max(candles.length, 7)}
                className="w-full h-full"
              />
          </div>
          
          {/* Overlay content positioned over WebGL */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Birth date - left */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white bg-black/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-lg font-elegant mb-2">Geboren</div>
              <div className="text-2xl font-memorial">
                {new Date(memorialPage.birth_date).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric'
                })}
              </div>
            </div>
            
            {/* Death date - right */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white bg-black/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-lg font-elegant mb-2">Gestorben</div>
              <div className="text-2xl font-memorial">
                {new Date(memorialPage.death_date).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </div>
            </div>
            
            {/* Name at bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <h1 className="text-5xl font-memorial font-bold text-white drop-shadow-2xl tracking-wide mb-4">
                {memorialPage.deceased_first_name} {memorialPage.deceased_last_name}
              </h1>
              
              {/* Location */}
              {memorialPage.location && (
                <p className="text-lg font-elegant text-stone-300 drop-shadow-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {memorialPage.location}
                </p>
              )}
            </div>
            
            {/* Visitor count badge */}
            <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
              <p className="text-white text-sm flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {memorialPage.visitor_count || 0} Besucher
              </p>
            </div>
          </div>
        </div>
        </>
      )}

      <div className="mx-auto max-w-[1350px] px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Enhanced Actions Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="memorial-border-elegant shadow-elegant hover-memorial">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-memorial text-lg text-center mb-4">Gedenkaktionen</h3>
                
                <Button 
                  onClick={() => setShowCandleModal(true)}
                  className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-md transition-all duration-300"
                  size="lg"
                >
                  <Flame className="h-5 w-5 mr-2" />
                  Kerze anzünden
                </Button>
                
                <Button 
                  onClick={() => setShowCondolenceForm(true)}
                  className="w-full"
                  variant="outline"
                  size="lg"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Kondolenz hinterlassen
                </Button>
                
                <div className="memorial-section-divider">
                  <span className="px-3 text-memorial-grey text-xs">Teilen</span>
                </div>
                
                <Button 
                  onClick={shareMemorialPage}
                  className="w-full"
                  variant="outline"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Gedenkseite teilen
                </Button>
              </CardContent>
            </Card>

            {/* Stats Display */}
            <Card className="memorial-border-elegant shadow-elegant">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-memorial-grey">Besucher</span>
                    <Badge variant="secondary">{memorialPage.visitor_count}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-memorial-grey">Kerzen</span>
                    <Badge variant="secondary">{candles.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-memorial-grey">Kondolenzen</span>
                    <Badge variant="secondary">{condolences.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candles Display */}
            {candles.length > 0 && (
              <Card className="memorial-border-elegant shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="font-memorial text-lg text-center mb-4">Brennende Kerzen</h3>
                  <div className="grid grid-cols-5 gap-2 justify-center">
                    {candles.slice(0, 10).map((_, i) => (
                      <Flame key={i} className="h-6 w-6 text-orange-400 animate-pulse mx-auto" />
                    ))}
                  </div>
                  {candles.length > 10 && (
                    <p className="text-center text-sm text-memorial-grey mt-3">
                      und {candles.length - 10} weitere...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Main Content */}
          <div className="lg:col-span-6 space-y-8">
            {/* Memorial Quote/Text - Elegant */}
            {(memorialPage.memorial_text || isOwner) && (
              <Card className="relative group memorial-border-elegant shadow-elegant hover-memorial">
                <CardContent className="p-8">
                  {isOwner && editingSection !== 'memorial_text' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={() => startEditing('memorial_text')}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {editingSection === 'memorial_text' ? (
                    <div className="space-y-6">
                      <Textarea
                        placeholder="Trauerspruch oder persönliche Worte..."
                        value={editForm.memorial_text}
                        onChange={(e) => setEditForm(prev => ({ ...prev, memorial_text: e.target.value }))}
                        rows={5}
                        className="text-center italic font-elegant resize-none"
                      />
                      <div className="memorial-section-divider">
                        <span className="px-4 text-memorial-grey text-sm">Bearbeitung</span>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={() => saveSection('memorial_text')} className="transition-gentle">
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                        <Button variant="outline" onClick={cancelEditing} className="transition-gentle">
                          <X className="h-4 w-4 mr-2" />
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="memorial-ornament-flourish w-24 h-8 mx-auto mb-6"></div>
                      <p className="text-xl font-elegant italic text-memorial-grey leading-relaxed text-memorial-elegant">
                        {memorialPage.memorial_text || (isOwner ? "Klicken Sie hier, um einen Trauerspruch hinzuzufügen..." : "")}
                      </p>
                      <div className="memorial-ornament-flourish w-24 h-8 mx-auto mt-6 transform rotate-180"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Leben in Bildern */}
            <Card className="memorial-border-elegant shadow-elegant">
              <CardContent className="p-8">
                <h2 className="text-2xl font-memorial text-memorial-heading mb-6 text-center">
                  Leben in Bildern
                </h2>
                
                {allPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {allPhotos.map((photo, index) => (
                      <div key={photo.id} className="relative group aspect-square overflow-hidden rounded-lg shadow-elegant">
                        <img
                          src={photo.url}
                          alt={photo.caption || `Foto ${index + 1}`}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement?.classList.add('hidden');
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="text-white text-xs font-elegant leading-tight">{photo.caption}</p>
                          </div>
                        )}
                        {isOwner && (
                          <button
                            onClick={() => handleRemovePhoto(photo.url, index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-memorial-snow rounded-lg">
                    <Camera className="h-12 w-12 text-memorial-grey mx-auto mb-4" />
                    <p className="text-memorial-grey font-elegant">Noch keine Fotos hinzugefügt</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information Section */}
            {(memorialPage.birth_place || memorialPage.death_place || memorialPage.birth_maiden_name || memorialPage.gender || memorialPage.relationship_status) && (
              <Card className="memorial-border-elegant shadow-elegant hover-memorial">
                <CardContent className="p-8">
                  <h3 className="text-xl font-memorial mb-6 text-center">
                    <span className="memorial-text-ornament">Weitere Informationen</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {memorialPage.birth_place && (
                      <div className="flex items-center gap-3 p-3 bg-memorial-snow rounded-lg">
                        <div className="memorial-ornament-small w-5 h-5"></div>
                        <span className="font-medium text-memorial-dark-grey">Geburtsort:</span>
                        <span className="font-elegant">{memorialPage.birth_place}</span>
                      </div>
                    )}
                    {memorialPage.death_place && (
                      <div className="flex items-center gap-3 p-3 bg-memorial-snow rounded-lg">
                        <div className="memorial-ornament-small w-5 h-5"></div>
                        <span className="font-medium text-memorial-dark-grey">Sterbeort:</span>
                        <span className="font-elegant">{memorialPage.death_place}</span>
                      </div>
                    )}
                    {memorialPage.birth_maiden_name && (
                      <div className="flex items-center gap-3 p-3 bg-memorial-snow rounded-lg">
                        <div className="memorial-ornament-small w-5 h-5"></div>
                        <span className="font-medium text-memorial-dark-grey">Geburtsname:</span>
                        <span className="font-elegant">{memorialPage.birth_maiden_name}</span>
                      </div>
                    )}
                    {memorialPage.relationship_status && (
                      <div className="flex items-center gap-3 p-3 bg-memorial-snow rounded-lg">
                        <Heart className="h-5 w-5 text-memorial-grey" />
                        <span className="font-medium text-memorial-dark-grey">Familienstand:</span>
                        <span className="font-elegant capitalize">{memorialPage.relationship_status}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Condolences */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Kondolenzen</h3>
                {condolences.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Noch keine Kondolenzen vorhanden
                  </p>
                ) : (
                  <div className="space-y-4">
                    {condolences.map((condolence) => (
                      <div key={condolence.id} className="border-l-4 border-primary/20 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="h-4 w-4 text-orange-400" />
                          <span className="font-medium text-sm">{condolence.author_name}</span>
                          <span className="text-xs text-muted-foreground">
                            eingetragen am {new Date(condolence.created_at).toLocaleDateString("de-DE")}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{condolence.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Condolence form */}
            {showCondolenceForm && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Kondolenz hinterlassen</h3>
                  <div className="space-y-4">
                    <Input
                      placeholder="Ihr Name"
                      value={condolenceName}
                      onChange={(e) => setCondolenceName(e.target.value)}
                    />
                    <Textarea
                      placeholder="Ihre Nachricht..."
                      value={condolenceMessage}
                      onChange={(e) => setCondolenceMessage(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCondolenceSubmit}>
                        Senden
                      </Button>
                      <Button variant="outline" onClick={() => setShowCondolenceForm(false)}>
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3">
            {/* Creator */}
            <Card className="memorial-border-elegant shadow-elegant hover-memorial">
              <CardContent className="p-8">
                <h3 className="text-xl font-memorial mb-6 text-center">
                  <span className="memorial-text-ornament">Erstellt von</span>
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  {/* Name */}
                  <div className="gap-3 p-3 bg-memorial-snow rounded-lg">
                    <div className="font-bold text-memorial-dark-grey">Name:</div>
                    <div className="font-elegant">
                      {memorialPage.creator_firstname || memorialPage.creator_lastname
                        ? [memorialPage.creator_firstname, memorialPage.creator_lastname].filter(Boolean).join(' ')
                        : '-'}
                    </div>
                  </div>

                  {/* Relationship */}
                  <div className="gap-3 p-3 bg-memorial-snow rounded-lg">
                    <div className="font-bold text-memorial-dark-grey">Beziehung:</div>
                    <div className="font-elegant">
                      {memorialPage.creator_relationship || '-'}
                    </div>
                  </div>

                  {/* Street */}
                  <div className="gap-3 p-3 bg-memorial-snow rounded-lg">
                    <div className="font-bold text-memorial-dark-grey">Straße:</div>
                    <div className="font-elegant">
                      {memorialPage.creator_street || '-'}
                    </div>
                  </div>

                  {/* ZIP */}
                  <div className="gap-3 p-3 bg-memorial-snow rounded-lg">
                    <div className="font-bold text-memorial-dark-grey">PLZ:</div>
                    <div className="font-elegant">
                      {memorialPage.creator_zip || '-'}
                    </div>
                  </div>

                  {/* City */}
                  <div className="gap-3 p-3 bg-memorial-snow rounded-lg">
                    <div className="font-bold text-memorial-dark-grey">Ort:</div>
                    <div className="font-elegant">
                      {memorialPage.creator_city || '-'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Members Section */}
            {memorialPage.family_members && memorialPage.family_members.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Familie
                  </h3>
                  <div className="space-y-4">
                    {memorialPage.family_members.map((member: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium capitalize">{member.relationship}:</span>
                          <span>{member.firstName} {member.lastName}</span>
                        </div>
                        {(member.birthDate || member.deathDate) && (
                          <div className="text-sm text-muted-foreground">
                            {member.birthDate && <span>* {new Date(member.birthDate).toLocaleDateString('de-DE')}</span>}
                            {member.deathDate && <span> † {new Date(member.deathDate).toLocaleDateString('de-DE')}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Life Events Section */}
            {memorialPage.life_events && Array.isArray(memorialPage.life_events) && memorialPage.life_events.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Lebensstationen
                  </h3>
                  <div className="space-y-6">
                    {memorialPage.life_events.map((event: any, index: number) => {
                      const categoryNames: Record<string, string> = {
                        arbeit: 'Berufsleben',
                        ausbildung: 'Ausbildung',
                        beziehung: 'Beziehungen',
                        haus_wohnen: 'Wohnen',
                        familie: 'Familie',
                        reise: 'Reisen',
                        interessen: 'Interessen',
                        meilensteine: 'Meilensteine',
                        memoriam: 'In Memoriam'
                      };
                      
                      return (
                        <div key={index} className="border-l-4 border-primary/20 pl-4 mb-4">
                          <div className="bg-muted/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                {categoryNames[event.category] || event.category}
                              </span>
                            </div>
                            <h5 className="font-medium text-lg mb-2">{event.title}</h5>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {event.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(event.date).toLocaleDateString('de-DE')}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <MemorialCandleModal
        isOpen={showCandleModal}
        onClose={() => setShowCandleModal(false)}
        onCandleLit={handleCandleLit}
        memorialPageId={id}
      />
    </div>
  );
};

export default MemorialPageView;
