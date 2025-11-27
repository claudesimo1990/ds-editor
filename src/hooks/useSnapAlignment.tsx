import { useMemo } from 'react';

export interface ElementBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}

export interface SnapResult {
  snappedX: number;
  snappedY: number;
  guides: SnapGuide[];
}

const SNAP_THRESHOLD = 10; // Distance en pixels pour activer le snap
const ALIGN_THRESHOLD = 5; // Distance pour aligner sur la même ligne/hauteur

/**
 * Fonction utilitaire pour calculer le snap (peut être utilisée en dehors d'un hook)
 */
export function calculateSnap(
  currentElement: ElementBounds,
  otherElements: ElementBounds[]
): SnapResult {
  const guides: SnapGuide[] = [];
  let snappedX = currentElement.x;
  let snappedY = currentElement.y;

  // Calculer les bords de l'élément courant
  const currentLeft = currentElement.x;
  const currentRight = currentElement.x + currentElement.width;
  const currentTop = currentElement.y;
  const currentBottom = currentElement.y + currentElement.height;
  const currentCenterX = currentElement.x + currentElement.width / 2;
  const currentCenterY = currentElement.y + currentElement.height / 2;

  // Parcourir tous les autres éléments pour trouver les alignements
  for (const other of otherElements) {
    if (other.id === currentElement.id) continue;

    const otherLeft = other.x;
    const otherRight = other.x + other.width;
    const otherTop = other.y;
    const otherBottom = other.y + other.height;
    const otherCenterX = other.x + other.width / 2;
    const otherCenterY = other.y + other.height / 2;

    // Alignement horizontal (même ligne Y)
    // Aligner le haut
    const topDiff = Math.abs(currentTop - otherTop);
    if (topDiff <= SNAP_THRESHOLD) {
      snappedY = otherTop;
      guides.push({
        type: 'horizontal',
        position: otherTop,
        start: Math.min(currentLeft, otherLeft) - 20,
        end: Math.max(currentRight, otherRight) + 20,
      });
    }
    // Aligner le bas
    const bottomDiff = Math.abs(currentBottom - otherBottom);
    if (bottomDiff <= SNAP_THRESHOLD) {
      snappedY = otherBottom - currentElement.height;
      guides.push({
        type: 'horizontal',
        position: otherBottom,
        start: Math.min(currentLeft, otherLeft) - 20,
        end: Math.max(currentRight, otherRight) + 20,
      });
    }
    // Aligner le centre vertical
    const centerYDiff = Math.abs(currentCenterY - otherCenterY);
    if (centerYDiff <= SNAP_THRESHOLD) {
      snappedY = otherCenterY - currentElement.height / 2;
      guides.push({
        type: 'horizontal',
        position: otherCenterY,
        start: Math.min(currentLeft, otherLeft) - 20,
        end: Math.max(currentRight, otherRight) + 20,
      });
    }

    // Alignement vertical (même colonne X)
    // Aligner la gauche
    const leftDiff = Math.abs(currentLeft - otherLeft);
    if (leftDiff <= SNAP_THRESHOLD) {
      snappedX = otherLeft;
      guides.push({
        type: 'vertical',
        position: otherLeft,
        start: Math.min(currentTop, otherTop) - 20,
        end: Math.max(currentBottom, otherBottom) + 20,
      });
    }
    // Aligner la droite
    const rightDiff = Math.abs(currentRight - otherRight);
    if (rightDiff <= SNAP_THRESHOLD) {
      snappedX = otherRight - currentElement.width;
      guides.push({
        type: 'vertical',
        position: otherRight,
        start: Math.min(currentTop, otherTop) - 20,
        end: Math.max(currentBottom, otherBottom) + 20,
      });
    }
    // Aligner le centre horizontal
    const centerXDiff = Math.abs(currentCenterX - otherCenterX);
    if (centerXDiff <= SNAP_THRESHOLD) {
      snappedX = otherCenterX - currentElement.width / 2;
      guides.push({
        type: 'vertical',
        position: otherCenterX,
        start: Math.min(currentTop, otherTop) - 20,
        end: Math.max(currentBottom, otherBottom) + 20,
      });
    }

    // Alignement sur la même ligne (éléments côte à côte)
    // Vérifier si les éléments sont sur la même ligne horizontale
    const horizontalOverlap =
      (currentTop >= otherTop && currentTop <= otherBottom) ||
      (currentBottom >= otherTop && currentBottom <= otherBottom) ||
      (currentTop <= otherTop && currentBottom >= otherBottom);
    
    if (horizontalOverlap) {
      // Aligner le haut si proche
      if (Math.abs(currentTop - otherTop) <= ALIGN_THRESHOLD) {
        snappedY = otherTop;
      }
      // Aligner le bas si proche
      if (Math.abs(currentBottom - otherBottom) <= ALIGN_THRESHOLD) {
        snappedY = otherBottom - currentElement.height;
      }
    }

    // Alignement sur la même colonne (éléments l'un au-dessus de l'autre)
    const verticalOverlap =
      (currentLeft >= otherLeft && currentLeft <= otherRight) ||
      (currentRight >= otherLeft && currentRight <= otherRight) ||
      (currentLeft <= otherLeft && currentRight >= otherRight);
    
    if (verticalOverlap) {
      // Aligner la gauche si proche
      if (Math.abs(currentLeft - otherLeft) <= ALIGN_THRESHOLD) {
        snappedX = otherLeft;
      }
      // Aligner la droite si proche
      if (Math.abs(currentRight - otherRight) <= ALIGN_THRESHOLD) {
        snappedX = otherRight - currentElement.width;
      }
    }
  }

  // Dédupliquer les guides (garder seulement les plus proches)
  const uniqueGuides: SnapGuide[] = [];
  const seenPositions = new Set<string>();
  
  for (const guide of guides) {
    const key = `${guide.type}-${Math.round(guide.position)}`;
    if (!seenPositions.has(key)) {
      seenPositions.add(key);
      uniqueGuides.push(guide);
    }
  }

  return {
    snappedX,
    snappedY,
    guides: uniqueGuides,
  };
}

/**
 * Hook pour gérer le snap et l'alignement des éléments
 */
export function useSnapAlignment(
  currentElement: ElementBounds | null,
  otherElements: ElementBounds[],
  enabled: boolean = true
) {
  const snapResult = useMemo((): SnapResult | null => {
    if (!currentElement || !enabled || otherElements.length === 0) {
      return null;
    }

    return calculateSnap(currentElement, otherElements);
  }, [currentElement, otherElements, enabled]);

  return snapResult;
}

