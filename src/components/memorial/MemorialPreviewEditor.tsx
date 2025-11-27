import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Draggable from "react-draggable";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Type,
  X,
  Sparkles,
  Frame,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhotoGallery } from "./PhotoGallery";
import { HeroBackgroundSelector } from "./HeroBackgroundSelector";
import { SnapGuides } from "./SnapGuides";
import { WysiwygToolbar } from "./WysiwygToolbar";
import { calculateSnap, ElementBounds } from "@/hooks/useSnapAlignment";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export interface FieldStyle {
  position?: { x: number; y: number };
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  alignment?: "left" | "center" | "right";
  opacity?: number;
}

interface Props {
  data: any;
  styles: Record<string, Partial<FieldStyle>>;
  onDataChange: (updates: Partial<any>) => void;
  onStylesChange: (field: string, key: keyof FieldStyle, value: any) => void;
  isEditable?: boolean; 
}

const DEFAULT_POS_STEP = 30;
const MIN_WIDTH = 30;
const MIN_HEIGHT = 20;
const MIN_FONT_SIZE = 8;

const FONT_SIZES = [12, 16, 20, 24, 32, 48, 64, 72, 96];
const FONT_FAMILIES = ["Arial", "Verdana", "Times New Roman", "Georgia", "Courier New"];

const makeDefaultStyle = (index = 0, type: "text" | "image" = "text") => {
  const baseX = 40 + (index % 5) * 30;
  const baseY = 40 + Math.floor(index / 5) * 40;
  if (type === "image") {
    return {
      position: { x: baseX + 200, y: baseY + 20 },
      width: 140,
      height: 140,
      opacity: 100,
    } as Partial<FieldStyle>;
  }
  return {
    position: { x: baseX, y: baseY },
    width: 280,
    fontSize: 16,
    color: "#111111",
    fontFamily: "Arial",
    opacity: 100,
  } as Partial<FieldStyle>;
};

let symbolOptions: Array<{ id: string; name: string; image: string }> = [];
try {
  const modules = import.meta.glob('/src/assets/symbols/*.{png,PNG}', { eager: true, as: 'url' }) as Record<string, string>;
  symbolOptions = Object.entries(modules).map(([p, url]) => {
    const f = p.split('/').pop() || 'symbol';
    return { id: f, name: f.replace(/\.[^.]+$/, ''), image: url };
  }).sort((a, b) => a.name.localeCompare(b.name));
} catch (e) {
  symbolOptions = [];
}

function fitFontSizeToBox(
  text: string,
  fontFamily: string,
  boxWidth: number,
  boxHeight: number
): number {
  // Base ratio derived from typical readable proportions
  const widthRatio = boxWidth / 10;    // ~10px font per 100px width
  const heightRatio = boxHeight / 6;   // allows vertical scaling balance

  // Blend width and height influence (width usually dominates)
  let fontSize = (widthRatio * 0.7 + heightRatio * 0.3);

  // Adjust slightly for text length (short text can be larger)
  const lenFactor = Math.max(0.6, Math.min(1.2, 20 / (text.length || 1)));
  fontSize *= lenFactor;

  // Clamp final size
  return Math.max(8, Math.min(96, Math.round(fontSize)));
}


