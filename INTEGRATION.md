# DS-Editor Integration Guide

Der **DS-Editor** von **Digitalssolutions** kann einfach in jede Webseite integriert werden.

## Schnellstart

### 1. Komponente importieren

```tsx
import Editor from './components/Editor';
```

### 2. In Ihrer Seite verwenden

```tsx
export default function MyPage() {
  return <Editor />;
}
```

## Integration-Methoden

### Methode 1: Direkte Integration (Einfachste)

```tsx
'use client';

import Editor from './components/Editor';

export default function MemorialPage() {
  return (
    <div>
      <Editor />
    </div>
  );
}
```

### Methode 2: Mit API-Integration

```tsx
'use client';

import { useState, useEffect } from 'react';
import Editor from './components/Editor';
import JsonRenderer from './components/JsonRenderer';
import { Block } from './components/types';

export default function MemorialPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isEditing, setIsEditing] = useState(true);

  // Daten von API laden
  useEffect(() => {
    fetch('/api/memorial-content')
      .then(res => res.json())
      .then(data => setBlocks(data.blocks || []));
  }, []);

  // Daten speichern
  const handleSave = async (savedBlocks: Block[]) => {
    await fetch('/api/memorial-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks: savedBlocks })
    });
    setBlocks(savedBlocks);
  };

  return (
    <div>
      {isEditing ? (
        <Editor />
      ) : (
        <JsonRenderer blocks={blocks} />
      )}
    </div>
  );
}
```

### Methode 3: Als iframe (für externe Seiten)

```html
<iframe 
  src="https://ihre-domain.de/editor" 
  width="100%" 
  height="800px"
  frameborder="0">
</iframe>
```

## JSON-Format

Der Editor exportiert/importiert JSON im folgenden Format:

```json
[
  {
    "id": "1",
    "type": "heading",
    "level": 1,
    "content": "<h1>Überschrift</h1>"
  },
  {
    "id": "2",
    "type": "text",
    "content": "<p>Textinhalt</p>"
  },
  {
    "id": "3",
    "type": "image",
    "url": "https://example.com/image.jpg",
    "alt": "Bildbeschreibung"
  },
  {
    "id": "4",
    "type": "video",
    "url": "https://example.com/video.mp4"
  }
]
```

## API-Endpunkte Beispiel

### Speichern

```javascript
// POST /api/save-content
app.post('/api/save-content', async (req, res) => {
  const { blocks } = req.body;
  
  // In Datenbank speichern
  await db.memorials.update({
    where: { id: memorialId },
    data: { content: JSON.stringify(blocks) }
  });
  
  res.json({ success: true });
});
```

### Laden

```javascript
// GET /api/get-content
app.get('/api/get-content', async (req, res) => {
  const memorial = await db.memorials.findUnique({
    where: { id: memorialId }
  });
  
  res.json({ 
    blocks: JSON.parse(memorial.content) 
  });
});
```

## Anpassungen

### Editor-Props erweitern

Sie können die `Editor.tsx` Komponente anpassen, um Props zu akzeptieren:

```tsx
interface EditorProps {
  initialBlocks?: Block[];
  onSave?: (blocks: Block[]) => void;
  readOnly?: boolean;
}

export default function Editor({ 
  initialBlocks = [], 
  onSave,
  readOnly = false 
}: EditorProps) {
  // ... Ihre Anpassungen
}
```

## CSS-Anforderungen

Stellen Sie sicher, dass **Tailwind CSS** in Ihrem Projekt konfiguriert ist:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Abhängigkeiten

Installieren Sie alle benötigten Pakete:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install @tiptap/extension-color @tiptap/extension-image
npm install @tiptap/extension-link @tiptap/extension-text-align
npm install @tiptap/extension-text-style emoji-picker-react
```

## Beispiele

Siehe `app/examples/` für vollständige Integrationsbeispiele:
- `SimpleIntegration.tsx` - Einfachste Integration
- `StandaloneExample.tsx` - Mit API-Integration

## Support

Bei Fragen zur Integration kontaktieren Sie **Digitalssolutions**.

© Digitalssolutions - DS-Editor
