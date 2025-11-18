'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Block, BlockType } from './types';
import HeadingBlock from './blocks/HeadingBlock';
import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import VideoBlock from './blocks/VideoBlock';
import JsonRenderer from './JsonRenderer';
import SortableBlockWrapper from './SortableBlockWrapper';
import DraggableSidebarButton from './DraggableSidebarButton';
import DropZone from './DropZone';
import { templates } from './templates/templates';

interface EditorProps {
  memorialId?: string;
  apiEndpoint?: string;
  autoSave?: boolean;
  onSave?: (blocks: Block[]) => void;
}

export default function Editor({ 
  memorialId,
  apiEndpoint = '/api/memorial',
  autoSave = true,
  onSave
}: EditorProps = {}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showJson, setShowJson] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [jsonPreview, setJsonPreview] = useState<string>('');
  const [currentMemorialId, setCurrentMemorialId] = useState<string | undefined>(memorialId);
  const [isSaving, setIsSaving] = useState(false);

  // Laden aus Datenbank
  const loadFromDatabase = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${apiEndpoint}?id=${id}`);
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden');
      }

      const data = await response.json();
      setBlocks(data.blocks || []);
      setCurrentMemorialId(data.id);
    } catch (error) {
      console.error('Fehler beim Laden aus Datenbank:', error);
      alert('Fehler beim Laden. Bitte versuchen Sie es erneut.');
    }
  }, [apiEndpoint]);

  // Memorial aus Datenbank laden wenn memorialId vorhanden
  useEffect(() => {
    if (memorialId && !currentMemorialId) {
      loadFromDatabase(memorialId);
    }
  }, [memorialId, currentMemorialId, loadFromDatabase]);

  // Update JSON preview when blocks change or when showing JSON
  useEffect(() => {
    if (showJson) {
      const updateJson = async () => {
        // Give auto-save a moment to complete before exporting
        await new Promise(resolve => setTimeout(resolve, 600));
        const json = JSON.stringify(blocks, null, 2);
        setJsonPreview(json);
      };
      updateJson();
    }
  }, [showJson, blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Mindestdistanz in Pixeln bevor Drag startet
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === 'heading' ? 'Neue Überschrift' : type === 'text' ? '' : '',
      level: type === 'heading' ? 1 : undefined,
      url: (type === 'image' || type === 'video') ? '' : undefined,
      alt: type === 'image' ? '' : undefined,
    };
    setBlocks([...blocks, newBlock]);
  };

  const loadTemplate = (templateBlocks: Block[]) => {
    setBlocks(templateBlocks);
    if (autoSave) {
      saveToDatabase(templateBlocks);
    }
  };

  // Speichern in Datenbank
  const saveToDatabase = async (blocksToSave: Block[] = blocks) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const id = currentMemorialId || `memorial-${Date.now()}`;
      
      const response = await fetch(apiEndpoint, {
        method: currentMemorialId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          blocks: blocksToSave,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      const data = await response.json();
      setCurrentMemorialId(data.id || id);
      
      if (onSave) {
        onSave(blocksToSave);
      }
    } catch (error) {
      console.error('Fehler beim Speichern in Datenbank:', error);
      alert('Fehler beim Speichern. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-Save wenn sich Blocks ändern
  useEffect(() => {
    if (autoSave && blocks.length > 0 && !isSaving && currentMemorialId) {
      const timeoutId = setTimeout(() => {
        saveToDatabase();
      }, 2000); // 2 Sekunden Debounce

      return () => clearTimeout(timeoutId);
    }
  }, [blocks, autoSave, currentMemorialId, isSaving]);

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    // Check if dragging from sidebar
    const activeData = active.data.current;
    if (activeData?.type === 'sidebar-item' && over.id === 'content-drop-zone') {
      const blockType = activeData.blockType as BlockType;
      addBlock(blockType);
      return;
    }

    // Check if dropping on content area from sidebar
    if (activeData?.type === 'sidebar-item' && typeof over.id === 'string' && over.id.startsWith('content-drop-zone')) {
      const blockType = activeData.blockType as BlockType;
      addBlock(blockType);
      return;
    }

    // Regular block reordering
    if (active.id === over.id) {
      return;
    }

    setBlocks((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const exportToJson = async () => {
    // Give auto-save a moment to complete before exporting
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Export all blocks with all their properties
    // The blocks should be auto-saved, but we ensure we export everything
    const json = JSON.stringify(blocks, null, 2);
    return json;
  };

  const copyToClipboard = async () => {
    const json = await exportToJson();
    navigator.clipboard.writeText(json);
    alert('JSON wurde in die Zwischenablage kopiert!');
  };

  const downloadJson = async () => {
    const json = await exportToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'editor-content.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as Block[];
      if (Array.isArray(parsed)) {
        setBlocks(parsed);
        alert('JSON erfolgreich importiert!');
      } else {
        alert('Ungültiges JSON-Format. Erwartet wird ein Array von Blöcken.');
      }
    } catch (error) {
      alert('Fehler beim Parsen des JSON: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importJson(content);
    };
    reader.readAsText(file);
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'heading':
        return (
          <HeadingBlock
            key={block.id}
            block={block}
            onUpdate={(updates: Partial<Block>) => updateBlock(block.id, updates)}
            onDelete={() => deleteBlock(block.id)}
            onMove={() => {}}
            canMoveUp={false}
            canMoveDown={false}
          />
        );
      case 'text':
        return (
          <TextBlock
            key={block.id}
            block={block}
            onUpdate={(updates: Partial<Block>) => updateBlock(block.id, updates)}
            onDelete={() => deleteBlock(block.id)}
            onMove={() => {}}
            canMoveUp={false}
            canMoveDown={false}
          />
        );
      case 'image':
        return (
          <ImageBlock
            key={block.id}
            block={block}
            onUpdate={(updates: Partial<Block>) => updateBlock(block.id, updates)}
            onDelete={() => deleteBlock(block.id)}
            onMove={() => {}}
            canMoveUp={false}
            canMoveDown={false}
          />
        );
      case 'video':
        return (
          <VideoBlock
            key={block.id}
            block={block}
            onUpdate={(updates: Partial<Block>) => updateBlock(block.id, updates)}
            onDelete={() => deleteBlock(block.id)}
            onMove={() => {}}
            canMoveUp={false}
            canMoveDown={false}
          />
        );
      default:
        return null;
    }
  };

  const blockTypes: { type: BlockType; label: string; icon: string }[] = [
    { type: 'heading', label: 'Überschrift', icon: '📝' },
    { type: 'text', label: 'Text', icon: '📄' },
    { type: 'image', label: 'Bild', icon: '🖼️' },
    { type: 'video', label: 'Video', icon: '🎥' },
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } transition-all duration-300 ease-in-out border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">DS-Editor</h2>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">Digitalssolutions</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Ziehen Sie Elemente in den Editor oder klicken Sie darauf
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <h3 className="mb-3 text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                Elemente
              </h3>
              <div className="space-y-2">
                {blockTypes.map(({ type, label, icon }) => (
                  <DraggableSidebarButton
                    key={type}
                    type={type}
                    label={label}
                    icon={icon}
                    onClick={() => addBlock(type)}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <h3 className="mb-3 text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                Vorlagen
              </h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.blocks.map((block, index) => ({
                      ...block,
                      id: `${Date.now()}-${index}`,
                    })))}
                    className="group w-full overflow-hidden rounded-lg border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                  >
                    <div className="relative h-24 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-2xl">{template.preview}</div>
                    </div>
                    <div className="p-2">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {template.name}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">DS-Editor</h1>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">by Digitalssolutions</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentMemorialId && (
                <button
                  onClick={() => loadFromDatabase(currentMemorialId)}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  {isSaving ? '⏳ Speichere...' : '💾 Laden'}
                </button>
              )}
              <button
                onClick={() => saveToDatabase()}
                disabled={isSaving}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSaving ? '⏳ Speichere...' : '💾 Speichern'}
              </button>
              <label className="cursor-pointer rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                📥 Import
              </label>
              {blocks.length > 0 && (
                <>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    👁️ {showPreview ? 'Editor' : 'Vorschau'}
                  </button>
                  <button
                    onClick={() => setShowJson(!showJson)}
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {showJson ? 'Editor' : 'JSON'}
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    📋 Kopieren
                  </button>
                  <button
                    onClick={downloadJson}
                    className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-md"
                  >
                    💾 Download
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-4xl mx-auto px-6 py-8 pl-20">
            {showPreview ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Vorschau
                </h2>
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <JsonRenderer blocks={blocks} />
                </div>
              </div>
            ) : showJson ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  JSON Export
                </h2>
                <pre className="overflow-auto rounded-lg bg-zinc-50 p-4 text-sm text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
                  {jsonPreview || JSON.stringify(blocks, null, 2)}
                </pre>
              </div>
            ) : (
              <SortableContext
                items={blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <DropZone id="content-drop-zone" isEmpty={blocks.length === 0}>
                  {blocks.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-white p-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
                      <div className="mb-4 text-6xl">✨</div>
                      <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                        Beginnen Sie mit Ihrem Design
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Ziehen Sie ein Element aus der Sidebar hierher oder klicken Sie darauf
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {blocks.map((block) => (
                        <SortableBlockWrapper key={block.id} id={block.id}>
                          {renderBlock(block)}
                        </SortableBlockWrapper>
                      ))}
                    </div>
                  )}
                </DropZone>
              </SortableContext>
            )}
          </div>
        </div>
      </div>
      </div>
      <DragOverlay>
        {activeId ? (
          activeId.toString().startsWith('sidebar-') ? (
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 shadow-2xl opacity-95">
              {blockTypes.find(bt => `sidebar-${bt.type}` === activeId) && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{blockTypes.find(bt => `sidebar-${bt.type}` === activeId)?.icon}</span>
                  <span className="font-medium">{blockTypes.find(bt => `sidebar-${bt.type}` === activeId)?.label}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-blue-500 bg-white shadow-2xl opacity-95 rotate-2 dark:bg-zinc-900" style={{ width: '100%', maxWidth: '600px' }}>
              {blocks.find(b => b.id === activeId) && renderBlock(blocks.find(b => b.id === activeId)!)}
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
