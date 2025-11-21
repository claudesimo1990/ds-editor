import React from 'react';
import {
  Undo, Redo, Copy, Trash2, Layers, AlignLeft,
  AlignCenter, AlignRight, ArrowUp, ArrowDown,
  Minus, Maximize2, ZoomIn, ZoomOut,
  Grid, Lock, Unlock, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EditorToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onAlign?: (alignment: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  onToggleGrid?: () => void;
  onToggleLock?: () => void;
  onToggleVisibility?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  hasSelection?: boolean;
  showGrid?: boolean;
  isLocked?: boolean;
  isVisible?: boolean;
  zoom?: number;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onUndo,
  onRedo,
  onCopy,
  onDelete,
  onDuplicate,
  onAlign,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onToggleGrid,
  onToggleLock,
  onToggleVisibility,
  canUndo = false,
  canRedo = false,
  hasSelection = false,
  showGrid = false,
  isLocked = false,
  isVisible = true,
  zoom = 100,
}) => {
  return (
    <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2">
      {/* Historique */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 p-0"
          title="Annuler"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8 p-0"
          title="Refaire"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Actions sur sélection */}
      {hasSelection && (
        <>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-8 w-8 p-0"
              title="Copier"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 w-8 p-0"
              title="Dupliquer"
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignement */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <AlignLeft className="w-4 h-4 mr-2" />
                Aligner
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAlign?.('left')}>
                <AlignLeft className="w-4 h-4 mr-2" />
                Aligner à gauche
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign?.('center')}>
                <AlignCenter className="w-4 h-4 mr-2" />
                Centrer horizontalement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign?.('right')}>
                <AlignRight className="w-4 h-4 mr-2" />
                Aligner à droite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAlign?.('top')}>
                <ArrowUp className="w-4 h-4 mr-2" />
                Aligner en haut
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign?.('middle')}>
                <Minus className="w-4 h-4 mr-2" />
                Centrer verticalement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign?.('bottom')}>
                <ArrowDown className="w-4 h-4 mr-2" />
                Aligner en bas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Verrouillage et visibilité */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLock}
            className="h-8 w-8 p-0"
            title={isLocked ? "Déverrouiller" : "Verrouiller"}
          >
            {isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
            className="h-8 w-8 p-0"
            title={isVisible ? "Masquer" : "Afficher"}
          >
            {isVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
        </>
      )}

      <div className="flex-1" />

      {/* Zoom */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          className="h-8 w-8 p-0"
          title="Zoom arrière"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
          {Math.round(zoom)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          className="h-8 w-8 p-0"
          title="Zoom avant"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomFit}
          className="h-8 w-8 p-0"
          title="Ajuster à la fenêtre"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Grille */}
      <Button
        variant={showGrid ? "default" : "ghost"}
        size="sm"
        onClick={onToggleGrid}
        className="h-8 w-8 p-0"
        title="Afficher la grille"
      >
        <Grid className="w-4 h-4" />
      </Button>
    </div>
  );
};

