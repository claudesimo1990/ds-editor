import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Canvas as FabricCanvas, 
  Textbox, 
  Rect, 
  Circle, 
  Triangle,
  FabricImage,
  FabricObject
} from 'fabric';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Type, 
  Image as ImageIcon, 
  Video, 
  Shapes,
  Undo,
  Redo,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Grid,
  Download,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageGallery } from './ImageGallery';
import { VideoGallery } from './VideoGallery';
import { SimpleIconGallery } from './SimpleIconGallery';

interface FabricMemorialEditorProps {
  data: any;
  styles: Record<string, any>;
  onDataChange: (data: any) => void;
  onStylesChange: (styles: Record<string, any>) => void;
}

export const FabricMemorialEditor: React.FC<FabricMemorialEditorProps> = ({
  data,
  styles,
  onDataChange,
  onStylesChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const historyRef = useRef<any[]>([]);
  const historyIndexRef = useRef<number>(-1);

  // Initialiser le canvas Fabric.js
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1280,
      height: 720,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Écouter les événements de sélection
    canvas.on('selection:created', (e) => {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject);
    });

    canvas.on('selection:updated', (e) => {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    canvas.on('object:selected', (e) => {
      setSelectedObject(e.target || null);
    });

    // Sauvegarder dans l'historique lors des modifications
    canvas.on('object:modified', () => {
      saveToHistory();
    });

    // Nettoyer
    return () => {
      canvas.dispose();
    };
  }, []);

  // Sauvegarder l'état dans l'historique
  const saveToHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(JSON.parse(json));
    historyIndexRef.current = historyRef.current.length - 1;
    
    // Limiter l'historique à 50 états
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  }, []);

  // Ajouter du texte (comme dans l'ancien éditeur)
  const addText = useCallback((type: 'headline' | 'text' = 'text', placeholder: string = 'Double-cliquez pour éditer', fontSize: number = 16) => {
    if (!fabricCanvasRef.current) return;

    const fontWeight = type === 'headline' ? 'bold' : 'normal';
    const width = type === 'headline' ? 500 : 300;

    const text = new Textbox(placeholder, {
      left: 100,
      top: 100,
      width: width,
      fontSize: fontSize,
      fontFamily: 'Arial',
      fontWeight: fontWeight,
      fill: '#000000',
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  // Ajouter une image
  const addImage = useCallback((imageUrl: string) => {
    if (!fabricCanvasRef.current) return;

    FabricImage.fromURL(imageUrl, (img) => {
      // Ajuster la taille pour qu'elle rentre dans le canvas
      const maxWidth = 300;
      const maxHeight = 300;
      const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1), 1);
      
      img.set({
        left: 200,
        top: 200,
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
      });
      fabricCanvasRef.current?.add(img);
      fabricCanvasRef.current?.setActiveObject(img);
      fabricCanvasRef.current?.renderAll();
      saveToHistory();
    }, { crossOrigin: 'anonymous' });
  }, [saveToHistory]);

  // Ajouter une vidéo
  const addVideo = useCallback((videoUrl: string) => {
    if (!fabricCanvasRef.current) return;

    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.crossOrigin = 'anonymous';
    videoElement.muted = true;
    videoElement.loop = true;
    videoElement.autoplay = true;
    videoElement.playsInline = true;

    videoElement.addEventListener('loadedmetadata', () => {
      const fabricVideo = new FabricImage(videoElement, {
        left: 200,
        top: 200,
        scaleX: 0.5,
        scaleY: 0.5,
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
      });
      
      fabricCanvasRef.current?.add(fabricVideo);
      fabricCanvasRef.current?.setActiveObject(fabricVideo);
      fabricCanvasRef.current?.renderAll();
      saveToHistory();
    });

    videoElement.load();
  }, [saveToHistory]);

  // Ajouter une icône (SVG ou emoji)
  const addIcon = useCallback((iconContent: string, iconType: 'emoji' | 'svg' = 'emoji') => {
    if (!fabricCanvasRef.current) return;

    if (iconType === 'emoji') {
      // Pour les emojis, on utilise du texte
      const text = new Textbox(iconContent, {
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
    } else {
      // Pour les SVG, on les charge comme image
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(iconContent)}`;
      FabricImage.fromURL(svgDataUrl, (img) => {
        img.set({
          left: 200,
          top: 200,
          scaleX: 0.5,
          scaleY: 0.5,
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
        });
        fabricCanvasRef.current?.add(img);
        fabricCanvasRef.current?.setActiveObject(img);
        fabricCanvasRef.current?.renderAll();
        saveToHistory();
      });
    }
    saveToHistory();
  }, [saveToHistory]);

  // Ajouter une forme (comme dans l'ancien éditeur)
  const addShape = useCallback((shapeType: 'rect' | 'circle' | 'triangle' | 'line') => {
    if (!fabricCanvasRef.current) return;

    let shape: FabricObject;

    const commonProps = {
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    };

    switch (shapeType) {
      case 'rect':
        shape = new Rect({
          left: 150,
          top: 150,
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
          ...commonProps,
        });
        break;
      case 'circle':
        shape = new Circle({
          left: 150,
          top: 150,
          radius: 50,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
          ...commonProps,
        });
        break;
      case 'triangle':
        shape = new Triangle({
          left: 150,
          top: 150,
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
          ...commonProps,
        });
        break;
      case 'line':
        // Pour les lignes, on utilise un rectangle très fin
        shape = new Rect({
          left: 150,
          top: 200,
          width: 100,
          height: 2,
          fill: '#000000',
          ...commonProps,
        });
        break;
    }

    fabricCanvasRef.current.add(shape);
    fabricCanvasRef.current.setActiveObject(shape);
    fabricCanvasRef.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  // Supprimer l'objet sélectionné
  const deleteSelected = useCallback(() => {
    if (!fabricCanvasRef.current || !selectedObject) return;

    fabricCanvasRef.current.remove(selectedObject);
    setSelectedObject(null);
    saveToHistory();
  }, [selectedObject, saveToHistory]);

  // Dupliquer l'objet sélectionné
  const duplicateSelected = useCallback(() => {
    if (!fabricCanvasRef.current || !selectedObject) return;

    selectedObject.clone((cloned: FabricObject) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      fabricCanvasRef.current?.add(cloned);
      fabricCanvasRef.current?.setActiveObject(cloned);
      saveToHistory();
    });
  }, [selectedObject, saveToHistory]);

  // Undo
  const handleUndo = useCallback(() => {
    if (!fabricCanvasRef.current || historyIndexRef.current <= 0) return;

    historyIndexRef.current--;
    const state = historyRef.current[historyIndexRef.current];
    fabricCanvasRef.current.loadFromJSON(state, () => {
      fabricCanvasRef.current?.renderAll();
    });
  }, []);

  // Redo
  const handleRedo = useCallback(() => {
    if (!fabricCanvasRef.current || historyIndexRef.current >= historyRef.current.length - 1) return;

    historyIndexRef.current++;
    const state = historyRef.current[historyIndexRef.current];
    fabricCanvasRef.current.loadFromJSON(state, () => {
      fabricCanvasRef.current?.renderAll();
    });
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

  // Télécharger l'image
  const handleDownload = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });

    const link = document.createElement('a');
    link.download = 'memorial-canvas.png';
    link.href = dataURL;
    link.click();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar gauche - Bibliothèque d'éléments */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Éléments</h2>
        </div>
        
        <ScrollArea className="flex-1">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-5 m-2">
              <TabsTrigger value="text" className="p-2">
                <Type className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="images" className="p-2">
                <ImageIcon className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="icons" className="p-2">
                <Sparkles className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="shapes" className="p-2">
                <Shapes className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="media" className="p-2">
                <Video className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="p-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addText('headline', 'Titre', 32)}
              >
                <Type className="w-4 h-4 mr-2" />
                Titre
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addText('text', 'Sous-titre', 24)}
              >
                <Type className="w-4 h-4 mr-2" />
                Sous-titre
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addText('text', 'Votre texte ici', 16)}
              >
                <Type className="w-4 h-4 mr-2" />
                Texte
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addText('text', 'Citation', 18)}
              >
                <Type className="w-4 h-4 mr-2" />
                Citation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addText('text', 'Légende', 14)}
              >
                <Type className="w-4 h-4 mr-2" />
                Légende
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addText('headline', 'En-tête', 28)}
              >
                <Type className="w-4 h-4 mr-2" />
                En-tête
              </Button>
            </TabsContent>

            <TabsContent value="images" className="p-4">
              <ImageGallery onImageSelect={addImage} photos={data?.mainPhotoGallery || []} />
            </TabsContent>

            <TabsContent value="icons" className="p-4">
              <SimpleIconGallery onIconSelect={addIcon} />
            </TabsContent>

            <TabsContent value="shapes" className="p-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addShape('rect')}
              >
                <Shapes className="w-4 h-4 mr-2" />
                Rectangle
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addShape('circle')}
              >
                <Shapes className="w-4 h-4 mr-2" />
                Cercle
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addShape('triangle')}
              >
                <Shapes className="w-4 h-4 mr-2" />
                Triangle
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addShape('line')}
              >
                <Shapes className="w-4 h-4 mr-2" />
                Ligne
              </Button>
            </TabsContent>

            <TabsContent value="media" className="p-4">
              <VideoGallery onVideoSelect={addVideo} />
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>

      {/* Zone principale - Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndexRef.current <= 0}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndexRef.current >= historyRef.current.length - 1}
          >
            <Redo className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={duplicateSelected}
            disabled={!selectedObject}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteSelected}
            disabled={!selectedObject}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(-10)}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm px-2">{zoom}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(10)}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className={cn("w-4 h-4", showGrid && "text-blue-500")} />
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-8">
          <Card className="shadow-lg">
            <canvas ref={canvasRef} />
          </Card>
        </div>
      </div>

      {/* Sidebar droite - Propriétés */}
      {selectedObject && (
        <div className="w-64 bg-white border-l border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Propriétés</h3>
          <div className="space-y-4">
            {/* Les propriétés seront ajoutées ici selon le type d'objet */}
            <p className="text-sm text-gray-500">
              {selectedObject.type} sélectionné
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