export const MemorialPreviewEditor: React.FC<Props> = ({
  data,
  styles,
  onDataChange,
  onStylesChange,
  isEditable = true,
}) => {
  const [user, setUser] = useState<any>(null);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);
  };

  useEffect(() => { 
    checkUser(); 
  }, []);

  const boundaryRef = useRef<HTMLDivElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showTextFormatPopup, setShowTextFormatPopup] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [snapGuides, setSnapGuides] = useState<Array<{ type: 'horizontal' | 'vertical'; position: number; start: number; end: number }>>([]);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [snapEnabled] = useState(true);

  const [localStyles, setLocalStyles] = useState<Record<string, Partial<FieldStyle>>>(styles || {});
  useEffect(() => setLocalStyles(styles || {}), [styles]);

  const getStyle = useCallback((field: string, key: keyof FieldStyle, fallback?: any) => {
    if (field.startsWith('symbol-')) {
        const idx = Number(field.split('-')[1]);
        const sym = Array.isArray(data.symbols) ? data.symbols[idx] : undefined;
        if (sym && sym[key] !== undefined) return sym[key];
    }
    if (field.startsWith('gallery-')) {
        const idx = Number(field.split('-')[1]);
        const gallery = Array.isArray(data.mainPhotoGallery) ? data.mainPhotoGallery : [];
        const item = gallery[idx];
        if (item && typeof item !== 'string' && item[key] !== undefined) return item[key];
    }
    if (field.startsWith('custom-')) {
        const idx = Number(field.split('-')[1]);
        const customs = Array.isArray(data.customFields) ? data.customFields : [];
        const item = customs[idx];
        if (item && item[key] !== undefined) return item[key];
    }
    return localStyles?.[field]?.[key] ?? styles?.[field]?.[key] ?? fallback;
  }, [localStyles, styles, data]);

  const applyStyleChange = useCallback((field: string, key: keyof FieldStyle, value: any) => {
    const isElementDataProp = ['position', 'width', 'height', 'opacity'].includes(key);

    if (field.startsWith('symbol-') && isElementDataProp) {
        const idx = Number(field.split('-')[1]);
        const existing = Array.isArray(data.symbols) ? data.symbols.slice() : [];
        const updated = existing.map((s: any, i: number) => i === idx ? { ...s, [key]: value } : s);
        onDataChange({ symbols: updated });
        return;
    }

    if (field.startsWith('gallery-') && isElementDataProp) {
        const idx = Number(field.split('-')[1]);
        const gallery = Array.isArray(data.mainPhotoGallery) ? data.mainPhotoGallery.slice() : [];
        const updated = gallery.map((item: any, i: number) => {
            if (i !== idx) return item;
            const currentData = (typeof item === 'string') ? { src: item, position: getStyle(field, 'position', undefined), width: getStyle(field, 'width', undefined), height: getStyle(field, 'height', undefined), opacity: getStyle(field, 'opacity', 100) } : item;
            return { ...currentData, [key]: value };
        });
        onDataChange({ mainPhotoGallery: updated });
        return;
    }

    if (field.startsWith('custom-')) {
      const idx = Number(field.split('-')[1]);
      const customs = Array.isArray(data.customFields) ? data.customFields.slice() : [];
    
      if (isElementDataProp || key === 'fontSize' || key === 'fontFamily' || key === 'color') {
        const updated = customs.map((item: any, i: number) => {
          if (i !== idx) return item;
          return { ...item, [key]: value };
        });
        onDataChange({ customFields: updated });
      } else {
        setLocalStyles(prev => ({ ...prev, [field]: { ...(prev[field] || {}), [key]: value } }));
        onStylesChange(field, key, value);
      }
      return;
    }
    

    setLocalStyles(prev => ({ ...prev, [field]: { ...(prev[field] || {}), [key]: value } }));
    onStylesChange(field, key, value);
}, [onStylesChange, data, onDataChange, getStyle]);

  const ensureStyle = useCallback((field: string, fieldIndex = 0, type: "text" | "image" = "text") => {
    const s = styles?.[field] ?? localStyles?.[field];
    if (!s) {
      const def = makeDefaultStyle(fieldIndex, type);
      Object.entries(def).forEach(([k, v]) => onStylesChange(field, k as keyof FieldStyle, v));
    }
  }, [styles, localStyles, onStylesChange]);

  const buildElements = useCallback(() => {
    const els: Array<{ key: string; type: "text" | "image"; value: any; meta?: any }> = [];

    els.push({ key: "fullname", type: "text", value: `${data?.deceased?.firstName || ""} ${data?.deceased?.lastName || ""}`.trim() });
    els.push({ key: "dates", type: "text", value: (data?.deceased?.birthDate || "") + ((data?.deceased?.birthDate && data?.deceased?.deathDate) ? " - " : "") + (data?.deceased?.deathDate || "") });

    const simpleDeceasedKeys = ["birthPlace", "deathPlace", "birthYear", "causeOfDeath", "relationshipStatus"];
    for (const k of simpleDeceasedKeys) {
      if (data?.deceased?.[k] !== undefined) els.push({ key: k, type: "text", value: data?.deceased?.[k] ?? "" });
    }

    const creatorKeys = ["creatorFirstname", "creatorLastname", "creatorRelationship", "creatorStreet", "creatorCity", "creatorZip"];
    for (const k of creatorKeys) {
      const val = data?.[k] ?? "";
      els.push({ key: k, type: "text", value: val });
    }

    const textKeys = ["locationDate", "trauerspruch", "introduction", "mainText", "sideTexts", "additionalTexts", "lastResidence"];
    for (const k of textKeys) {
      const val = data?.texts?.[k] ?? "";
      els.push({ key: k, type: "text", value: val });
    }

    if (data?.symbolImage) els.push({ key: "symbolImage", type: "image", value: data.symbolImage });

    if (Array.isArray(data?.mainPhotoGallery)) {
      data.mainPhotoGallery.forEach((url: string | any, idx: number) => {
        els.push({ key: `gallery-${idx}`, type: "image", value: url, meta: { idx } });
      });
    }

    if (Array.isArray(data?.lifeEvents)) {
      data.lifeEvents.forEach((ev: any, idx: number) => {
        els.push({ key: `life-${idx}-title`, type: "text", value: ev.title ?? "" });
        els.push({ key: `life-${idx}-date`, type: "text", value: ev.date ?? "" });
        els.push({ key: `life-${idx}-description`, type: "text", value: ev.description ?? "" });
        els.push({ key: `life-${idx}-location`, type: "text", value: ev.location ?? "" });
      });
    }

    if (Array.isArray(data?.familyMembers)) {
      data.familyMembers.forEach((m: any) => {
        const id = m.id ?? `${Math.random().toString(36).slice(2, 9)}`;
        els.push({ key: `family-${id}-fullname`, type: "text", value: `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim(), meta: { id } });
        els.push({ key: `family-${id}-relationship`, type: "text", value: m.relationship ?? "", meta: { id } });
      });
    }

    if (Array.isArray(data?.symbols)) {
      data.symbols.forEach((s: any, idx: number) => {
        if (s?.image) els.push({ key: `symbol-${idx}`, type: "image", value: s.image, meta: { idx } });
      });
    }

    if (Array.isArray(data?.customFields)) {
      data.customFields.forEach((cf: any, idx: number) => {
        els.push({ key: `custom-${idx}`, type: "text", value: cf.content ?? "", meta: { idx } });
      });
    }

    return els;
  }, [data]);

  const elements = useMemo(() => buildElements(), [buildElements]);

  // Créer des refs stables pour tous les éléments draggables
  const draggableRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({});
  
  // S'assurer que toutes les refs existent
  elements.forEach((el) => {
    if (!draggableRefs.current[el.key]) {
      draggableRefs.current[el.key] = React.createRef<HTMLDivElement>();
    }
  });

  // S'assurer que tous les styles sont initialisés (après le rendu)
  useEffect(() => {
    elements.forEach((el, idx) => {
      const { key, type } = el;
      const s = styles?.[key] ?? localStyles?.[key];
      if (!s) {
        const def = makeDefaultStyle(idx, type === 'text' ? 'text' : 'image');
        Object.entries(def).forEach(([k, v]) => {
          onStylesChange(key, k as keyof FieldStyle, v);
        });
      }
    });
  }, [elements, styles, localStyles, onStylesChange]);

  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      const target = ev.target as Node | null;
      if (!boundaryRef.current) return;
      if (boundaryRef.current.contains(target)) return;
      const toolbarEl = document.querySelector('[data-memorial-toolbar]');
      if (toolbarEl && toolbarEl.contains(target)) return;
      setSelectedField(null);
      setEditingField(null);
      setShowTextFormatPopup(false);
      setToolbarVisible(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Calculer les bounds de tous les éléments pour le snap
  const allElementBounds = useMemo((): ElementBounds[] => {
    return elements.map((el, idx) => {
      const key = el.key;
      let pos = getStyle(key, 'position', { x: 20 + (idx * DEFAULT_POS_STEP) % 200, y: 20 + Math.floor(idx / 5) * DEFAULT_POS_STEP });
      let width = getStyle(key, 'width', el.type === 'text' ? 280 : 150);
      let height = getStyle(key, 'height', el.type === 'text' ? undefined : 150);
      
      if (typeof width !== 'number') width = 150;
      if (typeof height !== 'number') height = 50;
      
      return {
        id: key,
        x: pos.x,
        y: pos.y,
        width,
        height,
      };
    });
  }, [elements, getStyle]);

  const onDragStart = useCallback((fieldKey: string) => {
    setIsDragging(true);
    setDraggingField(fieldKey);
    setSnapGuides([]);
  }, []);

  const onDrag = useCallback((fieldKey: string, e: any, pos: any) => {
    if (!snapEnabled || !boundaryRef.current) {
      setSnapGuides([]);
      return;
    }
    
    // Calculer les bounds de l'élément en cours de déplacement
    const element = elements.find(el => el.key === fieldKey);
    if (!element) return;
    
    let width = getStyle(fieldKey, 'width', element.type === 'text' ? 280 : 150);
    let height = getStyle(fieldKey, 'height', element.type === 'text' ? undefined : 150);
    if (typeof width !== 'number') width = 150;
    if (typeof height !== 'number') height = 50;
    
    const currentBounds: ElementBounds = {
      id: fieldKey,
      x: pos.x,
      y: pos.y,
      width,
      height,
    };
    
    // Calculer le snap pour afficher les guides
    const snapResult = calculateSnap(
      currentBounds,
      allElementBounds.filter(b => b.id !== fieldKey)
    );
    
    if (snapResult && snapResult.guides.length > 0) {
      setSnapGuides(snapResult.guides);
    } else {
      setSnapGuides([]);
    }
  }, [snapEnabled, elements, getStyle, allElementBounds]);

  const onDragStop = useCallback((fieldKey: string, e: any, pos: any) => {
    setIsDragging(false);
    setDraggingField(null);
    setSnapGuides([]);
    
    // Appliquer le snap final
    const element = elements.find(el => el.key === fieldKey);
    if (!element) return;
    
    let width = getStyle(fieldKey, 'width', element.type === 'text' ? 280 : 150);
    let height = getStyle(fieldKey, 'height', element.type === 'text' ? undefined : 150);
    if (typeof width !== 'number') width = 150;
    if (typeof height !== 'number') height = 50;
    
    const currentBounds: ElementBounds = {
      id: fieldKey,
      x: pos.x,
      y: pos.y,
      width,
      height,
    };
    
    let finalPos = { x: pos.x, y: pos.y };
    if (snapEnabled) {
      const snapResult = calculateSnap(
        currentBounds,
        allElementBounds.filter(b => b.id !== fieldKey)
      );
      if (snapResult) {
        finalPos = { x: snapResult.snappedX, y: snapResult.snappedY };
      }
    }
    
    const newPos = { x: Math.round(finalPos.x), y: Math.round(finalPos.y) };

    if (fieldKey.startsWith('symbol-')) {
      const idx = Number(fieldKey.split('-')[1]);
      const existing = Array.isArray(data.symbols) ? data.symbols.slice() : [];
      const updated = existing.map((s: any, i: number) => i === idx ? { ...s, position: newPos } : s);
      onDataChange({ symbols: updated });
      return;
    }

    if (fieldKey.startsWith('gallery-')) {
      const idx = Number(fieldKey.split('-')[1]);
      const gallery = Array.isArray(data.mainPhotoGallery) ? data.mainPhotoGallery.slice() : [];
      const updated = gallery.map((item: any, i: number) => {
        if (i !== idx) return item;
        if (typeof item === 'string') return { src: item, position: newPos, width: undefined, height: undefined, opacity: 100 };
        return { ...item, position: newPos };
      });
      onDataChange({ mainPhotoGallery: updated });
      return;
    }

    if (fieldKey.startsWith('custom-')) {
      const idx = Number(fieldKey.split('-')[1]);
      const customs = Array.isArray(data.customFields) ? data.customFields.slice() : [];
      const updated = customs.map((item: any, i: number) => {
        if (i !== idx) return item;
        return { ...item, position: newPos };
      });
      onDataChange({ customFields: updated });
      return;
    }

    applyStyleChange(fieldKey, 'position', newPos);
  }, [data, onDataChange, applyStyleChange, snapEnabled, elements, getStyle, allElementBounds]);

  const startResize = useCallback((fieldKey: string, handle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  
    const el = fieldRefs.current[fieldKey];
    if (!el) {
      setIsResizing(false);
      return;
    }
  
    const startX = e.clientX;
    const startY = e.clientY;
  
    const initial = {
      width: getStyle(fieldKey, 'width', 150),
      height: getStyle(fieldKey, 'height', 150),
      pos: getStyle(fieldKey, 'position', { x: 0, y: 0 }),
      fontSize: getStyle(fieldKey, 'fontSize', 16),
    };
  
    const boundaryRect = boundaryRef.current?.getBoundingClientRect();
    const latestState = { current: { ...initial } } as any;
  
    const mapAlignmentToJustify = (alignment: string) => {
      if (alignment === 'right') return 'flex-end';
      if (alignment === 'center') return 'center';
      return 'flex-start'; // left / default
    };
  
    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
    
      let newWidth = initial.width;
      let newHeight = initial.height;
      let newX = initial.pos.x;
      let newY = initial.pos.y;
    
      if (handle.includes('right')) newWidth = Math.max(MIN_WIDTH, initial.width + dx);
      if (handle.includes('left')) { newWidth = Math.max(MIN_WIDTH, initial.width - dx); newX = initial.pos.x + dx; }
      if (handle.includes('bottom')) newHeight = Math.max(MIN_HEIGHT, initial.height + dy);
      if (handle.includes('top')) { newHeight = Math.max(MIN_HEIGHT, initial.height - dy); newY = initial.pos.y + dy; }
    
      if (boundaryRect) {
        if (newX < 0) { newWidth = Math.max(MIN_WIDTH, newWidth + newX); newX = 0; }
        if (newY < 0) { newHeight = Math.max(MIN_HEIGHT, newHeight + newY); newY = 0; }
        if (newX + newWidth > boundaryRect.width) newWidth = Math.max(MIN_WIDTH, boundaryRect.width - newX);
        if (newY + newHeight > boundaryRect.height) newHeight = Math.max(MIN_HEIGHT, boundaryRect.height - newY);
      }
    
      const finalW = Math.round(newWidth);
      const finalH = Math.round(newHeight);
      const finalX = Math.round(newX);
      const finalY = Math.round(newY);
    
      // Move & resize wrapper directly in DOM
      el.style.transform = `translate(${finalX}px, ${finalY}px)`;
      el.style.width = `${finalW}px`;
      el.style.height = `${finalH}px`;
    
      const isTextField =
        !fieldKey.startsWith('symbol-') &&
        !fieldKey.startsWith('gallery-') &&
        !fieldKey.startsWith('mainPhoto') &&
        !fieldKey.startsWith('symbolImage');
    
      if (isTextField) {
        const textDiv = el.querySelector('[contentEditable="true"]') as HTMLElement | null;
        if (textDiv) {
          const text = textDiv.innerText || textDiv.textContent || 'A';
          const fontFamily = getStyle(fieldKey, 'fontFamily', 'Arial');
    
          const PADDING = 8;
          const innerW = Math.max(40, finalW - PADDING);
          const innerH = Math.max(40, finalH - PADDING);
    
          // Your ratio-based function → instant, no DOM reflow
          const fittedFont = Math.max(
            MIN_FONT_SIZE,
            fitFontSizeToBox(text, fontFamily, innerW, innerH)
          );
    
          // 🔥 LIVE DOM UPDATE (instant visual feedback)
          textDiv.style.fontSize = `${fittedFont}px`;
          textDiv.style.lineHeight = '1.2';
          textDiv.style.display = 'flex';
          textDiv.style.alignItems = 'center';
          textDiv.style.justifyContent = mapAlignmentToJustify(String(getStyle(fieldKey, 'alignment', 'left')));
          textDiv.style.overflow = 'hidden';
          textDiv.style.whiteSpace = 'pre-wrap';
          textDiv.style.wordBreak = 'break-word';
    
          latestState.current.fontSize = fittedFont;
        }
      }
    
      // Track latest dimensions (no React update yet)
      latestState.current.x = newX;
      latestState.current.y = newY;
      latestState.current.width = newWidth;
      latestState.current.height = newHeight;
    };
    
    
  
    const onUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
  
      const final = latestState.current;
      const updateCommonPosition = { x: Math.round(final.x), y: Math.round(final.y) };
      const w = Math.round(final.width);
      const h = Math.round(final.height);
  
      const computeFinalFont = (field: string, fallbackFont?: number) => {
        const textNode = fieldRefs.current[field]?.querySelector('[contentEditable="true"]') as HTMLElement | null;
        const fontFamily = getStyle(field, 'fontFamily', 'Arial');
        const text = textNode ? (textNode.innerText || textNode.textContent || '') : '';
        const PADDING = 8;
      
        // Use the actual final width/height from latestState
        const width = Math.max(60, latestState.current?.width - PADDING);
        const height = Math.max(60, latestState.current?.height - PADDING);

        console.log('width', latestState.current?.width)
        console.log('height', latestState.current?.height)
      
        // Compute best-fit font size for the new box size
        const fittedFont = fitFontSizeToBox(text || 'A', fontFamily, width, height);

        console.log('fitter', fittedFont)
      
        // Return a safe minimum
        return Math.max(MIN_FONT_SIZE, Math.round(fittedFont || fallbackFont || 16));
      };
      
  
      // Update element data
      if (fieldKey.startsWith('symbol-')) {
        const idx = Number(fieldKey.split('-')[1]);
        const updated = (data.symbols || []).map((s: any, i: number) =>
          i === idx ? { ...s, width: w, height: h, position: updateCommonPosition } : s
        );
        onDataChange({ symbols: updated });
      } else if (fieldKey.startsWith('gallery-')) {
        const idx = Number(fieldKey.split('-')[1]);
        const updated = (data.mainPhotoGallery || []).map((item: any, i: number) => {
          if (i !== idx) return item;
          if (typeof item === 'string') return { src: item, width: w, height: h, position: updateCommonPosition, opacity: 100 };
          return { ...item, width: w, height: h, position: updateCommonPosition };
        });
        onDataChange({ mainPhotoGallery: updated });
      } else if (fieldKey.startsWith('custom-')) {
        const idx = Number(fieldKey.split('-')[1]);
        const customs = Array.isArray(data.customFields) ? data.customFields.slice() : [];
        const finalFont = computeFinalFont(fieldKey, initial.fontSize);
        const updated = customs.map((item: any, i: number) => {
          if (i !== idx) return item;
          return { ...item, width: w, height: h, position: updateCommonPosition, fontSize: finalFont };
        });
        onDataChange({ customFields: updated });
      } else if (fieldKey === 'mainPhoto' || fieldKey === 'symbolImage') {
        const current = (data as any)[fieldKey];
        const update = { width: w, height: h, position: updateCommonPosition, opacity: 100 };
        if (!current) onDataChange({ [fieldKey]: { src: '', ...update } });
        else if (typeof current === 'string') onDataChange({ [fieldKey]: { src: current, ...update } });
        else onDataChange({ [fieldKey]: { ...current, ...update } });
      } else {
        // Generic text fields
        applyStyleChange(fieldKey, 'width', w);
        applyStyleChange(fieldKey, 'height', h);
        applyStyleChange(fieldKey, 'position', updateCommonPosition);
  
        const finalFont = computeFinalFont(fieldKey, initial.fontSize);
        applyStyleChange(fieldKey, 'fontSize', finalFont);
      }
  
      // Cleanup inline preview
      el.style.width = '';
      el.style.height = '';
      const textDiv = el.querySelector('[contentEditable="true"]') as HTMLElement | null;
      if (textDiv) textDiv.style.fontSize = '';
    };
  
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [getStyle, applyStyleChange, data, onDataChange]);
    

  const commitTextToData = useCallback((fieldKey: string, newText: string) => {
    newText = String(newText ?? "").trim();
    if (fieldKey === "fullname") {
      const parts = newText.split(/\s+/);
      const firstName = parts.shift() ?? "";
      const lastName = parts.join(' ');
      onDataChange({ deceased: { ...(data.deceased || {}), firstName, lastName } });
      return;
    }

    if (fieldKey === "dates") {
      const parts = newText.split(/[-–—|\/]/).map((p) => p.trim());
      const birth = parts[0] ?? "";
      const death = parts[1] ?? "";
      onDataChange({ deceased: { ...(data.deceased || {}), birthDate: birth, deathDate: death } });
      return;
    }

    if (["birthPlace", "deathPlace", "birthYear", "causeOfDeath", "relationshipStatus"].includes(fieldKey)) {
      onDataChange({ deceased: { ...(data.deceased || {}), [fieldKey]: newText } });
      return;
    }

    if (fieldKey.startsWith("creator")) {
      onDataChange({ [fieldKey]: newText });
      return;
    }

    if (fieldKey.startsWith("family-")) {
      const [, id, prop] = fieldKey.split('-');
      const members = Array.isArray(data.familyMembers) ? data.familyMembers.map((m: any) => ({ ...m })) : [];
      const idx = members.findIndex((m: any) => String(m.id) === String(id));
      if (idx !== -1) {
        if (prop === 'fullname') {
          const parts = newText.split(/\s+/);
          members[idx].firstName = parts.shift() ?? '';
          members[idx].lastName = parts.join(' ');
        } else {
          members[idx][prop] = newText;
        }
        onDataChange({ familyMembers: members });
      }
      return;
    }

    if (fieldKey.startsWith('life-')) {
      const parts = fieldKey.split('-');
      const index = Number(parts[1]);
      const prop = parts.slice(2).join('-');
      const events = Array.isArray(data.lifeEvents) ? data.lifeEvents.map((e: any) => ({ ...e })) : [];
      if (events[index]) { events[index][prop] = newText; onDataChange({ lifeEvents: events }); }
      return;
    }

    if (fieldKey.startsWith('custom-')) {
      const idx = Number(fieldKey.split('-')[1]);
      const customs = Array.isArray(data.customFields) ? data.customFields.slice() : [];
      const updated = customs.map((item: any, i: number) => {
        if (i !== idx) return item;
        return { ...item, content: newText };
      });
      onDataChange({ customFields: updated });
      return;
    }

    if (fieldKey.startsWith('gallery-')) return;

    if (data?.texts && Object.prototype.hasOwnProperty.call(data.texts, fieldKey)) {
      onDataChange({ texts: { ...(data.texts || {}), [fieldKey]: newText } });
      return;
    }

    onDataChange({ [fieldKey]: newText });
  }, [data, onDataChange]);

  const handleDeleteField = useCallback((fieldKey: string) => {
    if (["mainPhoto", "symbolImage", "backgroundImage"].includes(fieldKey)) {
      onDataChange({ [fieldKey]: "" });
      setSelectedField(null); setEditingField(null); return;
    }

    if (fieldKey.startsWith('symbol-')) {
      const idx = Number(fieldKey.split('-')[1]);
      const existing = Array.isArray(data.symbols) ? data.symbols.slice() : [];
      const updated = existing.filter((_: any, i: number) => i !== idx);
      onDataChange({ symbols: updated });
      return;
    }

    if (fieldKey.startsWith('gallery-')) {
      const idx = Number(fieldKey.split('-')[1]);
      const gallery = Array.isArray(data.mainPhotoGallery) ? [...data.mainPhotoGallery] : [];
      gallery.splice(idx, 1);
      onDataChange({ mainPhotoGallery: gallery }); setSelectedField(null); setEditingField(null); return;
    }

    if (fieldKey.startsWith('custom-')) {
      const idx = Number(fieldKey.split('-')[1]);
      const customs = Array.isArray(data.customFields) ? data.customFields.slice() : [];
      const updated = customs.filter((_: any, i: number) => i !== idx);
      onDataChange({ customFields: updated });
      setSelectedField(null); setEditingField(null); return;
    }

    if (fieldKey.startsWith('family-')) {
      const [, id, prop] = fieldKey.split('-');
      const members = Array.isArray(data.familyMembers) ? data.familyMembers.map((m: any) => ({ ...m })) : [];
      const i = members.findIndex((m: any) => String(m.id) === String(id));
      if (i !== -1) {
        if (prop === 'fullname') { members[i].firstName = ''; members[i].lastName = ''; }
        else members[i][prop] = '';
        onDataChange({ familyMembers: members });
      }
      setSelectedField(null); setEditingField(null); return;
    }

    if (fieldKey.startsWith('life-')) {
      const [, idxStr, ...rest] = fieldKey.split('-'); const index = Number(idxStr); const prop = rest.join('-');
      const events = Array.isArray(data.lifeEvents) ? data.lifeEvents.map((e: any) => ({ ...e })) : [];
      if (events[index]) { events[index][prop] = ''; onDataChange({ lifeEvents: events }); }
      setSelectedField(null); setEditingField(null); return;
    }

    if (fieldKey.startsWith('creator')) { onDataChange({ [fieldKey]: '' }); setSelectedField(null); setEditingField(null); return; }

    if (["birthPlace","deathPlace","birthYear","causeOfDeath","relationshipStatus","dates","fullname"].includes(fieldKey)) {
      if (fieldKey === 'fullname') { onDataChange({ deceased: { ...(data.deceased || {}), firstName: '', lastName: '' } }); setSelectedField(null); setEditingField(null); return; }
      if (fieldKey === 'dates') { onDataChange({ deceased: { ...(data.deceased || {}), birthDate: '', deathDate: '' } }); setSelectedField(null); setEditingField(null); return; }
      const mapping: any = { birthPlace: 'birthPlace', deathPlace: 'deathPlace', birthYear: 'birthYear', causeOfDeath: 'causeOfDeath', relationshipStatus: 'relationshipStatus' };
      if (mapping[fieldKey]) { onDataChange({ deceased: { ...(data.deceased || {}), [mapping[fieldKey]]: '' } }); setSelectedField(null); setEditingField(null); return; }
    }

    if (data?.texts && Object.prototype.hasOwnProperty.call(data.texts, fieldKey)) { onDataChange({ texts: { ...(data.texts || {}), [fieldKey]: '' } }); setSelectedField(null); setEditingField(null); return; }

    onDataChange({ [fieldKey]: '' }); setSelectedField(null); setEditingField(null);
  }, [data, onDataChange]);

  const renderTextFormatPopup = useCallback((fieldKey: string) => {
    const curFontSize = getStyle(fieldKey, 'fontSize', 16);
    const curFontFamily = getStyle(fieldKey, 'fontFamily', 'Arial');
    const curColor = getStyle(fieldKey, 'color', '#111111');

    return (
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[200px] p-3 bg-white border border-black rounded-lg shadow-xl flex flex-col gap-3 z-[100] pointer-events-auto">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700">Textformat</h4>
          <button onClick={() => setShowTextFormatPopup(p => !p)} onMouseDown={(e) => e.preventDefault()} className="p-1 rounded-full hover:bg-red-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Größe (px)</label>
          <div className="flex gap-2 overflow-x-auto pb-1 whitespace-nowrap">
            {FONT_SIZES.map((s) => (
              <button key={s} onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); applyStyleChange(fieldKey, 'fontSize', s); }} className={cn('px-2 py-1 text-sm rounded-md transition-colors border shrink-0', curFontSize === s ? 'bg-black text-white border-black shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-black/10 border-gray-300')}>{s}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Schriftart</label>
          <div className="flex gap-2 overflow-x-auto pb-1 whitespace-nowrap">
            {FONT_FAMILIES.map((f) => (
              <button key={f} onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); applyStyleChange(fieldKey, 'fontFamily', f); }} style={{ fontFamily: f }} className={cn('px-2 py-1 text-sm rounded-md transition-colors border shrink-0', curFontFamily === f ? 'bg-black text-white border-black shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-black/10 border-gray-300')}>{f}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 items-start">
          <label className="text-xs font-medium text-gray-600">Farbe</label>
          <input type="color" value={curColor} onMouseDown={(e) => e.preventDefault()} onChange={(e) => { e.stopPropagation(); applyStyleChange(fieldKey, 'color', e.target.value); }} className="w-10 h-10 p-0 border-2 border-gray-300 cursor-pointer overflow-hidden" />
        </div>
      </div>
    );
  }, [getStyle, applyStyleChange]);

  const renderTextToolbar = useCallback((fieldKey: string) => {
    const curBold = !!getStyle(fieldKey, 'bold', false);
    const curItalic = !!getStyle(fieldKey, 'italic', false);
    const curUnderline = !!getStyle(fieldKey, 'underline', false);
    const curAlignment = getStyle(fieldKey, 'alignment', 'left');
    const curFontSize = getStyle(fieldKey, 'fontSize', 16);
    const curFontFamily = getStyle(fieldKey, 'fontFamily', 'Arial');
    const curColor = getStyle(fieldKey, 'color', '#000000');

    return (
      <div 
        data-memorial-toolbar="true" 
        className="relative z-50" 
        onClick={(e) => e.stopPropagation()} 
        onMouseDown={(e) => e.stopPropagation()} 
        style={{ pointerEvents: 'auto' }}
      >
        <WysiwygToolbar
          bold={curBold}
          italic={curItalic}
          underline={curUnderline}
          alignment={curAlignment}
          fontSize={curFontSize}
          fontFamily={curFontFamily}
          color={curColor}
          onBold={() => applyStyleChange(fieldKey, 'bold', !curBold)}
          onItalic={() => applyStyleChange(fieldKey, 'italic', !curItalic)}
          onUnderline={() => applyStyleChange(fieldKey, 'underline', !curUnderline)}
          onAlignment={(align) => applyStyleChange(fieldKey, 'alignment', align)}
          onFontSize={(size) => applyStyleChange(fieldKey, 'fontSize', size)}
          onFontFamily={(family) => applyStyleChange(fieldKey, 'fontFamily', family)}
          onColor={(color) => applyStyleChange(fieldKey, 'color', color)}
          showAdvanced={true}
        />
        <button 
          onMouseDown={(e) => e.preventDefault()} 
          onClick={(e) => { 
            e.stopPropagation(); 
            handleDeleteField(fieldKey); 
          }} 
          className="mt-2 ml-auto p-2 rounded-md hover:bg-red-100 transition-colors border border-red-200"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    );
  }, [getStyle, applyStyleChange, handleDeleteField]);

  const renderImageToolbar = useCallback((fieldKey: string) => {
    const curOpacity = getStyle(fieldKey, 'opacity', 100);
    return (
      <div data-memorial-toolbar="true" className="relative z-50 flex items-center gap-2 bg-white border border-gray-200 rounded-md p-2 shadow-lg" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
        <label className="text-xs text-gray-600 shrink-0">Deckkraft</label>
        <input type="range" min={10} max={100} step={1} value={curOpacity} onMouseDown={(e) => { e.stopPropagation(); }} onChange={(e) => { e.stopPropagation(); applyStyleChange(fieldKey, 'opacity', parseInt(e.target.value, 10)); }} className="w-24 h-1.5 rounded-full appearance-none bg-gray-200 cursor-pointer" />
        <span className="text-xs font-semibold text-gray-700 w-8 shrink-0">{curOpacity}%</span>
        <button onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); handleDeleteField(fieldKey); }} className="p-1 rounded hover:bg-red-100"><Trash2 className="w-4 h-4 text-red-500" /></button>
      </div>
    );
  }, [getStyle, applyStyleChange, handleDeleteField]);

  const currentToolbar = useMemo(() => {
    if (!selectedField || !toolbarVisible) return null;
    const type = elements.find(e => e.key === selectedField)?.type;
    if (type === 'text') return renderTextToolbar(selectedField);
    if (type === 'image') return renderImageToolbar(selectedField);
    return null;
  }, [selectedField, toolbarVisible, elements, renderTextToolbar, renderImageToolbar]);

  const getBorderStyle = useCallback(() => {
    const frameStyle = data?.frameStyle ?? 'none';
    const frameWidth = data?.frameWidth ?? 2;
    const frameColor = data?.frameColor ?? '#000000';
    if (!frameStyle || frameStyle === 'none') return {};
    const base = { borderColor: frameColor, borderWidth: `${frameWidth}px`, borderStyle: 'solid' } as React.CSSProperties;
    switch (frameStyle) { case 'simple': return { ...base }; case 'double': return { ...base, borderStyle: 'double', borderWidth: `${frameWidth + 2}px` }; case 'elegant': return { ...base, borderImage: `linear-gradient(to bottom, ${frameColor}, transparent) 1`, borderStyle: 'solid' }; default: return {}; }
  }, [data]);

  const handleSymbolPaletteClick = useCallback((symbol: any) => {
    const existing = Array.isArray(data.symbols) ? data.symbols.slice() : [];
    const foundIndex = existing.findIndex((s: any) => (s.id && symbol.id && s.id === symbol.id) || s.image === symbol.image);
    if (foundIndex >= 0) { const updated = existing.filter((_: any, i: number) => i !== foundIndex); onDataChange({ symbols: updated }); }
    else { existing.push({ id: `${symbol.name}-${Date.now()}`, image: symbol.image, width: 100, height: 100, opacity: 100, position: { x: 100, y: 100 } }); onDataChange({ symbols: existing }); }
  }, [data, onDataChange]);

  const handleAddCustomField = useCallback(() => {
    const customs = Array.isArray(data.customFields) ? data.customFields.slice() : [];
    const newField = {
      id: `custom-${Date.now()}`,
      content: 'Neues Textfeld',
      position: { x: 50 + (customs.length * 20), y: 50 + (customs.length * 20) },
      width: 200,
      height: undefined,
      fontSize: 16,
      opacity: 100
    };
  
    customs.push(newField);
    onDataChange({ customFields: customs });
  
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [data, onDataChange]);
  

  return (
    <div className="space-y-4">
    <Card
      ref={boundaryRef}
      className={`relative w-full mx-auto overflow-hidden border border-gray-200 shadow-md aspect-[16/9] ${
        isEditable ? 'max-w-[1300px]' : ''
      }`}
      style={{
        height: '720px',
        backgroundImage:
          data?.heroBackgroundPhoto && !data.heroBackgroundPhoto.toLowerCase().endsWith('.mp4')
            ? `url(${data.heroBackgroundPhoto})`
            : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...getBorderStyle(),
      }}
      onClick={() => {
        if (!isDragging && !isResizing) {
          setSelectedField(null);
          setEditingField(null);
          setShowTextFormatPopup(false);
          setToolbarVisible(false);
        }
      }}
    >
  {data?.heroBackgroundPhoto &&
    data.heroBackgroundPhoto.toLowerCase().endsWith('.mp4') && (
      <video
        src={data.heroBackgroundPhoto}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}

        {isEditable && currentToolbar && (
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1200 }} data-memorial-toolbar>
            {currentToolbar}
          </div>
        )}

        <div className="relative w-full h-full">
          {snapGuides.length > 0 && snapEnabled && draggingField && (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10000 }}>
              <SnapGuides guides={snapGuides} containerRef={boundaryRef} />
            </div>
          )}
          {elements.map((el, idx) => {
            const { key, type, value } = el;

            let pos = getStyle(key, 'position', { x: 20 + (idx * DEFAULT_POS_STEP) % 200, y: 20 + Math.floor(idx / 5) * DEFAULT_POS_STEP });
            let width = getStyle(key, 'width', type === 'text' ? 280 : 150);
            let height = getStyle(key, 'height', type === 'text' ? undefined : 150);
            let opacity = (getStyle(key, 'opacity', 100) ?? 100) / 100;
            let fontSize = getStyle(key, 'fontSize', 16);

            if (key.startsWith('symbol-')) {
              const sIdx = Number(key.split('-')[1]);
              const sym = Array.isArray(data.symbols) ? data.symbols[sIdx] : undefined;
              if (sym) {
                pos = getStyle(key, 'position', pos);
                width = getStyle(key, 'width', width);
                height = getStyle(key, 'height', height);
                opacity = (getStyle(key, 'opacity', 100) ?? 100) / 100;
              }
            }

            if (key.startsWith('gallery-')) {
              const gIdx = Number(key.split('-')[1]);
              const gallery = Array.isArray(data.mainPhotoGallery) ? data.mainPhotoGallery : [];
              const item = gallery[gIdx];
              if (item) {
                pos = getStyle(key, 'position', pos);
                width = getStyle(key, 'width', width);
                height = getStyle(key, 'height', height);
                opacity = (getStyle(key, 'opacity', 100) ?? 100) / 100;
              }
            }

            if (key.startsWith('custom-')) {
              const cIdx = Number(key.split('-')[1]);
              const customs = Array.isArray(data.customFields) ? data.customFields : [];
              const item = customs[cIdx];
              if (item) {
                pos = getStyle(key, 'position', pos);
                width = getStyle(key, 'width', width);
                height = getStyle(key, 'height', height);
                opacity = (getStyle(key, 'opacity', 100) ?? 100) / 100;
                fontSize = getStyle(key, 'fontSize', fontSize);
              }
            }

            const isSelected = selectedField === key;
            const isEditing = editingField === key;

            const hasContent = type === 'image' || (type === 'text' && String(value).trim().length > 0);
            if (!hasContent && !isSelected && !isEditing) return null;

            const elementRef = draggableRefs.current[key];

            return (
              <Draggable 
                key={key} 
                bounds="parent" 
                position={pos} 
                defaultPosition={pos} 
                disabled={!isEditable || isResizing || isEditing} 
                onStart={() => onDragStart(key)} 
                onDrag={(e, p) => onDrag(key, e, p)}
                onStop={(e, p) => onDragStop(key, e, p)} 
                nodeRef={elementRef}
              >
                <div 
                  ref={(el) => {
                    if (elementRef) {
                      (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                    }
                    fieldRefs.current[key] = el;
                  }} 
                  onClick={(ev) => { ev.stopPropagation(); if (!isEditable) return; setSelectedField(key); setToolbarVisible(false); setShowTextFormatPopup(false); setEditingField(null); }} 
                  onDoubleClick={(ev) => { if (!isEditable) return; ev.stopPropagation(); setSelectedField(key); setToolbarVisible(true); if (type === 'text') { setEditingField(key); setTimeout(() => { const editableDiv = fieldRefs.current[key]?.querySelector('[contentEditable="true"]') as HTMLElement | null; editableDiv?.focus(); }, 0); } }} 
                  style={{ position: 'absolute', transform: `translate(${pos.x}px, ${pos.y}px)`, width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : undefined, display: 'inline-block', pointerEvents: 'auto', opacity, padding: 4 }} 
                  className={cn(isSelected ? 'z-50' : 'z-10', isSelected && 'border-2 border-yellow-400 rounded-md shadow-md', (isDragging || isResizing) && 'select-none', 'cursor-pointer bg-transparent')}
                >

                  {type === 'text' ? (
                    <div contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => { const newFocus = document.activeElement as Node | null; const toolbarEl = document.querySelector('[data-memorial-toolbar]'); if (toolbarEl && newFocus && toolbarEl.contains(newFocus)) return; commitTextToData(key, e.currentTarget.innerText); setEditingField(null); setToolbarVisible(false); setShowTextFormatPopup(false); }} onMouseDown={(e) => { if (isEditing) e.stopPropagation(); }} style={{
                      color: getStyle(key, 'color', '#111111'),
                      fontSize: `${fontSize}px`,
                      fontFamily: getStyle(key, 'fontFamily', 'Arial'),
                      fontWeight: getStyle(key, 'bold', false) ? 'bold' : 'normal',
                      fontStyle: getStyle(key, 'italic', false) ? 'italic' : 'normal',
                      textDecoration: getStyle(key, 'underline', false) ? 'underline' : 'none',
                      textAlign: getStyle(key, 'alignment', 'left'),
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      boxSizing: 'border-box',
                      minWidth: 40,
                      minHeight: 30,
                      outline: isEditing ? '1px dashed #3b82f6' : 'none',
                      cursor: isEditing ? 'text' : 'pointer',
                      lineHeight: '1.2',
                      overflow: 'hidden',
                      width: '100%',
                      ...(typeof height === 'number' ? { height: '100%' } : {})
                    }}
                    >{value}</div>
                  ) : (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      {key.startsWith('gallery-') ? (
                        (() => {
                          const gIdx = Number(key.split('-')[1]);
                          const item = (Array.isArray(data.mainPhotoGallery) ? data.mainPhotoGallery[gIdx] : undefined);
                          const src = item ? (typeof item === 'string' ? item : item.src || '') : value;
                          return <img 
                          src={src} 
                          alt={key} 
                          draggable={false} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'fill', 
                            opacity 
                          }} 
                        />;                        
                        })()
                      ) : key.startsWith('symbol-') ? (
                        (() => {
                          const sIdx = Number(key.split('-')[1]);
                          const sym = Array.isArray(data.symbols) ? data.symbols[sIdx] : undefined;
                          const src = sym?.image || value;
                          return <img src={src} alt={key} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'fill', opacity }} />;
                        })()
                      ) : (
                        (() => {
                          const cur = (data as any)[key];
                          const src = cur ? (typeof cur === 'string' ? cur : cur.src || '') : value;
                          return <img src={src} alt={key} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'fill', opacity }} />;
                        })()
                      )}
                    </div>
                  )}

                  {isEditable && isSelected && (
                    <>
                      <div onMouseDown={(e) => startResize(key, 'top-left', e as any)} className="absolute -left-2 -top-2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full cursor-nwse-resize" />
                      <div onMouseDown={(e) => startResize(key, 'top', e as any)} className="absolute left-1/2 -top-2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full cursor-ns-resize" />
                      <div onMouseDown={(e) => startResize(key, 'top-right', e as any)} className="absolute -right-2 -top-2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full cursor-nesw-resize" />
                      <div onMouseDown={(e) => startResize(key, 'left', e as any)} className="absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full cursor-ew-resize" />
                      <div onMouseDown={(e) => startResize(key, 'right', e as any)} className="absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full cursor-ew-resize" />
                      <div onMouseDown={(e) => startResize(key, 'bottom-left', e as any)} className="absolute -left-2 -bottom-2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full cursor-nesw-resize" />
                      <div onMouseDown={(e) => startResize(key, 'bottom', e as any)} className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full cursor-ns-resize" />
                      <div onMouseDown={(e) => startResize(key, 'bottom-right', e as any)} className="absolute -right-2 -bottom-2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full cursor-nwse-resize" />
                    </>
                  )}
                </div>
              </Draggable>
            );
          })}
        </div>
      </Card>

      {isEditable && (
      <>
      <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-4">
        <div className="border rounded-md p-3">
          <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-memorial text-memorial-heading">Fotogalerie (Live-Vorschau)</h3>
            <Badge className="ml-auto">{data.mainPhotoGallery?.length ?? 0}</Badge>
          </div>
          <p className="text-sm text-gray-600 mb-3">Diese Fotos erscheinen in der Live-Vorschau</p>
          <PhotoGallery
            photos={data.mainPhotoGallery || []}
            onPhotosChange={(photos) => onDataChange({ mainPhotoGallery: photos })}
            userId={user?.id}
            type='mainPhotoGallery'
          />
        </div>
        </div>

        <div className="border rounded-md p-3 max-h-[550px] overflow-y-auto">
        <div className="flex items-center mb-3">
          <Sparkles className="w-5 h-5 mr-2" />
          <h3 className="text-lg font-medium">Symbole</h3>
          <Badge className="ml-auto">{data.symbols?.length ?? 0}</Badge>
        </div>

        <div className="grid grid-cols-6 gap-2 mb-3">
          <button
            type="button"
            onClick={() => onDataChange({ symbols: [] })}
            className="relative overflow-hidden rounded-md border aspect-square flex items-center justify-center transition hover:opacity-90"
            aria-label="Kein Symbol"
            title="Kein Symbol"
          >
            <span className="text-lg">∅</span>
          </button>

          {symbolOptions.map((symbol) => {
            const isSelected = data.symbols?.some((s: any) => s.image === symbol.image);
            return (
              <button
                key={symbol.id}
                type="button"
                onClick={() => handleSymbolPaletteClick(symbol)}
                className={`relative overflow-hidden rounded-md border aspect-square flex items-center justify-center transition hover:opacity-90 ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                aria-label={symbol.name}
                title={symbol.name}
              >
                <img
                  src={symbol.image}
                  alt={symbol.name}
                  className="w-16 h-16 object-contain"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>

        <hr className="border-memorial-platinum my-4" />

        <div className="space-y-4">
          <h3 className="text-lg font-memorial text-memorial-heading">Hintergrundbild</h3>
          <p className="text-sm text-memorial-grey font-elegant">
            Wählen Sie einen passenden Hintergrund für die Gedenkseite
          </p>
          <HeroBackgroundSelector
            currentBackground={data.heroBackgroundPhoto}
            onBackgroundChange={(url) => onDataChange({ heroBackgroundPhoto: url })}
            userId={user?.id}
          />
        </div>
      </div>


        <div className="border rounded-md p-3">
          <div className="flex items-center mb-3"><Frame className="w-5 h-5 mr-2" /><h3 className="text-lg font-medium">Rahmenstil</h3></div>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Rahmenstil</Label>
              <Select value={data.frameStyle ?? 'none'} onValueChange={(value: any) => onDataChange({ frameStyle: value })}>
                <SelectTrigger className="h-8 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Rahmen</SelectItem>
                  <SelectItem value="simple">Einfach</SelectItem>
                  <SelectItem value="double">Doppelt</SelectItem>
                  <SelectItem value="elegant">Elegant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Rahmenfarbe</Label>
              <input type="color" value={data.frameColor ?? '#000000'} onChange={(e) => onDataChange({ frameColor: e.target.value })} className="w-full h-8 cursor-pointer" />
            </div>

            <div>
              <div className="flex items-center justify-between"><Label className="text-sm">Rahmenbreite</Label><span className="text-sm">{data.frameWidth ?? 2}px</span></div>
              <input type="range" min={1} max={10} value={data.frameWidth ?? 2} onChange={(e) => onDataChange({ frameWidth: parseInt(e.target.value) })} className="w-full" />
            </div>
          </div>

          <hr />

          <div className="border rounded-md mt-2 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Type className="w-5 h-5 mr-2" />
              <h3 className="text-lg font-medium">Eigene Textfelder</h3>
            </div>
            <Badge className="ml-auto">{data.customFields?.length ?? 0}</Badge>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Fügen Sie benutzerdefinierte Textfelder hinzu, die Sie frei positionieren können
          </p>
          <Button 
            onClick={handleAddCustomField} 
            variant="outline" 
            className="w-full border-dashed border-2"
            disabled={Array.isArray(data.customFields) && data.customFields.length >= 10}
          >
            <Plus className="w-4 h-4 mr-2" />
            Neues Textfeld hinzufügen
          </Button>
          {data.customFields && data.customFields.length > 0 && (
            <div className="mt-3 space-y-2">
              {data.customFields.map((field: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {field.content || 'Leeres Textfeld'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const customs = Array.isArray(data.customFields) ? data.customFields.slice() : [];
                      const updated = customs.filter((_: any, i: number) => i !== idx);
                      onDataChange({ customFields: updated });
                    }}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default MemorialPreviewEditor;