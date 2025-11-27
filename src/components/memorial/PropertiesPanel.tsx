import React from 'react';
import { 
  Type, Palette, Move, Maximize2, RotateCw, 
  Layers, Eye, EyeOff, Copy, Trash2, AlignLeft,
  AlignCenter, AlignRight, Bold, Italic, Underline
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { WysiwygToolbar } from './WysiwygToolbar';

interface PropertiesPanelProps {
  selectedElement: any | null;
  onPropertyChange: (property: string, value: any) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onPropertyChange,
  onDelete,
  onDuplicate,
}) => {
  if (!selectedElement) {
    return (
      <div className="w-80 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Sélectionnez un élément pour modifier ses propriétés</p>
        </div>
      </div>
    );
  }

  const elementType = selectedElement.type || 'text';
  const style = selectedElement.style || {};

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Propriétés
          </h3>
          <div className="flex gap-1">
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
                className="h-8 w-8 p-0"
                title="Dupliquer"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {elementType}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mx-2 mt-2">
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">Position</TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="px-4 py-3 space-y-4">
            {/* Texte - seulement si c'est un élément texte */}
            {elementType === 'text' && (
              <>
                <div>
                  <Label className="text-xs font-medium mb-2 block">Texte</Label>
                  <Input
                    value={selectedElement.text || ''}
                    onChange={(e) => onPropertyChange('text', e.target.value)}
                    placeholder="Entrez le texte..."
                    className="text-sm"
                  />
                </div>
                <Separator />
              </>
            )}

            {/* Typographie */}
            {(elementType === 'text' || elementType === 'icon') && (
              <>
                <div>
                  <Label className="text-xs font-medium mb-2 block">Police</Label>
                  <Select
                    value={style.fontFamily || 'Arial'}
                    onValueChange={(value) => onPropertyChange('fontFamily', value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {elementType === 'text' && (
                  <div>
                    <Label className="text-xs font-medium mb-2 block">
                      Taille: {style.fontSize || 16}px
                    </Label>
                    <Slider
                      value={[style.fontSize || 16]}
                      onValueChange={([value]) => onPropertyChange('fontSize', value)}
                      min={8}
                      max={120}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-xs font-medium mb-2 block">Formatage du texte</Label>
                  <WysiwygToolbar
                    bold={style.bold || false}
                    italic={style.italic || false}
                    underline={style.underline || false}
                    alignment={style.alignment || 'left'}
                    fontSize={style.fontSize || 16}
                    fontFamily={style.fontFamily || 'Arial'}
                    color={style.color || '#000000'}
                    onBold={() => onPropertyChange('bold', !style.bold)}
                    onItalic={() => onPropertyChange('italic', !style.italic)}
                    onUnderline={() => onPropertyChange('underline', !style.underline)}
                    onAlignment={(align) => onPropertyChange('alignment', align)}
                    onFontSize={(size) => onPropertyChange('fontSize', size)}
                    onFontFamily={(family) => onPropertyChange('fontFamily', family)}
                    onColor={(color) => onPropertyChange('color', color)}
                    showAdvanced={true}
                    className="w-full"
                  />
                </div>
                <Separator />
              </>
            )}

            {/* Couleur */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Couleur</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={style.color || '#000000'}
                  onChange={(e) => onPropertyChange('color', e.target.value)}
                  className="w-16 h-9 p-1"
                />
                <Input
                  type="text"
                  value={style.color || '#000000'}
                  onChange={(e) => onPropertyChange('color', e.target.value)}
                  className="flex-1 text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Opacité */}
            <div>
              <Label className="text-xs font-medium mb-2 block">
                Opacité: {Math.round((style.opacity || 100))}%
              </Label>
              <Slider
                value={[style.opacity || 100]}
                onValueChange={([value]) => onPropertyChange('opacity', value)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </TabsContent>

          <TabsContent value="layout" className="px-4 py-3 space-y-4">
            {/* Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-2 block">X</Label>
                <Input
                  type="number"
                  value={Math.round(style.x || 0)}
                  onChange={(e) => onPropertyChange('x', parseInt(e.target.value) || 0)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-2 block">Y</Label>
                <Input
                  type="number"
                  value={Math.round(style.y || 0)}
                  onChange={(e) => onPropertyChange('y', parseInt(e.target.value) || 0)}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Taille */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-2 block">Largeur</Label>
                <Input
                  type="number"
                  value={Math.round(style.width || 100)}
                  onChange={(e) => onPropertyChange('width', parseInt(e.target.value) || 100)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-2 block">Hauteur</Label>
                <Input
                  type="number"
                  value={Math.round(style.height || 100)}
                  onChange={(e) => onPropertyChange('height', parseInt(e.target.value) || 100)}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label className="text-xs font-medium mb-2 block">
                Rotation: {Math.round(style.rotation || 0)}°
              </Label>
              <Slider
                value={[style.rotation || 0]}
                onValueChange={([value]) => onPropertyChange('rotation', value)}
                min={-180}
                max={180}
                step={1}
                className="w-full"
              />
            </div>

            {/* Z-index */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Ordre (Z-index)</Label>
              <Input
                type="number"
                value={style.zIndex || 0}
                onChange={(e) => onPropertyChange('zIndex', parseInt(e.target.value) || 0)}
                className="text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

