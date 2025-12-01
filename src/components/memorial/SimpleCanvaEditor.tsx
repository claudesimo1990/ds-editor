import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Canvas as FabricCanvas, 
  Textbox, 
  FabricImage,
  FabricObject,
  Control,
  TControlSet,
  Rect,
  Group
} from 'fabric';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Music,
  Circle,
  Droplets,
  Download,
  Share2,
  Save,
  Play
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
import { WysiwygToolbar } from './WysiwygToolbar';
import { ElementBorderTool } from './ElementBorderTool';
import { OpacityTool } from './OpacityTool';
import { calculateSnap, ElementBounds } from '@/hooks/useSnapAlignment';

interface SimpleCanvaEditorProps {
  data: any;
  styles: Record<string, any>;
  onDataChange: (data: any) => void;
  onStylesChange: (styles: Record<string, any>) => void;
  memorialId?: string; // ID de la page commémorative pour le partage
  onSave?: () => void; // Fonction de sauvegarde optionnelle
  onPreview?: (fn: () => void) => void; // Callback pour exposer handlePreview
  onDownload?: (fn: () => void) => void; // Callback pour exposer handleDownload
  onShare?: (fn: () => void) => void; // Callback pour exposer handleShare
}

export const SimpleCanvaEditor: React.FC<SimpleCanvaEditorProps> = ({
  data,
  styles,
  onDataChange,
  onStylesChange,
  memorialId,
  onSave,
  onPreview,
  onDownload,
  onShare,
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
  const [selectedAudiosForEditor, setSelectedAudiosForEditor] = useState<string[]>([]);
  const [showAudioSelector, setShowAudioSelector] = useState(false);
  const [canvasObjects, setCanvasObjects] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  const [snapGuides, setSnapGuides] = useState<Array<{ type: 'horizontal' | 'vertical'; position: number; start: number; end: number }>>([]);
  const [isDraggingObject, setIsDraggingObject] = useState(false);

  // Fonction pour charger les fichiers de l'utilisateur depuis le storage
  const loadUserFilesFromStorage = useCallback(async (userId: string) => {
    try {
      // Charger les images depuis dde_memorial_photos
      const { data: imageFiles, error: imageError } = await supabase.storage
        .from('dde_memorial_photos')
        .list(`${userId}/gallery`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!imageError && imageFiles && imageFiles.length > 0) {
        const imageUrls = imageFiles
          .filter(file => file.name && !file.name.endsWith('.emptyFolderPlaceholder'))
          .map(file => {
            const { data: { publicUrl } } = supabase.storage
              .from('dde_memorial_photos')
              .getPublicUrl(`${userId}/gallery/${file.name}`);
            return publicUrl;
          });
        
        if (imageUrls.length > 0) {
          setUploadedPhotos(prev => {
            // Fusionner avec les fichiers existants, éviter les doublons
            const merged = [...prev, ...imageUrls];
            const unique = Array.from(new Set(merged));
            if (unique.length !== prev.length) {
              onDataChange({ mainPhotoGallery: unique });
            }
            return unique;
          });
        }
      }

      // Charger les vidéos depuis dde_memorial_media
      const { data: videoFiles, error: videoError } = await supabase.storage
        .from('dde_memorial_media')
        .list(`${userId}/videos`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!videoError && videoFiles && videoFiles.length > 0) {
        const videoUrls = videoFiles
          .filter(file => file.name && !file.name.endsWith('.emptyFolderPlaceholder'))
          .map(file => {
            const { data: { publicUrl } } = supabase.storage
              .from('dde_memorial_media')
              .getPublicUrl(`${userId}/videos/${file.name}`);
            return publicUrl;
          });
        
        if (videoUrls.length > 0) {
          setUploadedVideos(prev => {
            const merged = [...prev, ...videoUrls];
            const unique = Array.from(new Set(merged));
            if (unique.length !== prev.length) {
              onDataChange({ videoGallery: unique });
            }
            return unique;
          });
        }
      }

      // Charger les audios depuis dde_memorial_media
      const { data: audioFiles, error: audioError } = await supabase.storage
        .from('dde_memorial_media')
        .list(`${userId}/audios`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!audioError && audioFiles && audioFiles.length > 0) {
        const audioUrls = audioFiles
          .filter(file => file.name && !file.name.endsWith('.emptyFolderPlaceholder'))
          .map(file => {
            const { data: { publicUrl } } = supabase.storage
              .from('dde_memorial_media')
              .getPublicUrl(`${userId}/audios/${file.name}`);
            return publicUrl;
          });
        
        if (audioUrls.length > 0) {
          setUploadedAudios(prev => {
            const merged = [...prev, ...audioUrls];
            const unique = Array.from(new Set(merged));
            if (unique.length !== prev.length) {
              onDataChange({ audioGallery: unique });
            }
            return unique;
          });
          
          // Initialiser les audios sélectionnés
          setSelectedAudiosForEditor(prev => {
            const merged = [...prev, ...audioUrls];
            return Array.from(new Set(merged));
          });
        }
      }
    } catch (error) {
      console.error('Error loading user files from storage:', error);
    }
  }, [onDataChange]);

  // Ref pour stocker la fonction de sauvegarde
  const saveCanvasStateRef = useRef<() => void>();
  
  // Ref pour éviter de recharger le canvasState si on vient de le sauvegarder
  const lastSavedCanvasStateRef = useRef<string | null>(null);

  // Sauvegarder l'état du canvas
  const saveCanvasState = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    try {
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      setCanvasObjects(JSON.parse(json).objects || []);
      
      // Sauvegarder la référence pour éviter de recharger
      lastSavedCanvasStateRef.current = json;
      
      // Sauvegarder dans les données parentes
      onDataChange({ 
        ...data,
        canvasState: json,
        mainPhotoGallery: uploadedPhotos 
      });
      
      console.log('Canvas state saved:', json.substring(0, 100) + '...');
    } catch (e) {
      console.error('Error saving canvas state:', e);
    }
  }, [uploadedPhotos, onDataChange, data]);

  // Mettre à jour la ref
  useEffect(() => {
    saveCanvasStateRef.current = saveCanvasState;
  }, [saveCanvasState]);

  // Synchroniser avec les données parentes (depuis la base de données)
  // Puis charger aussi les fichiers depuis le storage pour avoir tous les fichiers uploadés
  useEffect(() => {
    if (data?.mainPhotoGallery) {
      setUploadedPhotos(data.mainPhotoGallery);
    }
    if (data?.videoGallery) {
      setUploadedVideos(data.videoGallery);
    }
    if (data?.audioGallery) {
      setUploadedAudios(data.audioGallery);
      // Initialiser les audios sélectionnés avec tous les audios disponibles
      setSelectedAudiosForEditor(data.audioGallery);
    }
    
    // Si l'utilisateur est connecté, charger aussi les fichiers depuis le storage
    // pour avoir tous les fichiers uploadés, même ceux non sauvegardés dans la base
    if (user?.id) {
      // Attendre un peu pour que les données de la base soient chargées d'abord
      const timer = setTimeout(() => {
        loadUserFilesFromStorage(user.id);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data?.mainPhotoGallery, data?.videoGallery, data?.audioGallery, user?.id, loadUserFilesFromStorage]);

  // Fonction pour créer/mettre à jour un rectangle de bordure autour d'un élément
  const updateBorderRect = useCallback((obj: FabricObject, borderColor: string, borderWidth: number, borderStyle: 'solid' | 'dashed' = 'solid') => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    
    // Supprimer l'ancien rectangle de bordure s'il existe
    const existingBorder = (obj as any).borderRect;
    if (existingBorder) {
      canvas.remove(existingBorder);
      // Nettoyer les event listeners
      obj.off('moving', (obj as any).__updateBorder);
      obj.off('scaling', (obj as any).__updateBorder);
      obj.off('modified', (obj as any).__updateBorder);
    }
    
    // Si la largeur est 0, ne pas créer de bordure
    if (borderWidth === 0) {
      (obj as any).borderRect = null;
      (obj as any).borderColor = '';
      (obj as any).borderWidth = 0;
      (obj as any).borderStyle = '';
      canvas.renderAll();
      return;
    }
    
    // Fonction pour calculer les coordonnées exactes des bords de l'élément
    const getBoundingBox = (object: FabricObject) => {
      // Obtenir les coordonnées des coins de l'objet après toutes les transformations
      const boundingRect = object.getBoundingRect();
      
      // Pour les images, utiliser les coordonnées exactes du bounding box
      if (object.type === 'image' || object.type === 'fabric-image') {
        return {
          left: boundingRect.left,
          top: boundingRect.top,
          width: boundingRect.width,
          height: boundingRect.height,
        };
      }
      
      // Pour les autres éléments, utiliser les coordonnées standard
      return {
        left: object.left || 0,
        top: object.top || 0,
        width: (object.width || 0) * (object.scaleX || 1),
        height: (object.height || 0) * (object.scaleY || 1),
      };
    };
    
    const bbox = getBoundingBox(obj);
    
    // Créer un rectangle de bordure exactement aux bords, sans padding
    const borderRect = new Rect({
      left: bbox.left,
      top: bbox.top,
      width: bbox.width,
      height: bbox.height,
      fill: 'transparent',
      stroke: borderColor,
      strokeWidth: borderWidth,
      strokeDashArray: borderStyle === 'dashed' ? [5, 5] : [],
      selectable: false,
      evented: false,
      excludeFromExport: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      originX: 'left',
      originY: 'top',
    });
    
    // Stocker la référence dans l'élément
    (obj as any).borderRect = borderRect;
    (obj as any).borderColor = borderColor;
    (obj as any).borderWidth = borderWidth;
    (obj as any).borderStyle = borderStyle;
    
    // Ajouter le rectangle au canvas
    canvas.add(borderRect);
    canvas.sendToBack(borderRect);
    
    // Mettre à jour le rectangle quand l'élément bouge ou change
    const updateBorder = () => {
      if (!borderRect || !obj) return;
      const newBbox = getBoundingBox(obj);
      const currentBorderStyle = (obj as any).borderStyle || 'solid';
      
      borderRect.set({
        left: newBbox.left,
        top: newBbox.top,
        width: newBbox.width,
        height: newBbox.height,
        strokeDashArray: currentBorderStyle === 'dashed' ? [5, 5] : [],
      });
      canvas.renderAll();
    };
    
    // Stocker la fonction pour pouvoir la nettoyer plus tard
    (obj as any).__updateBorder = updateBorder;
    
    // Écouter les changements de l'élément
    obj.on('moving', updateBorder);
    obj.on('scaling', updateBorder);
    obj.on('modified', updateBorder);
    obj.on('rotating', updateBorder);
    
    canvas.renderAll();
  }, []);

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

    // Activer le snap pour l'alignement automatique avec guides visuels
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj) return;

      setIsDraggingObject(true);
      const objects = canvas.getObjects().filter(o => o !== obj);

      // Calculer les bounds de l'objet courant
      const objLeft = obj.left!;
      const objTop = obj.top!;
      const objWidth = (obj.width! * (obj.scaleX || 1)) || 0;
      const objHeight = (obj.height! * (obj.scaleY || 1)) || 0;

      const currentBounds: ElementBounds = {
        id: (obj as any).name || `obj-${obj.type}-${objLeft}-${objTop}`,
        x: objLeft,
        y: objTop,
        width: objWidth,
        height: objHeight,
      };

      // Calculer les bounds de tous les autres objets
      const otherBounds: ElementBounds[] = objects.map((target, idx) => {
        const targetLeft = target.left!;
        const targetTop = target.top!;
        const targetWidth = (target.width! * (target.scaleX || 1)) || 0;
        const targetHeight = (target.height! * (target.scaleY || 1)) || 0;
        
        return {
          id: (target as any).name || `target-${target.type}-${idx}`,
          x: targetLeft,
          y: targetTop,
          width: targetWidth,
          height: targetHeight,
        };
      });

      // Calculer le snap avec guides
      const snapResult = calculateSnap(currentBounds, otherBounds);

      // Afficher les guides
      if (snapResult && snapResult.guides.length > 0) {
        setSnapGuides(snapResult.guides);
        // Appliquer le snap
        obj.set('left', snapResult.snappedX);
        obj.set('top', snapResult.snappedY);
      } else {
        setSnapGuides([]);
      }
    });

    canvas.on('object:moved', () => {
      // L'objet a fini de bouger
      setIsDraggingObject(false);
      setSnapGuides([]);
      saveCanvasStateRef.current?.();
    });

    canvas.on('object:modified', () => {
      setIsDraggingObject(false);
      setSnapGuides([]);
      saveCanvasStateRef.current?.();
    });

    canvas.on('selection:cleared', () => {
      setIsDraggingObject(false);
      setSnapGuides([]);
    });

    canvas.on('mouse:up', () => {
      // Quand on relâche la souris, arrêter l'affichage des guides
      setIsDraggingObject(false);
      setSnapGuides([]);
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
      // Ne pas intercepter si l'utilisateur est en train de taper dans un input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas.getActiveObject()) {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          // Ne pas supprimer l'objet si c'est un Textbox en mode édition
          if (activeObject.type === 'textbox') {
            const textbox = activeObject as Textbox;
            // Vérifier si le Textbox est en mode édition (isEditing)
            // Dans Fabric.js, quand on édite un Textbox, isEditing est true
            if ((textbox as any).isEditing || (textbox as any).editing) {
              // Laisser Fabric.js gérer la suppression de caractère
              return;
            }
            // Vérifier aussi si le Textbox a le focus (hiddenTextarea)
            if ((canvas as any).hiddenTextarea && (canvas as any).hiddenTextarea === document.activeElement) {
              return;
            }
          }
          
          // Supprimer aussi le rectangle de bordure s'il existe
          const borderRect = (activeObject as any).borderRect;
          if (borderRect) {
            canvas.remove(borderRect);
          }
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
    
    // Écouter les modifications de texte pour sauvegarder
    canvas.on('text:changed', handleObjectModified);
    canvas.on('text:editing:exited', handleObjectModified);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', handleObjectRemoved);
      canvas.off('text:changed', handleObjectModified);
      canvas.off('text:editing:exited', handleObjectModified);
      canvas.dispose();
    };
  }, []); // Ne pas réinitialiser le canvas à chaque changement de data

  // Charger le canvasState quand il est disponible (après l'initialisation du canvas)
  useEffect(() => {
    if (!fabricCanvasRef.current || !data?.canvasState) return;
    
    const canvas = fabricCanvasRef.current;
    const canvasStateToLoad = typeof data.canvasState === 'string' 
      ? data.canvasState 
      : JSON.stringify(data.canvasState);
    
    // Ne pas recharger si c'est l'état qu'on vient de sauvegarder
    if (lastSavedCanvasStateRef.current === canvasStateToLoad) {
      console.log('Skipping reload - same as last saved state');
      return;
    }
    
    // Vérifier si le canvas est vide ou si le canvasState a changé
    const currentState = JSON.stringify(canvas.toJSON());
    
    // Ne charger que si le canvas est vide ou si l'état a changé
    if (canvas.getObjects().length === 0 || currentState !== canvasStateToLoad) {
      try {
        console.log('Loading canvas state from data (length:', canvasStateToLoad.length, ')');
        
        // Vider le canvas avant de charger le nouvel état
        canvas.clear();
        
        canvas.loadFromJSON(canvasStateToLoad, () => {
          console.log('Canvas state loaded successfully, objects:', canvas.getObjects().length);
          canvas.renderAll();
          
          // Restaurer les bordures pour chaque objet
          canvas.getObjects().forEach((obj) => {
            const borderWidth = (obj as any).borderWidth;
            const borderColor = (obj as any).borderColor;
            const borderStyle = (obj as any).borderStyle;
            
            if (borderWidth && borderWidth > 0 && borderColor) {
              updateBorderRect(obj, borderColor, borderWidth, borderStyle || 'solid');
            }
          });
          
          // Mettre à jour la référence pour éviter de recharger
          lastSavedCanvasStateRef.current = canvasStateToLoad;
        }, (error: any) => {
          console.error('Error loading canvas state:', error);
        });
      } catch (e) {
        console.error('Error parsing canvas state:', e);
      }
    }
  }, [data?.canvasState, updateBorderRect]);

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
    if (files.length === 0) return;
    
    // Vérifier que l'utilisateur est authentifié
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      toast({
        title: "Authentifizierung erforderlich",
        description: "Bitte melden Sie sich an, um Dateien hochzuladen.",
        variant: "destructive",
      });
      return;
    }
    
    // Utiliser l'utilisateur actuel
    const uploadUser = currentUser;
    if (!uploadUser?.id) return;

    // Séparer les fichiers par type
    const imageFiles: File[] = [];
    const videoFiles: File[] = [];
    const audioFiles: File[] = [];

    // Fonction helper pour détecter le type de fichier
    const getFileType = (file: File): 'image' | 'video' | 'audio' | 'unknown' => {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();
      
      // Vérifier d'abord par extension (plus fiable pour les fichiers audio)
      const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma', 'opus'];
      const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'];
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
      
      if (fileExt && audioExtensions.includes(fileExt)) {
        return 'audio';
      }
      if (fileExt && videoExtensions.includes(fileExt)) {
        return 'video';
      }
      if (fileExt && imageExtensions.includes(fileExt)) {
        return 'image';
      }
      
      // Fallback sur le type MIME
      if (mimeType.startsWith('image/')) {
        return 'image';
      }
      if (mimeType.startsWith('video/')) {
        // Certains fichiers audio peuvent avoir video/mpeg (MP3)
        if (fileExt === 'mp3' || mimeType === 'video/mpeg') {
          return 'audio';
        }
        return 'video';
      }
      if (mimeType.startsWith('audio/')) {
        return 'audio';
      }
      
      return 'unknown';
    };

    // Validation et tri
    for (const file of files) {
      const fileType = getFileType(file);
      
      if (fileType === 'image') {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Datei zu groß",
            description: `${file.name} ist zu groß. Maximale Größe: 10MB.`,
            variant: "destructive",
          });
          continue;
        }
        imageFiles.push(file);
      } else if (fileType === 'video') {
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Datei zu groß",
            description: `${file.name} ist zu groß. Maximale Größe: 50MB.`,
            variant: "destructive",
          });
          continue;
        }
        videoFiles.push(file);
      } else if (fileType === 'audio') {
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
        const fileName = `${uploadUser.id}/gallery/${Date.now()}-${Math.random()}.${fileExt}`;

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
        const fileName = `${uploadUser.id}/videos/${Date.now()}-${Math.random()}.${fileExt}`;

        const { data: uploadData, error } = await supabase.storage
          .from('dde_memorial_media')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('dde_memorial_media')
          .getPublicUrl(uploadData.path);

        return publicUrl;
      });

      // Upload des audios
      const audioPromises = audioFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uploadUser.id}/audios/${Date.now()}-${Math.random()}.${fileExt}`;

        const { data: uploadData, error } = await supabase.storage
          .from('dde_memorial_media')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('dde_memorial_media')
          .getPublicUrl(uploadData.path);

        return publicUrl;
      });

      const [newImageUrls, newVideoUrls, newAudioUrls] = await Promise.all([
        Promise.all(imagePromises),
        Promise.all(videoPromises),
        Promise.all(audioPromises),
      ]);

      // Mettre à jour les états locaux avec les nouveaux fichiers uploadés
      // Les fichiers sont déjà persistés dans Supabase Storage
      // L'utilisateur peut choisir quand sauvegarder l'éditeur
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
  }, [uploadedPhotos, uploadedVideos, uploadedAudios, onDataChange]);

  // Ajouter une image au canvas depuis la galerie (comme addText)
  const addImageToCanvas = useCallback((imageUrl: string) => {
    console.log('addImageToCanvas called with:', imageUrl);
    console.log('fabricCanvasRef.current:', fabricCanvasRef.current);
    console.log('canvasRef.current:', canvasRef.current);
    
    if (!fabricCanvasRef.current) {
      console.error('Canvas not initialized');
      toast({
        title: "Fehler",
        description: "Canvas ist noch nicht initialisiert. Bitte versuchen Sie es erneut.",
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
        title: "Fehler",
        description: "Bild konnte nicht geladen werden. Überprüfen Sie die URL oder CORS-Berechtigungen.",
        variant: "destructive",
      });
    });
    
    function handleImageLoaded(img: any) {
      if (!img || !fabricCanvasRef.current) {
        console.error('Failed to load image or canvas not available');
        toast({
          title: "Fehler",
          description: "Bild konnte nicht geladen werden.",
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
      // Supprimer aussi le rectangle de bordure s'il existe
      const borderRect = (activeObject as any).borderRect;
      if (borderRect) {
        fabricCanvasRef.current.remove(borderRect);
      }
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
    if (!fabricCanvasRef.current) {
      toast({
        title: "Fehler",
        description: "Canvas ist nicht verfügbar.",
        variant: "destructive",
      });
      return;
    }
    
    // Générer l'image de prévisualisation
    try {
      const canvas = fabricCanvasRef.current;
      canvas.renderAll(); // S'assurer que le canvas est rendu
      
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });
      
      if (dataURL && dataURL !== 'data:,') {
        setPreviewImageUrl(dataURL);
        setShowPreview(true);
      } else {
        toast({
          title: "Hinweis",
          description: "Der Canvas ist leer. Bitte fügen Sie zuerst Elemente hinzu.",
        });
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Fehler",
        description: "Die Vorschau konnte nicht generiert werden.",
        variant: "destructive",
      });
    }
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

  // Télécharger le canvas comme image professionnelle avec background
  const handleDownload = useCallback(() => {
    if (!fabricCanvasRef.current) {
      toast({
        title: "Fehler",
        description: "Canvas ist nicht verfügbar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = fabricCanvasRef.current;
      
      // S'assurer que le canvas est rendu avant l'export
      canvas.renderAll();
      
      // Créer un canvas temporaire avec une résolution élevée pour qualité professionnelle
      const multiplier = 3; // 3x pour qualité professionnelle (3840x2160)
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width! * multiplier;
      tempCanvas.height = canvas.height! * multiplier;
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context nicht verfügbar');
      }
      
      // Remplir avec le background du canvas (toujours blanc par défaut)
      const bgColor = canvas.backgroundColor;
      if (bgColor) {
        if (typeof bgColor === 'string') {
          ctx.fillStyle = bgColor;
        } else if (typeof bgColor === 'object' && 'source' in bgColor) {
          // Si c'est un pattern ou gradient, utiliser blanc par défaut
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = '#ffffff';
        }
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Exporter le canvas Fabric.js avec le background
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: multiplier,
        enableRetinaScaling: true,
        withoutTransform: false,
        withoutShadow: false,
      });
      
      // Charger l'image et la dessiner sur le canvas temporaire
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Dessiner l'image sur le canvas temporaire
        ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // Télécharger l'image finale en haute qualité
        const finalDataURL = tempCanvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `gedenkseite-${Date.now()}.png`;
        link.href = finalDataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Erfolgreich",
          description: "Die Gedenkseite wurde in professioneller Qualität (3x) mit Hintergrund heruntergeladen.",
        });
      };
      
      img.onerror = () => {
        // Fallback: utiliser l'export direct du canvas
        const fallbackDataURL = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: multiplier,
        });
        
        const link = document.createElement('a');
        link.download = `gedenkseite-${Date.now()}.png`;
        link.href = fallbackDataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Erfolgreich",
          description: "Die Gedenkseite wurde heruntergeladen.",
        });
      };
      
      img.src = dataURL;
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Fehler",
        description: "Die Datei konnte nicht heruntergeladen werden.",
        variant: "destructive",
      });
    }
  }, []);

  // Partager la page
  const handleShare = useCallback(async () => {
    // Si on n'a pas d'ID, afficher un message pour sauvegarder d'abord
    if (!memorialId) {
      toast({
        title: "Bitte zuerst speichern",
        description: "Bitte speichern Sie die Gedenkseite zuerst, bevor Sie sie teilen können.",
        variant: "destructive",
      });
      return;
    }
    
    // URL de la page de partage dédiée (sans éditeur)
    const shareUrl = `${window.location.origin}/gedenkseite/share/${memorialId}`;
    
    // Vérifier si l'API Web Share est disponible
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gedenkseite',
          text: 'Teilen Sie diese Gedenkseite',
          url: shareUrl,
        });
        toast({
          title: "Geteilt",
          description: "Die Seite wurde erfolgreich geteilt.",
        });
      } catch (error: any) {
        // L'utilisateur a annulé le partage
        if (error.name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      // Fallback: copier le lien dans le presse-papiers
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link kopiert",
          description: "Der Link wurde in die Zwischenablage kopiert. Sie können ihn jetzt teilen.",
        });
      } catch (error) {
        console.error('Copy error:', error);
        toast({
          title: "Fehler",
          description: "Der Link konnte nicht kopiert werden.",
          variant: "destructive",
        });
      }
    }
  }, [memorialId]);

  // Exposer les fonctions via les callbacks (dans un useEffect pour éviter les mises à jour pendant le rendu)
  useEffect(() => {
    if (onPreview && handlePreview) {
      onPreview(handlePreview);
    }
  }, [onPreview, handlePreview]);

  useEffect(() => {
    if (onDownload && handleDownload) {
      onDownload(handleDownload);
    }
  }, [onDownload, handleDownload]);

  useEffect(() => {
    if (onShare && handleShare) {
      onShare(handleShare);
    }
  }, [onShare, handleShare]);

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
          title: "Fehler",
          description: "Video konnte nicht geladen werden.",
          variant: "destructive",
        });
      });
    });

    videoElement.load();
  }, []);

  // Ajouter un audio au canvas
  const addAudioToCanvas = useCallback((audioUrl: string) => {
    console.log('addAudioToCanvas called with:', audioUrl);
    if (!fabricCanvasRef.current) {
      console.error('Canvas not initialized');
      toast({
        title: "Fehler",
        description: "Canvas ist noch nicht initialisiert.",
        variant: "destructive",
      });
      return;
    }
    
    const canvas = fabricCanvasRef.current;
    const canvasWidth = 1280;
    const canvasHeight = 720;
    
    // Créer un rectangle pour représenter l'audio
    const audioRect = new Rect({
      left: (canvasWidth - 200) / 2,
      top: (canvasHeight - 100) / 2,
      width: 200,
      height: 100,
      fill: '#f3f4f6',
      stroke: '#9333ea',
      strokeWidth: 3,
      rx: 8,
      ry: 8,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    });
    
    // Stocker l'URL de l'audio dans le rectangle
    (audioRect as any).audioUrl = audioUrl;
    (audioRect as any).type = 'audio';
    
    // Créer un texte avec l'icône audio pour afficher sur le rectangle
    const audioText = new Textbox('🎵 Audio', {
      left: (canvasWidth - 200) / 2 + 100,
      top: (canvasHeight - 100) / 2 + 50,
      width: 180,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#9333ea',
      fontWeight: 'bold',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
    });
    
    // Stocker l'URL de l'audio dans le texte aussi
    (audioText as any).audioUrl = audioUrl;
    (audioText as any).type = 'audio';
    
    console.log('Adding audio objects to canvas');
    // Ajouter les deux objets au canvas
    canvas.add(audioRect);
    canvas.add(audioText);
    
    // Mettre le rectangle en arrière-plan
    canvas.sendToBack(audioRect);
    
    // Permettre de double-cliquer sur l'un ou l'autre pour écouter
    const playAudio = () => {
      console.log('Playing audio:', audioUrl);
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        toast({
          title: "Fehler",
          description: "Audio konnte nicht abgespielt werden.",
          variant: "destructive",
        });
      });
    };
    
    audioRect.on('mousedblclick', playAudio);
    audioText.on('mousedblclick', playAudio);
    
    // Sélectionner le rectangle par défaut
    canvas.setActiveObject(audioRect);
    canvas.renderAll();
    
    console.log('Audio objects added, canvas rendered');
    
    requestAnimationFrame(() => {
      if (fabricCanvasRef.current && saveCanvasStateRef.current) {
        saveCanvasStateRef.current();
      }
    });
  }, []);

  // Ajouter une icône au canvas (comme emoji)
  const addIconToCanvas = useCallback((iconName: string) => {
    if (!fabricCanvasRef.current) return;
    
    const emojiMap: Record<string, string> = {
      'Herz': '❤️',
      'Blume': '🌸',
      'Kreuz': '✝️',
      'Stern': '⭐',
      'Funkeln': '✨',
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
                  value="uploads" 
                  className="flex-1 text-[10px] px-0.5 truncate data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-semibold transition-colors"
                >
                  <Upload className="w-3 h-3 mr-0.5 flex-shrink-0" />
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

                  {/* Uploads tab with sub-tabs */}
                  <TabsContent value="uploads" className="space-y-2 mt-0">
                    <Tabs defaultValue="images" className="w-full">
                      <TabsList className="w-full grid grid-cols-3 mb-4 bg-gray-100">
                        <TabsTrigger 
                          value="images" 
                          className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Bilder
                        </TabsTrigger>
                        <TabsTrigger 
                          value="videos" 
                          className="text-xs data-[state=active]:bg-white data-[state=active]:text-red-600"
                        >
                          <Video className="w-3 h-3 mr-1" />
                          Videos
                        </TabsTrigger>
                        <TabsTrigger 
                          value="audio" 
                          className="text-xs data-[state=active]:bg-white data-[state=active]:text-purple-600"
                        >
                          <Music className="w-3 h-3 mr-1" />
                          Audio
                        </TabsTrigger>
                      </TabsList>

                      {/* Images sub-tab */}
                      <TabsContent value="images" className="space-y-2 mt-0">
                        {/* Upload button pour images */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="block">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleFileUpload}
                                  disabled={isUploading}
                                  className="hidden"
                                  id="canva-upload-images"
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
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                                        Hochladen...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        <span className="truncate">Images hochladen</span>
                                      </>
                                    )}
                                  </span>
                                </Button>
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Images hochladen</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Gallery des images uploadées */}
                        {uploadedPhotos.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 mt-4">
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
                                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <ImageIcon className="w-2.5 h-2.5" />
                                    <span>Bild</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>Keine Bilder hochgeladen</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Videos sub-tab */}
                      <TabsContent value="videos" className="space-y-2 mt-0">
                        {/* Upload button pour vidéos */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="block">
                                <input
                                  type="file"
                                  accept="video/*"
                                  multiple
                                  onChange={handleFileUpload}
                                  disabled={isUploading}
                                  className="hidden"
                                  id="canva-upload-videos"
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
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                                        Hochladen...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        <span className="truncate">Vidéos hochladen</span>
                                      </>
                                    )}
                                  </span>
                                </Button>
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Vidéos hochladen</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Gallery des vidéos uploadées */}
                        {uploadedVideos.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 mt-4">
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
                                  className="aspect-square rounded-lg overflow-hidden border-2 border-gray-300 hover:border-red-500 transition-colors cursor-pointer relative group bg-gray-100"
                                >
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Video className="w-8 h-8 text-gray-400 group-hover:text-red-500 transition-colors" />
                                  </div>
                                  <div className="absolute bottom-1 left-1 right-1">
                                    <p className="text-xs text-white bg-black/50 px-1 py-0.5 rounded truncate">
                                      Video {index + 1}
                                    </p>
                                  </div>
                                  <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Video className="w-2.5 h-2.5" />
                                    <span>Video</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            <Video className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>Keine Videos hochgeladen</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Audio sub-tab */}
                      <TabsContent value="audio" className="space-y-2 mt-0">
                        {/* Upload button pour audio */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="block">
                                <input
                                  type="file"
                                  accept="audio/*"
                                  multiple
                                  onChange={handleFileUpload}
                                  disabled={isUploading}
                                  className="hidden"
                                  id="canva-upload-audio"
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
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                                        Hochladen...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        <span className="truncate">Audio hochladen</span>
                                      </>
                                    )}
                                  </span>
                                </Button>
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Audio hochladen</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Gallery des audios uploadés */}
                        {uploadedAudios.length > 0 ? (
                          <div className="space-y-2 mt-4">
                            {uploadedAudios.map((audio: string | any, index: number) => {
                              const src = typeof audio === 'string' ? audio : audio.src || audio;
                              const fileName = typeof audio === 'string' 
                                ? audio.split('/').pop()?.split('?')[0] || `Audio ${index + 1}`
                                : audio.name || `Audio ${index + 1}`;
                              
                              // Extraire le nom du fichier sans extension pour le titre
                              const title = fileName.replace(/\.[^/.]+$/, '');
                              
                              return (
                                <div
                                  key={`audio-${index}`}
                                  className="group relative bg-white border border-gray-200 hover:border-purple-500 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <div className="flex items-center gap-3 p-3">
                                    {/* Miniature circulaire avec bouton play */}
                                    <div className="relative w-14 h-14 flex-shrink-0">
                                      <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
                                        <Music className="w-7 h-7 text-white" />
                                      </div>
                                      {/* Bouton play overlay */}
                                      <button
                                        type="button"
                                        className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const audioElement = document.querySelector(`#audio-player-${index}`) as HTMLAudioElement;
                                          if (audioElement) {
                                            if (audioElement.paused) {
                                              audioElement.play();
                                            } else {
                                              audioElement.pause();
                                            }
                                          }
                                        }}
                                      >
                                        <Play className="w-5 h-5 text-white ml-0.5" />
                                      </button>
                                    </div>

                                    {/* Informations de la piste */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 truncate mb-0.5">
                                        {title}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate mb-1">
                                        Audio-Datei
                                      </p>
                                      {/* Player audio compact */}
                                      <audio
                                        id={`audio-player-${index}`}
                                        className="w-full h-6"
                                        src={src}
                                        preload="metadata"
                                        onError={(e) => {
                                          console.error('Error loading audio:', src, e);
                                        }}
                                        onLoadedMetadata={(e) => {
                                          const audioEl = e.target as HTMLAudioElement;
                                          const duration = audioEl.duration;
                                          const minutes = Math.floor(duration / 60);
                                          const seconds = Math.floor(duration % 60);
                                          const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                          const durationEl = document.querySelector(`#audio-duration-${index}`);
                                          if (durationEl) {
                                            durationEl.textContent = durationText;
                                          }
                                        }}
                                      >
                                        Ihr Browser unterstützt das Audio-Element nicht.
                                      </audio>
                                    </div>

                                    {/* Bouton d'action - Add */}
                                    <div className="flex flex-col gap-1 flex-shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          addAudioToCanvas(src);
                                          toast({
                                            title: "Audio hinzugefügt",
                                            description: "Das Audio wurde zum Canvas hinzugefügt.",
                                          });
                                        }}
                                        title="Zum Canvas hinzufügen"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                      <span 
                                        id={`audio-duration-${index}`}
                                        className="text-xs text-gray-400 text-center"
                                      >
                                        --
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            <Music className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>Keine Audiodateien hochgeladen</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
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
                        <p className="text-sm">Keine Symbole verfügbar</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Icons tab */}
                  <TabsContent value="icons" className="mt-0">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'icon-heart', name: 'Herz', icon: Heart },
                        { id: 'icon-flower', name: 'Blume', icon: Flower2 },
                        { id: 'icon-cross', name: 'Kreuz', icon: Cross },
                        { id: 'icon-star', name: 'Stern', icon: Star },
                        { id: 'icon-sparkles', name: 'Funkeln', icon: Sparkles },
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
        {/* Toolbar - Design moderne style Canva - Fixe en haut */}
        <div className="bg-[#2d2d2d] border-b border-gray-700 px-4 py-3 flex items-center justify-center gap-3 relative flex-shrink-0 min-h-[56px] shadow-lg sticky top-0" style={{ zIndex: 1000 }}>
          {selectedObject && selectedObject.type === 'textbox' && (
            <WysiwygToolbar
                bold={(selectedObject as Textbox).fontWeight === 'bold' || (selectedObject as Textbox).fontWeight === 700}
                italic={(selectedObject as Textbox).fontStyle === 'italic'}
                underline={(selectedObject as Textbox).textDecoration === 'underline'}
                alignment={(selectedObject as Textbox).textAlign as 'left' | 'center' | 'right' || 'left'}
                fontSize={(selectedObject as Textbox).fontSize || 16}
                fontFamily={(selectedObject as Textbox).fontFamily || 'Arial'}
                color={(selectedObject as Textbox).fill as string || '#000000'}
                onBold={() => {
                  if (fabricCanvasRef.current && selectedObject) {
                    const textbox = selectedObject as Textbox;
                    textbox.set('fontWeight', textbox.fontWeight === 'bold' || textbox.fontWeight === 700 ? 'normal' : 'bold');
                    fabricCanvasRef.current.renderAll();
                    saveCanvasStateRef.current?.();
                  }
                }}
                onItalic={() => {
                  if (fabricCanvasRef.current && selectedObject) {
                    const textbox = selectedObject as Textbox;
                    textbox.set('fontStyle', textbox.fontStyle === 'italic' ? 'normal' : 'italic');
                    fabricCanvasRef.current.renderAll();
                    saveCanvasStateRef.current?.();
                  }
                }}
                onUnderline={() => {
                  if (fabricCanvasRef.current && selectedObject) {
                    const textbox = selectedObject as Textbox;
                    textbox.set('textDecoration', textbox.textDecoration === 'underline' ? '' : 'underline');
                    fabricCanvasRef.current.renderAll();
                    saveCanvasStateRef.current?.();
                  }
                }}
                onAlignment={(align) => {
                  if (fabricCanvasRef.current && selectedObject) {
                    const textbox = selectedObject as Textbox;
                    textbox.set('textAlign', align);
                    fabricCanvasRef.current.renderAll();
                    saveCanvasStateRef.current?.();
                  }
                }}
                onFontSize={(size) => {
                  if (fabricCanvasRef.current && selectedObject) {
                    const textbox = selectedObject as Textbox;
                    textbox.set('fontSize', size);
                    fabricCanvasRef.current.renderAll();
                    saveCanvasStateRef.current?.();
                  }
                }}
                onFontFamily={(family) => {
                  if (fabricCanvasRef.current && selectedObject) {
                    const textbox = selectedObject as Textbox;
                    textbox.set('fontFamily', family);
                    fabricCanvasRef.current.renderAll();
                    saveCanvasStateRef.current?.();
                  }
                }}
                onColor={(color) => {
                  if (fabricCanvasRef.current && selectedObject) {
                    const textbox = selectedObject as Textbox;
                    textbox.set('fill', color);
                    fabricCanvasRef.current.renderAll();
                    saveCanvasStateRef.current?.();
                  }
                }}
                showAdvanced={true}
              />
          )}
          
          {/* Bordure pour tous les éléments - Visible seulement si un élément est sélectionné */}
          {selectedObject && (
            <div className="border-l border-gray-600 pl-3 ml-3">
              <ElementBorderTool
                strokeColor={((selectedObject as any)?.borderColor as string) || '#000000'}
                strokeWidth={((selectedObject as any)?.borderWidth as number) || 0}
                strokeStyle={((selectedObject as any)?.borderStyle as 'solid' | 'dashed') || 'solid'}
                onStrokeColor={(color) => {
                  if (fabricCanvasRef.current && selectedObject) {
                    const borderWidth = ((selectedObject as any).borderWidth as number) || 0;
                    const borderStyle = ((selectedObject as any).borderStyle as 'solid' | 'dashed') || 'solid';
                    updateBorderRect(selectedObject, color, borderWidth, borderStyle);
                    saveCanvasStateRef.current?.();
                  }
                }}
                onStrokeWidth={(width) => {
                  if (fabricCanvasRef.current && selectedObject) {
                    const borderColor = ((selectedObject as any).borderColor as string) || '#000000';
                    const borderStyle = ((selectedObject as any).borderStyle as 'solid' | 'dashed') || 'solid';
                    updateBorderRect(selectedObject, borderColor, width, borderStyle);
                    saveCanvasStateRef.current?.();
                  }
                }}
                onStrokeStyle={(style) => {
                  if (fabricCanvasRef.current && selectedObject) {
                    const borderColor = ((selectedObject as any).borderColor as string) || '#000000';
                    const borderWidth = ((selectedObject as any).borderWidth as number) || 0;
                    // Mettre à jour le style dans l'objet
                    (selectedObject as any).borderStyle = style;
                    // Recréer le rectangle avec le nouveau style
                    updateBorderRect(selectedObject, borderColor, borderWidth, style);
                    saveCanvasStateRef.current?.();
                  }
                }}
                onRemoveBorder={() => {
                  if (fabricCanvasRef.current && selectedObject) {
                    updateBorderRect(selectedObject, '#000000', 0, 'solid');
                    saveCanvasStateRef.current?.();
                  }
                }}
              />
            </div>
          )}
          
          {/* Contrôle d'opacité pour tous les éléments */}
          {selectedObject && (
            <div className="border-l border-gray-600 pl-3 ml-3">
              <OpacityTool
                opacity={Math.round((selectedObject.opacity || 1) * 100)}
                onOpacityChange={(opacity) => {
                  if (fabricCanvasRef.current && selectedObject) {
                    // Convertir le pourcentage en valeur 0-1 pour Fabric.js
                    selectedObject.set('opacity', opacity / 100);
                    fabricCanvasRef.current.renderAll();
                    saveCanvasStateRef.current?.();
                  }
                }}
              />
            </div>
          )}
          
          {selectedObject && (
            <>
              <div className="border-l border-gray-600 ml-3 h-6" />
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteSelected}
                className="text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
                title="Löschen"
              >
                <X className="w-5 h-5" />
              </Button>
            </>
          )}
          {!selectedObject && (
            <>
              {/* Sélecteur d'audios pour l'éditeur */}
              {uploadedAudios.length > 0 && (
                <Popover open={showAudioSelector} onOpenChange={setShowAudioSelector}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      title="Audios für Editor auswählen"
                    >
                      <Music className="w-5 h-5 mr-2" />
                      <span className="text-sm">
                        Audios ({selectedAudiosForEditor.length}/{uploadedAudios.length})
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 p-4 bg-[#2d2d2d] border-gray-600" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white">Audios für Editor auswählen</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (selectedAudiosForEditor.length === uploadedAudios.length) {
                              setSelectedAudiosForEditor([]);
                            } else {
                              setSelectedAudiosForEditor([...uploadedAudios]);
                            }
                          }}
                          className="text-xs text-gray-300 hover:text-white h-6"
                        >
                          {selectedAudiosForEditor.length === uploadedAudios.length ? 'Alle abwählen' : 'Alle auswählen'}
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {uploadedAudios.map((audio: string | any, index: number) => {
                          const src = typeof audio === 'string' ? audio : audio.src || audio;
                          const fileName = typeof audio === 'string' 
                            ? audio.split('/').pop()?.split('?')[0] || `Audio ${index + 1}`
                            : audio.name || `Audio ${index + 1}`;
                          const title = fileName.replace(/\.[^/.]+$/, '');
                          const isSelected = selectedAudiosForEditor.includes(src);
                          
                          return (
                            <div
                              key={`audio-selector-${index}`}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer",
                                isSelected
                                  ? "bg-purple-600/20 border-purple-500"
                                  : "bg-gray-800 border-gray-700 hover:border-gray-600"
                              )}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAudiosForEditor(selectedAudiosForEditor.filter(a => a !== src));
                                } else {
                                  setSelectedAudiosForEditor([...selectedAudiosForEditor, src]);
                                }
                              }}
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                                <Music className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{title}</p>
                                <p className="text-xs text-gray-400 truncate">Audio-Datei</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-gray-400 hover:text-purple-400 hover:bg-purple-600/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addAudioToCanvas(src);
                                    toast({
                                      title: "Audio hinzugefügt",
                                      description: "Das Audio wurde zum Canvas hinzugefügt.",
                                    });
                                  }}
                                  title="Zum Canvas hinzufügen"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {selectedAudiosForEditor.length > 0 && (
                        <div className="pt-3 border-t border-gray-700">
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => {
                              selectedAudiosForEditor.forEach(audioUrl => {
                                addAudioToCanvas(audioUrl);
                              });
                              toast({
                                title: "Audios hinzugefügt",
                                description: `${selectedAudiosForEditor.length} Audio(s) wurden zum Canvas hinzugefügt.`,
                              });
                              setShowAudioSelector(false);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {selectedAudiosForEditor.length} Audio(s) zum Canvas hinzufügen
                          </Button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <div className="text-sm text-gray-400 px-4 flex items-center gap-2">
                <Circle className="w-4 h-4 opacity-50" />
                <span>Wählen Sie ein Element aus, um es zu bearbeiten</span>
              </div>
            </>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-8 min-h-0 min-w-0" style={{ zIndex: 1 }}>
          <Card className="shadow-lg border-2 border-gray-200 relative" style={{ maxWidth: '100%', maxHeight: '100%' }}>
            <div className="bg-white relative" style={{ width: '1280px', height: '720px', position: 'relative' }}>
              <canvas ref={canvasRef} style={{ position: 'relative', zIndex: 1 }} />
              {snapGuides.length > 0 && isDraggingObject && (
                <div 
                  className="absolute pointer-events-none" 
                  style={{ 
                    top: 0,
                    left: 0,
                    width: '1280px',
                    height: '720px',
                    zIndex: 10000,
                    pointerEvents: 'none',
                  }}
                >
                  {snapGuides.map((guide, index) => {
                    if (guide.type === 'horizontal') {
                      return (
                        <div
                          key={`guide-h-${index}`}
                          style={{
                            position: 'absolute',
                            left: `${Math.max(0, guide.start)}px`,
                            top: `${guide.position}px`,
                            width: `${Math.max(0, guide.end - guide.start)}px`,
                            height: '1px',
                            backgroundColor: '#3b82f6',
                            opacity: 0.8,
                            zIndex: 10001,
                            boxShadow: '0 0 2px rgba(59, 130, 246, 0.8)',
                            transform: 'translateZ(0)',
                          }}
                        />
                      );
                    } else {
                      return (
                        <div
                          key={`guide-v-${index}`}
                          style={{
                            position: 'absolute',
                            left: `${guide.position}px`,
                            top: `${Math.max(0, guide.start)}px`,
                            width: '1px',
                            height: `${Math.max(0, guide.end - guide.start)}px`,
                            backgroundColor: '#3b82f6',
                            opacity: 0.8,
                            zIndex: 10001,
                            boxShadow: '0 0 2px rgba(59, 130, 246, 0.8)',
                            transform: 'translateZ(0)',
                          }}
                        />
                      );
                    }
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Audio Timeline - Unterhalb des Editors */}
        {uploadedAudios.length > 0 && (
          <div className="bg-[#1a1a1a] border-t border-gray-700 px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <Music className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Audio-Timeline</h3>
              <span className="text-xs text-gray-500">({uploadedAudios.length} {uploadedAudios.length === 1 ? 'Datei' : 'Dateien'})</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {uploadedAudios.map((audio: string | any, index: number) => {
                const src = typeof audio === 'string' ? audio : audio.src || audio;
                const fileName = typeof audio === 'string' 
                  ? audio.split('/').pop()?.split('?')[0] || `Audio ${index + 1}`
                  : audio.name || `Audio ${index + 1}`;
                return (
                  <div
                    key={`timeline-audio-${index}`}
                    className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedAudios = uploadedAudios.filter((_, i) => i !== index);
                        setUploadedAudios(updatedAudios);
                        onDataChange({ audioGallery: updatedAudios });
                        // Note: La suppression de l'URL de la liste ne supprime pas le fichier du storage
                        // L'utilisateur peut choisir quand sauvegarder l'éditeur
                      }}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-900/20 flex-shrink-0"
                      title="Audio entfernen"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer - Contrôles de zoom uniquement */}
        <div className="bg-gray-100 border-t border-gray-300 p-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Seiten</span>
            <span className="text-sm text-gray-700">1/1</span>
          </div>

          <div className="flex items-center gap-4">
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
      <style>{`
        [data-radix-dialog-overlay][data-state="open"] {
          z-index: 9998 !important;
        }
        [data-radix-dialog-content][data-state="open"] {
          z-index: 9999 !important;
        }
      `}</style>
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto !z-[9999]" style={{ zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle>Vorschau</DialogTitle>
            <DialogDescription>
              Vorschau der Gedenkseite
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg min-h-[400px]">
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt="Vorschau"
                className="max-w-full max-h-[70vh] object-contain shadow-lg rounded"
                onError={() => {
                  setPreviewImageUrl('');
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <p className="text-lg mb-2">Keine Vorschau verfügbar</p>
                <p className="text-sm">Der Canvas ist leer oder die Vorschau konnte nicht generiert werden.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

