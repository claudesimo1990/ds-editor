'use client';

import { Block } from './types';

interface JsonRendererProps {
  blocks: Block[];
}

export default function JsonRenderer({ blocks }: JsonRendererProps) {
  const renderBlock = (block: Block, index: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <div
            key={index}
            className="preview-heading font-bold text-zinc-900 dark:text-zinc-50"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
        );
      case 'text':
        return (
          <div
            key={index}
            className="preview-content text-zinc-900 dark:text-zinc-50"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
        );
      case 'image':
        return block.url ? (
          <div key={index} className="my-4">
            <img
              src={block.url}
              alt={block.alt || 'Bild'}
              className="max-w-full h-auto rounded"
            />
          </div>
        ) : null;
      case 'video':
        if (!block.url) return null;
        
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

        const embedUrl = getEmbedUrl(block.url);
        if (!embedUrl) return null;

        return (
          <div key={index} className="my-4 aspect-video w-full overflow-hidden rounded">
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-none">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

