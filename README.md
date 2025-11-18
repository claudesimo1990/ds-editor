# DS-Editor

Ein moderner, benutzerfreundlicher WYSIWYG-Editor für Gedenkseiten von **Digitalssolutions**.

## Features

- 🎨 **WYSIWYG-Editor** mit TipTap
- 📝 **Verschiedene Block-Typen**: Überschriften, Texte, Bilder, Videos
- 🖼️ **Bildgrößen-Anpassung** direkt im Editor
- 📋 **5 fertige Vorlagen** mit Beispielbildern und -inhalten
- 🎯 **Drag-and-Drop** aus der Sidebar
- 📦 **JSON-Export/Import** für Datenbank-Integration
- 📱 **Responsive Design**
- 🌙 **Dark Mode** Unterstützung

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000) im Browser.

## Integration in andere Projekte

Siehe [INTEGRATION.md](./INTEGRATION.md) für detaillierte Anweisungen zur Integration des DS-Editors in andere Webseiten.

### Schnellstart

```tsx
import DSEditor from './components/DSEditor';

export default function MyPage() {
  return <DSEditor />;
}
```

## Technologien

- **Next.js 16** - React Framework
- **TipTap** - WYSIWYG Editor
- **@dnd-kit** - Drag and Drop
- **Tailwind CSS** - Styling
- **TypeScript** - Type Safety

## Lizenz

© Digitalssolutions - DS-Editor
