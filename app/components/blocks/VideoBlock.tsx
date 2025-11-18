'use client';

import { useState, useRef } from 'react';
import { Block } from '../types';
import BaseBlock from './BaseBlock';

interface VideoBlockProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function VideoBlock({
  block,
  onUpdate,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
}: VideoBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState(block.url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Bitte wählen Sie eine Videodatei aus (MP4, WebM, OGG, etc.)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Die Datei ist zu groß. Maximale Größe: 50MB');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setUrl(base64);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Fehler beim Hochladen der Datei');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Fehler beim Hochladen der Datei');
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (url.trim()) {
      onUpdate({ url });
      setIsEditing(false);
    }
  };

  const getEmbedUrl = (videoUrl: string) => {
    // Base64 data URL
    if (videoUrl.startsWith('data:video/')) {
      return videoUrl;
    }
    // YouTube
    if (videoUrl.includes('youtube.com/watch')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    // Vimeo
    if (videoUrl.includes('vimeo.com/')) {
      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    // Direct video URL
    if (videoUrl.match(/\.(mp4|webm|ogg)$/i) || videoUrl.startsWith('http')) {
      return videoUrl;
    }
    return null;
  };

  const embedUrl = url ? getEmbedUrl(url) : null;

  return (
    <BaseBlock
      block={block}
      onDelete={onDelete}
      onMove={onMove}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      {isEditing ? (
        <div className="space-y-4 pr-20">
          {/* Upload Method Toggle */}
          <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-700 pb-3">
            <button
              onClick={() => setUploadMethod('file')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                uploadMethod === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              📁 Datei hochladen
            </button>
            <button
              onClick={() => setUploadMethod('url')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                uploadMethod === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              🔗 URL eingeben
            </button>
          </div>

          {uploadMethod === 'file' ? (
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Video auswählen:
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
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
                          Klicken zum Auswählen oder Datei hierher ziehen
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          MP4, WebM, OGG (max. 50MB)
                        </p>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Video-URL (YouTube, Vimeo oder direkter Link):
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                placeholder="https://youtube.com/watch?v=... oder https://vimeo.com/..."
                autoFocus
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Unterstützt: YouTube, Vimeo oder direkte Video-URLs (.mp4, .webm, .ogg)
              </p>
            </div>
          )}

          {embedUrl && (
            <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
              <div className="aspect-video w-full overflow-hidden rounded">
                {embedUrl.includes('youtube.com/embed') || embedUrl.includes('vimeo.com/video') ? (
                  <iframe
                    src={embedUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={embedUrl} controls className="h-full w-full rounded" />
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!url.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Speichern
            </button>
            <button
              onClick={() => {
                setUrl(block.url || '');
                setUploadMethod('file');
                setIsEditing(false);
              }}
              className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer pr-20"
        >
          {embedUrl ? (
            <div className="rounded border border-zinc-200 p-2 dark:border-zinc-700">
              <div className="aspect-video w-full overflow-hidden rounded">
                {embedUrl.includes('youtube.com/embed') || embedUrl.includes('vimeo.com/video') ? (
                  <iframe
                    src={embedUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={embedUrl} controls className="h-full w-full" />
                )}
              </div>
            </div>
          ) : (
            <div className="rounded border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400">
                Klicken zum Hinzufügen eines Videos
              </p>
            </div>
          )}
        </div>
      )}
    </BaseBlock>
  );
}

