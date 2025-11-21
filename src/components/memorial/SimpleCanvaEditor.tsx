import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Canvas as FabricCanvas, 
  Textbox, 
  FabricImage,
  FabricObject,
  Control,
  TControlSet
} from 'fabric';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Type, 
  Upload,
  Search,
  ChevronLeft,
  X,
  Plus,
  Eye,
  Heart,
  Flower2,
  Cross,
  Star,
  Sparkles,
  Image as ImageIcon,
  Video,
  Music
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SimpleCanvaEditorProps {
  data: any;
  styles: Record<string, any>;
  onDataChange: (data: any) => void;
  onStylesChange: (styles: Record<string, any>) => void;
}

export const SimpleCanvaEditor: React.FC<SimpleCanvaEditorProps> = ({
  data,
  styles,
  onDataChange,
  onStylesChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [zoom, setZoom] = useState(100);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(data?.mainPhotoGallery || []);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>(data?.videoGallery || []);
  const [uploadedAudios, setUploadedAudios] = useState<string[]>(data?.audioGallery || []);
  const [canvasObjects, setCanvasObjects] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Récupérer l'utilisateur
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };
    checkUser();
  }, []);

  // Ref pour stocker la fonction de sauvegarde
  const saveCanvasStateRef = useRef<() => void>();

  // Sauvegarder l'état du canvas
  const saveCanvasState = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    try {
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      setCanvasObjects(JSON.parse(json).objects || []);
      
      // Sauvegarder dans les données parentes
      onDataChange({ 
        ...data,
        canvasState: json,
        mainPhotoGallery: uploadedPhotos 
      });
    } catch (e) {
      console.error('Error saving canvas state:', e);
    }
  }, [uploadedPhotos, onDataChange, data]);

  // Mettre à jour la ref
  useEffect(() => {
    saveCanvasStateRef.current = saveCanvasState;
  }, [saveCanvasState]);

  // Synchroniser avec les données parentes
  useEffect(() => {
    if (data?.mainPhotoGallery) {
      setUploadedPhotos(data.mainPhotoGallery);
    }
    if (data?.videoGallery) {
      setUploadedVideos(data.videoGallery);
    }
    if (data?.audioGallery) {
      setUploadedAudios(data.audioGallery);
    }
  }, [data?.mainPhotoGallery, data?.videoGallery, data?.audioGallery]);

  // Initialiser le canvas (une seule fois)
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1280,
      height: 720,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      centeredScaling: true,
      centeredRotation: true,
    });

    fabricCanvasRef.current = canvas;

    // Créer un contrôle personnalisé pour la suppression (croix rouge)
    const deleteControl = new Control({
      x: 0.5,
      y: -0.5,
      offsetX: 10,
      offsetY: 10,
      cursorStyle: 'pointer',
      actionHandler: () => {
        // Cette fonction sera appelée lors du clic
        return true;
      },
      render: (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: FabricObject) => {
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // Fond rouge circulaire
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Croix blanche
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, -6);
        ctx.lineTo(6, 6);
        ctx.moveTo(6, -6);
        ctx.lineTo(-6, 6);
        ctx.stroke();
        
        ctx.restore();
      },
      mouseUpHandler: (eventData: MouseEvent, transformData: any, x: number, y: number) => {
        const obj = transformData.target;
        if (obj && canvas) {
          canvas.remove(obj);
          canvas.renderAll();
          setSelectedObject(null);
          saveCanvasStateRef.current?.();
          return true;
        }
        return false;
      },
    });

    // Fonction pour ajouter le contrôle de suppression à un objet
    const addDeleteControlToObject = (obj: FabricObject) => {
      if (!obj.controls) {
        obj.controls = {} as TControlSet;
      }
      obj.controls.deleteButton = deleteControl;
    };

    // Appliquer le contrôle à tous les objets existants et futurs
    canvas.on('object:added', (e) => {
      if (e.target) {
        addDeleteControlToObject(e.target);
        canvas.renderAll();
      }
    });

    // Écouter les événements de sélection
    canvas.on('selection:created', () => {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject);
    });

    canvas.on('selection:updated', () => {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Écouter la touche Delete pour supprimer l'objet sélectionné
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas.getActiveObject()) {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          canvas.remove(activeObject);
          canvas.renderAll();
          setSelectedObject(null);
          saveCanvasStateRef.current?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Écouter les événements pour sauvegarder
    const handleObjectModified = () => {
      saveCanvasStateRef.current?.();
    };

    const handleObjectAdded = () => {
      saveCanvasStateRef.current?.();
    };

    const handleObjectRemoved = () => {
      saveCanvasStateRef.current?.();
    };

    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleObjectRemoved);

    // Charger l'état initial si disponible (une seule fois, seulement si le canvas est vide)
    if (data?.canvasState && canvas.getObjects().length === 0) {
      try {
        canvas.loadFromJSON(data.canvasState, () => {
          canvas.renderAll();
        });
      } catch (e) {
        console.error('Error loading canvas state:', e);
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', handleObjectRemoved);
      canvas.dispose();
    };
  }, []); // Ne pas réinitialiser le canvas à chaque changement de data

  // Ajouter du texte
  const addText = useCallback((textType: 'heading' | 'subheading' | 'body' = 'body') => {
    if (!fabricCanvasRef.current) return;

    const configs = {
      heading: { text: 'Überschrift', fontSize: 48, fontWeight: 'bold' },
      subheading: { text: 'Zwischenüberschrift', fontSize: 32, fontWeight: 'bold' },
      body: { text: 'Ein bisschen Text', fontSize: 16, fontWeight: 'normal' },
    };

    const config = configs[textType];
    const text = new Textbox(config.text, {
      left: 200,
      top: 200,
      width: 400,
      fontSize: config.fontSize,
      fontFamily: 'Arial',
      fontWeight: config.fontWeight,
      fill: '#000000',
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    });

    // Le contrôle de suppression sera ajouté automatiquement par l'événement 'object:added'
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    saveCanvasState();
  }, [saveCanvasState]);

  // Upload d'images, vidéos et audios
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !user?.id) return;

    // Séparer les fichiers par type
    const imageFiles: File[] = [];
    const videoFiles: File[] = [];
    const audioFiles: File[] = [];

    // Validation et tri
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Datei zu groß",
            description: `${file.name} ist zu groß. Maximale Größe: 10MB.`,
            variant: "destructive",
          });
          continue;
        }
        imageFiles.push(file);
      } else if (file.type.startsWith('video/')) {
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Datei zu groß",
            description: `${file.name} ist zu groß. Maximale Größe: 50MB.`,
            variant: "destructive",
          });
          continue;
        }
        videoFiles.push(file);
      } else if (file.type.startsWith('audio/')) {
        if (file.size > 20 * 1024 * 1024) {
          toast({
            title: "Datei zu groß",
            description: `${file.name} ist zu groß. Maximale Größe: 20MB.`,
            variant: "destructive",
          });
          continue;
        }
        audioFiles.push(file);
      } else {
        toast({
          title: "Ungültiger Dateityp",
          description: `${file.name} ist kein unterstütztes Format.`,
          variant: "destructive",
        });
      }
    }

    if (imageFiles.length === 0 && videoFiles.length === 0 && audioFiles.length === 0) return;

    setIsUploading(true);
    try {
      // Upload des images
      const imagePromises = imageFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/gallery/${Date.now()}-${Math.random()}.${fileExt}`;

        const { data: uploadData, error } = await supabase.storage
          .from('dde_memorial_photos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('dde_memorial_photos')
          .getPublicUrl(uploadData.path);

        return publicUrl;
      });

      // Upload des vidéos
      const videoPromises = videoFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/videos/${Date.now()}-${Math.random()}.${fileExt}`;

        const { data: uploadData, error } = await supabase.storage
          .from('dde_memorial_photos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('dde_memorial_photos')
          .getPublicUrl(uploadData.path);

        return publicUrl;
      });

      // Upload des audios
      const audioPromises = audioFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/audios/${Date.now()}-${Math.random()}.${fileExt}`;

        const { data: uploadData, error } = await supabase.storage
          .from('dde_memorial_photos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('dde_memorial_photos')
          .getPublicUrl(uploadData.path);

        return publicUrl;
      });

      const [newImageUrls, newVideoUrls, newAudioUrls] = await Promise.all([
        Promise.all(imagePromises),
        Promise.all(videoPromises),
        Promise.all(audioPromises),
      ]);

      if (newImageUrls.length > 0) {
        const updatedPhotos = [...uploadedPhotos, ...newImageUrls];
        setUploadedPhotos(updatedPhotos);
        onDataChange({ mainPhotoGallery: updatedPhotos });
      }

      if (newVideoUrls.length > 0) {
        const updatedVideos = [...uploadedVideos, ...newVideoUrls];
        setUploadedVideos(updatedVideos);
        onDataChange({ videoGallery: updatedVideos });
      }

      if (newAudioUrls.length > 0) {
        const updatedAudios = [...uploadedAudios, ...newAudioUrls];
        setUploadedAudios(updatedAudios);
        onDataChange({ audioGallery: updatedAudios });
      }

      const totalUploaded = newImageUrls.length + newVideoUrls.length + newAudioUrls.length;
      toast({
        title: "Dateien hochgeladen",
        description: `${totalUploaded} Datei(en) wurden erfolgreich hochgeladen.`,
      });
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload-Fehler",
        description: "Die Dateien konnten nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }, [user, uploadedPhotos, uploadedVideos, uploadedAudios, onDataChange]);

  // Ajouter une image au canvas depuis la galerie (comme addText)
  const addImageToCanvas = useCallback((imageUrl: string) => {
    console.log('addImageToCanvas called with:', imageUrl);
    console.log('fabricCanvasRef.current:', fabricCanvasRef.current);
    console.log('canvasRef.current:', canvasRef.current);
    
    if (!fabricCanvasRef.current) {
      console.error('Canvas not initialized');
      toast({
        title: "Erreur",
        description: "Le canvas n'est pas encore initialisé. Veuillez réessayer.",
        variant: "destructive",
      });
      return;
    }

    console.log('Loading image from URL:', imageUrl);
    
    // Utiliser FabricImage.fromURL - dans Fabric.js v6, c'est une Promise
    FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous',
    }).then((img) => {
      console.log('Fabric image loaded:', img);
      handleImageLoaded(img);
    }).catch((error) => {
      console.error('Error loading image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'image. Vérifiez l'URL ou les permissions CORS.",
        variant: "destructive",
      });
    });
    
    function handleImageLoaded(img: any) {
      if (!img || !fabricCanvasRef.current) {
        console.error('Failed to load image or canvas not available');
        toast({
          title: "Erreur",
          description: "Impossible de charger l'image.",
          variant: "destructive",
        });
        return;
      }
      
      const maxWidth = 400;
      const maxHeight = 400;
      const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1), 1);
      
      // Centrer l'image au milieu du canvas
      const canvasWidth = 1280;
      const canvasHeight = 720;
      const imgWidth = (img.width || 1) * scale;
      const imgHeight = (img.height || 1) * scale;
      
      img.set({
        left: (canvasWidth - imgWidth) / 2,
        top: (canvasHeight - imgHeight) / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
      });
      
      console.log('Adding image to canvas');
      const canvas = fabricCanvasRef.current;
      
      // Ajouter le contrôle de suppression à l'image
      if (!img.controls) {
        img.controls = {} as TControlSet;
      }
      // Le contrôle sera ajouté automatiquement par l'événement 'object:added'
      
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      
      console.log('Image added, canvas objects:', canvas.getObjects().length);
      
      // Sauvegarder l'état
      requestAnimationFrame(() => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.renderAll();
          if (saveCanvasStateRef.current) {
            saveCanvasStateRef.current();
          }
        }
      });
    }
  }, []);

  // Supprimer l'objet sélectionné
  const deleteSelected = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.renderAll();
      setSelectedObject(null);
      
      // Sauvegarder l'état
      requestAnimationFrame(() => {
        if (fabricCanvasRef.current && saveCanvasStateRef.current) {
          saveCanvasStateRef.current();
        }
      });
    }
  }, []);

  // Zoom
  const handleZoom = useCallback((delta: number) => {
    if (!fabricCanvasRef.current) return;
    const newZoom = Math.max(25, Math.min(200, zoom + delta));
    setZoom(newZoom);
    
    const canvas = fabricCanvasRef.current;
    const vpt = canvas.viewportTransform;
    if (vpt) {
      const zoomFactor = newZoom / 100;
      vpt[0] = zoomFactor;
      vpt[3] = zoomFactor;
      canvas.setViewportTransform(vpt);
      canvas.renderAll();
    }
  }, [zoom]);

  // Prévisualisation
  const handlePreview = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    setShowPreview(true);
  }, []);

  // Obtenir l'URL de l'image de prévisualisation
  const getPreviewImageUrl = useCallback(() => {
    if (!fabricCanvasRef.current) return '';
    return fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
  }, []);

  // Charger les symboles depuis les assets
  const symbolAssets = React.useMemo(() => {
    try {
      const modules = import.meta.glob('/src/assets/symbols/*.{png,PNG,jpg,JPG}', { eager: true, as: 'url' }) as Record<string, string>;
      return Object.entries(modules)
        .map(([path, url]) => {
          const filename = path.split('/').pop() || 'symbol';
          const name = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
          return {
            id: `symbol-${filename}`,
            name: name,
            src: url,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter(symbol => 
          symbol.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    } catch (e) {
      console.error('Error loading symbols:', e);
      return [];
    }
  }, [searchQuery]);

  // Ajouter un symbole au canvas
  const addSymbolToCanvas = useCallback((symbolUrl: string) => {
    if (!fabricCanvasRef.current) return;
    
    FabricImage.fromURL(symbolUrl, {
      crossOrigin: 'anonymous',
    }).then((img) => {
      if (!img || !fabricCanvasRef.current) return;
      
      const maxWidth = 200;
      const maxHeight = 200;
      const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1), 1);
      
      const canvasWidth = 1280;
      const canvasHeight = 720;
      const imgWidth = (img.width || 1) * scale;
      const imgHeight = (img.height || 1) * scale;
      
      img.set({
        left: (canvasWidth - imgWidth) / 2,
        top: (canvasHeight - imgHeight) / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
      });
      
      const canvas = fabricCanvasRef.current;
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      
      requestAnimationFrame(() => {
        if (fabricCanvasRef.current && saveCanvasStateRef.current) {
          saveCanvasStateRef.current();
        }
      });
    }).catch((error) => {
      console.error('Error loading symbol:', error);
    });
  }, []);

  // Ajouter une vidéo au canvas
  const addVideoToCanvas = useCallback((videoUrl: string) => {
    if (!fabricCanvasRef.current) return;
    
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.crossOrigin = 'anonymous';
    videoElement.muted = true;
    videoElement.loop = true;
    videoElement.autoplay = true;
    videoElement.playsInline = true;

    videoElement.addEventListener('loadedmetadata', () => {
      if (!fabricCanvasRef.current) return;
      
      const maxWidth = 400;
      const maxHeight = 400;
      const scale = Math.min(maxWidth / (videoElement.videoWidth || 1), maxHeight / (videoElement.videoHeight || 1), 1);
      
      const canvasWidth = 1280;
      const canvasHeight = 720;
      const vidWidth = (videoElement.videoWidth || 1) * scale;
      const vidHeight = (videoElement.videoHeight || 1) * scale;
      
      FabricImage.fromURL(videoUrl, {
        crossOrigin: 'anonymous',
      }).then((img) => {
        if (!img || !fabricCanvasRef.current) return;
        
        img.set({
          left: (canvasWidth - vidWidth) / 2,
          top: (canvasHeight - vidHeight) / 2,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
        });
        
        const canvas = fabricCanvasRef.current;
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        
        requestAnimationFrame(() => {
          if (fabricCanvasRef.current && saveCanvasStateRef.current) {
            saveCanvasStateRef.current();
          }
        });
      }).catch((error) => {
        console.error('Error loading video:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la vidéo.",
          variant: "destructive",
        });
      });
    });

    videoElement.load();
  }, []);

  // Ajouter une icône au canvas (comme emoji)
  const addIconToCanvas = useCallback((iconName: string) => {
    if (!fabricCanvasRef.current) return;
    
    const emojiMap: Record<string, string> = {
      'Cœur': '❤️',
      'Fleur': '🌸',
      'Croix': '✝️',
      'Étoile': '⭐',
      'Étincelles': '✨',
    };
    const emoji = emojiMap[iconName] || '⭐';
    
    const text = new Textbox(emoji, {
      left: 200,
      top: 200,
      fontSize: 80,
      fontFamily: 'Arial',
      fill: '#000000',
      width: 100,
      height: 100,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    });
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    
    requestAnimationFrame(() => {
      if (fabricCanvasRef.current && saveCanvasStateRef.current) {
        saveCanvasStateRef.current();
      }
    });
  }, []);


  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
      {/* Sidebar gauche */}
      <div className={cn(
        "bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        {!sidebarCollapsed && (
          <>
            {/* Search bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Schriftarten und Kombinationen such"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 h-9 bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Content with tabs */}
            <Tabs defaultValue="text" className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full rounded-none border-b border-gray-200 bg-gray-50">
                <TabsTrigger 
                  value="text" 
                  className="flex-1 text-[10px] px-0.5 truncate data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-semibold transition-colors"
                >
                  <Type className="w-3 h-3 mr-0.5 flex-shrink-0" />
                  <span className="truncate">Text</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="images" 
                  className="flex-1 text-[10px] px-0.5 truncate data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-semibold transition-colors"
                >
                  <ImageIcon className="w-3 h-3 mr-0.5 flex-shrink-0" />
                  <span className="truncate">Uploads</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="symbols" 
                  className="flex-1 text-[10px] px-0.5 truncate data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-semibold transition-colors"
                >
                  <Sparkles className="w-3 h-3 mr-0.5 flex-shrink-0" />
                  <span className="truncate">Symbole</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="icons" 
                  className="flex-1 text-[10px] px-0.5 truncate data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-semibold transition-colors"
                >
                  <Star className="w-3 h-3 mr-0.5 flex-shrink-0" />
                  <span className="truncate">Icons</span>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  {/* Text tab */}
                  <TabsContent value="text" className="space-y-4 mt-0">
                {/* Add text button */}
                <Button
                  onClick={() => addText('body')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Textfeld hinzufügen
                </Button>

                {/* Text templates */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase">Formatvorlagen für Text</h3>
                  
                  <button
                    onClick={() => addText('heading')}
                    className="w-full p-3 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors"
                  >
                    <div className="text-2xl font-bold">Überschrift hinzufügen</div>
                  </button>

                  <button
                    onClick={() => addText('subheading')}
                    className="w-full p-3 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors"
                  >
                    <div className="text-lg font-semibold">Zwischenüberschrift hinzufügen</div>
                  </button>

                  <button
                    onClick={() => addText('body')}
                    className="w-full p-3 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors"
                  >
                    <div className="text-sm">Ein bisschen Text hinzufügen</div>
                  </button>
                </div>

                  </TabsContent>

                  {/* Images tab */}
                  <TabsContent value="images" className="space-y-2 mt-0">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">Uploads</h3>
                  
                    {/* Upload button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label className="block">
                            <input
                              type="file"
                              accept="image/*,video/*,audio/*"
                              multiple
                              onChange={handleFileUpload}
                              disabled={isUploading}
                              className="hidden"
                              id="canva-upload"
                            />
                            <Button
                              variant="outline"
                              className="w-full bg-white hover:bg-gray-50 border-gray-300 text-gray-700 justify-start"
                              disabled={isUploading}
                              asChild
                            >
                              <span>
                                {isUploading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Hochladen...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    <span className="truncate">Bilder, Videos & Audio hochladen</span>
                                  </>
                                )}
                              </span>
                            </Button>
                          </label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Bilder, Videos & Audio hochladen</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                  {/* Gallery des images uploadées */}
                  {uploadedPhotos.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase">Images</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {uploadedPhotos.map((photo: string | any, index: number) => {
                          const src = typeof photo === 'string' ? photo : photo.src || photo;
                          return (
                            <button
                              key={`img-${index}`}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addImageToCanvas(src);
                              }}
                              className="aspect-square rounded-lg overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-pointer relative group"
                            >
                              <img
                                src={src}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                                draggable={false}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Gallery des vidéos uploadées */}
                  {uploadedVideos.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase">Videos</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {uploadedVideos.map((video: string | any, index: number) => {
                          const src = typeof video === 'string' ? video : video.src || video;
                          return (
                            <button
                              key={`vid-${index}`}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addVideoToCanvas(src);
                              }}
                              className="aspect-square rounded-lg overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-pointer relative group bg-gray-100"
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Video className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              </div>
                              <div className="absolute bottom-1 left-1 right-1">
                                <p className="text-xs text-white bg-black/50 px-1 py-0.5 rounded truncate">
                                  Video {index + 1}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Gallery des audios uploadés */}
                  {uploadedAudios.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase">Audio</h4>
                      <div className="space-y-2">
                        {uploadedAudios.map((audio: string | any, index: number) => {
                          const src = typeof audio === 'string' ? audio : audio.src || audio;
                          return (
                            <div
                              key={`aud-${index}`}
                              className="p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors flex items-center gap-2"
                            >
                              <Music className="w-5 h-5 text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 truncate">
                                  Audio {index + 1}
                                </p>
                                <audio controls className="w-full h-6 mt-1" src={src} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {uploadedPhotos.length === 0 && uploadedVideos.length === 0 && uploadedAudios.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Keine Dateien hochgeladen
                    </div>
                  )}
                  </TabsContent>

                  {/* Symbols tab */}
                  <TabsContent value="symbols" className="mt-0">
                    {symbolAssets.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {symbolAssets.map((symbol) => (
                          <button
                            key={symbol.id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addSymbolToCanvas(symbol.src);
                            }}
                            className="aspect-square rounded-lg overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-pointer bg-white"
                            title={symbol.name}
                          >
                            <img
                              src={symbol.src}
                              alt={symbol.name}
                              className="w-full h-full object-cover pointer-events-none"
                              draggable={false}
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun symbole disponible</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Icons tab */}
                  <TabsContent value="icons" className="mt-0">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'icon-heart', name: 'Cœur', icon: Heart },
                        { id: 'icon-flower', name: 'Fleur', icon: Flower2 },
                        { id: 'icon-cross', name: 'Croix', icon: Cross },
                        { id: 'icon-star', name: 'Étoile', icon: Star },
                        { id: 'icon-sparkles', name: 'Étincelles', icon: Sparkles },
                      ].map((asset) => {
                        const IconComponent = asset.icon;
                        return (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addIconToCanvas(asset.name);
                            }}
                            className="aspect-square rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center bg-white hover:bg-gray-50 cursor-pointer"
                            title={asset.name}
                          >
                            <IconComponent className="w-8 h-8 text-gray-700" />
                          </button>
                        );
                      })}
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </>
        )}

        {/* Collapse button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className={cn(
              "w-5 h-5 mx-auto transition-transform",
              sidebarCollapsed && "rotate-180"
            )} />
          </button>
        </div>
      </div>

      {/* Canvas principal */}
      <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
        {/* Toolbar */}
        {selectedObject && (
          <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSelected}
              className="text-gray-700 hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-8 min-h-0 min-w-0">
          <Card className="shadow-lg border-2 border-gray-200" style={{ maxWidth: '100%', maxHeight: '100%' }}>
            <div className="bg-white" style={{ width: '1280px', height: '720px' }}>
              <canvas ref={canvasRef} />
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 border-t border-gray-300 p-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Seiten</span>
            <span className="text-sm text-gray-700">1/1</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="text-gray-700 hover:bg-gray-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              Vorschau
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom(-10)}
              className="text-gray-700 hover:bg-gray-200"
            >
              -
            </Button>
            <span className="text-sm text-gray-700 w-12 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom(10)}
              className="text-gray-700 hover:bg-gray-200"
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de prévisualisation */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Vorschau</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <img
              src={getPreviewImageUrl()}
              alt="Vorschau"
              className="max-w-full max-h-[70vh] object-contain shadow-lg rounded"
              onLoad={() => {
                // Forcer le re-render si nécessaire
                if (fabricCanvasRef.current) {
                  fabricCanvasRef.current.renderAll();
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

