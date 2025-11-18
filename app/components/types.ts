export type BlockType = 'heading' | 'text' | 'image' | 'video';

export interface Block {
  id: string;
  type: BlockType;
  content?: string;
  level?: number; // For headings (1-6)
  url?: string; // For images and videos
  alt?: string; // For images
}

