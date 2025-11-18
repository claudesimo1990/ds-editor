'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { ImageWithSize } from '../extensions/ImageWithSize';
import { Video } from '../extensions/Video';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Block } from '../types';
import BaseBlock from './BaseBlock';
import EmojiPicker from 'emoji-picker-react';

interface HeadingBlockProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function HeadingBlock({
  block,
  onUpdate,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
}: HeadingBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [level, setLevel] = useState(block.level || 1);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showImageSizeDialog, setShowImageSizeDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');
  const [selectedImageNode, setSelectedImageNode] = useState<any>(null);
  const [imageUploadMethod, setImageUploadMethod] = useState<'url' | 'file'>('file');
  const [videoUploadMethod, setVideoUploadMethod] = useState<'url' | 'file'>('file');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder: 'Überschrift eingeben...',
      }),
      ImageWithSize.configure({
        inline: true,
        allowBase64: true,
      }),
      Video.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          controls: true,
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: block.content || '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none px-4 py-3 text-zinc-900 dark:text-zinc-50',
      },
    },
  });

  // Update heading level when changed
  const updateHeadingLevel = useCallback((newLevel: number) => {
    if (editor) {
      editor.chain().focus().setHeading({ level: newLevel as 1 | 2 | 3 | 4 | 5 | 6 }).run();
      setLevel(newLevel);
    }
  }, [editor]);

  const handleSave = useCallback(() => {
    if (editor) {
      const html = editor.getHTML();
      onUpdate({ content: html, level });
      setIsEditing(false);
    }
  }, [editor, onUpdate, level]);

  // Auto-save on content change (only when editing)
  useEffect(() => {
    if (!editor || !isEditing) return;

    let timeoutId: NodeJS.Timeout;
    
    const handleUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const html = editor.getHTML();
        // Only update if content actually changed
        if (html !== block.content) {
          onUpdate({ content: html, level });
        }
      }, 500);
    };
    
    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(timeoutId);
    };
  }, [editor, isEditing, block.content, level, onUpdate]);

  // Expose save function for external calls (e.g., before export)
  useEffect(() => {
    if (editor && isEditing) {
      // Save immediately when component unmounts or when explicitly called
      return () => {
        const html = editor.getHTML();
        if (html !== block.content) {
          onUpdate({ content: html, level });
        }
      };
    }
  }, [editor, isEditing, block.content, level, onUpdate]);

  const handleCancel = useCallback(() => {
    if (editor) {
      editor.commands.setContent(block.content || '');
      setLevel(block.level || 1);
      setIsEditing(false);
    }
  }, [editor, block.content, block.level]);

  const handleImageFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine Bilddatei aus (JPG, PNG, GIF, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Die Datei ist zu groß. Maximale Größe: 10MB');
      return;
    }

    setIsUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (editor) {
          const attrs: any = { src: base64 };
          if (imageWidth) attrs.width = imageWidth;
          if (imageHeight) attrs.height = imageHeight;
          if (imageWidth || imageHeight) {
            attrs.style = `width: ${imageWidth || 'auto'}; height: ${imageHeight || 'auto'}; max-width: 100%;`;
          }
          editor.chain().focus().setImage(attrs).run();
          setImageUrl('');
          setImageWidth('');
          setImageHeight('');
          setShowImageDialog(false);
        }
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        alert('Fehler beim Hochladen der Datei');
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Fehler beim Hochladen der Datei');
      setIsUploadingImage(false);
    }
  }, [editor, imageWidth, imageHeight]);

  const handleVideoFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Bitte wählen Sie eine Videodatei aus (MP4, WebM, OGG, etc.)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Die Datei ist zu groß. Maximale Größe: 50MB');
      return;
    }

    setIsUploadingVideo(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (editor) {
          editor.chain().focus().setVideo({ src: base64 }).run();
          setVideoUrl('');
          setShowVideoDialog(false);
        }
        setIsUploadingVideo(false);
      };
      reader.onerror = () => {
        alert('Fehler beim Hochladen der Datei');
        setIsUploadingVideo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Fehler beim Hochladen der Datei');
      setIsUploadingVideo(false);
    }
  }, [editor]);

  const insertImage = useCallback(() => {
    if (editor && imageUrl.trim()) {
      const attrs: any = { src: imageUrl };
      if (imageWidth) attrs.width = imageWidth;
      if (imageHeight) attrs.height = imageHeight;
      if (imageWidth || imageHeight) {
        attrs.style = `width: ${imageWidth || 'auto'}; height: ${imageHeight || 'auto'}; max-width: 100%;`;
      }
      editor.chain().focus().setImage(attrs).run();
      setImageUrl('');
      setImageWidth('');
      setImageHeight('');
      setShowImageDialog(false);
    }
  }, [editor, imageUrl, imageWidth, imageHeight]);

  // Check if image is selected and show size dialog
  useEffect(() => {
    if (!editor) return;

    const updateImageSizeDialog = () => {
      const { selection } = editor.state;
      const { $anchor } = selection;
      const node = $anchor.node();
      const parent = $anchor.parent;
      
      // Check if we're inside an image node
      let imageNode = null;
      if (node && node.type.name === 'image') {
        imageNode = node;
      } else if (parent && parent.type.name === 'image') {
        imageNode = parent;
      }
      
      if (imageNode) {
        const style = imageNode.attrs.style || '';
        let width = imageNode.attrs.width || '';
        let height = imageNode.attrs.height || '';
        
        // Extract from style if available
        if (style) {
          const widthMatch = style.match(/width:\s*([^;]+)/);
          const heightMatch = style.match(/height:\s*([^;]+)/);
          if (widthMatch) width = widthMatch[1].trim();
          if (heightMatch) height = heightMatch[1].trim();
        }
        
        setSelectedImageNode(imageNode);
        setImageWidth(width);
        setImageHeight(height);
        setShowImageSizeDialog(true);
      } else {
        setShowImageSizeDialog(false);
      }
    };

    editor.on('selectionUpdate', updateImageSizeDialog);
    return () => {
      editor.off('selectionUpdate', updateImageSizeDialog);
    };
  }, [editor]);

  const updateImageSize = useCallback(() => {
    if (editor && selectedImageNode) {
      const attrs: any = {};
      if (imageWidth) attrs.width = imageWidth;
      if (imageHeight) attrs.height = imageHeight;
      if (imageWidth || imageHeight) {
        attrs.style = `width: ${imageWidth || 'auto'}; height: ${imageHeight || 'auto'}; max-width: 100%;`;
      } else {
        attrs.style = null;
        attrs.width = null;
        attrs.height = null;
      }
      editor.chain().focus().updateAttributes('image', attrs).run();
      setShowImageSizeDialog(false);
      setSelectedImageNode(null);
    }
  }, [editor, selectedImageNode, imageWidth, imageHeight]);

  const insertVideo = useCallback(() => {
    if (editor && videoUrl.trim()) {
      editor.chain().focus().setVideo({ src: videoUrl }).run();
      setVideoUrl('');
      setShowVideoDialog(false);
    }
  }, [editor, videoUrl]);

  const insertEmoji = useCallback((emojiData: any) => {
    if (editor) {
      editor.chain().focus().insertContent(emojiData.emoji).run();
      setShowEmojiPicker(false);
    }
  }, [editor]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (showEmojiPicker) {
      const handleClickOutside = (event: MouseEvent) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
          setShowEmojiPicker(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  if (!editor) {
    return null;
  }

  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <BaseBlock
      block={block}
      onDelete={onDelete}
      onMove={onMove}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      {isEditing ? (
        <div className="space-y-3 pr-20">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-zinc-300 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
            {/* Heading Level Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLevelSelector(!showLevelSelector)}
                className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
                  editor.isActive('heading', { level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
                }`}
                title="Überschrift-Ebene"
              >
                H{level}
              </button>
              {showLevelSelector && (
                <div className="absolute left-0 top-full z-20 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                  {[1, 2, 3, 4, 5, 6].map(l => (
                    <button
                      key={l}
                      onClick={() => {
                        updateHeadingLevel(l);
                        setShowLevelSelector(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        level === l
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      H{l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px bg-zinc-300 dark:bg-zinc-600" />

            {/* Formatting */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
                editor.isActive('bold')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
              } disabled:opacity-50`}
              title="Fett"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
                editor.isActive('italic')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
              } disabled:opacity-50`}
              title="Kursiv"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
                editor.isActive('strike')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
              } disabled:opacity-50`}
              title="Durchgestrichen"
            >
              <s>S</s>
            </button>

            <div className="w-px bg-zinc-300 dark:bg-zinc-600" />

            {/* Text Align */}
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`rounded px-2 py-1 text-sm transition-colors ${
                editor.isActive({ textAlign: 'left' })
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
              }`}
              title="Links"
            >
              ⬅
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`rounded px-2 py-1 text-sm transition-colors ${
                editor.isActive({ textAlign: 'center' })
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
              }`}
              title="Zentriert"
            >
              ⬌
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`rounded px-2 py-1 text-sm transition-colors ${
                editor.isActive({ textAlign: 'right' })
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
              }`}
              title="Rechts"
            >
              ➡
            </button>

            <div className="w-px bg-zinc-300 dark:bg-zinc-600" />

            {/* Color Picker */}
            <div className="relative">
              <input
                type="color"
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                className="h-8 w-8 cursor-pointer rounded border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-700"
                title="Textfarbe"
              />
            </div>

            <div className="w-px bg-zinc-300 dark:bg-zinc-600" />

            {/* Emoji Picker */}
            <div className="relative" ref={emojiPickerRef}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded bg-white px-2 py-1 text-sm transition-colors hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                title="Emoji hinzufügen"
              >
                😀
              </button>
              {showEmojiPicker && (
                <div className="absolute left-0 top-full z-20 mt-1">
                  <EmojiPicker
                    onEmojiClick={insertEmoji}
                    width={350}
                    height={400}
                  />
                </div>
              )}
            </div>

            {/* Image */}
            <button
              onClick={() => setShowImageDialog(true)}
              className="rounded bg-white px-2 py-1 text-sm transition-colors hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              title="Bild einfügen"
            >
              🖼️
            </button>

            {/* Video */}
            <button
              onClick={() => setShowVideoDialog(true)}
              className="rounded bg-white px-2 py-1 text-sm transition-colors hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              title="Video einfügen"
            >
              🎥
            </button>

            <div className="w-px bg-zinc-300 dark:bg-zinc-600" />

            {/* Undo/Redo */}
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="rounded bg-white px-2 py-1 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              title="Rückgängig"
            >
              ↶
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="rounded bg-white px-2 py-1 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              title="Wiederholen"
            >
              ↷
            </button>
          </div>

          {/* Editor */}
          <div className="rounded-b-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
            <EditorContent editor={editor} />
          </div>

          {/* Image Dialog */}
          {showImageDialog && (
            <div className="rounded-lg border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="mb-3 flex gap-2 border-b border-zinc-200 dark:border-zinc-700 pb-3">
                <button
                  onClick={() => setImageUploadMethod('file')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    imageUploadMethod === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                  }`}
                >
                  📁 Datei hochladen
                </button>
                <button
                  onClick={() => setImageUploadMethod('url')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    imageUploadMethod === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                  }`}
                >
                  🔗 URL eingeben
                </button>
              </div>

              {imageUploadMethod === 'file' ? (
                <div className="space-y-3">
                  <div>
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => imageFileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">Wird hochgeladen...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="h-12 w-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Klicken zum Auswählen
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            JPG, PNG, GIF (max. 10MB)
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Breite (px oder %):
                      </label>
                      <input
                        type="text"
                        value={imageWidth}
                        onChange={(e) => setImageWidth(e.target.value)}
                        className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                        placeholder="z.B. 500px"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Höhe (px oder %):
                      </label>
                      <input
                        type="text"
                        value={imageHeight}
                        onChange={(e) => setImageHeight(e.target.value)}
                        className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                        placeholder="z.B. 300px"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Bild-URL oder Base64:
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      placeholder="URL oder Base64..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Breite (px oder %):
                      </label>
                      <input
                        type="text"
                        value={imageWidth}
                        onChange={(e) => setImageWidth(e.target.value)}
                        className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                        placeholder="z.B. 500px"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Höhe (px oder %):
                      </label>
                      <input
                        type="text"
                        value={imageHeight}
                        onChange={(e) => setImageHeight(e.target.value)}
                        className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                        placeholder="z.B. 300px"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={insertImage}
                      disabled={!imageUrl.trim()}
                      className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Einfügen
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setShowImageDialog(false);
                    setImageUrl('');
                    setImageUploadMethod('file');
                  }}
                  className="rounded bg-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Video Dialog */}
          {showVideoDialog && (
            <div className="rounded-lg border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="mb-3 flex gap-2 border-b border-zinc-200 dark:border-zinc-700 pb-3">
                <button
                  onClick={() => setVideoUploadMethod('file')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    videoUploadMethod === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                  }`}
                >
                  📁 Datei hochladen
                </button>
                <button
                  onClick={() => setVideoUploadMethod('url')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    videoUploadMethod === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                  }`}
                >
                  🔗 URL eingeben
                </button>
              </div>

              {videoUploadMethod === 'file' ? (
                <div>
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => videoFileInputRef.current?.click()}
                    disabled={isUploadingVideo}
                    className="w-full rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingVideo ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Wird hochgeladen...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <svg className="h-12 w-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Klicken zum Auswählen
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          MP4, WebM, OGG (max. 50MB)
                        </p>
                      </div>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Video-URL oder Base64:
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="mb-2 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="URL oder Base64..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={insertVideo}
                      disabled={!videoUrl.trim()}
                      className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Einfügen
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setShowVideoDialog(false);
                    setVideoUrl('');
                    setVideoUploadMethod('file');
                  }}
                  className="rounded bg-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Image Size Dialog */}
          {showImageSizeDialog && (
            <div className="absolute left-0 top-full z-20 mt-2 rounded-lg border border-zinc-300 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Bildgröße anpassen
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Breite (px oder %):
                  </label>
                  <input
                    type="text"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                    className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="z.B. 500px"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Höhe (px oder %):
                  </label>
                  <input
                    type="text"
                    value={imageHeight}
                    onChange={(e) => setImageHeight(e.target.value)}
                    className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="z.B. 300px"
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={updateImageSize}
                  className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  Anwenden
                </button>
                <button
                  onClick={() => {
                    setShowImageSizeDialog(false);
                    setSelectedImageNode(null);
                  }}
                  className="rounded bg-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Speichern
            </button>
            <button
              onClick={handleCancel}
              className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer pr-20 text-zinc-900 dark:text-zinc-50"
        >
          {block.content ? (
            <div
              className={`font-bold ${
                level === 1 ? 'text-5xl' :
                level === 2 ? 'text-4xl' :
                level === 3 ? 'text-3xl' :
                level === 4 ? 'text-2xl' :
                level === 5 ? 'text-xl' :
                'text-lg'
              }`}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          ) : (
            <div className={`font-bold text-zinc-500 dark:text-zinc-400 ${
              level === 1 ? 'text-5xl' :
              level === 2 ? 'text-4xl' :
              level === 3 ? 'text-3xl' :
              level === 4 ? 'text-2xl' :
              level === 5 ? 'text-xl' :
              'text-lg'
            }`}>
              Klicken zum Bearbeiten
            </div>
          )}
        </div>
      )}
    </BaseBlock>
  );
}
