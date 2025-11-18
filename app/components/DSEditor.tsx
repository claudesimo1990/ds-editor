'use client';

// Wrapper-Komponente für einfache Integration
import Editor from './Editor';
import { Block } from './types';

export interface DSEditorProps {
  initialBlocks?: Block[];
  onSave?: (blocks: Block[]) => void;
  onUpdate?: (blocks: Block[]) => void;
  readOnly?: boolean;
  showHeader?: boolean;
}

export default function DSEditor({
  initialBlocks = [],
  onSave,
  onUpdate,
  readOnly = false,
  showHeader = true,
}: DSEditorProps) {
  // Diese Komponente kann erweitert werden, um Props an den Editor weiterzugeben
  // Für jetzt verwenden wir einfach den Editor direkt
  return <Editor />;
}

