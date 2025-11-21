import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDraggable, useDroppable } from '@dnd-kit/core';
// Note: CSS utility will be implemented manually if needed
import { AssetLibrary } from './AssetLibrary';
import { PropertiesPanel } from './PropertiesPanel';
import { EditorToolbar } from './EditorToolbar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Video as VideoIcon } from 'lucide-react';

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'icon' | 'shape';
  data: any;
  style: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    opacity?: number;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    alignment?: 'left' | 'center' | 'right';
    zIndex?: number;
  };
}

interface ProfessionalMemorialEditorProps {
  data: any;
  styles: Record<string, any>;
  onDataChange: (updates: Partial<any>) => void;
  onStylesChange: (field: string, key: string, value: any) => void;
}

const DraggableElement: React.FC<{
  element: CanvasElement;
  isSelected: boolean;
  isEditing?: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onTextChange?: (id: string, text: string) => void;
  onStartEdit?: (id: string) => void;
  onEndEdit?: () => void;
}> = ({ element, isSelected, isEditing = false, onSelect, onDoubleClick, onTextChange, onStartEdit, onEndEdit }) => {
  const [editText, setEditText] = useState(element.data.text || '');
  
  useEffect(() => {
    setEditText(element.data.text || '');
  }, [element.data.text]);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: element.id,
    data: {
      type: 'canvas-element',
      element,
    },
    disabled: isEditing, // Désactiver le drag pendant l'édition
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  // Construire le style de manière plus claire
  const baseTransform = element.style.rotation 
    ? `rotate(${element.style.rotation}deg)` 
    : '';
  
  const dragTransform = style?.transform || '';
  
  const combinedTransform = [baseTransform, dragTransform]
    .filter(Boolean)
    .join(' ') || undefined;

  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.style.x}px`,
    top: `${element.style.y}px`,
    width: `${element.style.width}px`,
    height: `${element.style.height}px`,
    transform: combinedTransform,
    opacity: isDragging ? 0.3 : (element.style.opacity || 100) / 100,
    zIndex: isDragging ? 1000 : (element.style.zIndex || 10),
    transition: isDragging ? 'none' : 'opacity 0.2s ease',
    pointerEvents: isEditing ? 'auto' : 'auto',
    visibility: 'visible',
    overflow: 'visible',
    boxSizing: 'border-box',
  };

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        if (isEditing && isSelected) {
          return (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={() => {
                if (onEndEdit) onEndEdit();
                if (onTextChange) {
                  onTextChange(element.id, editText);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  if (onEndEdit) onEndEdit();
                  if (onTextChange && e.key === 'Enter') {
                    onTextChange(element.id, editText);
                  } else {
                    setEditText(element.data.text || '');
                  }
                }
              }}
              autoFocus
              style={{
                color: element.style.color || '#000000',
                fontSize: `${element.style.fontSize || 16}px`,
                fontFamily: element.style.fontFamily || 'Arial',
                fontWeight: element.style.bold ? 'bold' : 'normal',
                fontStyle: element.style.italic ? 'italic' : 'normal',
                textDecoration: element.style.underline ? 'underline' : 'none',
                textAlign: element.style.alignment || 'left',
                width: '100%',
                height: '100%',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                padding: '4px 8px',
                background: 'white',
                outline: 'none',
              }}
            />
          );
        }
        const textContent = element.data?.text || 'Texte';
        return (
          <div
            style={{
              position: 'relative',
              color: element.style.color || '#000000',
              fontSize: `${element.style.fontSize || 16}px`,
              fontFamily: element.style.fontFamily || 'Arial',
              fontWeight: element.style.bold ? 'bold' : 'normal',
              fontStyle: element.style.italic ? 'italic' : 'normal',
              textDecoration: element.style.underline ? 'underline' : 'none',
              textAlign: element.style.alignment || 'left',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.style.alignment === 'center' ? 'center' : 
                            element.style.alignment === 'right' ? 'flex-end' : 'flex-start',
              minHeight: '20px',
              wordWrap: 'break-word',
              overflow: 'visible',
              whiteSpace: 'pre-wrap',
              padding: '4px',
              boxSizing: 'border-box',
            }}
          >
            {textContent}
          </div>
        );
      case 'image':
        if (!element.data?.src) {
          return (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
              Image manquante
            </div>
          );
        }
        return (
          <img
            src={element.data?.src}
            alt={element.data?.name || 'Image'}
            className="w-full h-full object-contain"
            draggable={false}
            style={{
              position: 'relative',
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            onError={(e) => {
              console.error('Erreur de chargement d\'image:', element.data?.src);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">Image non trouvée</div>';
              }
            }}
          />
        );
      case 'video':
        return (
          <video
            src={element.data?.src}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
          />
        );
      case 'icon':
        return (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              position: 'relative',
              fontSize: `${Math.min(element.style.width || 80, element.style.height || 80) * 0.8}px`,
              lineHeight: '1',
              width: '100%',
              height: '100%',
            }}
          >
            {element.data?.icon || '?'}
          </div>
        );
      case 'shape':
        return (
          <div
            className="w-full h-full border-2 border-gray-600"
            style={{
              borderRadius: element.data.shape === 'circle' ? '50%' : 
                           element.data.shape === 'triangle' ? '0' : '4px',
              clipPath: element.data.shape === 'triangle' 
                ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
                : undefined,
            }}
          />
        );
      default:
        return null;
    }
  };


  return (
    <div
      ref={setNodeRef}
      style={elementStyle}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isEditing) {
          e.stopPropagation();
          onSelect();
        }
      }}
      onDoubleClick={(e) => {
        if (!isEditing && element.type === 'text' && onStartEdit) {
          e.stopPropagation();
          onStartEdit(element.id);
        }
        onDoubleClick();
      }}
      onWheel={(e) => {
        // Permettre le scroll de la page même sur les éléments
        if (!isDragging) {
          e.stopPropagation();
        }
      }}
      className={cn(
        'select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        isSelected && !isDragging && 'ring-2 ring-blue-500 ring-offset-2',
        isEditing && 'ring-2 ring-green-500 ring-offset-2'
      )}
      data-element-id={element.id}
      data-element-type={element.type}
      title={`${element.type} - (${element.style.x}, ${element.style.y})`}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {renderElement()}
      </div>
      {isSelected && (
        <>
          {/* Handles de redimensionnement */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize" 
               onMouseDown={(e) => {
                 e.stopPropagation();
                 // TODO: Implémenter le redimensionnement
               }} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-se-resize" />
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-n-resize" />
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-s-resize" />
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-w-resize" />
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-e-resize" />
        </>
      )}
    </div>
  );
};

const Canvas: React.FC<{
  elements: CanvasElement[];
  selectedElementId: string | null;
  editingElementId: string | null;
  onElementSelect: (id: string) => void;
  onElementDoubleClick: (id: string) => void;
  onStartEdit: (id: string) => void;
  onEndEdit: () => void;
  onTextChange: (id: string, text: string) => void;
  onElementsChange: (elements: CanvasElement[]) => void;
  backgroundImage?: string;
  backgroundVideo?: string;
  innerRef?: React.RefObject<HTMLDivElement>;
}> = ({ 
  elements, 
  selectedElementId, 
  editingElementId,
  onElementSelect, 
  onElementDoubleClick,
  onStartEdit,
  onEndEdit,
  onTextChange,
  onElementsChange,
  backgroundImage, 
  backgroundVideo, 
  innerRef 
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  // Combiner les refs
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (innerRef) {
      (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [setNodeRef, innerRef]);

  return (
    <div
      ref={combinedRef}
      className={cn(
        'relative w-full h-full bg-gray-100 dark:bg-gray-800',
        isOver && 'ring-2 ring-blue-400 ring-offset-2'
      )}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '1280px',
        height: '720px',
        position: 'relative',
        overflow: 'visible',
        minHeight: '720px',
      }}
      onClick={(e) => {
        // Ne pas désélectionner si on clique sur un élément enfant
        if (e.target === e.currentTarget) {
          onElementSelect('');
        }
      }}
    >
      {backgroundVideo && (
        <video
          src={backgroundVideo}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      {elements.length > 0 ? (
        elements.map((element) => {
          // Vérifier que l'élément a des propriétés valides
          if (!element || !element.id || !element.type) {
            console.warn('Élément invalide:', element);
            return null;
          }
          
          return (
            <DraggableElement
              key={element.id}
              element={element}
              isSelected={element.id === selectedElementId}
              isEditing={element.id === editingElementId}
              onSelect={() => onElementSelect(element.id)}
              onDoubleClick={() => onElementDoubleClick(element.id)}
              onStartEdit={(id) => onStartEdit(id)}
              onEndEdit={() => onEndEdit()}
              onTextChange={(id, text) => onTextChange(id, text)}
            />
          );
        })
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          Glissez des éléments ici depuis la bibliothèque
        </div>
      )}
    </div>
  );
};

export const ProfessionalMemorialEditor: React.FC<ProfessionalMemorialEditorProps> = ({
  data,
  styles,
  onDataChange,
  onStylesChange,
}) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Synchroniser les éléments avec les données parentes
  const syncToParentData = useCallback((elementsToSync: CanvasElement[]) => {
    // Convertir les éléments en format compatible avec les données
    const symbols: any[] = [];
    const texts: any = { ...data.texts };
    
    elementsToSync.forEach((el) => {
      if (el.type === 'image' && el.id.startsWith('symbol-')) {
        const index = parseInt(el.id.split('-')[1]);
        symbols[index] = {
          id: el.data.name || `symbol-${index}`,
          image: el.data.src,
          position: { x: el.style.x, y: el.style.y },
          width: el.style.width,
          height: el.style.height,
          opacity: el.style.opacity,
        };
      } else if (el.type === 'text' && el.id === 'text-main') {
        texts.mainText = el.data.text;
        onStylesChange('texts.mainText', 'fontSize', el.style.fontSize);
        onStylesChange('texts.mainText', 'color', el.style.color);
        onStylesChange('texts.mainText', 'fontFamily', el.style.fontFamily);
      }
    });

    if (symbols.length > 0) {
      onDataChange({ symbols });
    }
    if (texts.mainText !== data.texts?.mainText) {
      onDataChange({ texts });
    }
  }, [data, onDataChange, onStylesChange]);

  // Initialiser les éléments depuis les données
  useEffect(() => {
    // Ne réinitialiser que si on n'a pas d'éléments déjà chargés
    if (elements.length > 0) return;
    
    const initialElements: CanvasElement[] = [];
    
    // Ajouter les éléments existants
    if (data.texts?.mainText) {
      initialElements.push({
        id: 'text-main',
        type: 'text',
        data: { text: data.texts.mainText },
        style: {
          x: 50,
          y: 100,
          width: 300,
          height: 100,
          fontSize: 24,
          color: '#000000',
          fontFamily: 'Arial',
          zIndex: 10,
          ...styles['texts.mainText'],
        },
      });
    }

    if (data.symbols && Array.isArray(data.symbols)) {
      data.symbols.forEach((symbol: any, index: number) => {
        initialElements.push({
          id: `symbol-${index}`,
          type: 'image',
          data: { src: symbol.image, name: symbol.id },
          style: {
            x: symbol.position?.x || 50 + index * 50,
            y: symbol.position?.y || 50 + index * 50,
            width: symbol.width || 100,
            height: symbol.height || 100,
            opacity: symbol.opacity || 100,
            zIndex: 10 + index,
            ...styles[`symbol-${index}`],
          },
        });
      });
    }

    if (initialElements.length > 0) {
      setElements(initialElements);
      setHistory([initialElements]);
      setHistoryIndex(0);
    }
  }, [data, styles]);

  const [draggedElement, setDraggedElement] = useState<CanvasElement | null>(null);
  const [draggedAsset, setDraggedAsset] = useState<any | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Suivre la position de la souris en temps réel
  useEffect(() => {
    if (!activeId || !canvasRef.current) {
      setMousePosition(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const zoomFactor = zoom / 100;
        
        // Trouver le conteneur avec scroll
        const scrollContainer = document.querySelector('.overflow-auto');
        const scrollX = scrollContainer?.scrollLeft || 0;
        const scrollY = scrollContainer?.scrollTop || 0;
        
        // Calculer la position relative au canvas en tenant compte du scroll, padding et zoom
        const padding = 32; // padding du conteneur (p-8 = 32px)
        const x = (e.clientX - canvasRect.left + scrollX - padding) / zoomFactor;
        const y = (e.clientY - canvasRect.top + scrollY - padding) / zoomFactor;
        
        setMousePosition({ x, y });
        
        // Mettre à jour dragPosition pour les nouveaux éléments
        if (draggedAsset) {
          setDragPosition({ x, y });
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [activeId, draggedAsset, zoom]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    
    // Si c'est un élément du canvas, stocker l'élément
    if (event.active.data.current?.type === 'canvas-element') {
      const element = event.active.data.current.element as CanvasElement;
      setDraggedElement(element);
      setDraggedAsset(null);
    } else if (event.active.data.current?.type) {
      // C'est un élément depuis la bibliothèque
      setDraggedAsset(event.active.data.current);
      setDraggedElement(null);
      // Initialiser la position
      if (canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const zoomFactor = zoom / 100;
        // Position par défaut au centre
        setDragPosition({ 
          x: (canvasRect.width / 2) / zoomFactor, 
          y: (canvasRect.height / 2) / zoomFactor 
        });
      }
    }
  };

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Mise à jour en temps réel pendant le drag pour une meilleure UX
    if (event.active.data.current?.type === 'canvas-element' && draggedElement && canvasRef.current) {
      const delta = event.delta;
      
      if (delta) {
        const zoomFactor = zoom / 100;
        // Ajuster le delta selon le zoom
        const adjustedDeltaX = delta.x / zoomFactor;
        const adjustedDeltaY = delta.y / zoomFactor;
        
        setElements(prev => {
          const element = prev.find(el => el.id === draggedElement.id);
          if (!element) return prev;
          
          const canvasWidth = canvasRef.current?.offsetWidth || 1280;
          const canvasHeight = canvasRef.current?.offsetHeight || 720;
          
          const newX = Math.max(0, Math.min(element.style.x + adjustedDeltaX, canvasWidth - element.style.width));
          const newY = Math.max(0, Math.min(element.style.y + adjustedDeltaY, canvasHeight - element.style.height));
          
          return prev.map(el => 
            el.id === draggedElement.id
              ? { ...el, style: { ...el.style, x: newX, y: newY } }
              : el
          );
        });
      }
    } else if (draggedAsset && canvasRef.current && event.over?.id === 'canvas') {
      // Mettre à jour la position pour les nouveaux éléments depuis la bibliothèque
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const zoomFactor = zoom / 100;
      
      // Utiliser la position de la souris si disponible
      if (event.activatorEvent) {
        const mouseEvent = event.activatorEvent as MouseEvent;
        const x = (mouseEvent.clientX - canvasRect.left) / zoomFactor;
        const y = (mouseEvent.clientY - canvasRect.top) / zoomFactor;
        setDragPosition({ x, y });
      } else if (event.delta) {
        // Utiliser le delta pour calculer la position
        const lastPos = dragPosition || { x: 100, y: 100 };
        setDragPosition({
          x: lastPos.x + event.delta.x / zoomFactor,
          y: lastPos.y + event.delta.y / zoomFactor,
        });
      }
    }
  }, [draggedElement, draggedAsset, zoom, dragPosition]);

  // Fonction utilitaire pour calculer la position relative au canvas
  const getCanvasPosition = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    
    const canvasElement = canvasRef.current;
    const canvasRect = canvasElement.getBoundingClientRect();
    const zoomFactor = zoom / 100;
    
    // Trouver le conteneur avec scroll
    const scrollContainer = document.querySelector('.overflow-auto') as HTMLElement;
    const scrollX = scrollContainer?.scrollLeft || 0;
    const scrollY = scrollContainer?.scrollTop || 0;
    const padding = 32; // padding du conteneur (p-8)
    
    // Calculer la position relative au canvas (sans zoom)
    const x = (clientX - canvasRect.left + scrollX - padding) / zoomFactor;
    const y = (clientY - canvasRect.top + scrollY - padding) / zoomFactor;
    
    return { x, y };
  }, [zoom]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || over.id !== 'canvas') {
      setActiveId(null);
      setDraggedElement(null);
      setDraggedAsset(null);
      setDragPosition(null);
      setMousePosition(null);
      return;
    }

    // Si on dépose un élément depuis la bibliothèque
    if (active.data.current?.type && active.data.current.type !== 'canvas-element') {
      const asset = active.data.current;
      
      // Calculer la position relative au canvas avec prise en compte du zoom
      const canvasElement = canvasRef.current;
      if (!canvasElement) return;
      
      const zoomFactor = zoom / 100;
      
      // Obtenir la position de la souris relative au canvas
      let dropX = 100;
      let dropY = 100;
      
      // Priorité 1: Utiliser mousePosition (le plus précis, mis à jour en temps réel)
      if (mousePosition) {
        dropX = mousePosition.x;
        dropY = mousePosition.y;
      } 
      // Priorité 2: Utiliser dragPosition
      else if (dragPosition) {
        dropX = dragPosition.x;
        dropY = dragPosition.y;
      }
      // Priorité 3: Calculer depuis l'événement de la souris
      else if (event.activatorEvent) {
        const mouseEvent = event.activatorEvent as MouseEvent;
        const pos = getCanvasPosition(mouseEvent.clientX, mouseEvent.clientY);
        if (pos) {
          dropX = pos.x;
          dropY = pos.y;
        }
      }
      
      // S'assurer que la position est dans les limites du canvas
      const canvasWidth = canvasElement.offsetWidth;
      const canvasHeight = canvasElement.offsetHeight;

      // Calculer les dimensions de l'élément
      const elementWidth = asset.type === 'text' ? 200 : asset.type === 'icon' ? 80 : 150;
      const elementHeight = asset.type === 'text' ? 50 : asset.type === 'icon' ? 80 : 150;
      
      // Positionner l'élément exactement où la souris est (coin supérieur gauche)
      // Ajuster pour que le centre de l'élément soit sous la souris
      const elementX = Math.max(0, Math.min(dropX - elementWidth / 2, canvasWidth - elementWidth));
      const elementY = Math.max(0, Math.min(dropY - elementHeight / 2, canvasHeight - elementHeight));
      
      // Arrondir pour éviter les positions décimales
      const finalX = Math.round(elementX);
      const finalY = Math.round(elementY);

      const newElement: CanvasElement = {
        id: `element-${Date.now()}`,
        type: asset.type,
        data: {
          src: asset.src,
          name: asset.name,
          icon: asset.icon,
          text: asset.type === 'text' ? (asset.text || 'Nouveau texte') : undefined,
        },
        style: {
          x: finalX,
          y: finalY,
          width: elementWidth,
          height: elementHeight,
          fontSize: asset.type === 'text' && asset.fontSize ? asset.fontSize : 16,
          color: '#000000',
          fontFamily: 'Arial',
          opacity: 100,
          zIndex: Math.max(10, elements.length + 10), // S'assurer que z-index est toujours >= 10
        },
      };

      const newElements = [...elements, newElement];
      
      console.log('🔍 Nouvel élément créé:', {
        id: newElement.id,
        type: newElement.type,
        data: newElement.data,
        style: newElement.style,
        totalElements: newElements.length
      });
      
      addToHistory(newElements);
      setElements(newElements);
      setSelectedElementId(newElement.id);
      syncToParentData(newElements);
    } else if (active.data.current?.type === 'canvas-element' && draggedElement) {
      // Déplacer un élément existant - la position est déjà mise à jour dans handleDragOver
      // Juste sauvegarder dans l'historique
      const finalElements = elements.map((el) => {
        if (el.id === draggedElement.id) {
          const canvasWidth = canvasRef.current?.offsetWidth || 1280;
          const canvasHeight = canvasRef.current?.offsetHeight || 720;
          return {
            ...el,
            style: {
              ...el.style,
              x: Math.max(0, Math.min(el.style.x, canvasWidth - el.style.width)),
              y: Math.max(0, Math.min(el.style.y, canvasHeight - el.style.height)),
            },
          };
        }
        return el;
      });

      addToHistory(finalElements);
      setElements(finalElements);
      syncToParentData(finalElements);
    }

    setActiveId(null);
    setDraggedElement(null);
    setDraggedAsset(null);
    setDragPosition(null);
    setMousePosition(null);
  };

  const addToHistory = (newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedElementId) return;

    const updatedElements = elements.map((el) =>
      el.id === selectedElementId
        ? {
            ...el,
            style: {
              ...el.style,
              [property]: value,
            },
            data: property === 'text' ? { ...el.data, text: value } : el.data,
          }
        : el
    );

    addToHistory(updatedElements);
    setElements(updatedElements);
    syncToParentData(updatedElements);
  };

  const handleDelete = () => {
    if (!selectedElementId) return;
    const updatedElements = elements.filter((el) => el.id !== selectedElementId);
    addToHistory(updatedElements);
    setElements(updatedElements);
    setSelectedElementId(null);
    syncToParentData(updatedElements);
  };

  const handleDuplicate = () => {
    if (!selectedElementId) return;
    const element = elements.find((el) => el.id === selectedElementId);
    if (!element) return;

    const newElement: CanvasElement = {
      ...element,
      id: `element-${Date.now()}`,
      style: {
        ...element.style,
        x: element.style.x + 20,
        y: element.style.y + 20,
        zIndex: elements.length,
      },
    };

    const newElements = [...elements, newElement];
    addToHistory(newElements);
    setElements(newElements);
    setSelectedElementId(newElement.id);
    syncToParentData(newElements);
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
        <EditorToolbar
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          hasSelection={!!selectedElementId}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          zoom={zoom}
          onZoomIn={() => setZoom((prev) => Math.min(prev + 10, 200))}
          onZoomOut={() => setZoom((prev) => Math.max(prev - 10, 50))}
          onZoomFit={() => setZoom(100)}
        />

        <div className="flex flex-1 overflow-hidden">
          <AssetLibrary />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className="flex-1 overflow-auto p-8"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                scrollBehavior: 'smooth',
              }}
              onWheel={(e) => {
                // Permettre le scroll normal
                // Ne pas bloquer le scroll pendant le drag
              }}
              onScroll={(e) => {
                // S'assurer que le scroll fonctionne
                e.stopPropagation();
              }}
            >
              <Card className="w-full h-[720px] max-w-[1280px] mx-auto relative" style={{ overflow: 'visible' }}>
                <Canvas
                  innerRef={canvasRef}
                  elements={elements}
                  selectedElementId={selectedElementId}
                  editingElementId={editingElementId}
                  onElementSelect={setSelectedElementId}
                  onElementDoubleClick={(id) => {
                    // Activer l'édition de texte
                    const element = elements.find((el) => el.id === id);
                    if (element?.type === 'text') {
                      setEditingElementId(id);
                    }
                  }}
                  onStartEdit={(id) => setEditingElementId(id)}
                  onEndEdit={() => setEditingElementId(null)}
                  onTextChange={(id, text) => {
                    const updatedElements = elements.map((el) =>
                      el.id === id ? { ...el, data: { ...el.data, text } } : el
                    );
                    addToHistory(updatedElements);
                    setElements(updatedElements);
                    syncToParentData(updatedElements);
                  }}
                  onElementsChange={(newElements) => {
                    setElements(newElements);
                  }}
                  backgroundImage={data.heroBackgroundPhoto}
                  backgroundVideo={data.heroBackgroundPhoto?.endsWith('.mp4') ? data.heroBackgroundPhoto : undefined}
                />
                {showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px',
                    }}
                  />
                )}
              </Card>
            </div>
          </div>

          <PropertiesPanel
            selectedElement={selectedElement}
            onPropertyChange={handlePropertyChange}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </div>
      </div>

      <DragOverlay>
        {activeId && (draggedElement || draggedAsset) ? (
          <div
            className="pointer-events-none"
            style={{
              position: 'fixed',
              // Pour les nouveaux éléments depuis la bibliothèque, centrer sur la souris
              // @dnd-kit positionne automatiquement le DragOverlay à la position de la souris
              left: '50%',
              top: '50%',
              width: draggedElement 
                ? `${draggedElement.style.width * zoom / 100}px` 
                : draggedAsset?.type === 'text' 
                  ? `${200 * zoom / 100}px` 
                  : draggedAsset?.type === 'icon' 
                    ? `${80 * zoom / 100}px` 
                    : `${150 * zoom / 100}px`,
              height: draggedElement 
                ? `${draggedElement.style.height * zoom / 100}px` 
                : draggedAsset?.type === 'text' 
                  ? `${50 * zoom / 100}px` 
                  : draggedAsset?.type === 'icon' 
                    ? `${80 * zoom / 100}px` 
                    : `${150 * zoom / 100}px`,
              transform: draggedElement?.style.rotation 
                ? `translate(-50%, -50%) rotate(${draggedElement.style.rotation}deg)` 
                : 'translate(-50%, -50%)', // Centrer sur la souris
              zIndex: 9999,
              opacity: 0.95,
              transformOrigin: 'center center',
              pointerEvents: 'none',
            }}
          >
            {draggedElement?.type === 'text' && (
              <div
                style={{
                  color: draggedElement.style.color || '#000000',
                  fontSize: `${draggedElement.style.fontSize || 16}px`,
                  fontFamily: draggedElement.style.fontFamily || 'Arial',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '2px dashed #3b82f6',
                  borderRadius: '4px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {draggedElement.data.text || 'Texte'}
              </div>
            )}
            {draggedElement?.type === 'image' && draggedElement.data.src && (
              <img
                src={draggedElement.data.src}
                alt={draggedElement.data.name || 'Image'}
                className="w-full h-full object-cover rounded border-2 border-blue-500"
                style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
              />
            )}
            {draggedElement?.type === 'icon' && (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-white/95 rounded border-2 border-blue-500" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                {draggedElement.data.icon}
              </div>
            )}
            {draggedAsset?.type === 'text' && (
              <div
                style={{
                  color: '#000000',
                  fontSize: `${draggedAsset.fontSize || 16}px`,
                  fontFamily: 'Arial',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '2px dashed #3b82f6',
                  borderRadius: '4px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {draggedAsset.text || 'Nouveau texte'}
              </div>
            )}
            {draggedAsset?.type === 'image' && draggedAsset.src && (
              <img
                src={draggedAsset.src}
                alt={draggedAsset.name || 'Image'}
                className="w-full h-full object-cover rounded border-2 border-blue-500"
                style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
              />
            )}
            {draggedAsset?.type === 'icon' && (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-white/95 rounded border-2 border-blue-500" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                {draggedAsset.icon}
              </div>
            )}
            {draggedAsset?.type === 'video' && draggedAsset.src && (
              <div className="relative w-full h-full rounded border-2 border-blue-500 bg-gray-800" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <video
                  src={draggedAsset.src}
                  className="w-full h-full object-cover rounded"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <VideoIcon className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

