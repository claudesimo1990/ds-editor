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
const ALIGN_THRESHOLD = 10; // Distance pour aligner sur la même ligne/hauteur (augmenté pour meilleure détection)
const SAME_LINE_THRESHOLD = 20; // Distance pour considérer que deux éléments sont sur la même ligne

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

  // Stocker les meilleurs snaps (les plus proches)
  let bestXSnap: { x: number; distance: number } | null = null;
  let bestYSnap: { y: number; distance: number } | null = null;

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
      if (!bestYSnap || topDiff < bestYSnap.distance) {
        bestYSnap = { y: otherTop, distance: topDiff };
      }
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
      if (!bestYSnap || bottomDiff < bestYSnap.distance) {
        bestYSnap = { y: otherBottom - currentElement.height, distance: bottomDiff };
      }
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
      if (!bestYSnap || centerYDiff < bestYSnap.distance) {
        bestYSnap = { y: otherCenterY - currentElement.height / 2, distance: centerYDiff };
      }
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
      if (!bestXSnap || leftDiff < bestXSnap.distance) {
        bestXSnap = { x: otherLeft, distance: leftDiff };
      }
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
      if (!bestXSnap || rightDiff < bestXSnap.distance) {
        bestXSnap = { x: otherRight - currentElement.width, distance: rightDiff };
      }
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
      if (!bestXSnap || centerXDiff < bestXSnap.distance) {
        bestXSnap = { x: otherCenterX - currentElement.width / 2, distance: centerXDiff };
      }
      guides.push({
        type: 'vertical',
        position: otherCenterX,
        start: Math.min(currentTop, otherTop) - 20,
        end: Math.max(currentBottom, otherBottom) + 20,
      });
    }

    // Alignement sur la même ligne (éléments côte à côte)
    // Vérifier si les éléments sont sur la même ligne horizontale
    // On considère qu'ils sont sur la même ligne si leurs centres Y sont proches
    const centerYDistance = Math.abs(currentCenterY - otherCenterY);
    const topDistance = Math.abs(currentTop - otherTop);
    const bottomDistance = Math.abs(currentBottom - otherBottom);
    
    // Vérifier si les éléments se chevauchent verticalement OU sont proches horizontalement
    const horizontalOverlap =
      (currentTop >= otherTop && currentTop <= otherBottom) ||
      (currentBottom >= otherTop && currentBottom <= otherBottom) ||
      (currentTop <= otherTop && currentBottom >= otherBottom);
    
    const isOnSameLine = centerYDistance <= SAME_LINE_THRESHOLD || horizontalOverlap;
    
    if (isOnSameLine) {
      // Prioriser l'alignement du centre vertical (même ligne)
      if (centerYDistance <= SNAP_THRESHOLD) {
        if (!bestYSnap || centerYDistance < bestYSnap.distance) {
          bestYSnap = { y: otherCenterY - currentElement.height / 2, distance: centerYDistance };
        }
        guides.push({
          type: 'horizontal',
          position: otherCenterY,
          start: Math.min(currentLeft, otherLeft) - 20,
          end: Math.max(currentRight, otherRight) + 20,
        });
      }
      // Aligner le haut si proche
      else if (topDistance <= ALIGN_THRESHOLD) {
        if (!bestYSnap || topDistance < bestYSnap.distance) {
          bestYSnap = { y: otherTop, distance: topDistance };
        }
        guides.push({
          type: 'horizontal',
          position: otherTop,
          start: Math.min(currentLeft, otherLeft) - 20,
          end: Math.max(currentRight, otherRight) + 20,
        });
      }
      // Aligner le bas si proche
      else if (bottomDistance <= ALIGN_THRESHOLD) {
        if (!bestYSnap || bottomDistance < bestYSnap.distance) {
          bestYSnap = { y: otherBottom - currentElement.height, distance: bottomDistance };
        }
        guides.push({
          type: 'horizontal',
          position: otherBottom,
          start: Math.min(currentLeft, otherLeft) - 20,
          end: Math.max(currentRight, otherRight) + 20,
        });
      }
    }

    // Alignement sur la même colonne (éléments l'un au-dessus de l'autre)
    // On considère qu'ils sont sur la même colonne si leurs centres X sont proches
    const centerXDistance = Math.abs(currentCenterX - otherCenterX);
    const leftDistance = Math.abs(currentLeft - otherLeft);
    const rightDistance = Math.abs(currentRight - otherRight);
    
    const verticalOverlap =
      (currentLeft >= otherLeft && currentLeft <= otherRight) ||
      (currentRight >= otherLeft && currentRight <= otherRight) ||
      (currentLeft <= otherLeft && currentRight >= otherRight);
    
    const isOnSameColumn = centerXDistance <= SAME_LINE_THRESHOLD || verticalOverlap;
    
    if (isOnSameColumn) {
      // Prioriser l'alignement du centre horizontal (même colonne)
      if (centerXDistance <= SNAP_THRESHOLD) {
        if (!bestXSnap || centerXDistance < bestXSnap.distance) {
          bestXSnap = { x: otherCenterX - currentElement.width / 2, distance: centerXDistance };
        }
        guides.push({
          type: 'vertical',
          position: otherCenterX,
          start: Math.min(currentTop, otherTop) - 20,
          end: Math.max(currentBottom, otherBottom) + 20,
        });
      }
      // Aligner la gauche si proche
      else if (leftDistance <= ALIGN_THRESHOLD) {
        if (!bestXSnap || leftDistance < bestXSnap.distance) {
          bestXSnap = { x: otherLeft, distance: leftDistance };
        }
        guides.push({
          type: 'vertical',
          position: otherLeft,
          start: Math.min(currentTop, otherTop) - 20,
          end: Math.max(currentBottom, otherBottom) + 20,
        });
      }
      // Aligner la droite si proche
      else if (rightDistance <= ALIGN_THRESHOLD) {
        if (!bestXSnap || rightDistance < bestXSnap.distance) {
          bestXSnap = { x: otherRight - currentElement.width, distance: rightDistance };
        }
        guides.push({
          type: 'vertical',
          position: otherRight,
          start: Math.min(currentTop, otherTop) - 20,
          end: Math.max(currentBottom, otherBottom) + 20,
        });
      }
    }
  }

  // Appliquer les meilleurs snaps trouvés
  if (bestXSnap) {
    snappedX = bestXSnap.x;
  }
  if (bestYSnap) {
    snappedY = bestYSnap.y;
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

